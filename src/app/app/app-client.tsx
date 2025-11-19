"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useAppContext from "@/contexts/app-context";
import useMenuContext from "@/contexts/menu-context";
import TuningSystemManager from "@/components/tuning-system-manager";
import JinsTranspositions from "@/components/jins-transpositions";
import MaqamTranspositions from "@/components/maqam-transpositions";
import SayrManager from "@/components/sayr-manager";
import KeyboardControls from "@/components/keyboard-controls";
import getFirstNoteName from "@/functions/getFirstNoteName";
import PatternsManager from "@/components/patterns-manager";
import JinsManager from "@/components/jins-manager";
import MaqamManager from "@/components/maqam-manager";
import PitchClassBar from "@/components/pitch-class-bar";
import Modulations from "@/components/modulations";
import { getSources } from "@/functions/import";
import { Sayr } from "@/models/Maqam";
import Footer from "@/components/footer";
import { standardizeText } from "@/functions/export";

// URL parameter helper functions
/**
 * Formats a name for URL by removing diacritics and special characters, replacing spaces with hyphens
 */
export function formatNameForUrl(name: string): string {
  return standardizeText(name).replace(/_/g, "-");
}

/**
 * Normalizes a string for comparison purposes (case-insensitive)
 */
function normalizeForComparison(name: string): string {
  return name.toLowerCase();
}

/**
 * Creates a URL parameter for maqām or jins with optional transposition note
 */
function createUrlParameter(name: string, firstNote?: string): string {
  const formattedName = formatNameForUrl(name);

  if (firstNote) {
    // Hyphenate the first note for URL readability
    return `${formattedName}-al-${formatNameForUrl(firstNote)}`;
  }

  return formattedName;
}

/**
 * Parses a URL parameter to extract name and optional first note
 */
function parseUrlParameter(param: string): { name: string; firstNote?: string } {
  // Decode the parameter if it's URI encoded
  const decodedParam = decodeURIComponent(param);

  if (decodedParam.includes("-al-")) {
    const [name, hyphenatedFirstNote] = decodedParam.split("-al-");

    // Convert the hyphenated first note back to space-separated format
    const firstNote = hyphenatedFirstNote.replace(/-/g, " ");

    return { name, firstNote };
  }

  return { name: decodedParam };
}

/**
 * Encodes a URL parameter value safely
 */
function encodeUrlParameter(value: string): string {
  return encodeURIComponent(value);
}

/**
 * Creates a descriptive sayr parameter showing author and page information
 */
function createSayrParameter(sayrId: string, selectedMaqamData: any): string {
  try {
    const sources = getSources();

    // Find the sayr in the maqam's suyur array
    const suyur = selectedMaqamData.getSuyur();
    if (!suyur || !Array.isArray(suyur)) return sayrId;

    const sayr = suyur.find((s: Sayr) => s.id === sayrId);

    if (!sayr) return sayrId; // Fall back to ID if not found

    // Find the source
    const source = sources.find((s) => s.getId() === sayr.sourceId);

    if (!source) return sayrId; // Fall back to ID if source not found

    // Get author name (using English as default)
    const contributors = source.getContributors();
    if (!contributors || contributors.length === 0) return sayrId;

    const authorName = contributors[0]?.lastNameEnglish || "";
    if (!authorName) return sayrId;

    // Get publication date
    const publicationDate = source.getPublicationDateEnglish() || "";
    if (!publicationDate) return sayrId;

    // Create descriptive parameter in format "Author-Year-Page" with hyphens instead of spaces and special chars
    return `${formatNameForUrl(authorName)}-${publicationDate}-${sayr.page}`;
  } catch (error) {
    console.error("Error creating sayr parameter:", error);
    return sayrId; // Return original on error
  }
}

/**
 * Parses a sayr parameter to find the matching sayr ID
 */
function parseSayrParameter(param: string, maqamData: any): string | undefined {
  // If the parameter is already an ID, return it as is
  if (!param.includes("-") || param.split("-").length < 3) {
    return param;
  }

  try {
    // Parse descriptive parameter in format "Author-Year-Page"
    const sources = getSources();
    const parts = param.split("-");

    // The last part is the page
    const sayrPage = parts.pop() || "";

    // The second-to-last part is the year
    const sayrYear = parts.pop() || "";

    // The rest is the author name (might have internal hyphens)
    const sayrAuthorHyphenated = parts.join("-");

    // Unhyphenate the author name for comparison
    const sayrAuthor = sayrAuthorHyphenated.replace(/-/g, " ");

    if (!sayrAuthor || !sayrYear || !sayrPage) return param; // Return original if parts are missing

    // Find all suyur for this maqam
    const suyur = maqamData.getSuyur();

    if (!suyur || !Array.isArray(suyur)) return param; // Return original if suyur not found

    // Try to find the matching sayr
    for (const sayr of suyur) {
      if (!sayr || !sayr.sourceId) continue;

      const source = sources.find((s) => s.getId() === sayr.sourceId);
      if (!source) continue;

      // Check if author last name matches
      const contributors = source.getContributors();
      const authorMatches = contributors && contributors.length > 0 && normalizeForComparison(contributors[0]?.lastNameEnglish) === normalizeForComparison(sayrAuthor);

      // Check if publication date matches
      const dateMatches = source.getPublicationDateEnglish() === sayrYear;

      // Check if page matches
      const pageMatches = sayr.page === sayrPage;

      // If all match, return this sayr's ID
      if (authorMatches && dateMatches && pageMatches) {
        return sayr.id;
      }
    }

    return param; // Return original if no match found
  } catch (error) {
    console.error("Error parsing sayr parameter:", error);
    return param; // Return original parameter on error
  }
}
export default function AppClient() {
  const { tuningSystems, ajnas, maqamat, handleUrlParams, selectedTuningSystem, selectedJinsData, selectedMaqamData, maqamSayrId, selectedIndices, selectedMaqam, selectedJins } = useAppContext();

  const { setSelectedMenu, selectedMenu } = useMenuContext();

  const searchParams = useSearchParams();
  const router = useRouter();
  const urlParamsApplied = useRef(false);
  
  // Track previous menu for smooth transitions
  const [previousMenu, setPreviousMenu] = useState(selectedMenu);
  
  // Handle tab transitions smoothly
  useEffect(() => {
    if (selectedMenu !== previousMenu) {
      // Update previous menu after state change
      setPreviousMenu(selectedMenu);
      // Scroll to top when menu changes
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  }, [selectedMenu, previousMenu]);

  // Ensure deterministic scroll-to-top when switching back to the tuningSystem page.
  // This covers cases where a focused element in Maqam/Jins causes the page to remain
  // scrolled when returning to the tuning-system tab.
  useEffect(() => {
    if (previousMenu !== selectedMenu && selectedMenu === "tuningSystem") {
      if (typeof window !== "undefined") {
        const main = document.querySelector('.main-content');
        if (main && typeof (main as HTMLElement).scrollTo === 'function') {
          (main as HTMLElement).scrollTo({ top: 0, behavior: 'auto' });
        }
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }
  }, [selectedMenu, previousMenu]);
  useEffect(() => {
    // Only apply URL params once (initial load). This prevents stale searchParams
    // from re-applying and overriding user interactions (e.g. selecting a new tuning system).
    if (urlParamsApplied.current) return;
  // Ensure necessary app data has been loaded before attempting to apply URL params.
  // If we attempt to apply too early (before tuningSystems/ajnas/maqamat),
  // handleUrlParams will return early and we'd incorrectly mark params as applied.
  if (!tuningSystems.length || !ajnas.length || !maqamat.length) return;
    // Parse URL parameters
    let maqamId: string | undefined = undefined;
    let maqamFirstNote: string | undefined = undefined;
    let jinsId: string | undefined = undefined;
    let jinsFirstNote: string | undefined = undefined;
    const startingNoteName = searchParams.get("startingNoteName") ?? undefined;

    // Parse descriptive maqam parameter if present
    const maqamParam = searchParams.get("maqam");
    if (maqamParam) {
      const parsed = parseUrlParameter(maqamParam);

      // Find the maqam by normalized name
      if (maqamat.length > 0) {
        const foundMaqam = maqamat.find((m) => normalizeForComparison(formatNameForUrl(m.getName())) === normalizeForComparison(parsed.name));

        if (foundMaqam) {
          maqamId = foundMaqam.getId();
          if (parsed.firstNote) {
            maqamFirstNote = parsed.firstNote;
          }
        }
      }
    }

    // Parse descriptive jins parameter if present
    const jinsParam = searchParams.get("jins");
    if (jinsParam) {
      const parsed = parseUrlParameter(jinsParam);

      // Find the jins by normalized name
      if (ajnas.length > 0) {
        const foundJins = ajnas.find((j) => normalizeForComparison(formatNameForUrl(j.getName())) === normalizeForComparison(parsed.name));

        if (foundJins) {
          jinsId = foundJins.getId();
          if (parsed.firstNote) {
            jinsFirstNote = parsed.firstNote;
          }
        }
      }
    }

    // Get sayrId from the URL parameter
    let sayrId: string | undefined = undefined;

    // Parse descriptive sayr parameter if present
    const sayrParam = searchParams.get("sayr");
    if (sayrParam && maqamId) {
      // Find the maqam data for sayr parsing
      const maqamData =
        maqamParam && maqamat.length > 0 ? maqamat.find((m) => normalizeForComparison(formatNameForUrl(m.getName())) === normalizeForComparison(parseUrlParameter(maqamParam).name)) : undefined;

      if (maqamData) {
        const parsedSayrParameter = parseSayrParameter(sayrParam, maqamData);

        for (const sayr of maqamData.getSuyur()) {
          if (createSayrParameter(sayr.id, maqamData) === parsedSayrParameter) {
            sayrId = sayr.id;
            break;
          }
        }
      } else {
        sayrId = sayrParam;
      }
    }

  // Pass the parsed parameters to the app context
  handleUrlParams({
      tuningSystemId: searchParams.get("tuningSystem") ?? undefined,
      jinsDataId: jinsId,
      maqamDataId: maqamId,
      jinsFirstNote: jinsFirstNote,
      maqamFirstNote: maqamFirstNote,
      sayrId: sayrId,
      firstNote: startingNoteName,
    });
  // Mark that we've applied URL params so we don't re-apply on subsequent searchParams changes
  urlParamsApplied.current = true;

  // Set the selected menu based on parameters.
  // Priority: jins > maqam > sayr > tuningSystem (default)
  // If jins, maqam, or sayr params are present, navigate to that page
  // Otherwise show tuning system
  if (jinsId) setSelectedMenu("jins");
  else if (maqamId && sayrId) setSelectedMenu("sayr");
  else if (maqamId) setSelectedMenu("maqam");
  else setSelectedMenu("tuningSystem"); // Default to tuning system when no specific data is loaded
  }, [tuningSystems, ajnas, maqamat, searchParams, handleUrlParams, setSelectedMenu]);

  useEffect(() => {
    const params: string[] = [];

    if (selectedTuningSystem) {
      params.push(`tuningSystem=${selectedTuningSystem.getId()}`);
      const first = getFirstNoteName(selectedIndices);
      if (first && first !== "none") params.push(`startingNoteName=${standardizeText(first)}`);
    }

    // Use descriptive parameters for jins and maqam with transposition note included in parameter
    if (selectedJinsData) {
      const jinsName = selectedJinsData.getName();
      let jinsParam: string;

      if (selectedJins) {
        // Include the first note in the parameter using the "-al-" format
        const firstNote = selectedJins.jinsPitchClasses[0].noteName;
        jinsParam = createUrlParameter(jinsName, firstNote);
      } else {
        jinsParam = createUrlParameter(jinsName);
      }
      params.push(`jins=${encodeUrlParameter(jinsParam)}`);
    }

    if (selectedMaqamData) {
      const maqamName = selectedMaqamData.getName();
      let maqamParam: string;

      if (selectedMaqam) {
        // Include the first note in the parameter using the "-al-" format
        const firstNote = selectedMaqam.ascendingPitchClasses[0].noteName;
        maqamParam = createUrlParameter(maqamName, firstNote);
      } else {
        maqamParam = createUrlParameter(maqamName);
      }
      params.push(`maqam=${encodeUrlParameter(maqamParam)}`);

      if (maqamSayrId) {
        // Use descriptive sayr parameter with author and page information
        const sayrParam = createSayrParameter(maqamSayrId, selectedMaqamData);
        params.push(`sayr=${encodeUrlParameter(sayrParam)}`);
      }
    }

    if (typeof window !== "undefined" && window.location.pathname === "/app") {
      const urlParams = params.join("&");
      router.replace(`/app?${urlParams}`, { scroll: false });
    }
  }, [selectedTuningSystem, selectedJinsData, selectedMaqamData, maqamSayrId, selectedIndices, selectedMaqam, selectedJins, router]);

  return (
    <div className="main-content">
      <>
        {selectedMenu === "tuningSystem" && <TuningSystemManager admin={false} />}
        {selectedMenu === "tuningSystem-admin" && <TuningSystemManager admin />}
        {selectedMenu === "maqam" && selectedTuningSystem && <MaqamManager admin={false} />}
        {selectedMenu === "maqam-admin" && selectedTuningSystem && <MaqamManager admin />}
        {selectedMenu === "jins" && selectedTuningSystem && <JinsManager admin={false} />}
        {selectedMenu === "jins-admin" && selectedTuningSystem && <JinsManager admin />}
        {selectedTuningSystem && !["tuningSystem", "tuningSystem-admin", "bibliography", "bibliography-admin", "pattern-admin"].includes(selectedMenu) && <PitchClassBar />}
        {(selectedMenu === "maqam" || selectedMenu === "maqam-admin") && selectedTuningSystem && <MaqamTranspositions />}
        {(selectedMenu === "jins" || selectedMenu === "jins-admin") && selectedTuningSystem && <JinsTranspositions />}
        {selectedMenu === "sayr" && selectedMaqamData && <SayrManager admin={false} />}
        {selectedMenu === "sayr-admin" && selectedMaqamData && <SayrManager admin />}
        {selectedMenu === "modulation" && <Modulations />}
        {selectedMenu === "pattern-admin" && <PatternsManager />}
      </>
      <Footer/>
      <KeyboardControls />
    </div>
  );
}
