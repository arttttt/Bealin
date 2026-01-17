import 'reflect-metadata';
import { container } from 'tsyringe';
import { DI_TOKENS } from './tokens.js';
import { JsonlSource } from '@data/sources/filesystem/JsonlSource.js';
import { SqliteSource } from '@data/sources/sqlite/SqliteSource.js';
import { FileDialogSource } from '@data/sources/dialog/FileDialogSource.js';
import { IssueRepositoryImpl } from '@data/repositories/IssueRepositoryImpl.js';
import { ConfigRepositoryImpl } from '@data/repositories/ConfigRepositoryImpl.js';
import { ListIssuesUseCase } from '@domain/usecases/ListIssuesUseCase.js';
import { GetIssueUseCase } from '@domain/usecases/GetIssueUseCase.js';
import { GetProjectsUseCase } from '@domain/usecases/GetProjectsUseCase.js';
import { GetActiveProjectUseCase } from '@domain/usecases/GetActiveProjectUseCase.js';
import { AddProjectUseCase } from '@domain/usecases/AddProjectUseCase.js';
import { RemoveProjectUseCase } from '@domain/usecases/RemoveProjectUseCase.js';
import { SetActiveProjectUseCase } from '@domain/usecases/SetActiveProjectUseCase.js';
import { ValidateProjectPathUseCase } from '@domain/usecases/ValidateProjectPathUseCase.js';
import { BrowseFolderUseCase } from '@domain/usecases/BrowseFolderUseCase.js';
import { ConfigService } from '@infrastructure/config/ConfigService.js';
import { IssuesHandler } from '@presentation/http/IssuesHandler.js';
import { ProjectsHandler } from '@presentation/http/ProjectsHandler.js';
import { FileSystemHandler } from '@presentation/http/FileSystemHandler.js';
import { EventsHandler } from '@presentation/http/EventsHandler.js';

/**
 * Backend DI container instance.
 *
 * Usage:
 * - Register implementations in this file
 * - Use @injectable() on classes
 * - Use @inject(TOKEN) for constructor injection
 */

// Data Sources
container.register(DI_TOKENS.JsonlSource, { useClass: JsonlSource });
container.register(DI_TOKENS.SqliteSource, { useClass: SqliteSource });
container.register(DI_TOKENS.FileDialogSource, { useClass: FileDialogSource });

// Repositories
container.register(DI_TOKENS.IssueRepository, { useClass: IssueRepositoryImpl });
container.register(DI_TOKENS.ConfigRepository, { useClass: ConfigRepositoryImpl });

// Use Cases - Issues
container.register(DI_TOKENS.ListIssuesUseCase, { useClass: ListIssuesUseCase });
container.register(DI_TOKENS.GetIssueUseCase, { useClass: GetIssueUseCase });

// Use Cases - Projects
container.register(DI_TOKENS.GetProjectsUseCase, { useClass: GetProjectsUseCase });
container.register(DI_TOKENS.GetActiveProjectUseCase, { useClass: GetActiveProjectUseCase });
container.register(DI_TOKENS.AddProjectUseCase, { useClass: AddProjectUseCase });
container.register(DI_TOKENS.RemoveProjectUseCase, { useClass: RemoveProjectUseCase });
container.register(DI_TOKENS.SetActiveProjectUseCase, { useClass: SetActiveProjectUseCase });
container.register(DI_TOKENS.ValidateProjectPathUseCase, { useClass: ValidateProjectPathUseCase });
container.register(DI_TOKENS.BrowseFolderUseCase, { useClass: BrowseFolderUseCase });

// Services
container.register(DI_TOKENS.ConfigService, { useClass: ConfigService });

// Handlers
container.register(IssuesHandler, { useClass: IssuesHandler });
container.register(ProjectsHandler, { useClass: ProjectsHandler });
container.register(FileSystemHandler, { useClass: FileSystemHandler });
container.register(EventsHandler, { useClass: EventsHandler });

export { container };
