# TODO List

Tasks, research items, and things to take care of for the DiArMaqAr project.

---

## Research


---

## Tasks

- Bug: When frequency of a pitchclass in tuning system octave table 0 are too low, playing them via computer keyboard they currently produce a fixed frequency

- 



---

## Completed
- [x] **Update filter item labels (all languages)**: Shortened labels for cleaner UI in English, Arabic, and French
  - English: Decimal Ratio → Decimal, Abjad Name → Abjad, Cents Deviation → 12-EDO Deviation
  - Arabic: النسبة العشرية → عشري, الإسم الأبجدي → أبجد, انحراف السنت → انحراف 12-EDO
  - French: Déviation en cents → Déviation 12-EDO
  - Updated in `src/contexts/language-context.tsx` across all namespaces (jins, maqam, filter, octave, valueType, analysis)
- [x] **Update filter item labels**: Shortened labels for cleaner UI
  - Decimal Ratio → Decimal
  - Abjad Name → Abjad
  - Cents Deviation → 12-EDO Deviation
  - Updated in `src/contexts/language-context.tsx` across jins, maqam, filter, octave, valueType, and analysis namespaces
- [x] **Fix availableTranspositions**: Updated to include full transposed maqam/jins names
  - New structure: `{ idName, displayName, displayNameAr?, tonic: { idName, displayName, displayNameAr? } }`
  - Updated in: `maqamat/[id]/route.ts`, `maqamat/[id]/compare/route.ts`, `ajnas/[id]/route.ts`, `ajnas/[id]/compare/route.ts`
- [x] **Include solfege as a pitch class data value**: Add solfege as a pitch class data value in the following components:
  - `src/components/tuning-system-octave-tables.tsx`
  - `src/components/maqam-transpositions.tsx`
  - `src/components/jins-transpositions.tsx`
  - API endpoints: `tuning-systems/.../pitch-classes`, `ajnas/[id]`, `maqamat/[id]`, `ajnas/[id]/compare`, `maqamat/[id]/compare`, `12-pitch-class-sets`
  - OpenAPI spec: `openapi.yaml` (added solfege to all pitchClassDataType enums, regenerated JSON)