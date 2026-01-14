import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { ListIssuesUseCase } from './ListIssuesUseCase.js';
import type { IssueRepository } from '../repositories/IssueRepository.js';
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

describe('ListIssuesUseCase', () => {
  it('returns all issues from repository', async () => {
    // GIVEN
    const mockIssues = [
      createMockIssue({ id: new IssueId('be-1'), title: 'Issue 1' }),
      createMockIssue({ id: new IssueId('be-2'), title: 'Issue 2' }),
    ];
    const mockRepo: IssueRepository = {
      findAll: vi.fn().mockResolvedValue(mockIssues),
      findById: vi.fn(),
    };
    const useCase = new ListIssuesUseCase(mockRepo);

    // WHEN
    const result = await useCase.execute();

    // THEN
    expect(result).toEqual(mockIssues);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  it('returns empty array when no issues exist', async () => {
    // GIVEN
    const mockRepo: IssueRepository = {
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
    };
    const useCase = new ListIssuesUseCase(mockRepo);

    // WHEN
    const result = await useCase.execute();

    // THEN
    expect(result).toEqual([]);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });
});
