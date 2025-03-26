"use client";

import React, { createContext, useState, useEffect, useRef, useContext } from "react";
import tuningSystemsData from "@/../data/tuningSystems.json";
import TuningSystem from "@/models/TuningSystem";
import TransliteratedNoteName from "@/models/NoteName";

interface EnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

interface AppContextInterface {
  isPageLoading: boolean;
  tuningSystems: TuningSystem[];
  updateAllTuningSystems: (newSystems: TuningSystem[]) => Promise<void>;
  selectedTuningSystem: TuningSystem | null;
  setSelectedTuningSystem: (tuningSystem: TuningSystem | null) => void;
  // New audio functionality:
  playNoteFrequency: (frequency: number, duration?: number) => void;
  envelopeParams: EnvelopeParams;
  setEnvelopeParams: React.Dispatch<React.SetStateAction<EnvelopeParams>>;
}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  // Existing tuning systems state:
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [selectedTuningSystem, setSelectedTuningSystem] = useState<TuningSystem | null>(null);

  // New state for ADSR envelope settings:
  const [envelopeParams, setEnvelopeParams] = useState<EnvelopeParams>({
    attack: 0.01,
    decay: 0.01,
    sustain: 0.7,
    release: 0.3,
  });

  // Audio context and master gain stored in refs so they persist:
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Initialize tuning systems
    const formattedTuningSystems = tuningSystemsData.map((data) => {
      return new TuningSystem(
        data.id,
        data.titleEnglish,
        data.titleArabic || "",
        data.year,
        data.sourceEnglish,
        data.sourceArabic,
        data.creatorEnglish,
        data.creatorArabic,
        data.commentsEnglish,
        data.commentsArabic,
        data.pitchClasses,
        data.noteNames as TransliteratedNoteName[][],
        data.abjadNames,
        Number(data.stringLength),
        Number(data.referenceFrequency)
      );
    });
    setTuningSystems(formattedTuningSystems);
    setIsPageLoading(false);
  }, []);

  useEffect(() => {
    const AudioContext = window.AudioContext;
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5; // default volume
    masterGain.connect(audioCtx.destination);
    masterGainRef.current = masterGain;
  }, []);

  // New function to play a frequency with ADSR envelope:
  const playNoteFrequency = (frequency: number, duration: number = 1) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    if (isNaN(frequency) || frequency <= 0) return;

    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    const startTime = audioCtx.currentTime;
    const { attack, decay, sustain, release } = envelopeParams;

    const attackEnd = startTime + attack;
    const decayEnd = attackEnd + decay;
    const noteOffTime = startTime + duration;
    const releaseStart = Math.max(noteOffTime - release, decayEnd);
    const releaseEnd = releaseStart + release;

    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine"; // you could extend this to allow other waveforms
    oscillator.frequency.setValueAtTime(frequency, startTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    // ADSR Envelope: Attack -> Decay -> Sustain -> Release
    gainNode.gain.linearRampToValueAtTime(1, attackEnd); // Attack
    gainNode.gain.linearRampToValueAtTime(sustain, decayEnd); // Decay
    gainNode.gain.setValueAtTime(sustain, releaseStart); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, releaseEnd); // Release

    oscillator.connect(gainNode).connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(releaseEnd);

    console.log(`Playing frequency ${frequency} Hz at time ${startTime}`);
  };

  const updateAllTuningSystems = async (newSystems: TuningSystem[]) => {
    setTuningSystems(newSystems);

    if (selectedTuningSystem) {
      const existsInNew = newSystems.find((sys) => sys.getId() === selectedTuningSystem.getId());
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
            creatorEnglish: ts.getCreatorEnglish(),
            creatorArabic: ts.getCreatorArabic(),
            commentsEnglish: ts.getCommentsEnglish(),
            commentsArabic: ts.getCommentsArabic(),
            pitchClasses: ts.getNotes(),
            noteNames: ts.getSetsOfNoteNames(),
            abjadNames: ts.getAbjadNames(),
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
        playNoteFrequency,
        envelopeParams,
        setEnvelopeParams,
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
