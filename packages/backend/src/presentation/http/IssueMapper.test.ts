import { describe, it, expect } from 'vitest';
import { IssueMapper } from './IssueMapper.js';
import type { Issue } from '@bealin/shared';
import { IssueId, LabelId } from '@bealin/shared';

function createMockIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: new IssueId('be-test-123'),
    title: 'Test Issue',
    description: 'Test description',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    labels: [new LabelId('label-1'), new LabelId('label-2')],
    createdAt: new Date('2026-01-14T10:00:00.000Z'),
    updatedAt: new Date('2026-01-14T12:00:00.000Z'),
    blocks: [],
    blockedBy: [],
    ...overrides,
  };
}

describe('IssueMapper', () => {
  describe('toDto', () => {
    it('converts Issue domain model to IssueDto', () => {
      // GIVEN
      const issue = createMockIssue();

      // WHEN
      const dto = IssueMapper.toDto(issue);

      // THEN
      expect(dto).toEqual({
        id: 'be-test-123',
        title: 'Test Issue',
        description: 'Test description',
        status: 'todo',
        priority: 'medium',
        type: 'task',
        labels: ['label-1', 'label-2'],
        createdAt: '2026-01-14T10:00:00.000Z',
        updatedAt: '2026-01-14T12:00:00.000Z',
        blocks: [],
        blockedBy: [],
      });
    });

    it('handles empty labels array', () => {
      // GIVEN
      const issue = createMockIssue({ labels: [] });

      // WHEN
      const dto = IssueMapper.toDto(issue);

      // THEN
      expect(dto.labels).toEqual([]);
    });

    it('extracts branded type values correctly', () => {
      // GIVEN
      const issue = createMockIssue({
        id: new IssueId('custom-id'),
        labels: [new LabelId('l1')],
      });

      // WHEN
      const dto = IssueMapper.toDto(issue);

      // THEN
      expect(dto.id).toBe('custom-id');
      expect(dto.labels).toEqual(['l1']);
    });
  });

  describe('toDtoList', () => {
    it('converts array of Issues to array of IssueDtos', () => {
      // GIVEN
      const issues = [
        createMockIssue({ id: new IssueId('be-1'), title: 'Issue 1' }),
        createMockIssue({ id: new IssueId('be-2'), title: 'Issue 2' }),
      ];

      // WHEN
      const dtos = IssueMapper.toDtoList(issues);

      // THEN
      expect(dtos).toHaveLength(2);
      expect(dtos[0]?.id).toBe('be-1');
      expect(dtos[0]?.title).toBe('Issue 1');
      expect(dtos[1]?.id).toBe('be-2');
      expect(dtos[1]?.title).toBe('Issue 2');
    });

    it('returns empty array for empty input', () => {
      // GIVEN
      const issues: Issue[] = [];

      // WHEN
      const dtos = IssueMapper.toDtoList(issues);

      // THEN
      expect(dtos).toEqual([]);
    });
  });
});
