import 'reflect-metadata';
import { container } from 'tsyringe';
import { DI_TOKENS } from './tokens';
import { IssueRepositoryImpl } from '@data/repositories/IssueRepositoryImpl';

/**
 * Frontend DI container instance.
 *
 * Usage:
 * - Register implementations in this file
 * - Use @injectable() on classes
 * - Use @inject(TOKEN) for constructor injection
 * - Use useInject() hook in React components
 */

// Repository registrations
container.register(DI_TOKENS.IssueRepository, { useClass: IssueRepositoryImpl });

export { container };
