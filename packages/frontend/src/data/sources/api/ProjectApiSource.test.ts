import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProjectApiSource, type ProjectApiDto } from './ProjectApiSource';
import { ProjectApiError } from '../../errors/ProjectApiError';

function createMockDto(overrides: Partial<ProjectApiDto> = {}): ProjectApiDto {
  return {
    id: 'project-123',
    name: 'Test Project',
    path: '/path/to/project/.beads',
    addedAt: '2026-01-14T00:00:00.000Z',
    ...overrides,
  };
}

describe('ProjectApiSource', () => {
  let apiSource: ProjectApiSource;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    apiSource = new ProjectApiSource();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchProjects', () => {
    it('fetches projects from API and validates response', async () => {
      // GIVEN
      const mockResponse = {
        projects: [
          createMockDto({ id: 'p-1', name: 'Project 1' }),
          createMockDto({ id: 'p-2', name: 'Project 2' }),
        ],
        activeProjectId: 'p-1',
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // WHEN
      const result = await apiSource.fetchProjects();

      // THEN
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/projects');
    });

    it('throws error on non-OK response', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // WHEN/THEN
      await expect(apiSource.fetchProjects()).rejects.toThrow(
        'Failed to fetch projects: 500',
      );
    });

    it('throws error on invalid response format', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      });

      // WHEN/THEN
      await expect(apiSource.fetchProjects()).rejects.toThrow('Invalid response format');
    });
  });

  describe('fetchActiveProject', () => {
    it('fetches active project from API', async () => {
      // GIVEN
      const mockResponse = {
        project: createMockDto({ id: 'active-project' }),
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // WHEN
      const result = await apiSource.fetchActiveProject();

      // THEN
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/projects/active');
    });

    it('returns null project when no active project', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ project: null }),
      });

      // WHEN
      const result = await apiSource.fetchActiveProject();

      // THEN
      expect(result.project).toBeNull();
    });
  });

  describe('addProject', () => {
    it('adds project and returns response', async () => {
      // GIVEN
      const mockResponse = {
        project: createMockDto({ id: 'new-project', name: 'New Project' }),
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // WHEN
      const result = await apiSource.addProject('/path/to/.beads', 'New Project');

      // THEN
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/path/to/.beads', name: 'New Project' }),
      });
    });

    it('throws ProjectApiError on INVALID_PATH error', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'INVALID_PATH',
          message: 'Invalid path provided',
        }),
      });

      // WHEN/THEN
      await expect(apiSource.addProject('/invalid')).rejects.toThrow(ProjectApiError);
      await expect(apiSource.addProject('/invalid')).rejects.toMatchObject({
        code: 'INVALID_PATH',
        message: 'Invalid path provided',
      });
    });

    it('throws ProjectApiError on ALREADY_EXISTS error', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          error: 'ALREADY_EXISTS',
          message: 'Project already exists',
        }),
      });

      // WHEN/THEN
      await expect(apiSource.addProject('/existing')).rejects.toThrow(ProjectApiError);
      await expect(apiSource.addProject('/existing')).rejects.toMatchObject({
        code: 'ALREADY_EXISTS',
      });
    });
  });

  describe('removeProject', () => {
    it('calls delete endpoint', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({ ok: true });

      // WHEN
      await apiSource.removeProject('project-to-remove');

      // THEN
      expect(mockFetch).toHaveBeenCalledWith('/api/projects/project-to-remove', {
        method: 'DELETE',
      });
    });

    it('throws error on non-OK response', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // WHEN/THEN
      await expect(apiSource.removeProject('p-1')).rejects.toThrow(
        'Failed to remove project: 500',
      );
    });
  });

  describe('setActiveProject', () => {
    it('calls activate endpoint', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({ ok: true });

      // WHEN
      await apiSource.setActiveProject('project-to-activate');

      // THEN
      expect(mockFetch).toHaveBeenCalledWith('/api/projects/project-to-activate/activate', {
        method: 'POST',
      });
    });

    it('throws ProjectApiError on NOT_FOUND error', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({
          error: 'NOT_FOUND',
          message: 'Project not found',
        }),
      });

      // WHEN/THEN
      await expect(apiSource.setActiveProject('nonexistent')).rejects.toThrow(ProjectApiError);
      await expect(apiSource.setActiveProject('nonexistent')).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });
  });

  describe('validatePath', () => {
    it('validates path and returns result', async () => {
      // GIVEN
      const mockResponse = {
        valid: true,
        suggestedName: 'my-project',
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // WHEN
      const result = await apiSource.validatePath('/path/to/.beads');

      // THEN
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/projects/validate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/path/to/.beads' }),
      });
    });

    it('throws error on non-OK response', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // WHEN/THEN
      await expect(apiSource.validatePath('/path')).rejects.toThrow(
        'Failed to validate path: 500',
      );
    });
  });
});
