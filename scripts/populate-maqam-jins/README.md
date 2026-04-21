# populate-maqam-jins

One-shot script that populates `primaryJinsDegree`, `secondaryJinsDegree`, `tertiaryJinsDegree`, and `ghammaz` fields across all entries in `data/maqamat.json`, sourcing family-level defaults from `data/maqamat-family-rules.json`.

## Run

```bash
npm run populate-maqam-jins
```

Writes `data/maqamat.json` in place. Review with `git diff data/maqamat.json`.

## Verify only (no write)

```bash
npm run populate-maqam-jins -- --verify
```

Checks structural invariants across `data/maqamat.json`:

- Every entry has all four new keys.
- `primaryJinsDegree` is a single-element non-null array. By default it equals `[ascendingNoteNames[0]]`; the verifier accepts any note from the scale (or its adjacent-octave equivalents) so documented exceptions can pass.
- Every non-null degree note appears in that maqām's `ascendingNoteNames` or an adjacent-octave equivalent (e.g. `ḥusaynī` is accepted as the octave of `ʿushayrān`).

### Known `primaryJinsDegree` exception

By convention, `primaryJinsDegree[0]` is the maqam's tonic (`ascendingNoteNames[0]`). **One documented exception exists:**

- **maqām dilkeshīdah** — tonic is `yegāh`, primary jins is built on `dūgāh`.

Any future manual edit that sets `primaryJinsDegree` to a note other than the tonic should be recorded here. The verifier does **not** enforce tonic-equals-primary, so a typo is not caught automatically — rely on review of `git diff data/maqamat.json` for new entries.

## Behaviour

- `primaryJinsDegree` is auto-set from `ascendingNoteNames[0]` when the key is absent. Pre-existing values (including explicit `null`) are treated as manual overrides and left alone.
- `secondaryJinsDegree`, `tertiaryJinsDegree`, `ghammaz` are populated from the family rule when the key is absent. Any pre-existing value (including explicit `null`, which encodes "intentionally no value") is a manual override and left alone.
- Maqāmāt classified as `no_jins` keep `secondaryJinsDegree`, `tertiaryJinsDegree`, and `ghammaz` as `null` unless the user has written a non-null override.
- Scale validation accepts notes one octave above or below the written `ascendingNoteNames`, via `shiftNoteName` from `@/models/NoteName`.
- The canonical classifier runs against `angloeuropean_1800 / yegah` — see `_meta` in the rules file.

## Tests

```bash
npm run populate-maqam-jins:test
```

Runs unit tests for the merge logic and validators (no filesystem writes).
