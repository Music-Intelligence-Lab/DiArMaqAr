Js.AperiodicOscillator = Js.UnisonOscillator = Js.MultiOscillator = Js.AperiodicWave = void 0;
const VV = eu;
class UV {
    constructor(t, e, r, i, a) {
        const [l,f] = (0,
        VV.allocateVoices)(e, r, i, a);
        this.detunings = l,
        this.periodicWaves = [];
        for (const h of f) {
            const p = t.createPeriodicWave(h.map( () => 0), h, {
                disableNormalization: !0
            });
            this.periodicWaves.push(p)
        }
    }
}
Js.AperiodicWave = UV;
class iy {
    constructor(t, e) {
        var r, i;
        this.context = t,
        this._options = {
            ...e,
            detune: 0,
            frequency: 0
        };
        const a = new ConstantSourceNode(t,{
            offset: (r = e == null ? void 0 : e.detune) !== null && r !== void 0 ? r : 0
        })
          , l = new ConstantSourceNode(t,{
            offset: (i = e == null ? void 0 : e.frequency) !== null && i !== void 0 ? i : 440
        })
          , f = t.createGain()
          , h = new OscillatorNode(t,this._options);
        h.connect(f),
        a.connect(h.detune),
        l.connect(h.frequency),
        h.addEventListener("ended", () => {
            h.disconnect(f),
            a.disconnect(h.detune),
            l.disconnect(h.frequency)
        }
        ),
        this.voices = [h],
        this._detune = a,
        this._frequency = l,
        this._gain = f,
        this._started = !1,
        this._stopped = !1
    }
    dispose() {
        for (const t of this.voices)
            t.stop();
        this._detune.stop(),
        this._frequency.stop(),
        this._gain.disconnect()
    }
    get numberOfVoices() {
        return this.voices.length
    }
    set numberOfVoices(t) {
        if (t < 1)
            throw new Error("At least one voice must be present");
        for (; this.voices.length > t; )
            this.voices.pop().stop();
        for (; this.voices.length < t; ) {
            const e = new OscillatorNode(this.context,this._options);
            if (this.type === "custom") {
                if (!this._periodicWave)
                    throw new Error("Periodic wave must be set when type = 'custom'");
                e.setPeriodicWave(this._periodicWave)
            } else
                e.type = this.type;
            e.connect(this._gain),
            this._detune.connect(e.detune),
            this._frequency.connect(e.frequency),
            e.addEventListener("ended", () => {
                e.disconnect(this._gain),
                this._detune.disconnect(e.detune),
                this._frequency.disconnect(e.frequency)
            }
            ),
            this._started && (e.start(this._startTime),
            this._stopped && e.stop(this._stopTime)),
            this.voices.push(e)
        }
    }
    get detune() {
        return this._detune.offset
    }
    get frequency() {
        return this._frequency.offset
    }
    get type() {
        return this.voices[0].type
    }
    set type(t) {
        for (const e of this.voices)
            e.type = t
    }
    get onended() {
        return this.voices[0].onended
    }
    get channelCount() {
        return this.voices[0].channelCount
    }
    get channelInterpretation() {
        return this.voices[0].channelInterpretation
    }
    get channelCountMode() {
        return this.voices[0].channelCountMode
    }
    get numberOfInputs() {
        return this.voices[0].numberOfInputs
    }
    get numberOfOutputs() {
        return this.voices[0].numberOfOutputs
    }
    setPeriodicWave(t) {
        this._periodicWave = t;
        for (const e of this.voices)
            e.setPeriodicWave(t)
    }
    addEventListener(t, e, r) {
        this.voices[0].addEventListener(t, e, r)
    }
    removeEventListener(t, e, r) {
        this.voices[0].removeEventListener(t, e, r)
    }
    start(t) {
        this._started = !0,
        this._startTime = t;
        for (const e of this.voices)
            e.start(t);
        this._detune.start(t),
        this._frequency.start(t)
    }
    stop(t) {
        this._stopped = !0,
        this._stopTime = t;
        for (const e of this.voices)
            e.stop(t);
        this._detune.stop(t),
        this._frequency.stop(t)
    }
    connect(t, e, r) {
        return this._gain.connect(t, e, r)
    }
    disconnect(t, e, r) {
        t === void 0 ? this._gain.disconnect() : this._gain.disconnect(t, e, r)
    }
    dispatchEvent(t) {
        for (const e of this.voices)
            e.dispatchEvent(t);
        return this._detune.dispatchEvent(t),
        this._frequency.dispatchEvent(t),
        this._gain.dispatchEvent(t)
    }
}
Js.MultiOscillator = iy;
class jV extends iy {
    constructor(t, e, r="detune") {
        var i, a;
        super(t, e),
        this.mode = r;
        const l = new ConstantSourceNode(t,{
            offset: (i = e == null ? void 0 : e.spread) !== null && i !== void 0 ? i : 0
        })
          , f = this.voices[0]
          , h = new GainNode(t,{
            gain: 0
        });
        l.connect(h).connect(r === "frequency" ? f.frequency : f.detune),
        f.addEventListener("ended", () => {
            l.disconnect(h),
            h.disconnect(r === "frequency" ? f.frequency : f.detune)
        }
        ),
        this._spread = l,
        this._mus = [h],
        this.numberOfVoices = (a = e == null ? void 0 : e.numberOfVoices) !== null && a !== void 0 ? a : 1
    }
    set numberOfVoices(t) {
        super.numberOfVoices = t;
        const e = this.mode;
        for (; this._mus.length > t; )
            this._mus.pop();
        for (; this._mus.length < t; ) {
            const r = this.voices[this._mus.length]
              , i = this.context.createGain();
            this._spread.connect(i).connect(e === "frequency" ? r.frequency : r.detune),
            r.addEventListener("ended", () => {
                this._spread.disconnect(i),
                i.disconnect(e === "frequency" ? r.frequency : r.detune)
            }
            ),
            this._mus.push(i)
        }
        if (this._gain.gain.setValueAtTime(1 / Math.sqrt(t), this.context.currentTime),
        t === 1) {
            this._mus[0].gain.setValueAtTime(0, this.context.currentTime);
            return
        }
        for (let r = 0; r < t; ++r) {
            const i = 2 * r / (t - 1) - 1;
            this._mus[r].gain.setValueAtTime(i, this.context.currentTime)
        }
    }
    get spread() {
        return this._spread.offset
    }
    start(t) {
        super.start(t),
        this._spread.start(t)
    }
    stop(t) {
        super.stop(t),
        this._spread.stop(t)
    }
    dispatchEvent(t) {
        this._spread.dispatchEvent(t);
        for (const e of this._mus)
            e.dispatchEvent(t);
        return super.dispatchEvent(t)
    }
}
Js.UnisonOscillator = jV;
class HV extends iy {
    constructor(t, e) {
        super(t, e),
        (e == null ? void 0 : e.aperiodicWave) !== void 0 && this.setAperiodicWave(e.aperiodicWave)
    }
    setAperiodicWave(t) {
        const e = t.detunings;
        this.type = "sine",
        this.numberOfVoices = e.length;
        for (let r = 0; r < e.length; ++r)
            this.voices[r].detune.setValueAtTime(e[r], this.context.currentTime),
            this.voices[r].setPeriodicWave(t.periodicWaves[r])
    }
}
Js.AperiodicOscillator = HV;
var au = {};
Object.defineProperty(au, "__esModule", {
    value: !0
});
au.VoiceBase = void 0;
const r_ = .5
  , s_ = 1e4;
let GV = 1;
class WV {
    constructor(t, e, r) {
        this.age = s_,
        this.context = t,
        this.envelope = new GainNode(t,{
            gain: 0
        }),
        this.envelope.connect(e),
        this.log = r,
        this.noteId = 0,
        this.voiceId = GV++
    }
    noteOn(t, e, r, i) {
        this.log(`Voice ${this.voiceId}: Age = ${this.age}, note = ${r}, frequency = ${t}`),
        this.age = 0,
        this.noteId = r;
        const a = this.context.currentTime + i.audioDelay;
        this.log(`Voice ${this.voiceId}: On time = ${a}, sustain time = ${a + i.attackTime}`),
        this.envelope.gain.setValueAtTime(0, a),
        this.envelope.gain.linearRampToValueAtTime(e, a + i.attackTime),
        this.envelope.gain.setTargetAtTime(e * i.sustainLevel, a + i.attackTime, i.decayTime * r_);
        const l = () => {
            if (this.noteId !== r) {
                this.log(`Voice ${this.voiceId} had been stolen. Ignoring note off`);
                return
            }
            this.age = s_;
            const f = this.context.currentTime;
            this.log(`Voice ${this.voiceId}: Off time = ${f}`),
            this.envelope.gain.cancelScheduledValues(f),
            f < a + i.attackTime && this.envelope.gain.setValueAtTime(e * (f - a) / i.attackTime, f),
            this.envelope.gain.setTargetAtTime(0, f, i.releaseTime * r_),
            this.noteId = -1
        }
        ;
        return this.lastNoteOff = l,
        l
    }
    dispose() {}
}
au.VoiceBase = WV;
(function(n) {
    Object.defineProperty(n, "__esModule", {
        value: !0
    }),
    n.AperiodicVoice = n.UnisonVoice = n.OscillatorVoice = n.OscillatorVoiceBase = n.defaultUnisonParams = n.defaultParams = n.AperiodicWave = void 0;
    const t = Js
      , e = au;
    var r = Js;
    Object.defineProperty(n, "AperiodicWave", {
        enumerable: !0,
        get: function() {
            return r.AperiodicWave
        }
    });
    function i() {
        return {
            audioDelay: .001,
            type: "triangle",
            attackTime: .01,
            decayTime: .3,
            sustainLevel: .8,
            releaseTime: .01
        }
    }
    n.defaultParams = i;
    function a() {
        const m = i();
        return m.type = "sawtooth",
        m.stackSize = 3,
        m.spread = 1.5,
        m
    }
    n.defaultUnisonParams = a;
    class l extends e.VoiceBase {
        constructor(g, b, E, S) {
            super(g, b, E),
            this.oscillator = new S(this.context),
            this.oscillator.connect(this.envelope);
            const F = this.context.currentTime;
            this.oscillator.start(F),
            this.oscillator.addEventListener("ended", () => {
                this.envelope.disconnect(),
                this.oscillator.disconnect()
            }
            )
        }
        noteOn(g, b, E, S) {
            const F = this.context.currentTime + S.audioDelay;
            return this.oscillator.frequency.setValueAtTime(g, F),
            super.noteOn(g, b, E, S)
        }
        dispose() {
            this.oscillator.stop(),
            (this.oscillator instanceof t.UnisonOscillator || this.oscillator instanceof t.AperiodicOscillator) && this.oscillator.dispose()
        }
    }
    n.OscillatorVoiceBase = l;
    class f extends l {
        constructor(g, b, E) {
            super(g, b, E, OscillatorNode)
        }
        noteOn(g, b, E, S) {
            if (S.periodicWave) {
                if (S.type !== "custom")
                    throw new Error("Oscillator type must be set to 'custom' when periodic wave is used.");
                this.oscillator.setPeriodicWave(S.periodicWave)
            } else {
                if (S.type === "custom")
                    throw new Error("Periodic wave must be given when oscillator type is set to 'custom'");
                this.oscillator.type = S.type
            }
            return super.noteOn(g, b, E, S)
        }
    }
    n.OscillatorVoice = f;
    class h extends l {
        constructor(g, b, E) {
            super(g, b, E, t.UnisonOscillator)
        }
        noteOn(g, b, E, S) {
            this.oscillator.numberOfVoices = S.stackSize;
            const F = this.context.currentTime + S.audioDelay;
            if (this.oscillator.spread.setValueAtTime(S.spread, F),
            S.periodicWave) {
                if (S.type !== "custom")
                    throw new Error("Oscillator type must be set to 'custom' when periodic wave is used.");
                this.oscillator.setPeriodicWave(S.periodicWave)
            } else {
                if (S.type === "custom")
                    throw new Error("Periodic wave must be given when oscillator type is set to 'custom'");
                this.oscillator.type = S.type
            }
            return super.noteOn(g, b, E, S)
        }
    }
    n.UnisonVoice = h;
    class p extends l {
        constructor(g, b, E) {
            super(g, b, E, t.AperiodicOscillator)
        }
        noteOn(g, b, E, S) {
            return this.oscillator.setAperiodicWave(S.aperiodicWave),
            super.noteOn(g, b, E, S)
        }
    }
    n.AperiodicVoice = p
}
)(sy);
var zf = {};
Object.defineProperty(zf, "__esModule", {
    value: !0
});
zf.BufferVoice = void 0;
const JV = au;
class KV extends JV.VoiceBase {
    noteOn(t, e, r, i) {
        this.node && this.node.stop();
        const a = i.factory(this.context, t, e);
        a.connect(this.envelope),
        a.addEventListener("ended", () => {
            a.disconnect(this.envelope)
        }
        );
        const l = this.context.currentTime + i.audioDelay;
        a.start(l),
        this.node = a;
        const f = super.noteOn(t, e, r, i);
        return () => {
            f();
            const h = this.context.currentTime + i.audioDelay;
            a.stop(h + i.releaseTime * 3)
        }
    }
    dispose() {
        this.node && this.node.stop(),
        this.envelope.disconnect()
    }
}
zf.BufferVoice = KV;
var OS = {};
(function(n) {
    var t = Zt && Zt.__createBinding || (Object.create ? function(r, i, a, l) {
        l === void 0 && (l = a);
        var f = Object.getOwnPropertyDescriptor(i, a);
        (!f || ("get"in f ? !i.__esModule : f.writable || f.configurable)) && (f = {
            enumerable: !0,
            get: function() {
                return i[a]
            }
        }),
        Object.defineProperty(r, l, f)
    }
    : function(r, i, a, l) {
        l === void 0 && (l = a),
        r[l] = i[a]
    }
    )
      , e = Zt && Zt.__exportStar || function(r, i) {
        for (var a in r)
            a !== "default" && !Object.prototype.hasOwnProperty.call(i, a) && t(i, r, a)
    }
    ;
    Object.defineProperty(n, "__esModule", {
        value: !0
    }),
    e(au, n),
    e(zf, n),
    e(sy, n)
}
)(OS);
(function(n) {
    var t = Zt && Zt.__createBinding || (Object.create ? function(m, g, b, E) {
        E === void 0 && (E = b);
        var S = Object.getOwnPropertyDescriptor(g, b);
        (!S || ("get"in S ? !g.__esModule : S.writable || S.configurable)) && (S = {
            enumerable: !0,
            get: function() {
                return g[b]
            }
        }),
        Object.defineProperty(m, E, S)
    }
    : function(m, g, b, E) {
        E === void 0 && (E = b),
        m[E] = g[b]
    }
    )
      , e = Zt && Zt.__exportStar || function(m, g) {
        for (var b in m)
            b !== "default" && !Object.prototype.hasOwnProperty.call(g, b) && t(g, m, b)
    }
    ;
    Object.defineProperty(n, "__esModule", {
        value: !0
    }),
    n.BufferSynth = n.AperiodicSynth = n.UnisonSynth = n.Synth = void 0;
    const r = sy
      , i = zf;
    e(OS, n);
    let a = 1;
    class l {
        constructor(g, b, E) {
            this.audioContext = g,
            this.destination = b,
            E === void 0 ? this.log = S => {}
            : this.log = E,
            this.voices = []
        }
        _newVoice() {
            return new r.OscillatorVoice(this.audioContext,this.destination,this.log)
        }
        setPolyphony(g) {
            if (g < 0 || g === 1 / 0 || isNaN(g))
                throw new Error("Invalid max polyphony");
            for (; this.voices.length > g; )
                this.voices.pop().dispose();
            for (; this.voices.length < g; )
                this.voices.push(this._newVoice())
        }
        get maxPolyphony() {
            return this.voices.length
        }
        set maxPolyphony(g) {
            this.setPolyphony(g)
        }
        _allocateVoice() {
            let g;
            for (const b of this.voices)
                b.age++,
                (g === void 0 || b.age > g.age) && (g = b);
            return g
        }
        noteOn(g, b) {
            const E = this._allocateVoice();
            if (E === void 0)
                return () => {}
                ;
            if (this.voiceParams === void 0)
                throw new Error("Synth.voiceParams must be set before calling Synth.noteOn");
            return E.noteOn(g, b, a++, this.voiceParams)
        }
        allNotesOff() {
            for (const g of this.voices)
                g.lastNoteOff !== void 0 && g.lastNoteOff()
        }
    }
    n.Synth = l;
    class f extends l {
        _newVoice() {
            return new r.UnisonVoice(this.audioContext,this.destination,this.log)
        }
    }
    n.UnisonSynth = f;
    class h extends l {
        _newVoice() {
            return new r.AperiodicVoice(this.audioContext,this.destination,this.log)
        }
    }
    n.AperiodicSynth = h;
    class p extends l {
        _newVoice() {
            return new i.BufferVoice(this.audioContext,this.destination,this.log)
        }
    }
    n.BufferSynth = p
}
)(Kr);
const NS = ["sine", "square", "sawtooth", "triangle"]
  , TS = ["warm1", "warm2", "warm3", "warm4", "octaver", "brightness", "harmonicbell", "semisine", "rich", "slender", "didacus", "bohlen", "glass", "boethius", "gold", "rich-classic", "slender-classic", "didacus-classic", "bohlen-classic", "glass-classic", "boethius-classic"]
  , UW = NS.concat(TS)
  , Vn = {}
  , ZV = ["jegogan", "jublag", "ugal", "gender", "piano", "tin", "bronze", "steel", "silver", "platinum", "12-TET"]
  , fs = {};
function YV(n) {
    Vn.warm1 = Ve( () => n.createPeriodicWave(new Float32Array([0, 10, 2, 2, 2, 1, 1, .5]), new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]))),
    Vn.warm2 = Ve( () => n.createPeriodicWave(new Float32Array([0, 10, 5, 3.33, 2, 1]), new Float32Array([0, 0, 0, 0, 0, 0]))),
    Vn.warm3 = Ve( () => n.createPeriodicWave(new Float32Array([0, 10, 5, 5, 3]), new Float32Array([0, 0, 0, 0, 0]))),
    Vn.warm4 = Ve( () => n.createPeriodicWave(new Float32Array([0, 10, 2, 2, 1]), new Float32Array([0, 0, 0, 0, 0]))),
    Vn.octaver = Ve( () => n.createPeriodicWave(new Float32Array([0, 1e3, 500, 0, 333, 0, 0, 0, 250, 0, 0, 0, 0, 0, 0, 0, 166]), new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))),
    Vn.brightness = Ve( () => n.createPeriodicWave(new Float32Array([0, 10, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, .75, .5, .2, .1]), new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))),
    Vn.harmonicbell = Ve( () => n.createPeriodicWave(new Float32Array([0, 10, 2, 2, 2, 2, 0, 0, 0, 0, 0, 7]), new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))),
    Vn.semisine = Ve( () => {
        const r = new Float32Array(64)
          , i = new Float32Array(64);
        for (let a = 1; a < 64; ++a)
            i[a] = 1 / (1 - 4 * a * a);
        return n.createPeriodicWave(i, r)
    }
    );
    const t = new Float32Array(101);
    Vn.gold = Ve( () => {
        const r = new Float32Array(101);
        for (let i = 1; i <= 10; ++i)
            r[i * i] = i ** -.75;
        return n.createPeriodicWave(t, r)
    }
    );
    const e = Ve( () => {
        const r = new Float32Array(101)
          , i = new Float32Array(101)
          , a = new Float32Array(101)
          , l = new Float32Array(101)
          , f = new Float32Array(101)
          , h = new Float32Array(101)
          , p = new Float32Array(101)
          , m = new Float32Array(101)
          , g = new Float32Array(101)
          , b = new Float32Array(101)
          , E = new Float32Array(101)
          , S = new Float32Array(101);
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 20, 21, 22, 24, 25, 27, 28, 30, 32, 33, 35, 36, 38, 40, 42, 44, 45, 48, 49, 50, 54, 55, 56, 57, 60, 63, 64, 66, 70, 72, 75, 76, 77, 80, 81, 84, 88, 90, 95, 96, 98, 99, 100].forEach(B => {
            const Q = 1 / B
              , ae = B ** -1.5;
            B % 11 && B % 19 && (B % 7 && (i[B] = Q,
            r[B] = ae),
            B % 5 && (l[B] = Q,
            a[B] = ae),
            B % 3 && (h[B] = Q,
            f[B] = ae),
            B % 2 && (m[B] = Q,
            p[B] = ae)),
            B % 3 && B % 5 && B % 19 && (B % 7 && B % 11 ? (b[B] = Q,
            g[B] = ae) : (b[B] = 2 * Q,
            g[B] = 2 * ae)),
            B % 5 && B % 7 && B % 11 && (B % 19 ? (S[B] = Q,
            E[B] = ae) : (S[B] = 2 * Q,
            E[B] = 2 * ae))
        }
        ),
        {
            richClassic: i,
            rich: r,
            slenderClassic: l,
            slender: a,
            didacusClassic: h,
            didacus: f,
            bohlenClassic: m,
            bohlen: p,
            glassClassic: b,
            glass: g,
            boethiusClassic: S,
            boethius: E
        }
    }
    );
    Vn["rich-classic"] = Ve( () => n.createPeriodicWave(t, e.value.richClassic)),
    Vn.rich = Ve( () => n.createPeriodicWave(t, e.value.rich)),
    Vn["slender-classic"] = Ve( () => n.createPeriodicWave(t, e.value.slenderClassic)),
    Vn.slender = Ve( () => n.createPeriodicWave(t, e.value.slender)),
    Vn["didacus-classic"] = Ve( () => n.createPeriodicWave(t, e.value.didacusClassic)),
    Vn.didacus = Ve( () => n.createPeriodicWave(t, e.value.didacus)),
    Vn["bohlen-classic"] = Ve( () => n.createPeriodicWave(t, e.value.bohlenClassic)),
    Vn.bohlen = Ve( () => n.createPeriodicWave(t, e.value.bohlen)),
    Vn["glass-classic"] = Ve( () => n.createPeriodicWave(t, e.value.glassClassic)),
    Vn.glass = Ve( () => n.createPeriodicWave(t, e.value.glass)),
    Vn["boethius-classic"] = Ve( () => n.createPeriodicWave(t, e.value.boethiusClassic)),
    Vn.boethius = Ve( () => n.createPeriodicWave(t, e.value.boethius))
}
function QV(n) {
    const t = [...Array(129).keys()];
    t.shift();
    const e = t.map(a => .3 * a ** -1.5)
      , r = 7
      , i = .1;
    fs.tin = Ve( () => new Kr.AperiodicWave(n,t.map(a => a ** (8 / 9)),e,r,i)),
    fs.steel = Ve( () => new Kr.AperiodicWave(n,t.map(a => a ** 1.5),e,r,i)),
    fs.bronze = Ve( () => new Kr.AperiodicWave(n,t.map(a => a ** (4 / 3)),e,r,i)),
    fs.silver = Ve( () => new Kr.AperiodicWave(n,t.map(a => a ** (5 / 3)),e,r,i)),
    fs.platinum = Ve( () => new Kr.AperiodicWave(n,t.slice(0, 32).map(a => a ** 2.5),e.slice(0, 32),r,i)),
    fs.gender = Ve( () => {
        const a = [1, 2.26, 3.358, 3.973, 7.365, 13, 29, 31, 37]
          , l = [1, .6, .3, .4, .2, .05, .04, .01, .006].map(p => .4 * p)
          , f = []
          , h = [];
        for (let p = 0; p < a.length; ++p)
            f.push(a[p] * 1.004),
            f.push(a[p] / 1.004),
            h.push(l[p]),
            h.push(.6 * l[p]);
        return new Kr.AperiodicWave(n,f,h,r,i)
    }
    ),
    fs.jublag = Ve( () => {
        const a = [1, 2.77, 5.18, 5.33];
        a.push(9.1, 18.9, 23),
        a[0] = 1.01,
        a.unshift(1 / a[0]),
        a.push(2.76);
        const l = [1, .5, .5, .3, .2, .15, .1, .09, .2].map(f => .45 * f);
        return new Kr.AperiodicWave(n,a,l,r,i)
    }
    ),
    fs.ugal = Ve( () => {
        const a = [1, 2.61, 4.8, 4.94, 6.32];
        a.push(9.9, 17, 24.1),
        a[0] = 1.008,
        a.unshift(1 / a[0]),
        a.push(2.605),
        a.push(4.81);
        const l = [.6, 1, .45, .3, .15, .2, .07, .08, .05, .1, .1].map(f => .45 * f);
        return new Kr.AperiodicWave(n,a,l,r,i)
    }
    ),
    fs.jegogan = Ve( () => {
        const a = [1, 2.8, 5.5, 9, 16.7, 17.8, 20.5, 22.9, 24.9, 27, 28.1, 29.2, 29.5, 30, 31.8, 33.3, 36, 36.9, 40.6, 41.4]
          , l = a.map(f => .7 * (Math.cos(.3 * f * f) + 1.6) / (f ** 1.4 + 1.6));
        return new Kr.AperiodicWave(n,a,l,r,i)
    }
    ),
    fs["12-TET"] = Ve( () => {
        const a = []
          , l = [];
        for (let f = 1; f <= 128; ++f) {
            const h = Ie.valueToCents(f)
              , p = Math.round(h / 100) * 100;
            Math.abs(h - p) < 15 && (a.push((3 * p + h) / 4),
            f === $V(f) ? l.push(.3 * f ** -2) : l.push(.6 * f ** -1.5))
        }
        return new Kr.AperiodicWave(n,a.map(Ie.centsToValue),l,r,i)
    }
    ),
    fs.piano = Ve( () => {
        const a = [.998711340392508, 1.0012886596074921, 2.000000001915048, 3.0077319605175252, 4.024484537329971, 4.028350517109971, 5.052835053482418, 6.0953608281898495, 6.100515466619817, 7.149484540322233, 7.158505158532202, 8.221649488874554, 9.326030932401801, 9.3298969121818, 9.33891753039177, 10.449742272914, 10.457474232474, 10.466494850683969, 11.597938150756168]
          , l = [.9123120265773679, .7281477301038842, .5078045641543809, .8061314224800064, .3177244232370868, .15135058363038334, .12440135191000032, .045007651288955175, .050804443667738106, .029671376885221354, .023841125287306208, .01853341284211317, .02380292893502422, .024761095205029133, .020866326567241505, .0017670624571622458, .0024893662658642206, .0012043792096897129, .0014228119365412375].map(f => f * .38);
        return new Kr.AperiodicWave(n,a,l,r,i)
    }
    )
}
function XV(n) {
    YV(n),
    QV(n)
}