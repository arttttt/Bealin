import { describe, it, expect } from 'vitest';
import { IssueMapper } from './IssueMapper';
import { IssueId, LabelId, type IssueDto } from '@bealin/shared';

function createMockDto(overrides: Partial<IssueDto> = {}): IssueDto {
  return {
    id: 'be-test-123',
    title: 'Test Issue',
    description: 'Test description',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    labels: ['label-1'],
    createdAt: '2026-01-14T00:00:00.000Z',
    updatedAt: '2026-01-14T00:00:00.000Z',
    blocks: [],
    blockedBy: [],
    ...overrides,
  };
}

describe('IssueMapper', () => {
  describe('toDomain', () => {
    it('converts DTO to domain model with branded types', () => {
      // GIVEN
      const dto = createMockDto();

      // WHEN
      const result = IssueMapper.toDomain(dto);

      // THEN
      expect(result.id).toBeInstanceOf(IssueId);
      expect(result.id.value).toBe('be-test-123');
      expect(result.title).toBe('Test Issue');
      expect(result.description).toBe('Test description');
      expect(result.status).toBe('todo');
      expect(result.priority).toBe('medium');
    });

    it('converts label strings to LabelId branded types', () => {
      // GIVEN
      const dto = createMockDto({ labels: ['label-1', 'label-2'] });

      // WHEN
      const result = IssueMapper.toDomain(dto);

      // THEN
      expect(result.labels).toHaveLength(2);
      expect(result.labels[0]).toBeInstanceOf(LabelId);
      expect(result.labels[0]?.value).toBe('label-1');
      expect(result.labels[1]?.value).toBe('label-2');
    });

    it('converts ISO date strings to Date objects', () => {
      // GIVEN
      const dto = createMockDto({
        createdAt: '2026-01-15T10:30:00.000Z',
        updatedAt: '2026-01-15T11:45:00.000Z',
      });

      // WHEN
      const result = IssueMapper.toDomain(dto);

      // THEN
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2026-01-15T10:30:00.000Z');
      expect(result.updatedAt.toISOString()).toBe('2026-01-15T11:45:00.000Z');
    });
  });

  describe('toDomainList', () => {
    it('converts array of DTOs to domain models', () => {
      // GIVEN
      const dtos = [
        createMockDto({ id: 'be-1', title: 'Issue 1' }),
        createMockDto({ id: 'be-2', title: 'Issue 2' }),
      ];

      // WHEN
      const result = IssueMapper.toDomainList(dtos);

      // THEN
      expect(result).toHaveLength(2);
      expect(result[0]?.id.value).toBe('be-1');
      expect(result[0]?.title).toBe('Issue 1');
      expect(result[1]?.id.value).toBe('be-2');
      expect(result[1]?.title).toBe('Issue 2');
    });

    it('returns empty array for empty input', () => {
      // GIVEN
      const dtos: IssueDto[] = [];

      // WHEN
      const result = IssueMapper.toDomainList(dtos);

      // THEN
      expect(result).toEqual([]);
    });
  });
});
