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

- Every entry has all four jins fields (`primaryJinsDegree`, `secondaryJinsDegree`, `tertiaryJinsDegree`, `ghammaz`).
- Every non-null degree note appears in that maqām's `ascendingNoteNames` — or in an adjacent-octave equivalent, e.g. `ḥusaynī` is accepted as the octave of `ʿushayrān`.

## Behaviour

- All four fields (`primaryJinsDegree`, `secondaryJinsDegree`, `tertiaryJinsDegree`, `ghammaz`) are populated manually in `data/maqamat.json`.
- The script populates `secondaryJinsDegree`, `tertiaryJinsDegree`, and `ghammaz` from the family rule when the key is absent from a maqām entry. Any pre-existing value (including explicit `null`, which encodes "intentionally no value") is treated as a manual override and left alone.
- The script **never writes `primaryJinsDegree`**. It is read-only source data; primary values must be authored directly in the JSON.
- Maqāmāt classified as `no_jins` keep `secondaryJinsDegree`, `tertiaryJinsDegree`, and `ghammaz` as `null` unless the user has written a non-null override.
- Scale validation accepts notes one octave above or below the written `ascendingNoteNames`, via `shiftNoteName` from `@/models/NoteName`.
- The canonical classifier runs against `angloeuropean_1800 / yegah` — see `_meta` in the rules file.

## Tests

```bash
npm run populate-maqam-jins:test
```

Runs unit tests for the merge logic and validators (no filesystem writes).
