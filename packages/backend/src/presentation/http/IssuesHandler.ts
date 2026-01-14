import 'reflect-metadata';
import { injectable } from 'tsyringe';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { IssueId, issueIdSchema } from '@bealin/shared';
import { ListIssuesUseCase } from '@domain/usecases/ListIssuesUseCase.js';
import { GetIssueUseCase } from '@domain/usecases/GetIssueUseCase.js';
import { IssueMapper } from './IssueMapper.js';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

interface GetIssueParams {
  id: string;
}

@injectable()
export class IssuesHandler {
  constructor(
    private readonly listIssuesUseCase: ListIssuesUseCase,
    private readonly getIssueUseCase: GetIssueUseCase,
  ) {}

  registerRoutes(server: FastifyInstance): void {
    server.get('/api/issues', this.listIssues.bind(this));
    server.get<{ Params: GetIssueParams }>(
      '/api/issues/:id',
      this.getIssue.bind(this),
    );
  }

  private async listIssues(
    _request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const issues = await this.listIssuesUseCase.execute();
      reply.send(IssueMapper.toDtoList(issues));
    } catch (error) {
      this.handleError(reply, error);
    }
  }

  private async getIssue(
    request: FastifyRequest<{ Params: GetIssueParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { id } = request.params;

      const parseResult = issueIdSchema.safeParse(id);
      if (!parseResult.success) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'INVALID_ID',
            message: 'Invalid issue ID format',
          },
        };
        reply.status(400).send(errorResponse);
        return;
      }

      const issueId = new IssueId(parseResult.data);
      const issue = await this.getIssueUseCase.execute(issueId);

      if (!issue) {
        const errorResponse: ErrorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: `Issue with ID '${id}' not found`,
          },
        };
        reply.status(404).send(errorResponse);
        return;
      }

      reply.send(IssueMapper.toDto(issue));
    } catch (error) {
      this.handleError(reply, error);
    }
  }

  private handleError(reply: FastifyReply, _error: unknown): void {
    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };
    reply.status(500).send(errorResponse);
  }
}
