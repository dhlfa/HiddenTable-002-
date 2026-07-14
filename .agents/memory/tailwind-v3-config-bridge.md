---
name: Tailwind v3 config bridge in v4 scaffold
description: How to port an app that ships its own tailwind.config.js (v3-style) into a Replit scaffold that uses Tailwind v4's CSS-first config, without a full manual port.
---

When a ported/pre-existing app has its own `tailwind.config.js` (colors, fonts,
custom utilities) written for Tailwind v3, and the target scaffold uses
Tailwind v4 (`@tailwindcss/vite` + `@theme` in CSS), you don't have to
hand-translate every token into `@theme` syntax.

Instead, keep the original `tailwind.config.js` file as-is and load it via
`@config "../tailwind.config.js";` at the top of the app's `index.css` (v4
still supports `@config` as an escape hatch for legacy JS config). Add any
new tokens/utilities needed for the visual refresh directly as `@theme` or
plain CSS classes alongside it, rather than merging everything into one
config format.

**Why:** Full manual porting of a non-trivial config (many custom colors,
fonts, animations) to v4 syntax is slow and error-prone, and risks losing
fidelity with the original design the user wants preserved. `@config` lets
v3-style config keep working under v4's engine with minimal risk.

**How to apply:** Any time you're porting an existing Vite/React app with a
non-trivial `tailwind.config.js` into a scaffold running Tailwind v4.
