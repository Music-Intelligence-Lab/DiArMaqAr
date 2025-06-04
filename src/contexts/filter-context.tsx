"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

export interface FilterSettings {
  pitchClass: boolean;
  englishName: boolean;
  abjadName: boolean;
  fractionRatio: boolean;
  cents: boolean;
  stringLength: boolean;
  fretDivision: boolean;
  decimalRatio: boolean;
  midiNote: boolean;
  frequency: boolean;
}

const defaultFilters: FilterSettings = {
  pitchClass: false,
  abjadName: false,
  englishName: true,
  fractionRatio: false,
  cents: true,
  stringLength: false,
  fretDivision: false,
  decimalRatio: false,
  midiNote: false,
  frequency: false,
};

interface FilterContextInterface {
  filters: FilterSettings;
  setFilters: React.Dispatch<React.SetStateAction<FilterSettings>>;
  toggleFilter: (field: keyof FilterSettings) => void;
}

const FilterContext = createContext<FilterContextInterface>({
  filters: defaultFilters,
  setFilters: () => {},
  toggleFilter: () => {},
});

export function FilterContextProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterSettings>(defaultFilters);

  const toggleFilter = (field: keyof FilterSettings) => {
    setFilters(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, toggleFilter }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
}