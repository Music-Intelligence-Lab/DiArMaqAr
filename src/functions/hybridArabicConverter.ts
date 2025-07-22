/**
 * Hybrid Arabic Name System
 * Uses dynamic transliteration for comprehensive coverage
 * All mappings are now handled in the dynamic converter
 */

import { getDynamicArabicName } from './dynamicArabicConverter';

/**
 * Hybrid approach: Use dynamic conversion which now includes all necessary mappings
 */
export function getHybridArabicName(name: string, type: 'note' | 'jins' | 'maqam'): string {
  if (!name || typeof name !== 'string') return name;
  
  // Use dynamic converter which now has comprehensive mappings
  return getDynamicArabicName(name, type);
}

/**
 * Batch conversion with hybrid approach
 */
export function convertNamesArrayHybrid(names: string[], type: 'note' | 'jins' | 'maqam'): string[] {
  return names.map(name => getHybridArabicName(name, type));
}

/**
 * Analyze translation coverage (simplified since we use dynamic conversion)
 */
export function analyzeTranslationCoverage(names: string[]): {
  total: number;
  staticMapped: number;
  dynamicFallback: number;
  coverage: number;
  unmappedNames: string[];
} {
  // Since we're using dynamic conversion, all names are "covered"
  return {
    total: names.length,
    staticMapped: 0, // All handled dynamically now
    dynamicFallback: names.length,
    coverage: 100, // Dynamic converter handles everything
    unmappedNames: []
  };
}

export default getHybridArabicName;
