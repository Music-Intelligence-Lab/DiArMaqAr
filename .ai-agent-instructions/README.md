# AI Agent Instructions

**Centralized instruction documents for AI assistants working on the Digital Arabic Maqām Archive**

---

## 📊 Recent Updates (2025-11-06)

**Major Restructuring:**
- ✅ Implemented hierarchical structure (core/ essentials/ reference/ glossary/)
- ✅ Reduced core context load by ~50-60% through extraction and consolidation
- ✅ Eliminated redundancy across files ("never use microtonal" now in 2 locations vs. 6)
- ✅ Created task-based loading strategy for conditional context
- ✅ Extracted detailed guides to reference/ directory (load on demand)
- ✅ Total optimization: ~9,650 lines → ~4,500-5,500 core lines

---

## 🚀 Quick Start

### For First-Time AI Assistants

1. **Read** [`core/00-core-principles.md`](./core/00-core-principles.md) - Universal principles (ALWAYS LOAD)
2. **Skim** [`essentials/01-project-essentials.md`](./essentials/01-project-essentials.md) - Project context
3. **Bookmark** [`essentials/03-development-quick-ref.md`](./essentials/03-development-quick-ref.md) - Most-used reference

### Task-Based Loading Strategy

Load files based on your task type for optimal context efficiency:

| Task Type | Core | Essentials | Reference | Also Load |
|-----------|------|------------|-----------|-----------|
| **New feature** | 00 | 01, 03, 04 | - | - |
| **Bug fix** | 00 | 03, 04, 05 | - | - |
| **API endpoint** | 00 | 03 | api-retrospective, openapi-formatting-guide | - |
| **API documentation** | 00 | 03 | openapi-formatting-guide | - |
| **User-facing documentation** | 00 | 03 | vitepress-documentation-guide | glossary/06, 07 |
| **12-pitch-class sets / Scala export** | 00 | 03, 04 | 12-pitch-class-sets-scala-export | - |
| **Documentation** | 00 | 03 | - | glossary/06, 07 |
| **Testing** | 00 | 05 | - | - |
| **UI testing with Playwright** | 00 | 03, 05 | mcp-servers-guide | `servers/playwright/` |
| **Library research** | 00 | 03 | mcp-servers-guide | `servers/context7/` |
| **Performance audit** | 00 | 05 | cli-commands-guide | - |
| **MCP usage** | 00 | 03 | mcp-servers-guide | `servers/index.ts` |
| **Naming/semantics** | 00 | 03 | naming-conventions-deep-dive | glossary/07 |

---

## 📁 New Hierarchical Structure

### Tier 1: Core (Always Load)

**[`core/00-core-principles.md`](./core/00-core-principles.md)** (~365 lines)
- Personality & philosophy
- Decolonial computing framework
- Cultural sensitivity principles
- Post-task reflection protocol
- Communication style
- **ALWAYS load this file for all tasks**

### Tier 2: Essentials (Load for Most Tasks)

**[`essentials/01-project-essentials.md`](./essentials/01-project-essentials.md)** (~279 lines)
- Project overview & tech stack
- High-level architecture
- Core conceptual model
- Common commands reference

**[`essentials/02-architecture-essentials.md`](./essentials/02-architecture-essentials.md)** (~519 lines)
- Context provider hierarchy
- Data model relationships
- Component patterns
- Performance considerations

**[`essentials/03-development-quick-ref.md`](./essentials/03-development-quick-ref.md)** ⭐ (~603 lines) - **MOST USED**
- Quick reference tables
- TDD workflow
- Component creation checklist
- Core conventions
- Common patterns
- UI/UX patterns

**[`essentials/04-musicology-essentials.md`](./essentials/04-musicology-essentials.md)** (~563 lines)
- Octave-repeating vs non-octave-repeating (CRITICAL)
- Asymmetric melodic paths
- Tuning system independence
- Common programming pitfalls

**[`essentials/05-testing-essentials.md`](./essentials/05-testing-essentials.md)** (~487 lines)
- Manual testing protocols
- Priority test cases
- Debugging procedures

### Tier 3: Reference (Load on Demand)

**[`reference/api-retrospective.md`](./reference/api-retrospective.md)** (~1,150 lines)
- Entity object pattern
- Context object nesting
- API design lessons learned
- Progressive disclosure pattern

**[`reference/openapi-formatting-guide.md`](./reference/openapi-formatting-guide.md)** (~524 lines)
- OpenAPI specification standards
- Parameter description consistency
- URL-safe values requirements
- Options parameter pattern

**[`reference/naming-conventions-deep-dive.md`](./reference/naming-conventions-deep-dive.md)** (~468 lines)
- Semantic clarity principles
- Type qualifiers pattern
- Context qualifiers pattern
- Field name construction

**[`reference/cli-commands-guide.md`](./reference/cli-commands-guide.md)** (~482 lines)
- Development commands
- Documentation commands
- Batch export CLI
- Git workflow

**[`reference/mcp-servers-guide.md`](./reference/mcp-servers-guide.md)** (~269 lines)
- Context7 (library documentation)
- Playwright (browser automation)
- MCP best practices

**[`reference/vitepress-documentation-guide.md`](./reference/vitepress-documentation-guide.md)** (~850 lines)
- VitePress structure and configuration
- Documentation file locations
- Build commands and workflow
- Editing user-facing documentation

**12-Pitch-Class Sets & Scala Export** ⭐ (~99KB across 6 files)
- [`reference/12-pitch-class-sets-api.md`](./reference/12-pitch-class-sets-api.md) - API endpoints and usage
- [`reference/12-pitch-class-sets-algorithm.md`](./reference/12-pitch-class-sets-algorithm.md) - Algorithm internals
- [`reference/scala-export-overview.md`](./reference/scala-export-overview.md) - Export system overview
- [`reference/scala-scl-export.md`](./reference/scala-scl-export.md) - .scl format specification
- [`reference/scala-kbm-export.md`](./reference/scala-kbm-export.md) - .kbm format specification
- [`reference/scala-export-fixes-archive.md`](./reference/scala-export-fixes-archive.md) - Historical fixes

**Navigation Hub**: [`reference/12-pitch-class-sets-scala-export.md`](./reference/12-pitch-class-sets-scala-export.md)

### Tier 4: Glossary (Load When Needed)

**[`glossary/06-documentation-standards.md`](./glossary/06-documentation-standards.md)** (~768 lines)
- Cultural-linguistic accuracy
- Property documentation patterns
- JSDoc standards
- API documentation requirements

**[`glossary/07-musicological-definitions.md`](./glossary/07-musicological-definitions.md)** ⭐ (~390 lines)
- Comprehensive term definitions
- Grounded in Arabic maqām theory
- Differences from Anglo-European concepts
- Essential reference for terminology

---

## 🎯 Using These Instructions Effectively

### Before Starting Any Task

**1. Determine what to load:**
- ALWAYS: `core/00-core-principles.md`
- For most tasks: `essentials/03-development-quick-ref.md`
- For specific needs: See task-based loading table above

**2. Check quick references:**
- Must-know defaults
- Critical rules
- Auto-implementation triggers

**3. Follow TDD workflow:**
```
RED (write test) → GREEN (minimal code) → REFACTOR → COMMIT
```

### During Development

**Component creation?** → essentials/03: Component Checklist
**API endpoint?** → essentials/03 + reference/api-retrospective
**Maqām logic?** → essentials/04: Musicological Principles
**Documentation?** → glossary/06: Documentation Standards
**Naming fields?** → reference/naming-conventions-deep-dive

### After Completing Tasks

**Document significant findings** in appropriate file:
- New patterns → essentials/03-development-quick-ref.md
- Music theory insights → essentials/04-musicology-essentials.md
- API lessons → reference/api-retrospective.md
- 12-pitch-class sets / Scala export → reference/12-pitch-class-sets-scala-export.md

---

## 📊 File Size & Optimization

### Context Load Reduction

| Tier | Files | Total Lines | Load Strategy |
|------|-------|-------------|---------------|
| **Core** | 1 | ~365 | Always load |
| **Essentials** | 5 | ~2,451 | Load for most tasks |
| **Reference** | 14 | ~7,474 | Load on demand |
| **Glossary** | 2 | ~1,158 | Load when needed |
| **Total** | 22 | ~11,448 | Conditional loading |

**Before optimization:** ~9,650 lines loaded upfront (pre-restructuring)
**After optimization:** ~968 lines default load (Core + Quick Ref: 365 + 603)
**Reduction:** ~90% in default context load
**Reference tier growth:** Comprehensive deep-dive documentation available on demand

### Benefits

- ✅ Faster agent initialization
- ✅ Reduced token usage
- ✅ Task-optimized context
- ✅ Eliminated redundancy
- ✅ Single source of truth for concepts
- ✅ Easier maintenance

---

## 🔍 Finding Information Fast

### By Topic Quick Index

| Topic | File | Tier |
|-------|------|------|
| **TDD workflow** | essentials/03 | Essential |
| **API patterns** | reference/api-retrospective | Reference |
| **Naming conventions** | reference/naming-conventions-deep-dive | Reference |
| **OpenAPI standards** | reference/openapi-formatting-guide | Reference |
| **API doc generation** | reference/openapi-formatting-guide | Reference |
| **MCP servers** | reference/mcp-servers-guide | Reference |
| **CLI commands** | reference/cli-commands-guide | Reference |
| **VitePress docs** | reference/vitepress-documentation-guide | Reference |
| **User-facing documentation** | reference/vitepress-documentation-guide | Reference |
| **12-pitch-class sets** | reference/12-pitch-class-sets-scala-export | Reference |
| **Scala export** | reference/12-pitch-class-sets-scala-export | Reference |
| **Compatibility matching** | reference/12-pitch-class-sets-scala-export | Reference |
| **Octave selection** | reference/12-pitch-class-sets-scala-export | Reference |
| **Cultural sensitivity** | core/00 | Core |
| **Octave-repeating** | essentials/04 Section 0 | Essential |
| **Asymmetric sequences** | essentials/04 Section 1 | Essential |
| **Family classification** | essentials/04 Section 11 | Essential |
| **Context providers** | essentials/02 | Essential |
| **Testing protocols** | essentials/05 | Essential |
| **Performance audit** | essentials/05, reference/cli-commands-guide | Essential/Reference |
| **Property docs** | glossary/06 | Glossary |
| **Term definitions** | glossary/07 | Glossary |

### By Question Type

**"How do I...?"**
- Create a component → essentials/03: Component Creation Checklist
- Build an API → essentials/03 + reference/api-retrospective + reference/openapi-formatting-guide
- Generate API documentation → reference/openapi-formatting-guide: Static API Documentation Generation
- Update user-facing docs → reference/vitepress-documentation-guide
- Test my code → essentials/03: TDD + essentials/05: Manual Testing
- Document this → glossary/06: Documentation Standards
- Use MCP servers → **`servers/index.ts`** + reference/mcp-servers-guide
- Get library documentation → `servers/context7/` (Context7 MCP)
- Test UI workflows → `servers/playwright/` (Playwright MCP)
- Discover MCP tools → **Read `servers/index.ts` first** (Code API pattern)

**"Why is...?"**
- Check musicological principles → essentials/04
- Understand architecture → essentials/02
- Learn cultural context → core/00

**"What's the pattern for...?"**
- essentials/03: Common Patterns (Quick Reference)
- Search specific file for pattern name

---

## ⚠️ Common Mistakes to Avoid

**Read these sections first:**

1. **essentials/03: Critical Rules table** - Most common mistakes
2. **essentials/04: Section 0** - Octave-repeating availability (CRITICAL)
3. **essentials/04: Common Programming Pitfalls** - JavaScript gotchas
4. **core/00: Never use "microtonal"** - Cultural terminology

---

## 🔄 Maintenance Guidelines

### When to Update

**Update immediately:**
- New musicological insights discovered
- New architectural patterns established
- Common pitfalls identified
- API patterns changed

**Quarterly review:**
- Verify examples match current code
- Check cross-references work with new structure
- Update testing scenarios
- Refresh based on evolved patterns

### Knowledge Preservation Protocol

After successful task completion:
1. Review for unique insights
2. **Emphasize generalizable principles** - Extract reusable patterns, not just specific implementations
3. Document in appropriate tier/file with examples
4. Explain implications for future development
5. Add to testing scenarios if applicable
6. **Ask user**: "Would you like me to integrate these insights into .ai-agent-instructions?"

**Documentation Principle**: When writing notes, focus on generalizable insights that apply across multiple contexts, not just specifics of a single implementation. Use specific examples to illustrate the general principle, but structure the documentation so the principle can be applied elsewhere.

---

## 🎯 Key Success Principles

### 1. Conditional Loading
- Load only what you need for the task
- Start with core + relevant essentials
- Pull in reference files as needed
- Access glossary for definitions

### 2. Test-Driven Development
- Write tests BEFORE implementation
- Red → Green → Refactor → Commit
- Only commit when all tests pass

### 3. Cultural Sensitivity
- Never use "microtonal"
- Respect Arabic terminology as primary
- Apply decolonial computing principles

### 4. Consistency
- Check similar code for patterns
- Follow established conventions
- Validate before committing

### 5. Musicological Accuracy
- Always use `getNoteNameSetsWithAdjacentOctaves()`
- Never assume symmetric sequences
- Tuning system starting note is MANDATORY

---

## 📚 External Resources Integration

### MCP Servers (Code API Pattern)

**AI agents MUST use the `servers/` directory** for MCP tool discovery:

```
servers/
├── index.ts              ← START HERE
├── context7/             ← Library documentation
└── playwright/           ← Browser automation
```

**Workflow:**
1. Read `servers/index.ts` for available servers
2. Navigate to server directory for tool files
3. Read typed interfaces and examples
4. Call tools via Claude's MCP integration

**Available Servers:**
- **Context7**: Up-to-date library documentation (beyond training data)
- **Playwright**: Browser automation for UI testing

**See**: [`reference/mcp-servers-guide.md`](./reference/mcp-servers-guide.md) for detailed usage
**See**: `servers/` directory for typed tool interfaces

---

## 🎓 Philosophy

These instructions embody:

1. **Hierarchical Organization**: Core → Essentials → Reference → Glossary
2. **Conditional Loading**: Load only what you need
3. **Test-Driven Development**: Quality through systematic testing
4. **Cultural Sensitivity**: Decolonial computing in practice
5. **Knowledge Preservation**: Insights become lasting wisdom
6. **Progressive Disclosure**: Quick reference → detailed reference
7. **Practical Focus**: Real examples, real scenarios
8. **Living Documentation**: Continuously evolved

---

## 🗺️ Directory Structure

```
.ai-agent-instructions/
├── README.md (this file)
├── core/
│   └── 00-core-principles.md
├── essentials/
│   ├── 01-project-essentials.md
│   ├── 02-architecture-essentials.md
│   ├── 03-development-quick-ref.md ⭐
│   ├── 04-musicology-essentials.md
│   └── 05-testing-essentials.md
├── reference/
│   ├── 12-pitch-class-sets-scala-export.md ⭐ (navigation hub)
│   ├── 12-pitch-class-sets-api.md
│   ├── 12-pitch-class-sets-algorithm.md
│   ├── api-retrospective.md
│   ├── cli-commands-guide.md
│   ├── decolonial-computing-theory.md
│   ├── mcp-servers-guide.md ⭐ (Code API pattern)
│   ├── naming-conventions-deep-dive.md
│   ├── openapi-formatting-guide.md
│   ├── scala-export-overview.md
│   ├── scala-scl-export.md
│   ├── scala-kbm-export.md
│   ├── scala-export-fixes-archive.md
│   └── vitepress-documentation-guide.md
└── glossary/
    ├── 06-documentation-standards.md
    └── 07-musicological-definitions.md

servers/                          ⭐ MCP TOOL DISCOVERY (Code API Pattern)
├── index.ts                      ← Start here for all MCP usage
├── mcpClient.ts                  ← Core utility
├── context7/                     ← Library documentation tools
│   ├── index.ts
│   ├── resolveLibraryId.ts
│   └── getLibraryDocs.ts
└── playwright/                   ← Browser automation tools
    ├── index.ts
    ├── navigate.ts
    ├── click.ts
    ├── screenshot.ts
    └── evaluate.ts
```

---

*Last Updated: 2025-11-24*
*Recent additions:*
- *MCP Code API pattern integration (servers/ directory)*
- *Decolonial computing theory reference (~599 lines)*
- *VitePress documentation guide (~850 lines)*
