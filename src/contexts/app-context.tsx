"use client";

import React, { createContext, useState, useEffect, useRef, useMemo, useContext } from "react";
import tuningSystemsData from "@/../data/tuningSystems.json";
import ajnasData from "@/../data/ajnas.json";
import maqamatData from "@/../data/maqamat.json";
import sourcesData from "@/../data/sources.json";
import patternsData from "@/../data/patterns.json";
import TuningSystem from "@/models/TuningSystem";
import Jins, { JinsTransposition } from "@/models/Jins";
import TransliteratedNoteName, { TransliteratedNoteNameOctaveOne, TransliteratedNoteNameOctaveTwo } from "@/models/NoteName";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass, { shiftPitchClass, frequencyToMidiNoteNumber } from "@/functions/convertPitchClass";
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames } from "@/models/NoteName";
import Maqam, { MaqamTransposition, Sayr } from "@/models/Maqam";
import getNoteNamesUsedInTuningSystem from "@/functions/getNoteNamesUsedInTuningSystem";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import midiNumberToNoteName from "@/functions/midiToNoteNumber";
import { Source, SourcePageReference } from "@/models/bibliography/Source";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import Pattern, { NoteDuration, reversePatternNotes } from "@/models/Pattern";
import romanToNumber from "@/functions/romanToNumber";
import getFirstNoteName from "@/functions/getFirstNoteName";

type InputMode = "tuningSystem" | "selection";
type OutputMode = "mute" | "waveform" | "midi";

interface SoundSettings {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
  duration: number;
  tempo: number;
  waveform: string;
  pitchBendRange: number;
  inputMode: InputMode;
  selectedMidiInputId: string | null;
  outputMode: OutputMode;
  selectedMidiOutputId: string | null;
  selectedPattern: Pattern | null;
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
  index: number;
  octave: number;
}

interface MidiPortInfo {
  id: string;
  name: string;
}

interface AppContextInterface {
  tuningSystems: TuningSystem[];
  setTuningSystems: React.Dispatch<React.SetStateAction<TuningSystem[]>>;
  selectedTuningSystem: TuningSystem | null;
  setSelectedTuningSystem: (tuningSystem: TuningSystem | null) => void;
  pitchClasses: string;
  setPitchClasses: React.Dispatch<React.SetStateAction<string>>;
  noteNames: TransliteratedNoteName[][];
  setNoteNames: (noteNames: TransliteratedNoteName[][]) => void;
  handleStartNoteNameChange: (startingNoteName: string, givenNoteNames?: TransliteratedNoteName[][], givenNumberOfPitchClasses?: number) => void;
  referenceFrequencies: { [noteName: string]: number };
  setReferenceFrequencies: React.Dispatch<React.SetStateAction<{ [noteName: string]: number }>>;
  playNoteFrequency: (frequency: number, duration?: number) => void;
  soundSettings: SoundSettings;
  setSoundSettings: React.Dispatch<React.SetStateAction<SoundSettings>>;
  selectedCells: Cell[];
  setSelectedCells: React.Dispatch<React.SetStateAction<Cell[]>>;
  activeCells: Cell[];
  setActiveCells: React.Dispatch<React.SetStateAction<Cell[]>>;
  selectedCellDetails: CellDetails[];
  allCellDetails: CellDetails[];
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  originalIndices: number[];
  setOriginalIndices: React.Dispatch<React.SetStateAction<number[]>>;
  mapIndices: (notesToMap: TransliteratedNoteName[], givenNumberOfPitchClasses: number, setOriginal: boolean) => void;
  initialMappingDone: boolean;
  ajnas: Jins[];
  setAjnas: React.Dispatch<React.SetStateAction<Jins[]>>;
  selectedJins: Jins | null;
  setSelectedJins: React.Dispatch<React.SetStateAction<Jins | null>>;
  checkIfJinsIsSelectable: (jins: Jins) => boolean;
  handleClickJins: (jins: Jins) => void;
  selectedJinsTransposition: JinsTransposition | null;
  setSelectedJinsTransposition: React.Dispatch<React.SetStateAction<JinsTransposition | null>>;
  maqamat: Maqam[];
  setMaqamat: React.Dispatch<React.SetStateAction<Maqam[]>>;
  selectedMaqam: Maqam | null;
  setSelectedMaqam: React.Dispatch<React.SetStateAction<Maqam | null>>;
  checkIfMaqamIsSelectable: (maqam: Maqam) => boolean;
  handleClickMaqam: (maqam: Maqam) => void;
  selectedMaqamTransposition: MaqamTransposition | null;
  setSelectedMaqamTransposition: React.Dispatch<React.SetStateAction<MaqamTransposition | null>>;
  maqamSayrId: string;
  setMaqamSayrId: React.Dispatch<React.SetStateAction<string>>;
  centsTolerance: number;
  setCentsTolerance: React.Dispatch<React.SetStateAction<number>>;
  clearSelections: () => void;
  playSequence: (frequencies: number[]) => Promise<void>;
  noteOn: (frequency: number) => void;
  noteOff: (frequency: number) => void;
  handleUrlParams: (params: { tuningSystemId?: string; jinsId?: string; maqamId?: string; sayrId?: string; firstNote?: string }) => void;
  midiInputs: MidiPortInfo[];
  midiOutputs: MidiPortInfo[];
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  patterns: Pattern[];
  setPatterns: React.Dispatch<React.SetStateAction<Pattern[]>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [selectedTuningSystem, setSelectedTuningSystem] = useState<TuningSystem | null>(null);
  const [pitchClasses, setPitchClasses] = useState("");
  const [noteNames, setNoteNames] = useState<TransliteratedNoteName[][]>([]);
  const [referenceFrequencies, setReferenceFrequencies] = useState<{ [noteName: string]: number }>({});
  const [centsTolerance, setCentsTolerance] = useState(5);

  const [soundSettings, setSoundSettings] = useState<SoundSettings>({
    attack: 0.01,
    decay: 0.2,
    sustain: 0.7,
    release: 0.1,
    waveform: "triangle",
    volume: 0.2,
    duration: 0.1,
    tempo: 200,
    pitchBendRange: 2,
    inputMode: "selection",
    selectedMidiInputId: null,
    outputMode: "waveform",
    selectedMidiOutputId: null,
    selectedPattern: null,
  });

  const activeNotesRef = useRef<Map<number, { oscillator: OscillatorNode; gainNode: GainNode }[]>>(new Map());

  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [activeCells, setActiveCells] = useState<Cell[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [originalIndices, setOriginalIndices] = useState<number[]>([]);
  const [initialMappingDone, setInitialMappingDone] = useState(false);

  const [ajnas, setAjnas] = useState<Jins[]>([]);
  const [selectedJins, setSelectedJins] = useState<Jins | null>(null);
  const [selectedJinsTransposition, setSelectedJinsTransposition] = useState<JinsTransposition | null>(null);

  const [maqamat, setMaqamat] = useState<Maqam[]>([]);
  const [selectedMaqam, setSelectedMaqam] = useState<Maqam | null>(null);
  const [selectedMaqamTransposition, setSelectedMaqamTransposition] = useState<MaqamTransposition | null>(null);
  const [maqamSayrId, setMaqamSayrId] = useState<string>("");

  const [patterns, setPatterns] = useState<Pattern[]>([]);

  const [sources, setSources] = useState<Source[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const midiAccessRef = useRef<MIDIAccess | null>(null);

  const [midiInputs, setMidiInputs] = useState<MidiPortInfo[]>([]);
  const [midiOutputs, setMidiOutputs] = useState<MidiPortInfo[]>([]);
  const [refresh, setRefresh] = useState(false);

  const sendMidiMessage = (bytes: number[]) => {
    const ma = midiAccessRef.current;
    if (!ma || !soundSettings.selectedMidiOutputId) return;

    const port = ma.outputs.get(soundSettings.selectedMidiOutputId);
    port?.send(bytes);
  };

  function sendPitchBend(detuneSemitones: number) {
    const center = 8192;
    const bendOffset = Math.round((detuneSemitones / soundSettings.pitchBendRange) * center);
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
        data.sourcePageReferences as SourcePageReference[],
        data.creatorEnglish,
        data.creatorArabic,
        data.commentsEnglish,
        data.commentsArabic,
        data.pitchClasses,
        data.noteNames as TransliteratedNoteName[][],
        data.abjadNames,
        Number(data.stringLength),
        data.referenceFrequencies as unknown as { [noteName: string]: number },
        Number(data.defaultReferenceFrequency)
      );
    });

    setTuningSystems(formattedTuningSystems);

    const loadedAjnas = ajnasData.map(
      (data) => new Jins(data.id, data.name, data.noteNames, data.commentsEnglish, data.commentsArabic, data.sourcePageReferences)
    );
    setAjnas(loadedAjnas);

    const loadedMaqamat = maqamatData.map(
      (data) =>
        new Maqam(
          data.id,
          data.name,
          data.ascendingNoteNames,
          data.descendingNoteNames,
          data.suyūr as Sayr[],
          data.commentsEnglish,
          data.commentsArabic,
          data.sourcePageReferences
        )
    );
    setMaqamat(loadedMaqamat);

    const loadedSources = sourcesData.map((data) => {
      if (data.sourceType === "Book") {
        return Book.fromJSON(data);
      } else if (data.sourceType === "Article") {
        return Article.fromJSON(data);
      } else {
        throw new Error(`Unknown sourceType "${data.sourceType}"`);
      }
    });
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

    setInitialMappingDone(true);
  }, []);

  useEffect(() => {
    const AudioContext = window.AudioContext;
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = soundSettings.volume;
    masterGain.connect(audioCtx.destination);
    masterGainRef.current = masterGain;
  }, []);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(soundSettings.volume, audioCtxRef.current!.currentTime);
    }
  }, [soundSettings.volume]);

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
    midiInputs,
    selectedTuningSystem,
    selectedMaqam,
    selectedJins,
    pitchClasses,
    soundSettings.inputMode,
    soundSettings.outputMode,
    soundSettings.selectedMidiInputId,
    soundSettings.selectedMidiOutputId,
  ]);

  useEffect(() => {
    if (selectedTuningSystem) {
      if (selectedJins) {
        if (checkIfJinsIsSelectable(selectedJins)) handleClickJins(selectedJins);
        else clearSelections();
      } else if (selectedMaqam) {
        if (checkIfMaqamIsSelectable(selectedMaqam)) handleClickMaqam(selectedMaqam);
        else clearSelections();
      }
    } else clearSelections();
  }, [selectedTuningSystem]);

  const handleMidiInput: NonNullable<MIDIInput["onmidimessage"]> = function (this: MIDIInput, ev: MIDIMessageEvent) {
    // only from our selected port
    if (this.id !== soundSettings.selectedMidiInputId) return;

    const data = ev.data;
    if (!data) return; // safety
    const [status, noteNumber, velocity] = data;
    const cmd = status & 0xf0;

    if (soundSettings.inputMode === "tuningSystem") {
      const cells = getAllCells();

      const MIDI_BASE = 55;
      const numberOfCellsPerRow = pitchClassesArr.length;

      const idx = noteNumber + numberOfCellsPerRow - MIDI_BASE;

      if (idx < 0 || idx >= cells.length) return;

      const cell = cells[idx];

      // grab the frequency from your cell‐detail helper
      const freqStr = getCellDetails(cell).frequency;
      const freq = parseFloat(freqStr);
      if (isNaN(freq)) return;

      // ——— dispatch sound ———
      if (cmd === 0x90 && velocity > 0) {
        noteOn(freq);
        setActiveCells((prev) => {
          if (prev.some((c) => c.index === cell.index && c.octave === cell.octave)) return prev;
          return [...prev, { index: cell.index, octave: cell.octave }];
        });
      } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
        noteOff(freq);
        setActiveCells((prev) => prev.filter((c) => !(c.index === cell.index && c.octave === cell.octave)));
      }
    } else if (soundSettings.inputMode === "selection") {
      const selectedCellDetails = selectedCells.map((cell) => getCellDetails(cell));
      const { note, alt } = midiNumberToNoteName(noteNumber);

      for (const cellDetails of selectedCellDetails) {
        let convertedEnglishName = cellDetails.englishName;
        const cell: Cell = { index: cellDetails.index, octave: cellDetails.octave };
        convertedEnglishName = convertedEnglishName[0].toUpperCase() + convertedEnglishName.slice(1);
        if (convertedEnglishName.includes("-")) convertedEnglishName = convertedEnglishName[0];

        if (convertedEnglishName === note || convertedEnglishName === alt) {
          const baseFreq = parseFloat(cellDetails.frequency);
          if (isNaN(baseFreq)) return;

          const baseMidi = Math.round(frequencyToMidiNoteNumber(baseFreq));
          // how many octaves to shift (positive => up, negative => down)
          const octaveShift = Math.round((noteNumber - baseMidi) / 12);
          // adjust frequency by 2^octaveShift
          const adjFreq = baseFreq * Math.pow(2, octaveShift);

          if (cmd === 0x90 && velocity > 0) {
            noteOn(adjFreq);
            setActiveCells((prev) => {
              if (prev.some((c) => c.index === cell.index && c.octave === cell.octave)) return prev;
              return [...prev, { index: cell.index, octave: cell.octave }];
            });
          } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
            noteOff(adjFreq);
            setActiveCells((prev) => prev.filter((c) => !(c.index === cell.index && c.octave === cell.octave)));
          }

          break;
        }
      }
    }
  };

  const playNoteFrequency = (frequency: number, givenDuration: number = soundSettings.duration) => {
    // 1) Mute
    if (soundSettings.outputMode === "mute") return;
    // 2) MIDI
    if (soundSettings.outputMode === "midi") {
      // compute float MIDI note and detune fraction
      const mf = frequencyToMidiNoteNumber(frequency);
      const note = Math.floor(mf);
      const detune = mf - note;

      // send pitch bend then note-on
      sendPitchBend(detune);
      const vel = Math.round(soundSettings.volume * 127);
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
    const { attack, decay, sustain, release } = soundSettings;

    const attackEnd = startTime + attack;
    const decayEnd = attackEnd + decay;
    const noteOffTime = startTime + givenDuration;
    const releaseStart = Math.max(noteOffTime - release, decayEnd);
    const releaseEnd = releaseStart + release;

    const oscillator = audioCtx.createOscillator();
    oscillator.type = soundSettings.waveform as OscillatorType;
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

  const playSequence = (frequencies: number[]): Promise<void> => {
    return new Promise((resolve) => {
      const isAscending = frequencies.every((freq, idx, arr) => idx === 0 || freq >= arr[idx - 1]);

      const beatSec = 60 / soundSettings.tempo;

      // 1) FALLBACK “straight ascending” if no pattern is selected
      if (!soundSettings.selectedPattern || !soundSettings.selectedPattern.getNotes().length) {
        // total time = (number of notes) * (beat duration)
        const totalTimeMs = frequencies.length * beatSec * 1000;

        frequencies.forEach((freq, i) => {
          setTimeout(() => {
            playNoteFrequency(freq);
          }, i * beatSec * 1000);
        });

        // resolve after all notes have been scheduled AND played
        setTimeout(() => {
          resolve();
        }, totalTimeMs);

        return;
      }

      // 2) THERE IS A PATTERN: build the “extendedFrequencies” window
      const patternNotes = isAscending ? soundSettings.selectedPattern.getNotes() : reversePatternNotes(soundSettings.selectedPattern.getNotes());
      // find the highest degree number (e.g. "III" → 3)
      const maxDegree = Math.max(...patternNotes.map((n) => (n.scaleDegree === "0" ? 0 : romanToNumber(n.scaleDegree))));

      // if not enough input freqs → fallback ascending
      if (frequencies.length < maxDegree) {
        const totalTimeMs = frequencies.length * beatSec * 1000;

        frequencies.forEach((freq, i) => {
          setTimeout(() => {
            playNoteFrequency(freq);
          }, i * beatSec * 1000);
        });

        setTimeout(() => {
          resolve();
        }, totalTimeMs);

        return;
      }

      let extendedFrequencies: number[];
      if (isAscending) {
        extendedFrequencies = [...frequencies, ...frequencies.map((f) => f * 2).slice(1, maxDegree)];
      } else {
        extendedFrequencies = [...frequencies.map((f) => f * 2).slice(frequencies.length - maxDegree, frequencies.length - 1), ...frequencies];
      }

      // 3) SLIDING-WINDOW “pattern” scheduling
      let cumulativeTimeSec = 0;
      for (let windowStart = 0; windowStart <= frequencies.length - 1; windowStart++) {
        for (const { scaleDegree, noteDuration } of patternNotes) {
          // compute note length in seconds:
          //   base = (4 ÷ numeric part of noteDuration), e.g. "4" → whole note
          //   mod  = 1 (normal), 1.5 (dotted), 2/3 (triplet)
          const base = 4 / Number(noteDuration.replace(/\D/g, ""));
          const mod = noteDuration.endsWith("d") ? 1.5 : noteDuration.endsWith("t") ? 2 / 3 : 1;
          const durSec = base * mod * beatSec;

          if (scaleDegree !== "0") {
            const deg = romanToNumber(scaleDegree);
            const freqToPlay = extendedFrequencies[windowStart + deg - 1];

            setTimeout(() => {
              playNoteFrequency(freqToPlay, durSec);
            }, cumulativeTimeSec * 1000);
          }

          cumulativeTimeSec += durSec;
        }
      }

      // by now, cumulativeTimeSec (in seconds) is the total schedule length
      const totalSeqMs = cumulativeTimeSec * 1000;

      setTimeout(() => {
        resolve();
      }, totalSeqMs);
    });
  };

  function noteOn(frequency: number) {
    if (soundSettings.outputMode === "mute") return;

    if (soundSettings.outputMode === "midi") {
      const mf = frequencyToMidiNoteNumber(frequency);
      const note = Math.floor(mf);
      const detune = mf - note;

      sendPitchBend(detune);
      const vel = Math.round(soundSettings.volume * 127);
      sendMidiMessage([0x90, note, vel]);
      return;
    }

    // 3) Waveform (unchanged)
    const audioCtx = audioCtxRef.current!;
    const masterGain = masterGainRef.current!;
    const now = audioCtx.currentTime;
    const { attack, decay, sustain, waveform } = soundSettings;

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
    if (soundSettings.outputMode === "mute") return;

    if (soundSettings.outputMode === "midi") {
      const note = Math.floor(frequencyToMidiNoteNumber(frequency));
      sendMidiMessage([0x80, note, 0]);
      return;
    }

    const audioCtx = audioCtxRef.current!;
    const now = audioCtx.currentTime;
    const { release } = soundSettings;
    const queue = activeNotesRef.current.get(frequency) || [];
    if (!queue.length) return;

    const voice = queue.shift()!;
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
    voice.gainNode.gain.linearRampToValueAtTime(0, now + release);
    voice.oscillator.stop(now + release);

    activeNotesRef.current.set(frequency, queue);
  }

  const getCellDetails = (cell: Cell): CellDetails => {
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
      index: cell.index,
      octave: cell.octave,
    };

    if (!selectedTuningSystem) return emptyDetails;

    const pitchArr = selectedTuningSystem.getPitchClasses();
    if (cell.index < 0 || cell.index >= pitchArr.length) return emptyDetails;

    const basePc = pitchArr[cell.index];

    const pitchType = detectPitchClassType(pitchArr);
    if (pitchType === "unknown") return emptyDetails;

    const actualReferenceFrequency = referenceFrequencies[getFirstNoteName(selectedIndices)] || selectedTuningSystem.getDefaultReferenceFrequency();

    const shiftedPc = shiftPitchClass(basePc, pitchType, cell.octave as 0 | 1 | 2 | 3);
    const conv = convertPitchClass(shiftedPc, pitchType, selectedTuningSystem.getStringLength(), actualReferenceFrequency);

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
      index: cell.index,
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

  const selectedCellDetails = useMemo(
    () => selectedCells.map(getCellDetails),
    [selectedCells, selectedTuningSystem, selectedIndices, referenceFrequencies, pitchClasses, noteNames]
  );

  const allCellDetails = useMemo(
    () => getAllCells().map(getCellDetails),
    [selectedTuningSystem, selectedIndices, referenceFrequencies, pitchClasses, noteNames]
  );

  console.log(selectedCellDetails, allCellDetails);

  const clearSelections = () => {
    setSelectedCells([]);
    setSelectedJins(null);
    setSelectedMaqam(null);
    setMaqamSayrId("");
    setSelectedJinsTransposition(null);
    setSelectedMaqamTransposition(null);
  };

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
    const numberOfPitchClasses = givenNumberOfPitchClasses || pitchClassesArr.length || selectedTuningSystem?.getPitchClasses().length || 0;

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
    setSelectedIndices(Array(numberOfPitchClasses).fill(-1));
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
    setMaqamSayrId("");

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
    setMaqamSayrId("");
    setSelectedMaqamTransposition(null);
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
    sayrId,
    firstNote,
  }: {
    tuningSystemId?: string;
    jinsId?: string;
    maqamId?: string;
    sayrId?: string;
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
              if (sayrId) {
                setMaqamSayrId(sayrId);
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
        tuningSystems,
        setTuningSystems,
        selectedTuningSystem,
        setSelectedTuningSystem,
        pitchClasses,
        setPitchClasses,
        noteNames,
        setNoteNames,
        handleStartNoteNameChange,
        referenceFrequencies,
        setReferenceFrequencies,
        playNoteFrequency,
        soundSettings,
        setSoundSettings,
        selectedCells,
        setSelectedCells,
        activeCells,
        setActiveCells,
        selectedCellDetails,
        allCellDetails,
        selectedIndices,
        setSelectedIndices,
        originalIndices,
        setOriginalIndices,
        mapIndices,
        initialMappingDone,
        ajnas,
        setAjnas,
        selectedJins,
        setSelectedJins,
        checkIfJinsIsSelectable,
        handleClickJins,
        selectedJinsTransposition,
        setSelectedJinsTransposition,
        maqamat,
        setMaqamat,
        selectedMaqam,
        setSelectedMaqam,
        checkIfMaqamIsSelectable,
        handleClickMaqam,
        selectedMaqamTransposition,
        setSelectedMaqamTransposition,
        maqamSayrId,
        setMaqamSayrId,
        centsTolerance,
        setCentsTolerance,
        clearSelections,
        playSequence,
        noteOn,
        noteOff,
        handleUrlParams,
        midiInputs,
        midiOutputs,
        sources,
        setSources,
        patterns,
        setPatterns,
        setRefresh,
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
