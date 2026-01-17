import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';
import type { GetProjectsUseCase } from '../../domain/usecases/GetProjectsUseCase.js';
import type { GetActiveProjectUseCase } from '../../domain/usecases/GetActiveProjectUseCase.js';
import type { AddProjectUseCase } from '../../domain/usecases/AddProjectUseCase.js';
import type { RemoveProjectUseCase } from '../../domain/usecases/RemoveProjectUseCase.js';
import type { SetActiveProjectUseCase } from '../../domain/usecases/SetActiveProjectUseCase.js';
import type { ValidateProjectPathUseCase } from '../../domain/usecases/ValidateProjectPathUseCase.js';
import {
  InvalidPathError,
  ProjectAlreadyExistsError,
} from '../../domain/usecases/AddProjectUseCase.js';
import { ProjectNotFoundError } from '../../domain/usecases/SetActiveProjectUseCase.js';
import { ProjectMapper } from './ProjectMapper.js';
import { BeadsWatcher } from '../../infrastructure/watchers/BeadsWatcher.js';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';

interface ErrorResponse {
  error: string;
  message: string;
}

interface AddProjectBody {
  path: string;
  name?: string;
}

interface ValidatePathBody {
  path: string;
}

interface ProjectIdParams {
  id: string;
}

@injectable()
export class ProjectsHandler {
  private readonly watcher: BeadsWatcher;

  constructor(
    @inject(DI_TOKENS.GetProjectsUseCase)
    private readonly getProjectsUseCase: GetProjectsUseCase,
    @inject(DI_TOKENS.GetActiveProjectUseCase)
    private readonly getActiveProjectUseCase: GetActiveProjectUseCase,
    @inject(DI_TOKENS.AddProjectUseCase)
    private readonly addProjectUseCase: AddProjectUseCase,
    @inject(DI_TOKENS.RemoveProjectUseCase)
    private readonly removeProjectUseCase: RemoveProjectUseCase,
    @inject(DI_TOKENS.SetActiveProjectUseCase)
    private readonly setActiveProjectUseCase: SetActiveProjectUseCase,
    @inject(DI_TOKENS.ValidateProjectPathUseCase)
    private readonly validateProjectPathUseCase: ValidateProjectPathUseCase,
    @inject(DI_TOKENS.ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.watcher = BeadsWatcher.getInstance();
  }

  registerRoutes(server: FastifyInstance): void {
    server.get('/api/projects', this.getProjects.bind(this));
    server.get('/api/projects/active', this.getActiveProject.bind(this));
    server.post<{ Body: AddProjectBody }>(
      '/api/projects',
      this.addProject.bind(this),
    );
    server.post<{ Params: ProjectIdParams }>(
      '/api/projects/:id/activate',
      this.activateProject.bind(this),
    );
    server.delete<{ Params: ProjectIdParams }>(
      '/api/projects/:id',
      this.removeProject.bind(this),
    );
    server.post<{ Body: ValidatePathBody }>(
      '/api/projects/validate-path',
      this.validatePath.bind(this),
    );
  }

  /**
   * GET /api/projects
   * List all projects with activeProjectId.
   */
  private async getProjects(
    _request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const result = await this.getProjectsUseCase.execute();
      reply.send({
        projects: ProjectMapper.toDtoList(result.projects),
        activeProjectId: result.activeProjectId,
      });
    } catch (error) {
      this.handleError(reply, error);
    }
  }

  /**
   * GET /api/projects/active
   * Get the currently active project.
   */
  private async getActiveProject(
    _request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const project = await this.getActiveProjectUseCase.execute();
      reply.send({
        project: project ? ProjectMapper.toDto(project) : null,
      });
    } catch (error) {
      this.handleError(reply, error);
    }
  }

  /**
   * POST /api/projects
   * Add a new project.
   */
  private async addProject(
    request: FastifyRequest<{ Body: AddProjectBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { path, name } = request.body;

      if (!path) {
        const errorResponse: ErrorResponse = {
          error: 'INVALID_REQUEST',
          message: 'Path is required',
        };
        reply.status(400).send(errorResponse);
        return;
      }

      const projectPath = ProjectMapper.beadsPathToProjectPath(path);
      const project = await this.addProjectUseCase.execute(projectPath, name);

      // If this project becomes active (first project added), start watching it
      // Fire-and-forget: don't block the response waiting for watcher to switch
      const activeProject = await this.configService.getActiveProject();
      if (activeProject && activeProject.id === project.id) {
        void this.watcher.watchProject(activeProject.path);
      }

      reply.status(201).send({
        project: ProjectMapper.toDto(project),
      });
    } catch (error) {
      if (error instanceof InvalidPathError) {
        const errorResponse: ErrorResponse = {
          error: error.code,
          message: error.message,
        };
        reply.status(400).send(errorResponse);
        return;
      }
      if (error instanceof ProjectAlreadyExistsError) {
        const errorResponse: ErrorResponse = {
          error: error.code,
          message: error.message,
        };
        reply.status(409).send(errorResponse);
        return;
      }
      this.handleError(reply, error);
    }
  }

  /**
   * POST /api/projects/:id/activate
   * Set the active project.
   */
  private async activateProject(
    request: FastifyRequest<{ Params: ProjectIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { id } = request.params;
      await this.setActiveProjectUseCase.execute(id);

      // Update file watcher to watch new active project
      // Fire-and-forget: don't block the response waiting for watcher to switch
      const activeProject = await this.configService.getActiveProject();
      if (activeProject) {
        void this.watcher.watchProject(activeProject.path);
      }

      reply.send({ success: true });
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        const errorResponse: ErrorResponse = {
          error: error.code,
          message: error.message,
        };
        reply.status(404).send(errorResponse);
        return;
      }
      this.handleError(reply, error);
    }
  }

  /**
   * DELETE /api/projects/:id
   * Remove a project (does not delete .beads files).
   */
  private async removeProject(
    request: FastifyRequest<{ Params: ProjectIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { id } = request.params;
      await this.removeProjectUseCase.execute(id);
      reply.send({ success: true });
    } catch (error) {
      this.handleError(reply, error);
    }
  }

  /**
   * POST /api/projects/validate-path
   * Validate that a path contains a valid beads project.
   */
  private async validatePath(
    request: FastifyRequest<{ Body: ValidatePathBody }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { path } = request.body;

      if (!path) {
        const errorResponse: ErrorResponse = {
          error: 'INVALID_REQUEST',
          message: 'Path is required',
        };
        reply.status(400).send(errorResponse);
        return;
      }

      const result = this.validateProjectPathUseCase.execute(path);
      reply.send(result);
    } catch (error) {
      this.handleError(reply, error);
    }
  }

  private handleError(reply: FastifyReply, _error: unknown): void {
    const errorResponse: ErrorResponse = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    reply.status(500).send(errorResponse);
  }
}
