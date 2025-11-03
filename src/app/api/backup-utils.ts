import fs from "fs";
import path from "path";

/**
 * Creates a backup of a file before writing new data
 * @param filePath Path to the file to backup
 * @returns Path to the backup file, or null if backup failed
 */
export function createBackup(filePath: string): string | null {
  try {
    // Only backup if file exists and has content
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    if (stats.size < 10) {
      // File is too small to be valid data (likely empty)
      return null;
    }

    const backupsDir = path.join(process.cwd(), "data", "backups");
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupsDir, `${fileName}.${timestamp}.backup`);

    // Copy file to backup location
    fs.copyFileSync(filePath, backupPath);

    // Keep only the last 10 backups (cleanup old ones)
    const backups = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith(fileName) && f.endsWith(".backup"))
      .map(f => ({
        name: f,
        path: path.join(backupsDir, f),
        time: fs.statSync(path.join(backupsDir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // Delete backups beyond the 10 most recent
    if (backups.length > 10) {
      for (const backup of backups.slice(10)) {
        try {
          fs.unlinkSync(backup.path);
        } catch (e) {
          console.warn(`Failed to delete old backup ${backup.path}:`, e);
        }
      }
    }

    return backupPath;
  } catch (error) {
    console.error(`Failed to create backup for ${filePath}:`, error);
    return null;
  }
}

/**
 * Safely writes data to a file with backup
 * @param filePath Path to write to
 * @param data Data to write (will be JSON stringified)
 * @param createBackupFile Whether to create a backup first
 * @returns Object with success status and backup path
 */
export function safeWriteFile(
  filePath: string,
  data: any,
  createBackupFile: boolean = true
): { success: boolean; backupPath: string | null; error?: string } {
  try {
    let backupPath: string | null = null;

    if (createBackupFile) {
      backupPath = createBackup(filePath);
    }

    // Write atomically: write to temp file first, then rename
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);

    return { success: true, backupPath };
  } catch (error: any) {
    return {
      success: false,
      backupPath: null,
      error: error.message || "Unknown error",
    };
  }
}

