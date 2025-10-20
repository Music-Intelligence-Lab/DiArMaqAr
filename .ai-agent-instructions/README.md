# AI Agent Instructions

**Centralized instruction documents for AI assistants working on the Digital Arabic Maqām Archive**

---

## Quick Navigation

### 🤖 For Any AI Assistant

**Start here**: [`00-ai-agent-personality.md`](./00-ai-agent-personality.md)
- Defines personality, mindset, and knowledge framework
- **Universal** - applies to any software development project
- Covers decolonial computing and culturally sensitive approaches

---

### 📋 Project-Specific Instructions

These files contain instructions specific to the DiArMaqAr project:

1. **[`01-project-overview.md`](./01-project-overview.md)**
   - Project description and goals
   - Tech stack and high-level architecture
   - Common commands and workflows
   - Repository information

2. **[`02-architecture.md`](./02-architecture.md)**
   - Detailed technical architecture
   - Directory structure
   - Context provider hierarchy
   - Data model relationships
   - Integration patterns

3. **[`03-development-conventions.md`](./03-development-conventions.md)**
   - Coding standards and best practices
   - Component creation patterns
   - API development standards
   - Performance optimization
   - Error handling

4. **[`04-musicological-principles.md`](./04-musicological-principles.md)**
   - Arabic maqām theory fundamentals
   - Critical musicological insights
   - Common programming pitfalls
   - Cultural considerations

5. **[`05-testing-guide.md`](./05-testing-guide.md)**
   - Manual testing protocols
   - Priority test cases
   - Debugging procedures
   - Regression testing checklist

6. **[`06-documentation-standards.md`](./06-documentation-standards.md)**
   - Cultural-linguistic accuracy
   - Documentation architecture
   - Property documentation patterns
   - API documentation standards

---

## How to Use These Files

### For General Development Tasks

1. Read **`00-ai-agent-personality.md`** first (if first time)
   - **Note**: Includes important guidance on using MCP servers (Context7, Playwright)
2. Skim **`01-project-overview.md`** to understand the project
3. Reference **`02-architecture.md`** and **`03-development-conventions.md`** as needed
   - **Note**: `03-development-conventions.md` has MCP usage guidelines
4. Consult **`04-musicological-principles.md`** when working with music theory logic

### For Testing Tasks

1. Use **`05-testing-guide.md`** for comprehensive testing protocols
2. Consider using **Playwright MCP** for automated browser testing
3. Reference **`04-musicological-principles.md`** to understand expected behaviors

### For Documentation Tasks

1. Follow **`06-documentation-standards.md`** for all documentation
2. Use **Context7 MCP** to fetch current library documentation when needed
3. Reference **`00-ai-agent-personality.md`** for cultural sensitivity guidelines

### For Bug Fixes

1. Check **`04-musicological-principles.md`** for common pitfalls
2. Use **`05-testing-guide.md`** debugging protocols
3. Reference **`02-architecture.md`** to understand data flow

---

## File Organization Principles

### Numbered Prefixes

Files are numbered to suggest a reading order:
- **00**: Universal principles (any project)
- **01**: Project introduction
- **02-03**: Technical implementation
- **04**: Domain-specific knowledge (music theory)
- **05-06**: Quality assurance (testing, documentation)

### Separation of Concerns

- **Architecture** (02) vs **Conventions** (03): Structure vs style
- **Principles** (04) vs **Testing** (05): Theory vs practice
- **Universal** (00) vs **Project-specific** (01-06): Reusable vs contextual

---

## Maintenance Guidelines

### When to Update These Files

**Update immediately when:**
- Discovering new musicological insights during debugging
- Establishing new architectural patterns
- Identifying common pitfalls or best practices
- Changing core conventions or standards

**Update during quarterly reviews:**
- Verify all examples still match current codebase
- Check links and cross-references
- Update testing scenarios based on new features
- Refresh documentation based on evolved patterns

### Knowledge Preservation Protocol

After completing tasks successfully:
1. Review work for unique insights
2. Document findings in appropriate file(s)
3. Include specific examples from implementation
4. Explain implications for future development

---

## Finding the Right File Quickly

### By Task Type

| Task | Primary File | Secondary Files |
|------|-------------|-----------------|
| **New feature** | 03-development-conventions.md | 02-architecture.md |
| **Bug fix** | 04-musicological-principles.md | 05-testing-guide.md |
| **API endpoint** | 03-development-conventions.md | 02-architecture.md |
| **Documentation** | 06-documentation-standards.md | 00-ai-agent-personality.md |
| **Testing** | 05-testing-guide.md | 04-musicological-principles.md |
| **Architecture question** | 02-architecture.md | 01-project-overview.md |

### By Topic

| Topic | File |
|-------|------|
| **Decolonial computing** | 00-ai-agent-personality.md |
| **Cultural sensitivity** | 00-ai-agent-personality.md, 06-documentation-standards.md |
| **Asymmetric maqāmāt** | 04-musicological-principles.md |
| **Enharmonic spelling** | 04-musicological-principles.md |
| **Context providers** | 02-architecture.md |
| **Transposition algorithms** | 02-architecture.md, 04-musicological-principles.md |
| **Modulation analysis** | 04-musicological-principles.md |
| **API patterns** | 03-development-conventions.md |
| **SCSS modules** | 03-development-conventions.md |
| **Tuning systems** | 01-project-overview.md, 04-musicological-principles.md |
| **Testing maqāmāt** | 05-testing-guide.md |
| **Property documentation** | 06-documentation-standards.md |

---

## Version Control

This folder (`.ai-agent-instructions/`) is added to `.gitignore` to allow local customization without affecting the repository. However, the contents should be preserved and shared when:

- Setting up new development environments
- Onboarding new AI assistants
- Archiving project knowledge
- Creating project documentation

---

## Philosophy

These instructions embody:

1. **Cultural Sensitivity**: Decolonial computing principles applied practically
2. **Knowledge Preservation**: Insights from debugging become lasting wisdom
3. **Progressive Disclosure**: Start simple, dig deeper as needed
4. **Practical Focus**: Real examples, real code, real scenarios
5. **Living Documentation**: Updated continuously as project evolves

---

*Last Updated: 2025-10-19*
*These instructions represent accumulated knowledge from months of development, debugging, and musicological research.*
