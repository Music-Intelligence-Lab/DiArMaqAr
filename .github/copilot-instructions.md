# Copilot Instructions for Maqam Network

This guide enables AI coding agents to be productive in the Maqam Network codebase. It summarizes architecture, workflows, and conventions unique to this project.

## Big Picture Architecture
- **Single-Page App (SPA)** built with Next.js, React, and TypeScript. All navigation is component-based; no route changes.
- **Global State** managed via React Contexts (`AppContext`, `MenuContext`, `FilterContext`, `SoundContext`). These provide access to musical data, UI state, sound/MIDI settings, and user selections.
- **Core Data** (tuning systems, ajnas, maqamat, patterns, sources) is stored in static JSON files under `/data/` and loaded at build time. Data is immutable at runtime and updated only by redeploying.
- **Major Components**:
  - `TuningSystemManager`, `JinsManager`, `MaqamManager`, `SayrManager`, `SettingsCard`, `PitchClassWheel`, etc. Each manages a distinct musical or UI domain.
  - All are rendered conditionally in `HomeClient` (see `/src/app/page.tsx`).
- **Models** in `/src/models/` define TypeScript classes for musical concepts (TuningSystem, Jins, Maqam, Pattern, etc.).
- **Transpositions and Interval Logic** are handled in `/src/functions/transpose.ts` and related components. These power the interactive analysis tables.

## Developer Workflows
- **Build**: Use `npm run build` for production, `npm run dev` for local development.
- **Test**: No formal test suite; manual testing is done via the UI. Validate changes by running the app and interacting with all major features.
- **Debug**: Use browser dev tools and React DevTools. State is managed via Contexts; inspect context values for debugging.
- **Data Update**: To add/edit musical data, update the relevant JSON in `/data/` and redeploy.
- **Styling**: Use SCSS modules in `/src/styles/`. Prefer px units for consistency. Feature-specific styles are in their own files (e.g., `landing-page.scss`).

## Project-Specific Patterns & Conventions
- **Keyword Highlighting**: All musical keywords in the landing page and feature lists are wrapped in `<span className="highlight">` for emphasis.
- **Pitch Class Mapping**: MIDI mapping and pitch class coloring use a single source of truth (see `sound-context.tsx`).
- **URL State Sync**: User selections are persisted via URL query parameters, parsed and updated in `HomeClient` and `AppContext`.
- **Component Communication**: All cross-component state is via Contexts; avoid prop drilling.
- **Transpositions**: Use `getIntervalPattern`, `getTranspositions`, and related functions for interval and pattern logic. See `transpose.ts` and transpositions components.
- **CRUD Operations**: Managers (TuningSystem, Jins, Maqam, Sayr) support create/edit/delete via UI forms, updating context state.
- **Sound/MIDI**: MIDI input/output is managed in `sound-context.tsx` and `SettingsCard`. Device refresh is via `setRefresh` in context.

## Integration Points
- **External Data**: All musical data is local JSON; no external API calls except for the open API endpoint (documented in the UI).
- **MIDI**: MIDI device integration is via browser Web MIDI API, abstracted in context and settings components.
- **Analytics**: Analytics data is stored in `/public/data/analytics.json` and visualized in dedicated components.

## Key Files & Directories
- `/src/app/page.tsx` – SPA root, renders `HomeClient` and landing page.
- `/src/contexts/` – All global state contexts.
- `/src/components/` – Major UI and musical logic components.
- `/src/functions/` – Core musical logic (transpositions, mapping, analytics).
- `/src/models/` – TypeScript classes for musical concepts.
- `/data/` – Static musical data (tuning systems, ajnas, maqamat, etc.).
- `/src/styles/` – SCSS modules for styling.

## Example: Adding a New Jins
1. Update `/data/ajnas.json` with the new jins definition.
2. Redeploy the app to load new data.
3. Use the Jins Manager UI to select, edit, and play the new jins.

---
For unclear or incomplete sections, please provide feedback so this guide can be improved for future AI agents.
