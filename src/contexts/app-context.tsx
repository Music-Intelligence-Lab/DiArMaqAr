"use client";

import React, { createContext, useState, useEffect, useRef, useContext } from "react";
import tuningSystemsData from "@/../data/tuningSystems.json";
import ajnasData from "@/../data/ajnas.json";
import maqamatData from "@/../data/maqamat.json";
import sourcesData from "@/../data/sources.json";
import patternsData from "@/../data/patterns.json";
import TuningSystem from "@/models/TuningSystem";
import Jins from "@/models/Jins";
import TransliteratedNoteName, { TransliteratedNoteNameOctaveOne, TransliteratedNoteNameOctaveTwo } from "@/models/NoteName";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass, { shiftPitchClass, frequencyToMidiNoteNumber } from "@/functions/convertPitchClass";
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames } from "@/models/NoteName";
import Maqam, { Seir } from "@/models/Maqam";
import getNoteNamesUsedInTuningSystem from "@/functions/getNoteNamesUsedInTuningSystem";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import midiNumberToNoteName from "@/functions/midiToNoteNumber";
import Source from "@/models/Source";
import Pattern, { NoteDuration } from "@/models/Pattern";
import romanToNumber from "@/functions/romanToNumber";

interface EnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  waveform: string;
}

export interface Cell {
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
  englishName: string;
  octave: number;
}

interface MidiPortInfo {
  id: string;
  name: string;
}
type InputMode = "tuningSystem" | "selection";
type OutputMode = "mute" | "waveform" | "midi";

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
  handleStartNoteNameChange: (startingNoteName: string, givenNoteNames?: TransliteratedNoteName[][], givenNumberOfPitchClasses?: number) => void;
  referenceFrequencies: { [noteName: string]: number };
  setReferenceFrequencies: React.Dispatch<React.SetStateAction<{ [noteName: string]: number }>>;
  playNoteFrequency: (frequency: number, duration?: number) => void;
  envelopeParams: EnvelopeParams;
  setEnvelopeParams: React.Dispatch<React.SetStateAction<EnvelopeParams>>;
  selectedCells: Cell[];
  setSelectedCells: React.Dispatch<React.SetStateAction<Cell[]>>;
  getAllCells: () => Cell[];
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  originalIndices: number[];
  setOriginalIndices: React.Dispatch<React.SetStateAction<number[]>>;
  mapIndices: (notesToMap: TransliteratedNoteName[], givenNumberOfPitchClasses: number, setOriginal: boolean) => void;
  initialMappingDone: boolean;
  setInitialMappingDone: React.Dispatch<React.SetStateAction<boolean>>;
  getSelectedCellDetails: (cell: Cell) => CellDetails;
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
  maqamSeirId: string;
  setMaqamSeirId: React.Dispatch<React.SetStateAction<string>>;
  centsTolerance: number;
  setCentsTolerance: React.Dispatch<React.SetStateAction<number>>;
  clearSelections: () => void;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  tempo: number;
  setTempo: React.Dispatch<React.SetStateAction<number>>;
  playSequence: (frequencies: number[]) => void;
  noteOn: (frequency: number) => void;
  noteOff: (frequency: number) => void;
  handleUrlParams: (params: { tuningSystemId?: string; jinsId?: string; maqamId?: string; seirId?: string; firstNote?: string }) => void;
  midiInputs: MidiPortInfo[];
  selectedMidiInputId: string | null;
  setSelectedMidiInputId: React.Dispatch<React.SetStateAction<string | null>>;
  midiOutputs: MidiPortInfo[];
  selectedMidiOutputId: string | null;
  setSelectedMidiOutputId: React.Dispatch<React.SetStateAction<string | null>>;
  inputMode: InputMode;
  setInputMode: React.Dispatch<React.SetStateAction<InputMode>>;
  outputMode: OutputMode;
  setOutputMode: React.Dispatch<React.SetStateAction<OutputMode>>;
  pitchBendRange: number;
  setPitchBendRange: React.Dispatch<React.SetStateAction<number>>;
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  updateAllSources: (sources: Source[]) => Promise<void>;
  patterns: Pattern[];
  setPatterns: React.Dispatch<React.SetStateAction<Pattern[]>>;
  updateAllPatterns: (patterns: Pattern[]) => Promise<void>;
  selectedPattern: Pattern | null;
  setSelectedPattern: React.Dispatch<React.SetStateAction<Pattern | null>>;
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  openNavigation: boolean;
  setOpenNavigation: React.Dispatch<React.SetStateAction<boolean>>;
  openSettings: boolean;
  setOpenSettings: React.Dispatch<React.SetStateAction<boolean>>;
  openBottomDrawer: boolean;
  setOpenBottomDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [selectedTuningSystem, setSelectedTuningSystem] = useState<TuningSystem | null>(null);
  const [pitchClasses, setPitchClasses] = useState("");
  const [noteNames, setNoteNames] = useState<TransliteratedNoteName[][]>([]);
  const [referenceFrequencies, setReferenceFrequencies] = useState<{ [noteName: string]: number }>({});
  const [centsTolerance, setCentsTolerance] = useState(5);

  const [envelopeParams, setEnvelopeParams] = useState<EnvelopeParams>({
    attack: 0.01,
    decay: 0.2,
    sustain: 0.7,
    release: 0.1,
    waveform: "triangle",
  });

  const activeNotesRef = useRef<Map<number, { oscillator: OscillatorNode; gainNode: GainNode }[]>>(new Map());

  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0.1);
  const [tempo, setTempo] = useState<number>(100);

  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [originalIndices, setOriginalIndices] = useState<number[]>([]);
  const [initialMappingDone, setInitialMappingDone] = useState(false);

  const [ajnas, setAjnas] = useState<Jins[]>([]);
  const [selectedJins, setSelectedJins] = useState<Jins | null>(null);

  const [maqamat, setMaqamat] = useState<Maqam[]>([]);
  const [selectedMaqam, setSelectedMaqam] = useState<Maqam | null>(null);
  const [maqamSeirId, setMaqamSeirId] = useState<string>("");

  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  const [sources, setSources] = useState<Source[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const [midiInputs, setMidiInputs] = useState<MidiPortInfo[]>([]);
  const [selectedMidiInputId, setSelectedMidiInputId] = useState<string | null>(null);
  const [midiOutputs, setMidiOutputs] = useState<MidiPortInfo[]>([]);
  const [selectedMidiOutputId, setSelectedMidiOutputId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("selection");
  const [outputMode, setOutputMode] = useState<OutputMode>("waveform");
  const [pitchBendRange, setPitchBendRange] = useState(2);
  const [refresh, setRefresh] = useState(false);

  const [openNavigation, setOpenNavigation] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openBottomDrawer, setOpenBottomDrawer] = useState(false);

  const midiAccessRef = useRef<MIDIAccess | null>(null);

  const sendMidiMessage = (bytes: number[]) => {
    const ma = midiAccessRef.current;
    if (!ma || !selectedMidiOutputId) return;

    const port = ma.outputs.get(selectedMidiOutputId);
    port?.send(bytes);
  };

  function sendPitchBend(detuneSemitones: number) {
    const center = 8192;
    const bendOffset = Math.round((detuneSemitones / pitchBendRange) * center);
    const bendValue = Math.max(0, Math.min(16383, center + bendOffset));
    const lsb = bendValue & 0x7f;
    const msb = (bendValue >> 7) & 0x7f;
    sendMidiMessage([0xe0, lsb, msb]);
  }

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
        data.sourceId,
        data.page,
        data.creatorEnglish,
        data.creatorArabic,
        data.commentsEnglish,
        data.commentsArabic,
        data.pitchClasses,
        data.noteNames as TransliteratedNoteName[][],
        data.abjadNames,
        Number(data.stringLength),
        data.referenceFrequencies as { [noteName: string]: number },
        Number(data.defaultReferenceFrequency)
      );
    });

    setTuningSystems(formattedTuningSystems);

    const loadedAjnas = ajnasData.map((data) => new Jins(data.id, data.name, data.noteNames));
    setAjnas(loadedAjnas);

    const loadedMaqamat = maqamatData.map(
      (data) => new Maqam(data.id, data.name, data.ascendingNoteNames, data.descendingNoteNames, data.suyur as Seir[])
    );
    setMaqamat(loadedMaqamat);

    const loadedSources = sourcesData.map((data) => Source.fromJSON(data));
    setSources(loadedSources);

    const loadedPatterns = patternsData.map(
      (data) =>
        new Pattern(
          data.id,
          data.name,
          data.notes.map((note) => ({
            scaleDegree: note.scaleDegree as string,
            noteDuration: note.noteDuration as NoteDuration,
          }))
        )
    );
    setPatterns(loadedPatterns);

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
    if (!selectedTuningSystem) return;

    if (selectedJins) {
      if (checkIfJinsIsSelectable(selectedJins)) {
        handleClickJins(selectedJins);
      } else {
        setSelectedJins(null);
      }
    }

    if (selectedMaqam) {
      if (checkIfMaqamIsSelectable(selectedMaqam)) {
        handleClickMaqam(selectedMaqam);
      } else {
        setSelectedMaqam(null);
      }
    }
  }, [selectedIndices]);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;
    navigator
      .requestMIDIAccess({ sysex: false })
      .then((ma) => {
        midiAccessRef.current = ma;

        const outs = Array.from(ma.outputs.values());
        setMidiOutputs(outs.map((o) => ({ id: o.id, name: o.name || o.manufacturer || "Unknown" })));

        const ins = Array.from(ma.inputs.values());
        setMidiInputs(ins.map((i) => ({ id: i.id, name: i.name || i.manufacturer || "Unknown" })));

        // we do NOT attach input.onmidimessage here
        ma.onstatechange = () => {
          const newOuts = Array.from(ma.outputs.values());
          setMidiOutputs(newOuts.map((o) => ({ id: o.id, name: o.name || o.manufacturer || "Unknown" })));

          const newIns = Array.from(ma.inputs.values());
          setMidiInputs(newIns.map((i) => ({ id: i.id, name: i.name || i.manufacturer || "Unknown" })));
          // binding will happen in the next effect
        };
      })
      .catch(console.error);
  }, [refresh]);

  // 3) Re-attachment effect — runs whenever inputs list or selected ID changes:
  useEffect(() => {
    const ma = midiAccessRef.current;
    if (!ma) return;

    for (const input of Array.from(ma.inputs.values())) {
      input.onmidimessage = handleMidiInput;
    }

    return () => {
      for (const input of Array.from(ma.inputs.values())) {
        input.onmidimessage = null;
      }
    };
  }, [
    selectedMidiInputId,
    midiInputs,
    selectedTuningSystem,
    selectedMaqam,
    selectedJins,
    pitchClasses,
    inputMode,
    outputMode,
    selectedMidiInputId,
    selectedMidiOutputId,
  ]);

  const handleMidiInput: NonNullable<MIDIInput["onmidimessage"]> = function (this: MIDIInput, ev: MIDIMessageEvent) {
    // only from our selected port
    if (this.id !== selectedMidiInputId) return;

    const data = ev.data;
    if (!data) return; // safety
    const [status, noteNumber, velocity] = data;
    const cmd = status & 0xf0;

    if (inputMode === "tuningSystem") {
      const cells = getAllCells();

      const MIDI_BASE = 55;
      const numberOfCellsPerRow = pitchClassesArr.length;

      const idx = noteNumber + numberOfCellsPerRow - MIDI_BASE;

      if (idx < 0 || idx >= cells.length) return;

      // grab the frequency from your cell‐detail helper
      const freqStr = getSelectedCellDetails(cells[idx]).frequency;
      const freq = parseFloat(freqStr);
      if (isNaN(freq)) return;

      // ——— dispatch sound ———
      if (cmd === 0x90 && velocity > 0) {
        noteOn(freq);
      } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
        noteOff(freq);
      }
    } else if (inputMode === "selection") {
      const selectedCellDetails = selectedCells.map((cell) => getSelectedCellDetails(cell));
      const { note, alt } = midiNumberToNoteName(noteNumber);

      for (const cellDetails of selectedCellDetails) {
        let convertedEnglishName = cellDetails.englishName;
        convertedEnglishName = convertedEnglishName[0].toUpperCase() + convertedEnglishName.slice(1);
        if (convertedEnglishName.includes("-")) convertedEnglishName = convertedEnglishName[0];

        if (convertedEnglishName === note || convertedEnglishName === alt) {
          const baseFreq = parseFloat(cellDetails.frequency);
          if (isNaN(baseFreq)) return;

          let cellMidi = Math.round(frequencyToMidiNoteNumber(baseFreq));

          let adjFreq = baseFreq;

          while (noteNumber - cellMidi >= 12) {
            adjFreq *= 2;
            cellMidi += 12;
          }

          while (cellMidi - noteNumber >= 12) {
            adjFreq /= 2;
            cellMidi -= 12;
          }

          if (cmd === 0x90 && velocity > 0) {
            noteOn(adjFreq);
          } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
            noteOff(adjFreq);
          }

          break;
        }
      }
    }
  };

  const playNoteFrequency = (frequency: number, givenDuration: number = duration) => {
    // 1) Mute
    if (outputMode === "mute") return;
    // 2) MIDI
    if (outputMode === "midi") {
      // compute float MIDI note and detune fraction
      const mf = frequencyToMidiNoteNumber(frequency);
      const note = Math.floor(mf);
      const detune = mf - note;

      // send pitch bend then note-on
      sendPitchBend(detune);
      const vel = Math.round(volume * 127);
      sendMidiMessage([0x90, note, vel]);
      // schedule note-off after givenDuration (in seconds)
      setTimeout(() => {
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

  const playSequence = (frequencies: number[]) => {
  const beatSec = 60 / tempo;

  // fallback ascending if no pattern
  if (!selectedPattern || !selectedPattern.getNotes().length) {
    frequencies.forEach((freq, i) =>
      setTimeout(() => playNoteFrequency(freq), i * beatSec * 1000)
    );
    return;
  }

  const patternNotes = selectedPattern.getNotes();
  // highest degree (e.g. III -> 3)
  const maxDegree = Math.max(
    ...patternNotes.map((n) =>
      n.scaleDegree === "0" ? 0 : romanToNumber(n.scaleDegree)
    )
  );

  // if too few freqs, fallback ascending
  if (frequencies.length < maxDegree) {
    frequencies.forEach((freq, i) =>
      setTimeout(() => playNoteFrequency(freq), i * beatSec * 1000)
    );
    return;
  }

  // sliding-window: for each start index, walk the pattern
  let timeOffset = 0;
  for (
    let windowStart = 0;
    windowStart <= frequencies.length - maxDegree;
    windowStart++
  ) {
    for (const { scaleDegree, noteDuration } of patternNotes) {
      // compute duration in seconds
      const base = 4 / Number(noteDuration.replace(/\D/g, ""));
      const mod = noteDuration.endsWith("d")
        ? 1.5
        : noteDuration.endsWith("t")
        ? 2 / 3
        : 1;
      const durSec = base * mod * beatSec;

      if (scaleDegree !== "0") {
        const deg = romanToNumber(scaleDegree);
        const freq = frequencies[windowStart + deg - 1];
        setTimeout(() => playNoteFrequency(freq, durSec), timeOffset * 1000);
      }

      timeOffset += durSec;
    }
  }
};


  function noteOn(frequency: number) {
    // 1) Mute
    if (outputMode === "mute") return;

    // 2) MIDI
    if (outputMode === "midi") {
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
    if (outputMode === "mute") return;

    if (outputMode === "midi") {
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
            sourceId: ts.getSourceId(),
            page: ts.getPage(),
            creatorEnglish: ts.getCreatorEnglish(),
            creatorArabic: ts.getCreatorArabic(),
            commentsEnglish: ts.getCommentsEnglish(),
            commentsArabic: ts.getCommentsArabic(),
            pitchClasses: ts.getPitchClasses(),
            noteNames: ts.getSetsOfNoteNames(),
            abjadNames: ts.getAbjadNames(),
            stringLength: ts.getStringLength(),
            defaultReferenceFrequency: ts.getDefaultReferenceFrequency(),
            referenceFrequencies: ts.getReferenceFrequencies(),
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

  const updateAllSources = async (sources: Source[]) => {
    try {
      const response = await fetch("/api/sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sources.map((source) => source.convertToJSON())),
      });
      if (!response.ok) {
        throw new Error("Failed to save updated Sources on the server.");
      }
    } catch (error) {
      console.error("Error updating all Sources:", error);
    }
  };

  const updateAllPatterns = async (patterns: Pattern[]) => {
    try {
      const response = await fetch("/api/patterns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patterns.map((pattern) => pattern.convertToJSON())),
      });
      if (!response.ok) {
        throw new Error("Failed to save updated Patterns on the server.");
      }
    } catch (error) {
      console.error("Error updating all Patterns:", error);
    }
  };

  const getSelectedCellDetails = (cell: Cell): CellDetails => {
    const emptyDetails: CellDetails = {
      noteName: "",
      fraction: "",
      cents: "",
      ratios: "",
      stringLength: "",
      frequency: "",
      englishName: "",
      originalValue: "",
      originalValueType: "",
      octave: cell.octave,
    };

    if (!selectedTuningSystem) return emptyDetails;

    const pitchArr = selectedTuningSystem.getPitchClasses();
    if (cell.index < 0 || cell.index >= pitchArr.length) return emptyDetails;
    const basePc = pitchArr[cell.index];

    const pitchType = detectPitchClassType(pitchArr);
    if (pitchType === "unknown") return emptyDetails;

    const actualReferenceFrequency = referenceFrequencies[getFirstNoteName()] || selectedTuningSystem.getDefaultReferenceFrequency();

    const shiftedPc = shiftPitchClass(basePc, pitchType, cell.octave as 0 | 1 | 2 | 3);
    const conv = convertPitchClass(shiftedPc, pitchType, selectedTuningSystem.getStringLength(), actualReferenceFrequency);//todo change this

    if (cell.index < 0 || cell.index >= selectedIndices.length) return emptyDetails;
    const combinedIndex = selectedIndices[cell.index];

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
      englishName: getEnglishNoteName(noteName),
      fraction: conv ? conv.fraction : "-",
      cents: conv ? conv.cents : "-",
      ratios: conv ? conv.decimal : "-",
      stringLength: conv ? conv.stringLength : "-",
      frequency: conv ? conv.frequency : "-",
      originalValue: shiftedPc,
      originalValueType: pitchType,
      octave: cell.octave,
    };
  };

  const getAllCells = (): Cell[] => {
    if (!selectedTuningSystem) return [];
    const pitchArr = selectedTuningSystem.getPitchClasses();
    const cells: Cell[] = [];

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
    if (selectedIndices.length === 0) return "none";
    const idx = selectedIndices[0];
    if (idx < 0) return "none";
    return octaveOneNoteNames[idx];
  }

  function mapIndices(notesToMap: TransliteratedNoteName[], givenNumberOfPitchClasses: number = 0, setOriginal: boolean = true) {
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
    if (setOriginal) setOriginalIndices([...mappedIndices]);
    return mappedIndices;
  }

  const handleStartNoteNameChange = (
    startingNoteName: string,
    givenNoteNames: TransliteratedNoteName[][] = [],
    givenNumberOfPitchClasses: number = 0
  ) => {
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
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices.length ? givenIndices : selectedIndices);
    return jins.getNoteNames().every((noteName) => usedNoteNames.includes(noteName));
  };

  const handleClickJins = (jins: Jins, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices.length ? givenIndices : selectedIndices);

    setSelectedJins(jins);
    setSelectedMaqam(null);

    const noteNames = jins.getNoteNames();

    const newSelectedCells: Cell[] = [];

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
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices.length ? givenIndices : selectedIndices);

    return (
      maqam.getAscendingNoteNames().every((noteName) => usedNoteNames.includes(noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => usedNoteNames.includes(noteName))
    );
  };

  const handleClickMaqam = (maqam: Maqam, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices.length ? givenIndices : selectedIndices);

    // when selecting, populate cells for asc or desc based on stored noteNames
    setSelectedMaqam(maqam);
    setSelectedJins(null);
    const namesToSelect = maqam.getAscendingNoteNames();

    // translate names back into SelectedCell[] by matching against usedNoteNames
    const newCells: Cell[] = [];
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
    seirId,
    firstNote,
  }: {
    tuningSystemId?: string;
    jinsId?: string;
    maqamId?: string;
    seirId?: string;
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
              if (seirId) {
                setMaqamSeirId(seirId);
              }
            }
          }
        }
      }
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
        referenceFrequencies,
        setReferenceFrequencies,
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
        maqamSeirId,
        setMaqamSeirId,
        centsTolerance,
        setCentsTolerance,
        clearSelections,
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
        midiInputs,
        selectedMidiInputId,
        setSelectedMidiInputId,
        midiOutputs,
        selectedMidiOutputId,
        setSelectedMidiOutputId,
        inputMode,
        setInputMode,
        outputMode,
        setOutputMode,
        pitchBendRange,
        setPitchBendRange,
        sources,
        setSources,
        updateAllSources,
        patterns,
        setPatterns,
        updateAllPatterns,
        selectedPattern,
        setSelectedPattern,
        refresh,
        setRefresh,
        openNavigation,
        setOpenNavigation,
        openSettings,
        setOpenSettings,
        openBottomDrawer,
        setOpenBottomDrawer,
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
