"use client";

import React, { createContext, useState, useEffect, useRef, useContext } from "react";
import tuningSystemsData from "@/../data/tuningSystems.json";
import ajnasData from "@/../data/ajnas.json";
import maqamatData from "@/../data/maqamat.json";
import TuningSystem from "@/models/TuningSystem";
import Jins from "@/models/Jins";
import TransliteratedNoteName, { TransliteratedNoteNameOctaveOne, TransliteratedNoteNameOctaveTwo } from "@/models/NoteName";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass, { shiftPitchClass, frequencyToMidiNoteNumber } from "@/functions/convertPitchClass";
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames } from "@/models/NoteName";
import Maqam, { Seir } from "@/models/Maqam";
import { useRouter } from "next/navigation";

interface EnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  waveform: string;
}

export interface SelectedCell {
  octave: number;
  index: number;
}

export interface CellDetails {
  noteName: string;
  fraction: string;
  cents: string;
  ratios: string;
  stringLength: string;
  frequency: string;
  originalValue: string;
  originalValueType: string;
  octave?: number;
}

interface MidiPortInfo {
  id: string;
  name: string;
}

type SoundMode = "mute" | "waveform" | "midi";

interface AppContextInterface {
  isPageLoading: boolean;
  tuningSystems: TuningSystem[];
  updateAllTuningSystems: (newSystems: TuningSystem[]) => Promise<void>;
  selectedTuningSystem: TuningSystem | null;
  setSelectedTuningSystem: (tuningSystem: TuningSystem | null) => void;
  pitchClasses: string;
  setPitchClasses: React.Dispatch<React.SetStateAction<string>>;
  noteNames: TransliteratedNoteName[][];
  setNoteNames: (noteNames: TransliteratedNoteName[][]) => void;
  getFirstNoteName: () => string;
  handleStartNoteNameChange: (startingNoteName: string) => void;
  playNoteFrequency: (frequency: number, duration?: number) => void;
  envelopeParams: EnvelopeParams;
  setEnvelopeParams: React.Dispatch<React.SetStateAction<EnvelopeParams>>;
  selectedCells: SelectedCell[];
  setSelectedCells: React.Dispatch<React.SetStateAction<SelectedCell[]>>;
  getAllCells: () => SelectedCell[];
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  originalIndices: number[];
  setOriginalIndices: React.Dispatch<React.SetStateAction<number[]>>;
  mapIndices: (notesToMap: TransliteratedNoteName[]) => void;
  initialMappingDone: boolean;
  setInitialMappingDone: React.Dispatch<React.SetStateAction<boolean>>;
  getSelectedCellDetails: (cell: SelectedCell) => CellDetails;
  ajnas: Jins[];
  setAjnas: React.Dispatch<React.SetStateAction<Jins[]>>;
  updateAllAjnas: (newAjnas: Jins[]) => Promise<void>;
  selectedJins: Jins | null;
  setSelectedJins: React.Dispatch<React.SetStateAction<Jins | null>>;
  checkIfJinsIsSelectable: (jins: Jins) => boolean;
  handleClickJins: (jins: Jins) => void;
  maqamat: Maqam[];
  setMaqamat: React.Dispatch<React.SetStateAction<Maqam[]>>;
  updateAllMaqamat: (newMaqamat: Maqam[]) => Promise<void>;
  selectedMaqam: Maqam | null;
  setSelectedMaqam: React.Dispatch<React.SetStateAction<Maqam | null>>;
  checkIfMaqamIsSelectable: (maqam: Maqam) => boolean;
  handleClickMaqam: (maqam: Maqam) => void;
  getNoteNamesUsedInTuningSystem: () => TransliteratedNoteName[];
  centsTolerance: number;
  setCentsTolerance: React.Dispatch<React.SetStateAction<number>>;
  clearSelections: () => void;
  isAscending: boolean;
  setIsAscending: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  tempo: number;
  setTempo: React.Dispatch<React.SetStateAction<number>>;
  playSequence: (frequencies: number[], noteDuration?: number) => void;
  noteOn: (frequency: number) => void;
  noteOff: (frequency: number) => void;
  handleUrlParams: (params: { tuningSystemId?: string; jinsId?: string; maqamId?: string; firstNote?: string }) => void;
  midiOutputs: MidiPortInfo[];
  selectedMidiOutputId: string | null;
  setSelectedMidiOutputId: React.Dispatch<React.SetStateAction<string | null>>;
  soundMode: SoundMode;
  setSoundMode: React.Dispatch<React.SetStateAction<SoundMode>>;
}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [selectedTuningSystem, setSelectedTuningSystem] = useState<TuningSystem | null>(null);
  const [pitchClasses, setPitchClasses] = useState("");
  const [noteNames, setNoteNames] = useState<TransliteratedNoteName[][]>([]);
  const [centsTolerance, setCentsTolerance] = useState(1);

  const [envelopeParams, setEnvelopeParams] = useState<EnvelopeParams>({
    attack: 0.01,
    decay: 0.01,
    sustain: 0.7,
    release: 0.3,
    waveform: "triangle",
  });

  const activeNotesRef = useRef<Map<number, { oscillator: OscillatorNode; gainNode: GainNode }[]>>(new Map());

  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(1);
  const [tempo, setTempo] = useState<number>(120);

  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [originalIndices, setOriginalIndices] = useState<number[]>([]);
  const [initialMappingDone, setInitialMappingDone] = useState(false);

  const [ajnas, setAjnas] = useState<Jins[]>([]);
  const [selectedJins, setSelectedJins] = useState<Jins | null>(null);

  const [maqamat, setMaqamat] = useState<Maqam[]>([]);
  const [selectedMaqam, setSelectedMaqam] = useState<Maqam | null>(null);
  const [isAscending, setIsAscending] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const [midiOutputs, setMidiOutputs] = useState<MidiPortInfo[]>([]);
  const [selectedMidiOutputId, setSelectedMidiOutputId] = useState<string | null>(null);
  const [soundMode, setSoundMode] = useState<SoundMode>("waveform");

  const midiAccessRef = useRef<MIDIAccess | null>(null);

  const sendMidiMessage = (bytes: number[]) => {
    const ma = midiAccessRef.current;
    if (!ma || !selectedMidiOutputId) return;

    const port = ma.outputs.get(selectedMidiOutputId);
    port?.send(bytes);
  };

  function sendPitchBend(detuneSemitones: number) {
    const semitoneRange = 2;
    const center = 8192;
    const bendOffset = Math.round((detuneSemitones / semitoneRange) * center);
    const bendValue = Math.max(0, Math.min(16383, center + bendOffset));
    const lsb = bendValue & 0x7f;
    const msb = (bendValue >> 7) & 0x7f;
    sendMidiMessage([0xe0, lsb, msb]);
  }

  const router = useRouter();

  const pitchClassesArr = pitchClasses
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  useEffect(() => {
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

    const loadedAjnas = ajnasData.map((data) => new Jins(data.id, data.name, data.noteNames));
    setAjnas(loadedAjnas);

    const loadedMaqamat = maqamatData.map(
      (data) => new Maqam(data.id, data.name, data.ascendingNoteNames, data.descendingNoteNames, data.suyur as Seir[])
    );
    setMaqamat(loadedMaqamat);

    setIsPageLoading(false);
  }, []);

  useEffect(() => {
    const AudioContext = window.AudioContext;
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);
    masterGainRef.current = masterGain;
  }, []);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current!.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    const params = [];

    if (selectedTuningSystem) {
      params.push(`tuningSystem=${selectedTuningSystem.getId()}`);
      const firstNote = getFirstNoteName();
      if (firstNote) {
        params.push(`firstNote=${firstNote}`);
      }
    }

    if (selectedJins) {
      params.push(`jins=${selectedJins.getId()}`);
    }

    if (selectedMaqam) {
      params.push(`maqam=${selectedMaqam.getId()}`);
    }

    router.replace(`/?${params.join("&")}`, { scroll: false });
  }, [selectedTuningSystem, selectedJins, selectedMaqam, selectedIndices, originalIndices]);

  useEffect(() => {
    if (!selectedMaqam) return;

    const usedNoteNames = getNoteNamesUsedInTuningSystem();

    const namesToSelect = isAscending ? selectedMaqam.getAscendingNoteNames() : selectedMaqam.getDescendingNoteNames();

    // translate names back into SelectedCell[] by matching against usedNoteNames
    const newCells: SelectedCell[] = [];
    usedNoteNames.forEach((name, idx) => {
      if (namesToSelect.includes(name)) {
        let octave = 0;
        let index = idx;
        // assume 4 octaves evenly divided
        const perOct = usedNoteNames.length / 4;
        while (index >= perOct) {
          octave++;
          index -= perOct;
        }
        newCells.push({ octave, index });
      }
    });
    setSelectedCells(newCells);
  }, [isAscending]);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;
    navigator
      .requestMIDIAccess({ sysex: false })
      .then((ma) => {
        midiAccessRef.current = ma;
        const list = Array.from(ma.outputs.values()).map((o) => ({
          id: o.id,
          name: o.name || o.manufacturer || "Unknown",
        }));
        setMidiOutputs(list);
        ma.onstatechange = () => {
          // re-scan on connect/disconnect
          const outs = Array.from(ma.outputs.values()).map((o) => ({
            id: o.id,
            name: o.name || o.manufacturer || "Unknown",
          }));
          setMidiOutputs(outs);
        };
      })
      .catch(console.error);
  }, []);

  const playNoteFrequency = (frequency: number, givenDuration: number = duration) => {
    // 1) Mute
    if (soundMode === "mute") return;
    // 2) MIDI
    if (soundMode === "midi") {
      // compute float MIDI note and detune fraction
      const mf = frequencyToMidiNoteNumber(frequency);
      const note = Math.floor(mf);
      const detune = mf - note;

      // send pitch bend then note-on
      sendPitchBend(detune);
      const vel = Math.round(volume * 127);
      sendMidiMessage([0x90, note, vel]);
      console.log("NOTE ON", note, vel ,duration);
      // schedule note-off after givenDuration (in seconds)
      setTimeout(() => {
        console.log("NOTE OFF", note);
        sendMidiMessage([0x80, note, 0]);
      }, givenDuration * 1000);

      return;
    }

    // 3) Waveform (unchanged)
    if (!audioCtxRef.current || !masterGainRef.current) return;
    if (isNaN(frequency) || frequency <= 0) return;

    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    const startTime = audioCtx.currentTime;
    const { attack, decay, sustain, release } = envelopeParams;

    const attackEnd = startTime + attack;
    const decayEnd = attackEnd + decay;
    const noteOffTime = startTime + givenDuration;
    const releaseStart = Math.max(noteOffTime - release, decayEnd);
    const releaseEnd = releaseStart + release;

    const oscillator = audioCtx.createOscillator();
    oscillator.type = envelopeParams.waveform as OscillatorType;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(1, attackEnd);
    gainNode.gain.linearRampToValueAtTime(sustain, decayEnd);
    gainNode.gain.setValueAtTime(sustain, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0, releaseEnd);

    oscillator.connect(gainNode).connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(releaseEnd);
  };

  const playSequence = (frequencies: number[], noteDuration = duration) => {
    frequencies.forEach((freq, i) => {
      const delayMs = (60 / tempo) * i * 1000;
      setTimeout(() => playNoteFrequency(freq, noteDuration), delayMs);
    });
  };

  function noteOn(frequency: number) {
    // 1) Mute
    if (soundMode === "mute") return;

    // 2) MIDI
    if (soundMode === "midi") {
      // 1) compute float note & split into int + detune
      const mf = frequencyToMidiNoteNumber(frequency);
      const note = Math.floor(mf);
      const detune = mf - note;

      // 2) send pitch bend THEN Note On
      sendPitchBend(detune);
      const vel = Math.round(volume * 127);
      sendMidiMessage([0x90, note, vel]);
      return;
    }

    // 3) Waveform (unchanged)
    const audioCtx = audioCtxRef.current!;
    const masterGain = masterGainRef.current!;
    const now = audioCtx.currentTime;
    const { attack, decay, sustain, waveform } = envelopeParams;

    const osc = audioCtx.createOscillator();
    osc.type = waveform as OscillatorType;
    osc.frequency.setValueAtTime(frequency, now);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + attack);
    gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    osc.connect(gain).connect(masterGain);
    osc.start(now);

    osc.onended = () => {
      const queue = activeNotesRef.current.get(frequency) || [];
      activeNotesRef.current.set(
        frequency,
        queue.filter((e) => e.oscillator !== osc)
      );
    };

    const queue = activeNotesRef.current.get(frequency) || [];
    queue.push({ oscillator: osc, gainNode: gain });
    activeNotesRef.current.set(frequency, queue);

    const MAX_VOICES = 2;
    if (queue.length > MAX_VOICES) {
      const oldest = queue.shift()!;
      oldest.oscillator.stop(now);
      activeNotesRef.current.set(frequency, queue);
    }
  }

  function noteOff(frequency: number) {
    if (soundMode === "mute") return;

    if (soundMode === "midi") {
      const note = Math.floor(frequencyToMidiNoteNumber(frequency));
      sendMidiMessage([0x80, note, 0]);
      return;
    }

    const audioCtx = audioCtxRef.current!;
    const now = audioCtx.currentTime;
    const { release } = envelopeParams;
    const queue = activeNotesRef.current.get(frequency) || [];
    if (!queue.length) return;

    const voice = queue.shift()!;
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
    voice.gainNode.gain.linearRampToValueAtTime(0, now + release);
    voice.oscillator.stop(now + release);

    activeNotesRef.current.set(frequency, queue);
  }

  const updateAllTuningSystems = async (newSystems: TuningSystem[]) => {
    setTuningSystems(newSystems);
    if (selectedTuningSystem) {
      const existsInNew = newSystems.find((sys) => sys.getId() === selectedTuningSystem.getId());
      if (!existsInNew) {
        setSelectedTuningSystem(null);
        clearSelections();
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
            pitchClasses: ts.getPitchClasses(),
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

  const updateAllAjnas = async (newAjnas: Jins[]) => {
    setAjnas(newAjnas);
    clearSelections();

    try {
      const response = await fetch("/api/ajnas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          newAjnas.map((j) => ({
            id: j.getId(),
            name: j.getName(),
            noteNames: j.getNoteNames(),
          }))
        ),
      });
      if (!response.ok) {
        throw new Error("Failed to save updated Ajnas on the server.");
      }
    } catch (error) {
      console.error("Error updating all Ajnas:", error);
    }
  };

  const updateAllMaqamat = async (newMaqamat: Maqam[]) => {
    setMaqamat(newMaqamat);
    clearSelections();

    try {
      const response = await fetch("/api/maqamat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          newMaqamat.map((m) => ({
            id: m.getId(),
            name: m.getName(),
            ascendingNoteNames: m.getAscendingNoteNames(),
            descendingNoteNames: m.getDescendingNoteNames(),
            suyur: m.getSuyur(),
          }))
        ),
      });
      if (!response.ok) {
        throw new Error("Failed to save updated Maqamat on the server.");
      }
    } catch (error) {
      console.error("Error updating all Maqamat:", error);
    }
  };

  const getNoteNamesUsedInTuningSystem = (givenIndices: number[] = []): TransliteratedNoteName[] => {
    if (!selectedTuningSystem && givenIndices.length === 0) return [];

    const indicesToSearch = givenIndices.length ? givenIndices : selectedIndices;

    const noteNames = [];
    const baseLength = octaveOneNoteNames.length;

    for (let octave = 0; octave < 4; octave++) {
      for (const index of indicesToSearch) {
        if (index < baseLength) {
          switch (octave) {
            case 0:
              noteNames.push(octaveZeroNoteNames[index] || "none");
              break;
            case 1:
              noteNames.push(octaveOneNoteNames[index] || "none");
              break;
            case 2:
              noteNames.push(octaveTwoNoteNames[index] || "none");
              break;
            case 3:
              noteNames.push(octaveThreeNoteNames[index] || "none");
              break;
          }
        } else {
          const localIndex = index - baseLength;
          switch (octave) {
            case 0:
              noteNames.push(octaveOneNoteNames[localIndex] || "none");
              break;
            case 1:
              noteNames.push(octaveTwoNoteNames[localIndex] || "none");
              break;
            case 2:
              noteNames.push(octaveThreeNoteNames[localIndex] || "none");
              break;
            case 3:
              noteNames.push(octaveFourNoteNames[localIndex] || "none");
              break;
          }
        }
      }
    }

    return noteNames;
  };

  const getSelectedCellDetails = (cell: SelectedCell): CellDetails => {
    const emptyDetails: CellDetails = {
      noteName: "",
      fraction: "",
      cents: "",
      ratios: "",
      stringLength: "",
      frequency: "",
      originalValue: "",
      originalValueType: "",
    };

    if (!selectedTuningSystem) return emptyDetails;

    const pitchArr = selectedTuningSystem.getPitchClasses();
    if (cell.index < 0 || cell.index >= pitchArr.length) return emptyDetails;
    const basePc = pitchArr[cell.index];

    const pitchType = detectPitchClassType(pitchArr);
    if (pitchType === "unknown") return emptyDetails;

    const shiftedPc = shiftPitchClass(basePc, pitchType, cell.octave as 0 | 1 | 2 | 3);
    const conv = convertPitchClass(shiftedPc, pitchType, selectedTuningSystem.getStringLength(), selectedTuningSystem.getReferenceFrequency());

    if (cell.index < 0 || cell.index >= selectedIndices.length) return emptyDetails;
    const combinedIndex = selectedIndices[cell.index];
    if (combinedIndex < 0) return { ...emptyDetails, noteName: "none" };

    const baseLength = octaveOneNoteNames.length;
    let noteName = "none";

    if (combinedIndex < baseLength) {
      switch (cell.octave) {
        case 0:
          noteName = octaveZeroNoteNames[combinedIndex] || "none";
          break;
        case 1:
          noteName = octaveOneNoteNames[combinedIndex] || "none";
          break;
        case 2:
          noteName = octaveTwoNoteNames[combinedIndex] || "none";
          break;
        case 3:
          noteName = octaveThreeNoteNames[combinedIndex] || "none";
          break;
        default:
          noteName = "none";
      }
    } else {
      const localIndex = combinedIndex - baseLength;
      switch (cell.octave) {
        case 0:
          noteName = octaveOneNoteNames[localIndex] || "none";
          break;
        case 1:
          noteName = octaveTwoNoteNames[localIndex] || "none";
          break;
        case 2:
          noteName = octaveThreeNoteNames[localIndex] || "none";
          break;
        case 3:
          noteName = octaveFourNoteNames[localIndex] || "none";
          break;
        default:
          noteName = "none";
      }
    }

    return {
      noteName,
      fraction: conv ? conv.fraction : "-",
      cents: conv ? conv.cents : "-",
      ratios: conv ? conv.decimal : "-",
      stringLength: conv ? conv.stringLength : "-",
      frequency: conv ? conv.frequency : "-",
      originalValue: shiftedPc,
      originalValueType: pitchType,
    };
  };

  const getAllCells = (): SelectedCell[] => {
    if (!selectedTuningSystem) return [];
    const pitchArr = selectedTuningSystem.getPitchClasses();
    const cells: SelectedCell[] = [];

    for (let octave = 0; octave < 4; octave++) {
      for (let index = 0; index < pitchArr.length; index++) {
        cells.push({ octave, index });
      }
    }
    return cells;
  };

  const clearSelections = () => {
    setSelectedCells([]);
    setSelectedJins(null);
    setSelectedMaqam(null);
  };

  function getFirstNoteName() {
    const idx = selectedIndices[0];
    if (idx < 0) return "none";
    return octaveOneNoteNames[idx];
  }

  function mapIndices(notesToMap: TransliteratedNoteName[], givenNumberOfPitchClasses: number = 0) {
    const numberOfPitchClasses = givenNumberOfPitchClasses || pitchClassesArr.length || selectedTuningSystem?.getPitchClasses().length || 0;

    const O1_LEN = octaveOneNoteNames.length;
    const mappedIndices = notesToMap.map((arabicName) => {
      const i1 = octaveOneNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveOne);
      if (i1 >= 0) return i1;

      const i2 = octaveTwoNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveTwo);
      if (i2 >= 0) return O1_LEN + i2;

      return -1;
    });

    while (mappedIndices.length < numberOfPitchClasses) {
      mappedIndices.push(-1);
    }
    if (mappedIndices.length > numberOfPitchClasses) {
      mappedIndices.length = numberOfPitchClasses;
    }

    setSelectedIndices(mappedIndices);
    setOriginalIndices([...mappedIndices]);
    return mappedIndices;
  }

  const handleStartNoteNameChange = (
    startingNoteName: string,
    givenNoteNames: TransliteratedNoteName[][] = [],
    givenNumberOfPitchClasses: number = 0
  ) => {
    clearSelections();

    const noteNamesToSearch = givenNoteNames.length ? givenNoteNames : noteNames;

    if (startingNoteName === "" && noteNamesToSearch.length > 0) {
      for (const setOfNotes of noteNamesToSearch) {
        if (setOfNotes[0] === "ʿushayrān") {
          return mapIndices(setOfNotes, givenNumberOfPitchClasses);
        }
      }

      for (const setOfNotes of noteNamesToSearch) {
        if (setOfNotes[0] === "yegāh") {
          return mapIndices(setOfNotes, givenNumberOfPitchClasses);
        }
      }

      return mapIndices(noteNamesToSearch[0], givenNumberOfPitchClasses);
    } else {
      for (const setOfNotes of noteNamesToSearch) {
        if (setOfNotes[0] === startingNoteName) {
          return mapIndices(setOfNotes, givenNumberOfPitchClasses);
        }
      }
    }

    // If no config found, fallback:
    setSelectedIndices(Array(selectedIndices.length).fill(-1));
    return [];
  };

  const checkIfJinsIsSelectable = (jins: Jins, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices);
    return jins.getNoteNames().every((noteName) => usedNoteNames.includes(noteName));
  };

  const handleClickJins = (jins: Jins, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices);

    setSelectedJins(jins);
    setSelectedMaqam(null);

    const noteNames = jins.getNoteNames();

    const newSelectedCells: SelectedCell[] = [];

    const lengthOfUsedNoteNames = usedNoteNames.length;

    for (let i = 0; i < lengthOfUsedNoteNames; i++) {
      const usedNoteName = usedNoteNames[i];

      if (noteNames.includes(usedNoteName)) {
        let octave = 0;
        let index = i;

        while (index >= lengthOfUsedNoteNames / 4) {
          octave++;
          index -= lengthOfUsedNoteNames / 4;
        }

        newSelectedCells.push({
          octave,
          index,
        });
      }
    }

    setSelectedCells(newSelectedCells);
  };

  const checkIfMaqamIsSelectable = (maqam: Maqam, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices);

    return (
      maqam.getAscendingNoteNames().every((noteName) => usedNoteNames.includes(noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => usedNoteNames.includes(noteName))
    );
  };

  const handleClickMaqam = (maqam: Maqam, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices);

    // when selecting, populate cells for asc or desc based on stored noteNames
    setSelectedMaqam(maqam);
    setSelectedJins(null);
    const namesToSelect = isAscending ? maqam.getAscendingNoteNames() : maqam.getDescendingNoteNames();

    // translate names back into SelectedCell[] by matching against usedNoteNames
    const newCells: SelectedCell[] = [];
    usedNoteNames.forEach((name, idx) => {
      if (namesToSelect.includes(name)) {
        let octave = 0;
        let index = idx;
        // assume 4 octaves evenly divided
        const perOct = usedNoteNames.length / 4;
        while (index >= perOct) {
          octave++;
          index -= perOct;
        }
        newCells.push({ octave, index });
      }
    });
    setSelectedCells(newCells);
  };

  const handleUrlParams = ({
    tuningSystemId,
    jinsId,
    maqamId,
    firstNote,
  }: {
    tuningSystemId?: string;
    jinsId?: string;
    maqamId?: string;
    firstNote?: string;
  }) => {
    if (!tuningSystems.length || !ajnas.length || !maqamat.length) return;

    if (tuningSystemId) {
      if (!selectedTuningSystem || selectedTuningSystem.getId() !== tuningSystemId) {
        const found = tuningSystems.find((ts) => ts.getId() === tuningSystemId);
        if (found) {
          setSelectedTuningSystem(found);
          const givenIndices = handleStartNoteNameChange(firstNote ?? "", found.getSetsOfNoteNames(), found.getPitchClasses().length);

          if (jinsId) {
            const foundJins = ajnas.find((j) => j.getId() === jinsId);
            if (foundJins && checkIfJinsIsSelectable(foundJins, givenIndices)) {
              handleClickJins(foundJins, givenIndices);
            }
          } else if (maqamId) {
            const foundMaqam = maqamat.find((m) => m.getId() === maqamId);
            if (foundMaqam && checkIfMaqamIsSelectable(foundMaqam, givenIndices)) {
              handleClickMaqam(foundMaqam, givenIndices);
            }
          }
        }
      }
    } else if (selectedTuningSystem) {
      setSelectedTuningSystem(null);
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
        pitchClasses,
        setPitchClasses,
        noteNames,
        setNoteNames,
        getFirstNoteName,
        handleStartNoteNameChange,
        playNoteFrequency,
        envelopeParams,
        setEnvelopeParams,
        selectedCells,
        setSelectedCells,
        getAllCells,
        selectedIndices,
        setSelectedIndices,
        originalIndices,
        setOriginalIndices,
        mapIndices,
        initialMappingDone,
        setInitialMappingDone,
        getSelectedCellDetails,
        ajnas,
        setAjnas,
        updateAllAjnas,
        selectedJins,
        setSelectedJins,
        checkIfJinsIsSelectable,
        handleClickJins,
        maqamat,
        setMaqamat,
        updateAllMaqamat,
        selectedMaqam,
        setSelectedMaqam,
        checkIfMaqamIsSelectable,
        handleClickMaqam,
        getNoteNamesUsedInTuningSystem,
        centsTolerance,
        setCentsTolerance,
        clearSelections,
        isAscending,
        setIsAscending,
        volume,
        setVolume,
        duration,
        setDuration,
        tempo,
        setTempo,
        playSequence,
        noteOn,
        noteOff,
        handleUrlParams,
        midiOutputs,
        selectedMidiOutputId,
        setSelectedMidiOutputId,
        soundMode,
        setSoundMode,
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
