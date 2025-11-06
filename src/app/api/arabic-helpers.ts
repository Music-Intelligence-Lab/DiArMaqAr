import { getDynamicArabicName, getInArabicFlag } from "@/functions/dynamicArabicConverter";

/**
 * Helper utilities for Arabic language support in API responses
 * 
 * When inArabic=true, responses are bilingual - English/transliteration fields remain,
 * and Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
 */

/**
 * Gets Arabic version of note name
 */
export function getNoteNameDisplayAr(name: string): string {
  return getDynamicArabicName(name, "note");
}

/**
 * Gets Arabic version of jins name
 */
export function getJinsNameDisplayAr(name: string): string {
  return getDynamicArabicName(name, "jins");
}

/**
 * Gets Arabic version of maqam name
 */
export function getMaqamNameDisplayAr(name: string): string {
  return getDynamicArabicName(name, "maqam");
}

/**
 * Gets Arabic comments (returns Arabic version or null)
 */
export function getCommentsAr(commentsArabic: string): string | null {
  return commentsArabic?.trim() || null;
}

/**
 * Gets English comments (returns English version or null)
 */
export function getComments(commentsEnglish: string): string | null {
  return commentsEnglish?.trim() || null;
}

/**
 * Gets Arabic tuning system display name
 */
export function getTuningSystemDisplayNameAr(
  creatorArabic: string,
  creatorEnglish: string,
  year: string,
  titleArabic: string,
  titleEnglish: string
): string {
  const creator = creatorArabic || creatorEnglish;
  const title = titleArabic || titleEnglish;
  return `${creator} (${year}) ${title}`;
}

/**
 * Adds Arabic fields to an object when inArabic=true
 * @param obj - The object to add Arabic fields to
 * @param inArabic - Whether to add Arabic fields
 * @param fields - Object mapping of field names to their Arabic values
 */
export function addArabicFields(obj: any, inArabic: boolean, fields: Record<string, string | null>): any {
  if (!inArabic) return obj;
  const result = { ...obj };
  for (const [fieldName, arabicValue] of Object.entries(fields)) {
    if (arabicValue !== null && arabicValue !== undefined) {
      result[`${fieldName}Ar`] = arabicValue;
    }
  }
  return result;
}

/**
 * Validates and parses the inArabic query parameter
 */
export function parseInArabic(searchParams: URLSearchParams): boolean {
  return getInArabicFlag(searchParams);
}

