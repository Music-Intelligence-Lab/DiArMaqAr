"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

export interface FilterSettings {
  englishName: boolean;
  fractionRatio: boolean;
  cents: boolean;
  stringLength: boolean;
  fretDivision: boolean;
  decimalRatio: boolean;
  midiNote: boolean;
  frequency: boolean;
}

const defaultFilters: FilterSettings = {
  englishName: true,
  fractionRatio: true,
  cents: true,
  stringLength: true,
  fretDivision: true,
  decimalRatio: true,
  midiNote: true,
  frequency: true,
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