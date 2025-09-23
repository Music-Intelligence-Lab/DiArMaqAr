# Copilot Instructions — Maqām Network

## Communication Style
- **Concise Responses**: Do not provide summaries of actions taken unless explicitly requested. Focus on direct implementation without explanatory commentary.

## Documentation
- **App Documentation**: The folder `public/docs` contains comprehensive documentation about the app's functions, models, and data structures. Always search this documentation first rather than searching the codebase to understand available functions, APIs, and data structures.

## Big Picture
- **Architecture**: Next.js 15 + React 19 TypeScript app under `src/`, with a computational musicology core in `src/functions` and `src/models`. Server endpoints live in `src/app/api/**`. Ground-truth musical data is in `/data/*.json`. Public docs are served from `public/docs/`.
- **Cultural Framework**: Platform follows decolonial computing principles, prioritizing Arabic theoretical frameworks over Anglo-European-centric approaches. Grounded in Arab-Ottoman-Persian note naming convention and historical sources from 9th-century Al-Kindī through modern 20th-century theorists.
- **Design Goal**: Separate cultural/theoretical abstractions (note names, jins, maqām) from concrete sound (pitch classes). Abstract classes (e.g., `MaqamData`, `JinsData`) become playable structures by combining with a tuning system via `getTuningSystemPitchClasses` and `MaqamData.getTahlil()`.
- **Scholarly Methodology**: Systematic implementation of historical sources with comprehensive citation attribution. Platform enables analysis of traditional repertoire and comparative musicological research while maintaining cultural authenticity.
- **Path Aliases**: Use `@/*` (see `tsconfig.json`) for imports like `"@/functions/getTuningSystemPitchClasses"`.

## Core Data Flow
- **Import JSON → Typed Models**: Use `src/functions/import.ts` (`getTuningSystems`, `getAjnas`, `getMaqamat`, `getSources`, `getPatterns`) to hydrate from `/data/*.json` into classes in `src/models/**`.
- **Historical Tuning Systems**: Platform implements systems from 9th-century Al-Kindī through modern theorists like Al-Ṣabbāgh's comma-based systems. Each system affects transposition and modulation possibilities.
- **Generate Pitch Space**: `getTuningSystemPitchClasses(ts, startingNote)` builds 4-octave `PitchClass[]` with `frequency`, `midiNoteNumber`, `centsDeviation`, `englishName` (see `src/functions/getTuningSystemPitchClasses.ts`).
- **Build Playable Maqām/Jins**: 
  - Jins: transpositions via `getJinsTranspositions`.
  - Maqām: `MaqamData.getTahlil(allPitchClasses)` + `getMaqamTranspositions` produces directional sequences and interval patterns.
- **Al-Shawwā Modulation Algorithm**: First systematic digital implementation of Sāmī Al-Shawwā's 1946 modulation guidelines, providing historically-accurate modulation matrices between maqāmāt.
- **Export/Analytics**: `src/functions/export.ts` merges data for compact JSON; modulation structures use index-based keys (`MaqamatModulationsWithKeys`, `AjnasModulationsWithKeys`). Analytics utilities live in `generate-analytics.ts`.

## Conventions & Types
- **Note Names**: Use canonical transliterated names from `src/models/NoteName.ts` across 5 octave arrays. Don’t invent strings—accept/produce the `NoteName` union type.
- **Pitch Class Formats**: Inputs may be fraction/cents/decimal/MIDI. Detect with `detectPitchClassType`, convert with `convertPitchClass` utilities. For matching, prefer a cents tolerance of 5–10 as used by APIs.
- **Tuning Systems**: Never hardcode. Load via `getTuningSystems()`; select note-name set with `TuningSystem.getNoteNameSets()`.
- **Imports**: Prefer `@/...` alias. Avoid referencing `packages/*`—`tsconfig.json` excludes it for the app build.

## API Routes (Server)
- **Pattern**: Routes under `src/app/api/**` read models via `functions/import.ts`, compute with `src/functions/**`, and return typed JSON (`NextResponse.json`).
- **Example `/api/transpose`** (`src/app/api/transpose/route.ts`): POST body requires `tuningSystemID`, either `maqamID` or `jinsID`, `firstNote` (from note-name sets), and `centsTolerance`. Returns `transpositions`, selected `tuningSystem`, and the `originalSequence` metadata. Validate inputs and return 400/404 consistently as established in this route.

## Frontend Usage Expectations
- **Components**: UIs (e.g., `src/components/*`) expect `PitchClass` items with `noteName`, `englishName`, `frequency`, `centsDeviation`, `midiNoteNumber`. Generate via `getTuningSystemPitchClasses` and keep arrays stable by index.
- **Audio**: Client-side audio utilities in `src/audio/*` (`sonic-weave`, `sw-synth`). Guard SSR: only access Web Audio in client components/effects. Platform provides real-time microtonal synthesis with low latency for authentic maqāmic playback.
- **Bilingual Support**: Interface supports English/Arabic accessibility, respecting cultural specificity while enabling cross-cultural engagement.

## Specialized Platform Features
- **Al-Shawwā Modulation Analysis**: Interactive modulation matrices based on historical guidelines. Tuning systems affect modulation availability—e.g., Al-Ṣabbāgh's comma-based system has limited transpositions but maintains intervallic authenticity.
- **Starting Note Convention Comparison**: Systematic analysis between oud-based measurements (ʿushayrān) vs long-necked lute traditions (yegāh/rāst), revealing how historical instrument approaches affect theoretical accessibility.
- **Tuning System Sensitivity**: All transpositions and modulations are tuning-system-dependent. A maqām successful across pitch classes in one system may have limited options in another, revealing practical implications of theoretical choices.
- **Research Applications**: Platform enables analysis of traditional repertoire patterns, comparative theoretical frameworks, and pedagogical applications through comprehensive export and analytics capabilities.

## Context Architecture & State Management
- **Context Hierarchy**: App structured with nested providers: `AppContext` (global state) → `SoundContext` (audio) → `TranspositionsContext` (performance optimization) → `FilterContext`, `MenuContext`, `LanguageContext` (specialized UI state).
- **Performance Optimization**: Use `useMemo` for expensive calculations and context values. `TranspositionsContext` pre-computes all maqām/jins transpositions to avoid repeated calculations during UI interactions.
- **State Dependencies**: Changes in `selectedTuningSystem` trigger cascading updates through `allPitchClasses` → transpositions → UI selections. Handle cleanup with `clearSelections()` when tuning system changes.
- **URL State Sync**: `handleUrlParams` enables deep-linking to specific configurations. Use descriptive parameters like `jins=jins-rast-al-rast` for SEO and shareability.
- **Context Consumer Patterns**: Always use custom hooks (`useAppContext`, `useSoundContext`, etc.) rather than direct `useContext`. Include error boundaries for context availability checks.

## Data Structure Patterns
- **JSON Schema**: All data files (`/data/*.json`) follow consistent patterns with `id`, bilingual `name`/`title` fields, `sourcePageReferences` for citations, and `noteNames` arrays.
- **State Synchronization**: Core selections (`selectedTuningSystem`, `selectedMaqamData`, `selectedJins`) drive derived state. Changes cascade through `allPitchClasses` → `selectedPitchClasses` → UI updates.
- **Index Mapping**: `mapIndices()` translates between note names and array positions. Use `selectedIndices` for UI state, `originalIndices` to track tuning system defaults.
- **Tolerance Handling**: Default `centsTolerance: 5` for pitch matching. Increase for historical sources with measurement variations, decrease for precise theoretical analysis.
- **Multi-language Support**: All user-facing strings support English/Arabic via `getDisplayName()`. Components automatically handle RTL layout when `language === "ar"`.

## Audio & MIDI Integration
- **Web Audio Architecture**: `SoundContext` manages audio synthesis with support for custom waveforms, microtonal playback, and MPE (MIDI Polyphonic Expression).
- **Real-time Synthesis**: Audio calculations use precise frequency values from `PitchClass.frequency`. Avoid MIDI note number approximations for microtonal accuracy.
- **Performance Audio**: Guard Web Audio calls with client-side checks. Never access `AudioContext` during SSR—use `useEffect` hooks in components.
- **MIDI I/O**: Supports both traditional MIDI and MPE for microtonal expression. Channel allocation managed automatically for MPE devices.
## Component Architecture Patterns
- **Manager Components**: Follow pattern of `tuning-system-manager.tsx`, `maqam-manager.tsx`, `jins-manager.tsx`—each handles CRUD operations for its domain with admin/user modes.
- **Transposition Components**: Use `TranspositionsContext` for pre-computed transpositions rather than calling `getJinsTranspositions`/`getMaqamTranspositions` directly.
- **Filter Integration**: Components accessing lists should implement `FilterContext` for search/filter functionality. See `useFilterContext` pattern.
- **State Cleanup**: Call `clearSelections()` when changing tuning systems. Use `clearJinsSelections()` for partial cleanup when switching between jins/maqām.
- **URL Parameter Handling**: Components with selections should support deep-linking via `handleUrlParams`. Use descriptive IDs like `maqam-rast-al-rast` format.

## Developer Workflows
- **Install/Run**: `npm i` → `npm run dev` (Next.js). Build with `npm run build`; start with `npm start`. Lint via `npm run lint`.
- **Docs**: `npm run docs` (TypeDoc) outputs to `public/docs/library`. The Windows helper `generate-docs.bat` opens `docs/api/index.html`, but the configured output is `public/docs/library` (see `typedoc.json`).
- **Python Toolkit**: A complete Python mirror exists in `python/` with tests and local data. Quick checks:
  - `python python/test_core_functions.py`
  - `python python/test_functions.py`
  - `python python/test_models.py`

## Gotchas
- **Images**: Remote image host allowlist is limited to `www.aub.edu.lb` (see `next.config.ts`).
- **Data Files**: Treat `/data/*.json` as ground-truth sources; prefer `export.ts` / update utilities rather than mutating at runtime.
- **Strict TS**: Project is `strict: true`. Keep types explicit, use model methods (e.g., `MaqamData.getTahlil`) rather than ad-hoc shapes.
- **Docs Navigation**: TypeDoc name/link config is in `typedoc.json`; keep entries in sync when adding models/functions.

## Pointers
- Key files: `src/functions/getTuningSystemPitchClasses.ts`, `src/functions/export.ts`, `src/functions/transpose.ts`, `src/functions/import.ts`, `src/models/Maqam.ts`, `src/models/Jins.ts`, `src/models/NoteName.ts`.
- Data: `/data/ajnas.json`, `/data/maqamat.json`, `/data/tuningSystems.json`, `/data/patterns.json`, `/data/sources.json`.
