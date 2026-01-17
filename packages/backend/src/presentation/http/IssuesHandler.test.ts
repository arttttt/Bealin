import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IssuesHandler } from './IssuesHandler.js';
import { ListIssuesUseCase } from '@domain/usecases/ListIssuesUseCase.js';
import { GetIssueUseCase } from '@domain/usecases/GetIssueUseCase.js';
import type { Issue } from '@bealin/shared';
import { IssueId, LabelId } from '@bealin/shared';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

function createMockIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: new IssueId('be-test-123'),
    title: 'Test Issue',
    description: 'Test description',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    labels: [new LabelId('label-1')],
    createdAt: new Date('2026-01-14T10:00:00.000Z'),
    updatedAt: new Date('2026-01-14T12:00:00.000Z'),
    blocks: [],
    blockedBy: [],
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

function createMockRequest<T = unknown>(params: T = {} as T): FastifyRequest<{ Params: T }> {
  return {
    params,
  } as FastifyRequest<{ Params: T }>;
}

describe('IssuesHandler', () => {
  let mockListIssuesUseCase: ListIssuesUseCase;
  let mockGetIssueUseCase: GetIssueUseCase;
  let handler: IssuesHandler;

  beforeEach(() => {
    mockListIssuesUseCase = {
      execute: vi.fn(),
    } as unknown as ListIssuesUseCase;

    mockGetIssueUseCase = {
      execute: vi.fn(),
    } as unknown as GetIssueUseCase;

    handler = new IssuesHandler(mockListIssuesUseCase, mockGetIssueUseCase);
  });

  describe('registerRoutes', () => {
    it('registers GET /api/issues and GET /api/issues/:id routes', () => {
      // GIVEN
      const mockServer = {
        get: vi.fn(),
      } as unknown as FastifyInstance;

      // WHEN
      handler.registerRoutes(mockServer);

      // THEN
      expect(mockServer.get).toHaveBeenCalledTimes(2);
      expect(mockServer.get).toHaveBeenCalledWith('/api/issues', expect.any(Function));
      expect(mockServer.get).toHaveBeenCalledWith('/api/issues/:id', expect.any(Function));
    });
  });

  describe('listIssues', () => {
    it('returns list of issues as DTOs', async () => {
      // GIVEN
      const issues = [
        createMockIssue({ id: new IssueId('be-1') }),
        createMockIssue({ id: new IssueId('be-2') }),
      ];
      vi.mocked(mockListIssuesUseCase.execute).mockResolvedValue(issues);

      const routes: Record<string, (req: FastifyRequest, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest();

      // WHEN
      await routes['/api/issues']?.(request, reply);

      // THEN
      expect(mockListIssuesUseCase.execute).toHaveBeenCalledOnce();
      expect(reply.send).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'be-1' }),
          expect.objectContaining({ id: 'be-2' }),
        ]),
      );
    });

    it('returns empty array when no issues exist', async () => {
      // GIVEN
      vi.mocked(mockListIssuesUseCase.execute).mockResolvedValue([]);

      const routes: Record<string, (req: FastifyRequest, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest();

      // WHEN
      await routes['/api/issues']?.(request, reply);

      // THEN
      expect(reply.send).toHaveBeenCalledWith([]);
    });

    it('returns 500 on error', async () => {
      // GIVEN
      vi.mocked(mockListIssuesUseCase.execute).mockRejectedValue(new Error('Database error'));

      const routes: Record<string, (req: FastifyRequest, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest();

      // WHEN
      await routes['/api/issues']?.(request, reply);

      // THEN
      expect(reply.status).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith({
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
    });
  });

  describe('getIssue', () => {
    it('returns issue as DTO when found', async () => {
      // GIVEN
      const issue = createMockIssue({ id: new IssueId('be-123') });
      vi.mocked(mockGetIssueUseCase.execute).mockResolvedValue(issue);

      const routes: Record<string, (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({ id: 'be-123' });

      // WHEN
      await routes['/api/issues/:id']?.(request, reply);

      // THEN
      expect(mockGetIssueUseCase.execute).toHaveBeenCalledOnce();
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'be-123' }),
      );
    });

    it('returns 404 when issue not found', async () => {
      // GIVEN
      vi.mocked(mockGetIssueUseCase.execute).mockResolvedValue(null);

      const routes: Record<string, (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({ id: 'be-nonexistent' });

      // WHEN
      await routes['/api/issues/:id']?.(request, reply);

      // THEN
      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({
        error: { code: 'NOT_FOUND', message: "Issue with ID 'be-nonexistent' not found" },
      });
    });

    it('returns 400 for invalid ID format', async () => {
      // GIVEN
      const routes: Record<string, (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({ id: '' });

      // WHEN
      await routes['/api/issues/:id']?.(request, reply);

      // THEN
      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: { code: 'INVALID_ID', message: 'Invalid issue ID format' },
      });
    });

    it('returns 500 on error', async () => {
      // GIVEN
      vi.mocked(mockGetIssueUseCase.execute).mockRejectedValue(new Error('Database error'));

      const routes: Record<string, (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>> = {};
      const mockServer = {
        get: vi.fn((path: string, handler: (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => Promise<void>) => {
          routes[path] = handler;
        }),
      } as unknown as FastifyInstance;

      handler.registerRoutes(mockServer);
      const reply = createMockReply();
      const request = createMockRequest({ id: 'be-123' });

      // WHEN
      await routes['/api/issues/:id']?.(request, reply);

      // THEN
      expect(reply.status).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith({
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
    });
  });
});
