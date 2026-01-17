import {
  IssueId,
  LabelId,
  type Issue,
  type IssueDependency,
  type IssueDto,
  type IssueDependencyDto,
} from '@bealin/shared';

/**
 * Maps IssueDto (API response) to Issue domain model.
 */
export class IssueMapper {
  /**
   * Convert DTO to domain model.
   * @param dto - Issue DTO from API
   * @returns Issue domain entity
   */
  static toDomain(dto: IssueDto): Issue {
    return {
      id: new IssueId(dto.id),
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      type: dto.type,
      labels: dto.labels.map((labelId) => new LabelId(labelId)),
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      blocks: (dto.blocks ?? []).map(IssueMapper.dependencyToDomain),
      blockedBy: (dto.blockedBy ?? []).map(IssueMapper.dependencyToDomain),
    };
  }

  /**
   * Convert dependency DTO to domain model.
   * @param dto - Dependency DTO from API
   * @returns IssueDependency domain entity
   */
  static dependencyToDomain(dto: IssueDependencyDto): IssueDependency {
    return {
      id: new IssueId(dto.id),
      title: dto.title,
      status: dto.status,
      type: dto.type,
    };
  }

  /**
   * Convert array of DTOs to domain models.
   * @param dtos - Array of Issue DTOs
   * @returns Array of Issue domain entities
   */
  static toDomainList(dtos: IssueDto[]): Issue[] {
    return dtos.map(IssueMapper.toDomain);
  }
}
