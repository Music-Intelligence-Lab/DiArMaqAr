# CLI Commands Reference

**PURPOSE**: Comprehensive reference for all command-line operations in DiArMaqAr.

**LOAD**: When user asks about commands, scripts, or CLI tools.

---

## Development Commands

### Next.js Development

```bash
# Start development server
npm run dev
# → http://localhost:3000
# → Hot module replacement enabled
# → TypeScript errors shown in terminal

# Build production application
npm run build
# → Compiles TypeScript
# → Optimizes bundles
# → Generates static pages
# → Creates .next/ directory

# Start production server
npm start
# → Serves production build
# → Requires npm run build first
# → Use for testing production builds locally

# Run ESLint
npm run lint
# → Checks TypeScript and React code
# → Reports style violations
# → Can auto-fix some issues with --fix
```

---

## Documentation Commands

### TypeDoc

```bash
# Generate TypeDoc documentation
npm run docs
# → Generates docs/ directory
# → API documentation from TSDoc comments
# → Includes type signatures and examples

# Generate and open in browser
npm run docs:serve
# → Generates documentation
# → Opens in default browser
# → Useful for quick review

# Watch mode for documentation
npm run docs:watch
# → Regenerates docs on file changes
# → Useful during documentation writing

# Build VitePress documentation
npm run docs:build
# → Generates public/docs/ directory
# → Static documentation site
# → Deployed to live site
```

---

## Batch Export CLI

### Basic Usage

```bash
# Show help
node scripts/batch-export/batch-export.js --help

# List all available tuning systems
node scripts/batch-export/batch-export.js --list-tuning-systems
# → Shows all tuning system IDs
# → Shows available starting notes for each
# → Use these IDs for --tuning-system flag
```

### Single System Export

```bash
# Export specific tuning system with minimal data
node scripts/batch-export/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "yegāh"

# Export with all details
node scripts/batch-export/batch-export.js \
  --tuning-system "IbnSina-(1037)" \
  --starting-note "ʿushayrān" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations
```

### Batch Export Options

**Tuning System Selection:**
```bash
# Single system
--tuning-system "Al-Farabi-(950g)"

# All systems (generates many GB of data)
--tuning-system "all"
```

**Starting Note Selection:**
```bash
# Single starting note
--starting-note "yegāh"

# All starting notes for the system
--starting-note "all"
```

**Data Inclusion Flags:**
```bash
# Include detailed jins information
--include-ajnas-details

# Include detailed maqām information
--include-maqamat-details

# Include maqām-to-maqām modulations
--include-maqamat-modulations

# Include jins-to-jins modulations
--include-ajnas-modulations
```

**Output Configuration:**
```bash
# Custom output directory
--output-dir "./my-exports"

# Default: ./exports/
```

### Full Batch Export Examples

**Export everything for one system:**
```bash
node scripts/batch-export/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "all" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations \
  --output-dir "./exports/al-farabi"
```

**Export all systems (WARNING: Large data)**:
```bash
node scripts/batch-export/batch-export.js \
  --tuning-system "all" \
  --starting-note "all" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations \
  --output-dir "./exports/complete"

# NOTE: This generates many gigabytes of JSON data
# Can take significant time to complete
# Progress tracking shown in terminal
```

**Minimal export (overview only):**
```bash
node scripts/batch-export/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "yegāh"

# → Creates JSON with:
#    - Tuning system overview
#    - List of available ajnas/maqamat
#    - No detailed data or modulations
```

---

## Testing Commands

```bash
# Run all tests (when implemented)
npm test

# Run specific test file
npm test -- path/to/test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## Data Management

### Backup Data Files

```bash
# Manual backup of JSON data
cp data/ajnas.json data/backups/ajnas.json.backup
cp data/maqamat.json data/backups/maqamat.json.backup
cp data/tuningSystems.json data/backups/tuningSystems.json.backup
cp data/sources.json data/backups/sources.json.backup
cp data/patterns.json data/backups/patterns.json.backup
```

### Validate JSON

```bash
# Validate JSON syntax
node -e "require('./data/ajnas.json')"
node -e "require('./data/maqamat.json')"
node -e "require('./data/tuningSystems.json')"
node -e "require('./data/sources.json')"
node -e "require('./data/patterns.json')"

# Should output nothing if valid
# Will show error if JSON is malformed
```

---

## Git Workflow

### Standard Development Flow

```bash
# Check status
git status

# Create feature branch
git checkout -b feature/your-feature-name

# Stage changes
git add .

# Commit with conventional commits format
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve issue description"
# or
git commit -m "docs: update documentation"

# Push to remote
git push origin feature/your-feature-name
```

### Conventional Commit Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## Deployment

```bash
# Deploy to Netlify (automatic on push to main)
git push origin main

# Manual deploy (if needed)
netlify deploy --prod
```

---

## Troubleshooting Commands

### Clear Caches

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeDoc cache
rm -rf docs/
npm run docs
```

### Debug Build Issues

```bash
# Build with verbose output
npm run build -- --debug

# Check TypeScript compilation
npx tsc --noEmit

# Check for circular dependencies
npx madge --circular --extensions ts,tsx src/
```

### Port Management

```bash
# If port 3000 is in use, find process
lsof -i :3000

# Kill process on port 3000 (macOS/Linux)
kill -9 $(lsof -t -i:3000)

# Or use different port
PORT=3001 npm run dev
```

---

## Performance Analysis

```bash
# Analyze bundle size
npm run build
# → Check .next/analyze/ for bundle reports

# Check for unused dependencies
npx depcheck

# Audit dependencies for vulnerabilities
npm audit
npm audit fix
```

---

## Utility Scripts

### Custom Scripts

**If you create custom scripts**, add them to `scripts/` directory and document here.

**Naming convention:**
- Use kebab-case: `my-utility-script.js`
- Add shebang: `#!/usr/bin/env node`
- Make executable: `chmod +x scripts/my-utility-script.js`

**Example script structure:**
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Your script logic here

// Export for testing
module.exports = { /* functions */ };
```

---

## Environment Variables

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Production
NEXT_PUBLIC_API_URL=https://arabic-maqam-archive.netlify.app/api
```

**Create `.env.local` for local overrides** (gitignored automatically):
```bash
# .env.local
NEXT_PUBLIC_DEBUG=true
```

---

## Summary

**Most Common Commands:**
1. `npm run dev` - Start development
2. `npm run build` - Build for production
3. `npm run docs` - Generate documentation
4. `node scripts/batch-export/batch-export.js --list-tuning-systems` - Export utilities
5. `git status && git add . && git commit -m "message"` - Git workflow

**For further details:**
- See `package.json` for all available scripts
- See `scripts/batch-export/README.md` for export documentation
- See Next.js docs for deployment options
