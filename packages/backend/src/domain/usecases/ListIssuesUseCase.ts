import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { Issue } from '@bealin/shared';
import type { IssueRepository } from '../repositories/IssueRepository.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';

@injectable()
export class ListIssuesUseCase {
  constructor(
    @inject(DI_TOKENS.IssueRepository)
    private readonly issueRepository: IssueRepository,
  ) {}

  async execute(): Promise<Issue[]> {
    return this.issueRepository.findAll();
  }
}
