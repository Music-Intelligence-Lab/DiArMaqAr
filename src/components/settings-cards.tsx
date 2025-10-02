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

const SettingsCard = () => {
  const { patterns } = useAppContext();
  const { soundSettings, setSoundSettings, midiInputs, midiOutputs, setRefresh, clearHangingNotes } = useSoundContext();
  const { t } = useLanguageContext();

  const { openSettings, setOpenSettings, openNavigation, setOpenNavigation } = useMenuContext();
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [originalPitchBend, setOriginalPitchBend] = useState<number>(2);

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
    first?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenSettings(false);
        buttonRef.current?.focus();
      }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
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

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setSoundSettings((prev) => ({ ...prev, tempo: val }));
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
    // Find the default pattern
    const defaultPattern = patterns.find((p) => p.getName() === "Default") || null;
    
    // Reset all sound settings to their default values
    setSoundSettings({
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
      selectedPattern: defaultPattern,
      drone: true,
      droneVolume: 0.3,
      useMPE: false,
    });

    // Reset original pitch bend value
    setOriginalPitchBend(2);
    
    // Clear any hanging notes
    clearHangingNotes();
  };

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
        <details className="settings-card__details">
          <summary className="settings-card__summary">{t('settings.pattern')}</summary>
          <div className="settings-card__input-container">
            <label htmlFor="tempo-input" className="settings-card__label">
              {t('settings.tempo')}
            </label>
            <input
              type="number"
              id="tempo-input"
              value={soundSettings.tempo}
              onChange={handleTempoChange}
              className="settings-card__number-input"
              min={20}
              max={300}
            />
          </div>
          <div className="settings-card__input-container">
            <label className="settings-card__pattern-label">
              {t('settings.patternSelect')}{" "}
              <button
                onClick={() => {
                  setSoundSettings((prev) => ({ ...prev, drone: !prev.drone }));
                }}
                className={"settings-card__drone-button " + (soundSettings.drone ? "settings-card__drone-button_active" : "")}
              >
                {soundSettings.drone ? t('settings.droneOn') : t('settings.droneOff')}
              </button>
            </label>
            <select
              id="pattern-select"
              className="settings-card__select"
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
        </details>

        <details className="settings-card__details">
          <summary className="settings-card__summary">{t('settings.liveInput')}</summary>

          <div className="settings-card__input-container">
            <label htmlFor="midi-output-select" className="settings-card__label">
              {t('settings.midiInput')}{" "}
              <button className="settings-card__refresh-button" onClick={() => setRefresh((prev) => !prev)}>
                {t('settings.refresh')}
              </button>
            </label>
            <select
              id="midi-output-select"
              value={soundSettings.selectedMidiInputId || ""}
              onChange={(e) =>
                setSoundSettings((prev) => ({
                  ...prev,
                  selectedMidiInputId: e.target.value || null,
                }))
              }
              className="settings-card__select"
            >
              <option value="">{t('settings.chooseInput')}</option>
              {midiInputs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
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
            {soundSettings.inputType === "MIDI" && (
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
            )}
          </div>
        </details>

        <details className="settings-card__details">
          <summary className="settings-card__summary">{t('settings.envelope')}</summary>
          <div className="settings-card__input-container">
            <p>{t('settings.volume')} {(soundSettings.volume * 100).toFixed(0)}%</p>
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
          </div>

          <div className="settings-card__input-container">
            <p>{t('settings.droneVolume')} {(soundSettings.droneVolume ? Math.round(soundSettings.droneVolume * 100) : 0)}%</p>
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
          </div>

          <div className="settings-card__input-container">
            <p>{t('settings.attack')} {soundSettings.attack.toFixed(2)}</p>
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
          </div>

          <div className="settings-card__input-container">
            <p>Decay (s): {soundSettings.decay.toFixed(2)}</p>
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
          </div>

          <div className="settings-card__input-container">
            <p>Sustain: {soundSettings.sustain.toFixed(2)}</p>
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
          </div>

          <div className="settings-card__input-container">
            <p>{t('settings.release')} {soundSettings.release.toFixed(2)}</p>
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
          </div>
        </details>

        <details className="settings-card__details">
          <summary className="settings-card__summary">{t('settings.output')}</summary>
          <div className="settings-card__sound-mode">
            <button
              onClick={() => setSoundSettings((prev) => ({ ...prev, outputMode: "mute" }))}
              className={`settings-card__sound-mode-button ${soundSettings.outputMode === "mute" ? "settings-card__sound-mode-button_selected" : ""}`}
            >
              {t('settings.mute')}
            </button>
            <button
              onClick={() =>
                setSoundSettings((prev) => ({
                  ...prev,
                  outputMode: "waveform",
                }))
              }
              className={`settings-card__sound-mode-button ${
                soundSettings.outputMode === "waveform" ? "settings-card__sound-mode-button_selected" : ""
              }`}
            >
              {t('settings.waveformMode')}
            </button>
            <button
              onClick={() => setSoundSettings((prev) => ({ ...prev, outputMode: "midi" }))}
              className={`settings-card__sound-mode-button ${soundSettings.outputMode === "midi" ? "settings-card__sound-mode-button_selected" : ""}`}
            >
              Midi
            </button>
          </div>

          {soundSettings.outputMode === "waveform" && (
            <div className="settings-card__input-container">
              <label htmlFor="waveform-select" className="settings-card__label">
                {t('settings.waveform')}
              </label>
              <select
                id="waveform-select"
                value={soundSettings.waveform}
                onChange={handleWaveformChange}
                tabIndex={-1}
                aria-hidden="true"
                className="settings-card__select"
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
            </div>
          )}

          {soundSettings.outputMode === "midi" && (
            <>
              <div className="settings-card__input-container">
                <label htmlFor="midi-output-select" className="settings-card__label">
                  {t('settings.midiOutput')}{" "}
                  <button className="settings-card__refresh-button" onClick={() => setRefresh((prev) => !prev)}>
                    Refresh
                  </button>
                </label>
                <select
                  id="midi-output-select"
                  value={soundSettings.selectedMidiOutputId || ""}
                  onChange={(e) =>
                    setSoundSettings((prev) => ({
                      ...prev,
                      selectedMidiOutputId: e.target.value || null,
                    }))
                  }
                  className="settings-card__select"
                >
                  <option value="">{t('settings.chooseOutput')}</option>
                  {midiOutputs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-card__input-container">
                <label htmlFor="tempo-input" className="settings-card__label">
                  {t('settings.pitchBendRange')}
                </label>
                <input
                  type="number"
                  id="tempo-input"
                  value={soundSettings.pitchBendRange}
                  onChange={handlePitchBendRangeChange}
                  className="settings-card__number-input"
                  min={1}
                  max={96}
                />
              </div>
              <div className="settings-card__input-container">
                <label className="settings-card__label">
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
              </div>
            </>
          )}
        </details>

        {/* Reset Button */}
        <div className="settings-card__reset-container">
          <button
            onClick={resetToDefaults}
            className="settings-card__reset-button"
            title={t('settings.resetToDefaults')}
          >
            {t('settings.resetToDefaults')}
          </button>
        </div>
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
      style={{ position: "fixed", top: "20px", right: "20px", zIndex: 11000 }}
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
