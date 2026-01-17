import { injectable } from 'tsyringe';
import Database from 'better-sqlite3';

/**
 * Raw dependency record from SQLite.
 */
export interface RawDependency {
  issue_id: string;
  depends_on_id: string;
  type: string;
}

/**
 * Source for reading data from beads SQLite database.
 */
@injectable()
export class SqliteSource {
  /**
   * Get all dependencies for an issue (issues that this issue depends on / is blocked by).
   * @param dbPath - Path to beads.db
   * @param issueId - The issue ID to get dependencies for
   * @returns Array of issue IDs that block this issue
   */
  getBlockedBy(dbPath: string, issueId: string): string[] {
    try {
      const db = new Database(dbPath, { readonly: true });
      const stmt = db.prepare(
        'SELECT depends_on_id FROM dependencies WHERE issue_id = ? AND type = ?',
      );
      const rows = stmt.all(issueId, 'blocks') as { depends_on_id: string }[];
      db.close();
      return rows.map((r) => r.depends_on_id);
    } catch {
      // Database might not exist or be locked
      return [];
    }
  }

  /**
   * Get all issues that depend on this issue (issues that this issue blocks).
   * @param dbPath - Path to beads.db
   * @param issueId - The issue ID to get dependents for
   * @returns Array of issue IDs that are blocked by this issue
   */
  getBlocks(dbPath: string, issueId: string): string[] {
    try {
      const db = new Database(dbPath, { readonly: true });
      const stmt = db.prepare(
        'SELECT issue_id FROM dependencies WHERE depends_on_id = ? AND type = ?',
      );
      const rows = stmt.all(issueId, 'blocks') as { issue_id: string }[];
      db.close();
      return rows.map((r) => r.issue_id);
    } catch {
      // Database might not exist or be locked
      return [];
    }
  }

  /**
   * Get all dependencies for multiple issues at once (batch operation).
   * @param dbPath - Path to beads.db
   * @param issueIds - Array of issue IDs
   * @returns Map of issue ID to { blockedBy, blocks } arrays
   */
  getAllDependencies(
    dbPath: string,
    issueIds: string[],
  ): Map<string, { blockedBy: string[]; blocks: string[] }> {
    const result = new Map<string, { blockedBy: string[]; blocks: string[] }>();

    // Initialize all issues with empty arrays
    for (const id of issueIds) {
      result.set(id, { blockedBy: [], blocks: [] });
    }

    if (issueIds.length === 0) {
      return result;
    }

    try {
      const db = new Database(dbPath, { readonly: true });

      // Get all blockedBy relationships
      const placeholders = issueIds.map(() => '?').join(',');
      const blockedByStmt = db.prepare(
        `SELECT issue_id, depends_on_id FROM dependencies WHERE issue_id IN (${placeholders}) AND type = 'blocks'`,
      );
      const blockedByRows = blockedByStmt.all(...issueIds) as RawDependency[];

      for (const row of blockedByRows) {
        const entry = result.get(row.issue_id);
        if (entry) {
          entry.blockedBy.push(row.depends_on_id);
        }
      }

      // Get all blocks relationships
      const blocksStmt = db.prepare(
        `SELECT issue_id, depends_on_id FROM dependencies WHERE depends_on_id IN (${placeholders}) AND type = 'blocks'`,
      );
      const blocksRows = blocksStmt.all(...issueIds) as RawDependency[];

      for (const row of blocksRows) {
        const entry = result.get(row.depends_on_id);
        if (entry) {
          entry.blocks.push(row.issue_id);
        }
      }

      db.close();
    } catch {
      // Database might not exist or be locked
    }

    return result;
  }
}
