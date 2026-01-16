import 'reflect-metadata';
import { container } from 'tsyringe';
import { DI_TOKENS } from './tokens';
import { IssueRepositoryImpl } from '@data/repositories/IssueRepositoryImpl';
import { IssueApiSource } from '@data/sources/api/IssueApiSource';
import { ProjectRepositoryImpl } from '@data/repositories/ProjectRepositoryImpl';
import { ProjectApiSource } from '@data/sources/api/ProjectApiSource';
import { ListIssuesUseCase } from '@domain/usecases/ListIssuesUseCase';
import { GetIssueUseCase } from '@domain/usecases/GetIssueUseCase';

/**
 * Frontend DI container instance.
 *
 * Usage:
 * - Register implementations in this file
 * - Use @injectable() on classes
 * - Use @inject(TOKEN) for constructor injection
 * - Use useInject() hook in React components
 */

// Data source registrations
container.register(IssueApiSource, { useClass: IssueApiSource });
container.register(ProjectApiSource, { useClass: ProjectApiSource });

// Repository registrations
container.register(DI_TOKENS.IssueRepository, { useClass: IssueRepositoryImpl });
container.register(DI_TOKENS.ProjectRepository, { useClass: ProjectRepositoryImpl });

// Use case registrations
container.register(ListIssuesUseCase, { useClass: ListIssuesUseCase });
container.register(GetIssueUseCase, { useClass: GetIssueUseCase });

export { container };
