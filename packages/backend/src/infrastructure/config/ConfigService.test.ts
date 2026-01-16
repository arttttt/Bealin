import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from './ConfigService.js';
import type { ConfigRepository } from '../../domain/repositories/ConfigRepository.js';
import type { AppConfig, Project } from '../../domain/entities/AppConfig.js';
import { existsSync } from 'node:fs';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

function createMockConfigRepository(): ConfigRepository {
  return {
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
    getConfigPath: vi.fn().mockReturnValue('/home/user/.bealin/config.json'),
  };
}

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'test-uuid-123',
    name: 'test-project',
    path: '/home/user/projects/test-project',
    addedAt: '2026-01-16T10:00:00.000Z',
    ...overrides,
  };
}

function createMockConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    projects: [],
    activeProjectId: null,
    ...overrides,
  };
}

describe('ConfigService', () => {
  let service: ConfigService;
  let mockRepo: ConfigRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = createMockConfigRepository();
    service = new ConfigService(mockRepo);
  });

  describe('getProjects', () => {
    it('returns projects from repository', async () => {
      // GIVEN
      const projects = [createMockProject({ id: 'p1' }), createMockProject({ id: 'p2' })];
      vi.mocked(mockRepo.getConfig).mockResolvedValue(createMockConfig({ projects }));

      // WHEN
      const result = await service.getProjects();

      // THEN
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('p1');
      expect(result[1]?.id).toBe('p2');
    });

    it('returns empty array when no projects', async () => {
      // GIVEN
      vi.mocked(mockRepo.getConfig).mockResolvedValue(createMockConfig());

      // WHEN
      const result = await service.getProjects();

      // THEN
      expect(result).toEqual([]);
    });
  });

  describe('getActiveProject', () => {
    it('returns active project when set', async () => {
      // GIVEN
      const projects = [createMockProject({ id: 'p1' }), createMockProject({ id: 'p2' })];
      vi.mocked(mockRepo.getConfig).mockResolvedValue(
        createMockConfig({ projects, activeProjectId: 'p2' }),
      );

      // WHEN
      const result = await service.getActiveProject();

      // THEN
      expect(result).not.toBeNull();
      expect(result?.id).toBe('p2');
    });

    it('returns null when no active project', async () => {
      // GIVEN
      vi.mocked(mockRepo.getConfig).mockResolvedValue(createMockConfig());

      // WHEN
      const result = await service.getActiveProject();

      // THEN
      expect(result).toBeNull();
    });

    it('returns null when activeProjectId does not match any project', async () => {
      // GIVEN
      const projects = [createMockProject({ id: 'p1' })];
      vi.mocked(mockRepo.getConfig).mockResolvedValue(
        createMockConfig({ projects, activeProjectId: 'nonexistent' }),
      );

      // WHEN
      const result = await service.getActiveProject();

      // THEN
      expect(result).toBeNull();
    });
  });

  describe('getBeadsPath', () => {
    it('returns correct .beads path for project', () => {
      // GIVEN
      const project = createMockProject({ path: '/home/user/myproject' });

      // WHEN
      const result = service.getBeadsPath(project);

      // THEN
      expect(result).toBe('/home/user/myproject/.beads');
    });
  });

  describe('getIssuesPath', () => {
    it('returns correct issues.jsonl path for project', () => {
      // GIVEN
      const project = createMockProject({ path: '/home/user/myproject' });

      // WHEN
      const result = service.getIssuesPath(project);

      // THEN
      expect(result).toBe('/home/user/myproject/.beads/issues.jsonl');
    });
  });

  describe('addProject', () => {
    it('adds valid project and sets as active if first', async () => {
      // GIVEN
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(mockRepo.getConfig).mockResolvedValue(createMockConfig());
      vi.mocked(mockRepo.saveConfig).mockResolvedValue(undefined);

      // WHEN
      const result = await service.addProject('/home/user/newproject');

      // THEN
      expect(result.path).toBe('/home/user/newproject');
      expect(result.name).toBe('newproject');
      expect(result.id).toBeDefined();
      expect(result.addedAt).toBeDefined();

      expect(mockRepo.saveConfig).toHaveBeenCalledOnce();
      const savedConfig = vi.mocked(mockRepo.saveConfig).mock.calls[0]?.[0];
      expect(savedConfig?.projects).toHaveLength(1);
      expect(savedConfig?.activeProjectId).toBe(result.id);
    });

    it('uses provided name instead of extracting from path', async () => {
      // GIVEN
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(mockRepo.getConfig).mockResolvedValue(createMockConfig());
      vi.mocked(mockRepo.saveConfig).mockResolvedValue(undefined);

      // WHEN
      const result = await service.addProject('/home/user/newproject', 'My Custom Name');

      // THEN
      expect(result.name).toBe('My Custom Name');
    });

    it('does not change activeProjectId if already set', async () => {
      // GIVEN
      const existingProject = createMockProject({ id: 'existing' });
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(mockRepo.getConfig).mockResolvedValue(
        createMockConfig({ projects: [existingProject], activeProjectId: 'existing' }),
      );
      vi.mocked(mockRepo.saveConfig).mockResolvedValue(undefined);

      // WHEN
      await service.addProject('/home/user/newproject');

      // THEN
      const savedConfig = vi.mocked(mockRepo.saveConfig).mock.calls[0]?.[0];
      expect(savedConfig?.activeProjectId).toBe('existing');
    });

    it('throws when issues.jsonl does not exist', async () => {
      // GIVEN
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mockRepo.getConfig).mockResolvedValue(createMockConfig());

      // WHEN/THEN
      await expect(service.addProject('/home/user/invalid')).rejects.toThrow(
        'Invalid project: .beads/issues.jsonl not found',
      );
    });

    it('throws when project already exists', async () => {
      // GIVEN
      const existingProject = createMockProject({ path: '/home/user/existing' });
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(mockRepo.getConfig).mockResolvedValue(
        createMockConfig({ projects: [existingProject] }),
      );

      // WHEN/THEN
      await expect(service.addProject('/home/user/existing')).rejects.toThrow(
        'Project already exists',
      );
    });
  });

  describe('removeProject', () => {
    it('removes project from config', async () => {
      // GIVEN
      const projects = [createMockProject({ id: 'p1' }), createMockProject({ id: 'p2' })];
      vi.mocked(mockRepo.getConfig).mockResolvedValue(
        createMockConfig({ projects, activeProjectId: 'p1' }),
      );
      vi.mocked(mockRepo.saveConfig).mockResolvedValue(undefined);

      // WHEN
      await service.removeProject('p2');

      // THEN
      const savedConfig = vi.mocked(mockRepo.saveConfig).mock.calls[0]?.[0];
      expect(savedConfig?.projects).toHaveLength(1);
      expect(savedConfig?.projects[0]?.id).toBe('p1');
    });

    it('updates activeProjectId when removing active project', async () => {
      // GIVEN
      const projects = [createMockProject({ id: 'p1' }), createMockProject({ id: 'p2' })];
      vi.mocked(mockRepo.getConfig).mockResolvedValue(
        createMockConfig({ projects, activeProjectId: 'p1' }),
      );
      vi.mocked(mockRepo.saveConfig).mockResolvedValue(undefined);

      // WHEN
      await service.removeProject('p1');

      // THEN
      const savedConfig = vi.mocked(mockRepo.saveConfig).mock.calls[0]?.[0];
      expect(savedConfig?.activeProjectId).toBe('p2');
    });

    it('sets activeProjectId to null when removing last project', async () => {
      // GIVEN
      const projects = [createMockProject({ id: 'p1' })];
      vi.mocked(mockRepo.getConfig).mockResolvedValue(
        createMockConfig({ projects, activeProjectId: 'p1' }),
      );
      vi.mocked(mockRepo.saveConfig).mockResolvedValue(undefined);

      // WHEN
      await service.removeProject('p1');

      // THEN
      const savedConfig = vi.mocked(mockRepo.saveConfig).mock.calls[0]?.[0];
      expect(savedConfig?.activeProjectId).toBeNull();
    });
  });

  describe('setActiveProject', () => {
    it('sets active project when found', async () => {
      // GIVEN
      const projects = [createMockProject({ id: 'p1' }), createMockProject({ id: 'p2' })];
      vi.mocked(mockRepo.getConfig).mockResolvedValue(
        createMockConfig({ projects, activeProjectId: 'p1' }),
      );
      vi.mocked(mockRepo.saveConfig).mockResolvedValue(undefined);

      // WHEN
      await service.setActiveProject('p2');

      // THEN
      const savedConfig = vi.mocked(mockRepo.saveConfig).mock.calls[0]?.[0];
      expect(savedConfig?.activeProjectId).toBe('p2');
    });

    it('throws when project not found', async () => {
      // GIVEN
      vi.mocked(mockRepo.getConfig).mockResolvedValue(createMockConfig());

      // WHEN/THEN
      await expect(service.setActiveProject('nonexistent')).rejects.toThrow('Project not found');
    });
  });

  describe('validatePath', () => {
    it('validates project path (without .beads suffix)', () => {
      // GIVEN - path is /home/user/myproject, issues at /home/user/myproject/.beads/issues.jsonl
      vi.mocked(existsSync).mockImplementation((p) => {
        return p === '/home/user/myproject/.beads/issues.jsonl';
      });

      // WHEN
      const result = service.validatePath('/home/user/myproject');

      // THEN
      expect(result.valid).toBe(true);
      expect(result.suggestedName).toBe('myproject');
    });

    it('validates .beads path (with .beads suffix)', () => {
      // GIVEN - path is /home/user/myproject/.beads
      vi.mocked(existsSync).mockImplementation((p) => {
        return p === '/home/user/myproject/.beads/issues.jsonl';
      });

      // WHEN
      const result = service.validatePath('/home/user/myproject/.beads');

      // THEN
      expect(result.valid).toBe(true);
      expect(result.suggestedName).toBe('myproject');
    });

    it('returns invalid for path without issues.jsonl', () => {
      // GIVEN
      vi.mocked(existsSync).mockReturnValue(false);

      // WHEN
      const result = service.validatePath('/home/user/invalid');

      // THEN
      expect(result.valid).toBe(false);
      expect(result.suggestedName).toBe('invalid');
    });
  });
});
