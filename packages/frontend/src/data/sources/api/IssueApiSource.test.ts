import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IssueApiSource } from './IssueApiSource';
import type { IssueDto } from '@bealin/shared';

function createMockDto(overrides: Partial<IssueDto> = {}): IssueDto {
  return {
    id: 'be-test-123',
    title: 'Test Issue',
    description: 'Test description',
    status: 'todo',
    priority: 'medium',
    labels: ['label-1'],
    createdAt: '2026-01-14T00:00:00.000Z',
    updatedAt: '2026-01-14T00:00:00.000Z',
    ...overrides,
  };
}

describe('IssueApiSource', () => {
  let apiSource: IssueApiSource;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    apiSource = new IssueApiSource();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchAll', () => {
    it('fetches issues from API and validates response', async () => {
      // GIVEN
      const mockDtos = [
        createMockDto({ id: 'be-1', title: 'Issue 1' }),
        createMockDto({ id: 'be-2', title: 'Issue 2' }),
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDtos),
      });

      // WHEN
      const result = await apiSource.fetchAll();

      // THEN
      expect(result).toEqual(mockDtos);
      expect(mockFetch).toHaveBeenCalledWith('/api/issues');
    });

    it('throws error on non-OK response', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // WHEN/THEN
      await expect(apiSource.fetchAll()).rejects.toThrow(
        'Failed to fetch issues: 500',
      );
    });

    it('throws error on invalid response format', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      });

      // WHEN/THEN
      await expect(apiSource.fetchAll()).rejects.toThrow('Invalid response format');
    });
  });

  describe('fetchById', () => {
    it('fetches single issue from API', async () => {
      // GIVEN
      const mockDto = createMockDto({ id: 'be-abc', title: 'Found Issue' });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDto),
      });

      // WHEN
      const result = await apiSource.fetchById('be-abc');

      // THEN
      expect(result).toEqual(mockDto);
      expect(mockFetch).toHaveBeenCalledWith('/api/issues/be-abc');
    });

    it('returns null on 404 response', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      // WHEN
      const result = await apiSource.fetchById('be-nonexistent');

      // THEN
      expect(result).toBeNull();
    });

    it('throws error on other non-OK response', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // WHEN/THEN
      await expect(apiSource.fetchById('be-abc')).rejects.toThrow(
        'Failed to fetch issue: 500',
      );
    });

    it('throws error on invalid response format', async () => {
      // GIVEN
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      });

      // WHEN/THEN
      await expect(apiSource.fetchById('be-abc')).rejects.toThrow(
        'Invalid response format',
      );
    });
  });
});
