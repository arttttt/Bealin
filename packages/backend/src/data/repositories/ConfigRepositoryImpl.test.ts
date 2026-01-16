import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigRepositoryImpl } from './ConfigRepositoryImpl.js';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('node:os', () => ({
  homedir: vi.fn().mockReturnValue('/home/testuser'),
}));

describe('ConfigRepositoryImpl', () => {
  let repository: ConfigRepositoryImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ConfigRepositoryImpl();
  });

  describe('getConfigPath', () => {
    it('returns path in user home directory', () => {
      // WHEN
      const result = repository.getConfigPath();

      // THEN
      expect(result).toBe('/home/testuser/.bealin/config.json');
    });
  });

  describe('getConfig', () => {
    it('returns default config when file does not exist', async () => {
      // GIVEN
      vi.mocked(existsSync).mockReturnValue(false);

      // WHEN
      const result = await repository.getConfig();

      // THEN
      expect(result).toEqual({ projects: [], activeProjectId: null });
      expect(readFile).not.toHaveBeenCalled();
    });

    it('reads and parses config from file', async () => {
      // GIVEN
      const configContent = JSON.stringify({
        projects: [{ id: 'p1', name: 'Project 1', path: '/path', addedAt: '2026-01-16T10:00:00Z' }],
        activeProjectId: 'p1',
      });
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(configContent);

      // WHEN
      const result = await repository.getConfig();

      // THEN
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0]?.id).toBe('p1');
      expect(result.activeProjectId).toBe('p1');
      expect(readFile).toHaveBeenCalledWith('/home/testuser/.bealin/config.json', 'utf-8');
    });
  });

  describe('saveConfig', () => {
    it('creates directory if it does not exist', async () => {
      // GIVEN
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const config = { projects: [], activeProjectId: null };

      // WHEN
      await repository.saveConfig(config);

      // THEN
      expect(mkdir).toHaveBeenCalledWith('/home/testuser/.bealin', { recursive: true });
    });

    it('does not create directory if it exists', async () => {
      // GIVEN
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const config = { projects: [], activeProjectId: null };

      // WHEN
      await repository.saveConfig(config);

      // THEN
      expect(mkdir).not.toHaveBeenCalled();
    });

    it('writes formatted JSON to file', async () => {
      // GIVEN
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      const config = {
        projects: [{ id: 'p1', name: 'Test', path: '/test', addedAt: '2026-01-16T10:00:00Z' }],
        activeProjectId: 'p1',
      };

      // WHEN
      await repository.saveConfig(config);

      // THEN
      expect(writeFile).toHaveBeenCalledWith(
        '/home/testuser/.bealin/config.json',
        JSON.stringify(config, null, 2),
      );
    });
  });
});
