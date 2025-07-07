"use client";

import useAppContext from "./app-context";
import React, { createContext, useState, useEffect, useRef, useContext } from "react";
import { frequencyToMidiNoteNumber } from "@/functions/convertPitchClass";
import midiNumberToNoteName from "@/functions/midiToNoteNumber";
import Pattern from "@/models/Pattern";
import romanToNumber from "@/functions/romanToNumber";
import PitchClass from "@/models/PitchClass";
import { initializeCustomWaves, PERIODIC_WAVES, APERIODIC_WAVES } from "@/audio/waves";
import shiftPitchClass from "@/functions/shiftPitchClass";
type InputMode = "tuningSystem" | "selection";
type OutputMode = "mute" | "waveform" | "midi";

// ---- Global velocity defaults ----
export const defaultNoteVelocity = 70;
export const defaultTargetVelocity = 90;
export const defaultDroneVelocity = 30;

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
  playSequence: (pitchClasses: PitchClass[], ascending?: boolean, velocity?: number | ((noteIdx: number, patternIdx: number) => number)) => Promise<void>;
  noteOn: (pitchClass: PitchClass, velocity?: number) => void;
  noteOff: (pitchClass: PitchClass) => void;
  midiInputs: MidiPortInfo[];
  midiOutputs: MidiPortInfo[];
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  clearHangingNotes: () => void;
  stopAllSounds: () => void;
}

const SoundContext = createContext<SoundContextInterface | null>(null);

export function SoundContextProvider({ children }: { children: React.ReactNode }) {
  const { selectedTuningSystem, selectedMaqamDetails, selectedJinsDetails, tuningSystemPitchClasses, allPitchClasses, selectedPitchClasses } = useAppContext();

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
  });

  // Union type: oscillator can be OscillatorNode or OscillatorNode[]
  const activeNotesRef = useRef<Map<number, { oscillator: OscillatorNode | OscillatorNode[]; gainNode: GainNode }[]>>(new Map());
  const timeoutsRef = useRef<number[]>([]);
  const midiActiveNotesRef = useRef<Set<number>>(new Set());

  const [activePitchClasses, setActivePitchClasses] = useState<PitchClass[]>([]);

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

  function scheduleTimeout(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }

  useEffect(() => {
    const AudioContext = window.AudioContext;
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = soundSettings.volume;
    masterGain.connect(audioCtx.destination);
    masterGainRef.current = masterGain;

    // ← initialize *all* periodic & aperiodic waves here
    initializeCustomWaves(audioCtx);
  }, []);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(soundSettings.volume, audioCtxRef.current!.currentTime);
    }
  }, [soundSettings.volume]);

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
  }, [
    midiInputs,
    selectedTuningSystem,
    selectedMaqamDetails,
    selectedJinsDetails,
    tuningSystemPitchClasses,
    soundSettings.inputMode,
    soundSettings.inputType,
    soundSettings.outputMode,
    soundSettings.selectedMidiInputId,
    soundSettings.selectedMidiOutputId,
    soundSettings.waveform,
    soundSettings.attack,
    soundSettings.decay,
    soundSettings.sustain,
    soundSettings.release,
  ]);

  useEffect(() => {
    return () => {
      clearHangingNotes();
    };
  }, []);

  const handleMidiInput: NonNullable<MIDIInput["onmidimessage"]> = function (this: MIDIInput, ev: MIDIMessageEvent) {
    // Ignore MIDI messages unless inputType is "MIDI"
    if (soundSettings.inputType !== "MIDI") return;
    // only from our selected port
    if (this.id !== soundSettings.selectedMidiInputId) return;

    const data = ev.data;
    if (!data) return; // safety
    const [status, noteNumber, velocity] = data;
    const cmd = status & 0xf0;

    if (soundSettings.inputMode === "tuningSystem" && selectedTuningSystem) {
      const pitchClasses = allPitchClasses;

      const MIDI_BASE = 55;
      const numberOfCellsPerRow = selectedTuningSystem.getPitchClasses().length;

      const idx = noteNumber + numberOfCellsPerRow - MIDI_BASE;

      if (idx < 0 || idx >= pitchClasses.length) return;

      const pitchClass = pitchClasses[idx];

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
    } else if (soundSettings.inputMode === "selection") {
      const { note, alt } = midiNumberToNoteName(noteNumber);

      for (const pitchClass of selectedPitchClasses) {
        let convertedEnglishName = pitchClass.englishName;
        convertedEnglishName = convertedEnglishName[0].toUpperCase() + convertedEnglishName.slice(1);
        if (convertedEnglishName.includes("-")) convertedEnglishName = convertedEnglishName[0];

        if (convertedEnglishName === note || convertedEnglishName === alt) {
          const baseFreq = parseFloat(pitchClass.frequency);
          if (isNaN(baseFreq)) return;

          const baseMidi = Math.round(frequencyToMidiNoteNumber(baseFreq));
          // how many octaves to shift (positive => up, negative => down)
          const octaveShift = Math.round((noteNumber - baseMidi) / 12);

          const adjPitchClass = shiftPitchClass(allPitchClasses, pitchClass, octaveShift);
          // adjust frequency by 2^octaveShift

          if (cmd === 0x90 && velocity > 0) {
            noteOn(adjPitchClass, velocity);
            setActivePitchClasses((prev) => {
              if (prev.some((c) => c.index === pitchClass.index && c.octave === pitchClass.octave)) return prev;
              return [...prev, pitchClass];
            });
          } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
            noteOff(adjPitchClass);
            setActivePitchClasses((prev) => prev.filter((c) => !(c.index === pitchClass.index && c.octave === pitchClass.octave)));
          }

          break;
        }
      }
    }
  };

  const playNote = (pitchClass: PitchClass, givenDuration: number = soundSettings.duration, velocity?: number) => {
    noteOn(pitchClass, velocity);
    // Schedule noteOff after the given duration
    scheduleTimeout(() => {
      noteOff(pitchClass);
    }, givenDuration * 1000);
  };

  const playSequence = (pitchClasses: PitchClass[], ascending = true, velocity?: number | ((noteIdx: number, patternIdx: number) => number)): Promise<void> => {
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

      let sliceIndex = 0;
      const lastAscendingPitchClass = pitchClasses[pitchClasses.length - 1];

      for (let i = 0; i < pitchClasses.length; i++) {
        if (parseFloat(pitchClasses[i].frequency) * 2 <= parseFloat(lastAscendingPitchClass.frequency)) {
          sliceIndex = i + 1;
        }
      }

      const extendedPitchClasses = [...pitchClasses, ...pitchClasses.slice(sliceIndex, -1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1))];

      const n = pitchClasses.length;
      let cumulativeTimeSec = 0;

      if (soundSettings.drone) {
        noteOn(shiftPitchClass(allPitchClasses, pitchClasses[0], -1), defaultDroneVelocity);
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
              const deg = romanToNumber(scaleDegree);
              let pitchClassToPlay = extendedPitchClasses[windowStart + deg - 1];
              if (scaleDegree.startsWith("-")) {
                // negative degree, e.g. "-II" → play the previous octave
                pitchClassToPlay = shiftPitchClass(allPitchClasses, pitchClassToPlay, -1);
              } else if (scaleDegree.startsWith("+")) {
                // positive degree, e.g. "+II" → play the next octave
                pitchClassToPlay = shiftPitchClass(allPitchClasses, pitchClassToPlay, 1);
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
          noteOff(shiftPitchClass(allPitchClasses, pitchClasses[0], -1));
        }, totalSeqMs);
      }

      scheduleTimeout(() => {
        resolve();
      }, totalSeqMs);
    });
  };

  function noteOn(pitchClass: PitchClass, midiVelocity: number = defaultNoteVelocity) {
    setActivePitchClasses((prev) => {
      if (prev.some((c) => c.frequency === pitchClass.frequency)) return prev;
      return [...prev, pitchClass];
    });
    const frequency = parseFloat(pitchClass.frequency);
    if (soundSettings.outputMode === "mute") return;

    // Use a quadratic velocity curve for more expressive dynamics
    const velocityNorm = Math.max(0, Math.min(1, midiVelocity / 127));
    const velocityCurve = velocityNorm * velocityNorm;

    if (soundSettings.outputMode === "midi") {
      const mf = frequencyToMidiNoteNumber(frequency);
      const note = Math.floor(mf);
      const detune = mf - note;

      sendPitchBend(detune);
      // For MIDI, pass velocity directly (scaled by volume if desired)
      const vel = Math.round(velocityNorm * soundSettings.volume * 127);
      sendMidiMessage([0x90, note, vel]);
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
    // const polyScale = 1 / Math.sqrt(upcomingCount);
    const polyScale = (1 / Math.sqrt(upcomingCount)) * velocityCurve;

    // Handle aperiodic waves
    if (APERIODIC_WAVES[waveform]) {
      const aw = APERIODIC_WAVES[waveform];
      const pws = aw.periodicWaves;
      const dets = aw.detunings;

      const merger = audioCtx.createGain(); // to sum the oscillators
      const oscs: OscillatorNode[] = [];

      for (let i = 0; i < pws.length; i++) {
        const oscNode = audioCtx.createOscillator();
        oscNode.setPeriodicWave(pws[i]);
        const detunedFreq = frequency * Math.pow(2, dets[i] / 1200);
        oscNode.frequency.setValueAtTime(detunedFreq, startTime);
        oscNode.connect(merger);
        oscs.push(oscNode);
      }

      // Use square‑root compensation so perceived loudness matches periodic waves
      // (≈ -3 dB when five oscillators are active instead of −14 dB).
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

      const prev = activeNotesRef.current.get(frequency) || [];
      // Store the entire array of oscillators for this note
      prev.push({ oscillator: oscs, gainNode });
      activeNotesRef.current.set(frequency, prev);

      // Start oscillators only (do not stop here)
      oscs.forEach((osc) => osc.start(startTime));
      return;
    }

    // periodic
    const osc = audioCtx.createOscillator();
    // Utility to create 0-phase (cosine) PeriodicWave
    function createZeroPhasePeriodicWave(type: string, ctx: AudioContext) {
      let real, imag, N;
      if (type === "sine") {
        real = new Float32Array(2);
        imag = new Float32Array(2);
        real[0] = 0;
        real[1] = 1;
        imag[0] = 0;
        imag[1] = 0;
        return ctx.createPeriodicWave(real, imag, {
          disableNormalization: false,
        });
      } else if (type === "triangle") {
        N = 32; // number of harmonics
        real = new Float32Array(N);
        imag = new Float32Array(N);
        real[0] = 0;
        for (let n = 1; n < N; n++) {
          if (n % 2 === 1) {
            // Only odd harmonics
            real[n] = (8 / (Math.PI * Math.PI)) * (1 / (n * n)) * (n % 4 === 1 ? 1 : -1);
            imag[n] = 0;
          }
        }
        return ctx.createPeriodicWave(real, imag, {
          disableNormalization: false,
        });
      } else if (type === "square") {
        N = 32;
        real = new Float32Array(N);
        imag = new Float32Array(N);
        real[0] = 0;
        for (let n = 1; n < N; n++) {
          if (n % 2 === 1) {
            real[n] = 4 / (Math.PI * n);
            imag[n] = 0;
          }
        }
        return ctx.createPeriodicWave(real, imag, {
          disableNormalization: false,
        });
      } else if (type === "sawtooth") {
        N = 32;
        real = new Float32Array(N);
        imag = new Float32Array(N);
        real[0] = 0;
        for (let n = 1; n < N; n++) {
          real[n] = (2 / (Math.PI * n)) * (n % 2 === 0 ? 0 : 1) * (type === "sawtooth" ? 1 : 0);
          // For sawtooth, all harmonics, but this keeps only odd for square
          if (type === "sawtooth") real[n] = 2 / (Math.PI * n);
          imag[n] = 0;
        }
        return ctx.createPeriodicWave(real, imag, {
          disableNormalization: false,
        });
      }
      return null;
    }

    let customWave: PeriodicWave | null = null;
    if (["sine", "triangle", "square", "sawtooth"].includes(waveform)) {
      customWave = createZeroPhasePeriodicWave(waveform, audioCtx);
      if (customWave) {
        osc.setPeriodicWave(customWave);
      } else {
        osc.type = waveform as OscillatorType;
      }
    } else if (PERIODIC_WAVES[waveform]) {
      osc.setPeriodicWave(PERIODIC_WAVES[waveform]);
    } else {
      osc.type = waveform as OscillatorType;
    }
    osc.frequency.setValueAtTime(frequency, startTime);
    const source: AudioNode = osc;

    const gainNode = audioCtx.createGain();
    const peakLevel = polyScale;
    const sustainLevel = sustain * polyScale;
    const attackEndTime = startTime + attack;
    const decayEndTime = attackEndTime + decay;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peakLevel, attackEndTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, decayEndTime);

    source.connect(gainNode).connect(masterGain);
    osc.start(startTime);

    const prev = activeNotesRef.current.get(frequency) || [];
    prev.push({ oscillator: osc, gainNode });
    activeNotesRef.current.set(frequency, prev);
  }

  function noteOff(pitchClass: PitchClass) {
    setActivePitchClasses((prev) => prev.filter((c) => !(c.frequency === pitchClass.frequency)));
    const frequency = parseFloat(pitchClass.frequency);

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
    // If the voice was created with aperiodic oscillators (multiple), stop them all
    if (Array.isArray(voice.oscillator)) {
      voice.oscillator.forEach((osc) => osc.stop(now + release));
    } else {
      voice.oscillator.stop(now + release);
    }

    activeNotesRef.current.set(frequency, queue);
  }

  function stopAllSounds() {
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

    midiActiveNotesRef.current.forEach((note) => sendMidiMessage([0x80, note, 0]));
    midiActiveNotesRef.current.clear();

    setActivePitchClasses([]);
  }

  function clearHangingNotes() {
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

    midiActiveNotesRef.current.forEach((note) => sendMidiMessage([0x80, note, 0]));
    midiActiveNotesRef.current.clear();

    setActivePitchClasses([]);
  }

  return (
    <SoundContext.Provider
      value={{
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
      }}
    >
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
