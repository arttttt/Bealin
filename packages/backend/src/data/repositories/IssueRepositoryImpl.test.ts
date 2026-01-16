import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IssueRepositoryImpl } from './IssueRepositoryImpl.js';
import { JsonlSource } from '../sources/filesystem/JsonlSource.js';
import { IssueId } from '@bealin/shared';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';
import { NoActiveProjectError } from '../../domain/errors/NoActiveProjectError.js';

function createMockJsonlSource(): JsonlSource {
  return {
    readAll: vi.fn(),
  } as unknown as JsonlSource;
}

function createMockConfigService(activeProject: { id: string; path: string } | null): ConfigService {
  return {
    getActiveProject: vi.fn().mockResolvedValue(activeProject),
    getIssuesPath: vi.fn().mockImplementation((project) => `${project.path}/.beads/issues.jsonl`),
    getBeadsPath: vi.fn().mockImplementation((project) => `${project.path}/.beads`),
    getProjects: vi.fn(),
    addProject: vi.fn(),
    removeProject: vi.fn(),
    setActiveProject: vi.fn(),
  } as unknown as ConfigService;
}

function createRawIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: 'be-test-123',
    title: 'Test Issue',
    description: 'Test description',
    status: 'open',
    priority: 3,
    issue_type: 'task',
    created_at: '2026-01-14T10:00:00Z',
    updated_at: '2026-01-14T11:00:00Z',
    ...overrides,
  };
}

const mockProject = { id: 'proj-1', path: '/test/project' };

describe('IssueRepositoryImpl', () => {
  let repository: IssueRepositoryImpl;
  let mockJsonlSource: JsonlSource;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockJsonlSource = createMockJsonlSource();
    mockConfigService = createMockConfigService(mockProject);
    repository = new IssueRepositoryImpl(mockJsonlSource, mockConfigService);
  });

  describe('getIssuesFilePath', () => {
    it('throws NoActiveProjectError when no project is active', async () => {
      // GIVEN
      const noProjectConfigService = createMockConfigService(null);
      const repo = new IssueRepositoryImpl(mockJsonlSource, noProjectConfigService);

      // WHEN/THEN
      await expect(repo.findAll()).rejects.toThrow(NoActiveProjectError);
    });

    it('uses path from active project', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([]);

      // WHEN
      await repository.findAll();

      // THEN
      expect(mockJsonlSource.readAll).toHaveBeenCalledWith('/test/project/.beads/issues.jsonl');
    });
  });

  describe('findAll', () => {
    it('returns all issues mapped to domain model', async () => {
      // GIVEN
      const rawIssues = [
        createRawIssue({ id: 'be-1', title: 'Issue 1' }),
        createRawIssue({ id: 'be-2', title: 'Issue 2' }),
      ];
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue(rawIssues);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBeInstanceOf(IssueId);
      expect(result[0]?.id.value).toBe('be-1');
      expect(result[0]?.title).toBe('Issue 1');
      expect(result[1]?.id.value).toBe('be-2');
    });

    it('returns empty array when no issues exist', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result).toEqual([]);
    });

    it('maps open status to todo', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue({ status: 'open' })]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.status).toBe('todo');
    });

    it('maps closed status to done', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue({ status: 'closed' })]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.status).toBe('done');
    });

    it('maps in_progress status unchanged', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([
        createRawIssue({ status: 'in_progress' }),
      ]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.status).toBe('in_progress');
    });

    it('maps unknown status to backlog', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue({ status: 'unknown' })]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.status).toBe('backlog');
    });

    it('maps priority 1 to urgent', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue({ priority: 1 })]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.priority).toBe('urgent');
    });

    it('maps priority 2 to high', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue({ priority: 2 })]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.priority).toBe('high');
    });

    it('maps priority 3 to medium', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue({ priority: 3 })]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.priority).toBe('medium');
    });

    it('maps priority 4 to low', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue({ priority: 4 })]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.priority).toBe('low');
    });

    it('maps unknown priority to none', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue({ priority: 99 })]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.priority).toBe('none');
    });

    it('parses dates correctly', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([
        createRawIssue({
          created_at: '2026-01-14T10:00:00Z',
          updated_at: '2026-01-14T12:00:00Z',
        }),
      ]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.createdAt).toBeInstanceOf(Date);
      expect(result[0]?.updatedAt).toBeInstanceOf(Date);
      expect(result[0]?.createdAt.toISOString()).toBe('2026-01-14T10:00:00.000Z');
    });

    it('returns empty labels array', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue()]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result[0]?.labels).toEqual([]);
    });
  });

  describe('findById', () => {
    it('returns issue when found', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([
        createRawIssue({ id: 'be-1' }),
        createRawIssue({ id: 'be-2' }),
      ]);

      // WHEN
      const result = await repository.findById(new IssueId('be-2'));

      // THEN
      expect(result).not.toBeNull();
      expect(result?.id.value).toBe('be-2');
    });

    it('returns null when not found', async () => {
      // GIVEN
      vi.mocked(mockJsonlSource.readAll).mockResolvedValue([createRawIssue({ id: 'be-1' })]);

      // WHEN
      const result = await repository.findById(new IssueId('be-nonexistent'));

      // THEN
      expect(result).toBeNull();
    });
  });
});
