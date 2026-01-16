import { ProjectId } from '@bealin/shared';

/**
 * Frontend Project entity representing a beads project.
 * Contains computed isActive field for UI convenience.
 */
export interface Project {
  readonly id: ProjectId;
  readonly name: string;
  readonly path: string;
  readonly addedAt: Date;
  readonly isActive: boolean;
}
