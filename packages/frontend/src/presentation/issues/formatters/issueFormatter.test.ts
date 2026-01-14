import { describe, it, expect } from 'vitest';
import { formatIssue, formatIssues } from './issueFormatter';
import type { Issue } from '@bealin/shared';
import { IssueId, LabelId } from '@bealin/shared';

function createMockIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: new IssueId('be-test-123'),
    title: 'Test Issue',
    description: 'Test description',
    status: 'todo',
    priority: 'medium',
    labels: [new LabelId('label-1')],
    createdAt: new Date('2026-01-14'),
    updatedAt: new Date('2026-01-14'),
    ...overrides,
  };
}

describe('issueFormatter', () => {
  describe('formatIssue', () => {
    it('transforms issue to view model with correct id', () => {
      // GIVEN
      const issue = createMockIssue({ id: new IssueId('be-xyz') });

      // WHEN
      const result = formatIssue(issue);

      // THEN
      expect(result.id).toBe('be-xyz');
    });

    it('transforms title and description', () => {
      // GIVEN
      const issue = createMockIssue({
        title: 'My Title',
        description: 'My Description',
      });

      // WHEN
      const result = formatIssue(issue);

      // THEN
      expect(result.title).toBe('My Title');
      expect(result.description).toBe('My Description');
    });

    it('formats status as label with color', () => {
      // GIVEN
      const issue = createMockIssue({ status: 'in_progress' });

      // WHEN
      const result = formatIssue(issue);

      // THEN
      expect(result.status).toBe('In Progress');
      expect(result.statusColor).toBe('bg-yellow-500/20 text-yellow-400');
    });

    it('formats priority as label with color', () => {
      // GIVEN
      const issue = createMockIssue({ priority: 'high' });

      // WHEN
      const result = formatIssue(issue);

      // THEN
      expect(result.priority).toBe('High');
      expect(result.priorityColor).toBe('text-orange-400');
    });

    it('formats createdAt date as short format', () => {
      // GIVEN
      const issue = createMockIssue({ createdAt: new Date('2026-03-15') });

      // WHEN
      const result = formatIssue(issue);

      // THEN
      expect(result.createdAt).toBe('Mar 15');
    });

    it('formats updatedAt date as short format', () => {
      // GIVEN
      const issue = createMockIssue({ updatedAt: new Date('2026-04-20') });

      // WHEN
      const result = formatIssue(issue);

      // THEN
      expect(result.updatedAt).toBe('Apr 20');
    });

    it('formats labels as array of string values', () => {
      // GIVEN
      const issue = createMockIssue({
        labels: [new LabelId('label-a'), new LabelId('label-b')],
      });

      // WHEN
      const result = formatIssue(issue);

      // THEN
      expect(result.labels).toEqual(['label-a', 'label-b']);
    });

    it('handles empty labels array', () => {
      // GIVEN
      const issue = createMockIssue({ labels: [] });

      // WHEN
      const result = formatIssue(issue);

      // THEN
      expect(result.labels).toEqual([]);
    });
  });

  describe('formatIssues', () => {
    it('transforms array of issues', () => {
      // GIVEN
      const issues = [
        createMockIssue({ id: new IssueId('be-1'), title: 'Issue 1' }),
        createMockIssue({ id: new IssueId('be-2'), title: 'Issue 2' }),
      ];

      // WHEN
      const result = formatIssues(issues);

      // THEN
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('be-1');
      expect(result[1]?.id).toBe('be-2');
    });

    it('returns empty array for empty input', () => {
      // GIVEN
      const issues: Issue[] = [];

      // WHEN
      const result = formatIssues(issues);

      // THEN
      expect(result).toEqual([]);
    });
  });
});
