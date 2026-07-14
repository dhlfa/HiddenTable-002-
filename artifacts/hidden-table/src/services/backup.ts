const PREFIX = 'the-hidden-table:';
const BACKUP_VERSION = 1;

interface BackupPayload {
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function exportBackup(): string {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) data[key] = JSON.parse(raw);
    } catch {
      /* skip unreadable entries */
    }
  }
  const payload: BackupPayload = { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
  return JSON.stringify(payload, null, 2);
}

export function downloadBackup(): void {
  const json = exportBackup();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hidden-table-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function getLastBackupDate(): string | null {
  try {
    return localStorage.getItem(`${PREFIX}last-backup-date`);
  } catch {
    return null;
  }
}

export function markBackupDone(): void {
  try {
    localStorage.setItem(`${PREFIX}last-backup-date`, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export async function importBackup(file: File): Promise<{ restoredKeys: number }> {
  const text = await file.text();
  let parsed: BackupPayload;
  try {
    parsed = JSON.parse(text) as BackupPayload;
  } catch {
    throw new Error('File cadangan tidak valid atau rusak.');
  }
  if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
    throw new Error('Struktur file cadangan tidak dikenali.');
  }
  let restoredKeys = 0;
  for (const [key, value] of Object.entries(parsed.data)) {
    if (!key.startsWith(PREFIX)) continue;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      restoredKeys += 1;
    } catch {
      /* skip */
    }
  }
  return { restoredKeys };
}
