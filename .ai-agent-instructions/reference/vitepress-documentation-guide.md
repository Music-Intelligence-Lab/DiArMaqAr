# VitePress Documentation Structure Guide

**PURPOSE**: Complete reference for the VitePress documentation system structure, file locations, build commands, and editing guidelines

**LOAD**: Load when working on user-facing documentation or documentation website updates

---

## Overview

The Digital Arabic Maqām Archive uses **VitePress** to generate static documentation from markdown files. The documentation is served at `/docs/` by the Next.js application and is built into `public/docs/`.

### Key Characteristics

- **Static site generator** using markdown files
- **Integrated with main app** via Next.js public directory
- **Bilingual support** (Arabic/English)
- **OpenAPI integration** for API documentation
- **LLM-friendly** with `vitepress-plugin-llms` for AI consumption

---

## Directory Structure

```
docs/                                    # VitePress documentation root
├── .vitepress/
│   └── config.mts                      # VitePress configuration
├── index.md                             # Documentation homepage
├── guide/                               # User guide section
│   ├── index.md                        # Getting Started (main guide entry)
│   ├── quick-start.md                  # Quick start tutorial
│   ├── theoretical-framework.md        # Core concepts
│   ├── tuning-systems.md               # Tuning systems guide
│   ├── ajnas.md                        # Ajnās guide
│   ├── maqamat.md                      # Maqāmāt guide
│   ├── suyur.md                        # Suyūr guide
│   ├── taswir.md                       # Transposition guide
│   ├── intiqal.md                      # Modulation guide
│   ├── audio-synthesis.md              # Audio synthesis guide
│   ├── midi-integration.md             # MIDI integration guide
│   ├── data-export.md                  # Data export guide
│   ├── research-applications.md        # Research use cases
│   ├── cultural-framework.md           # Cultural methodology
│   └── bibliographic-sources.md        # Source attribution
├── api/                                 # API documentation section
│   ├── index.md                        # Auto-generated API reference
│   ├── endpoints-reference.md          # Endpoint details
│   ├── playground.md                   # Interactive API playground
│   └── representative-examples.md      # Example API calls
├── library/                             # TypeScript library documentation
│   └── index.md                        # Library overview
├── openapi.json                         # Auto-generated OpenAPI spec
└── public/                              # Static assets
```

---

## File Location Quick Reference

### Documentation Entry Points

| Page | File Path | Purpose |
|------|-----------|---------|
| **Documentation Homepage** | `docs/index.md` | Landing page with feature overview |
| **Getting Started** | `docs/guide/index.md` | Main entry point for new users |
| **Quick Start Tutorial** | `docs/guide/quick-start.md` | Hands-on tutorial |
| **API Reference** | `docs/api/index.md` | Auto-generated from OpenAPI |
| **Library Docs** | `docs/library/index.md` | TypeScript library overview |

### Core Concept Guides

| Topic | File Path |
|-------|-----------|
| Theoretical Framework | `docs/guide/theoretical-framework.md` |
| Tuning Systems | `docs/guide/tuning-systems.md` |
| Ajnās | `docs/guide/ajnas.md` |
| Maqāmāt | `docs/guide/maqamat.md` |
| Suyūr | `docs/guide/suyur.md` |

### Advanced Feature Guides

| Feature | File Path |
|---------|-----------|
| Taṣwīr (Transposition) | `docs/guide/taswir.md` |
| Intiqāl (Modulation) | `docs/guide/intiqal.md` |
| Audio Synthesis | `docs/guide/audio-synthesis.md` |
| MIDI Integration | `docs/guide/midi-integration.md` |
| Data Export | `docs/guide/data-export.md` |

### Research & Methodology

| Topic | File Path |
|-------|-----------|
| Research Applications | `docs/guide/research-applications.md` |
| Cultural Framework | `docs/guide/cultural-framework.md` |
| Bibliographic Sources | `docs/guide/bibliographic-sources.md` |

---

## VitePress Configuration

**Configuration file**: `docs/.vitepress/config.mts`

### Key Configuration Settings

```typescript
{
  title: 'Digital Arabic Maqām Archive',
  description: 'Comprehensive documentation...',

  // Serving configuration
  base: '/docs/',              // Served at /docs/ by Next.js
  outDir: '../public/docs',    // Build output directory
  cleanUrls: true,             // No .html extensions

  // Features
  lastUpdated: true,           // Show last updated timestamps

  // LLM plugin
  vite: {
    plugins: [llmstxt({ ... })]  // AI-friendly documentation
  }
}
```

### Navigation Structure

The sidebar configuration in `config.mts` defines the navigation hierarchy:

```typescript
sidebar: {
  '/guide/': [
    {
      text: 'Getting Started',
      items: [
        { text: 'Introduction', link: '/guide/' },
        { text: 'Quick Start', link: '/guide/quick-start' }
      ]
    },
    {
      text: 'Core Concepts',
      items: [
        { text: 'Theoretical Framework', link: '/guide/theoretical-framework' },
        // ... more items
      ]
    }
  ]
}
```

**⚠️ IMPORTANT**: When adding new documentation pages, you MUST update the sidebar configuration in `docs/.vitepress/config.mts`

### API Sidebar Navigation Pattern

The API documentation uses a comprehensive left sidebar with collapsible sections and hash links to all endpoints:

```typescript
'/api/': [
  {
    text: 'API Getting Started',  // Explicit "API" prefix for clarity
    collapsed: false,
    items: [
      { text: 'API Overview', link: '/api/' },  // Not just "Overview"
      { text: 'Representative Examples', link: '/api/representative-examples' },
    ]
  },
  {
    text: 'Static Documentation',
    collapsed: false,
    items: [
      {
        text: 'Endpoints Reference',
        link: '/api/endpoints-reference',
        items: [
          // Quick reference sections with hash links
          { text: 'Quick Reference', link: '/api/endpoints-reference#quick-reference' },
          { text: 'Base URL', link: '/api/endpoints-reference#base-url' },
          // ... more sections
        ]
      },
      {
        text: 'Maqāmāt',
        link: '/api/endpoints-reference#maqamat',
        items: [
          // Individual endpoints with hash links
          { text: 'List all maqāmāt', link: '/api/endpoints-reference#listMaqamat' },
          { text: 'Get detailed maqām data', link: '/api/endpoints-reference#getMaqam' },
          // ... all endpoints
        ]
      },
      // ... other resource types
    ]
  },
  {
    text: 'Interactive Playground',
    collapsed: false,
    items: [
      { text: 'OpenAPI Playground', link: '/api/playground' },
      // Tag-based navigation links
      { text: 'Maqāmāt', link: '/api/playground#maqamat' },
      // ... other tags
    ]
  },
]
```

**Key Patterns:**
- **Explicit labeling**: Use "API Getting Started" not just "Getting Started", "API Overview" not just "Overview"
- **Comprehensive endpoint listing**: Include all endpoints with hash links to detailed documentation
- **Collapsible sections**: Use `collapsed: false` for primary sections, `collapsed: true` for secondary
- **Context-aware sidebars**: Different sidebar configs for `/api/`, `/api/playground`, `/api/endpoints-reference`
- **Hash links**: All endpoint links use hash anchors (e.g., `#listMaqamat`) for direct navigation

**API Overview Page (`docs/api/index.md`):**
- Must list ALL endpoints organized by resource type
- Include endpoint count per category (e.g., "Endpoints (7):")
- Each endpoint should link to detailed documentation with hash anchor
- Total endpoint count should be stated at the top

---

## Build Commands

### Development

```bash
# Start VitePress development server (with hot reload)
npm run docs:dev
# → http://localhost:5173/docs/
# → Watches for file changes
# → Auto-regenerates OpenAPI docs
```

### Production Build

```bash
# Generate OpenAPI JSON from YAML
npm run docs:openapi
# → Converts openapi.yaml to openapi.json
# → Outputs to public/docs/openapi.json

# Generate static API documentation
npm run docs:api
# → Generates docs/api/index.md from openapi.yaml
# → Creates markdown for LLM consumption
# → Automatically runs in docs:dev and docs:build

# Build VitePress documentation site
npm run docs:build
# → Runs: docs:openapi → docs:api → vitepress build
# → Outputs to: public/docs/
# → Production-ready static files
```

### Build Pipeline

```
openapi.yaml
    ↓
npm run docs:openapi
    ↓
openapi.json → docs/openapi.json
    ↓
npm run docs:api
    ↓
docs/api/index.md (auto-generated)
    ↓
npm run docs:build
    ↓
public/docs/ (static site)
```

---

## Editing Documentation

### 1. User Guide Pages

**Location**: `docs/guide/*.md`

**Example: Editing Getting Started (`docs/guide/index.md`)**

```bash
# Read the file first
Read: /Users/khyamallami/Offline Files/vscode projects/DiArMaqAr/docs/guide/index.md

# Make edits
Edit: {
  file_path: "/Users/khyamallami/Offline Files/vscode projects/DiArMaqAr/docs/guide/index.md",
  old_string: "old content",
  new_string: "new content"
}

# Preview changes
npm run docs:dev
# → View at http://localhost:5173/docs/guide/
```

### 2. API Documentation

**⚠️ CRITICAL**: `docs/api/index.md` is **AUTO-GENERATED** from `openapi.yaml`

**To update API documentation:**

1. **Edit the source**: Modify `openapi.yaml` (NOT `docs/api/index.md`)
2. **Regenerate**: Run `npm run docs:api`
3. **Verify**: Check `docs/api/index.md` was updated correctly
4. **Build**: Run `npm run docs:build` for production

**Manual API pages** (not auto-generated):
- `docs/api/endpoints-reference.md` - Can be edited directly
- `docs/api/representative-examples.md` - Can be edited directly
- `docs/api/playground.md` - Can be edited directly

### 3. Homepage

**Location**: `docs/index.md`

Uses VitePress home layout with YAML frontmatter:

```yaml
---
layout: home

hero:
  name: "Digital Arabic Maqām Archive"
  text: "Documentation"
  tagline: Open-source bilingual platform...
  actions:
    - theme: brand
      text: Get Started
      link: /guide/

features:
  - title: Comprehensive Data Archive
    details: Historically documented tanāghīm...
---

## What is DiArMaqAr?

Markdown content here...
```

---

## Markdown Standards

### Frontmatter

Use YAML frontmatter for page metadata (optional for most pages):

```yaml
---
title: Page Title
description: Brief description for SEO
---
```

### Headers

```markdown
# Page Title (h1 - only one per page)

## Section (h2 - appears in table of contents)

### Subsection (h3 - appears in table of contents)

#### Detail (h4 - not in TOC)
```

**Table of Contents**: VitePress automatically generates TOC from h2 and h3 headers (configured in `config.mts`)

### Links

```markdown
<!-- Internal links (relative to docs/) -->
[Guide](/guide/)
[Theoretical Framework](/guide/theoretical-framework)
[API Reference](/api/)

<!-- External links -->
[GitHub](https://github.com/Music-Intelligence-Lab/DiArMaqAr)

<!-- Anchor links within page -->
[Jump to section](#section-heading)
```

### Code Blocks

```markdown
\`\`\`typescript
// TypeScript code example
interface Example {
  field: string
}
\`\`\`

\`\`\`bash
# Shell commands
npm run docs:dev
\`\`\`

\`\`\`json
{
  "example": "data"
}
\`\`\`
```

### Alerts/Callouts

VitePress supports custom containers:

```markdown
::: tip
Helpful tip for users
:::

::: warning
Important warning
:::

::: danger
Critical information
:::

::: info
Additional context
:::
```

### Arabic Text

**Use proper Unicode Arabic characters** with correct diacritics:

```markdown
- **maqām** (مقام) - NOT "maqam"
- **jins** (جنس) - NOT "jins"
- **rāst** (راست) - NOT "rast"
```

**Follow cultural-linguistic standards** from `glossary/06-documentation-standards.md`:
- Arabic terminology is primary (not parenthetical)
- No "microtonal" terminology
- Use Library of Congress Romanization

---

## Adding New Documentation Pages

### Checklist

1. ✅ **Create markdown file** in appropriate directory (`docs/guide/`, `docs/api/`, etc.)
2. ✅ **Add frontmatter** (optional but recommended)
3. ✅ **Write content** following markdown standards
4. ✅ **Update sidebar** in `docs/.vitepress/config.mts`
5. ✅ **Add cross-references** from related pages
6. ✅ **Test locally** with `npm run docs:dev`
7. ✅ **Build production** with `npm run docs:build`
8. ✅ **Verify cultural accuracy** (see glossary/06)

### Example: Adding a New Guide Page

**Task**: Add a new page about "Scale Export"

**Step 1: Create file**

```bash
# Create new markdown file
Write: {
  file_path: "/Users/khyamallami/Offline Files/vscode projects/DiArMaqAr/docs/guide/scale-export.md",
  content: "# Scale Export\n\n## Overview\n\n..."
}
```

**Step 2: Update sidebar configuration**

```bash
# Read config
Read: /Users/khyamallami/Offline Files/vscode projects/DiArMaqAr/docs/.vitepress/config.mts

# Add to sidebar
Edit: {
  file_path: "/Users/khyamallami/Offline Files/vscode projects/DiArMaqAr/docs/.vitepress/config.mts",
  old_string: `{
  text: 'Advanced Features',
  collapsed: false,
  items: [
    { text: 'Taṣwīr (Transposition)', link: '/guide/taswir' },
    { text: 'Intiqāl (Modulation)', link: '/guide/intiqal' },
    { text: 'Audio Synthesis', link: '/guide/audio-synthesis' },
    { text: 'MIDI Integration', link: '/guide/midi-integration' },
    { text: 'Data Export', link: '/guide/data-export' },
  ]
}`,
  new_string: `{
  text: 'Advanced Features',
  collapsed: false,
  items: [
    { text: 'Taṣwīr (Transposition)', link: '/guide/taswir' },
    { text: 'Intiqāl (Modulation)', link: '/guide/intiqal' },
    { text: 'Audio Synthesis', link: '/guide/audio-synthesis' },
    { text: 'MIDI Integration', link: '/guide/midi-integration' },
    { text: 'Data Export', link: '/guide/data-export' },
    { text: 'Scale Export', link: '/guide/scale-export' },
  ]
}`
}
```

**Step 3: Test**

```bash
npm run docs:dev
# → Visit http://localhost:5173/docs/guide/scale-export
# → Verify page appears in sidebar
```

---

## Content Guidelines

### Documentation Tone

- **Clear and direct** - No marketing language
- **Technical but accessible** - Explain concepts without jargon
- **Respectful of culture** - Follow decolonial computing principles
- **Example-driven** - Show, don't just tell

### Target Audiences

The documentation serves multiple audiences:

1. **Musicians & Composers** - Need practical guides and audio features
2. **Developers** - Need API reference and code examples
3. **Researchers** - Need theoretical framework and source attribution
4. **AI/ML Engineers** - Need data export and computational features

**Adjust depth accordingly** but maintain accuracy across all pages.

### Cultural Sensitivity Requirements

**From `glossary/06-documentation-standards.md`:**

✅ **Do**:
- Use culturally appropriate terminology as primary
- Ground in Arabic theoretical frameworks
- Include bibliographic attribution
- Use Library of Congress Romanization
- Respect epistemological traditions

❌ **Don't**:
- Use "microtonal" (use "unequal divisions" or specific cultural terms)
- Frame as "like Western music but..."
- Use parenthetical English definitions for primary terms
- Assume Western music theory as default

---

## Common Documentation Tasks

### Task 1: Update Getting Started

**File**: `docs/guide/index.md`

```bash
# 1. Read current content
Read: /Users/khyamallami/Offline Files/vscode projects/DiArMaqAr/docs/guide/index.md

# 2. Make edits using Edit tool
Edit: { ... }

# 3. Preview locally
npm run docs:dev

# 4. Build for production
npm run docs:build
```

### Task 2: Update API Documentation

**Source**: `openapi.yaml` (NOT `docs/api/index.md`)

```bash
# 1. Edit OpenAPI spec
Read: /Users/khyamallami/Offline Files/vscode projects/DiArMaqAr/openapi.yaml
Edit: { file_path: "openapi.yaml", ... }

# 2. Regenerate API docs
npm run docs:api

# 3. Verify auto-generated file
Read: /Users/khyamallami/Offline Files/vscode projects/DiArMaqAr/docs/api/index.md

# 4. Build
npm run docs:build
```

### Task 3: Add New Feature Documentation

```bash
# 1. Create new markdown file in docs/guide/
Write: { file_path: "docs/guide/new-feature.md", ... }

# 2. Update sidebar in config.mts
Edit: { file_path: "docs/.vitepress/config.mts", ... }

# 3. Add cross-references from related pages
Edit: { file_path: "docs/guide/related-page.md", ... }

# 4. Test and build
npm run docs:dev
npm run docs:build
```

### Task 4: Update Homepage Features

**File**: `docs/index.md`

```bash
# Edit the features section in frontmatter
Edit: {
  file_path: "docs/index.md",
  old_string: "features:\n  - title: Old Feature\n    details: Old description",
  new_string: "features:\n  - title: New Feature\n    details: New description"
}
```

---

## Integration with Main Application

### Build Output

VitePress builds to `public/docs/`, which Next.js serves statically:

```
VitePress build → public/docs/
                      ↓
          Next.js serves at /docs/
                      ↓
          Users access at https://example.com/docs/
```

### URL Structure

| Page | Development URL | Production URL |
|------|----------------|----------------|
| Docs home | `http://localhost:5173/docs/` | `https://diarmaqar.netlify.app/docs/` |
| Getting Started | `http://localhost:5173/docs/guide/` | `https://diarmaqar.netlify.app/docs/guide/` |
| API Reference | `http://localhost:5173/docs/api/` | `https://diarmaqar.netlify.app/docs/api/` |

### OpenAPI Integration

The project uses `vitepress-openapi` plugin to integrate API documentation:

```typescript
// In config.mts
import vitepress-openapi from 'vitepress-openapi'

// Automatically processes openapi.json and generates API pages
```

**Workflow**:
1. Edit `openapi.yaml`
2. Run `npm run docs:openapi` → generates `openapi.json`
3. Run `npm run docs:api` → generates `docs/api/index.md`
4. VitePress renders during build

---

## Testing Documentation

### Local Testing

```bash
# Development server with hot reload
npm run docs:dev
# → http://localhost:5173/docs/

# Test specific sections:
# - Navigation (sidebar links work)
# - Cross-references (internal links work)
# - Code examples (syntax highlighting works)
# - Arabic text (displays correctly with diacritics)
# - Search functionality (can find content)
```

### Production Build Testing

```bash
# Build production site
npm run docs:build

# Preview production build locally
npm run docs:preview
# → http://localhost:4173/docs/

# Verify:
# - All pages build without errors
# - Links work in production build
# - Assets load correctly
# - No 404 errors
```

### Validation Checklist

✅ **Content**:
- [ ] Headers follow h1 → h2 → h3 hierarchy
- [ ] Code examples are tested and accurate
- [ ] Cross-references link to existing pages
- [ ] Arabic text displays with proper diacritics

✅ **Cultural Accuracy**:
- [ ] No "microtonal" terminology
- [ ] Arabic terminology is primary
- [ ] Follows decolonial computing principles
- [ ] Bibliographic attribution when relevant

✅ **Navigation**:
- [ ] Page appears in sidebar (if applicable)
- [ ] Previous/Next navigation works
- [ ] Table of contents generates correctly
- [ ] Search can find the content

✅ **Technical**:
- [ ] Builds without errors
- [ ] Links don't produce 404s
- [ ] Images/assets load correctly
- [ ] Mobile-responsive layout works

---

## Troubleshooting

### Issue: Page doesn't appear in sidebar

**Solution**: Add entry to `docs/.vitepress/config.mts` in the appropriate `sidebar` section

### Issue: API documentation out of date

**Solution**:
1. Edit `openapi.yaml` (source of truth)
2. Run `npm run docs:api` to regenerate
3. Don't manually edit `docs/api/index.md`

### Issue: Build fails with "File not found"

**Solution**:
- Check link paths are correct (relative to `docs/` root)
- Verify file extensions match (`.md` not `.html`)
- Ensure file exists at referenced path

### Issue: Arabic text displays incorrectly

**Solution**:
- Use proper Unicode characters (not ASCII approximations)
- Include diacritical marks (macrons, dots)
- Check font supports Arabic script
- Verify proper RTL/LTR directionality

### Issue: Changes don't appear in dev server

**Solution**:
- Stop and restart `npm run docs:dev`
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Check file is saved
- Verify file is in correct location

---

## Best Practices

### 1. Content Organization

- **One topic per page** - Don't combine unrelated topics
- **Logical hierarchy** - Use proper heading levels
- **Progressive disclosure** - Start simple, add detail progressively
- **Cross-reference liberally** - Link to related pages

### 2. Writing Style

- **Active voice** - "Export data to JSON" not "Data can be exported"
- **Present tense** - "The API returns" not "The API will return"
- **Concrete examples** - Show real code, real API calls
- **No assumptions** - Don't assume prior knowledge

### 3. Code Examples

- **Tested and accurate** - All code must actually work
- **Self-contained** - Include necessary imports/context
- **Commented** - Explain non-obvious parts
- **Realistic** - Use real maqām names, tuning systems, etc.

### 4. Maintenance

- **Keep in sync** - Update docs when code changes
- **Regular audits** - Quarterly review for accuracy
- **Version appropriately** - Note which version docs apply to
- **Track last updated** - Use VitePress `lastUpdated` feature

---

## Related Files

- **API documentation standards**: `glossary/06-documentation-standards.md`
- **CLI commands reference**: `reference/cli-commands-guide.md`
- **OpenAPI formatting**: `reference/openapi-formatting-guide.md`
- **Musicological definitions**: `glossary/07-musicological-definitions.md`

---

*Last Updated: 2025-11-20*
