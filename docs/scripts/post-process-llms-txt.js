#!/usr/bin/env node

/**
 * Post-processes the generated docs/llms.txt file to add:
 * - Link to llms-full.txt
 * - Link to root-level /llms.txt
 * - API instructions section at the top
 */

const fs = require('fs');
const path = require('path');
const { CANONICAL_PROJECT_DESCRIPTION } = require('../.vitepress/canonical-description');

const BASE_URL = 'https://diarmaqar.netlify.app/api';

const COLD_START_WORKFLOW_BLOCK = `## Cold-start discovery workflow

If you don't have a specific maqām / jins / tuning system to go on,
follow this chain:

1. \`GET /api/maqamat\`                               → pick an \`idName\` from \`data[]\`
2. \`GET /api/maqamat/{idName}/availability\`         → pick a compatible
                                                      \`tuningSystem\` + \`startingNote\`
3. \`GET /api/maqamat/{idName}?tuningSystem=…&startingNote=…&pitchClassDataType=cents\`

Parallel chains for ajnās, tuning systems, pitch classes, intervals,
and sources follow the same pattern: **list → availability → detail**.

If you omit required parameters, the API returns a 400 response with a
\`hint\` field pointing at the next URL to call. Follow it.

---

`;

/** Wrap a paragraph into a Markdown blockquote with lines of ~max chars,
 *  each line prefixed with `> `. Used for /llms.txt per the llmstxt.org shape. */
function toBlockquote(paragraph, max = 75) {
  const words = paragraph.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (line.length === 0) {
      line = w;
    } else if (line.length + 1 + w.length > max) {
      lines.push(line);
      line = w;
    } else {
      line += ' ' + w;
    }
  }
  if (line) lines.push(line);
  return lines.map((l) => '> ' + l).join('\n');
}

const ROOT_LLMS_TXT = `# Digital Arabic Maqām Archive (DiArMaqAr)

${toBlockquote(CANONICAL_PROJECT_DESCRIPTION)}

## Documentation
- [LLM-optimized index](/docs/llms.txt)
- [Full LLM documentation bundle](/docs/llms-full.txt)
- [OpenAPI specification](/docs/openapi.json)
- [API reference](/docs/api/)
- [Representative examples](/docs/api/representative-examples)

## API
- Base URL: ${BASE_URL}
- No authentication required
- See /docs/llms.txt for required-parameter rules and a cold-start
  discovery workflow.
`;

const llmsTxtPath = path.join(__dirname, '../..', 'public', 'docs', 'llms.txt');

if (!fs.existsSync(llmsTxtPath)) {
  console.warn(`Warning: ${llmsTxtPath} not found. Skipping post-processing.`);
  process.exit(0);
}

let content = fs.readFileSync(llmsTxtPath, 'utf-8');

// API instructions header to add at the top (after title)
const apiInstructionsHeader = `## For AI Assistants: API Access

**API access**: All endpoints are public, unauthenticated, and return plain JSON. No browser, cookies, or authentication required. Standard HTTP GET requests work from any client (curl, fetch, etc.).

**Recommended for AI Assistants**: Use the REST API to fetch real-time, accurate data for users. Always prefer API calls over documentation summaries for real-time data accuracy.

**Base URL**: https://diarmaqar.netlify.app/api
**OpenAPI Specification**: /docs/openapi.json
**Representative Examples**: /docs/api/representative-examples

### Example Requests for Novice Users

For users who don't know specific maqam names, use these representative examples:

**Most Common Examples (Recommended for beginners):**
- "Tell me about a fundamental Arabic maqam" → GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
- "Show me a basic jins" → GET /api/ajnas/jins_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
- "What tuning systems are available?" → GET /api/tuning-systems
- "What maqām families exist?" → GET /api/maqamat/families?tuningSystem=ibnsina_1037&startingNote=yegah
- "Show me the most common tuning system" → GET /api/tuning-systems/ibnsina_1037/yegah/pitch-classes?pitchClassDataType=cents

**Quick Test URL (Copy-paste ready):**
\`\`\`
GET https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
\`\`\`

**When users ask general questions:**
- "What is a maqam?" → Use GET /api/maqamat/maqam_rast (most fundamental example)
- "Show me an Arabic scale" → Use GET /api/maqamat/maqam_rast (representative example)
- "What are the intervals?" → Use GET /api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
- "Compare different tuning systems" → GET /api/maqamat/maqam_rast/compare?tuningSystems=ibnsina_1037,alfarabi_950g&startingNote=yegah

**Representative Examples Reference:**
- See /docs/api/representative-examples for complete list of recommended examples

All endpoints return JSON with complete data including pitch classes, intervals, bibliographic sources, and more. Use the OpenAPI specification at /docs/openapi.json for complete endpoint documentation and parameter details.

---

## Discovery
- robots.txt: /robots.txt
- Sitemap: /sitemap.xml

## Documentation Links

- [Full LLM Documentation](/docs/llms-full.txt) - Complete documentation content
- [Root LLM Index](/llms.txt) - Root-level LLM-friendly index
- [Main Documentation](/docs/) - Human-readable documentation
- [API Documentation](/docs/api/) - Complete API reference
- [Representative Examples](/docs/api/representative-examples) - Ready-to-use API examples

---

`;

// Replace any references to canonical-examples with representative-examples FIRST
// Replace in URLs (handles both canonical-examples and canonical-examples.md)
content = content.replace(/canonical-examples/gi, 'representative-examples');
// Replace in markdown links - handle both [Canonical Examples](...) and [Canonical Examples](/docs/api/canonical-examples.md)
content = content.replace(/\[Canonical Examples\]\([^)]*canonical-examples[^)]*\)/gi, (match) => {
  return match.replace(/canonical-examples/gi, 'representative-examples').replace(/Canonical Examples/gi, 'Representative Examples');
});
// Replace standalone link text [Canonical Examples]
content = content.replace(/\[Canonical Examples\]/gi, '[Representative Examples]');
// Replace standalone text
content = content.replace(/\bCanonical Examples\b/gi, 'Representative Examples');

// Check if API instructions are already present
if (content.includes('## For AI Assistants: API Access')) {
  console.log('API instructions already present in docs/llms.txt, skipping addition.');
} else {
  // Find the position after the title/description (after first heading and description)
  const titleMatch = content.match(/^# .+$/m);
  if (titleMatch) {
    const afterTitle = content.indexOf('\n', titleMatch.index + titleMatch[0].length);
    // Find the next heading or table of contents
    const nextSectionMatch = content.match(/\n## /, afterTitle);
    if (nextSectionMatch) {
      // Insert API instructions before the first ## section
      content = content.slice(0, nextSectionMatch.index + 1) + 
                apiInstructionsHeader + 
                content.slice(nextSectionMatch.index + 1);
    } else {
      // If no ## section found, append at the beginning after title
      content = content.slice(0, afterTitle + 1) + 
                apiInstructionsHeader + 
                content.slice(afterTitle + 1);
    }
  } else {
    // If no title found, prepend
    content = apiInstructionsHeader + content;
  }
}

// Workstream C2: inject cold-start workflow block after the For AI Assistants section
if (!content.includes('## Cold-start discovery workflow')) {
  const aiAccessMatch = content.match(/## For AI Assistants: API Access[\s\S]*?\n---\n/);
  if (aiAccessMatch) {
    const insertPos = aiAccessMatch.index + aiAccessMatch[0].length;
    content = content.slice(0, insertPos) + '\n' + COLD_START_WORKFLOW_BLOCK + content.slice(insertPos);
    console.log('✓ Injected cold-start workflow block into docs/llms.txt');
  } else {
    console.warn('⚠ Could not locate For AI Assistants block; cold-start workflow NOT injected.');
  }
} else {
  console.log('Cold-start workflow already present in docs/llms.txt, skipping injection.');
}

// Ensure links to llms-full.txt and root llms.txt are present
if (!content.includes('/docs/llms-full.txt')) {
  // Add link if not present
  const tocMatch = content.match(/## Table of Contents/);
  if (tocMatch) {
    const afterToc = content.indexOf('\n', tocMatch.index);
    content = content.slice(0, afterToc + 1) + 
              '\n- [Full LLM Documentation](/docs/llms-full.txt) - Complete documentation content\n' +
              '- [Root LLM Index](/llms.txt) - Root-level LLM-friendly index\n' +
              content.slice(afterToc + 1);
  }
}

// Ensure link to representative-examples is present
if (!content.includes('/docs/api/representative-examples')) {
  // Try to add it near API documentation references
  const apiDocMatch = content.match(/API Documentation|\/docs\/api\//);
  if (apiDocMatch) {
    const insertPos = content.indexOf('\n', apiDocMatch.index);
    content = content.slice(0, insertPos) + 
              '\n- [Representative Examples](/docs/api/representative-examples) - Ready-to-use API examples' +
              content.slice(insertPos);
  }
}

// Deduplicate TOC links: vitepress-plugin-llms produces duplicates when nested sidebar items
// (Maqāmāt, Ajnās, etc.) all point to the same file with different hashes
const tocStart = content.indexOf('## Table of Contents');
if (tocStart !== -1) {
  const beforeToc = content.slice(0, tocStart);
  const tocSection = content.slice(tocStart);
  const lines = tocSection.split('\n');
  const seenUrls = new Set();
  const dedupedLines = lines.map((line) => {
    const match = line.match(/^- \[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      const url = match[2].replace(/#.*$/, ''); // Normalize: strip hash for dedup
      if (seenUrls.has(url)) return null;
      seenUrls.add(url);
    }
    return line;
  });
  content = beforeToc + dedupedLines.filter(Boolean).join('\n');
}

fs.writeFileSync(llmsTxtPath, content, 'utf-8');
console.log('✓ Post-processed docs/llms.txt with API instructions and links');

// Workstream C3: write root /llms.txt as a generated artifact (strict-minimal llmstxt.org pointer)
const rootLlmsPath = path.join(__dirname, '../..', 'public', 'llms.txt');
fs.writeFileSync(rootLlmsPath, ROOT_LLMS_TXT, 'utf-8');
console.log('✓ Wrote root public/llms.txt (generated, minimal pointer)');

