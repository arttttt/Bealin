import type { Issue, IssueDependency, IssueDto, IssueDependencyDto } from '@bealin/shared';

/**
 * Maps Issue domain model to IssueDto for API responses.
 */
export class IssueMapper {
  static toDto(issue: Issue): IssueDto {
    return {
      id: issue.id.value,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      type: issue.type,
      labels: issue.labels.map((label) => label.value),
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      blocks: issue.blocks.map(IssueMapper.dependencyToDto),
      blockedBy: issue.blockedBy.map(IssueMapper.dependencyToDto),
    };
  }

  static dependencyToDto(dep: IssueDependency): IssueDependencyDto {
    return {
      id: dep.id.value,
      title: dep.title,
      status: dep.status,
      type: dep.type,
    };
  }

  static toDtoList(issues: Issue[]): IssueDto[] {
    return issues.map((issue) => IssueMapper.toDto(issue));
  }
}
