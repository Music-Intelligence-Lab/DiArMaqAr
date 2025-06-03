"use client";

import React from "react";
import { Slider } from "@mui/material";
import { useAppContext } from "@/contexts/app-context";
// import { useFilterContext } from "@/contexts/filter-context";
import { useMenuContext } from "@/contexts/menu-context";
import SettingsIcon from "@mui/icons-material/Settings";

const SettingsCard = () => {
  const { soundSettings, setSoundSettings, clearSelections, midiInputs, midiOutputs, patterns, setRefresh } =
    useAppContext();

  const { openSettings, setOpenSettings} = useMenuContext();

  // const { filters, setFilters } = useFilterContext();

  const togglePanel = () => {
    setOpenSettings((prev) => !prev);
  };

  const handleSoundSettingsChange = (paramName: keyof typeof soundSettings) => (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setSoundSettings((prev) => ({ ...prev, [paramName]: newValue }));
    }
  };

  const handleWaveformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSoundSettings((prev) => ({ ...prev, waveform: e.target.value }));
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setSoundSettings((prev) => ({ ...prev, tempo: val }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setSoundSettings((prev) => ({ ...prev, duration: val }));
  };

  const handlePitchBendRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setSoundSettings((prev) => ({ ...prev, pitchBendRange: val }));
  };

  return (
    <>
      <button className="settings-open-button" onClick={togglePanel}>
        <SettingsIcon />
      </button>

      <div className={`settings-card ${openSettings ? "settings-card--open" : ""}`}>
        <div className="settings-card__content">
          <details className="settings-card__details">
            <summary className="settings-card__summary">Pattern</summary>
            <div className="settings-card__input-container">
              <label htmlFor="tempo-input" className="settings-card__label">
                Tempo (BPM):
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
              <label htmlFor="pattern-select" className="settings-card__label">
                Pattern Select:
              </label>
              <select
                id="pattern-select"
                className="settings-card__select"
                // use the Pattern’s id for the value
                value={soundSettings.selectedPattern ? soundSettings.selectedPattern.getId() : ""}
                onChange={(e) => {
                  const id = e.target.value;
                  // find the Pattern instance (or null if empty)
                  const pat = patterns.find((p) => p.getId() === id) ?? null;
                  setSoundSettings((prev) => ({ ...prev, selectedPattern: pat }));
                }}
              >
                <option value="">– none –</option>
                {patterns.map((p) => (
                  <option key={p.getId()} value={p.getId()}>
                    {p.getName()}
                  </option>
                ))}
              </select>
            </div>
          </details>

          <details className="settings-card__details">
            <summary className="settings-card__summary">Envelope</summary>
            <div className="settings-card__input-container">
              <label htmlFor="tempo-input" className="settings-card__label">
                Duration (s):
              </label>
              <input
                type="number"
                id="tempo-input"
                value={soundSettings.duration}
                onChange={handleDurationChange}
                className="settings-card__number-input"
                min={0.1}
                max={10}
              />
            </div>

            <div className="settings-card__input-container">
              <p>Volume: {(soundSettings.volume * 100).toFixed(0)}%</p>
              <Slider
                size="small"
                value={soundSettings.volume}
                min={0}
                max={1}
                step={0.01}
                onChange={(_e, newVal) => typeof newVal === "number" && setSoundSettings((prev) => ({ ...prev, volume: newVal }))}
                valueLabelDisplay="auto"
              />
            </div>

            <div className="settings-card__input-container">
              <p>Attack (s): {soundSettings.attack.toFixed(2)}</p>
              <Slider
                size="small"
                value={soundSettings.attack}
                min={0}
                max={10}
                step={0.01}
                onChange={handleSoundSettingsChange("attack")}
                valueLabelDisplay="auto"
              />
            </div>

            <div className="settings-card__input-container">
              <p>Decay (s): {soundSettings.decay.toFixed(2)}</p>
              <Slider
                size="small"
                value={soundSettings.decay}
                min={0}
                max={10}
                step={0.01}
                onChange={handleSoundSettingsChange("decay")}
                valueLabelDisplay="auto"
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
                valueLabelDisplay="auto"
              />
            </div>

            <div className="settings-card__input-container">
              <p>Release (s): {soundSettings.release.toFixed(2)}</p>
              <Slider
                size="small"
                value={soundSettings.release}
                min={0}
                max={10}
                step={0.01}
                onChange={handleSoundSettingsChange("release")}
                valueLabelDisplay="auto"
              />
            </div>
          </details>

          <details className="settings-card__details">
            <summary className="settings-card__summary">Sound Input</summary>
            <div className="settings-card__sound-mode">
              <button
                onClick={() => setSoundSettings((prev) => ({ ...prev, inputMode: "tuningSystem" }))}
                className={`settings-card__sound-mode-button ${soundSettings.inputMode === "tuningSystem" ? "settings-card__sound-mode-button_selected" : ""}`}
              >
                Tuning System
              </button>
              <button
                onClick={() => setSoundSettings((prev) => ({ ...prev, inputMode: "selection" }))}
                className={`settings-card__sound-mode-button ${soundSettings.inputMode === "selection" ? "settings-card__sound-mode-button_selected" : ""}`}
              >
                Selection
              </button>
            </div>

            <div className="settings-card__input-container">
              <label htmlFor="midi-output-select" className="settings-card__label">
                MIDI Input:{" "}
                <button className="settings-card__refresh-button" onClick={() => setRefresh((prev) => !prev)}>
                  Refresh
                </button>
              </label>
              <select
                id="midi-output-select"
                value={soundSettings.selectedMidiInputId || ""}
                onChange={(e) => setSoundSettings((prev) => ({ ...prev, selectedMidiInputId: e.target.value || null }))}
                className="settings-card__select"
              >
                <option value="">– choose an input –</option>
                {midiInputs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </details>

          <details className="settings-card__details">
            <summary className="settings-card__summary">Sound Output</summary>
            <div className="settings-card__sound-mode">
              <button
                onClick={() => setSoundSettings((prev) => ({ ...prev, outputMode: "mute" }))}
                className={`settings-card__sound-mode-button ${soundSettings.outputMode === "mute" ? "settings-card__sound-mode-button_selected" : ""}`}
              >
                Mute
              </button>
              <button
                onClick={() => setSoundSettings((prev) => ({ ...prev, outputMode: "waveform" }))}
                className={`settings-card__sound-mode-button ${soundSettings.outputMode === "waveform" ? "settings-card__sound-mode-button_selected" : ""}`}
              >
                Waveform
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
                  Waveform:
                </label>
                <select id="waveform-select" value={soundSettings.waveform} onChange={handleWaveformChange} className="settings-card__select">
                  <option value="sine">Sine</option>
                  <option value="square">Square</option>
                  <option value="sawtooth">Sawtooth</option>
                  <option value="triangle">Triangle</option>
                </select>
              </div>
            )}

            {soundSettings.outputMode === "midi" && (
              <>
                <div className="settings-card__input-container">
                  <label htmlFor="midi-output-select" className="settings-card__label">
                    MIDI Output:{" "}
                    <button className="settings-card__refresh-button" onClick={() => setRefresh((prev) => !prev)}>
                      Refresh
                    </button>
                  </label>
                  <select
                    id="midi-output-select"
                    value={soundSettings.selectedMidiOutputId || ""}
                    onChange={(e) => setSoundSettings((prev) => ({ ...prev, selectedMidiOutputId: e.target.value || null }))}
                    className="settings-card__select"
                  >
                    <option value="">– choose an output –</option>
                    {midiOutputs.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="settings-card__input-container">
                  <label htmlFor="tempo-input" className="settings-card__label">
                    Pitch Bend Range (semitones):
                  </label>
                  <input
                    type="number"
                    id="tempo-input"
                    value={soundSettings.pitchBendRange}
                    onChange={handlePitchBendRangeChange}
                    className="settings-card__number-input"
                    min={0}
                    max={50}
                  />
                </div>
              </>
            )}
          </details>

          {/* <details className="settings-card__details">
            <summary className="settings-card__summary">Filters</summary>
            {Object.keys(filters).map((key) => (
              <div key={key} className="settings-card__filter-container">
                <label htmlFor={`${key}-filter`} className="settings-card__filter-label">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}:
                </label>
                <label className="settings-card__filter-checkbox">
                  <input
                    type="checkbox"
                    id={`${key}-filter`}
                    checked={filters[key as keyof typeof filters]}
                    onChange={() => setFilters((prev) => ({ ...prev, [key]: !prev[key as keyof typeof filters] }))}
                    className="settings-card__checkbox"
                  />
                  <div className="checkmark"></div>
                </label>
              </div>
            ))}
          </details> */}

          <button className="settings-card__clear-button" onClick={clearSelections}>
            Clear Selections
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsCard;
