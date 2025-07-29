"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

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
  frequency: boolean;
  staffNotation: boolean;
  centsDeviation: boolean;
}

const defaultFilters: FilterSettings = {
  pitchClass: false,
  abjadName: false,
  englishName: true,
  fraction: false,
  cents: true,
  centsFromZero: false,
  stringLength: false,
  fretDivision: false,
  decimalRatio: false,
  midiNote: false,
  frequency: false,
  staffNotation: false,
  centsDeviation: false,
};

interface FilterContextInterface {
  filters: FilterSettings;
  setFilters: React.Dispatch<React.SetStateAction<FilterSettings>>;
  toggleFilter: (field: keyof FilterSettings) => void;
  tuningSystemsFilter: string;
  setTuningSystemsFilter: React.Dispatch<React.SetStateAction<string>>;
  ajnasFilter: string;
  setAjnasFilter: React.Dispatch<React.SetStateAction<string>>;
  maqamatFilter: string;
  setMaqamatFilter: React.Dispatch<React.SetStateAction<string>>;
}

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

export function FilterContextProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterSettings>(defaultFilters);
  const [tuningSystemsFilter, setTuningSystemsFilter] = useState<string>("all");
  const [ajnasFilter, setAjnasFilter] = useState<string>("all");
  const [maqamatFilter, setMaqamatFilter] = useState<string>("all");

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

export default function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
}
