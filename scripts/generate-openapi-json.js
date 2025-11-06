const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Read the OpenAPI YAML file
const yamlPath = path.join(__dirname, '..', 'openapi.yaml');
const publicJsonPath = path.join(__dirname, '..', 'public', 'docs', 'openapi.json');
const docsJsonPath = path.join(__dirname, '..', 'docs', 'openapi.json');

try {
  // Read and parse YAML
  const fileContents = fs.readFileSync(yamlPath, 'utf8');
  const openapiSpec = yaml.load(fileContents);
  
  // Ensure the output directories exist
  const publicOutputDir = path.dirname(publicJsonPath);
  if (!fs.existsSync(publicOutputDir)) {
    fs.mkdirSync(publicOutputDir, { recursive: true });
  }
  
  const docsOutputDir = path.dirname(docsJsonPath);
  if (!fs.existsSync(docsOutputDir)) {
    fs.mkdirSync(docsOutputDir, { recursive: true });
  }
  
  const jsonContent = JSON.stringify(openapiSpec, null, 2);
  
  // Write JSON files to both locations
  fs.writeFileSync(publicJsonPath, jsonContent, 'utf8');
  fs.writeFileSync(docsJsonPath, jsonContent, 'utf8');
  
  console.log(`✅ Successfully converted openapi.yaml to:`);
  console.log(`   - ${publicJsonPath}`);
  console.log(`   - ${docsJsonPath}`);
} catch (error) {
  console.error('❌ Error generating openapi.json:', error.message);
  process.exit(1);
}

