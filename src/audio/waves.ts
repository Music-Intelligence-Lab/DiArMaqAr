// Classic variants are from Scale Workshop 2, they're softer on SW3.

import { AperiodicWave } from "sw-synth";
import { centsToValue, sum, valueToCents } from "xen-dev-utils";
import { ceilPow2 } from "./utils";

import TIMBRES from "./timbres.json";

type Spectrum = number[];
type Timbre = { spectrum: Spectrum; amplitudes: number[]; source?: string };

type Timbres = {
  plainSpectra: { [key: string]: Spectrum };
  timbres: { [key: string]: Timbre };
};

function getPlainSpectrum(id: string): Spectrum {
  return (TIMBRES as unknown as Timbres).plainSpectra[id];
}

function getPlainSpectraWaveformNames(): string[] {
  return Object.keys((TIMBRES as unknown as Timbres).plainSpectra).sort();
}

function getTimbre(id: string): Timbre {
  return (TIMBRES as unknown as Timbres).timbres[id];
}

function getTimbreWaveformNames(): string[] {
  return Object.keys((TIMBRES as unknown as Timbres).timbres).sort();
}

export const BASIC_WAVEFORMS = ["sine", "square", "sawtooth", "triangle"];
export const CUSTOM_WAVEFORMS = [
  "warm1",
  "warm2",
  "warm3",
  "warm4",
  "octaver",
  "brightness",
  "harmonicbell",
  "semisine",
  "rich",
  "slender",
  "didacus",
  "bohlen",
  "glass",
  "boethius",
  "gold",
  "rich-classic",
  "slender-classic",
  "didacus-classic",
  "bohlen-classic",
  "glass-classic",
  "boethius-classic",
];
export const WAVEFORMS = BASIC_WAVEFORMS.concat(CUSTOM_WAVEFORMS);
export const PERIODIC_WAVES: Record<string, PeriodicWave> = {};

// Some of these have entries in timbres.json, but we preserve the old UI order.
export const APERIODIC_WAVEFORMS = ["jegogan", "jublag", "ugal", "gender", "piano", "tin", "bronze", "steel", "silver", "platinum", "12-TET"].concat(getPlainSpectraWaveformNames());
export const APERIODIC_WAVES: Record<string, AperiodicWave> = {};

export function initializePeriodic(audioContext: BaseAudioContext) {
  // 1) Build your subgroup arrays immediately
  const zeros = new Float32Array(101);
  const subgroupWaveforms = (() => {
    const rich = new Float32Array(101);
    const richClassic = new Float32Array(101);
    const slender = new Float32Array(101);
    const slenderClassic = new Float32Array(101);
    const didacus = new Float32Array(101);
    const didacusClassic = new Float32Array(101);
    const bohlen = new Float32Array(101);
    const bohlenClassic = new Float32Array(101);
    const glass = new Float32Array(101);
    const glassClassic = new Float32Array(101);
    const boethius = new Float32Array(101);
    const boethiusClassic = new Float32Array(101);

    const lowPrimeHarmonics = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 20, 21, 22, 24, 25, 27, 28, 30, 32, 33, 35, 36, 38, 40, 42, 44, 45, 48, 49, 50, 54, 55, 56, 57, 60, 63, 64, 66, 70, 72, 75, 76, 77, 80,
      81, 84, 88, 90, 95, 96, 98, 99, 100,
    ];

    for (const n of lowPrimeHarmonics) {
      const m = 1 / n;
      const p = n ** -1.5;
      if (n % 11 && n % 19) {
        if (n % 7) {
          richClassic[n] = m;
          rich[n] = p;
        }
        if (n % 5) {
          slenderClassic[n] = m;
          slender[n] = p;
        }
        if (n % 3) {
          didacusClassic[n] = m;
          didacus[n] = p;
        }
        if (n % 2) {
          bohlenClassic[n] = m;
          bohlen[n] = p;
        }
      }
      if (n % 3 && n % 5 && n % 19) {
        if (n % 7 && n % 11) {
          glassClassic[n] = m;
          glass[n] = p;
        } else {
          glassClassic[n] = 2 * m;
          glass[n] = 2 * p;
        }
      }
      if (n % 5 && n % 7 && n % 11) {
        if (n % 19) {
          boethiusClassic[n] = m;
          boethius[n] = p;
        } else {
          boethiusClassic[n] = 2 * m;
          boethius[n] = 2 * p;
        }
      }
    }

    return {
      richClassic,
      rich,
      slenderClassic,
      slender,
      didacusClassic,
      didacus,
      bohlenClassic,
      bohlen,
      glassClassic,
      glass,
      boethiusClassic,
      boethius,
    };
  })();

  // 2) Basic custom waves
  PERIODIC_WAVES.warm1 = audioContext.createPeriodicWave(new Float32Array([0, 10, 2, 2, 2, 1, 1, 0.5]), new Float32Array(8));
  PERIODIC_WAVES.warm2 = audioContext.createPeriodicWave(new Float32Array([0, 10, 5, 3.33, 2, 1]), new Float32Array(6));
  PERIODIC_WAVES.warm3 = audioContext.createPeriodicWave(new Float32Array([0, 10, 5, 5, 3]), new Float32Array(5));
  PERIODIC_WAVES.warm4 = audioContext.createPeriodicWave(new Float32Array([0, 10, 2, 2, 1]), new Float32Array(5));
  PERIODIC_WAVES.octaver = audioContext.createPeriodicWave(new Float32Array([0, 1000, 500, 0, 333, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 166]), new Float32Array(17));
  PERIODIC_WAVES.brightness = audioContext.createPeriodicWave(new Float32Array([0, 10, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 0.75, 0.5, 0.2, 0.1]), new Float32Array(22));
  PERIODIC_WAVES.harmonicbell = audioContext.createPeriodicWave(new Float32Array([0, 10, 2, 2, 2, 2, 0, 0, 0, 0, 0, 7]), new Float32Array(12));

  // 3) Semisine
  {
    const sines = new Float32Array(64);
    const coses = new Float32Array(64);
    for (let n = 1; n < 64; ++n) coses[n] = 1 / (1 - 4 * n * n);
    PERIODIC_WAVES.semisine = audioContext.createPeriodicWave(coses, sines);
  }

  // 4) Gold
  {
    const gold = new Float32Array(101);
    for (let n = 1; n <= 10; ++n) gold[n * n] = n ** -0.75;
    PERIODIC_WAVES.gold = audioContext.createPeriodicWave(zeros, gold);
  }

  // 5) Subgroup “classics” & modern
  PERIODIC_WAVES["rich-classic"] = audioContext.createPeriodicWave(zeros, subgroupWaveforms.richClassic);
  PERIODIC_WAVES.rich = audioContext.createPeriodicWave(zeros, subgroupWaveforms.rich);
  PERIODIC_WAVES["slender-classic"] = audioContext.createPeriodicWave(zeros, subgroupWaveforms.slenderClassic);
  PERIODIC_WAVES.slender = audioContext.createPeriodicWave(zeros, subgroupWaveforms.slender);
  PERIODIC_WAVES["didacus-classic"] = audioContext.createPeriodicWave(zeros, subgroupWaveforms.didacusClassic);
  PERIODIC_WAVES.didacus = audioContext.createPeriodicWave(zeros, subgroupWaveforms.didacus);
  PERIODIC_WAVES["bohlen-classic"] = audioContext.createPeriodicWave(zeros, subgroupWaveforms.bohlenClassic);
  PERIODIC_WAVES.bohlen = audioContext.createPeriodicWave(zeros, subgroupWaveforms.bohlen);
  PERIODIC_WAVES["glass-classic"] = audioContext.createPeriodicWave(zeros, subgroupWaveforms.glassClassic);
  PERIODIC_WAVES.glass = audioContext.createPeriodicWave(zeros, subgroupWaveforms.glass);
  PERIODIC_WAVES["boethius-classic"] = audioContext.createPeriodicWave(zeros, subgroupWaveforms.boethiusClassic);
  PERIODIC_WAVES.boethius = audioContext.createPeriodicWave(zeros, subgroupWaveforms.boethius);
}

function initializeAperiodic(audioContext: BaseAudioContext) {
  const ns = [...Array(129).keys()];
  ns.shift();
  let amplitudes = ns.map((n) => 0.3 * n ** -1.5);
  const maxNumberOfVoices = 7;
  const tolerance = 0.1; // In cents
  APERIODIC_WAVES["tin"] = new AperiodicWave(
    audioContext,
    ns.map((n) => n ** (8 / 9)),
    amplitudes,
    maxNumberOfVoices,
    tolerance
  );

  APERIODIC_WAVES["steel"] = new AperiodicWave(
    audioContext,
    ns.map((n) => n ** 1.5),
    amplitudes,
    maxNumberOfVoices,
    tolerance
  );

  APERIODIC_WAVES["bronze"] = new AperiodicWave(
    audioContext,
    ns.map((n) => n ** (4 / 3)),
    amplitudes,
    maxNumberOfVoices,
    tolerance
  );

  APERIODIC_WAVES["silver"] = new AperiodicWave(
    audioContext,
    ns.map((n) => n ** (5 / 3)),
    amplitudes,
    maxNumberOfVoices,
    tolerance
  );

  APERIODIC_WAVES["platinum"] = new AperiodicWave(
    audioContext,
    ns.slice(0, 32).map((n) => n ** 2.5),
    amplitudes.slice(0, 32),
    maxNumberOfVoices,
    tolerance
  );

  const spectrum_ = [1, 2.26, 3.358, 3.973, 7.365, 13, 29, 31, 37];
  const amplitudes_ = [1, 0.6, 0.3, 0.4, 0.2, 0.05, 0.04, 0.01, 0.006].map((a) => 0.4 * a);

  // Add shimmer
  const spectrum: number[] = [];
  amplitudes = [];
  for (let i = 0; i < spectrum_.length; ++i) {
    spectrum.push(spectrum_[i] * 1.004);
    spectrum.push(spectrum_[i] / 1.004);
    amplitudes.push(amplitudes_[i]);
    amplitudes.push(0.6 * amplitudes_[i]);
  }

  APERIODIC_WAVES["gender"] = new AperiodicWave(audioContext, spectrum, amplitudes, maxNumberOfVoices, tolerance);

  const twelveSpectrumCents: number[] = [];
  const twelveAmplitudes: number[] = [];
  for (let h = 1; h <= 128; ++h) {
    const cents = valueToCents(h);
    const closest = Math.round(cents / 100) * 100;
    if (Math.abs(cents - closest) < 15) {
      twelveSpectrumCents.push((3 * closest + cents) / 4);
      if (h === ceilPow2(h)) {
        twelveAmplitudes.push(0.3 * h ** -2);
      } else {
        twelveAmplitudes.push(0.6 * h ** -1.5);
      }
    }
  }
  APERIODIC_WAVES["12-TET"] = new AperiodicWave(audioContext, twelveSpectrumCents.map(centsToValue), twelveAmplitudes, maxNumberOfVoices, tolerance);

  getPlainSpectraWaveformNames().forEach((id) => {
    const spectrum = getPlainSpectrum(id);
    const indices = [...spectrum.keys()];
    const preamps = indices.map((n) => (n + 1) ** -1.5);
    // 0.730783 is based on the code above for 128 amplitudes: they summed to that
    const amplitudeCorrection = 0.730783 / sum(preamps);
    const amps = preamps.map((a) => a * amplitudeCorrection);
    APERIODIC_WAVES[id] = new AperiodicWave(audioContext, spectrum, amps, maxNumberOfVoices, tolerance);
  });

  getTimbreWaveformNames().forEach((id) => {
    const { spectrum, amplitudes } = getTimbre(id);
    APERIODIC_WAVES[id] = new AperiodicWave(audioContext, spectrum, amplitudes, maxNumberOfVoices, tolerance);
  });
}

export function initializeCustomWaves(audioContext: BaseAudioContext) {
  initializePeriodic(audioContext);
  initializeAperiodic(audioContext);
}

// Simple feedback loop bouncing sound between left and right channels.
export class PingPongDelay {
  audioContext: AudioContext;
  delayL: DelayNode;
  delayR: DelayNode;
  gainL: GainNode;
  gainR: GainNode;
  panL: StereoPannerNode;
  panR: StereoPannerNode;
  destination: AudioNode;

  constructor(audioContext: AudioContext, maxDelayTime = 5) {
    this.audioContext = audioContext;
    this.delayL = audioContext.createDelay(maxDelayTime);
    this.delayR = audioContext.createDelay(maxDelayTime);
    this.gainL = audioContext.createGain();
    this.gainR = audioContext.createGain();
    this.panL = audioContext.createStereoPanner();
    this.panR = audioContext.createStereoPanner();

    // Create a feedback loop with a gain stage.
    this.delayL.connect(this.gainL).connect(this.delayR).connect(this.gainR).connect(this.delayL);
    // Tap outputs.
    this.gainL.connect(this.panL);
    this.gainR.connect(this.panR);

    // Tag input.
    this.destination = this.delayL;
  }

  set delayTime(value: number) {
    const now = this.audioContext.currentTime;
    this.delayL.delayTime.setValueAtTime(value, now);
    this.delayR.delayTime.setValueAtTime(value, now);
  }

  set feedback(value: number) {
    const now = this.audioContext.currentTime;
    this.gainL.gain.setValueAtTime(value, now);
    this.gainR.gain.setValueAtTime(value, now);
  }

  set separation(value: number) {
    const now = this.audioContext.currentTime;
    this.panL.pan.setValueAtTime(-value, now);
    this.panR.pan.setValueAtTime(value, now);
  }

  connect(destination: AudioNode) {
    this.panL.connect(destination);
    this.panR.connect(destination);
    return destination;
  }

  disconnect(destination: AudioNode) {
    this.panL.disconnect(destination);
    this.panR.disconnect(destination);
    return destination;
  }
}
