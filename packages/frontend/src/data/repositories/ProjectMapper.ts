import { ProjectId } from '@bealin/shared';
import type { Project } from '@domain/entities/Project';
import type { ProjectApiDto } from '../sources/api/ProjectApiSource';

/**
 * Maps ProjectApiDto to Project domain model.
 */
export class ProjectMapper {
  /**
   * Convert DTO to domain model.
   * @param dto - Project DTO from API
   * @param isActive - Whether this project is active
   * @returns Project domain entity
   */
  static toDomain(dto: ProjectApiDto, isActive: boolean): Project {
    return {
      id: new ProjectId(dto.id),
      name: dto.name,
      path: dto.path,
      addedAt: new Date(dto.addedAt),
      isActive,
    };
  }

  /**
   * Convert array of DTOs to domain models with isActive computed.
   * @param dtos - Array of Project DTOs
   * @param activeProjectId - ID of the active project (or null)
   * @returns Array of Project domain entities
   */
  static toDomainList(dtos: ProjectApiDto[], activeProjectId: string | null): Project[] {
    return dtos.map((dto) =>
      ProjectMapper.toDomain(dto, dto.id === activeProjectId),
    );
  }
}
