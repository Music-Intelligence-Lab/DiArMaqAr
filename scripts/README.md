# Digital Arabic Maqām Archive - Scripts

This directory contains utility scripts for the Digital Arabic Maqām Archive project.

## Available Scripts

### Batch Export CLI
**Location:** `batch-export/`

A comprehensive command-line tool for batch exporting tuning system data in JSON format. Provides the same data structure as the web export modal but optimized for programmatic use.

**Features:**
- Export any tuning system with any starting note
- Batch export all systems and configurations
- Complete data structures including modulations
- Progress tracking and error handling
- Filename sanitization and organization

**Quick Start:**
```bash
# List available tuning systems
node scripts/batch-export/batch-export.js --list-tuning-systems

# Basic export
node scripts/batch-export/batch-export.js --tuning-system "alfarabi_950g" --starting-note "yegāh"

# Complete export with modulations
node scripts/batch-export/batch-export.js \
  --tuning-system "alfarabi_950g" \
  --starting-note "yegāh" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations
```

See `batch-export/README.md` for complete documentation.

### Documentation Generation Scripts
**Location:** `docs/scripts/`

Scripts for generating and maintaining the DiArMaqAr documentation, including OpenAPI JSON generation, API documentation generation, and LLM-friendly documentation post-processing.

**Quick Start:**
```bash
# Generate OpenAPI JSON files
npm run docs:openapi

# Generate API documentation
npm run docs:api

# Build complete documentation (runs all generation scripts)
npm run docs:build
```

See `docs/scripts/README.md` for complete documentation.

## Development

All scripts are designed to be run from the project root directory and automatically handle:
- TypeScript compilation via `tsx`
- Path resolution using project aliases
- Access to the complete data model and functions

## Contributing

When adding new scripts:
1. Create a dedicated subdirectory
2. Include a README with usage instructions
3. Use the existing project conventions and imports
4. Update this main README with the new script information