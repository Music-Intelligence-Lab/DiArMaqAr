"use client";

import useAppContext from "./app-context";
import React, { createContext, useState, useEffect, useRef, useContext } from "react";
import { frequencyToMidiNoteNumber } from "@/functions/convertPitchClass";
import midiNumberToNoteName from "@/functions/midiToNoteNumber";
import Pattern from "@/models/Pattern";
import romanToNumber from "@/functions/romanToNumber";
import PitchClass from "@/models/PitchClass";
import { initializeCustomWaves, PERIODIC_WAVES, APERIODIC_WAVES } from "@/audio/waves";
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
  inputType: "QWERTY" | "MIDI";
  inputMode: InputMode;
  selectedMidiInputId: string | null;
  outputMode: OutputMode;
  selectedMidiOutputId: string | null;
  selectedPattern: Pattern | null;
}

interface MidiPortInfo {
  id: string;
  name: string;
}

interface SoundContextInterface {
  playNoteFrequency: (frequency: number, duration?: number) => void;
  soundSettings: SoundSettings;
  setSoundSettings: React.Dispatch<React.SetStateAction<SoundSettings>>;
  activePitchClasses: PitchClass[];
  setActivePitchClasses: React.Dispatch<React.SetStateAction<PitchClass[]>>;
  playSequence: (frequencies: number[], ascending?: boolean) => Promise<void>;
  noteOn: (frequency: number) => void;
  noteOff: (frequency: number) => void;
  midiInputs: MidiPortInfo[];
  midiOutputs: MidiPortInfo[];
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  stopAll: () => void;
}

const SoundContext = createContext<SoundContextInterface | null>(null);

export function SoundContextProvider({ children }: { children: React.ReactNode }) {
  const { selectedTuningSystem, selectedMaqamDetails, selectedJinsDetails, tuningSystemPitchClasses, allPitchClasses, selectedPitchClasses } = useAppContext();

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
    inputType: "QWERTY",
    inputMode: "selection",
    selectedMidiInputId: null,
    outputMode: "waveform",
    selectedMidiOutputId: null,
    selectedPattern: null,
  });

  const activeNotesRef = useRef<Map<number, { oscillator: OscillatorNode; gainNode: GainNode }[]>>(new Map());
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
    soundSettings.outputMode,
    soundSettings.selectedMidiInputId,
    soundSettings.selectedMidiOutputId,
  ]);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  const handleMidiInput: NonNullable<MIDIInput["onmidimessage"]> = function (this: MIDIInput, ev: MIDIMessageEvent) {
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

      // grab the frequency from your cell‐detail helper
      const freqStr = pitchClass.frequency;
      const freq = parseFloat(freqStr);
      if (isNaN(freq)) return;

      // ——— dispatch sound ———
      if (cmd === 0x90 && velocity > 0) {
        noteOn(freq);
        setActivePitchClasses((prev) => {
          if (prev.some((c) => c.index === pitchClass.index && c.octave === pitchClass.octave)) return prev;
          return [...prev, pitchClass];
        });
      } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
        noteOff(freq);
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
          // adjust frequency by 2^octaveShift
          const adjFreq = baseFreq * Math.pow(2, octaveShift);

          if (cmd === 0x90 && velocity > 0) {
            noteOn(adjFreq);
            setActivePitchClasses((prev) => {
              if (prev.some((c) => c.index === pitchClass.index && c.octave === pitchClass.octave)) return prev;
              return [...prev, pitchClass];
            });
          } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
            noteOff(adjFreq);
            setActivePitchClasses((prev) => prev.filter((c) => !(c.index === pitchClass.index && c.octave === pitchClass.octave)));
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
      const mf = frequencyToMidiNoteNumber(frequency);
      const note = Math.floor(mf);
      const detune = mf - note;
      sendPitchBend(detune);
      const vel = Math.round(soundSettings.volume * 127);
      sendMidiMessage([0x90, note, vel]);
      midiActiveNotesRef.current.add(note);
      scheduleTimeout(() => {
        sendMidiMessage([0x80, note, 0]);
        midiActiveNotesRef.current.delete(note);
      }, givenDuration * 1000);
      return;
    }

    // 3) Waveform
    if (!audioCtxRef.current || !masterGainRef.current) return;
    if (isNaN(frequency) || frequency <= 0) return;

    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    const startTime = audioCtx.currentTime;
    const { attack, decay, sustain, release, waveform } = soundSettings;

    //–– pick source node based on waveform string ––
    let source: AudioNode;
    let osc: OscillatorNode | null = null;

// A) aperiodic
if (APERIODIC_WAVES[waveform]) {
  const aw = APERIODIC_WAVES[waveform];
  const pws = aw.periodicWaves;
  const dets = aw.detunings;

  const merger = audioCtx.createGain(); // to sum the oscillators
  const oscs: OscillatorNode[] = [];

  for (let i = 0; i < pws.length; i++) {
    const oscNode = audioCtx.createOscillator();
    oscNode.setPeriodicWave(pws[i]);
    // detune and align
    const detunedFreq = frequency * Math.pow(2, dets[i] / 1200);
    oscNode.frequency.setValueAtTime(detunedFreq, startTime);
    oscNode.connect(merger);
    oscs.push(oscNode);
  }

  // Normalize the volume
  merger.gain.setValueAtTime(1 / pws.length, startTime); // average the total gain
  source = merger;

  // Start/stop all oscillators together, do not assign to osc to avoid duplicate start()
  oscs.forEach((o) => {
    o.start(startTime);
    o.stop(startTime + givenDuration);
  });

  osc = null; // prevent double-start below
}

// B) periodic
    else if (PERIODIC_WAVES[waveform]) {
      osc = audioCtx.createOscillator();
      osc.setPeriodicWave(PERIODIC_WAVES[waveform]);
      osc.frequency.setValueAtTime(frequency, startTime);
      source = osc;
    }
    // C) built-in
    else {
      osc = audioCtx.createOscillator();
      osc.type = waveform as OscillatorType;
      osc.frequency.setValueAtTime(frequency, startTime);
      source = osc;
    }

    //–– apply ADSR envelope ––
    const gainNode = audioCtx.createGain();
    // attack → decay → sustain
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(1, startTime + attack);
    gainNode.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
    // schedule release
    const noteOffTime = startTime + givenDuration;
    const releaseStart = noteOffTime - release;
    gainNode.gain.setValueAtTime(sustain, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0, noteOffTime);

    //–– connect & play ––
    source.connect(gainNode).connect(masterGain);
    if (osc) {
      osc.start(startTime);
      osc.stop(noteOffTime);
      osc.onended = () => {
        // Clean up references if needed in the future
      };
    }
  };

  const playSequence = (frequencies: number[], ascending = true): Promise<void> => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const selectedPattern = soundSettings.selectedPattern || new Pattern("Default", "Default", [{ scaleDegree: "I", noteDuration: "4", isTarget: true }]);

    return new Promise((resolve) => {
      const beatSec = 60 / soundSettings.tempo;

      const patternNotes = selectedPattern.getNotes();
      const maxDegree = Math.max(...patternNotes.map((n) => (n.scaleDegree === "0" ? 0 : romanToNumber(n.scaleDegree))));

      if (frequencies.length < maxDegree) {
        const totalTimeMs = frequencies.length * beatSec * 1000;

        frequencies.forEach((freq, i) => {
          scheduleTimeout(() => {
            playNoteFrequency(freq);
          }, i * beatSec * 1000);
        });

        scheduleTimeout(() => {
          resolve();
        }, totalTimeMs);

        return;
      }

      const extendedFrequencies = [...frequencies, ...frequencies.map((f) => f * 2).slice(1, maxDegree)];

      const n = frequencies.length;
      let cumulativeTimeSec = 0;

      const playPattern = (windowStartIndexes: number[], terminationCheck: (windowStart: number, isTarget: boolean) => boolean) => {
        for (const windowStart of windowStartIndexes) {
          for (const { scaleDegree, noteDuration, isTarget } of patternNotes) {
            // compute note length in seconds:
            //   base = (4 ÷ numeric part of noteDuration), e.g. "4" → whole note
            //   mod  = 1 (normal), 1.5 (dotted), 2/3 (triplet)
            const base = 4 / Number(noteDuration.replace(/\D/g, ""));
            const mod = noteDuration.endsWith("d") ? 1.5 : noteDuration.endsWith("t") ? 2 / 3 : 1;
            const durSec = base * mod * beatSec;

            if (scaleDegree !== "R") {
              const deg = romanToNumber(scaleDegree);
              let freqToPlay = extendedFrequencies[windowStart + deg - 1];
              if (scaleDegree.startsWith("-")) {
                // negative degree, e.g. "-II" → play the previous octave
                freqToPlay /= 2;
              } else if (scaleDegree.startsWith("+")) {
                // positive degree, e.g. "+II" → play the next octave
                freqToPlay *= 2;
              }

              scheduleTimeout(() => {
                playNoteFrequency(freqToPlay, durSec);
              }, cumulativeTimeSec * 1000);
            }

            cumulativeTimeSec += durSec;
            if (terminationCheck(windowStart, isTarget)) break;
          }
        }
      };

      if (ascending) {
        const ascendingIndexes = Array.from({ length: n }, (_, i) => i);
        playPattern(ascendingIndexes, (windowStart, isTarget) => windowStart === frequencies.length - 1 && isTarget);
      } else {
        const descendingIndexes = Array.from({ length: n }, (_, i) => n - 1 - i);
        playPattern(descendingIndexes, (windowStart, isTarget) => windowStart === 0 && isTarget);
      }

      const cycleLength = parseFloat((cumulativeTimeSec / (beatSec * 4)).toFixed(2));

      const cycleDifference = Math.ceil(cycleLength) - cycleLength;

      const restTime = cycleDifference * (beatSec * 4) * 1000;

      const totalSeqMs = cumulativeTimeSec * 1000 + restTime;

      scheduleTimeout(() => {
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

  function stopAll() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    for (const voices of activeNotesRef.current.values()) {
      voices.forEach(({ oscillator }) => oscillator.stop());
    }
    activeNotesRef.current.clear();

    midiActiveNotesRef.current.forEach((note) => sendMidiMessage([0x80, note, 0]));
    midiActiveNotesRef.current.clear();

    setActivePitchClasses([]);
  }

  return (
    <SoundContext.Provider
      value={{
        playNoteFrequency,
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
        stopAll,
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
