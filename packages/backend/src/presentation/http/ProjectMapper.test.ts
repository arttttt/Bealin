import { describe, it, expect } from 'vitest';
import { ProjectMapper } from './ProjectMapper.js';
import type { Project } from '../../domain/entities/AppConfig.js';

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'test-uuid-123',
    name: 'Test Project',
    path: '/Users/test/projects/myproject',
    addedAt: '2026-01-15T10:00:00.000Z',
    ...overrides,
  };
}

describe('ProjectMapper', () => {
  describe('toDto', () => {
    it('converts domain project to DTO with .beads path', () => {
      // GIVEN
      const project = createMockProject({
        path: '/Users/test/projects/myproject',
      });

      // WHEN
      const dto = ProjectMapper.toDto(project);

      // THEN
      expect(dto).toEqual({
        id: 'test-uuid-123',
        name: 'Test Project',
        path: '/Users/test/projects/myproject/.beads',
        addedAt: '2026-01-15T10:00:00.000Z',
      });
    });

    it('preserves all fields correctly', () => {
      // GIVEN
      const project = createMockProject({
        id: 'custom-id',
        name: 'Custom Name',
        addedAt: '2026-01-16T15:30:00.000Z',
      });

      // WHEN
      const dto = ProjectMapper.toDto(project);

      // THEN
      expect(dto.id).toBe('custom-id');
      expect(dto.name).toBe('Custom Name');
      expect(dto.addedAt).toBe('2026-01-16T15:30:00.000Z');
    });
  });

  describe('toDtoList', () => {
    it('converts list of domain projects to DTOs', () => {
      // GIVEN
      const projects = [
        createMockProject({ id: 'proj-1', path: '/path/one' }),
        createMockProject({ id: 'proj-2', path: '/path/two' }),
      ];

      // WHEN
      const dtos = ProjectMapper.toDtoList(projects);

      // THEN
      expect(dtos).toHaveLength(2);
      expect(dtos[0]?.path).toBe('/path/one/.beads');
      expect(dtos[1]?.path).toBe('/path/two/.beads');
    });

    it('returns empty array for empty input', () => {
      // GIVEN
      const projects: Project[] = [];

      // WHEN
      const dtos = ProjectMapper.toDtoList(projects);

      // THEN
      expect(dtos).toEqual([]);
    });
  });

  describe('beadsPathToProjectPath', () => {
    it('strips .beads suffix from path', () => {
      // GIVEN
      const beadsPath = '/Users/test/projects/myproject/.beads';

      // WHEN
      const projectPath = ProjectMapper.beadsPathToProjectPath(beadsPath);

      // THEN
      expect(projectPath).toBe('/Users/test/projects/myproject');
    });

    it('strips .beads/ with trailing slash', () => {
      // GIVEN
      const beadsPath = '/Users/test/projects/myproject/.beads/';

      // WHEN
      const projectPath = ProjectMapper.beadsPathToProjectPath(beadsPath);

      // THEN
      expect(projectPath).toBe('/Users/test/projects/myproject');
    });

    it('returns original path if no .beads suffix', () => {
      // GIVEN
      const path = '/Users/test/projects/myproject';

      // WHEN
      const result = ProjectMapper.beadsPathToProjectPath(path);

      // THEN
      expect(result).toBe('/Users/test/projects/myproject');
    });
  });
});
