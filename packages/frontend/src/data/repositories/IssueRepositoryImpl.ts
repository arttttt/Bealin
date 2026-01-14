import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { Issue, IssueId } from '@bealin/shared';
import type { IssueRepository } from '@domain/repositories/IssueRepository';
import { IssueApiSource } from '../sources/api/IssueApiSource';
import { IssueMapper } from './IssueMapper';

/**
 * Repository implementation for Issue aggregate.
 * Uses API source for data fetching.
 */
@injectable()
export class IssueRepositoryImpl implements IssueRepository {
  constructor(
    @inject(IssueApiSource)
    private readonly apiSource: IssueApiSource,
  ) {}

  /**
   * Find all issues.
   * @returns Promise resolving to array of issues
   */
  async findAll(): Promise<Issue[]> {
    const dtos = await this.apiSource.fetchAll();
    return IssueMapper.toDomainList(dtos);
  }

  /**
   * Find issue by ID.
   * @param id - Issue ID to search for
   * @returns Promise resolving to issue or null if not found
   */
  async findById(id: IssueId): Promise<Issue | null> {
    const dto = await this.apiSource.fetchById(id.value);

    if (!dto) {
      return null;
    }

    return IssueMapper.toDomain(dto);
  }
}
