#!/usr/bin/env tsx

/**
 * API Cost Audit Script
 * 
 * Tests all API endpoints with all parameter combinations, measures response time and size,
 * compares with external API, and generates efficiency recommendations.
 */

import fs from 'fs';
import path from 'path';

// Configuration
const LOCAL_API_BASE = 'http://localhost:3000/api';
const EXTERNAL_API_BASE = 'https://diarmaqar.netlify.app/api';
const OPENAPI_SPEC_PATH = path.join(process.cwd(), 'docs', 'openapi.json');
const NUM_RUNS_PER_TEST = 10;
const DELAY_BETWEEN_REQUESTS = 50; // ms - reduced for faster testing
const DELAY_BETWEEN_TESTS = 50; // ms - reduced for faster testing
const SKIP_EXTERNAL_API = false; // Set to true to skip external API testing for speed

// Types
interface Parameter {
  name: string;
  in: 'query' | 'path';
  required: boolean;
  schema: {
    type: string;
    enum?: any[];
    default?: any;
  };
  description?: string;
}

interface Endpoint {
  path: string;
  method: string;
  parameters: Parameter[];
  operationId?: string;
}

interface TestResult {
  endpoint: string;
  method: string;
  parameters: string;
  localTimeAvg: number;
  localTimeMin: number;
  localTimeMax: number;
  localTimeStdDev: number;
  localSizeAvg: number;
  localSizeMin: number;
  localSizeMax: number;
  localSizeStdDev: number;
  localStatus: number;
  externalTimeAvg: number | null;
  externalTimeMin: number | null;
  externalTimeMax: number | null;
  externalTimeStdDev: number | null;
  externalSizeAvg: number | null;
  externalSizeMin: number | null;
  externalSizeMax: number | null;
  externalSizeStdDev: number | null;
  externalStatus: number | null;
  timestamp: string;
  error?: string;
}

interface Measurement {
  time: number;
  size: number;
  status: number;
}

// Utility functions
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateStats(values: number[]): { avg: number; min: number; max: number; stdDev: number } {
  if (values.length === 0) {
    return { avg: 0, min: 0, max: 0, stdDev: 0 };
  }
  
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return { avg, min, max, stdDev };
}

async function makeRequest(url: string, isExternal: boolean = false): Promise<Measurement> {
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // Add cache-busting for external API to avoid CDN caching
        ...(isExternal ? { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } : {}),
      },
    });
    
    const responseText = await response.text();
    const endTime = Date.now();
    const time = endTime - startTime;
    const size = Buffer.byteLength(responseText, 'utf-8');
    
    // Debug: Log if external API returns unexpected response
    if (isExternal) {
      if (response.status !== 200) {
        console.warn(`  ⚠️  External API returned status ${response.status} for ${url}`);
      }
      
      // Check if response looks like an error page or default
      if (size > 0) {
        const firstChars = responseText.substring(0, 200);
        if (firstChars.includes('<html>') || firstChars.includes('<!DOCTYPE')) {
          console.warn(`  ⚠️  External API returned HTML instead of JSON for ${url}`);
          console.warn(`      First 200 chars: ${firstChars.substring(0, 200)}`);
        } else {
          // Try to parse as JSON to see what we got
          try {
            const json = JSON.parse(responseText);
            // Check if it's an error response
            if (json.error || json.message) {
              console.warn(`  ⚠️  External API returned error response: ${JSON.stringify(json).substring(0, 150)}`);
            }
            // Log if response structure looks wrong (e.g., always the same data)
            // Note: This detection is kept for debugging but should not trigger now that
            // the external API is configured for dynamic rendering
            if (json.count !== undefined && json.data !== undefined) {
              // Track response patterns for debugging (but don't warn unless we see multiple identical responses)
              const responseHash = responseText.substring(0, 1000);
              if (!(makeRequest as any).lastExternalResponse) {
                (makeRequest as any).lastExternalResponse = responseHash;
                (makeRequest as any).lastExternalUrl = url;
                (makeRequest as any).lastExternalSize = size;
                (makeRequest as any).identicalResponseCount = 0;
              } else {
                // Check if response is identical (same hash and size) for different URLs
                const isIdentical = (makeRequest as any).lastExternalResponse === responseHash && 
                                   (makeRequest as any).lastExternalSize === size &&
                                   url !== (makeRequest as any).lastExternalUrl;
                
                if (isIdentical) {
                  (makeRequest as any).identicalResponseCount = ((makeRequest as any).identicalResponseCount || 0) + 1;
                  // Only warn if we see multiple identical responses (3+) to avoid false positives
                  if ((makeRequest as any).identicalResponseCount >= 3 && !(makeRequest as any).warnedAboutStatic) {
                    console.warn(`  ⚠️  External API may be serving identical responses for different query parameters`);
                    console.warn(`      This could indicate caching or configuration issues`);
                    (makeRequest as any).warnedAboutStatic = true;
                  }
                } else {
                  // Reset counter if we see different responses
                  (makeRequest as any).identicalResponseCount = 0;
                }
              }
            }
          } catch (e) {
            // Not JSON, might be HTML or other
            if (!firstChars.includes('<html>') && !firstChars.includes('<!DOCTYPE')) {
              console.warn(`  ⚠️  External API returned non-JSON response (first 200 chars): ${firstChars}`);
            }
          }
        }
      }
    }
    
    return {
      time,
      size,
      status: response.status,
    };
  } catch (error) {
    const endTime = Date.now();
    const time = endTime - startTime;
    if (isExternal) {
      console.warn(`  ⚠️  External API request failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
    return {
      time,
      size: 0,
      status: 0,
    };
  }
}

async function testEndpoint(
  endpoint: string,
  params: Record<string, string>,
  isExternal: boolean = false
): Promise<Measurement[]> {
  const baseUrl = isExternal ? EXTERNAL_API_BASE : LOCAL_API_BASE;
  const queryString = new URLSearchParams(params).toString();
  const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  const measurements: Measurement[] = [];
  
  for (let i = 0; i < NUM_RUNS_PER_TEST; i++) {
    // Add cache-busting query param for external API
    let requestUrl = url;
    if (isExternal) {
      const separator = url.includes('?') ? '&' : '?';
      requestUrl = `${url}${separator}_t=${Date.now()}-${i}`;
    }
    
    const measurement = await makeRequest(requestUrl, isExternal);
    measurements.push(measurement);
    
    if (i < NUM_RUNS_PER_TEST - 1) {
      await delay(DELAY_BETWEEN_REQUESTS);
    }
  }
  
  return measurements;
}

// Parse OpenAPI spec
function parseOpenAPISpec(): Endpoint[] {
  const specContent = fs.readFileSync(OPENAPI_SPEC_PATH, 'utf-8');
  const spec = JSON.parse(specContent);
  const endpoints: Endpoint[] = [];
  
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(methods as any)) {
      if (method === 'get' || method === 'GET') {
        const op = operation as any;
        const parameters: Parameter[] = (op.parameters || []).map((p: any) => ({
          name: p.name,
          in: p.in,
          required: p.required || false,
          schema: p.schema || { type: 'string' },
          description: p.description,
        }));
        
        endpoints.push({
          path,
          method: 'GET',
          parameters,
          operationId: op.operationId,
        });
      }
    }
  }
  
  return endpoints;
}

// Discover valid starting notes per tuning system
async function discoverTuningSystemStartingNotes(): Promise<Record<string, string[]>> {
  const mapping: Record<string, string[]> = {};
  try {
    const response = await fetch(`${LOCAL_API_BASE}/tuning-systems`);
    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        const tuningSystemId = item.tuningSystem?.id || item.id;
        if (tuningSystemId && item.startingNotes?.idNames) {
          mapping[tuningSystemId] = item.startingNotes.idNames;
        }
      }
    }
  } catch (e) {
    console.warn(`Failed to discover tuning system starting notes: ${e}`);
  }
  return mapping;
}

// Discover dynamic route values
async function discoverDynamicValues(endpoint: Endpoint): Promise<Record<string, string[]>> {
  const discovered: Record<string, string[]> = {};
  
  // Extract path parameters
  const pathParams = endpoint.parameters.filter(p => p.in === 'path');
  
  for (const param of pathParams) {
    if (param.name === 'idName' || param.name === 'id') {
      // Try to discover IDs from list endpoints
      if (endpoint.path.includes('/maqamat/')) {
        try {
          const response = await fetch(`${LOCAL_API_BASE}/maqamat`);
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            discovered[param.name] = data.data.map((item: any) => item.idName || item.id).filter(Boolean);
          }
        } catch (e) {
          console.warn(`Failed to discover maqamat IDs: ${e}`);
        }
      } else if (endpoint.path.includes('/ajnas/')) {
        try {
          const response = await fetch(`${LOCAL_API_BASE}/ajnas`);
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            discovered[param.name] = data.data.map((item: any) => item.jins?.idName || item.id).filter(Boolean);
          }
        } catch (e) {
          console.warn(`Failed to discover ajnas IDs: ${e}`);
        }
      } else if (endpoint.path.includes('/tuning-systems/')) {
        try {
          const response = await fetch(`${LOCAL_API_BASE}/tuning-systems`);
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            discovered[param.name] = data.data.map((item: any) => item.tuningSystem?.id || item.id).filter(Boolean);
          }
        } catch (e) {
          console.warn(`Failed to discover tuning system IDs: ${e}`);
        }
      } else if (endpoint.path.includes('/sources/')) {
        try {
          const response = await fetch(`${LOCAL_API_BASE}/sources`);
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            discovered[param.name] = data.data.map((item: any) => item.source?.id || item.id).filter(Boolean);
          }
        } catch (e) {
          console.warn(`Failed to discover source IDs: ${e}`);
        }
      } else if (endpoint.path.includes('/note-names/')) {
        try {
          const response = await fetch(`${LOCAL_API_BASE}/pitch-classes/note-names`);
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            discovered[param.name] = data.data.map((item: any) => item.noteName?.idName || item.idName).filter(Boolean);
          }
        } catch (e) {
          console.warn(`Failed to discover note name IDs: ${e}`);
        }
      }
    } else if (param.name === 'startingNote') {
      // Discover starting notes from tuning systems
      try {
        const response = await fetch(`${LOCAL_API_BASE}/tuning-systems`);
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          const allStartingNotes = new Set<string>();
          data.data.forEach((item: any) => {
            if (item.startingNotes?.idNames) {
              item.startingNotes.idNames.forEach((note: string) => allStartingNotes.add(note));
            }
          });
          discovered[param.name] = Array.from(allStartingNotes);
        }
      } catch (e) {
        console.warn(`Failed to discover starting notes: ${e}`);
      }
    }
  }
  
  // Discover query parameter values that require API calls
  for (const param of endpoint.parameters.filter(p => p.in === 'query' && !p.schema.enum)) {
    if (param.name === 'tuningSystem') {
      try {
        const response = await fetch(`${LOCAL_API_BASE}/tuning-systems`);
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          discovered[param.name] = data.data.map((item: any) => item.tuningSystem?.id || item.id).filter(Boolean);
        }
      } catch (e) {
        console.warn(`Failed to discover tuning systems: ${e}`);
      }
    } else if (param.name === 'noteNames') {
      try {
        const response = await fetch(`${LOCAL_API_BASE}/pitch-classes/note-names`);
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          const noteNames = data.data.map((item: any) => item.noteName?.idName || item.idName).filter(Boolean);
          // Generate some common combinations
          discovered[param.name] = noteNames.slice(0, 5).map((name: string) => `${name},${noteNames[1] || name}`);
        }
      } catch (e) {
        console.warn(`Failed to discover note names: ${e}`);
      }
    }
  }
  
  return discovered;
}

// Generate parameter combinations - SMART VERSION
// Focuses on meaningful combinations rather than exhaustive enumeration
function generateParameterCombinations(
  endpoint: Endpoint,
  discovered: Record<string, string[]>
): Record<string, string>[] {
  const combinations: Record<string, string>[] = [];
  const queryParams = endpoint.parameters.filter(p => p.in === 'query');
  const pathParams = endpoint.parameters.filter(p => p.in === 'path');
  
  // Categorize parameters for smart generation
  const filterParams: Parameter[] = []; // filterByFamily, filterByTonic, etc.
  const sortParams: Parameter[] = []; // sortBy
  const booleanParams: Parameter[] = []; // include*, intervals, options, inArabic
  const requiredParams: Parameter[] = []; // tuningSystem, startingNote, etc.
  const otherParams: Parameter[] = []; // pitchClassDataType, transposeTo, etc.
  
  for (const param of queryParams) {
    if (param.name.startsWith('filterBy')) {
      filterParams.push(param);
    } else if (param.name === 'sortBy') {
      sortParams.push(param);
    } else if (param.schema.type === 'boolean' || 
               param.name.includes('include') || 
               param.name === 'intervals' || 
               param.name === 'options' ||
               param.name === 'inArabic') {
      booleanParams.push(param);
    } else if (param.required) {
      requiredParams.push(param);
    } else {
      otherParams.push(param);
    }
  }
  
  // Handle path parameters - sample a few values
  const pathParamValues: Record<string, string[]> = {};
  for (const param of pathParams) {
    if (discovered[param.name] && discovered[param.name].length > 0) {
      // For path params, test a few representative values (not all)
      const values = discovered[param.name];
      if (values.length <= 5) {
        pathParamValues[param.name] = values; // Small set, use all
      } else {
        // Large set, sample: first, middle, last, and a couple random
        const sampled = [
          values[0],
          values[Math.floor(values.length / 2)],
          values[values.length - 1],
        ];
        // Add 2 more random samples if we have room
        if (values.length > 3) {
          const randomIndices = new Set<number>();
          while (randomIndices.size < 2 && randomIndices.size < values.length - 3) {
            const idx = Math.floor(Math.random() * values.length);
            if (idx !== 0 && idx !== Math.floor(values.length / 2) && idx !== values.length - 1) {
              randomIndices.add(idx);
            }
          }
          randomIndices.forEach(idx => sampled.push(values[idx]));
        }
        pathParamValues[param.name] = sampled;
      }
    } else {
      if (param.name === 'idName' || param.name === 'id') {
        // Don't use 'all' for availability endpoints (they don't support it)
        // If no values discovered for availability, we can't generate valid combinations
        if (endpoint.path.includes('/availability')) {
          // Don't generate any combinations - availability requires specific IDs
          pathParamValues[param.name] = [];
        } else {
          pathParamValues[param.name] = ['all'];
        }
      } else {
        pathParamValues[param.name] = ['unknown'];
      }
    }
  }
  
  // Generate smart combinations
  // Strategy:
  // 1. Baseline: no optional params
  // 2. Each filter param individually (1 sample value)
  // 3. Each sort param (all values, they're small)
  // 4. Each boolean param (true/false)
  // 5. Required params: sample a few values
  // 6. A few key combinations
  
  // 1. Baseline (no optional params, only required)
  const baseline: Record<string, string> = {};
  for (const param of requiredParams) {
    if (param.name === 'tuningSystem' && discovered.tuningSystem && discovered.tuningSystem.length > 0) {
      baseline[param.name] = discovered.tuningSystem[0];
    } else if (param.name === 'startingNote' && discovered.startingNote && discovered.startingNote.length > 0) {
      baseline[param.name] = discovered.startingNote[0];
    } else if (param.schema.enum && param.schema.enum.length > 0) {
      baseline[param.name] = String(param.schema.enum[0]);
    }
  }
  
  // Add baseline for each path param combination
  if (Object.keys(pathParamValues).length === 0) {
    combinations.push(baseline);
  } else {
    const pathKeys = Object.keys(pathParamValues);
    const pathValues = pathKeys.map(k => pathParamValues[k]);
    
    // Check if any path param has no values (e.g., availability endpoint without discovered IDs)
    if (pathValues.some(vals => vals.length === 0)) {
      // Can't generate valid combinations - return empty array
      return [];
    }
    
    function cartesianProduct(arrays: string[][]): string[][] {
      if (arrays.length === 0) return [[]];
      const [first, ...rest] = arrays;
      const restProduct = cartesianProduct(rest);
      return first.flatMap(val => restProduct.map(combo => [val, ...combo]));
    }
    
    const pathCombos = cartesianProduct(pathValues);
    for (const pathCombo of pathCombos) {
      const combo: Record<string, string> = { ...baseline };
      pathKeys.forEach((key, i) => {
        combo[key] = pathCombo[i];
      });
      combinations.push(combo);
    }
  }
  
  // 2. Each filter param individually (1-2 sample values)
  for (const filterParam of filterParams) {
    let sampleValues: string[] = [];
    if (filterParam.schema.enum) {
      const enumValues = filterParam.schema.enum.map(v => String(v));
      // Sample 1-2 values from enum
      if (enumValues.length <= 2) {
        sampleValues = enumValues;
      } else {
        sampleValues = [enumValues[0], enumValues[Math.floor(enumValues.length / 2)]];
      }
    }
    
    for (const value of sampleValues) {
      if (value === null || value === undefined) continue;
      for (const baseCombo of combinations.slice(0, Math.min(combinations.length, 10))) {
        const newCombo = { ...baseCombo };
        newCombo[filterParam.name] = value;
        // Only add if not duplicate
        if (!combinations.some(c => JSON.stringify(c) === JSON.stringify(newCombo))) {
          combinations.push(newCombo);
        }
      }
    }
  }
  
  // 3. Each sort param (all values, they're small)
  for (const sortParam of sortParams) {
    if (sortParam.schema.enum) {
      for (const value of sortParam.schema.enum.map(v => String(v))) {
        for (const baseCombo of combinations.slice(0, Math.min(combinations.length, 5))) {
          const newCombo = { ...baseCombo };
          newCombo[sortParam.name] = value;
          if (!combinations.some(c => JSON.stringify(c) === JSON.stringify(newCombo))) {
            combinations.push(newCombo);
          }
        }
      }
    }
  }
  
  // 4. Each boolean param (true/false, but not in full cartesian)
  for (const boolParam of booleanParams) {
    for (const value of ['true', 'false']) {
      for (const baseCombo of combinations.slice(0, Math.min(combinations.length, 5))) {
        const newCombo = { ...baseCombo };
        newCombo[boolParam.name] = value;
        if (!combinations.some(c => JSON.stringify(c) === JSON.stringify(newCombo))) {
          combinations.push(newCombo);
        }
      }
    }
  }
  
  // 5. Required params: test a few different values
  for (const reqParam of requiredParams) {
    let testValues: string[] = [];
    if (reqParam.name === 'tuningSystem' && discovered.tuningSystem && discovered.tuningSystem.length > 0) {
      testValues = discovered.tuningSystem.slice(0, 3); // Test first 3
    } else if (reqParam.name === 'startingNote' && discovered.startingNote && discovered.startingNote.length > 0) {
      testValues = discovered.startingNote.slice(0, 3); // Test first 3
    } else if (reqParam.schema.enum) {
      testValues = reqParam.schema.enum.slice(0, 3).map(v => String(v));
    }
    
    if (testValues.length > 1) {
      // Add combinations with different required param values
      for (const value of testValues.slice(1)) { // Skip first (already in baseline)
        for (const baseCombo of combinations.slice(0, Math.min(combinations.length, 3))) {
          const newCombo = { ...baseCombo };
          newCombo[reqParam.name] = value;
          if (!combinations.some(c => JSON.stringify(c) === JSON.stringify(newCombo))) {
            combinations.push(newCombo);
          }
        }
      }
    }
  }
  
  // 6. Other params: test a few key values
  for (const otherParam of otherParams) {
    let testValues: string[] = [];
    if (otherParam.schema.enum) {
      const enumValues = otherParam.schema.enum.map(v => String(v));
      if (enumValues.length <= 3) {
        testValues = enumValues;
      } else {
        // Sample: first, middle, last
        testValues = [
          enumValues[0],
          enumValues[Math.floor(enumValues.length / 2)],
          enumValues[enumValues.length - 1]
        ];
      }
    } else if (discovered[otherParam.name] && discovered[otherParam.name].length > 0) {
      testValues = discovered[otherParam.name].slice(0, 3).filter((v): v is string => v !== null && v !== undefined);
    }
    
    if (testValues.length > 0) {
      for (const value of testValues) {
        if (value === null || value === undefined) continue;
        for (const baseCombo of combinations.slice(0, Math.min(combinations.length, 3))) {
          const newCombo = { ...baseCombo };
          newCombo[otherParam.name] = value;
          if (!combinations.some(c => JSON.stringify(c) === JSON.stringify(newCombo))) {
            combinations.push(newCombo);
          }
        }
      }
    }
  }
  
  // Remove duplicates (in case we generated any)
  const uniqueCombinations: Record<string, string>[] = [];
  const seen = new Set<string>();
  for (const combo of combinations) {
    const key = JSON.stringify(combo);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCombinations.push(combo);
    }
  }
  
  // Final safety limit - if somehow we still have too many, sample
  if (uniqueCombinations.length > 200) {
    console.warn(`  Warning: ${uniqueCombinations.length} combinations generated, sampling to 200`);
    // Sample: first 100, last 100
    return [
      ...uniqueCombinations.slice(0, 100),
      ...uniqueCombinations.slice(-100),
    ];
  }
  
  return uniqueCombinations;
}

// Build endpoint path with path parameters
function buildEndpointPath(endpoint: Endpoint, params: Record<string, string>): string {
  let path = endpoint.path;
  
  // Replace path parameters
  for (const [key, value] of Object.entries(params)) {
    const param = endpoint.parameters.find(p => p.name === key && p.in === 'path');
    if (param) {
      path = path.replace(`{${key}}`, value);
    }
  }
  
  return path;
}

// Main audit function
async function runAudit() {
  console.log('Starting API Cost Audit...\n');
  
  // Check if local server is running
  console.log('Checking if local server is running...');
  try {
    const healthCheck = await fetch(`${LOCAL_API_BASE}/tuning-systems`);
    if (!healthCheck.ok) {
      console.warn('Warning: Local server responded with non-200 status. Continuing anyway...\n');
    } else {
      console.log('Local server is running.\n');
    }
  } catch (error) {
    console.error('Error: Could not connect to local server at', LOCAL_API_BASE);
    console.error('Please make sure the Next.js dev server is running: npm run dev\n');
    process.exit(1);
  }
  
  // Parse OpenAPI spec
  console.log('Parsing OpenAPI spec...');
  const endpoints = parseOpenAPISpec();
  console.log(`Found ${endpoints.length} endpoints\n`);
  
  const results: TestResult[] = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  let totalTests = 0;
  let completedTests = 0;
  const startTime = Date.now();
  
  // Calculate total tests
  console.log('Discovering endpoints and calculating test combinations...');
  for (const endpoint of endpoints) {
    const discovered = await discoverDynamicValues(endpoint);
    const combinations = generateParameterCombinations(endpoint, discovered);
    totalTests += combinations.length;
  }
  
  console.log(`\nTotal test combinations: ${totalTests}`);
  if (SKIP_EXTERNAL_API) {
    console.log('⚠️  External API testing is DISABLED (set SKIP_EXTERNAL_API = false to enable)\n');
  } else {
    console.log('✓ External API testing is ENABLED\n');
  }
  console.log('Starting tests...\n');
  
  // Test each endpoint
  let endpointIndex = 0;
  for (const endpoint of endpoints) {
    endpointIndex++;
    console.log(`\n[${endpointIndex}/${endpoints.length}] Testing ${endpoint.method} ${endpoint.path}...`);
    
    try {
      const discovered = await discoverDynamicValues(endpoint);
      const combinations = generateParameterCombinations(endpoint, discovered);
      
      console.log(`  Found ${combinations.length} parameter combinations`);
      
      // Cache tuning system starting notes mapping for this endpoint (if needed)
      let tuningSystemNotes: Record<string, string[]> = {};
      if (endpoint.path.includes('/tuning-systems/') || endpoint.parameters.some(p => p.name === 'tuningSystem')) {
        tuningSystemNotes = await discoverTuningSystemStartingNotes();
      }
      
      for (const combo of combinations) {
        const pathParams: Record<string, string> = {};
        const queryParams: Record<string, string> = {};
        
        // Separate path and query params
        for (const [key, value] of Object.entries(combo)) {
          const param = endpoint.parameters.find(p => p.name === key);
          if (param?.in === 'path') {
            pathParams[key] = value;
          } else if (value !== null && value !== undefined && value !== '') {
            queryParams[key] = value;
          }
        }
        
        // Skip if required path params are missing or invalid
        const requiredPathParams = endpoint.parameters.filter(p => p.in === 'path' && p.required);
        const missingRequired = requiredPathParams.some(p => !pathParams[p.name] || pathParams[p.name] === 'unknown' || pathParams[p.name] === 'required-param-placeholder');
        if (missingRequired) {
          continue;
        }
        
        // Skip if required query params are missing
        const requiredQueryParams = endpoint.parameters.filter(p => p.in === 'query' && p.required);
        const missingRequiredQuery = requiredQueryParams.some(p => !queryParams[p.name] || queryParams[p.name] === 'required-param-placeholder');
        if (missingRequiredQuery) {
          continue;
        }
        
        // Note: /maqamat/all/availability combinations are now prevented during generation
        // (availability endpoints return empty pathParamValues if no IDs discovered)
        
        // VALIDATION: Check if starting note is valid for tuning system
        // This applies to endpoints like /tuning-systems/{id}/{startingNote}/...
        if (pathParams.id && pathParams.startingNote && endpoint.path.includes('/tuning-systems/')) {
          // Get tuning system ID from path
          const tuningSystemId = pathParams.id;
          // Check if we have mapping and if starting note is valid
          if (tuningSystemNotes[tuningSystemId]) {
            const validNotes = tuningSystemNotes[tuningSystemId];
            // Normalize for comparison (remove diacritics)
            const normalize = (s: string) => s.toLowerCase().replace(/[ʿʾ]/g, '');
            const normalizedStartingNote = normalize(pathParams.startingNote);
            const isValid = validNotes.some(note => normalize(note) === normalizedStartingNote);
            if (!isValid) {
              continue; // Skip invalid combination
            }
          }
        }
        
        // VALIDATION: Check if starting note is valid for tuning system in query params
        // This applies to endpoints that take tuningSystem and startingNote as query params
        if (queryParams.tuningSystem && queryParams.startingNote) {
          if (tuningSystemNotes[queryParams.tuningSystem]) {
            const validNotes = tuningSystemNotes[queryParams.tuningSystem];
            const normalize = (s: string) => s.toLowerCase().replace(/[ʿʾ]/g, '');
            const normalizedStartingNote = normalize(queryParams.startingNote);
            const isValid = validNotes.some(note => normalize(note) === normalizedStartingNote);
            if (!isValid) {
              continue; // Skip invalid combination
            }
          }
        }
        
        const endpointPath = buildEndpointPath(endpoint, pathParams);
        const queryString = new URLSearchParams(queryParams).toString();
        const fullPath = `${endpointPath}${queryString ? `?${queryString}` : ''}`;
        
        try {
          // Test local API
          const localMeasurements = await testEndpoint(endpointPath, queryParams, false);
          const localTimes = localMeasurements.map(m => m.time);
          const localSizes = localMeasurements.map(m => m.size);
          const localStats = calculateStats(localTimes);
          const localSizeStats = calculateStats(localSizes);
          const localStatus = localMeasurements[0]?.status || 0;
          
          // Test external API (only if local succeeded and not skipped)
          let externalStats = null;
          let externalSizeStats = null;
          let externalStatus = null;
          
          if (!SKIP_EXTERNAL_API && localStatus === 200) {
            try {
              const externalMeasurements = await testEndpoint(endpointPath, queryParams, true);
              const externalTimes = externalMeasurements.map(m => m.time);
              const externalSizes = externalMeasurements.map(m => m.size);
              externalStats = calculateStats(externalTimes);
              externalSizeStats = calculateStats(externalSizes);
              externalStatus = externalMeasurements[0]?.status || null;
            } catch (e) {
              // External API might fail, continue
            }
          }
          
          results.push({
            endpoint: fullPath,
            method: endpoint.method,
            parameters: queryString,
            localTimeAvg: localStats.avg,
            localTimeMin: localStats.min,
            localTimeMax: localStats.max,
            localTimeStdDev: localStats.stdDev,
            localSizeAvg: localSizeStats.avg,
            localSizeMin: localSizeStats.min,
            localSizeMax: localSizeStats.max,
            localSizeStdDev: localSizeStats.stdDev,
            localStatus,
            externalTimeAvg: externalStats?.avg || null,
            externalTimeMin: externalStats?.min || null,
            externalTimeMax: externalStats?.max || null,
            externalTimeStdDev: externalStats?.stdDev || null,
            externalSizeAvg: externalSizeStats?.avg || null,
            externalSizeMin: externalSizeStats?.min || null,
            externalSizeMax: externalSizeStats?.max || null,
            externalSizeStdDev: externalSizeStats?.stdDev || null,
            externalStatus,
            timestamp: new Date().toISOString(),
          });
          
          completedTests++;
          
          // Calculate progress and ETA
          const progress = (completedTests / totalTests) * 100;
          const elapsed = Date.now() - startTime;
          const avgTimePerTest = elapsed / completedTests;
          const remaining = totalTests - completedTests;
          const etaMs = remaining * avgTimePerTest;
          const etaMinutes = Math.round(etaMs / 60000);
          const etaSeconds = Math.round((etaMs % 60000) / 1000);
          
          // Format endpoint for display (truncate if too long)
          const displayEndpoint = fullPath.length > 60 ? fullPath.substring(0, 57) + '...' : fullPath;
          const statusIcon = localStatus === 200 ? '✓' : '✗';
          const sizeKB = (localSizeStats.avg / 1024).toFixed(2);
          
          // Show progress after every test with costs
          const progressBar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
          console.log(
            `[${progressBar}] ${completedTests}/${totalTests} (${progress.toFixed(1)}%) | ` +
            `${statusIcon} ${displayEndpoint} | ` +
            `Time: ${localStats.avg.toFixed(0)}ms | ` +
            `Size: ${sizeKB}KB | ` +
            `ETA: ${etaMinutes}m ${etaSeconds}s`
          );
          
        // Show external comparison if available
        if (externalStats && externalSizeStats && !SKIP_EXTERNAL_API) {
          const extSizeKB = (externalSizeStats.avg / 1024).toFixed(2);
          const timeDiffValue = ((externalStats.avg - localStats.avg) / localStats.avg * 100);
          const timeDiff = timeDiffValue.toFixed(1);
          console.log(
            `  └─ External: ${externalStats.avg.toFixed(0)}ms (${timeDiffValue > 0 ? '+' : ''}${timeDiff}%) | ` +
            `${extSizeKB}KB`
          );
        }
      } catch (error) {
          results.push({
            endpoint: fullPath,
            method: endpoint.method,
            parameters: queryString,
            localTimeAvg: 0,
            localTimeMin: 0,
            localTimeMax: 0,
            localTimeStdDev: 0,
            localSizeAvg: 0,
            localSizeMin: 0,
            localSizeMax: 0,
            localSizeStdDev: 0,
            localStatus: 0,
            externalTimeAvg: null,
            externalTimeMin: null,
            externalTimeMax: null,
            externalTimeStdDev: null,
            externalSizeAvg: null,
            externalSizeMin: null,
            externalSizeMax: null,
            externalSizeStdDev: null,
            externalStatus: null,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
          });
          completedTests++;
          // Show error in progress
          const progress = (completedTests / totalTests) * 100;
          const displayEndpoint = fullPath.length > 60 ? fullPath.substring(0, 57) + '...' : fullPath;
          console.log(`✗ ${displayEndpoint} | ERROR: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Small delay to avoid overwhelming the server
        if (completedTests < totalTests) {
          await delay(DELAY_BETWEEN_TESTS);
        }
      }
    } catch (error) {
      console.error(`  Error testing endpoint: ${error}`);
    }
    
    console.log(`  ✓ Completed ${endpoint.path}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('All tests completed!');
  
  // Write CSV
  const csvPath = path.join(process.cwd(), 'scripts', `api-cost-audit-${timestamp}.csv`);
  
  // CSV header
  const headers = [
    'Endpoint',
    'Method',
    'Parameters',
    'Local Time Avg (ms)',
    'Local Time Min (ms)',
    'Local Time Max (ms)',
    'Local Time StdDev (ms)',
    'Local Size Avg (bytes)',
    'Local Size Min (bytes)',
    'Local Size Max (bytes)',
    'Local Size StdDev (bytes)',
    'Local Status',
    'External Time Avg (ms)',
    'External Time Min (ms)',
    'External Time Max (ms)',
    'External Time StdDev (ms)',
    'External Size Avg (bytes)',
    'External Size Min (bytes)',
    'External Size Max (bytes)',
    'External Size StdDev (bytes)',
    'External Status',
    'Timestamp',
    'Error',
  ];
  
  // Escape CSV values
  function escapeCsv(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
  
  // Write CSV
  const csvLines = [
    headers.join(','),
    ...results.map(r => [
      escapeCsv(r.endpoint),
      escapeCsv(r.method),
      escapeCsv(r.parameters),
      escapeCsv(r.localTimeAvg.toFixed(2)),
      escapeCsv(r.localTimeMin.toFixed(2)),
      escapeCsv(r.localTimeMax.toFixed(2)),
      escapeCsv(r.localTimeStdDev.toFixed(2)),
      escapeCsv(r.localSizeAvg.toFixed(0)),
      escapeCsv(r.localSizeMin.toFixed(0)),
      escapeCsv(r.localSizeMax.toFixed(0)),
      escapeCsv(r.localSizeStdDev.toFixed(0)),
      escapeCsv(r.localStatus),
      escapeCsv(r.externalTimeAvg?.toFixed(2) || ''),
      escapeCsv(r.externalTimeMin?.toFixed(2) || ''),
      escapeCsv(r.externalTimeMax?.toFixed(2) || ''),
      escapeCsv(r.externalTimeStdDev?.toFixed(2) || ''),
      escapeCsv(r.externalSizeAvg?.toFixed(0) || ''),
      escapeCsv(r.externalSizeMin?.toFixed(0) || ''),
      escapeCsv(r.externalSizeMax?.toFixed(0) || ''),
      escapeCsv(r.externalSizeStdDev?.toFixed(0) || ''),
      escapeCsv(r.externalStatus || ''),
      escapeCsv(r.timestamp),
      escapeCsv(r.error || ''),
    ].join(',')),
  ];
  
  fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf-8');
  console.log(`\nResults saved to: ${csvPath}`);
  console.log(`Total tests completed: ${completedTests}`);
  
  // Generate analysis
  await generateAnalysis(results, csvPath, timestamp);
}

// Generate analysis report
async function generateAnalysis(results: TestResult[], csvPath: string, timestamp: string) {
  const successfulResults = results.filter(r => r.localStatus === 200);
  
  if (successfulResults.length === 0) {
    console.log('\nNo successful results to analyze.');
    return;
  }
  
  // Sort by time and size
  const sortedByTime = [...successfulResults].sort((a, b) => b.localTimeAvg - a.localTimeAvg);
  const sortedBySize = [...successfulResults].sort((a, b) => b.localSizeAvg - a.localSizeAvg);
  
  // Find top 10 slowest
  const top10Slowest = sortedByTime.slice(0, 10);
  const top10Largest = sortedBySize.slice(0, 10);
  
  // Compare internal vs external
  const withExternal = successfulResults.filter(r => r.externalTimeAvg !== null);
  const externalComparison = withExternal.map(r => ({
    endpoint: r.endpoint,
    localTime: r.localTimeAvg,
    externalTime: r.externalTimeAvg!,
    timeDiff: r.externalTimeAvg! - r.localTimeAvg,
    localSize: r.localSizeAvg,
    externalSize: r.externalSizeAvg!,
    sizeDiff: r.externalSizeAvg! - r.localSizeAvg,
  }));
  
  const avgLocalTime = successfulResults.reduce((sum, r) => sum + r.localTimeAvg, 0) / successfulResults.length;
  const avgExternalTime = externalComparison.length > 0
    ? externalComparison.reduce((sum, r) => sum + r.externalTime, 0) / externalComparison.length
    : null;
  
  // Generate markdown report
  const reportPath = path.join(process.cwd(), 'scripts', `api-cost-analysis-${timestamp}.md`);
  const report = `# API Cost Analysis Report

Generated: ${new Date().toISOString()}

## Summary

- Total tests: ${results.length}
- Successful tests: ${successfulResults.length}
- Failed tests: ${results.length - successfulResults.length}
- Tests with external comparison: ${withExternal.length}

## Performance Metrics

### Average Response Times
- Local API average: ${avgLocalTime.toFixed(2)} ms
${avgExternalTime ? `- External API average: ${avgExternalTime.toFixed(2)} ms` : '- External API: No data'}
${avgExternalTime ? `- Difference: ${(avgExternalTime - avgLocalTime).toFixed(2)} ms (${((avgExternalTime / avgLocalTime - 1) * 100).toFixed(1)}% slower)` : ''}

## Top 10 Slowest Endpoints

| Rank | Endpoint | Avg Time (ms) | Min (ms) | Max (ms) | StdDev (ms) |
|------|----------|---------------|----------|----------|-------------|
${top10Slowest.map((r, i) => `| ${i + 1} | ${r.endpoint} | ${r.localTimeAvg.toFixed(2)} | ${r.localTimeMin.toFixed(2)} | ${r.localTimeMax.toFixed(2)} | ${r.localTimeStdDev.toFixed(2)} |`).join('\n')}

## Top 10 Largest Responses

| Rank | Endpoint | Avg Size (bytes) | Min (bytes) | Max (bytes) | StdDev (bytes) |
|------|----------|------------------|-------------|-------------|----------------|
${top10Largest.map((r, i) => `| ${i + 1} | ${r.endpoint} | ${r.localSizeAvg.toFixed(0)} | ${r.localSizeMin.toFixed(0)} | ${r.localSizeMax.toFixed(0)} | ${r.localSizeStdDev.toFixed(0)} |`).join('\n')}

## External vs Internal Comparison

${externalComparison.length > 0 ? `
### Endpoints with Largest External API Slowdown

| Endpoint | Local (ms) | External (ms) | Difference (ms) | % Slower |
|----------|------------|----------------|-----------------|----------|
${externalComparison
  .sort((a, b) => b.timeDiff - a.timeDiff)
  .slice(0, 10)
  .map(r => `| ${r.endpoint} | ${r.localTime.toFixed(2)} | ${r.externalTime.toFixed(2)} | ${r.timeDiff.toFixed(2)} | ${((r.timeDiff / r.localTime) * 100).toFixed(1)}% |`)
  .join('\n')}

### Endpoints with Largest External API Size Increase

| Endpoint | Local (bytes) | External (bytes) | Difference (bytes) | % Larger |
|----------|---------------|------------------|---------------------|----------|
${externalComparison
  .sort((a, b) => b.sizeDiff - a.sizeDiff)
  .slice(0, 10)
  .map(r => `| ${r.endpoint} | ${r.localSize.toFixed(0)} | ${r.externalSize.toFixed(0)} | ${r.sizeDiff.toFixed(0)} | ${((r.sizeDiff / r.localSize) * 100).toFixed(1)}% |`)
  .join('\n')}
` : 'No external API comparison data available.'}

## Efficiency Recommendations

### 1. Caching Opportunities
${top10Slowest.slice(0, 5).map(r => `- **${r.endpoint}**: Consider caching responses (avg ${r.localTimeAvg.toFixed(2)}ms)`).join('\n')}

### 2. Response Size Optimization
${top10Largest.slice(0, 5).map(r => `- **${r.endpoint}**: Consider pagination or field filtering (avg ${(r.localSizeAvg / 1024).toFixed(2)}KB)`).join('\n')}

### 3. Parameter Impact Analysis
- Review parameter combinations that significantly increase response time or size
- Consider setting optimal defaults for commonly used parameters

### 4. External API Performance
${avgExternalTime && avgExternalTime > avgLocalTime * 1.5
  ? `- External API is significantly slower (${((avgExternalTime / avgLocalTime - 1) * 100).toFixed(1)}% slower on average)
  - Consider CDN caching or edge optimization for external deployments`
  : '- External API performance is acceptable'}

## Data Files

- CSV Results: \`${path.basename(csvPath)}\`
- Analysis Report: \`${path.basename(reportPath)}\`
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\nAnalysis report saved to: ${reportPath}`);
}

// Run the audit
runAudit().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});

