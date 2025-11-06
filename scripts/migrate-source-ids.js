/**
 * Migration script to update source IDs to be URL-safe
 *
 * Changes:
 * - Removes forward slashes from dual dates (1904/2011 -> 2011)
 * - Uses only publication date (not original publication date)
 * - Standardizes text to remove diacritics
 * - Ensures all IDs are URL-safe
 */

const fs = require('fs');
const path = require('path');

// Import standardizeText function
function standardizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .trim();
}

function generateSourceId(contributors, publicationDateEnglish) {
  let baseName = "na";

  // Get first contributor's last name
  if (contributors && contributors.length > 0) {
    const firstContributor = contributors[0];
    if (firstContributor.lastNameEnglish) {
      // Standardize text to remove diacritics and make URL-safe
      baseName = standardizeText(firstContributor.lastNameEnglish);
      // Additional URL safety: remove any remaining problematic characters
      baseName = baseName.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
  }

  // Extract year from publication date (handles formats like "2011", "2011-05", etc.)
  const yearMatch = publicationDateEnglish.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : "unknown";

  return `${baseName}-(${year})`;
}

// Read sources.json
const sourcesPath = path.join(__dirname, '../data/sources.json');
const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

console.log('🔄 Migrating source IDs to URL-safe format...\n');

// Create backup
const backupPath = path.join(__dirname, `../data/backups/sources.json.${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}.backup`);
fs.mkdirSync(path.dirname(backupPath), { recursive: true });
fs.writeFileSync(backupPath, JSON.stringify(sources, null, 2));
console.log(`✅ Backup created: ${backupPath}\n`);

// Track changes
const changes = [];

// Update each source
sources.forEach((source) => {
  const oldId = source.id;
  const newId = generateSourceId(source.contributors, source.publicationDateEnglish);

  if (oldId !== newId) {
    source.id = newId;
    changes.push({ old: oldId, new: newId });
    console.log(`  ${oldId} → ${newId}`);
  }
});

if (changes.length === 0) {
  console.log('✅ No changes needed - all source IDs are already URL-safe!');
} else {
  // Write updated sources
  fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
  console.log(`\n✅ Updated ${changes.length} source ID(s) in ${sourcesPath}`);
  console.log('\n📝 Summary of changes:');
  changes.forEach(({ old, new: newId }) => {
    console.log(`   • ${old} → ${newId}`);
  });
}

console.log('\n✨ Migration complete!');
