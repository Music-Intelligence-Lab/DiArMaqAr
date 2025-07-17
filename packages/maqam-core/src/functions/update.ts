import JinsDetails from "../models/Jins";
import MaqamDetails from "../models/Maqam";
import Pattern from "../models/Pattern";
import { Source } from "../models/bibliography/Source";
import TuningSystem from "../models/TuningSystem";

function compareStringNumbers(a: string, b: string): number {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  return numA - numB;
}

export async function updateTuningSystems(newSystems: TuningSystem[]) {
  newSystems.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  try {
    const response = await fetch("/api/tuningSystems", {
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
          sourcePageReferences: ts.getSourcePageReferences(),
          creatorEnglish: ts.getCreatorEnglish(),
          creatorArabic: ts.getCreatorArabic(),
          commentsEnglish: ts.getCommentsEnglish(),
          commentsArabic: ts.getCommentsArabic(),
          tuningSystemPitchClasses: ts.getPitchClasses(),
          noteNames: ts.getNoteNames().sort((a, b) => {
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
        }))
      ),
    });
    if (!response.ok) {
      throw new Error("Failed to save updated TuningSystems on the server.");
    }
  } catch (error) {
    console.error("Error updating all TuningSystems:", error);
  }
}

export async function updateAjnas(newAjnas: JinsDetails[]) {
  newAjnas.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  try {
    const response = await fetch("/api/ajnas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        newAjnas.map((j) => ({
          id: j.getId(),
          name: j.getName(),
          noteNames: j.getNoteNames(),
          commentsEnglish: j.getCommentsEnglish() || "",
          commentsArabic: j.getCommentsArabic() || "",
          sourcePageReferences: j.getSourcePageReferences(),
        }))
      ),
    });
    if (!response.ok) {
      throw new Error("Failed to save updated Ajnas on the server.");
    }
  } catch (error) {
    console.error("Error updating all Ajnas:", error);
  }
}

export async function updateMaqamat(newMaqamat: MaqamDetails[]) {
  newMaqamat.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  try {
    const response = await fetch("/api/maqamat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        newMaqamat.map((m) => ({
          id: m.getId(),
          name: m.getName(),
          ascendingNoteNames: m.getAscendingNoteNames(),
          descendingNoteNames: m.getDescendingNoteNames(),
          suyūr: m.getSuyūr(),
          commentsEnglish: m.getCommentsEnglish() || "",
          commentsArabic: m.getCommentsArabic() || "",
          sourcePageReferences: m.getSourcePageReferences(),
        }))
      ),
    });
    if (!response.ok) {
      throw new Error("Failed to save updated Maqamat on the server.");
    }
  } catch (error) {
    console.error("Error updating all Maqamat:", error);
  }
}

export async function updateSources(sources: Source[]) {
  sources.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  try {
    const response = await fetch("/api/sources", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sources.map((source) => source.convertToJSON())),
    });
    if (!response.ok) {
      throw new Error("Failed to save updated Sources on the server.");
    }
  } catch (error) {
    console.error("Error updating all Sources:", error);
  }
}

export async function updatePatterns(patterns: Pattern[]) {
  patterns.sort((a, b) => compareStringNumbers(a.getId(), b.getId()));
  try {
    const response = await fetch("/api/patterns", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patterns.map((pattern) => pattern.convertToJSON())),
    });
    if (!response.ok) {
      throw new Error("Failed to save updated Patterns on the server.");
    }
  } catch (error) {
    console.error("Error updating all Patterns:", error);
  }
}
