"use client";

import React, { createContext, useContext, useMemo } from "react";
import useAppContext from "./app-context";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import { Jins } from "@/models/Jins";
import { Maqam } from "@/models/Maqam";

interface TranspositionsContextInterface {
  // Transpositions for the currently selected jins / maqam (existing behaviour)
  jinsTranspositions: Jins[];
  maqamTranspositions: Maqam[];
  // Cached transpositions for ALL ajnas / maqamat keyed by their id to avoid recomputation in multiple components
  allJinsTranspositionsMap: Map<string, Jins[]>;
  allMaqamTranspositionsMap: Map<string, Maqam[]>;
}

const TranspositionsContext = createContext<TranspositionsContextInterface | null>(null);

export function TranspositionsContextProvider({ children }: { children: React.ReactNode }) {
  const { selectedJinsData, selectedMaqamData, ajnas, maqamat, allPitchClasses, centsTolerance } = useAppContext();

  const jinsTranspositions = useMemo(() => {
    if (!selectedJinsData) return [];
    return getJinsTranspositions(allPitchClasses, selectedJinsData, true, centsTolerance);
  }, [allPitchClasses, selectedJinsData, centsTolerance]);

  const maqamTranspositions = useMemo(() => {
    if (!selectedMaqamData) return [];
    return getMaqamTranspositions(allPitchClasses, ajnas, selectedMaqamData, true, centsTolerance);
  }, [allPitchClasses, ajnas, selectedMaqamData, centsTolerance]);

  // Cached map of ALL jins transpositions (keyed by jins id)
  const allJinsTranspositionsMap = useMemo(() => {
    const map = new Map<string, Jins[]>();
    if (!ajnas || ajnas.length === 0 || allPitchClasses.length === 0) return map;
    for (const jins of ajnas) {
      map.set(jins.getId(), getJinsTranspositions(allPitchClasses, jins, true, centsTolerance));
    }
    return map;
  }, [ajnas, allPitchClasses, centsTolerance]);

  // Cached map of ALL maqam transpositions (keyed by maqam id)
  const allMaqamTranspositionsMap = useMemo(() => {
    const map = new Map<string, Maqam[]>();
    if (!maqamat || maqamat.length === 0 || allPitchClasses.length === 0) return map;
    for (const maqam of maqamat) {
      map.set(maqam.getId(), getMaqamTranspositions(allPitchClasses, ajnas, maqam, true, centsTolerance));
    }
    return map;
  }, [maqamat, ajnas, allPitchClasses, centsTolerance]);

  return (
    <TranspositionsContext.Provider
      value={{
        jinsTranspositions,
        maqamTranspositions,
        allJinsTranspositionsMap,
        allMaqamTranspositionsMap,
      }}
    >
      {children}
    </TranspositionsContext.Provider>
  );
}
export default function useTranspositionsContext() {
  const ctx = useContext(TranspositionsContext);
  if (!ctx) throw new Error("useTranspositionsContext must be used within a TranspositionsContextProvider");
  return ctx;
}
