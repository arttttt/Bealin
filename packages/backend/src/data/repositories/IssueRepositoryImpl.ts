import { inject, injectable } from 'tsyringe';
import type { Issue, IssueStatus, IssuePriority } from '@bealin/shared';
import { IssueId } from '@bealin/shared';
import type { IssueRepository } from '../../domain/repositories/IssueRepository.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';
import { JsonlSource } from '../sources/filesystem/JsonlSource.js';
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

  async findAll(): Promise<Issue[]> {
    const issuesFilePath = await this.getIssuesFilePath();
    const rawIssues = await this.jsonlSource.readAll<RawIssue>(issuesFilePath);
    return rawIssues.map((raw) => this.mapToIssue(raw));
  }

  async findById(id: IssueId): Promise<Issue | null> {
    const issuesFilePath = await this.getIssuesFilePath();
    const rawIssues = await this.jsonlSource.readAll<RawIssue>(issuesFilePath);
    const issues = rawIssues.map((raw) => this.mapToIssue(raw));
    return issues.find((issue) => issue.id.equals(id)) ?? null;
  }

  private mapToIssue(raw: RawIssue): Issue {
    return {
      id: new IssueId(raw.id),
      title: raw.title,
      description: raw.description ?? '',
      status: this.mapStatus(raw.status),
      priority: this.mapPriority(raw.priority),
      labels: [],
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
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
}
