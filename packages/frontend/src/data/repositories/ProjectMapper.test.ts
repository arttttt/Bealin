import { describe, it, expect } from 'vitest';
import { ProjectMapper } from './ProjectMapper';
import { ProjectId } from '@bealin/shared';
import type { ProjectApiDto } from '../sources/api/ProjectApiSource';

function createMockDto(overrides: Partial<ProjectApiDto> = {}): ProjectApiDto {
  return {
    id: 'project-123',
    name: 'Test Project',
    path: '/path/to/project/.beads',
    addedAt: '2026-01-14T00:00:00.000Z',
    ...overrides,
  };
}

describe('ProjectMapper', () => {
  describe('toDomain', () => {
    it('converts DTO to domain model with branded types', () => {
      // GIVEN
      const dto = createMockDto();

      // WHEN
      const result = ProjectMapper.toDomain(dto, false);

      // THEN
      expect(result.id).toBeInstanceOf(ProjectId);
      expect(result.id.value).toBe('project-123');
      expect(result.name).toBe('Test Project');
      expect(result.path).toBe('/path/to/project/.beads');
      expect(result.isActive).toBe(false);
    });

    it('sets isActive to true when specified', () => {
      // GIVEN
      const dto = createMockDto();

      // WHEN
      const result = ProjectMapper.toDomain(dto, true);

      // THEN
      expect(result.isActive).toBe(true);
    });

    it('converts ISO date string to Date object', () => {
      // GIVEN
      const dto = createMockDto({
        addedAt: '2026-01-15T10:30:00.000Z',
      });

      // WHEN
      const result = ProjectMapper.toDomain(dto, false);

      // THEN
      expect(result.addedAt).toBeInstanceOf(Date);
      expect(result.addedAt.toISOString()).toBe('2026-01-15T10:30:00.000Z');
    });
  });

  describe('toDomainList', () => {
    it('converts array of DTOs to domain models with isActive computed', () => {
      // GIVEN
      const dtos = [
        createMockDto({ id: 'project-1', name: 'Project 1' }),
        createMockDto({ id: 'project-2', name: 'Project 2' }),
      ];
      const activeProjectId = 'project-2';

      // WHEN
      const result = ProjectMapper.toDomainList(dtos, activeProjectId);

      // THEN
      expect(result).toHaveLength(2);
      expect(result[0]?.id.value).toBe('project-1');
      expect(result[0]?.name).toBe('Project 1');
      expect(result[0]?.isActive).toBe(false);
      expect(result[1]?.id.value).toBe('project-2');
      expect(result[1]?.name).toBe('Project 2');
      expect(result[1]?.isActive).toBe(true);
    });

    it('returns all projects as inactive when activeProjectId is null', () => {
      // GIVEN
      const dtos = [
        createMockDto({ id: 'project-1' }),
        createMockDto({ id: 'project-2' }),
      ];

      // WHEN
      const result = ProjectMapper.toDomainList(dtos, null);

      // THEN
      expect(result[0]?.isActive).toBe(false);
      expect(result[1]?.isActive).toBe(false);
    });

    it('returns empty array for empty input', () => {
      // GIVEN
      const dtos: ProjectApiDto[] = [];

      // WHEN
      const result = ProjectMapper.toDomainList(dtos, null);

      // THEN
      expect(result).toEqual([]);
    });
  });
});
