import { IssueId, LabelId, type Issue, type IssueDto } from '@bealin/shared';

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
      labels: dto.labels.map((labelId) => new LabelId(labelId)),
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
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
