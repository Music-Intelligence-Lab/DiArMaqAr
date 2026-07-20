"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Slider } from "@mui/material";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import useMenuContext from "@/contexts/menu-context";
import useLanguageContext from "@/contexts/language-context";
import SettingsIcon from "@mui/icons-material/Settings";
import { BASIC_WAVEFORMS, APERIODIC_WAVEFORMS, CUSTOM_WAVEFORMS } from "@/audio/waves";
import getFirstNoteName from "@/functions/getFirstNoteName";
import clampOctaveShift, { OCTAVE_SHIFT_MIN, OCTAVE_SHIFT_MAX } from "@/functions/clampOctaveShift";
import clampTempo, { TEMPO_MIN, TEMPO_MAX } from "@/functions/clampTempo";

const SettingsCard = () => {
  const { patterns, selectedTuningSystem, allPitchClasses, referenceFrequencies, selectedIndices } = useAppContext();
  const { soundSettings, setSoundSettings, midiInputs, midiOutputs, setRefresh, clearHangingNotes } = useSoundContext();
  const { t, language, getDisplayName } = useLanguageContext();

  const { openSettings, setOpenSettings, openNavigation, setOpenNavigation } = useMenuContext();
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [originalPitchBend, setOriginalPitchBend] = useState<number>(2);

  // Same derivation the sound context runs — the selected port IS the output
  // route, so the panel and the audio path cannot disagree about which one is
  // live. See the note on midiOutputSelected in sound-context.tsx.
  const midiOutputSelected = soundSettings.selectedMidiOutputId !== null;

  useEffect(() => {
    if (!soundSettings.selectedPattern && patterns.length > 0) {
      const defaultPattern = patterns.find((p) => p.getName() === "Default");
      if (defaultPattern) {
        setSoundSettings((prev) => ({
          ...prev,
          selectedPattern: defaultPattern,
        }));
      }
    }
  }, [patterns, soundSettings.selectedPattern, setSoundSettings]);

  // Set mounted state for portal hydration (avoids Next.js hydration errors)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close settings when clicking outside, but ignore clicks on the open button
  useEffect(() => {
    if (!openSettings) return;
    function handleClick(event: MouseEvent) {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpenSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openSettings, setOpenSettings]);

  // Trap focus inside settings and close on ESC
  useEffect(() => {
    if (!openSettings) return;
    const focusable = cardRef.current?.querySelectorAll<HTMLElement>('input, select, button, a, [tabindex]:not([tabindex="-1"])');
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    cardRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenSettings(false);
        buttonRef.current?.focus();
      }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        if (e.shiftKey && (document.activeElement === first || document.activeElement === cardRef.current)) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openSettings, setOpenSettings]);

  // Prevent background scroll when settings is open
  useEffect(() => {
    if (openSettings) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openSettings]);

  const togglePanel = () => {
    setOpenSettings((prev) => !prev);
    if (openNavigation) setOpenNavigation(false);
  };

  const handleSoundSettingsChange = (paramName: keyof typeof soundSettings) => (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setSoundSettings((prev) => ({ ...prev, [paramName]: newValue }));
    }
  };

  const handleWaveformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSoundSettings((prev) => ({ ...prev, waveform: e.target.value }));
    clearHangingNotes();
    e.target.blur();
  };

  // One flat list in the order the select presents its three optgroups, so the
  // buttons and the dropdown walk the same sequence. Cycling wraps: this is a
  // ring of timbres to audition, not a range with ends to hit.
  const cycleWaveform = (step: 1 | -1) => {
    const all = [...BASIC_WAVEFORMS, ...CUSTOM_WAVEFORMS, ...APERIODIC_WAVEFORMS];
    const at = all.indexOf(soundSettings.waveform);
    const next = all[(at + step + all.length) % all.length];
    setSoundSettings((prev) => ({ ...prev, waveform: next }));
    clearHangingNotes();
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Left unclamped while typing: clamping each keystroke would rewrite the first
    // digit of any multi-digit tempo up to TEMPO_MIN. Range is enforced on blur.
    setSoundSettings((prev) => ({ ...prev, tempo: Number(e.target.value) }));
  };

  const handleTempoBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // An emptied field reads as "" -> keep the tempo the user started with rather
    // than snapping to TEMPO_MIN.
    const raw = e.target.value.trim();
    setSoundSettings((prev) => ({ ...prev, tempo: raw === "" ? prev.tempo : clampTempo(Number(raw)) }));
  };

  /*   const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setSoundSettings((prev) => ({ ...prev, duration: val }));
  };
 */
  const handlePitchBendRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setSoundSettings((prev) => ({ ...prev, pitchBendRange: val }));
  };

  const resetToDefaults = () => {
    // Reset only envelope settings to their default values
    setSoundSettings((prev) => ({
      ...prev,
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.4,
    }));
    
    // Clear any hanging notes
    clearHangingNotes();
  };

  // Get reference frequency info for octave shift display
  const getReferenceInfo = () => {
    if (!selectedTuningSystem || allPitchClasses.length === 0) return null;
    
    // Get the starting note name from the tuning system
    const startingNoteName = getFirstNoteName(selectedIndices);
    if (startingNoteName === "none") return null;
    
    // Find the pitch class that matches the starting note name
    const startingPitchClass = allPitchClasses.find(pc => pc.noteName === startingNoteName);
    if (!startingPitchClass) return null;
    
    // Get the reference frequency for the starting note
    const baseFrequency = referenceFrequencies[startingNoteName] || selectedTuningSystem.getDefaultReferenceFrequency();
    
    return {
      noteName: startingPitchClass.noteName,
      englishName: startingPitchClass.englishName,
      baseFrequency,
      currentFrequency: baseFrequency * Math.pow(2, soundSettings.octaveShift),
    };
  };

  const refInfo = getReferenceInfo();

  // The settings card content to be portaled
  const settingsContent = (
    <div
      ref={cardRef}
      className={`settings-card ${openSettings ? "settings-card--open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('settings.title')}
      tabIndex={-1}
    >
      <div className="settings-card__content">
        <section className="settings-card__section">
          <h2 className="settings-card__section-title">{t('settings.pattern')}</h2>
          <div className="settings-card__tempo">
            <div className="settings-card__tempo-header">
              <label htmlFor="tempo-input" className="settings-card__row-label">
                {t('settings.tempo')}
              </label>
              <button
                type="button"
                className="settings-card__stepper-button"
                onClick={() => setSoundSettings((prev) => ({ ...prev, tempo: clampTempo(prev.tempo - 1) }))}
                disabled={soundSettings.tempo <= TEMPO_MIN}
                aria-label={t('settings.tempoDown')}
              >
                −
              </button>
              <input
                type="number"
                onFocus={(e) => e.target.select()}
                id="tempo-input"
                value={soundSettings.tempo}
                onChange={handleTempoChange}
                onBlur={handleTempoBlur}
                className="settings-card__number-input settings-card__tempo-value"
                min={TEMPO_MIN}
                max={TEMPO_MAX}
              />
              <button
                type="button"
                className="settings-card__stepper-button"
                onClick={() => setSoundSettings((prev) => ({ ...prev, tempo: clampTempo(prev.tempo + 1) }))}
                disabled={soundSettings.tempo >= TEMPO_MAX}
                aria-label={t('settings.tempoUp')}
              >
                +
              </button>
            </div>
            <Slider
              size="small"
              value={soundSettings.tempo}
              min={TEMPO_MIN}
              max={TEMPO_MAX}
              step={1}
              onChange={(_e, newVal) => typeof newVal === "number" && setSoundSettings((prev) => ({ ...prev, tempo: newVal }))}
              onChangeCommitted={() => {
                const el = document.activeElement as HTMLElement | null;
                el?.blur();
              }}
              valueLabelDisplay="off"
              aria-label={t('settings.tempo')}
            />
          </div>
          <div className="settings-card__row">
            <label htmlFor="pattern-select" className="settings-card__row-label">
              {t('settings.patternSelect')}
            </label>
            <select
              id="pattern-select"
              className="settings-card__select settings-card__row-control"
              value={soundSettings.selectedPattern ? soundSettings.selectedPattern.getId() : ""}
              onChange={(e) => {
                const id = e.target.value;
                const pat = patterns.find((p) => p.getId() === id) ?? null;
                setSoundSettings((prev) => ({
                  ...prev,
                  selectedPattern: pat,
                }));
              }}
            >
              {[...patterns]
                .slice()
                .sort((a, b) => a.getName().localeCompare(b.getName()))
                .map((p) => (
                  <option key={p.getId()} value={p.getId()}>
                    {p.getName()}
                  </option>
                ))}
            </select>
          </div>
        </section>

        <section className="settings-card__section">
          <h2 className="settings-card__section-title">{t('settings.input')}</h2>

          <div className="settings-card__sound-mode">
            <button
              onClick={() =>
                setSoundSettings((prev) => ({
                  ...prev,
                  inputType: "QWERTY",
                }))
              }
              className={`settings-card__sound-mode-button ${
                soundSettings.inputType === "QWERTY" ? "settings-card__sound-mode-button_selected" : ""
              }`}
            >
              {t('settings.qwerty')}
            </button>
            <button
              onClick={() => setSoundSettings((prev) => ({ ...prev, inputType: "MIDI" }))}
              className={`settings-card__sound-mode-button ${
                soundSettings.inputType === "MIDI" ? "settings-card__sound-mode-button_selected" : ""
              }`}
            >
              {t('settings.midi')}
            </button>
          </div>

          {/*
            Port and mapping belong to the MIDI branch, so they appear with it
            rather than standing above a toggle that may be switching them off.
            Input keeps an explicit QWERTY/MIDI toggle where Output derives its
            route from the port alone: the pitch-class bar prints ONE badge per
            key and picks which by inputType (pitch-class-bar.tsx:43/75), so the
            two sources are genuinely exclusive here in a way outputs are not.
          */}
          {soundSettings.inputType === "MIDI" && (
            <>
              <div className="settings-card__row">
                <label htmlFor="midi-input-select" className="settings-card__row-label">
                  {t('settings.midiInput')}
                </label>
                <div className="settings-card__control-group">
                <select
                  id="midi-input-select"
                  value={soundSettings.selectedMidiInputId || ""}
                  onChange={(e) =>
                    setSoundSettings((prev) => ({
                      ...prev,
                      selectedMidiInputId: e.target.value || null,
                    }))
                  }
                  className="settings-card__select settings-card__row-control"
                >
                  <option value="">{t('settings.chooseInput')}</option>
                  {midiInputs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                  <button
                    type="button"
                    className="settings-card__refresh-button"
                    onClick={() => setRefresh((prev) => !prev)}
                    aria-label={t('settings.refresh')}
                    title={t('settings.refresh')}
                  >
                    ↻
                  </button>
                </div>
              </div>
              <div className="settings-card__sound-mode">
                <button
                  onClick={() =>
                    setSoundSettings((prev) => ({
                      ...prev,
                      inputMode: "tuningSystem",
                    }))
                  }
                  className={`settings-card__sound-mode-button ${
                    soundSettings.inputMode === "tuningSystem" ? "settings-card__sound-mode-button_selected" : ""
                  }`}
                >
                  {t('settings.tuningSystem')}
                </button>
                <button
                  onClick={() =>
                    setSoundSettings((prev) => ({
                      ...prev,
                      inputMode: "selection",
                    }))
                  }
                  className={`settings-card__sound-mode-button ${
                    soundSettings.inputMode === "selection" ? "settings-card__sound-mode-button_selected" : ""
                  }`}
                >
                  {t('settings.jinsOrMaqam')}
                </button>
              </div>
            </>
          )}
        </section>

        <section className="settings-card__section">
          <h2 className="settings-card__section-title">{t('settings.output')}</h2>

          {/*
            The internal synth comes FIRST because it is the default route — the
            sound you get before touching anything. MIDI Output sits under it as
            the thing that takes over.

            The ‹ › buttons cycle the flat waveform list. Picking a timbre is
            trial and error by ear, and a native select makes every trial a
            three-step reopen-scroll-pick; the buttons make it one click, with
            the select still there when you know what you want.
          */}
          <div className="settings-card__row">
            <label htmlFor="waveform-select" className="settings-card__row-label">
              {t('settings.internalSynth')}
            </label>
            <div className="settings-card__control-group">
              <button
                type="button"
                className="settings-card__stepper-button"
                onClick={() => cycleWaveform(-1)}
                disabled={midiOutputSelected}
                aria-label={t('settings.previousWaveform')}
                title={t('settings.previousWaveform')}
              >
                ‹
              </button>
              <select
                id="waveform-select"
                value={soundSettings.waveform}
                onChange={handleWaveformChange}
                disabled={midiOutputSelected}
                className="settings-card__select settings-card__row-control"
              >
                <optgroup label={t('settings.basic')}>
                  {BASIC_WAVEFORMS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t('settings.customPeriodic')}>
                  {CUSTOM_WAVEFORMS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t('settings.aperiodic')}>
                  {APERIODIC_WAVEFORMS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </optgroup>
              </select>
              <button
                type="button"
                className="settings-card__stepper-button"
                onClick={() => cycleWaveform(1)}
                disabled={midiOutputSelected}
                aria-label={t('settings.nextWaveform')}
                title={t('settings.nextWaveform')}
              >
                ›
              </button>
            </div>
          </div>

          {/*
            The port IS the route — there is no waveform/MIDI toggle. The empty
            option names what it does ("Internal synth") instead of asking the
            reader to infer that no port means the built-in sound, so the select
            reads top to bottom as a list of destinations with the internal one
            first. Choosing a port overrides the synth above; clearing it hands
            the sound back.
          */}
          <div className="settings-card__row">
            <label htmlFor="midi-output-select" className="settings-card__row-label">
              {t('settings.midiOutput')}
            </label>
            <div className="settings-card__control-group">
            <select
              id="midi-output-select"
              value={soundSettings.selectedMidiOutputId || ""}
              onChange={(e) =>
                setSoundSettings((prev) => ({
                  ...prev,
                  selectedMidiOutputId: e.target.value || null,
                }))
              }
              className="settings-card__select settings-card__row-control"
            >
              <option value="">{t('settings.internalSynth')}</option>
              {midiOutputs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
              <button
                type="button"
                className="settings-card__refresh-button"
                onClick={() => setRefresh((prev) => !prev)}
                aria-label={t('settings.refresh')}
                title={t('settings.refresh')}
              >
                ↻
              </button>
            </div>
          </div>

          {midiOutputSelected && (
            <>
              <p className="settings-card__hint">{t('settings.waveformOverridden')}</p>
              <div className="settings-card__row">
                <label htmlFor="pitch-bend-range-input" className="settings-card__row-label">
                  {t('settings.pitchBendRange')}
                </label>
                <input
                  type="number"
                  onFocus={(e) => e.target.select()}
                  id="pitch-bend-range-input"
                  value={soundSettings.pitchBendRange}
                  onChange={handlePitchBendRangeChange}
                  className="settings-card__number-input settings-card__row-control"
                  min={1}
                  max={96}
                />
              </div>
              <label className="settings-card__checkbox-row">
                <input
                  type="checkbox"
                  checked={soundSettings.useMPE}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Save current pitch bend value before switching to MPE
                      setOriginalPitchBend(soundSettings.pitchBendRange);
                      setSoundSettings((prev) => ({
                        ...prev,
                        useMPE: true,
                        pitchBendRange: 48,
                      }));
                    } else {
                      // Restore original pitch bend value when turning off MPE
                      setSoundSettings((prev) => ({
                        ...prev,
                        useMPE: false,
                        pitchBendRange: originalPitchBend,
                      }));
                    }
                  }}
                  className="settings-card__checkbox"
                />
                {t('settings.useMPE')}
              </label>
            </>
          )}

          {/*
            The drone and the two levels are output concerns, not envelope ones:
            the envelope is the SHAPE of a note (attack…release), while these set
            what is sounding and how loud it leaves. A switch rather than a
            button — it is on or off and takes effect at once, where a button
            labelled with the state you are not in ("Drone Off") makes you work
            out which of the two it is telling you.
          */}
          <div className="settings-card__row">
            <label htmlFor="drone-toggle" className="settings-card__row-label">
              {t('settings.drone')}
            </label>
            <input
              id="drone-toggle"
              type="checkbox"
              role="switch"
              checked={soundSettings.drone}
              onChange={() => setSoundSettings((prev) => ({ ...prev, drone: !prev.drone }))}
              className="settings-card__switch"
            />
          </div>

<div className="settings-card__slider-row">
            <span className="settings-card__row-label">{t('settings.droneVolume')}</span>
            <Slider
              size="small"
              value={soundSettings.droneVolume ?? 0.3}
              min={0}
              max={1}
              step={0.01}
              onChange={(_e, newVal) => typeof newVal === "number" && setSoundSettings((prev) => ({ ...prev, droneVolume: newVal }))}
              onChangeCommitted={() => {
                const el = document.activeElement as HTMLElement | null;
                el?.blur();
              }}
              valueLabelDisplay="off"
            />
            <span className="settings-card__slider-value">{(soundSettings.droneVolume ? Math.round(soundSettings.droneVolume * 100) : 0)}%</span>
          </div>

<div className="settings-card__slider-row">
            <span className="settings-card__row-label">{t('settings.volume')}</span>
            <Slider
              size="small"
              value={soundSettings.volume}
              min={0}
              max={1}
              step={0.01}
              onChange={(_e, newVal) => typeof newVal === "number" && setSoundSettings((prev) => ({ ...prev, volume: newVal }))}
              onChangeCommitted={() => {
                const el = document.activeElement as HTMLElement | null;
                el?.blur();
              }}
              valueLabelDisplay="off"
            />
            <span className="settings-card__slider-value">{(soundSettings.volume * 100).toFixed(0)}%</span>
          </div>

          {/*
            Octave shift is the last thing applied on the way out, and it applies
            to BOTH routes — so it belongs to Output rather than to the internal
            synth's envelope below.
          */}
          {refInfo && (
            <>
              <div className="settings-card__row">
              <label className="settings-card__row-label">{t('settings.octaveShift')}</label>
              <div className={`settings-card__octave-controls ${language === 'ar' ? 'rtl' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <button
                  onClick={() => {
                    setSoundSettings((prev) => ({
                      ...prev,
                      octaveShift: clampOctaveShift(prev.octaveShift - 1),
                    }));
                  }}
                  className="settings-card__octave-step settings-card__octave-step_down"
                  disabled={soundSettings.octaveShift <= OCTAVE_SHIFT_MIN}
                  aria-label={t('settings.octaveDown')}
                  title={t('settings.octaveDown')}
                />
                <button
                  onClick={() => {
                    setSoundSettings((prev) => ({
                      ...prev,
                      octaveShift: 0,
                    }));
                  }}
                  className="settings-card__octave-reset"
                  disabled={soundSettings.octaveShift === 0}
                >
                  {t('settings.reset')}
                </button>
                <button
                  onClick={() => {
                    setSoundSettings((prev) => ({
                      ...prev,
                      octaveShift: clampOctaveShift(prev.octaveShift + 1),
                    }));
                  }}
                  className="settings-card__octave-step settings-card__octave-step_up"
                  disabled={soundSettings.octaveShift >= OCTAVE_SHIFT_MAX}
                  aria-label={t('settings.octaveUp')}
                  title={t('settings.octaveUp')}
                />
              </div>
              </div>
              {/*
                Both language arms were byte-identical — <bdi> already isolates
                the mixed Latin/Arabic/numeral run in either direction, which is
                the whole reason it is there, so the branch did nothing.
              */}
              <p className="settings-card__octave-info">
                <bdi>{getDisplayName(refInfo.noteName, 'note')} {refInfo.englishName} = {refInfo.baseFrequency.toFixed(2)} Hz</bdi>
                {soundSettings.octaveShift !== 0 && (
                  <>
                    <br />
                    <bdi>{soundSettings.octaveShift > 0 ? '+' : ''}{soundSettings.octaveShift} {t('settings.octaves')} = {refInfo.currentFrequency.toFixed(2)} Hz</bdi>
                  </>
                )}
              </p>
            </>
          )}
        </section>

        <section className="settings-card__section">
          <h2 className="settings-card__section-title">{t('settings.envelope')}</h2>
          <div className="settings-card__slider-row">
            <span className="settings-card__row-label">{t('settings.attack')}</span>
            <Slider
              size="small"
              value={soundSettings.attack}
              min={0}
              max={5}
              step={0.01}
              onChange={handleSoundSettingsChange("attack")}
              onChangeCommitted={() => {
                const el = document.activeElement as HTMLElement | null;
                el?.blur();
              }}
              valueLabelDisplay="off"
            />
            <span className="settings-card__slider-value">{soundSettings.attack.toFixed(2)}</span>
          </div>

          <div className="settings-card__slider-row">
            <span className="settings-card__row-label">{t('settings.decay')}</span>
            <Slider
              size="small"
              value={soundSettings.decay}
              min={0}
              max={5}
              step={0.01}
              onChange={handleSoundSettingsChange("decay")}
              onChangeCommitted={() => {
                const el = document.activeElement as HTMLElement | null;
                el?.blur();
              }}
              valueLabelDisplay="off"
            />
            <span className="settings-card__slider-value">{soundSettings.decay.toFixed(2)}</span>
          </div>

          <div className="settings-card__slider-row">
            <span className="settings-card__row-label">{t('settings.sustain')}</span>
            <Slider
              size="small"
              value={soundSettings.sustain}
              min={0}
              max={1}
              step={0.01}
              onChange={handleSoundSettingsChange("sustain")}
              onChangeCommitted={() => {
                const el = document.activeElement as HTMLElement | null;
                el?.blur();
              }}
              valueLabelDisplay="off"
            />
            <span className="settings-card__slider-value">{soundSettings.sustain.toFixed(2)}</span>
          </div>

          <div className="settings-card__slider-row">
            <span className="settings-card__row-label">{t('settings.release')}</span>
            <Slider
              size="small"
              value={soundSettings.release}
              min={0}
              max={10}
              step={0.01}
              onChange={handleSoundSettingsChange("release")}
              onChangeCommitted={() => {
                const el = document.activeElement as HTMLElement | null;
                el?.blur();
              }}
              valueLabelDisplay="off"
            />
            <span className="settings-card__slider-value">{soundSettings.release.toFixed(2)}</span>
          </div>

          {/* Reset Button */}
          <div className="settings-card__reset-container">
            <button
              onClick={resetToDefaults}
              className="settings-card__quick-action-button"
              title={t('settings.resetEnvelope')}
            >
              {t('settings.resetEnvelope')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  // Render open button via portal to ensure it's always above all stacking contexts
  const openButton = (
    <button
      className="settings-open-button"
      onClick={togglePanel}
      aria-haspopup="dialog"
      aria-expanded={openSettings}
      aria-controls="settings-card"
      ref={buttonRef}
    >
      <SettingsIcon />
    </button>
  );

  return (
    <>
      {mounted && createPortal(openButton, document.body)}
      {mounted && createPortal(settingsContent, document.body)}
    </>
  );
};

export default SettingsCard;
