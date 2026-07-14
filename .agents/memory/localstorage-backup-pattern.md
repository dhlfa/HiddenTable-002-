---
name: localStorage-prefix full-dump backup pattern
description: Backup/export approach for client-only apps (no backend DB) that store everything in localStorage under a common key prefix.
---

For an app with no backend database — all state (settings, journal/history,
caches) lives in `localStorage` under one common key prefix (e.g.
`app-name:*`) — implement backup/export as a single full-prefix dump/restore
rather than building separate export UI per page/feature:

- Export: iterate all localStorage keys matching the prefix, bundle into one
  JSON file, trigger a browser download.
- Import: read an uploaded JSON file, validate it's an object of prefixed
  keys, write each key back to localStorage, then reload the app.

Keep this as one shared service (not duplicated per page) and surface the
export/import controls in a single place (e.g. Settings), rather than
scattering "export this list" buttons across Journal, History, etc.

**Why:** Avoids duplicating export UI/logic across features and gives users
one predictable place to back up and restore all their data, matching how
the data is actually stored (flat, prefix-namespaced, no schema/versioning
system).

**How to apply:** Any client-only app (no server DB) where the user asks for
a "backup my data" / "export/import" feature.
