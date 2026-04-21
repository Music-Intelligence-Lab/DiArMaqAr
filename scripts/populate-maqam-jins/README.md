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
- `primaryJinsDegree` equals `[ascendingNoteNames[0]]`.
- Every non-null degree note appears in that maqām's `ascendingNoteNames`.

## Behaviour

- `primaryJinsDegree` is auto-set from `ascendingNoteNames[0]` when currently null or absent.
- `secondaryJinsDegree`, `tertiaryJinsDegree`, `ghammaz` are populated from the family rule if the field is currently null or absent. Non-null values are treated as manual overrides and left alone.
- Maqāmāt classified as `no_jins` keep `secondaryJinsDegree`, `tertiaryJinsDegree`, and `ghammaz` as `null`.
- The canonical classifier runs against `angloeuropean_1800 / yegah` — see `_meta` in the rules file.

## Tests

```bash
npm run populate-maqam-jins:test
```

Runs unit tests for the merge logic and validators (no filesystem writes).
