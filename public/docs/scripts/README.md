---
url: /docs/scripts/README.md
---
# Documentation Generation Scripts

This folder contains scripts used for generating and maintaining the DiArMaqAr documentation.

## Scripts

### `generate-openapi-json.js`

Converts the OpenAPI YAML specification (`openapi.yaml`) to JSON format and places it in multiple locations:

* `public/docs/openapi.json` - For Next.js to serve directly
* `docs/public/openapi.json` - For VitePress to copy during build
* `docs/openapi.json` - Legacy location

Also copies the YAML file to `public/docs/openapi.yaml` and `docs/public/openapi.yaml`.

**Usage:**

```bash
npm run docs:openapi
```

### `generate-api-docs.js`

Generates comprehensive API endpoint reference documentation from the OpenAPI specification. Outputs to `docs/api/endpoints-reference.md`.

**Usage:**

```bash
npm run docs:api
```

### `post-process-llms-txt.js`

Post-processes the generated `docs/llms.txt` file (created by `vitepress-plugin-llms`) to add:

* Link to `llms-full.txt`
* Link to root-level `/llms.txt`
* API instructions section at the top with Representative Examples
* Replaces any "Canonical Examples" references with "Representative Examples"

**Usage:**
Automatically runs as part of `npm run docs:build`, or manually:

```bash
node scripts/docs/post-process-llms-txt.js
```

### `test-docs-locally.sh`

Bash script for testing API documentation locally without deploying to Netlify. Tests:

* `/docs/openapi.json` endpoint
* `/api/openapi.json` endpoint
* `/docs/api/` page

**Usage:**

```bash
# Make sure Next.js dev server is running first
npm run dev

# In another terminal
./docs/scripts/test-docs-locally.sh
```

## Path References

All scripts use `__dirname` with relative paths to reference project locations:

* To project root: `../..` (up from `scripts/` to `docs/`, then up to root)
* To files within `docs/`: `..` (up from `scripts/` to `docs/`)
* Scripts are located in `docs/scripts/` (two levels deep from the root)

## Integration

These scripts are integrated into npm scripts in `package.json`:

* `docs:openapi` - Generates OpenAPI JSON files
* `docs:api` - Generates API documentation
* `docs:dev` - Runs both generation scripts then starts VitePress dev server
* `docs:build` - Runs generation scripts, builds VitePress docs, then post-processes llms.txt
