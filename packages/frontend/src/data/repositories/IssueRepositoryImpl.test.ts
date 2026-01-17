import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IssueRepositoryImpl } from './IssueRepositoryImpl';
import { IssueApiSource } from '../sources/api/IssueApiSource';
import { IssueId, type IssueDto } from '@bealin/shared';

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

describe('IssueRepositoryImpl', () => {
  let mockApiSource: IssueApiSource;
  let repository: IssueRepositoryImpl;

  beforeEach(() => {
    mockApiSource = {
      fetchAll: vi.fn(),
      fetchById: vi.fn(),
    } as unknown as IssueApiSource;
    repository = new IssueRepositoryImpl(mockApiSource);
  });

  describe('findAll', () => {
    it('returns mapped domain models from API source', async () => {
      // GIVEN
      const mockDtos = [
        createMockDto({ id: 'be-1', title: 'Issue 1' }),
        createMockDto({ id: 'be-2', title: 'Issue 2' }),
      ];
      vi.mocked(mockApiSource.fetchAll).mockResolvedValue(mockDtos);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result).toHaveLength(2);
      expect(result[0]?.id.value).toBe('be-1');
      expect(result[0]?.title).toBe('Issue 1');
      expect(result[1]?.id.value).toBe('be-2');
      expect(mockApiSource.fetchAll).toHaveBeenCalledOnce();
    });

    it('returns empty array when no issues exist', async () => {
      // GIVEN
      vi.mocked(mockApiSource.fetchAll).mockResolvedValue([]);

      // WHEN
      const result = await repository.findAll();

      // THEN
      expect(result).toEqual([]);
      expect(mockApiSource.fetchAll).toHaveBeenCalledOnce();
    });
  });

  describe('findById', () => {
    it('returns mapped domain model when issue found', async () => {
      // GIVEN
      const mockDto = createMockDto({ id: 'be-abc', title: 'Found Issue' });
      vi.mocked(mockApiSource.fetchById).mockResolvedValue(mockDto);
      const issueId = new IssueId('be-abc');

      // WHEN
      const result = await repository.findById(issueId);

      // THEN
      expect(result).not.toBeNull();
      expect(result?.id.value).toBe('be-abc');
      expect(result?.title).toBe('Found Issue');
      expect(mockApiSource.fetchById).toHaveBeenCalledWith('be-abc');
    });

    it('returns null when issue not found', async () => {
      // GIVEN
      vi.mocked(mockApiSource.fetchById).mockResolvedValue(null);
      const issueId = new IssueId('be-nonexistent');

      // WHEN
      const result = await repository.findById(issueId);

      // THEN
      expect(result).toBeNull();
      expect(mockApiSource.fetchById).toHaveBeenCalledWith('be-nonexistent');
    });
  });
});
