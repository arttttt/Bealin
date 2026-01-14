import 'reflect-metadata';
import { container } from 'tsyringe';

/**
 * Backend DI container instance.
 *
 * Usage:
 * - Register implementations in this file
 * - Use @injectable() on classes
 * - Use @inject(TOKEN) for constructor injection
 *
 * Example:
 *   container.register(DI_TOKENS.IssueRepository, { useClass: IssueRepositoryImpl });
 */

// Repository registrations will be added here as implementations are created
// Example:
// import { DI_TOKENS } from './tokens';
// import { IssueRepositoryImpl } from '@data/repositories/IssueRepositoryImpl';
// container.register(DI_TOKENS.IssueRepository, { useClass: IssueRepositoryImpl });

export { container };
