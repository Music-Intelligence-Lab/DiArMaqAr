# TODO List

Tasks, research items, and things to take care of for the DiArMaqAr project.

---

## Research


---

## Tasks
- [ ] update filter items so they are shorter (Decimal Ratio / Decimal - Abjad Name / Abjad, Cents Deviation / 12-EDO Deviation)
- [ ] fix "availableTranspositions" in /maqamat/{idName} and any other endpoints so that it has full transposed maqam name i.e. maqām rāst al-chahārgāh / maqam_rast_al_chahargah





---

## Completed
- [x] **Include solfege as a pitch class data value**: Add solfege as a pitch class data value in the following components:
  - `src/components/tuning-system-octave-tables.tsx`
  - `src/components/maqam-transpositions.tsx`
  - `src/components/jins-transpositions.tsx`
  - API endpoints: `tuning-systems/.../pitch-classes`, `ajnas/[id]`, `maqamat/[id]`, `ajnas/[id]/compare`, `maqamat/[id]/compare`, `12-pitch-class-sets`
  - OpenAPI spec: `openapi.yaml` (added solfege to all pitchClassDataType enums, regenerated JSON)