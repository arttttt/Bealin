/**
 * Project entity representing a beads project in the app config.
 */
export interface Project {
  /** Unique project identifier (UUID) */
  id: string;
  /** Display name (extracted from path or user-defined) */
  name: string;
  /** Absolute path to PROJECT folder (NOT .beads folder) */
  path: string;
  /** ISO timestamp when project was added */
  addedAt: string;
}

/**
 * Application configuration stored in ~/.bealin/config.json.
 */
export interface AppConfig {
  /** List of registered projects */
  projects: Project[];
  /** Currently active project ID, or null if none selected */
  activeProjectId: string | null;
}
