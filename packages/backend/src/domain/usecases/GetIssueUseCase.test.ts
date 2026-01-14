import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { GetIssueUseCase } from './GetIssueUseCase.js';
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

describe('GetIssueUseCase', () => {
  it('returns issue when found', async () => {
    // GIVEN
    const issueId = new IssueId('be-123');
    const mockIssue = createMockIssue({ id: issueId, title: 'Found Issue' });
    const mockRepo: IssueRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockIssue),
    };
    const useCase = new GetIssueUseCase(mockRepo);

    // WHEN
    const result = await useCase.execute(issueId);

    // THEN
    expect(result).toEqual(mockIssue);
    expect(mockRepo.findById).toHaveBeenCalledWith(issueId);
    expect(mockRepo.findById).toHaveBeenCalledOnce();
  });

  it('returns null when issue not found', async () => {
    // GIVEN
    const issueId = new IssueId('be-nonexistent');
    const mockRepo: IssueRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };
    const useCase = new GetIssueUseCase(mockRepo);

    // WHEN
    const result = await useCase.execute(issueId);

    // THEN
    expect(result).toBeNull();
    expect(mockRepo.findById).toHaveBeenCalledWith(issueId);
    expect(mockRepo.findById).toHaveBeenCalledOnce();
  });
});
