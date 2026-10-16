"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, useParams, usePathname } from "next/navigation";
import { stripLocale } from "@/i18n/navigation";
import useAppContext, { ModulationChainHop } from "@/contexts/app-context";
import useMenuContext from "@/contexts/menu-context";
import MaqamData from "@/models/Maqam";
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
import { Sayr } from "@/models/Maqam";
import Footer from "@/components/footer";
import { createEntityToken, resolveEntityId, standardizeText } from "@/functions/export";

// URL parameter helper functions
//
// Every identifier in the query string is a standardizeText() output — lowercase
// [a-z0-9_], one double-clickable word — so nothing here percent-encodes and
// nothing here needs to. The only structural characters are "_al_" between an
// entity and its tonic (read back by resolveEntityId), "," between modulation
// hops and "." before a hop flag.

/**
 * Builds the URL token for a sayr: the id of the source it is transcribed from
 * — "alhilu_1961".
 *
 * It comes straight off the sayr, so there is nothing to look up and nothing
 * that can fail to resolve. Where one source contributes more than one sayr to
 * the same maqām, the two are separated at the source level by a letter on the
 * year ("alhilu_1961a", "alhilu_1961b"), not by anything added here.
 */
function createSayrToken(sayr: Sayr): string {
  return sayr.sourceId;
}
/**
 * Serializes the modulations (intiqālāt) chain as a URL parameter value.
 *
 * Convention: comma-separated hops, each hop being the entity token of the
 * maqām with its tonic, plus optional dot-flags ".8vb" (octave-shifted options)
 * and ".ajnas" (ajnas view):
 *
 *   modulations=maqam_rast__nawa,maqam_hijaz__nawa.8vb,maqam_bayyati__dugah
 */
function createModulationsParameter(chain: ModulationChainHop[], maqamat: MaqamData[]): string | null {
  const hops: string[] = [];

  for (const hop of chain) {
    const maqamData = maqamat.find((m) => m.getId() === hop.maqamId);
    if (!maqamData) return null;

    let token = createEntityToken(maqamData.getIdName(), hop.tonicIdName);
    if (hop.octaveShift) token += ".8vb";
    if (hop.ajnasMode) token += ".ajnas";
    hops.push(token);
  }

  return hops.join(",");
}

/**
 * Parses a modulations chain parameter back into hop descriptors.
 *
 * An unrecognized hop truncates the chain there; the valid prefix is still
 * restored.
 */
function parseModulationsParameter(param: string, maqamat: MaqamData[]): ModulationChainHop[] {
  const chain: ModulationChainHop[] = [];

  for (const rawToken of param.split(",")) {
    const [base, ...flags] = rawToken.trim().split(".");

    const matched = resolveEntityId(base, maqamat);
    if (!matched) break;

    // A hop always names a tonic; a bare idName means the taḥlīl of that maqām.
    const tonicIdName = matched.tonicIdName ?? standardizeText(matched.entity.getAscendingNoteNames()[0] ?? "");
    if (!tonicIdName) break;

    chain.push({
      maqamId: matched.entity.getId(),
      tonicIdName,
      octaveShift: flags.includes("8vb"),
      ajnasMode: flags.includes("ajnas"),
    });
  }

  return chain;
}

export default function AppClient() {
  const { tuningSystems, ajnas, maqamat, handleUrlParams, selectedTuningSystem, selectedJinsData, selectedMaqamData, maqamSayrId, selectedIndices, selectedMaqam, selectedJins, referenceFrequencies, modulationChain, setModulationChain, centsTolerance } = useAppContext();

  const { setSelectedMenu, selectedMenu } = useMenuContext();

  const searchParams = useSearchParams();
  const router = useRouter();
  const routeParams = useParams();
  const pathname = usePathname();
  const lang = (Array.isArray(routeParams?.lang) ? routeParams.lang[0] : routeParams?.lang) ?? "en";
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

    // Parse reference frequency parameter if present
    const refFreqParam = searchParams.get("refFreq");
    const referenceFrequency = refFreqParam ? parseFloat(refFreqParam) : undefined;

    // Parse cents tolerance parameter if present (ignore invalid/negative values)
    const centsToleranceParam = searchParams.get("centsTolerance");
    let urlCentsTolerance: number | undefined = undefined;
    if (centsToleranceParam) {
      const parsed = parseFloat(centsToleranceParam);
      if (!isNaN(parsed) && parsed >= 0) urlCentsTolerance = parsed;
    }

    // Parse the maqam parameter if present
    const maqamParam = searchParams.get("maqam");
    if (maqamParam) {
      const matched = resolveEntityId(maqamParam, maqamat);
      if (matched) {
        maqamId = matched.entity.getId();
        maqamFirstNote = matched.tonicIdName;
      }
    }

    // Parse the jins parameter if present
    const jinsParam = searchParams.get("jins");
    if (jinsParam) {
      const matched = resolveEntityId(jinsParam, ajnas);
      if (matched) {
        jinsId = matched.entity.getId();
        jinsFirstNote = matched.tonicIdName;
      }
    }

    // Parse the modulations (intiqālāt) chain parameter if present.
    // The chain is self-contained: its last hop defines the current maqam selection,
    // so it takes precedence over the maqam/jins parameters.
    let urlModulationChain: ModulationChainHop[] | null = null;
    const modulationsParam = searchParams.get("modulations");
    if (modulationsParam && maqamat.length > 0) {
      const parsedChain = parseModulationsParameter(modulationsParam, maqamat);
      if (parsedChain.length > 0) {
        const tail = parsedChain[parsedChain.length - 1];
        urlModulationChain = parsedChain;
        maqamId = tail.maqamId;
        maqamFirstNote = tail.tonicIdName;
        jinsId = undefined;
        jinsFirstNote = undefined;
      }
    }

    // Parse the sayr parameter if present. A sayr belongs to a maqām, so it can
    // only be resolved once the maqām is known — and only against that maqām's
    // own suyur, never carried through as an unresolved id.
    let sayrId: string | undefined = undefined;

    const sayrParam = searchParams.get("sayr");
    if (sayrParam && maqamId) {
      const maqamData = maqamat.find((m) => m.getId() === maqamId);
      sayrId = maqamData?.getSuyur().find((sayr) => createSayrToken(sayr) === sayrParam)?.id;
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
      referenceFrequency: referenceFrequency,
      centsTolerance: urlCentsTolerance,
    });
  // Mark that we've applied URL params so we don't re-apply on subsequent searchParams changes
  urlParamsApplied.current = true;

  // Store the parsed modulations chain so the modulations component can replay it
  if (urlModulationChain) setModulationChain(urlModulationChain);

  // Set the selected menu based on parameters.
  // Priority: modulations > jins > maqam > sayr > tuningSystem (default)
  // If modulations, jins, maqam, or sayr params are present, navigate to that page
  // Otherwise show tuning system
  if (urlModulationChain) setSelectedMenu("modulation");
  else if (jinsId) setSelectedMenu("jins");
  else if (maqamId && sayrId) setSelectedMenu("sayr");
  else if (maqamId) setSelectedMenu("maqam");
  else setSelectedMenu("tuningSystem"); // Default to tuning system when no specific data is loaded
  }, [tuningSystems, ajnas, maqamat, searchParams, handleUrlParams, setSelectedMenu, setModulationChain]);

  useEffect(() => {
    const params: string[] = [];

    if (selectedTuningSystem) {
      params.push(`tuningSystem=${selectedTuningSystem.getId()}`);

      // Get the starting note from selectedIndices
      const first = getFirstNoteName(selectedIndices);

      if (first && first !== "none") {
        params.push(`startingNoteName=${standardizeText(first)}`);

        // Always include reference frequency for the starting note
        const currentRefFreq = referenceFrequencies[first];
        if (currentRefFreq) {
          params.push(`refFreq=${currentRefFreq}`);
        }
      }

      params.push(`centsTolerance=${centsTolerance}`);
    }

    // A selected transposition contributes its tonic to the token; the taḥlīl is
    // the bare idName.
    if (selectedJinsData) {
      params.push(`jins=${createEntityToken(selectedJinsData.getIdName(), selectedJins?.jinsPitchClasses[0].noteName)}`);
    }

    if (selectedMaqamData) {
      params.push(`maqam=${createEntityToken(selectedMaqamData.getIdName(), selectedMaqam?.ascendingPitchClasses[0].noteName)}`);

      if (maqamSayrId) {
        const sayr = selectedMaqamData.getSuyur().find((s) => s.id === maqamSayrId);
        if (sayr) params.push(`sayr=${createSayrToken(sayr)}`);
      }
    }

    // Only include the modulations chain while the modulations page is active,
    // so the shared URL restores exactly the view being looked at. A single-hop
    // chain is just the selected maqam with no modulations, so it is omitted —
    // the param's presence would otherwise force the app to the modulations page.
    if (selectedMenu === "modulation" && modulationChain && modulationChain.length > 1) {
      const modulationsParam = createModulationsParameter(modulationChain, maqamat);
      if (modulationsParam) params.push(`modulations=${modulationsParam}`);
    }

    if (stripLocale(pathname) === "/app") {
      const urlParams = params.join("&");
      router.replace(`/${lang}/app?${urlParams}`, { scroll: false });
    }
  }, [selectedTuningSystem, selectedJinsData, selectedMaqamData, maqamSayrId, selectedIndices, selectedMaqam, selectedJins, referenceFrequencies, modulationChain, selectedMenu, maqamat, centsTolerance, router, pathname, lang]);

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
