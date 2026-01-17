/**
 * DI injection tokens for backend services.
 * Use these tokens with @inject() decorator.
 */
export const DI_TOKENS = {
  // Data Sources
  JsonlSource: 'JsonlSource',
  SqliteSource: 'SqliteSource',
  FileDialogSource: 'FileDialogSource',

  // Repositories
  IssueRepository: 'IssueRepository',
  LabelRepository: 'LabelRepository',
  ProjectRepository: 'ProjectRepository',
  ConfigRepository: 'ConfigRepository',

  // Use Cases - Issues
  ListIssuesUseCase: 'ListIssuesUseCase',
  GetIssueUseCase: 'GetIssueUseCase',

  // Use Cases - Projects
  GetProjectsUseCase: 'GetProjectsUseCase',
  GetActiveProjectUseCase: 'GetActiveProjectUseCase',
  AddProjectUseCase: 'AddProjectUseCase',
  RemoveProjectUseCase: 'RemoveProjectUseCase',
  SetActiveProjectUseCase: 'SetActiveProjectUseCase',
  ValidateProjectPathUseCase: 'ValidateProjectPathUseCase',
  BrowseFolderUseCase: 'BrowseFolderUseCase',

  // Services
  ConfigService: 'ConfigService',
} as const;

export type DIToken = (typeof DI_TOKENS)[keyof typeof DI_TOKENS];
