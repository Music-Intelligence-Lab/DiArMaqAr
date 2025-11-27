# DiArMaqAr Cheatsheet (~50 lines)

**Ultra-compressed reference for frequent use. For details, see full documents.**

---

## [CRITICAL] Functions

```typescript
// Maqām availability - ALWAYS use this, NEVER getNoteNameSets()
tuningSystem.getNoteNameSetsWithAdjacentOctaves()

// Text → URL-safe ID
standardizeText("maqām rāst") // → "maqam_rast"
```

## [CRITICAL] Never Use

| ❌ Never | ✅ Instead |
|----------|-----------|
| "microtonal" | "unequal divisions", "non-12-EDO", "custom tunings" |
| "scale" (for tuning systems) | "tuning system" or "tanghīm" |
| `descendingPitchClasses = ascending.reverse()` | Treat as independent arrays |
| `value % 7` (negative numbers) | `((value % 7) + 7) % 7` |

## API Response Formats

```typescript
// Entity references - ALWAYS objects, never strings
{ id: "1", idName: "maqam_rast", displayName: "maqām rāst" }

// List responses - ALWAYS this format
{ count: 60, data: [...] }  // Never { meta: { count }, data }
```

## Defaults

| Parameter | Value | Note |
|-----------|-------|------|
| centsTolerance | `5` | Always use unless specified |
| imports | `@/*` | Never relative paths |
| startingNote | **MANDATORY** | No default, user must specify |
| utility scripts | **Python3** | NOT TypeScript. Ask if unsure. |

## TDD Workflow

```
RED (write failing test in tmp/) → GREEN (minimal code) → REFACTOR → COMMIT
```

## Rule Hierarchy (When Rules Conflict)

1. Cultural Sensitivity > Technical Convenience
2. User Safety/Data Integrity > Performance
3. Explicit User Request > Default Conventions
4. Project Conventions > External Best Practices
5. Musicological Accuracy > Code Simplicity

## Quick Validation

- [ ] `getNoteNameSetsWithAdjacentOctaves()` for availability
- [ ] No "microtonal" in output
- [ ] Empty strings validated: `param.trim() === ""`
- [ ] Tests pass before commit

---

*For full details: `core/00-core-principles.md` + `essentials/03-development-quick-ref.md`*

