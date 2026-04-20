/**
 * Canonical LLM-facing project description.
 * Single source of truth — imported by:
 *   - docs/.vitepress/config.mts (vitepress-plugin-llms `introduction` template)
 *   - docs/scripts/post-process-llms-txt.js (root public/llms.txt blockquote)
 *
 * When editing, both consumers pick up the change on next build. Keep as a
 * single paragraph — the plugin uses it as an LLM-facing introduction and
 * the post-processor wraps it in a `>` blockquote for /llms.txt.
 */
const CANONICAL_PROJECT_DESCRIPTION =
  'Digital Arabic Maqām Archive (DiArMaqAr) - Open-source platform for Arabic maqām theory providing REST API and TypeScript library. Includes historically documented maqāmāt, ajnās, and tuning systems spanning from al-Kindī (874 CE) to contemporary approaches. All data includes comprehensive bibliographic attribution following decolonial computing principles.';

module.exports = { CANONICAL_PROJECT_DESCRIPTION };
