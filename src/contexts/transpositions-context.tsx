"use client";

/**
 * @fileoverview Transpositions Context for musical scale and mode transpositions.
 * 
 * This context provides pre-computed transpositions for musical analysis:
 * - Real-time transposition calculations for selected ajnas and maqamat
 * - Cached transposition maps for performance optimization
 * - Integration with tuning system pitch classes and tolerance settings
 * - Support for both individual and bulk transposition operations
 * 
 * The context optimizes the computationally intensive process of finding
 * all possible transpositions of musical scales and modes within a given
 * tuning system, enabling responsive musical analysis interfaces.
 */

import React, { createContext, useContext, useMemo } from "react";
import useAppContext from "./app-context";
import { calculateJinsTranspositions, calculateMaqamTranspositions } from "@/functions/transpose";
import { Jins } from "@/models/Jins";
import { Maqam } from "@/models/Maqam";

/**
 * Interface defining the structure of the Transpositions Context.
 * 
 * Provides access to computed transpositions for musical analysis
 * and performance within the current tuning system.
 */
interface TranspositionsContextInterface {
  /** Transpositions of the currently selected jins */
  jinsTranspositions: Jins[];
  /** Transpositions of the currently selected maqam */
  maqamTranspositions: Maqam[];
  /** Map of all jins IDs to their complete transposition sets */
  allJinsTranspositionsMap: Map<string, Jins[]>;
  /** Map of all maqam IDs to their complete transposition sets */
  allMaqamTranspositionsMap: Map<string, Maqam[]>;
}

/** React context for transposition calculations */
const TranspositionsContext = createContext<TranspositionsContextInterface | null>(null);

/**
 * Transpositions Context Provider Component
 * 
 * Provides optimized transposition calculations for the Maqam Network application.
 * Pre-computes and caches transpositions to enable responsive musical analysis.
 * 
 * @param children - Child components that will have access to the transpositions context
 * @returns JSX element providing the transpositions context
 */
export function TranspositionsContextProvider({ children }: { children: React.ReactNode }) {
  const { selectedJinsData, selectedMaqamData, ajnas, maqamat, allPitchClasses, centsTolerance } = useAppContext();

  // ==================== SELECTED ITEM TRANSPOSITIONS ====================
  
  /**
   * Transpositions of the currently selected jins.
   * Recalculated when jins selection, pitch classes, or tolerance changes.
   */
  const jinsTranspositions = useMemo(() => {
    if (!selectedJinsData) return [];
    return calculateJinsTranspositions(allPitchClasses, selectedJinsData, true, centsTolerance);
  }, [allPitchClasses, selectedJinsData, centsTolerance]);

  /**
   * Transpositions of the currently selected maqam.
   * Recalculated when maqam selection, pitch classes, ajnas, or tolerance changes.
   */
  const maqamTranspositions = useMemo(() => {
    if (!selectedMaqamData) return [];
    return calculateMaqamTranspositions(allPitchClasses, ajnas, selectedMaqamData, true, centsTolerance);
  }, [allPitchClasses, ajnas, selectedMaqamData, centsTolerance]);

  // ==================== COMPREHENSIVE TRANSPOSITION MAPS ====================
  
  /**
   * Complete map of all ajnas to their transposition sets.
   * Provides quick access to any jins transpositions without recalculation.
   */
  const allJinsTranspositionsMap = useMemo(() => {
    const map = new Map<string, Jins[]>();
    if (!ajnas || ajnas.length === 0 || allPitchClasses.length === 0) return map;
    
    for (const jins of ajnas) {
      map.set(jins.getId(), calculateJinsTranspositions(allPitchClasses, jins, true, centsTolerance));
    }
    return map;
  }, [ajnas, allPitchClasses, centsTolerance]);

  /**
   * Complete map of all maqamat to their transposition sets.
   * Provides quick access to any maqam transpositions without recalculation.
   */
  const allMaqamTranspositionsMap = useMemo(() => {
    const map = new Map<string, Maqam[]>();
    if (!maqamat || maqamat.length === 0 || allPitchClasses.length === 0) return map;
    
    for (const maqam of maqamat) {
      map.set(maqam.getId(), calculateMaqamTranspositions(allPitchClasses, ajnas, maqam, true, centsTolerance));
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

/**
 * Custom hook to access the Transpositions Context.
 * 
 * Provides convenient access to all transposition calculations
 * and cached maps for musical analysis components.
 */
export default function useTranspositionsContext(): TranspositionsContextInterface {
  const context = useContext(TranspositionsContext);
  if (!context) {
    throw new Error(
      "useTranspositionsContext must be used within a TranspositionsContextProvider"
    );
  }
  return context;
}
