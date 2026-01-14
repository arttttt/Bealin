import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { Issue, IssueId } from '@bealin/shared';
import type { IssueRepository } from '../repositories/IssueRepository.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';

@injectable()
export class GetIssueUseCase {
  constructor(
    @inject(DI_TOKENS.IssueRepository)
    private readonly issueRepository: IssueRepository,
  ) {}

  async execute(id: IssueId): Promise<Issue | null> {
    return this.issueRepository.findById(id);
  }
}
