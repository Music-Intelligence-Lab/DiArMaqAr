"use client";

import { createContext, useState, useEffect, useContext } from "react";
import tuningSystemsData from "@/../data/tuningSystems.json";
import TuningSystem from "@/models/TuningSystem";
import TransliteratedNoteName from "@/models/NoteName";

interface AppContextInterface {
  isPageLoading: boolean;
  tuningSystems: TuningSystem[];
  updateAllTuningSystems: (newSystems: TuningSystem[]) => Promise<void>;
  selectedTuningSystem: TuningSystem | null;
  setSelectedTuningSystem: (tuningSystem: TuningSystem | null) => void;
}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [selectedTuningSystem, setSelectedTuningSystem] = useState<TuningSystem | null>(null);

  useEffect(() => {
    const formattedTuningSystems = tuningSystemsData.map((data) => {
      return new TuningSystem(
        data.id,
        data.titleEnglish,
        data.titleArabic || "",
        data.year,
        data.sourceEnglish,
        data.sourceArabic,
        data.creator,
        data.commentsEnglish,
        data.commentsArabic,
        data.pitchClasses,
        data.noteNames as TransliteratedNoteName[],
        Number(data.stringLength),
        Number(data.referenceFrequency)
      );
    });

    setTuningSystems(formattedTuningSystems);
    setIsPageLoading(false);
  }, []);

  const updateAllTuningSystems = async (newSystems: TuningSystem[]) => {
    setTuningSystems(newSystems);

    if (selectedTuningSystem) {
      const existsInNew = newSystems.find(
        (sys) => sys.getId() === selectedTuningSystem.getId()
      );
      if (!existsInNew) {
        setSelectedTuningSystem(null);
      }
    }

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
            creator: ts.getCreator(),
            commentsEnglish: ts.getCommentsEnglish(),
            commentsArabic: ts.getCommentsArabic(),
            pitchClasses: ts.getNotes(),
            noteNames: ts.getNoteNames(),
            stringLength: ts.getStringLength(),
            referenceFrequency: ts.getReferenceFrequency(),
          }))
        ),
      });
      if (!response.ok) {
        throw new Error("Failed to save updated TuningSystems on the server.");
      }
    } catch (error) {
      console.error("Error updating all TuningSystems:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isPageLoading,
        tuningSystems,
        updateAllTuningSystems,
        selectedTuningSystem,
        setSelectedTuningSystem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
