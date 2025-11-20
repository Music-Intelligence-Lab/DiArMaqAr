# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📁 Instructions Location

**All comprehensive instructions are in:** `.ai-agent-instructions/`

For complete documentation, see the [README in that folder](./.ai-agent-instructions/README.md).

---

## 🏗️ Hierarchical Structure (Nov 2025)

The instructions are organized into a **4-tier hierarchical system** for optimal context loading:

- **Core (Tier 1)**: Always load - personality, principles, decolonial computing framework
- **Essentials (Tier 2)**: Load for most tasks - project, architecture, development, musicology, testing
- **Reference (Tier 3)**: Load on demand - deep dives, specialized guides, API retrospectives
- **Glossary (Tier 4)**: Load when needed - terminology definitions, documentation standards

**Benefits:**
- ~90% reduction in default context load (from ~9,650 lines → ~968 lines default)
- Task-optimized loading strategy
- Single source of truth for concepts
- Eliminated redundancy across files

---

## 🚀 Quick Start

### For First-Time AI Assistants

1. **Read** [core/00-core-principles.md](./.ai-agent-instructions/core/00-core-principles.md) - Universal principles (ALWAYS LOAD)
2. **Skim** [essentials/01-project-essentials.md](./.ai-agent-instructions/essentials/01-project-essentials.md) - Project context
3. **Bookmark** [essentials/03-development-quick-ref.md](./.ai-agent-instructions/essentials/03-development-quick-ref.md) ⭐ - Most-used reference

**Default recommended load**: Core Principles + Development Quick Reference (~968 lines)

---

## 📂 Quick Links by Tier

### Tier 1: Core (Always Load)

- **[Core Principles](./.ai-agent-instructions/core/00-core-principles.md)** (~365 lines)
  - Personality & philosophy
  - Decolonial computing framework
  - Cultural sensitivity principles
  - Communication style
  - **ALWAYS load this file for all tasks**

### Tier 2: Essentials (Load for Most Tasks)

- **[Project Essentials](./.ai-agent-instructions/essentials/01-project-essentials.md)** (~279 lines)
  - Project overview & tech stack
  - High-level architecture
  - Core conceptual model

- **[Architecture Essentials](./.ai-agent-instructions/essentials/02-architecture-essentials.md)** (~519 lines)
  - Context provider hierarchy
  - Data model relationships
  - Component patterns

- **[Development Quick Reference](./.ai-agent-instructions/essentials/03-development-quick-ref.md)** ⭐ (~603 lines) - **MOST USED**
  - Quick reference tables
  - TDD workflow
  - Component creation checklist
  - Core conventions & common patterns

- **[Musicology Essentials](./.ai-agent-instructions/essentials/04-musicology-essentials.md)** (~563 lines)
  - Octave-repeating vs non-octave-repeating (CRITICAL)
  - Asymmetric melodic paths
  - Tuning system independence
  - Common programming pitfalls

- **[Testing Essentials](./.ai-agent-instructions/essentials/05-testing-essentials.md)** (~487 lines)
  - Manual testing protocols
  - Priority test cases
  - Debugging procedures

### Tier 3: Reference (Load on Demand)

- **[API Retrospective](./.ai-agent-instructions/reference/api-retrospective.md)** (~1,150 lines)
  - Entity object pattern, context nesting, design lessons

- **[OpenAPI Formatting](./.ai-agent-instructions/reference/openapi-formatting-guide.md)** (~524 lines)
  - Specification standards, parameter consistency, URL-safe values

- **[Naming Conventions Deep Dive](./.ai-agent-instructions/reference/naming-conventions-deep-dive.md)** (~468 lines)
  - Semantic clarity, type qualifiers, field name construction

- **[CLI Commands Guide](./.ai-agent-instructions/reference/cli-commands-guide.md)** (~482 lines)
  - Development commands, batch exports, git workflow

- **[MCP Servers Guide](./.ai-agent-instructions/reference/mcp-servers-guide.md)** (~269 lines)
  - Context7 (library docs), Playwright (browser automation)

- **[12-Pitch-Class Sets & Scala Export Hub](./.ai-agent-instructions/reference/12-pitch-class-sets-scala-export.md)** ⭐
  - Navigation hub for 12-TET export system (~99KB across 6 files)
  - API endpoints, algorithms, .scl/.kbm formats, compatibility matching

- **[Decolonial Computing Theory](./.ai-agent-instructions/reference/decolonial-computing-theory.md)** (~599 lines)
  - Theoretical framework and philosophical foundations

- **[Anamark TUN Export](./.ai-agent-instructions/reference/anamark-tun-export-guide.md)**
  - TUN format specification

### Tier 4: Glossary (Load When Needed)

- **[Documentation Standards](./.ai-agent-instructions/glossary/06-documentation-standards.md)** (~768 lines)
  - Cultural-linguistic accuracy, property patterns, JSDoc standards

- **[Musicological Definitions](./.ai-agent-instructions/glossary/07-musicological-definitions.md)** ⭐ (~390 lines)
  - Comprehensive term definitions, essential reference

---

## 🎯 Task-Based Loading Strategy

Load files efficiently based on your task type:

| Task Type | Files to Load |
|-----------|---------------|
| **New feature** | Core + Project Essentials / Quick Ref / Musicology Essentials |
| **Bug fix** | Core + Quick Ref / Musicology Essentials / Testing Essentials |
| **API endpoint** | Core + Quick Ref + API Retrospective + OpenAPI Formatting |
| **API documentation** | Core + Quick Ref + OpenAPI Formatting |
| **12-pitch-class sets / Scala export** | Core + Quick Ref / Musicology Essentials + 12-Pitch-Class Sets Hub |
| **Documentation** | Core + Quick Ref + Documentation Standards + Musicological Definitions |
| **Testing** | Core + Testing Essentials |
| **Performance audit** | Core + Testing Essentials + CLI Commands Guide |
| **MCP usage** | Core + MCP Servers Guide |
| **Naming/semantics** | Core + Quick Ref + Naming Conventions + Musicological Definitions |

---

## ⚠️ Common Mistakes to Avoid

**Read these sections first:**

1. **essentials/03: Critical Rules table** - Most common mistakes
2. **essentials/04: Section 0** - Octave-repeating availability (CRITICAL)
3. **essentials/04: Common Programming Pitfalls** - JavaScript gotchas
4. **core/00: Decolonial Computing Framework** - Epistemological approach to cultural knowledge systems

---

## 🎓 Key Success Principles

### 1. Conditional Loading
- Load only what you need for the task
- Start with core + relevant essentials
- Pull in reference files as needed

### 2. Test-Driven Development
- Write tests BEFORE implementation
- Red → Green → Refactor → Commit
- Only commit when all tests pass

### 3. Cultural Sensitivity & Decolonial Computing
- Ground computational representations in the culture's own theoretical frameworks
- Use culturally appropriate terminology as primary (not parenthetical)
- Avoid framing non-Western concepts as "deviations" from Western norms
- Apply decolonial computing principles systematically

### 4. Musicological Accuracy
- Always use `getNoteNameSetsWithAdjacentOctaves()`
- Never assume symmetric sequences
- Tuning system starting note is MANDATORY

---

For complete documentation including detailed file descriptions, quick topic index, maintenance guidelines, and knowledge preservation protocol, see [.ai-agent-instructions/README.md](./.ai-agent-instructions/README.md).
