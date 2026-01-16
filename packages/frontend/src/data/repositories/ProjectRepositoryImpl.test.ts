import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectRepositoryImpl } from './ProjectRepositoryImpl';
import { ProjectApiSource, type ProjectApiDto } from '../sources/api/ProjectApiSource';

function createMockDto(overrides: Partial<ProjectApiDto> = {}): ProjectApiDto {
  return {
    id: 'project-123',
    name: 'Test Project',
    path: '/path/to/project/.beads',
    addedAt: '2026-01-14T00:00:00.000Z',
    ...overrides,
  };
}

describe('ProjectRepositoryImpl', () => {
  let mockApiSource: ProjectApiSource;
  let repository: ProjectRepositoryImpl;

  beforeEach(() => {
    mockApiSource = {
      fetchProjects: vi.fn(),
      fetchActiveProject: vi.fn(),
      addProject: vi.fn(),
      removeProject: vi.fn(),
      setActiveProject: vi.fn(),
      validatePath: vi.fn(),
    } as unknown as ProjectApiSource;
    repository = new ProjectRepositoryImpl(mockApiSource);
  });

  describe('getProjects', () => {
    it('returns mapped domain models with isActive computed', async () => {
      // GIVEN
      vi.mocked(mockApiSource.fetchProjects).mockResolvedValue({
        projects: [
          createMockDto({ id: 'p-1', name: 'Project 1' }),
          createMockDto({ id: 'p-2', name: 'Project 2' }),
        ],
        activeProjectId: 'p-2',
      });

      // WHEN
      const result = await repository.getProjects();

      // THEN
      expect(result).toHaveLength(2);
      expect(result[0]?.id.value).toBe('p-1');
      expect(result[0]?.isActive).toBe(false);
      expect(result[1]?.id.value).toBe('p-2');
      expect(result[1]?.isActive).toBe(true);
      expect(mockApiSource.fetchProjects).toHaveBeenCalledOnce();
    });

    it('returns empty array when no projects exist', async () => {
      // GIVEN
      vi.mocked(mockApiSource.fetchProjects).mockResolvedValue({
        projects: [],
        activeProjectId: null,
      });

      // WHEN
      const result = await repository.getProjects();

      // THEN
      expect(result).toEqual([]);
    });
  });

  describe('getActiveProject', () => {
    it('returns mapped domain model when active project exists', async () => {
      // GIVEN
      const mockDto = createMockDto({ id: 'active-project' });
      vi.mocked(mockApiSource.fetchActiveProject).mockResolvedValue({
        project: mockDto,
      });

      // WHEN
      const result = await repository.getActiveProject();

      // THEN
      expect(result).not.toBeNull();
      expect(result?.id.value).toBe('active-project');
      expect(result?.isActive).toBe(true);
    });

    it('returns null when no active project', async () => {
      // GIVEN
      vi.mocked(mockApiSource.fetchActiveProject).mockResolvedValue({
        project: null,
      });

      // WHEN
      const result = await repository.getActiveProject();

      // THEN
      expect(result).toBeNull();
    });
  });

  describe('addProject', () => {
    it('adds project and returns domain model with isActive true', async () => {
      // GIVEN
      const mockDto = createMockDto({ id: 'new-project', name: 'New Project' });
      vi.mocked(mockApiSource.addProject).mockResolvedValue({
        project: mockDto,
      });

      // WHEN
      const result = await repository.addProject('/path/to/.beads', 'New Project');

      // THEN
      expect(result.id.value).toBe('new-project');
      expect(result.name).toBe('New Project');
      expect(result.isActive).toBe(true);
      expect(mockApiSource.addProject).toHaveBeenCalledWith('/path/to/.beads', 'New Project');
    });

    it('adds project without name when name is undefined', async () => {
      // GIVEN
      const mockDto = createMockDto({ id: 'new-project' });
      vi.mocked(mockApiSource.addProject).mockResolvedValue({
        project: mockDto,
      });

      // WHEN
      await repository.addProject('/path/to/.beads');

      // THEN
      expect(mockApiSource.addProject).toHaveBeenCalledWith('/path/to/.beads', undefined);
    });
  });

  describe('removeProject', () => {
    it('calls API source to remove project', async () => {
      // GIVEN
      vi.mocked(mockApiSource.removeProject).mockResolvedValue(undefined);

      // WHEN
      await repository.removeProject('project-to-remove');

      // THEN
      expect(mockApiSource.removeProject).toHaveBeenCalledWith('project-to-remove');
    });
  });

  describe('setActiveProject', () => {
    it('calls API source to set active project', async () => {
      // GIVEN
      vi.mocked(mockApiSource.setActiveProject).mockResolvedValue(undefined);

      // WHEN
      await repository.setActiveProject('project-to-activate');

      // THEN
      expect(mockApiSource.setActiveProject).toHaveBeenCalledWith('project-to-activate');
    });
  });

  describe('validatePath', () => {
    it('returns validation result from API source', async () => {
      // GIVEN
      vi.mocked(mockApiSource.validatePath).mockResolvedValue({
        valid: true,
        suggestedName: 'my-project',
      });

      // WHEN
      const result = await repository.validatePath('/path/to/project/.beads');

      // THEN
      expect(result.valid).toBe(true);
      expect(result.suggestedName).toBe('my-project');
      expect(mockApiSource.validatePath).toHaveBeenCalledWith('/path/to/project/.beads');
    });
  });
});
