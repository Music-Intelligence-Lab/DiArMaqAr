"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

/**
 * Interface defining which filter options are enabled/disabled for displaying pitch class data
 */
export interface FilterSettings {
  pitchClass: boolean;
  englishName: boolean;
  abjadName: boolean;
  fraction: boolean;
  cents: boolean;
  centsFromZero: boolean;
  stringLength: boolean;
  fretDivision: boolean;
  decimalRatio: boolean;
  midiNote: boolean;
  midiNoteDeviation: boolean;
  frequency: boolean;
  staffNotation: boolean;
  centsDeviation: boolean;
}

/**
 * Default filter settings - determines which data columns are shown by default
 */
const defaultFilters: FilterSettings = {
  pitchClass: false,
  abjadName: false,
  englishName: true,
  fraction: false,
  decimalRatio: false,
  cents: true,
  centsFromZero: false,
  centsDeviation: false,
  stringLength: false,
  fretDivision: false,
  midiNote: false,
  midiNoteDeviation: false,
  frequency: false,
  staffNotation: false,
  
};

/**
 * Interface for the filter context that manages all filter states and their setters
 */
interface FilterContextInterface {
  filters: FilterSettings;
  setFilters: React.Dispatch<React.SetStateAction<FilterSettings>>;
  toggleFilter: (field: keyof FilterSettings) => void;
  tuningSystemsFilter: string; // Current selected tuning system filter
  setTuningSystemsFilter: React.Dispatch<React.SetStateAction<string>>;
  ajnasFilter: string; // Current selected ajnas (melodic modes) filter
  setAjnasFilter: React.Dispatch<React.SetStateAction<string>>;
  maqamatFilter: string; // Current selected maqamat (musical scales) filter
  setMaqamatFilter: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * React context for managing filter states across the application
 */
const FilterContext = createContext<FilterContextInterface>({
  filters: defaultFilters,
  setFilters: () => {},
  toggleFilter: () => {},
  tuningSystemsFilter: "",
  setTuningSystemsFilter: () => {},
  ajnasFilter: "",
  setAjnasFilter: () => {},
  maqamatFilter: "",
  setMaqamatFilter: () => {},
});

/**
 * Provider component that wraps the app and provides filter context to all child components
 */
export function FilterContextProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterSettings>(defaultFilters);
  const [tuningSystemsFilter, setTuningSystemsFilter] = useState<string>("all");
  const [ajnasFilter, setAjnasFilter] = useState<string>("all");
  const [maqamatFilter, setMaqamatFilter] = useState<string>("all");

  /**
   * Toggles a specific filter setting on/off
   */
  const toggleFilter = (field: keyof FilterSettings) => {
    setFilters((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        toggleFilter,
        tuningSystemsFilter,
        setTuningSystemsFilter,
        ajnasFilter,
        setAjnasFilter,
        maqamatFilter,
        setMaqamatFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

/**
 * Custom hook to access the filter context
 * Must be used within a FilterContextProvider
 */
export default function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
}
