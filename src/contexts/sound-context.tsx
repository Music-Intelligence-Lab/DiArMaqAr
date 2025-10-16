"use client";

import useAppContext from "./app-context";
import React, { createContext, useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import { frequencyToMidiNoteNumber } from "@/functions/convertPitchClass";
import Pattern from "@/models/Pattern";
import romanToNumber from "@/functions/romanToNumber";
import PitchClass from "@/models/PitchClass";
import { initializeCustomWaves, PERIODIC_WAVES, APERIODIC_WAVES } from "@/audio/waves";
import shiftPitchClass from "@/functions/shiftPitchClass";
import extendSelectedPitchClasses from "@/functions/extendSelectedPitchClasses";
import { Maqam } from "@/models/Maqam";
type InputMode = "tuningSystem" | "selection";
type OutputMode = "mute" | "waveform" | "midi";

// ---- Global velocity defaults ----
export const defaultNoteVelocity = 70;
export const defaultTargetVelocity = 90;
export const defaultDroneVelocity = 30;

// Maximum absolute gain for the dedicated drone gain node. This caps the audible
// drone level so the slider's 100% doesn't produce an overly loud carrier.
const MAX_DRONE_GAIN = 0.4; // 0..1 multiplier applied to droneVolume

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
  inputType: "QWERTY" | "MIDI";
  inputMode: InputMode;
  selectedMidiInputId: string | null;
  outputMode: OutputMode;
  selectedMidiOutputId: string | null;
  selectedPattern: Pattern | null;
  drone: boolean;
  droneVolume?: number; // 0..1
  useMPE: boolean;
  octaveShift: number; // Number of octaves to shift (-3 to +3)
}

interface MidiPortInfo {
  id: string;
  name: string;
}

interface SoundContextInterface {
  playNote: (pitchClass: PitchClass, duration?: number, velocity?: number) => void;
  soundSettings: SoundSettings;
  setSoundSettings: React.Dispatch<React.SetStateAction<SoundSettings>>;
  activePitchClasses: PitchClass[];
  setActivePitchClasses: React.Dispatch<React.SetStateAction<PitchClass[]>>;
  playSequence: (pitchClasses: PitchClass[], ascending?: boolean, ascendingPitchClasses?: PitchClass[], velocity?: number | ((noteIdx: number, patternIdx: number) => number)) => Promise<void>;
  noteOn: (pitchClass: PitchClass, velocity?: number) => void;
  noteOff: (pitchClass: PitchClass) => void;
  midiInputs: MidiPortInfo[];
  midiOutputs: MidiPortInfo[];
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  clearHangingNotes: () => void;
  stopAllSounds: () => void;
  keyToPitchClassMapping: Record<string, PitchClass>;
  pitchClassToKeyMapping: Record<string, string>;
  midiToPitchClassMapping: Record<number, PitchClass>;
  pitchClassToMidiMapping: Record<string, number>;
  pitchClassToBlackOrWhite: Record<string, "black" | "white">;
  updateAllActiveNotesByReferenceFrequency: (newReferenceFrequency: number) => void;
  recalculateAllActiveNoteFrequencies: () => void;
}

const SoundContext = createContext<SoundContextInterface | null>(null);

export function SoundContextProvider({ children }: { children: React.ReactNode }) {
  const { selectedTuningSystem, selectedMaqamData, selectedMaqam, allPitchClasses, selectedPitchClasses, setSelectedPitchClasses } = useAppContext();

  const [soundSettings, setSoundSettings] = useState<SoundSettings>({
    attack: 0.01,
    decay: 0.2,
    sustain: 0.5,
    release: 0.4,
    waveform: "triangle",
    volume: 0.75,
    duration: 0.1,
    tempo: 150,
    pitchBendRange: 2,
    inputType: "QWERTY",
    inputMode: "selection",
    selectedMidiInputId: null,
    outputMode: "waveform",
    selectedMidiOutputId: null,
    selectedPattern: null,
  drone: true,
  droneVolume: 0.3,
    useMPE: false,
    octaveShift: 0,
  });

  // Union type: oscillator can be OscillatorNode or OscillatorNode[]
  const activeNotesRef = useRef<Map<string, { oscillator: OscillatorNode | OscillatorNode[]; gainNode: GainNode; frequency: number }[]>>(new Map());
  const timeoutsRef = useRef<number[]>([]);
  const midiActiveNotesRef = useRef<Map<string, number>>(new Map()); // stores pitch class fraction -> current frequency

  // MPE channel allocation
  const mpeChannelAllocatorRef = useRef<{
    activeChannels: Map<number, { pitchClassFraction: string; noteNumber: number }>; // channel -> note info
    availableChannels: number[]; // available MPE channels (2-15, channel 1 is global)
  }>({
    activeChannels: new Map(),
    availableChannels: Array.from({ length: 14 }, (_, i) => i + 2), // channels 2-15
  });

  const [activePitchClasses, setActivePitchClasses] = useState<PitchClass[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  // Dedicated gain node for the drone (independent of masterGain to allow separate control)
  const droneGainRef = useRef<GainNode | null>(null);
  // Store the active drone oscillator(s) so we can stop them cleanly
  const droneOscRef = useRef<{ oscillator: OscillatorNode | OscillatorNode[]; gainNode?: GainNode; fraction?: string; midiChannel?: number } | null>(null);
  const midiAccessRef = useRef<MIDIAccess | null>(null);

  const [midiInputs, setMidiInputs] = useState<MidiPortInfo[]>([]);
  const [midiOutputs, setMidiOutputs] = useState<MidiPortInfo[]>([]);
  const [refresh, setRefresh] = useState(false);

  // Keyboard row codes - centralized definition
  const firstRowCodes = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"];
  const secondRowCodes = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Backslash"];
  const thirdRowCodes = ["Backquote", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", ""];

  // Function to convert key code to concise display string
  const conciseKey = (code: string): string => {
    if (!code) return "";
    if (code.startsWith("Key")) return code.slice(3).toLowerCase();
    if (code.startsWith("Digit")) return code.slice(5);
    const special: Record<string, string> = {
      Backquote: "`",
      Minus: "-",
      Equal: "=",
      BracketLeft: "[",
      BracketRight: "]",
      Backslash: "\\",
      Semicolon: ";",
      Quote: "'",
      Comma: ",",
      Period: ".",
      Slash: "/",
    };
    return special[code] ?? code.toLowerCase();
  };

  // Centralized keyboard mapping: Key code -> PitchClass
  const keyToPitchClassMapping = useMemo<Record<string, PitchClass>>(() => {
    const mapping: Record<string, PitchClass> = {};

    if (selectedMaqam || selectedMaqamData) {
      // const ascendingNoteNames: string[] = selectedPitchClasses.map((pc) => pc.noteName);
      const ascendingMaqamPitchClasses = selectedPitchClasses; // previous implementation where we looked at the maqam itself for hte ascending notes to map to the ASDF row
      let descendingMaqamPitchClasses: PitchClass[] = [];

      if (selectedMaqam) {
        // ascendingNoteNames = selectedMaqam.ascendingPitchClasses.map((pc) => pc.noteName);
        // descendingNoteNames = [...selectedMaqam.descendingPitchClasses].reverse().map((pc) => pc.noteName);
        descendingMaqamPitchClasses = [...selectedMaqam.descendingPitchClasses].reverse();
      } else if (selectedMaqamData) {
        // ascendingNoteNames = selectedMaqamData.getAscendingNoteNames();
        const descendingNoteNames = selectedMaqamData.getDescendingNoteNames();
        descendingMaqamPitchClasses = allPitchClasses.filter((pitchClass) => descendingNoteNames.includes(pitchClass.noteName));
      }

      let sliceIndex = 0;
      const lastAscendingPitchClass = ascendingMaqamPitchClasses[ascendingMaqamPitchClasses.length - 1];

      for (let i = 0; i < ascendingMaqamPitchClasses.length; i++) {
        if (parseFloat(ascendingMaqamPitchClasses[i].frequency) * 2 <= parseFloat(lastAscendingPitchClass.frequency)) {
          sliceIndex = i + 1;
        }
      }

      const extendedAscendingPitchClasses = [
        ...ascendingMaqamPitchClasses,
        ...ascendingMaqamPitchClasses.slice(sliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1)),
        ...ascendingMaqamPitchClasses.slice(sliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
      ];

      const extendedDescendingPitchClasses = [
        ...descendingMaqamPitchClasses,
        ...descendingMaqamPitchClasses.slice(sliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1)),
        ...descendingMaqamPitchClasses.slice(sliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
      ];

      for (let i = 0; i <= 12; i++) {
        const ascendingPitchClass = extendedAscendingPitchClasses[i];
        const descendingPitchClass = extendedDescendingPitchClasses[i];
        const ascendingShiftedPitchClass = shiftPitchClass(allPitchClasses, ascendingPitchClass, -1);

        // First assign first and third row mappings (lower priority)
        if (firstRowCodes[i] && descendingPitchClass && !mapping[firstRowCodes[i]]) {
          mapping[firstRowCodes[i]] = descendingPitchClass;
        }

        if (thirdRowCodes[i] && ascendingShiftedPitchClass && !mapping[thirdRowCodes[i]]) {
          mapping[thirdRowCodes[i]] = ascendingShiftedPitchClass;
        }

        // Then assign second row mapping (higher priority - will overwrite if there's a conflict)
        if (secondRowCodes[i] && ascendingPitchClass) {
          mapping[secondRowCodes[i]] = ascendingPitchClass;
        }
      }
    } else {
      for (let i = 0; i < selectedPitchClasses.length; i++) {
        const pitchClass = selectedPitchClasses[i];
        const loweredOctavePitchClass = shiftPitchClass(allPitchClasses, pitchClass, -1);

        // Assign third row first (lower priority)
        if (thirdRowCodes[i] && loweredOctavePitchClass && !mapping[thirdRowCodes[i]]) {
          mapping[thirdRowCodes[i]] = loweredOctavePitchClass;
        }

        // Then assign second row (higher priority - will overwrite if there's a conflict)
        if (secondRowCodes[i] && pitchClass) {
          mapping[secondRowCodes[i]] = pitchClass;
        }
      }
    }

    return mapping;
  }, [selectedMaqam, selectedMaqamData, selectedPitchClasses, allPitchClasses]);

  // Centralized keyboard mapping: PitchClass fraction -> Key display string
  const pitchClassToKeyMapping = useMemo<Record<string, string>>(() => {
    // Invert keyToPitchClassMapping, giving priority to secondRowCodes
    const mapping: Record<string, string> = {};

    // Helper: build a priority list of key codes (second row first)
    const allKeyCodes = [...secondRowCodes, ...firstRowCodes, ...thirdRowCodes].filter(Boolean);

    // For each key code in priority order, map its pitch class (if any)
    for (const code of allKeyCodes) {
      const pitchClass = keyToPitchClassMapping[code];
      if (pitchClass && !mapping[pitchClass.fraction]) {
        mapping[pitchClass.fraction] = conciseKey(code);
      }
    }

    return mapping;
  }, [keyToPitchClassMapping, secondRowCodes, firstRowCodes, thirdRowCodes]);

  // Centralized MIDI mapping: MIDI note number -> PitchClass
  const midiToPitchClassMapping = useMemo<Record<number, PitchClass>>(() => {
    const mapping: Record<number, PitchClass> = {};

    if (soundSettings.inputMode === "tuningSystem" && selectedTuningSystem) {
      const pitchClasses = allPitchClasses;
      const MIDI_BASE = 55;
      const numberOfCellsPerRow = selectedTuningSystem.getOriginalPitchClassValues().length;

      for (let noteNumber = 0; noteNumber <= 127; noteNumber++) {
        const idx = noteNumber + numberOfCellsPerRow - MIDI_BASE;
        if (idx >= 0 && idx < pitchClasses.length) {
          mapping[noteNumber] = pitchClasses[idx];
        }
      }
    } else if (soundSettings.inputMode === "selection") {
      const extendedPitchClasses = extendSelectedPitchClasses(allPitchClasses, selectedPitchClasses);

      for (const pitchClass of extendedPitchClasses) {
        let baseMidi = Math.round(pitchClass.midiNoteNumber);

        const englishName = pitchClass.englishName;

        const accidental = englishName.slice(1);

        if (["-b", "--", "-"].includes(accidental)) baseMidi += 1;

        if (baseMidi >= 0 && baseMidi <= 127) {
          mapping[baseMidi] = pitchClass;
        }
      }

      if (selectedMaqamData) {
        let maqam: Maqam;

        if (selectedMaqam) maqam = selectedMaqam;
        else maqam = selectedMaqamData.getTahlil(allPitchClasses);

        const { ascendingPitchClasses, descendingPitchClasses } = maqam;

        const uniqueDescendingPitchClasses = descendingPitchClasses.filter((pc) => !ascendingPitchClasses.find((ascendingPitchClass) => pc.originalValue === ascendingPitchClass.originalValue));

        const extendedUniqueDescendingPitchClasses = extendSelectedPitchClasses(allPitchClasses, uniqueDescendingPitchClasses);

        for (const pitchClass of extendedUniqueDescendingPitchClasses) {
          let baseMidi = Math.round(pitchClass.midiNoteNumber);

          const englishName = pitchClass.englishName;

          const accidental = englishName.slice(1);

          if (["-b", "--", "-"].includes(accidental)) baseMidi += 1;

          if (baseMidi >= 0 && baseMidi <= 127) {
            mapping[baseMidi] = pitchClass;
          }
        }
      }
    }
    return mapping;
  }, [soundSettings.inputMode, selectedTuningSystem, selectedPitchClasses, allPitchClasses]);

  // Centralized MIDI mapping: PitchClass fraction -> MIDI note number
  // Reverse mapping: PitchClass fraction -> MIDI note number
  const pitchClassToMidiMapping = useMemo<Record<string, number>>(() => {
    const mapping: Record<string, number> = {};
    // Just reverse midiToPitchClassMapping
    for (const [midi, pitchClass] of Object.entries(midiToPitchClassMapping)) {
      if (pitchClass && pitchClass.fraction) {
        mapping[pitchClass.fraction] = Number(midi);
      }
    }
    return mapping;
  }, [midiToPitchClassMapping]);

  // Mapping for black/white key classification
  const pitchClassToBlackOrWhite = useMemo<Record<string, "black" | "white">>(() => {
    const mapping: Record<string, "black" | "white"> = {};

    // Helper function to determine if a pitch class corresponds to a black or white key
    // Helper: MIDI note numbers for black keys in an octave (C=0)
    const BLACK_KEY_OFFSETS = [1, 3, 6, 8, 10];

    // Helper: get MIDI note number for this pitch class (if mapped)
    const getMidiNumber = (pitchClass: PitchClass): number | undefined => {
      return pitchClassToMidiMapping[pitchClass.fraction];
    };

    // Helper: is this MIDI note number a black key?
    const isMidiBlackKey = (midi: number) => BLACK_KEY_OFFSETS.includes(midi % 12);

    // Main: is this pitch class a black key?
    const isBlackKey = (pitchClass: PitchClass): boolean | undefined => {
      const midi = getMidiNumber(pitchClass);
      if (typeof midi === "number") {
        return isMidiBlackKey(midi);
      }
      // fallback: treat as white if not mapped
      return undefined;
    };

    for (const pitchClass of allPitchClasses) {
      if (getMidiNumber(pitchClass) !== undefined) {
        mapping[pitchClass.fraction] = isBlackKey(pitchClass) ? "black" : "white";
      }
    }

    return mapping;
  }, [soundSettings.inputMode, selectedTuningSystem, selectedPitchClasses, allPitchClasses]);

  const sendMidiMessage = useCallback((bytes: number[]) => {
    const ma = midiAccessRef.current;
    if (!ma || !soundSettings.selectedMidiOutputId) return;

    const port = ma.outputs.get(soundSettings.selectedMidiOutputId);
    port?.send(bytes);
  }, [soundSettings.selectedMidiOutputId]);

  const sendPitchBend = useCallback(function sendPitchBend(detuneSemitones: number, channel: number = 0) {
    const center = 8192;
    const bendOffset = Math.round((detuneSemitones / soundSettings.pitchBendRange) * center);
    const bendValue = Math.max(0, Math.min(16383, center + bendOffset));
    const lsb = bendValue & 0x7f;
    const msb = (bendValue >> 7) & 0x7f;
    // Use the specified channel (0xE0 + channel)
    sendMidiMessage([0xe0 + channel, lsb, msb]);
  }, [sendMidiMessage, soundSettings.pitchBendRange]);

  const allocateMPEChannel = useCallback(function allocateMPEChannel(pitchClassFraction: string, noteNumber: number): number | null {
    if (!soundSettings.useMPE) return 0; // Use channel 0 for non-MPE

    const allocator = mpeChannelAllocatorRef.current;
    if (allocator.availableChannels.length === 0) {
      console.warn("No available MPE channels");
      return null;
    }

    const channel = allocator.availableChannels.shift()!;
    allocator.activeChannels.set(channel, { pitchClassFraction, noteNumber });
    return channel;
  }, [soundSettings.useMPE]);

  const releaseMPEChannel = useCallback(function releaseMPEChannel(pitchClassFraction: string): number | null {
    if (!soundSettings.useMPE) return 0;

    const allocator = mpeChannelAllocatorRef.current;
    for (const [channel, noteInfo] of allocator.activeChannels.entries()) {
      if (noteInfo.pitchClassFraction === pitchClassFraction) {
        allocator.activeChannels.delete(channel);
        allocator.availableChannels.push(channel);
        allocator.availableChannels.sort(); // Keep channels sorted for consistent allocation
        return channel;
      }
    }
    return null;
  }, [soundSettings.useMPE]);

  const initializeMPE = useCallback(function initializeMPE() {
    if (!soundSettings.useMPE || !soundSettings.selectedMidiOutputId) return;

    // Send MPE Configuration Message
    // RPN MSB = 0, RPN LSB = 6 (MPE Configuration)
    // Data Entry MSB = number of channels (14 for zone 1)
    sendMidiMessage([0xb0, 0x65, 0x00]); // RPN LSB
    sendMidiMessage([0xb0, 0x64, 0x06]); // RPN MSB
    sendMidiMessage([0xb0, 0x06, 0x0e]); // Data Entry MSB (14 channels)
    sendMidiMessage([0xb0, 0x26, 0x00]); // Data Entry LSB

    // Set pitch bend range on all MPE channels to match our setting
    for (let ch = 1; ch <= 15; ch++) {
      sendMidiMessage([0xb0 + ch, 0x65, 0x00]); // RPN LSB
      sendMidiMessage([0xb0 + ch, 0x64, 0x00]); // RPN MSB (pitch bend sensitivity)
      sendMidiMessage([0xb0 + ch, 0x06, soundSettings.pitchBendRange]); // Data Entry MSB
      sendMidiMessage([0xb0 + ch, 0x26, 0x00]); // Data Entry LSB
    }
  }, [sendMidiMessage, soundSettings.pitchBendRange, soundSettings.selectedMidiOutputId, soundSettings.useMPE]);

  const scheduleTimeout = useCallback(function scheduleTimeout(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    const newSelectedPitchClasses = [];

    for (const selectedPitchClass of selectedPitchClasses) {
      const newSelectedPitchClass = allPitchClasses.find((pc) => pc.index === selectedPitchClass.index && pc.octave === selectedPitchClass.octave);
      if (newSelectedPitchClass) newSelectedPitchClasses.push(newSelectedPitchClass);
    }

    setSelectedPitchClasses(newSelectedPitchClasses);

    const newActivePitchClasses = [];

    for (const activePitchClass of activePitchClasses) {
      const newActivePitchClass = allPitchClasses.find((pc) => pc.index === activePitchClass.index && pc.octave === activePitchClass.octave);
      if (newActivePitchClass) newActivePitchClasses.push(newActivePitchClass);
    }

    setActivePitchClasses(newActivePitchClasses);
  }, [allPitchClasses]);

  useEffect(() => {
    const AudioContext = window.AudioContext;
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = soundSettings.volume;
    masterGain.connect(audioCtx.destination);
    masterGainRef.current = masterGain;

  // Create drone gain and connect it to masterGain so drone volume is independent
  const droneGain = audioCtx.createGain();
  droneGain.gain.value = (soundSettings.droneVolume ?? 0.3) * MAX_DRONE_GAIN;
  droneGain.connect(masterGain);
  droneGainRef.current = droneGain;

    // ← initialize *all* periodic & aperiodic waves here
    initializeCustomWaves(audioCtx);
  }, []);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(soundSettings.volume, audioCtxRef.current.currentTime);
    }
    // keep drone gain in sync with droneVolume (if created)
    if (droneGainRef.current && audioCtxRef.current) {
      // Use a short linear ramp to reduce clicks when adjusting drone volume
      const now = audioCtxRef.current.currentTime;
      try {
  droneGainRef.current.gain.cancelScheduledValues(now);
  droneGainRef.current.gain.setValueAtTime(droneGainRef.current.gain.value, now);
  droneGainRef.current.gain.linearRampToValueAtTime((soundSettings.droneVolume ?? 0) * MAX_DRONE_GAIN, now + 0.02);
      } catch (err) {
        // Fallback to immediate set and log the error
        console.warn("Could not apply gain ramp to droneGain:", err);
  droneGainRef.current.gain.setValueAtTime((soundSettings.droneVolume ?? 0) * MAX_DRONE_GAIN, audioCtxRef.current.currentTime);
      }
    }
  }, [soundSettings.volume, soundSettings.droneVolume]);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;
    navigator
      .requestMIDIAccess({ sysex: false })
      .then((ma) => {
        midiAccessRef.current = ma;

        const outs = Array.from(ma.outputs.values());
        setMidiOutputs(
          outs.map((o) => ({
            id: o.id,
            name: o.name || o.manufacturer || "Unknown",
          }))
        );

        const ins = Array.from(ma.inputs.values());
        setMidiInputs(
          ins.map((i) => ({
            id: i.id,
            name: i.name || i.manufacturer || "Unknown",
          }))
        );

        // we do NOT attach input.onmidimessage here
        ma.onstatechange = () => {
          const newOuts = Array.from(ma.outputs.values());
          setMidiOutputs(
            newOuts.map((o) => ({
              id: o.id,
              name: o.name || o.manufacturer || "Unknown",
            }))
          );

          const newIns = Array.from(ma.inputs.values());
          setMidiInputs(
            newIns.map((i) => ({
              id: i.id,
              name: i.name || i.manufacturer || "Unknown",
            }))
          );
          // binding will happen in the next effect
        };
      })
      .catch(console.error);
  }, [refresh]);

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
  }, [midiInputs, midiToPitchClassMapping, soundSettings.inputType, soundSettings.selectedMidiInputId]);

  useEffect(() => {
    return () => {
      clearHangingNotes();
    };
  }, []);

  // Initialize MPE when MPE setting or MIDI output changes
  useEffect(() => {
    if (soundSettings.useMPE && soundSettings.selectedMidiOutputId) {
      initializeMPE();
    }
  }, [soundSettings.useMPE, soundSettings.selectedMidiOutputId, soundSettings.pitchBendRange]);

  const handleMidiInput: NonNullable<MIDIInput["onmidimessage"]> = useCallback(function (this: MIDIInput, ev: MIDIMessageEvent) {
    // Ignore MIDI messages unless inputType is "MIDI"
    if (soundSettings.inputType !== "MIDI") return;
    // only from our selected port
    if (this.id !== soundSettings.selectedMidiInputId) return;

    const data = ev.data;
    if (!data) return; // safety
    const [status, noteNumber, velocity] = data;
    const cmd = status & 0xf0;

    // Use centralized mapping to get pitch class from MIDI note number
    const pitchClass = midiToPitchClassMapping[noteNumber];
    if (!pitchClass) return; // No mapping found for this note number

    // ——— dispatch sound ———
    if (cmd === 0x90 && velocity > 0) {
      noteOn(pitchClass, velocity);
      setActivePitchClasses((prev) => {
        if (prev.some((c) => c.index === pitchClass.index && c.octave === pitchClass.octave)) return prev;
        return [...prev, pitchClass];
      });
    } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
      noteOff(pitchClass);
      setActivePitchClasses((prev) => prev.filter((c) => !(c.index === pitchClass.index && c.octave === pitchClass.octave)));
    }
  }, [soundSettings.inputType, soundSettings.selectedMidiInputId, midiToPitchClassMapping]);

  // Define noteOn/noteOff before playNote/playSequence to satisfy hook dependency ordering.

  const noteOn = useCallback(function noteOn(pitchClass: PitchClass, midiVelocity: number = defaultNoteVelocity) {
    setActivePitchClasses((prev) => {
      if (prev.some((c) => c.frequency === pitchClass.frequency)) return prev;
      return [...prev, pitchClass];
    });
    const baseFrequency = parseFloat(pitchClass.frequency);
    // Apply octave shift: multiply by 2^octaveShift
    const frequency = baseFrequency * Math.pow(2, soundSettings.octaveShift);
    if (soundSettings.outputMode === "mute") return;

    // Use a quadratic velocity curve for more expressive dynamics
    const velocityNorm = Math.max(0, Math.min(1, midiVelocity / 127));
    const velocityCurve = velocityNorm * velocityNorm;

    if (soundSettings.outputMode === "midi") {
      const mf = frequencyToMidiNoteNumber(frequency);
      const note = Math.floor(mf);
      const detune = mf - note;

      // Allocate MPE channel if using MPE, otherwise use channel 0
      const channel = allocateMPEChannel(pitchClass.fraction, note);
      if (channel === null) {
        console.warn("Could not allocate MPE channel for note");
        return;
      }

      // Send pitch bend on the allocated channel
      sendPitchBend(detune, channel);

      // For MIDI, pass velocity directly (scaled by volume if desired)
      const vel = Math.round(velocityNorm * soundSettings.volume * 127);

      // Send note on with the allocated channel
      sendMidiMessage([0x90 + channel, note, vel]);

      // Track the note with its current frequency
      midiActiveNotesRef.current.set(pitchClass.fraction, frequency);
      return;
    }

    // For waveform output, manually instantiate oscillator/gainNode with ADSR (no release) and store in activeNotesRef
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    const startTime = audioCtx.currentTime;
    const { attack, decay, sustain, waveform } = soundSettings;
    // Polyphony normalization: scale each voice so overlapping notes don’t clip
    const upcomingCount = Array.from(activeNotesRef.current.values()).reduce((sum, v) => sum + v.length, 0) + 1;
    const polyScale = (1 / Math.sqrt(upcomingCount)) * velocityCurve;

    // Handle aperiodic waves
    if (APERIODIC_WAVES[waveform]) {
      const aw = APERIODIC_WAVES[waveform];
      const pws = aw.periodicWaves;
      const dets = aw.detunings;

      const merger = audioCtx.createGain();
      const oscs: OscillatorNode[] = [];

      for (let i = 0; i < pws.length; i++) {
        const oscNode = audioCtx.createOscillator();
        oscNode.setPeriodicWave(pws[i]);
        const detunedFreq = frequency * Math.pow(2, dets[i] / 1200);
        oscNode.frequency.setValueAtTime(detunedFreq, startTime);
        oscNode.connect(merger);
        oscs.push(oscNode);
      }

      merger.gain.setValueAtTime(1 / Math.sqrt(pws.length), startTime);
      const source = merger;

      const gainNode = audioCtx.createGain();
      const peakLevel = velocityCurve;
      const sustainLevel = sustain * velocityCurve;
      const attackEndTime = startTime + attack;
      const decayEndTime = attackEndTime + decay;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(peakLevel, attackEndTime);
      gainNode.gain.linearRampToValueAtTime(sustainLevel, decayEndTime);

      source.connect(gainNode).connect(masterGain);

      const prev = activeNotesRef.current.get(pitchClass.fraction) || [];
      prev.push({ oscillator: oscs, gainNode, frequency });
      activeNotesRef.current.set(pitchClass.fraction, prev);
      oscs.forEach((osc) => osc.start(startTime));
      return;
    }

    const osc = audioCtx.createOscillator();
    function createZeroPhasePeriodicWave(type: string, ctx: AudioContext) {
      let real, imag, N;
      if (type === "sine") {
        real = new Float32Array(2);
        imag = new Float32Array(2);
        real[0] = 0; real[1] = 1; imag[0] = 0; imag[1] = 0;
        return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
      } else if (type === "triangle") {
        N = 32; real = new Float32Array(N); imag = new Float32Array(N); real[0] = 0;
        for (let n = 1; n < N; n++) if (n % 2 === 1) { real[n] = (8 / (Math.PI * Math.PI)) * (1 / (n * n)) * (n % 4 === 1 ? 1 : -1); imag[n] = 0; }
        return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
      } else if (type === "square") {
        N = 32; real = new Float32Array(N); imag = new Float32Array(N); real[0] = 0;
        for (let n = 1; n < N; n++) if (n % 2 === 1) { real[n] = 4 / (Math.PI * n); imag[n] = 0; }
        return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
      } else if (type === "sawtooth") {
        N = 32; real = new Float32Array(N); imag = new Float32Array(N); real[0] = 0;
        for (let n = 1; n < N; n++) { real[n] = 2 / (Math.PI * n); imag[n] = 0; }
        return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
      }
      return null;
    }
    let customWave: PeriodicWave | null = null;
    if (["sine", "triangle", "square", "sawtooth"].includes(waveform)) {
      customWave = createZeroPhasePeriodicWave(waveform, audioCtx);
      if (customWave) osc.setPeriodicWave(customWave); else osc.type = waveform as OscillatorType;
    } else if (PERIODIC_WAVES[waveform]) osc.setPeriodicWave(PERIODIC_WAVES[waveform]); else osc.type = waveform as OscillatorType;
    try { osc.frequency.setValueAtTime(frequency ?? 0, startTime); } catch (e) { console.error("Error setting frequency on oscillator:", e, frequency, startTime, pitchClass); }
    const gainNode = audioCtx.createGain();
    const peakLevel = polyScale; const sustainLevel = sustain * polyScale; const attackEndTime = startTime + attack; const decayEndTime = attackEndTime + decay;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peakLevel, attackEndTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, decayEndTime);
    osc.connect(gainNode).connect(masterGain);
    osc.start(startTime);
    const prev = activeNotesRef.current.get(pitchClass.fraction) || [];
    prev.push({ oscillator: osc, gainNode, frequency });
    activeNotesRef.current.set(pitchClass.fraction, prev);
  }, [allocateMPEChannel, sendMidiMessage, sendPitchBend, soundSettings.attack, soundSettings.decay, soundSettings.octaveShift, soundSettings.outputMode, soundSettings.pitchBendRange, soundSettings.sustain, soundSettings.useMPE, soundSettings.volume, soundSettings.waveform]);

  const noteOff = useCallback(function noteOff(pitchClass: PitchClass) {
    setActivePitchClasses((prev) => prev.filter((c) => !(c.frequency === pitchClass.frequency)));
    if (soundSettings.outputMode === "mute") return;
    if (soundSettings.outputMode === "midi") {
      const currentFrequency = midiActiveNotesRef.current.get(pitchClass.fraction);
      if (!currentFrequency) return;
      const mf = frequencyToMidiNoteNumber(currentFrequency);
      const note = Math.floor(mf);
      const channel = releaseMPEChannel(pitchClass.fraction);
      if (channel !== null) sendMidiMessage([0x80 + channel, note, 0]); else sendMidiMessage([0x80, note, 0]);
      midiActiveNotesRef.current.delete(pitchClass.fraction);
      return;
    }
    const audioCtx = audioCtxRef.current!; const now = audioCtx.currentTime; const { release } = soundSettings;
    const queue = activeNotesRef.current.get(pitchClass.fraction) || []; if (!queue.length) return;
    const voice = queue.shift()!; voice.gainNode.gain.cancelScheduledValues(now); voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now); voice.gainNode.gain.linearRampToValueAtTime(0, now + release);
    if (Array.isArray(voice.oscillator)) voice.oscillator.forEach((osc) => osc.stop(now + release)); else voice.oscillator.stop(now + release);
    activeNotesRef.current.set(pitchClass.fraction, queue);
  }, [releaseMPEChannel, sendMidiMessage, soundSettings.outputMode, soundSettings.release, soundSettings.useMPE]);

  const playNote = useCallback((pitchClass: PitchClass, givenDuration: number = soundSettings.duration, velocity?: number) => {
    noteOn(pitchClass, velocity);
    scheduleTimeout(() => noteOff(pitchClass), givenDuration * 1000);
  }, [noteOn, noteOff, scheduleTimeout, soundSettings.duration]);

  const playSequence = useCallback((
    pitchClasses: PitchClass[],
    ascending = true,
    ascendingPitchClasses: PitchClass[] = [],
    velocity?: number | ((noteIdx: number, patternIdx: number) => number)
  ): Promise<void> => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const selectedPattern = soundSettings.selectedPattern || new Pattern("Default", "Default", [{ scaleDegree: "I", noteDuration: "8n", isTarget: true }]);

    return new Promise((resolve) => {
      const beatSec = 60 / soundSettings.tempo;

      const patternNotes = selectedPattern.getNotes();

      if (pitchClasses.length <= 5) {
        // Play ascending then descending, omitting the last note in the ascending sequence from the start of the descending sequence
        const ascending = pitchClasses;
        const descending = pitchClasses.slice(0, -1).reverse();
        const sequence = [...ascending, ...descending];

        // Use 8n duration for each note
        const base = 4 / 8; // 8n = eighth note
        const mod = 1; // not dotted or triplet
        const durSec = base * mod * beatSec;
        const totalTimeMs = sequence.length * durSec * 1000;

        sequence.forEach((pitchClass, i) => {
          scheduleTimeout(() => {
            playNote(pitchClass, durSec);
            // ensure release for waveform output
            scheduleTimeout(() => noteOff(pitchClass), durSec * 1000);
          }, i * durSec * 1000);
        });

        scheduleTimeout(() => {
          resolve();
        }, totalTimeMs);

        return;
      }

      let ascendingSliceIndex = 0;
      const lastAscendingPitchClass = pitchClasses[pitchClasses.length - 1];

      for (let i = 0; i < pitchClasses.length; i++) {
        if (parseFloat(pitchClasses[i].frequency) * 2 <= parseFloat(lastAscendingPitchClass.frequency)) {
          ascendingSliceIndex = i + 1;
        }
      }

      let descendingSliceIndex = 0;
      const firstAscendingPitchClass = pitchClasses[0];

      for (let i = pitchClasses.length - 1; i >= 0; i--) {
        if (parseFloat(pitchClasses[i].frequency) / 2 >= parseFloat(firstAscendingPitchClass.frequency)) {
          descendingSliceIndex = i + 1;
        }
      }

      if (descendingSliceIndex === 0) descendingSliceIndex = pitchClasses.length + 1;

      const lowerExtension = ascendingPitchClasses.length ? ascendingPitchClasses : pitchClasses; //here we want to make sure that descending sequences have the lower extension using ascending pitch classes

      const extendedPitchClasses = [
        ...lowerExtension.slice(0, descendingSliceIndex - 1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, -1)),
        ...pitchClasses,
        ...pitchClasses.slice(ascendingSliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1)),
        ...pitchClasses.slice(ascendingSliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
      ];

      const n = pitchClasses.length;
      let cumulativeTimeSec = 0;

      if (soundSettings.drone) {
        // If output is MIDI, keep previous behavior using MIDI velocity
        if (soundSettings.outputMode === "midi") {
          const droneVel = typeof soundSettings.droneVolume === "number" ? Math.round(soundSettings.droneVolume * 127) : defaultDroneVelocity;
          noteOn(shiftPitchClass(allPitchClasses, pitchClasses[0], -1), droneVel);
        } else if (soundSettings.outputMode === "waveform") {
          // Create a dedicated oscillator for the drone connected to droneGainRef
          const audioCtx = audioCtxRef.current;
          if (audioCtx && droneGainRef.current) {
            // stop existing drone if present
            if (droneOscRef.current) {
              try {
                if (Array.isArray(droneOscRef.current.oscillator)) droneOscRef.current.oscillator.forEach((o) => o.stop()); else droneOscRef.current.oscillator.stop();
              } catch (err) {
                console.warn("Error stopping existing drone oscillator:", err);
              }
              droneOscRef.current = null;
            }

            const osc = audioCtx.createOscillator();
            const waveform = soundSettings.waveform;
            if (["sine", "triangle", "square", "sawtooth"].includes(waveform)) {
              // try to create zero-phase periodic wave like noteOn code
              // reuse the internal helper by creating a simple periodic wave where possible
              try {
                // fallback to native oscillator type if creation not available
                osc.type = waveform as OscillatorType;
              } catch (err) {
                osc.type = waveform as OscillatorType;
                console.warn("Oscillator.type assignment fallback:", err);
              }
            } else {
              // custom periodic waves exist on initialization
              if (PERIODIC_WAVES[waveform]) {
                try {
                  osc.setPeriodicWave(PERIODIC_WAVES[waveform]);
                } catch (err) {
                  osc.type = "sine";
                  console.warn("Failed to set periodic wave for drone, falling back to sine:", err);
                }
              } else {
                osc.type = "sine";
              }
            }

            const tonicPc = shiftPitchClass(allPitchClasses, pitchClasses[0], -1);
            const freq = parseFloat(tonicPc.frequency);
            try { osc.frequency.setValueAtTime(freq, audioCtx.currentTime); } catch (err) { console.warn("Could not set drone oscillator frequency:", err); }

            osc.connect(droneGainRef.current);
            osc.start();
            droneOscRef.current = { oscillator: osc, fraction: tonicPc.fraction };
          } else {
            // Fallback: use noteOn which handles both waveform and MIDI in its own way
            const droneVel = typeof soundSettings.droneVolume === "number" ? Math.round(soundSettings.droneVolume * 127) : defaultDroneVelocity;
            noteOn(shiftPitchClass(allPitchClasses, pitchClasses[0], -1), droneVel);
          }
        } else {
          // mute -> do nothing
        }
      }

      // Refactored: playPattern always receives velocity as an explicit argument
      const playPattern = (
        windowStartIndexes: number[],
        terminationCheck: (windowStart: number, isTarget: boolean) => boolean,
        velocityArg?: number | ((windowStart: number, patternIdx: number) => number)
      ) => {
        for (const windowStart of windowStartIndexes) {
          for (let patternIdx = 0; patternIdx < patternNotes.length; patternIdx++) {
            const { scaleDegree, noteDuration, isTarget } = patternNotes[patternIdx];
            // compute note length in seconds:
            //   base = (4 ÷ numeric part of noteDuration), e.g. "4" → whole note
            //   mod  = 1 (normal), 1.5 (dotted), 2/3 (triplet)
            const base = 4 / Number(noteDuration.replace(/\D/g, ""));
            const mod = noteDuration.endsWith("d") ? 1.5 : noteDuration.endsWith("t") ? 2 / 3 : 1;
            const durSec = base * mod * beatSec;

            if (scaleDegree !== "R") {
              let pitchClassToPlay: PitchClass;

              if (!isNaN(Number(scaleDegree))) {
                const intervalShift = Number(scaleDegree);
                pitchClassToPlay = extendedPitchClasses[windowStart + descendingSliceIndex - 1 + intervalShift];
              } else {
                const deg = romanToNumber(scaleDegree);
                pitchClassToPlay = extendedPitchClasses[windowStart + deg - 1 + descendingSliceIndex - 1];

                if (scaleDegree.startsWith("-")) {
                  // negative degree, e.g. "-II" → play the previous octave
                  pitchClassToPlay = shiftPitchClass(allPitchClasses, pitchClassToPlay, -1);
                } else if (scaleDegree.startsWith("+")) {
                  // positive degree, e.g. "+II" → play the next octave
                  pitchClassToPlay = shiftPitchClass(allPitchClasses, pitchClassToPlay, 1);
                }
              }

              // Determine velocity for this note: use pattern note velocity if present, else fall back
              let noteVelocity = patternNotes[patternIdx]?.velocity ?? (isTarget ? defaultTargetVelocity : defaultNoteVelocity);
              if (typeof noteVelocity !== "number" || isNaN(noteVelocity)) noteVelocity = isTarget ? defaultTargetVelocity : defaultNoteVelocity;
              if (typeof velocityArg === "function") {
                noteVelocity = velocityArg(windowStart, patternIdx);
              } else if (typeof velocityArg === "number") {
                noteVelocity = velocityArg;
              }

              scheduleTimeout(() => {
                playNote(pitchClassToPlay, durSec, noteVelocity);
                // schedule noteOff for waveform output
                scheduleTimeout(() => noteOff(pitchClassToPlay), durSec * 1000);
              }, cumulativeTimeSec * 1000);
            }

            cumulativeTimeSec += durSec;
            if (terminationCheck(windowStart, isTarget)) break;
          }
        }
      };

      if (ascending) {
        const ascendingIndexes = Array.from({ length: n }, (_, i) => i);
        playPattern(ascendingIndexes, (windowStart, isTarget) => windowStart === n - 1 && isTarget, velocity);
      } else {
        const descendingIndexes = Array.from({ length: n }, (_, i) => n - 1 - i);
        playPattern(descendingIndexes, (windowStart, isTarget) => windowStart === 0 && isTarget, velocity);
      }

      const cycleLength = parseFloat((cumulativeTimeSec / (beatSec * 4)).toFixed(2));

      const cycleDifference = Math.ceil(cycleLength) - cycleLength;

      const restTime = cycleDifference * (beatSec * 4) * 1000;

      const totalSeqMs = cumulativeTimeSec * 1000 + restTime;

      if (soundSettings.drone) {
        scheduleTimeout(() => {
          // stop drone oscillator if waveform
          if (soundSettings.outputMode === "waveform" && droneOscRef.current) {
            try {
              const d = droneOscRef.current;
              if (Array.isArray(d.oscillator)) d.oscillator.forEach((o) => o.stop()); else d.oscillator.stop();
            } catch (err) {
              console.warn("Error stopping drone oscillator:", err);
            }
            droneOscRef.current = null;
          } else {
            noteOff(shiftPitchClass(allPitchClasses, pitchClasses[0], -1));
          }
        }, totalSeqMs);
      }

      scheduleTimeout(() => {
        resolve();
      }, totalSeqMs);
    });
  }, [allPitchClasses, noteOff, noteOn, scheduleTimeout, selectedMaqam, selectedMaqamData, selectedPitchClasses, soundSettings.drone, soundSettings.selectedPattern, soundSettings.tempo]);


  const stopAllSounds = useCallback(function stopAllSounds() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    const FADEOUT_MS = 5;
    const audioCtx = audioCtxRef.current;
    const now = audioCtx ? audioCtx.currentTime : 0;
    for (const voices of activeNotesRef.current.values()) {
      voices.forEach(({ oscillator, gainNode }) => {
        if (audioCtx) {
          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.setValueAtTime(gainNode.gain.value, now);
          gainNode.gain.linearRampToValueAtTime(0, now + FADEOUT_MS / 1000);
        }
        if (Array.isArray(oscillator)) {
          oscillator.forEach((osc) => osc.stop(audioCtx ? now + FADEOUT_MS / 1000 : undefined));
        } else {
          oscillator.stop(audioCtx ? now + FADEOUT_MS / 1000 : undefined);
        }
      });
    }
    activeNotesRef.current.clear();

    // Stop drone oscillator if it's running
    if (droneOscRef.current) {
      try {
        if (Array.isArray(droneOscRef.current.oscillator)) {
          droneOscRef.current.oscillator.forEach((osc) => osc.stop(audioCtx ? now + FADEOUT_MS / 1000 : undefined));
        } else {
          droneOscRef.current.oscillator.stop(audioCtx ? now + FADEOUT_MS / 1000 : undefined);
        }
      } catch (err) {
        console.warn("Error stopping drone oscillator:", err);
      }
      droneOscRef.current = null;
    }

    // Send note off for all active MIDI notes
    if (soundSettings.useMPE) {
      // For MPE, send note off on each active channel
      const allocator = mpeChannelAllocatorRef.current;
      for (const [channel, noteInfo] of allocator.activeChannels.entries()) {
        sendMidiMessage([0x80 + channel, noteInfo.noteNumber, 0]);
      }
      // Reset MPE allocator
      allocator.activeChannels.clear();
      allocator.availableChannels = Array.from({ length: 14 }, (_, i) => i + 2);
    } else {
      // For non-MPE, send note off on channel 0
      midiActiveNotesRef.current.forEach((frequency) => {
        const note = Math.floor(frequencyToMidiNoteNumber(frequency));
        sendMidiMessage([0x80, note, 0]);
      });
    }
    midiActiveNotesRef.current.clear();

    setActivePitchClasses([]);
  }, [sendMidiMessage, soundSettings.useMPE]);

  const clearHangingNotes = useCallback(function clearHangingNotes() {
    // Fade out all active voices over 5ms before stopping oscillators
    const FADEOUT_MS = 5;
    const audioCtx = audioCtxRef.current;
    const now = audioCtx ? audioCtx.currentTime : 0;
    for (const voices of activeNotesRef.current.values()) {
      voices.forEach(({ oscillator, gainNode }) => {
        if (audioCtx) {
          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.setValueAtTime(gainNode.gain.value, now);
          gainNode.gain.linearRampToValueAtTime(0, now + FADEOUT_MS / 1000);
        }
        if (Array.isArray(oscillator)) {
          oscillator.forEach((osc) => osc.stop(audioCtx ? now + FADEOUT_MS / 1000 : undefined));
        } else {
          oscillator.stop(audioCtx ? now + FADEOUT_MS / 1000 : undefined);
        }
      });
    }
    activeNotesRef.current.clear();

    // Send note off for all active MIDI notes
    if (soundSettings.useMPE) {
      // For MPE, send note off on each active channel
      const allocator = mpeChannelAllocatorRef.current;
      for (const [channel, noteInfo] of allocator.activeChannels.entries()) {
        sendMidiMessage([0x80 + channel, noteInfo.noteNumber, 0]);
      }
      // Reset MPE allocator
      allocator.activeChannels.clear();
      allocator.availableChannels = Array.from({ length: 14 }, (_, i) => i + 2);
    } else {
      // For non-MPE, send note off on channel 0
      midiActiveNotesRef.current.forEach((frequency) => {
        const note = Math.floor(frequencyToMidiNoteNumber(frequency));
        sendMidiMessage([0x80, note, 0]);
      });
    }
    midiActiveNotesRef.current.clear();

    setActivePitchClasses([]);
  }, [sendMidiMessage, soundSettings.useMPE]);

  // Simple function to update ALL active notes using a new reference frequency
  const updateAllActiveNotesByReferenceFrequency = useCallback(function updateAllActiveNotesByReferenceFrequency(newReferenceFrequency: number) {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const TRANSITION_TIME = 0.005; // 5ms smooth transition

    // Update all Web Audio oscillators
    for (const [pitchClassFraction, voices] of activeNotesRef.current.entries()) {
      // Find the current pitch class for this fraction to get its decimal ratio
      const currentPitchClass = allPitchClasses.find((pc) => pc.fraction === pitchClassFraction);
      if (!currentPitchClass) continue;

      const newFrequency = newReferenceFrequency * parseFloat(currentPitchClass.decimalRatio);

      voices.forEach((voice) => {
        voice.frequency = newFrequency; // Update stored frequency

        if (Array.isArray(voice.oscillator)) {
          // Handle aperiodic waves (multiple oscillators)
          const waveform = soundSettings.waveform;
          if (APERIODIC_WAVES[waveform]) {
            const aw = APERIODIC_WAVES[waveform];
            const detunings = aw.detunings;

            voice.oscillator.forEach((osc, index) => {
              const detunedNewFreq = newFrequency * Math.pow(2, detunings[index] / 1200);
              try {
                osc.frequency.cancelScheduledValues(now);
                osc.frequency.setValueAtTime(osc.frequency.value, now);
                osc.frequency.linearRampToValueAtTime(detunedNewFreq, now + TRANSITION_TIME);
              } catch (e) {
                console.warn("Could not update oscillator frequency:", e);
              }
            });
          }
        } else {
          // Handle single oscillator (periodic waves)
          try {
            voice.oscillator.frequency.cancelScheduledValues(now);
            voice.oscillator.frequency.setValueAtTime(voice.oscillator.frequency.value, now);
            voice.oscillator.frequency.linearRampToValueAtTime(newFrequency, now + TRANSITION_TIME);
          } catch (e) {
            console.warn("Could not update oscillator frequency:", e);
          }
        }
      });
    }

    // Update MIDI notes
    if (soundSettings.outputMode === "midi") {
      for (const [pitchClassFraction, oldFrequency] of midiActiveNotesRef.current.entries()) {
        // Find the current pitch class for this fraction to get its decimal ratio
        const currentPitchClass = allPitchClasses.find((pc) => pc.fraction === pitchClassFraction);
        if (!currentPitchClass) continue;

        const newFrequency = newReferenceFrequency * parseFloat(currentPitchClass.decimalRatio);
        const oldMf = frequencyToMidiNoteNumber(oldFrequency);
        const newMf = frequencyToMidiNoteNumber(newFrequency);
        const oldNote = Math.floor(oldMf);
        const newNote = Math.floor(newMf);
        const newDetune = newMf - newNote;

        if (soundSettings.useMPE) {
          // Find the MPE channel for this pitch class
          const allocator = mpeChannelAllocatorRef.current;
          for (const [channel, noteInfo] of allocator.activeChannels.entries()) {
            if (noteInfo.pitchClassFraction === pitchClassFraction) {
              if (oldNote !== newNote) {
                sendMidiMessage([0x80 + channel, oldNote, 0]);
                sendPitchBend(newDetune, channel);
                sendMidiMessage([0x90 + channel, newNote, 127]);
                noteInfo.noteNumber = newNote;
              } else {
                sendPitchBend(newDetune, channel);
              }
              break;
            }
          }
        } else {
          if (oldNote !== newNote) {
            sendMidiMessage([0x80, oldNote, 0]);
            sendPitchBend(newDetune, 0);
            sendMidiMessage([0x90, newNote, 127]);
          } else {
            sendPitchBend(newDetune, 0);
          }
        }

        // Update the stored frequency for this pitch class
        midiActiveNotesRef.current.set(pitchClassFraction, newFrequency);
      }
    }
  }, [allPitchClasses, sendMidiMessage, sendPitchBend, soundSettings.outputMode, soundSettings.pitchBendRange, soundSettings.useMPE]);

  // Function to recalculate all active note frequencies to match their current pitch class frequencies
  const recalculateAllActiveNoteFrequencies = useCallback(function recalculateAllActiveNoteFrequencies() {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const TRANSITION_TIME = 0.005; // 5ms smooth transition

    // Update all Web Audio oscillators to their pitch class's current frequency
    for (const [pitchClassFraction, voices] of activeNotesRef.current.entries()) {
      // Find the current pitch class for this fraction in allPitchClasses (which has updated frequencies)
      const currentPitchClass = allPitchClasses.find((pc) => pc.fraction === pitchClassFraction);
      if (!currentPitchClass) continue;

      const targetFrequency = parseFloat(currentPitchClass.frequency);

      voices.forEach((voice) => {
        voice.frequency = targetFrequency; // Update stored frequency

        if (Array.isArray(voice.oscillator)) {
          // Handle aperiodic waves (multiple oscillators)
          const waveform = soundSettings.waveform;
          if (APERIODIC_WAVES[waveform]) {
            const aw = APERIODIC_WAVES[waveform];
            const detunings = aw.detunings;

            voice.oscillator.forEach((osc, index) => {
              const detunedTargetFreq = targetFrequency * Math.pow(2, detunings[index] / 1200);
              try {
                osc.frequency.cancelScheduledValues(now);
                osc.frequency.setValueAtTime(osc.frequency.value, now);
                osc.frequency.linearRampToValueAtTime(detunedTargetFreq, now + TRANSITION_TIME);
              } catch (e) {
                console.warn("Could not update oscillator frequency:", e);
              }
            });
          }
        } else {
          // Handle single oscillator (periodic waves)
          try {
            voice.oscillator.frequency.cancelScheduledValues(now);
            voice.oscillator.frequency.setValueAtTime(voice.oscillator.frequency.value, now);
            voice.oscillator.frequency.linearRampToValueAtTime(targetFrequency, now + TRANSITION_TIME);
          } catch (e) {
            console.warn("Could not update oscillator frequency:", e);
          }
        }
      });
    }

    // Update MIDI notes to their pitch class's current frequency
    if (soundSettings.outputMode === "midi") {
      for (const [pitchClassFraction, currentFreq] of midiActiveNotesRef.current.entries()) {
        // Find the current pitch class for this fraction in allPitchClasses (which has updated frequencies)
        const currentPitchClass = allPitchClasses.find((pc) => pc.fraction === pitchClassFraction);
        if (!currentPitchClass) continue;

        const targetFrequency = parseFloat(currentPitchClass.frequency);
        const oldMf = frequencyToMidiNoteNumber(currentFreq);
        const newMf = frequencyToMidiNoteNumber(targetFrequency);
        const oldNote = Math.floor(oldMf);
        const newNote = Math.floor(newMf);
        const newDetune = newMf - newNote;

        if (soundSettings.useMPE) {
          // Find the MPE channel for this pitch class
          const allocator = mpeChannelAllocatorRef.current;
          for (const [channel, noteInfo] of allocator.activeChannels.entries()) {
            if (noteInfo.pitchClassFraction === pitchClassFraction) {
              if (oldNote !== newNote) {
                sendMidiMessage([0x80 + channel, oldNote, 0]);
                sendPitchBend(newDetune, channel);
                sendMidiMessage([0x90 + channel, newNote, 127]);
                noteInfo.noteNumber = newNote;
              } else {
                sendPitchBend(newDetune, channel);
              }
              break;
            }
          }
        } else {
          if (oldNote !== newNote) {
            sendMidiMessage([0x80, oldNote, 0]);
            sendPitchBend(newDetune, 0);
            sendMidiMessage([0x90, newNote, 127]);
          } else {
            sendPitchBend(newDetune, 0);
          }
        }

        // Update the stored frequency for this pitch class
        midiActiveNotesRef.current.set(pitchClassFraction, targetFrequency);
      }
    }
  }, [allPitchClasses, sendMidiMessage, sendPitchBend, soundSettings.outputMode, soundSettings.useMPE]);

  const contextValue = useMemo(() => ({
    playNote,
    soundSettings,
    setSoundSettings,
    activePitchClasses,
    setActivePitchClasses,
    playSequence,
    noteOn,
    noteOff,
    midiInputs,
    midiOutputs,
    setRefresh,
    clearHangingNotes,
    stopAllSounds,
    keyToPitchClassMapping,
    pitchClassToKeyMapping,
    midiToPitchClassMapping,
    pitchClassToMidiMapping,
    pitchClassToBlackOrWhite,
    updateAllActiveNotesByReferenceFrequency,
    recalculateAllActiveNoteFrequencies,
  }), [
    playNote,
    soundSettings,
    activePitchClasses,
    playSequence,
    noteOn,
    noteOff,
    midiInputs,
    midiOutputs,
    clearHangingNotes,
    stopAllSounds,
    keyToPitchClassMapping,
    pitchClassToKeyMapping,
    midiToPitchClassMapping,
    pitchClassToMidiMapping,
    pitchClassToBlackOrWhite,
    updateAllActiveNotesByReferenceFrequency,
    recalculateAllActiveNoteFrequencies,
  ]);

  return (
  <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
}

export default function useSoundContext() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSoundContext must be used within an SoundContextProvider");
  }
  return context;
}
