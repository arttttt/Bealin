import { inject, injectable } from 'tsyringe';
import type { Issue, IssueDependency, IssueStatus, IssuePriority, IssueType } from '@bealin/shared';
import { IssueId } from '@bealin/shared';
import type { IssueRepository } from '../../domain/repositories/IssueRepository.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';
import { JsonlSource } from '../sources/filesystem/JsonlSource.js';
import { SqliteSource } from '../sources/sqlite/SqliteSource.js';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';
import { NoActiveProjectError } from '../../domain/errors/NoActiveProjectError.js';

/**
 * Raw issue record from beads JSONL file.
 */
interface RawIssue {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  issue_type?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  close_reason?: string;
}

/**
 * Repository implementation for Issue using filesystem (JSONL) storage.
 */
@injectable()
export class IssueRepositoryImpl implements IssueRepository {
  constructor(
    @inject(DI_TOKENS.JsonlSource) private readonly jsonlSource: JsonlSource,
    @inject(DI_TOKENS.SqliteSource) private readonly sqliteSource: SqliteSource,
    @inject(DI_TOKENS.ConfigService) private readonly configService: ConfigService,
  ) {}

  /**
   * Get the issues file path from the active project.
   * @throws NoActiveProjectError if no project is selected
   */
  private async getIssuesFilePath(): Promise<string> {
    const activeProject = await this.configService.getActiveProject();
    if (!activeProject) {
      throw new NoActiveProjectError('No active project selected');
    }
    return this.configService.getIssuesPath(activeProject);
  }

  /**
   * Get the database path from the active project.
   * @throws NoActiveProjectError if no project is selected
   */
  private async getDatabasePath(): Promise<string> {
    const activeProject = await this.configService.getActiveProject();
    if (!activeProject) {
      throw new NoActiveProjectError('No active project selected');
    }
    return this.configService.getDatabasePath(activeProject);
  }

  async findAll(): Promise<Issue[]> {
    const issuesFilePath = await this.getIssuesFilePath();
    const rawIssues = await this.jsonlSource.readAll<RawIssue>(issuesFilePath);

    // Build a map for quick lookup
    const issueMap = new Map<string, RawIssue>();
    for (const raw of rawIssues) {
      issueMap.set(raw.id, raw);
    }

    // Get all dependencies at once
    const dbPath = await this.getDatabasePath();
    const issueIds = rawIssues.map((r) => r.id);
    const allDeps = this.sqliteSource.getAllDependencies(dbPath, issueIds);

    // Map issues with dependencies
    return rawIssues.map((raw) => {
      const deps = allDeps.get(raw.id) ?? { blockedBy: [], blocks: [] };
      return this.mapToIssue(raw, deps, issueMap);
    });
  }

  async findById(id: IssueId): Promise<Issue | null> {
    const issuesFilePath = await this.getIssuesFilePath();
    const rawIssues = await this.jsonlSource.readAll<RawIssue>(issuesFilePath);

    const raw = rawIssues.find((r) => r.id === id.value);
    if (!raw) {
      return null;
    }

    // Build a map for quick lookup
    const issueMap = new Map<string, RawIssue>();
    for (const r of rawIssues) {
      issueMap.set(r.id, r);
    }

    // Get dependencies for this issue
    const dbPath = await this.getDatabasePath();
    const blockedBy = this.sqliteSource.getBlockedBy(dbPath, id.value);
    const blocks = this.sqliteSource.getBlocks(dbPath, id.value);

    return this.mapToIssue(raw, { blockedBy, blocks }, issueMap);
  }

  private mapToIssue(
    raw: RawIssue,
    deps: { blockedBy: string[]; blocks: string[] },
    issueMap: Map<string, RawIssue>,
  ): Issue {
    return {
      id: new IssueId(raw.id),
      title: raw.title,
      description: raw.description ?? '',
      status: this.mapStatus(raw.status),
      priority: this.mapPriority(raw.priority),
      type: this.mapType(raw.issue_type),
      labels: [],
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
      blocks: this.mapDependencies(deps.blocks, issueMap),
      blockedBy: this.mapDependencies(deps.blockedBy, issueMap),
    };
  }

  private mapDependencies(
    depIds: string[],
    issueMap: Map<string, RawIssue>,
  ): IssueDependency[] {
    return depIds
      .map((depId) => {
        const raw = issueMap.get(depId);
        if (!raw) {
          return null;
        }
        return {
          id: new IssueId(raw.id),
          title: raw.title,
          status: this.mapStatus(raw.status),
          type: this.mapType(raw.issue_type),
        };
      })
      .filter((dep): dep is IssueDependency => dep !== null);
  }

  private mapStatus(rawStatus: string): IssueStatus {
    switch (rawStatus) {
      case 'open':
        return 'todo';
      case 'in_progress':
        return 'in_progress';
      case 'closed':
        return 'done';
      default:
        return 'backlog';
    }
  }

  private mapPriority(rawPriority: number): IssuePriority {
    switch (rawPriority) {
      case 1:
        return 'urgent';
      case 2:
        return 'high';
      case 3:
        return 'medium';
      case 4:
        return 'low';
      default:
        return 'none';
    }
  }

  private mapType(rawType?: string): IssueType {
    switch (rawType) {
      case 'bug':
        return 'bug';
      case 'feature':
        return 'feature';
      case 'epic':
        return 'epic';
      case 'chore':
        return 'chore';
      case 'task':
      default:
        return 'task';
    }
  }
}
