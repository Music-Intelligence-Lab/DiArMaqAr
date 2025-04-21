/**
 * Creates an object mapping standard and custom waveform names to PeriodicWave factory functions.
 */
export function createPeriodicWave(audioContext: AudioContext): Record<string, () => PeriodicWave> {
    const periodicWaves = {};
  
    // warm1: custom periodic wave with harmonic amplitudes [0, 10, 2, 2, 2, 1, 1, 0.5] and zero phases
    periodicWaves.warm1 = () => audioContext.createPeriodicWave(
      new Float32Array([0, 10, 2, 2, 2, 1, 1, 0.5]),
      new Float32Array([0, 0, 0, 0, 0, 0, 0, 0])
    );
    // warm2: custom periodic wave with harmonic amplitudes [0, 10, 5, 3.33, 2, 1] and zero phases
    periodicWaves.warm2 = () => audioContext.createPeriodicWave(
      new Float32Array([0, 10, 5, 3.33, 2, 1]),
      new Float32Array([0, 0, 0, 0, 0, 0])
    );
    // warm3: custom periodic wave with harmonic amplitudes [0, 10, 5, 5, 3] and zero phases
    periodicWaves.warm3 = () => audioContext.createPeriodicWave(
      new Float32Array([0, 10, 5, 5, 3]),
      new Float32Array([0, 0, 0, 0, 0])
    );
    // warm4: custom periodic wave with harmonic amplitudes [0, 10, 2, 2, 1] and zero phases
    periodicWaves.warm4 = () => audioContext.createPeriodicWave(
      new Float32Array([0, 10, 2, 2, 1]),
      new Float32Array([0, 0, 0, 0, 0])
    );
  
    // octaver: custom periodic wave with harmonic amplitudes [0, 1000, 500, 0, 333, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 166] and zero phases
    periodicWaves.octaver = () => audioContext.createPeriodicWave(
      new Float32Array([0, 1000, 500,   0, 333,   0,   0,   0, 250,   0,   0,   0,   0,   0,   0,   0, 166]),
      new Float32Array(17).fill(0)
    );
  
    // brightness: custom periodic wave with harmonic amplitudes [0, 10, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 0.75, 0.5, 0.2, 0.1] and zero phases
    periodicWaves.brightness = () => audioContext.createPeriodicWave(
      new Float32Array([
        0,10,0,3,3,3,3,3,3,3,3,3,3,
        1,1,1,1,1,0.75,0.5,0.2,0.1
      ]),
      new Float32Array(22).fill(0)
    );
  
    // harmonicbell: custom periodic wave with harmonic amplitudes [0, 10, 2, 2, 2, 2, 0, 0, 0, 0, 0, 7] and zero phases
    periodicWaves.harmonicbell = () => audioContext.createPeriodicWave(
      new Float32Array([0,10,2,2,2,2,0,0,0,0,0,7]),
      new Float32Array(12).fill(0)
    );
  
    periodicWaves.semisine = () => {
      const real = new Float32Array(64),
            imag = new Float32Array(64);
      for (let i = 1; i < 64; ++i) {
        imag[i] = 1 / (1 - 4 * i * i);
      }
      return audioContext.createPeriodicWave(imag, real);
    };
  
    // “Gold” timbre (101‑point)
    const base101 = new Float32Array(101);
    periodicWaves.gold = () => {
      const wave = new Float32Array(101);
      for (let i = 1; i <= 10; ++i) {
        wave[i * i] = i ** -0.75;
      }
      return audioContext.createPeriodicWave(base101, wave);
    };
  
    // Build all the “classic vs modern” arrays:
    const composite = (() => {
      const r = new Float32Array(101),
            i = new Float32Array(101),
            a = new Float32Array(101),
            l = new Float32Array(101),
            f = new Float32Array(101),
            h = new Float32Array(101),
            p = new Float32Array(101),
            m = new Float32Array(101),
            g = new Float32Array(101),
            b = new Float32Array(101),
            E = new Float32Array(101),
            S = new Float32Array(101);
  
      // Fill according to index list from bundle:
      [
        1,2,3,4,5,6,7,8,9,10,11,12,
        14,15,16,18,19,20,21,22,24,25,
        27,28,30,32,33,35,36,38,40,42,
        44,45,48,49,50,54,55,56,57,60,
        63,64,66,70,72,75,76,77,80,81,
        84,88,90,95,96,98,99,100
      ].forEach(B => {
        const Q = 1 / B,
              ae = B ** -1.5;
        // rich ↔ richClassic:
        if (B % 11 && B % 19) {
          if (B % 7) { i[B] = Q; r[B] = ae; }
          if (B % 5) { l[B] = Q; a[B] = ae; }
          if (B % 3) { h[B] = Q; f[B] = ae; }
          if (B % 2) { m[B] = Q; p[B] = ae; }
        }
        // glass vs bohlen families:
        if (B % 3 && B % 5 && B % 19) {
          if (B % 7 && B % 11) { b[B] = Q; g[B] = ae; }
          else               { b[B] = 2*Q; g[B] = 2*ae; }
        }
        // boethius family:
        if (B % 5 && B % 7 && B % 11) {
          if (B % 19)      { S[B] = Q; E[B] = ae; }
          else             { S[B] = 2*Q; E[B] = 2*ae; }
        }
      });
  
      return { 
        richClassic: i, rich: r,
        slenderClassic: l, slender: a,
        didacusClassic: h, didacus: f,
        bohlenClassic: m, bohlen: p,
        glassClassic: b, glass: g,
        boethiusClassic: S, boethius: E
      };
    })();
  
    // Publish each one as a PeriodicWave factory:
    periodicWaves["rich-classic"]   = () => audioContext.createPeriodicWave(base101, composite.richClassic);
    periodicWaves.rich              = () => audioContext.createPeriodicWave(base101, composite.rich);
    periodicWaves["slender-classic"]= () => audioContext.createPeriodicWave(base101, composite.slenderClassic);
    periodicWaves.slender           = () => audioContext.createPeriodicWave(base101, composite.slender);
    periodicWaves["didacus-classic"]= () => audioContext.createPeriodicWave(base101, composite.didacusClassic);
    periodicWaves.didacus           = () => audioContext.createPeriodicWave(base101, composite.didacus);
    periodicWaves["bohlen-classic"] = () => audioContext.createPeriodicWave(base101, composite.bohlenClassic);
    periodicWaves.bohlen            = () => audioContext.createPeriodicWave(base101, composite.bohlen);
    periodicWaves["glass-classic"]  = () => audioContext.createPeriodicWave(base101, composite.glassClassic);
    periodicWaves.glass             = () => audioContext.createPeriodicWave(base101, composite.glass);
    periodicWaves["boethius-classic"]=() => audioContext.createPeriodicWave(base101, composite.boethiusClassic);
    periodicWaves.boethius          = () => audioContext.createPeriodicWave(base101, composite.boethius);
  
    return periodicWaves;
}

/**
 * Creates an object mapping instrument names to AperiodicWave instances.
 */
export function createAperiodicWave(audioContext: AudioContext): Record<string, WaveModule.AperiodicWave> {
    const aperiodicWaves = {};
    const detuneCount = 7, detuneThreshold = 0.1;
  
    // tin: metal partials with power exponent 8/9 and amplitude decay -1.5
    aperiodicWaves.tin = () => new WaveModule.AperiodicWave(
      audioContext,
      [...Array(129).keys()].slice(1).map(n => n ** (8/9)),
      [...Array(128).keys()].map(k => 0.3 * (k+1) ** -1.5),
      detuneCount, detuneThreshold
    );
    // steel: metal partials with power exponent 1.5 and amplitude decay -1.5
    aperiodicWaves.steel   = () => new WaveModule.AperiodicWave(audioContext, [...Array(129).keys()].slice(1).map(n => n ** 1.5),     [...Array(128).keys()].map(k => 0.3 * (k+1) ** -1.5), detuneCount, detuneThreshold);
    // bronze: metal partials with power exponent 4/3 and amplitude decay -1.5
    aperiodicWaves.bronze  = () => new WaveModule.AperiodicWave(audioContext, [...Array(129).keys()].slice(1).map(n => n ** (4/3)),   [...Array(128).keys()].map(k => 0.3 * (k+1) ** -1.5), detuneCount, detuneThreshold);
    // silver: metal partials with power exponent 5/3 and amplitude decay -1.5
    aperiodicWaves.silver  = () => new WaveModule.AperiodicWave(audioContext, [...Array(129).keys()].slice(1).map(n => n ** (5/3)),   [...Array(128).keys()].map(k => 0.3 * (k+1) ** -1.5), detuneCount, detuneThreshold);
    // platinum: metal partials with power exponent 2.5 and amplitude decay -1.5
    aperiodicWaves.platinum= () => new WaveModule.AperiodicWave(
                    audioContext,
                    [...Array(32).keys()].slice(1).map(n => n ** 2.5),
                    [...Array(32).keys()].slice(1).map(k => 0.3 * (k+1) ** -1.5),
                    detuneCount, detuneThreshold
                  );
  
    // gender: interleaved slight detune
    aperiodicWaves.gender = () => {
      const a = [1,2.26,3.358,3.973,7.365,13,29,31,37],
            l = [1,0.6,0.3,0.4,0.2,0.05,0.04,0.01,0.006].map(x=>0.4*x);
      const ratios = [], amps = [];
      a.forEach((v, idx) => {
        ratios.push(v*1.004, v/1.004);
        amps   .push(l[idx], 0.6*l[idx]);
      });
      return new WaveModule.AperiodicWave(audioContext, ratios, amps, detuneCount, detuneThreshold);
    };
  
    // jublag: unique instrument with specific frequencies and amplitudes
    aperiodicWaves.jublag = () => {
      const a = [1,2.77,5.18,5.33];
      a.push(9.1,18.9,23);
      a[0] = 1.01;
      a.unshift(1/a[0]);
      a.push(2.76);
      const l = [1,0.5,0.5,0.3,0.2,0.15,0.1,0.09,0.2].map(x => 0.45*x);
      return new WaveModule.AperiodicWave(audioContext, a, l, detuneCount, detuneThreshold);
    };
  
    // ugal: unique instrument with specific frequencies and amplitudes
    aperiodicWaves.ugal = () => {
      const a = [1,2.61,4.8,4.94,6.32];
      a.push(9.9,17,24.1);
      a[0] = 1.008;
      a.unshift(1/a[0]);
      a.push(2.605,4.81);
      const l = [0.6,1,0.45,0.3,0.15,0.2,0.07,0.08,0.05,0.1,0.1].map(x => 0.45*x);
      return new WaveModule.AperiodicWave(audioContext, a, l, detuneCount, detuneThreshold);
    };
  
    // jegogan: unique instrument with specific frequencies and amplitudes
    aperiodicWaves.jegogan = () => {
      const a = [1,2.8,5.5,9,16.7,17.8,20.5,22.9,24.9,27,28.1,29.2,29.5,30,31.8,33.3,36,36.9,40.6,41.4],
            l = a.map(f => 0.7 * (Math.cos(0.3*f*f) + 1.6) / (f**1.4 + 1.6));
      return new WaveModule.AperiodicWave(audioContext, a, l, detuneCount, detuneThreshold);
    };
  
    // 12‑TET “aperiodic” approx:
    aperiodicWaves["12-TET"] = () => {
      const ratios = [], amps = [];
      for (let f = 1; f <= 128; ++f) {
        const cents = FrequencyUtils.valueToCents(f),
              roundC = Math.round(cents/100)*100;
        if (Math.abs(cents - roundC) < 15) {
          ratios.push(FrequencyUtils.centsToValue((3*roundC + cents)/4));
          amps.push((f & (f-1)) === 0 
                    ? 0.3 * f**-2 
                    : 0.6 * f**-1.5);
        }
      }
      return new WaveModule.AperiodicWave(audioContext, ratios, amps, detuneCount, detuneThreshold);
    };
  
    // piano: real piano bar with specific frequencies and amplitudes
    aperiodicWaves.piano = () => {
      const R = [
        0.99871134,1.00128866,2.00000000,3.00773196,4.02448454,
        4.02835052,5.05283505,6.09536083,6.10051547,7.14948454,
        7.15850516,8.22164949,9.32603093,9.32989691,9.33891753,
        10.44974227,10.45747423,10.46649485,11.59793815
      ];
      const L = [
        0.91231203,0.72814773,0.50780456,0.80613142,0.31772442,
        0.15135058,0.12440135,0.04500765,0.05080444,0.02967138,
        0.02384113,0.01853341,0.02380293,0.02476110,0.02086633,
        0.00176706,0.00248937,0.00120438,0.00142281
      ].map(x => x * 0.38);
      return new WaveModule.AperiodicWave(audioContext, R, L, detuneCount, detuneThreshold);
    };
  
    return aperiodicWaves;
}
