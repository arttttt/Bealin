import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectsHandler } from './ProjectsHandler.js';
import type { GetProjectsUseCase } from '../../domain/usecases/GetProjectsUseCase.js';
import type { GetActiveProjectUseCase } from '../../domain/usecases/GetActiveProjectUseCase.js';
import type { AddProjectUseCase } from '../../domain/usecases/AddProjectUseCase.js';
import type { RemoveProjectUseCase } from '../../domain/usecases/RemoveProjectUseCase.js';
import type { SetActiveProjectUseCase } from '../../domain/usecases/SetActiveProjectUseCase.js';
import type { ValidateProjectPathUseCase } from '../../domain/usecases/ValidateProjectPathUseCase.js';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';
import {
  InvalidPathError,
  ProjectAlreadyExistsError,
} from '../../domain/usecases/AddProjectUseCase.js';
import { ProjectNotFoundError } from '../../domain/usecases/SetActiveProjectUseCase.js';
import type { Project } from '../../domain/entities/AppConfig.js';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'test-uuid-123',
    name: 'Test Project',
    path: '/Users/test/projects/myproject',
    addedAt: '2026-01-15T10:00:00.000Z',
    ...overrides,
  };
}

function createMockReply(): FastifyReply {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;
  return reply;
}

function createMockRequest<P = unknown, B = unknown>(
  params: P = {} as P,
  body: B = {} as B,
): FastifyRequest<{ Params: P; Body: B }> {
  return {
    params,
    body,
  } as FastifyRequest<{ Params: P; Body: B }>;
}

describe('ProjectsHandler', () => {
  let mockGetProjectsUseCase: GetProjectsUseCase;
  let mockGetActiveProjectUseCase: GetActiveProjectUseCase;
  let mockAddProjectUseCase: AddProjectUseCase;
  let mockRemoveProjectUseCase: RemoveProjectUseCase;
  let mockSetActiveProjectUseCase: SetActiveProjectUseCase;
  let mockValidateProjectPathUseCase: ValidateProjectPathUseCase;
  let mockConfigService: ConfigService;
  let handler: ProjectsHandler;

  beforeEach(() => {
    mockGetProjectsUseCase = {
      execute: vi.fn(),
    } as unknown as GetProjectsUseCase;

    mockGetActiveProjectUseCase = {
      execute: vi.fn(),
    } as unknown as GetActiveProjectUseCase;

    mockAddProjectUseCase = {
      execute: vi.fn(),
    } as unknown as AddProjectUseCase;

    mockRemoveProjectUseCase = {
      execute: vi.fn(),
    } as unknown as RemoveProjectUseCase;

    mockSetActiveProjectUseCase = {
      execute: vi.fn(),
    } as unknown as SetActiveProjectUseCase;

    mockValidateProjectPathUseCase = {
      execute: vi.fn(),
    } as unknown as ValidateProjectPathUseCase;

    mockConfigService = {
      getActiveProject: vi.fn().mockResolvedValue(null),
    } as unknown as ConfigService;

    handler = new ProjectsHandler(
      mockGetProjectsUseCase,
      mockGetActiveProjectUseCase,
      mockAddProjectUseCase,
      mockRemoveProjectUseCase,
      mockSetActiveProjectUseCase,
      mockValidateProjectPathUseCase,
      mockConfigService,
    );
  });

  describe('registerRoutes', () => {
    it('registers all project routes', () => {
      // GIVEN
      const mockServer = {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      // WHEN
      handler.registerRoutes(mockServer);

      // THEN
      expect(mockServer.get).toHaveBeenCalledTimes(2);
      expect(mockServer.post).toHaveBeenCalledTimes(3);
      expect(mockServer.delete).toHaveBeenCalledTimes(1);
      expect(mockServer.get).toHaveBeenCalledWith('/api/projects', expect.any(Function));
      expect(mockServer.get).toHaveBeenCalledWith('/api/projects/active', expect.any(Function));
    });
  });

  describe('GET /api/projects', () => {
    it('returns projects list with activeProjectId', async () => {
      // GIVEN
      const projects = [
        createMockProject({ id: 'proj-1' }),
        createMockProject({ id: 'proj-2' }),
      ];
      vi.mocked(mockGetProjectsUseCase.execute).mockResolvedValue({
        projects,
        activeProjectId: 'proj-1',
      });

      const routes: Record<string, (req: FastifyRequest, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
        post: vi.fn(),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest();

      // WHEN
      await routes['/api/projects']?.(request, reply);

      // THEN
      expect(mockGetProjectsUseCase.execute).toHaveBeenCalledOnce();
      expect(reply.send).toHaveBeenCalledWith({
        projects: expect.arrayContaining([
          expect.objectContaining({ id: 'proj-1' }),
          expect.objectContaining({ id: 'proj-2' }),
        ]),
        activeProjectId: 'proj-1',
      });
    });

    it('returns empty projects array when none exist', async () => {
      // GIVEN
      vi.mocked(mockGetProjectsUseCase.execute).mockResolvedValue({
        projects: [],
        activeProjectId: null,
      });

      const routes: Record<string, (req: FastifyRequest, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
        post: vi.fn(),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest();

      // WHEN
      await routes['/api/projects']?.(request, reply);

      // THEN
      expect(reply.send).toHaveBeenCalledWith({
        projects: [],
        activeProjectId: null,
      });
    });
  });

  describe('GET /api/projects/active', () => {
    it('returns active project when one is set', async () => {
      // GIVEN
      const project = createMockProject({ id: 'active-proj' });
      vi.mocked(mockGetActiveProjectUseCase.execute).mockResolvedValue(project);

      const routes: Record<string, (req: FastifyRequest, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
        post: vi.fn(),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest();

      // WHEN
      await routes['/api/projects/active']?.(request, reply);

      // THEN
      expect(reply.send).toHaveBeenCalledWith({
        project: expect.objectContaining({ id: 'active-proj' }),
      });
    });

    it('returns null when no active project', async () => {
      // GIVEN
      vi.mocked(mockGetActiveProjectUseCase.execute).mockResolvedValue(null);

      const routes: Record<string, (req: FastifyRequest, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
        post: vi.fn(),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest();

      // WHEN
      await routes['/api/projects/active']?.(request, reply);

      // THEN
      expect(reply.send).toHaveBeenCalledWith({
        project: null,
      });
    });
  });

  describe('POST /api/projects', () => {
    it('adds project and returns 201', async () => {
      // GIVEN
      const newProject = createMockProject({ id: 'new-proj' });
      vi.mocked(mockAddProjectUseCase.execute).mockResolvedValue(newProject);

      type RouteHandler = (req: FastifyRequest<{ Body: { path: string; name?: string } }>, reply: FastifyReply) => Promise<void>;
      const routes: Record<string, RouteHandler> = {};
      const mockServer = {
        get: vi.fn(),
        post: vi.fn((path: string, handler: RouteHandler) => {
          routes[path] = handler;
        }),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({}, { path: '/Users/test/projects/newproject/.beads' });

      // WHEN
      await routes['/api/projects']?.(request, reply);

      // THEN
      expect(mockAddProjectUseCase.execute).toHaveBeenCalledWith(
        '/Users/test/projects/newproject',
        undefined,
      );
      expect(reply.status).toHaveBeenCalledWith(201);
    });

    it('returns 400 when path is missing', async () => {
      // GIVEN
      type RouteHandler = (req: FastifyRequest<{ Body: { path: string; name?: string } }>, reply: FastifyReply) => Promise<void>;
      const routes: Record<string, RouteHandler> = {};
      const mockServer = {
        get: vi.fn(),
        post: vi.fn((path: string, handler: RouteHandler) => {
          routes[path] = handler;
        }),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({}, { path: '' });

      // WHEN
      await routes['/api/projects']?.(request, reply);

      // THEN
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'INVALID_REQUEST',
        message: 'Path is required',
      });
    });

    it('returns 400 for invalid path', async () => {
      // GIVEN
      vi.mocked(mockAddProjectUseCase.execute).mockRejectedValue(new InvalidPathError());

      type RouteHandler = (req: FastifyRequest<{ Body: { path: string; name?: string } }>, reply: FastifyReply) => Promise<void>;
      const routes: Record<string, RouteHandler> = {};
      const mockServer = {
        get: vi.fn(),
        post: vi.fn((path: string, handler: RouteHandler) => {
          routes[path] = handler;
        }),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({}, { path: '/invalid/path/.beads' });

      // WHEN
      await routes['/api/projects']?.(request, reply);

      // THEN
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'INVALID_PATH',
        message: 'Path does not exist or is not a valid beads directory',
      });
    });

    it('returns 409 when project already exists', async () => {
      // GIVEN
      vi.mocked(mockAddProjectUseCase.execute).mockRejectedValue(new ProjectAlreadyExistsError());

      type RouteHandler = (req: FastifyRequest<{ Body: { path: string; name?: string } }>, reply: FastifyReply) => Promise<void>;
      const routes: Record<string, RouteHandler> = {};
      const mockServer = {
        get: vi.fn(),
        post: vi.fn((path: string, handler: RouteHandler) => {
          routes[path] = handler;
        }),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({}, { path: '/existing/path/.beads' });

      // WHEN
      await routes['/api/projects']?.(request, reply);

      // THEN
      expect(reply.status).toHaveBeenCalledWith(409);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'ALREADY_EXISTS',
        message: 'Project with this path already exists',
      });
    });
  });

  describe('POST /api/projects/:id/activate', () => {
    it('activates project and returns success', async () => {
      // GIVEN
      vi.mocked(mockSetActiveProjectUseCase.execute).mockResolvedValue(undefined);

      type RouteHandler = (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>;
      const routes: Record<string, RouteHandler> = {};
      const mockServer = {
        get: vi.fn(),
        post: vi.fn((path: string, handler: RouteHandler) => {
          routes[path] = handler;
        }),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({ id: 'proj-123' }, {});

      // WHEN
      await routes['/api/projects/:id/activate']?.(request, reply);

      // THEN
      expect(mockSetActiveProjectUseCase.execute).toHaveBeenCalledWith('proj-123');
      expect(reply.send).toHaveBeenCalledWith({ success: true });
    });

    it('returns 404 when project not found', async () => {
      // GIVEN
      vi.mocked(mockSetActiveProjectUseCase.execute).mockRejectedValue(
        new ProjectNotFoundError('nonexistent'),
      );

      type RouteHandler = (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>;
      const routes: Record<string, RouteHandler> = {};
      const mockServer = {
        get: vi.fn(),
        post: vi.fn((path: string, handler: RouteHandler) => {
          routes[path] = handler;
        }),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({ id: 'nonexistent' }, {});

      // WHEN
      await routes['/api/projects/:id/activate']?.(request, reply);

      // THEN
      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'NOT_FOUND',
        message: "Project with ID 'nonexistent' not found",
      });
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('removes project and returns success', async () => {
      // GIVEN
      vi.mocked(mockRemoveProjectUseCase.execute).mockResolvedValue(undefined);

      type RouteHandler = (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>;
      const routes: Record<string, RouteHandler> = {};
      const mockServer = {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn((path: string, handler: RouteHandler) => {
          routes[path] = handler;
        }),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({ id: 'proj-to-delete' }, {});

      // WHEN
      await routes['/api/projects/:id']?.(request, reply);

      // THEN
      expect(mockRemoveProjectUseCase.execute).toHaveBeenCalledWith('proj-to-delete');
      expect(reply.send).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('POST /api/projects/validate-path', () => {
    it('returns validation result for valid path', async () => {
      // GIVEN
      vi.mocked(mockValidateProjectPathUseCase.execute).mockReturnValue({
        valid: true,
        suggestedName: 'myproject',
      });

      type RouteHandler = (req: FastifyRequest<{ Body: { path: string } }>, reply: FastifyReply) => Promise<void>;
      const routes: Record<string, RouteHandler> = {};
      const mockServer = {
        get: vi.fn(),
        post: vi.fn((path: string, handler: RouteHandler) => {
          routes[path] = handler;
        }),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({}, { path: '/path/to/project/.beads' });

      // WHEN
      await routes['/api/projects/validate-path']?.(request, reply);

      // THEN
      expect(mockValidateProjectPathUseCase.execute).toHaveBeenCalledWith('/path/to/project/.beads');
      expect(reply.send).toHaveBeenCalledWith({
        valid: true,
        suggestedName: 'myproject',
      });
    });

    it('returns 400 when path is missing', async () => {
      // GIVEN
      type RouteHandler = (req: FastifyRequest<{ Body: { path: string } }>, reply: FastifyReply) => Promise<void>;
      const routes: Record<string, RouteHandler> = {};
      const mockServer = {
        get: vi.fn(),
        post: vi.fn((path: string, handler: RouteHandler) => {
          routes[path] = handler;
        }),
        delete: vi.fn(),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({}, { path: '' });

      // WHEN
      await routes['/api/projects/validate-path']?.(request, reply);

      // THEN
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: 'INVALID_REQUEST',
        message: 'Path is required',
      });
    });
  });
});
