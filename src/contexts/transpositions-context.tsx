"use client";

import React, { createContext, useContext, useMemo } from "react";
import useAppContext from "./app-context";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import { Jins } from "@/models/Jins";
import { Maqam } from "@/models/Maqam";

interface TranspositionsContextInterface {
  jinsTranspositions: Jins[];
  maqamTranspositions: Maqam[];
}

const TranspositionsContext = createContext<TranspositionsContextInterface | null>(null);

export function TranspositionsContextProvider({ children }: { children: React.ReactNode }) {
  const { selectedJinsData, selectedMaqamData, ajnas, allPitchClasses, centsTolerance } = useAppContext();

  const jinsTranspositions = useMemo(() => {
    if (!selectedJinsData) return [];
    const start = performance.now();
    const result = getJinsTranspositions(allPitchClasses, selectedJinsData, true, centsTolerance);
  if (process.env.NODE_ENV !== 'production') {
      console.log('[TranspositionsContext] Recomputed Jins transpositions', {
        jinsId: selectedJinsData.getId(),
        count: result.length,
        pitchClasses: allPitchClasses.length,
        centsTolerance,
        durationMs: (performance.now() - start).toFixed(2)
      });
    }
    return result;
  }, [allPitchClasses, selectedJinsData, centsTolerance]);

  const maqamTranspositions = useMemo(() => {
    if (!selectedMaqamData) return [];
    const start = performance.now();
    const result = getMaqamTranspositions(allPitchClasses, ajnas, selectedMaqamData, true, centsTolerance);
  if (process.env.NODE_ENV !== 'production') {
      console.log('[TranspositionsContext] Recomputed Maqam transpositions', {
        maqamId: selectedMaqamData.getId(),
        count: result.length,
        pitchClasses: allPitchClasses.length,
        centsTolerance,
        durationMs: (performance.now() - start).toFixed(2)
      });
    }
    return result;
  }, [allPitchClasses, ajnas, selectedMaqamData, centsTolerance]);

  return <TranspositionsContext.Provider value={{ jinsTranspositions, maqamTranspositions }}>{children}</TranspositionsContext.Provider>;
}
export default function useTranspositionsContext() {
  const ctx = useContext(TranspositionsContext);
  if (!ctx) throw new Error("useTranspositionsContext must be used within a TranspositionsContextProvider");
  return ctx;
}
