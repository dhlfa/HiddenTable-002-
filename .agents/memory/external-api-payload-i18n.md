---
name: External API payload strings must not be translated
description: Rule for when doing an i18n/localization pass on an app that talks to an external backend with an unknown/fixed contract.
---

When localizing an app's UI to another language, do NOT translate string
values that are:
- sent verbatim as fields in an external API request payload (e.g. category
  or spread/type enums), where the backend contract is fixed and not owned
  by this session, or
- already persisted in existing local/user data (e.g. journal entries)
  under their original English values.

Only translate true UI chrome: labels, buttons, headings, placeholders, and
any filter/display strings that are not part of the payload or stored data.

**Why:** Changing these values risks silently breaking an external contract
you can't verify (the backend may pattern-match on exact strings) and can
orphan/mismatch existing stored records that used the old values.

**How to apply:** Any i18n pass on an app with an external, not-fully-known
backend contract (e.g. a Google Apps Script backend) or pre-existing local
data — audit which strings are payload/data values vs. pure UI text before
translating, and leave the former in their original language. Disclose this
trade-off to the user explicitly.
