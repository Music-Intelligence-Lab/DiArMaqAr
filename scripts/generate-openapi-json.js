const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Read the OpenAPI YAML file
const yamlPath = path.join(__dirname, '..', 'openapi.yaml');
const jsonPath = path.join(__dirname, '..', 'public', 'docs', 'openapi.json');

try {
  // Read and parse YAML
  const fileContents = fs.readFileSync(yamlPath, 'utf8');
  const openapiSpec = yaml.load(fileContents);
  
  // Ensure the output directory exists
  const outputDir = path.dirname(jsonPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write JSON file
  fs.writeFileSync(jsonPath, JSON.stringify(openapiSpec, null, 2), 'utf8');
  
  console.log(`✅ Successfully converted openapi.yaml to ${jsonPath}`);
} catch (error) {
  console.error('❌ Error generating openapi.json:', error.message);
  process.exit(1);
}

