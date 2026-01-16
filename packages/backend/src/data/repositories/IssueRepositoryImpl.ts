import { inject, injectable } from 'tsyringe';
import { resolve } from 'node:path';
import type { Issue, IssueStatus, IssuePriority } from '@bealin/shared';
import { IssueId } from '@bealin/shared';
import type { IssueRepository } from '../../domain/repositories/IssueRepository.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';
import { JsonlSource } from '../sources/filesystem/JsonlSource.js';

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
  private readonly issuesFilePath: string;

  constructor(
    @inject(DI_TOKENS.JsonlSource) private readonly jsonlSource: JsonlSource,
  ) {
    const beadsPath = process.env['BEADS_PATH'] || resolve(process.cwd(), '..', '.beads');
    this.issuesFilePath = resolve(beadsPath, 'issues.jsonl');
  }

  async findAll(): Promise<Issue[]> {
    const rawIssues = await this.jsonlSource.readAll<RawIssue>(this.issuesFilePath);
    return rawIssues.map((raw) => this.mapToIssue(raw));
  }

  async findById(id: IssueId): Promise<Issue | null> {
    const issues = await this.findAll();
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
