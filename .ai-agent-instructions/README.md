# AI Agent Instructions

**Centralized instruction documents for AI assistants working on the Digital Arabic Maqām Archive**

---

## 📊 Recent Updates (2025-10-29)

**Major Improvements:**
- ✅ Added comprehensive TDD (Test-Driven Development) workflow to 03-development-conventions.md
- ✅ Reduced 03-development-conventions.md from 1,353 to 680 lines (50% reduction)
- ✅ Restructured SESSION_SUMMARY.md from 1,330 to 547 lines (59% reduction)
- ✅ Added quick reference sections for faster scanning
- ✅ Consolidated cultural principles and removed redundancy
- ✅ Improved table-based formats for better scanability

---

## 🚀 Quick Start

### For First-Time AI Assistants
1. **Read** [`00-ai-agent-personality.md`](./00-ai-agent-personality.md) - Universal principles
2. **Skim** [`01-project-overview.md`](./01-project-overview.md) - Project context
3. **Bookmark** [`03-development-conventions.md`](./03-development-conventions.md) - Most-used reference

### For Specific Tasks
| Task Type | Primary File | Quick Reference |
|-----------|--------------|-----------------|
| **New feature** | 03-development-conventions.md | TDD workflow, component patterns |
| **Bug fix** | 04-musicological-principles.md | Common pitfalls section |
| **API endpoint** | 03-development-conventions.md → API section | Standard route pattern |
| **Documentation** | 06-documentation-standards.md | Property tables, JSDoc |
| **Testing** | 05-testing-guide.md + 03 TDD section | Manual + automated testing |
| **Terminology** | 07-musicological-definitions.md | All term definitions |

---

## 📁 File Organization

### Universal Principles
**[`00-ai-agent-personality.md`](./00-ai-agent-personality.md)** (358 lines)
- Decolonial computing framework
- Cultural sensitivity in computational musicology
- Development philosophy
- Communication style

### Project-Specific Instructions

**[`01-project-overview.md`](./01-project-overview.md)** (302 lines)
- Project description and goals
- Tech stack overview
- Common commands
- Repository information

**[`02-architecture.md`](./02-architecture.md)** (600 lines)
- Technical architecture
- Context provider hierarchy
- Data model relationships
- Integration patterns

**[`03-development-conventions.md`](./03-development-conventions.md)** ⭐ (680 lines) - **MOST USED**
- **Quick reference section** (new)
- **TDD workflow** (new)
- Component creation patterns
- API development standards
- Common patterns
- MCP server usage

**[`04-musicological-principles.md`](./04-musicological-principles.md)** (588 lines)
- Arabic maqām theory fundamentals
- Critical implementation requirements
- Common programming pitfalls
- Octave-repeating vs non-octave-repeating

**[`05-testing-guide.md`](./05-testing-guide.md)** (440 lines)
- Manual testing protocols
- Priority test cases
- Debugging procedures
- Integration with TDD (see 03)

**[`06-documentation-standards.md`](./06-documentation-standards.md)** (495 lines)
- Cultural-linguistic accuracy
- Property documentation patterns
- JSDoc standards
- API documentation requirements

**[`07-musicological-definitions.md`](./07-musicological-definitions.md)** ⭐ (NEW)
- Comprehensive definitions of all musicological terms
- Grounded in Arabic maqām theory logic
- Clarifications on differences from Anglo-European concepts
- Essential reference for understanding terminology

---

## 🎯 Using These Instructions Effectively

### Before Starting Any Task

**1. Check the quick reference in 03-development-conventions.md**
- Must-know defaults
- Critical rules
- Auto-implementation triggers

**2. Follow TDD workflow (in 03)**
```
RED (write test) → GREEN (minimal code) → REFACTOR → COMMIT
```

**3. Validate before committing**
- Run automated tests
- Check consistency with similar code
- Verify in browser/API playground

### During Development

**Component creation?** → 03: Component Checklist
**API endpoint?** → 03: Standard Route Pattern + TDD for APIs
**Maqām logic?** → 04: Musicological Principles
**Documentation?** → 06: Documentation Standards

### After Completing Tasks

**Document significant findings** in appropriate file:
- New patterns → 03-development-conventions.md
- Music theory insights → 04-musicological-principles.md
- Testing scenarios → 05-testing-guide.md

---

## 📊 File Size & Scannability

| File | Lines | Status | Scanability |
|------|-------|--------|-------------|
| 00-ai-agent-personality.md | 358 | ✅ Optimized | ⭐⭐⭐⭐⭐ |
| 01-project-overview.md | 302 | ✅ Optimized | ⭐⭐⭐⭐⭐ |
| 02-architecture.md | 600 | ✅ Good | ⭐⭐⭐⭐ |
| 03-development-conventions.md | 680 | ✅ **Improved** | ⭐⭐⭐⭐⭐ |
| 04-musicological-principles.md | 588 | ✅ Good | ⭐⭐⭐⭐ |
| 05-testing-guide.md | 440 | ✅ Good | ⭐⭐⭐⭐ |
| 06-documentation-standards.md | 495 | ✅ Good | ⭐⭐⭐⭐ |

---

## 🔍 Finding Information Fast

### By Topic Quick Index

| Topic | File | Section |
|-------|------|---------|
| **TDD workflow** | 03 | Test-Driven Development |
| **API patterns** | 03 | API Development Standards |
| **Error handling** | 03 | API Development → Validation |
| **Component patterns** | 03 | Component Creation Checklist |
| **MCP servers usage** | 03 | Tools & MCP Servers |
| **Cultural sensitivity** | 00 | Decolonial Computing Framework |
| **Octave-repeating maqāmāt** | 04 | Section 0 |
| **Asymmetric sequences** | 04 | Section 1 |
| **Family classification** | 04 | Section 11 + 03 Common Patterns |
| **Context providers** | 02 | Context Provider Hierarchy |
| **Enharmonic spelling** | 04 | Section 3 |
| **Testing protocols** | 05 | Testing Protocols |
| **Property docs** | 06 | Property Documentation |

### By Question Type

**"How do I...?"**
- Create a component → 03: Component Creation Checklist
- Build an API → 03: API Development Standards + TDD
- Test my code → 03: TDD + 05: Manual Testing
- Document this → 06: Documentation Standards

**"Why is...?"**
- Check musicological principles → 04
- Understand architecture → 02
- Learn cultural context → 00

**"What's the pattern for...?"**
- 03: Common Patterns (Quick Reference)
- Search file for specific pattern name

---

## ⚠️ Common Mistakes to Avoid

**Read these sections first to avoid common issues:**

1. **03: Critical Rules table** - Most common mistakes
2. **04: Section 0** - Octave-repeating availability (CRITICAL)
3. **04: Common Programming Pitfalls** - JavaScript gotchas
4. **03: Common Pitfalls table** - Quick reference

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
- Check cross-references
- Update testing scenarios
- Refresh based on evolved patterns

### Knowledge Preservation Protocol

After successful task completion:
1. Review for unique insights
2. Document in appropriate file with examples
3. Explain implications for future development
4. Add to testing scenarios if applicable

---

## 🎯 Key Success Principles

### 1. Test-Driven Development
- Write tests BEFORE implementation
- Red → Green → Refactor → Commit
- Only commit when all tests pass

### 2. Cultural Sensitivity
- Never use "microtonal"
- Respect Arabic terminology as primary
- Apply decolonial computing principles

### 3. Consistency
- Check similar code for patterns
- Follow established conventions
- Validate before committing

### 4. Musicological Accuracy
- Always use `getNoteNameSetsWithAdjacentOctaves()`
- Never assume symmetric sequences
- Tuning system starting note is MANDATORY

---

## 📚 External Resources Integration

**MCP Servers Available:**
- **Context7**: Current library documentation
- **Playwright**: Browser automation for testing

See `03-development-conventions.md` → Tools & MCP Servers for usage guidelines.

---

## 🎓 Philosophy

These instructions embody:

1. **Test-Driven Development**: Quality through systematic testing
2. **Cultural Sensitivity**: Decolonial computing in practice
3. **Knowledge Preservation**: Insights become lasting wisdom
4. **Progressive Disclosure**: Quick reference → detailed reference
5. **Practical Focus**: Real examples, real scenarios
6. **Living Documentation**: Continuously evolved

---

*Last Updated: 2025-10-29*
*Major revision: Added TDD workflow, improved scanability, reduced redundancy*
