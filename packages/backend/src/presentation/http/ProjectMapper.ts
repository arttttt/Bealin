import type { Project } from '../../domain/entities/AppConfig.js';

/**
 * DTO representing a project in API responses.
 * Note: path points to .beads folder, not project folder.
 */
export interface ProjectDto {
  id: string;
  name: string;
  path: string; // .beads folder path
  addedAt: string;
}

/**
 * Mapper for converting between domain Project and API DTOs.
 */
export class ProjectMapper {
  /**
   * Convert domain Project to API DTO.
   * Transforms project path to .beads path.
   */
  static toDto(project: Project): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      path: `${project.path}/.beads`,
      addedAt: project.addedAt,
    };
  }

  /**
   * Convert list of domain Projects to API DTOs.
   */
  static toDtoList(projects: Project[]): ProjectDto[] {
    return projects.map(ProjectMapper.toDto);
  }

  /**
   * Convert .beads path from API request to project path.
   * Strips the /.beads suffix if present.
   */
  static beadsPathToProjectPath(beadsPath: string): string {
    return beadsPath.replace(/\/.beads\/?$/, '');
  }
}
