const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Generates comprehensive endpoint reference documentation from OpenAPI spec
 * Outputs to endpoints-reference.md for detailed API reference
 * Static documentation for LLM consumption and human reference
 */

function generateMarkdownFromOpenAPI(openapiSpec) {
  const { info, servers, paths, components } = openapiSpec;

  let markdown = `---
title: API Endpoints Reference
description: Complete API endpoint documentation
---

# API Endpoints Reference

Complete documentation for all API endpoints. For quick start, see [API Documentation](./index). For examples, see [Representative Examples](./representative-examples).

---

# Quick Reference
## Base URL

${servers && servers.length > 0 
  ? `- **Production**: \`${servers[0].url}\`
- **Development**: \`${servers[1]?.url || 'http://localhost:3000/api'}\``
  : `- **Production**: \`https://diarmaqar.netlify.app/api\`
- **Development**: \`http://localhost:3000/api\``}

## OpenAPI Specification

Machine-readable OpenAPI 3.1.0 specification:
- [openapi.json](/openapi.json)
- [openapi.yaml](/openapi.yaml)

## Authentication

The API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses are in JSON format. List endpoints return:

\`\`\`json
{
  "count": <number>,
  "data": [<array>]
}
\`\`\`

## Rate Limiting

Currently, there are no rate limits. Please use the API responsibly.

## Common Parameters

Most endpoints support these optional parameters:

- **\`includeArabic\`** (default: \`"true"\`): Include Arabic script alongside transliteration
  - \`"true"\`: Bilingual responses with \`*Ar\` suffixed fields (\`displayNameAr\`, \`noteNameDisplayAr\`, etc.)
  - \`"false"\`: English transliteration only

- **\`includeSources\`** (default: \`"true"\` for list endpoints, \`"false"\` for detail endpoints): Include bibliographic source references
  - \`"true"\`: Include \`sources\` array with \`{sourceId, page}\` objects
  - \`"false"\`: Omit source references for performance

---

# Endpoints

`;

  // Group paths by tags
  const pathsByTag = {};
  
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (operation.tags && operation.tags.length > 0) {
        const tag = operation.tags[0];
        if (!pathsByTag[tag]) {
          pathsByTag[tag] = [];
        }
        pathsByTag[tag].push({ path, method, operation });
      }
    }
  }

  // Generate documentation for each tag
  const tagOrder = ['Maqāmāt', 'Ajnās', 'Tuning Systems', 'Pitch Classes', 'Intervals', 'Sources'];
  
  for (const tag of tagOrder) {
    if (!pathsByTag[tag]) continue;
    
    const tagPaths = pathsByTag[tag];
    
    // Add tag header
    markdown += `## ${tag}\n\n`;
    
    // Add tag description if available
    if (tag === 'Maqāmāt') {
      markdown += `Documented modal frameworks with historical source attribution.\n\n`;
    } else if (tag === 'Ajnās') {
      markdown += `Documented tetrachords (melodic fragments) with historical source attribution.\n\n`;
    } else if (tag === 'Tuning Systems') {
      markdown += `Historical tuning systems spanning from al-Kindī (874 CE) to contemporary approaches.\n\n`;
    }
    
    // Process each endpoint in this tag
    for (const { path, method, operation } of tagPaths) {
      markdown += generateEndpointDocumentation(path, method, operation, openapiSpec);
      markdown += '\n';
    }
    
    markdown += '---\n\n';
  }

  return markdown;
}

function generateEndpointDocumentation(path, method, operation, spec) {
  const { summary, description, operationId, parameters, responses } = operation;
  
  let doc = '';
  
  // Endpoint title (using summary or operationId)
  const title = summary || operationId || `${method.toUpperCase()} ${path}`;
  // Use operationId as anchor ID to match OASpec component format
  // This allows hash anchors to work on both static and dynamic pages
  doc += `#### ${title} {#${operationId}}\n\n`;
  
  // HTTP method and path
  doc += `\`\`\`\n${method.toUpperCase()} ${path}\n\`\`\`\n\n`;
  
  // Description
  if (description) {
    doc += `${description}\n\n`;
  }
  
  // Parameters
  if (parameters && parameters.length > 0) {
    const pathParams = parameters.filter(p => p.in === 'path');
    const queryParams = parameters.filter(p => p.in === 'query');
    
    if (pathParams.length > 0) {
      doc += `**Path Parameters:**\n`;
      for (const param of pathParams) {
        doc += `- \`${param.name}\`: ${param.description || 'No description'}`;
        if (param.schema) {
          if (param.schema.type) {
            doc += ` (${param.schema.type})`;
          }
          if (param.schema.enum) {
            doc += ` - Valid values: ${param.schema.enum.map(v => `\`${v}\``).join(', ')}`;
          }
        }
        if (param.required) {
          doc += ` **(required)**`;
        }
        doc += '\n';
        if (param.examples) {
          for (const [key, example] of Object.entries(param.examples)) {
            doc += `  - Example: \`${example.value}\` - ${example.summary || key}\n`;
          }
        } else if (param.example !== undefined) {
          doc += `  - Example: \`${param.example}\`\n`;
        }
      }
      doc += '\n';
    }
    
    if (queryParams.length > 0) {
      doc += `**Query Parameters:**\n`;
      for (const param of queryParams) {
        doc += `- \`${param.name}\``;
        if (param.required) {
          doc += ` **(required)**`;
        } else {
          doc += ` (optional)`;
        }
        
        // Handle multi-line descriptions
        let description = param.description || 'No description';
        // Normalize whitespace and newlines
        description = description.replace(/\n\s+/g, ' ').trim();
        // If description is very long, format it better
        if (description.length > 100) {
          doc += `: ${description.split('. ')[0]}.`;
          if (description.includes('\n')) {
            const lines = description.split('\n').filter(l => l.trim());
            if (lines.length > 1) {
              doc += '\n';
              lines.slice(1).forEach(line => {
                doc += `  ${line.trim()}\n`;
              });
            }
          }
        } else {
          doc += `: ${description}`;
        }
        
        if (param.schema) {
          if (param.schema.type) {
            doc += ` - Type: \`${param.schema.type}\``;
          }
          if (param.schema.enum && param.schema.enum.length <= 10) {
            doc += ` - Valid values: ${param.schema.enum.map(v => `\`${v}\``).join(', ')}`;
          } else if (param.schema.enum && param.schema.enum.length > 10) {
            doc += ` - Valid values: ${param.schema.enum.slice(0, 5).map(v => `\`${v}\``).join(', ')}, ... (${param.schema.enum.length} total)`;
          }
          if (param.schema.default !== undefined) {
            doc += ` - Default: \`${param.schema.default}\``;
          }
        }
        doc += '\n';
        
        if (param.examples) {
          for (const [key, example] of Object.entries(param.examples)) {
            doc += `  - Example: \`${example.value}\` - ${example.summary || key}\n`;
          }
        } else if (param.example !== undefined) {
          doc += `  - Example: \`${param.example}\`\n`;
        }
      }
      doc += '\n';
    }
  }
  
  // Example request
  const baseUrl = (spec.servers && spec.servers.length > 0) 
    ? spec.servers[0].url 
    : 'https://diarmaqar.netlify.app/api';
  const examplePath = path.replace(/{(\w+)}/g, (match, paramName) => {
    const param = parameters?.find(p => p.name === paramName && p.in === 'path');
    if (param?.examples) {
      return Object.values(param.examples)[0].value;
    }
    return param?.example || match;
  });
  
  // Build query string for example - only include required params and a few key optional ones
  const requiredQueryParams = parameters?.filter(p => p.in === 'query' && p.required) || [];
  const optionalQueryParams = parameters?.filter(p => 
    p.in === 'query' && 
    !p.required && 
    ['includeArabic', 'includeSources'].includes(p.name)
  ) || [];
  
  const exampleParams = [...requiredQueryParams, ...optionalQueryParams.slice(0, 2)];
  let queryString = '';
  if (exampleParams.length > 0) {
    const queryParts = exampleParams.map(p => {
      const example = p.examples ? Object.values(p.examples)[0].value : p.example || p.schema?.default;
      if (example !== undefined) {
        return `${p.name}=${example}`;
      }
      return null;
    }).filter(Boolean);
    if (queryParts.length > 0) {
      queryString = '?' + queryParts.join('&');
    }
  }
  
  doc += `**Example:**\n`;
  doc += `\`\`\`bash\n`;
  doc += `curl "${baseUrl}${examplePath}${queryString}"\n`;
  doc += `\`\`\`\n\n`;
  
  // Response description
  if (responses && responses['200']) {
    const response = responses['200'];
    if (response.description) {
      doc += `**Response:** ${response.description}\n\n`;
    }
  }
  
  return doc;
}

// Main execution
try {
  const yamlPath = path.join(__dirname, '../..', 'openapi.yaml');
  const outputPath = path.join(__dirname, '..', 'api', 'endpoints-reference.md');

  // Read and parse YAML
  const fileContents = fs.readFileSync(yamlPath, 'utf8');
  const openapiSpec = yaml.load(fileContents);

  // Generate markdown
  const markdown = generateMarkdownFromOpenAPI(openapiSpec);

  // Write to file
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log(`✅ Successfully generated API documentation from OpenAPI spec:`);
  console.log(`   - ${outputPath}`);
} catch (error) {
  console.error('❌ Error generating API documentation:', error.message);
  console.error(error.stack);
  process.exit(1);
}

