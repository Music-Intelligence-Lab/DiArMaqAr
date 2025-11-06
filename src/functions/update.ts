import JinsData from "@/models/Jins";
import MaqamData, { Sayr } from "@/models/Maqam";
import Pattern from "@/models/Pattern";
import { Source, stringifySource, SourcePageReference } from "@/models/bibliography/Source";
import TuningSystem from "@/models/TuningSystem";
import { getSources } from "@/functions/import";

/**
 * Compares two string representations of numbers for sorting purposes.
 *
 * @param a - First string number
 * @param b - Second string number
 * @returns Numeric comparison result for sorting
 */
function compareStringNumbers(a: string, b: string): number {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  return numA - numB;
}

/**
 * Converts a sourceId to URL-safe format by looking up the source and using stringifySource.
 * Tries multiple matching strategies to find the source even if the ID format differs.
 * If the source is not found, returns the original sourceId.
 *
 * @param sourceId - The source ID to convert
 * @param sources - Array of all sources to search
 * @returns URL-safe source ID
 */
function getUrlSafeSourceId(sourceId: string, sources: Source[]): string {
  if (!sourceId) return sourceId;
  
  // First, try exact match by source ID
  let source = sources.find((s) => s.getId() === sourceId);
  
  // If not found, try to find by matching the stringified version
  // This handles cases where the sourceId might be in a different format
  if (!source) {
    source = sources.find((s) => {
      const urlSafeId = stringifySource(s, true, null);
      return urlSafeId === sourceId;
    });
  }
  
  if (source) {
    // Use stringifySource to get URL-safe ID (same as updateSources does)
    return stringifySource(source, true, null);
  }
  
  // If source not found, return original (might be already URL-safe or invalid)
  return sourceId;
}

/**
 * Converts all sourceIds in sourcePageReferences to URL-safe format.
 *
 * @param sourcePageReferences - Array of source page references
 * @param sources - Array of all sources to search
 * @returns Array of source page references with URL-safe sourceIds
 */
function convertSourcePageReferencesToUrlSafe(
  sourcePageReferences: SourcePageReference[],
  sources: Source[]
): SourcePageReference[] {
  return sourcePageReferences.map((ref) => ({
    ...ref,
    sourceId: getUrlSafeSourceId(ref.sourceId, sources),
  }));
}

/**
 * Converts all sourceIds in suyur to URL-safe format.
 *
 * @param suyur - Array of sayr objects
 * @param sources - Array of all sources to search
 * @returns Array of sayr objects with URL-safe sourceIds
 */
function convertSuyurSourceIdsToUrlSafe(suyur: Sayr[], sources: Source[]): Sayr[] {
  return suyur.map((sayr) => ({
    ...sayr,
    sourceId: getUrlSafeSourceId(sayr.sourceId, sources),
  }));
}

/**
 * Updates the tuning systems data by sending a PUT request to the API.
 *
 * This function takes an array of TuningSystem objects, sorts them by ID,
 * serializes them to JSON format, and sends them to the backend API
 * for persistent storage. It handles the conversion of TuningSystem
 * instances to plain objects suitable for JSON serialization.
 * Automatically updates the version timestamp only for modified tuning systems.
 *
 * @param newSystems - Array of TuningSystem objects to update
 * @param modifiedIds - Optional array of IDs that were actually modified (gets timestamp update)
 * @throws Error if the API request fails or returns a non-OK status
 */
export async function updateTuningSystems(newSystems: TuningSystem[], modifiedIds?: string[]) {
  newSystems.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  const currentTimestamp = new Date().toISOString();

  // Update version timestamp only for modified entities
  if (modifiedIds && modifiedIds.length > 0) {
    newSystems.forEach((ts) => {
      if (modifiedIds.includes(ts.getId())) {
        ts.setVersion(currentTimestamp);
      }
    });
  }

  // Get all sources to convert sourceIds to URL-safe format
  const sources = getSources();

  try {
    const response = await fetch("/api/tuning-systems", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        newSystems.map((ts) => ({
          id: ts.getId(),
          titleEnglish: ts.getTitleEnglish(),
          titleArabic: ts.getTitleArabic(),
          year: ts.getYear(),
          sourceEnglish: ts.getSourceEnglish(),
          sourceArabic: ts.getSourceArabic(),
          sourcePageReferences: convertSourcePageReferencesToUrlSafe(ts.getSourcePageReferences(), sources),
          creatorEnglish: ts.getCreatorEnglish(),
          creatorArabic: ts.getCreatorArabic(),
          commentsEnglish: ts.getCommentsEnglish(),
          commentsArabic: ts.getCommentsArabic(),
          tuningSystemPitchClasses: ts.getOriginalPitchClassValues(),
          noteNames: ts.getNoteNameSets().sort((a, b) => {
            const priority = ["ʿushayrān", "yegāh"];
            const getPriority = (arr: string[]) => {
              const first = arr[0];
              if (first === priority[0]) return 0;
              if (first === priority[1]) return 1;
              return 2;
            };
            return getPriority(a) - getPriority(b);
          }),
          abjadNames: ts.getAbjadNames(),
          stringLength: ts.getStringLength(),
          defaultReferenceFrequency: ts.getDefaultReferenceFrequency(),
          referenceFrequencies: ts.getReferenceFrequencies(),
          version: ts.getVersion(),
        }))
      ),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to save updated TuningSystems on the server. Status: ${response.status}, Message: ${errorText}`);
    }
  } catch (error) {
    console.error("Error updating all TuningSystems:", error);
  }
}

/**
 * Updates the ajnas data by sending a PUT request to the API.
 *
 * This function takes an array of JinsData objects, sorts them by ID,
 * and sends them to the backend API for persistent storage. It converts
 * JinsData instances to the appropriate JSON format for database storage.
 * Automatically updates the version timestamp only for modified ajnas.
 *
 * @param newAjnas - Array of JinsData objects to update
 * @param modifiedIds - Optional array of IDs that were actually modified (gets timestamp update)
 * @throws Error if the API request fails or returns a non-OK status
 */
export async function updateAjnas(newAjnas: JinsData[], modifiedIds?: string[]) {
  newAjnas.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  const currentTimestamp = new Date().toISOString();

  // Update version timestamp only for modified entities
  if (modifiedIds && modifiedIds.length > 0) {
    newAjnas.forEach((j) => {
      if (modifiedIds.includes(j.getId())) {
        j.setVersion(currentTimestamp);
      }
    });
  }

  // Get all sources to convert sourceIds to URL-safe format
  const sources = getSources();

  try {
    const response = await fetch("/api/ajnas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        newAjnas.map((j) => ({
          id: j.getId(),
          idName: j.getIdName(),
          name: j.getName(),
          noteNames: j.getNoteNames(),
          commentsEnglish: j.getCommentsEnglish() || "",
          commentsArabic: j.getCommentsArabic() || "",
          sourcePageReferences: convertSourcePageReferencesToUrlSafe(j.getSourcePageReferences(), sources),
          version: j.getVersion(),
        }))
      ),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to save updated Ajnas on the server. Status: ${response.status}, Message: ${errorText}`);
    }
  } catch (error) {
    console.error("Error updating all Ajnas:", error);
  }
}

/**
 * Updates the maqamat data by sending a PUT request to the API.
 *
 * This function takes an array of MaqamData objects, sorts them by ID,
 * and sends them to the backend API for persistent storage. It handles
 * the serialization of complex maqam structures including their constituent
 * ajnas and melodic progressions (suyur).
 * Automatically updates the version timestamp only for modified maqamat.
 *
 * @param newMaqamat - Array of MaqamData objects to update
 * @param modifiedIds - Optional array of IDs that were actually modified (gets timestamp update)
 * @throws Error if the API request fails or returns a non-OK status
 */
export async function updateMaqamat(newMaqamat: MaqamData[], modifiedIds?: string[]) {
  newMaqamat.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  const currentTimestamp = new Date().toISOString();

  // Update version timestamp only for modified entities
  if (modifiedIds && modifiedIds.length > 0) {
    newMaqamat.forEach((m) => {
      if (modifiedIds.includes(m.getId())) {
        m.setVersion(currentTimestamp);
      }
    });
  }

  // Get all sources to convert sourceIds to URL-safe format
  const sources = getSources();

  try {
    const response = await fetch("/api/maqamat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        newMaqamat.map((m) => ({
          id: m.getId(),
          idName: m.getIdName(),
          name: m.getName(),
          ascendingNoteNames: m.getAscendingNoteNames(),
          descendingNoteNames: m.getDescendingNoteNames(),
          suyur: convertSuyurSourceIdsToUrlSafe(m.getSuyur(), sources),
          commentsEnglish: m.getCommentsEnglish() || "",
          commentsArabic: m.getCommentsArabic() || "",
          sourcePageReferences: convertSourcePageReferencesToUrlSafe(m.getSourcePageReferences(), sources),
          version: m.getVersion(),
        }))
      ),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to save updated Maqamat on the server. Status: ${response.status}, Message: ${errorText}`);
    }
  } catch (error) {
    console.error("Error updating all Maqamat:", error);
  }
}

/**
 * Updates the sources (bibliographical references) data by sending a PUT request to the API.
 *
 * This function takes an array of Source objects, sorts them by ID,
 * and sends them to the backend API for persistent storage. Sources include
 * books, articles, and other references used in maqam research.
 * Automatically updates the version timestamp only for modified sources.
 *
 * @param sources - Array of Source objects to update
 * @param modifiedIds - Optional array of IDs that were actually modified (gets timestamp update)
 * @throws Error if the API request fails or returns a non-OK status
 */
export async function updateSources(sources: Source[], modifiedIds?: string[]) {
  sources.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  const currentTimestamp = new Date().toISOString();

  // Update version timestamp only for modified entities
  if (modifiedIds && modifiedIds.length > 0) {
    sources.forEach((source) => {
      if (modifiedIds.includes(source.getId())) {
        source.setVersion(currentTimestamp);
      }
    });
  }

  try {
    const response = await fetch("/api/sources", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        sources.map((source) => {
          return { ...source.convertToJSON(), id: stringifySource(source, true, null)};
        })
      ),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to save updated Sources on the server. Status: ${response.status}, Message: ${errorText}`);
    }
  } catch (error) {
    console.error("Error updating all Sources:", error);
  }
}

/**
 * Updates the patterns data by sending a PUT request to the API.
 *
 * This function takes an array of Pattern objects, sorts them by ID,
 * and sends them to the backend API for persistent storage. Patterns
 * represent recurring musical structures and melodic formulas used
 * in maqam analysis.
 * Automatically updates the version timestamp only for modified patterns.
 *
 * @param patterns - Array of Pattern objects to update
 * @param modifiedIds - Optional array of IDs that were actually modified (gets timestamp update)
 * @throws Error if the API request fails or returns a non-OK status
 */
export async function updatePatterns(patterns: Pattern[], modifiedIds?: string[]) {
  patterns.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  const currentTimestamp = new Date().toISOString();

  // Update version timestamp only for modified entities
  if (modifiedIds && modifiedIds.length > 0) {
    patterns.forEach((pattern) => {
      if (modifiedIds.includes(pattern.getId())) {
        pattern.setVersion(currentTimestamp);
      }
    });
  }

  try {
    const response = await fetch("/api/patterns", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patterns.map((pattern) => pattern.convertToJSON())),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to save updated Patterns on the server. Status: ${response.status}, Message: ${errorText}`);
    }
  } catch (error) {
    console.error("Error updating all Patterns:", error);
  }
}
