/**
 * DI injection tokens for frontend services.
 * Use these tokens with @inject() decorator.
 */
export const DI_TOKENS = {
  // Repositories
  IssueRepository: 'IssueRepository',
  LabelRepository: 'LabelRepository',
  ProjectRepository: 'ProjectRepository',

  // UseCases
  ListIssuesUseCase: 'ListIssuesUseCase',
  GetIssueUseCase: 'GetIssueUseCase',
  CreateIssueUseCase: 'CreateIssueUseCase',
  UpdateIssueUseCase: 'UpdateIssueUseCase',
  DeleteIssueUseCase: 'DeleteIssueUseCase',
} as const;

export type DIToken = (typeof DI_TOKENS)[keyof typeof DI_TOKENS];
