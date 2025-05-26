"use client";

import React from "react";
import { Slider } from "@mui/material";
import { useAppContext } from "@/contexts/app-context";
import { useFilterContext } from "@/contexts/filter-context";
import { useMenuContext } from "@/contexts/menu-context";
import SettingsIcon from "@mui/icons-material/Settings";

const SettingsCard = () => {
  const {
    envelopeParams,
    setEnvelopeParams,
    clearSelections,
    volume,
    setVolume,
    duration,
    setDuration,
    tempo,
    setTempo,
    midiInputs,
    selectedMidiInputId,
    setSelectedMidiInputId,
    midiOutputs,
    selectedMidiOutputId,
    setSelectedMidiOutputId,
    inputMode,
    setInputMode,
    outputMode,
    setOutputMode,
    pitchBendRange,
    setPitchBendRange,
    patterns,
    selectedPattern,
    setSelectedPattern,
    setRefresh,
  } = useAppContext();

  const { openSettings, setOpenSettings, setOpenBottomDrawer, setOpenNavigation } = useMenuContext();

  const { filters, setFilters } = useFilterContext();

  const togglePanel = () => {
    setOpenSettings((prev) => !prev);
    setOpenBottomDrawer(false);
    setOpenNavigation(false);
  };

  const handleEnvelopeChange = (paramName: keyof typeof envelopeParams) => (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setEnvelopeParams((prev) => ({ ...prev, [paramName]: newValue }));
    }
  };

  const handleWaveformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEnvelopeParams((prev) => ({ ...prev, waveform: e.target.value }));
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setTempo(val);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setDuration(val);
  };

  const handlePitchBendRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setPitchBendRange(val);
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
                value={tempo}
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
                value={selectedPattern ? selectedPattern.getId() : ""}
                onChange={(e) => {
                  const id = e.target.value;
                  // find the Pattern instance (or null if empty)
                  const pat = patterns.find((p) => p.getId() === id) ?? null;
                  setSelectedPattern(pat);
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
                value={duration}
                onChange={handleDurationChange}
                className="settings-card__number-input"
                min={0.1}
                max={10}
              />
            </div>

            <div className="settings-card__input-container">
              <p>Volume: {(volume * 100).toFixed(0)}%</p>
              <Slider
                size="small"
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={(_e, newVal) => typeof newVal === "number" && setVolume(newVal)}
                valueLabelDisplay="auto"
              />
            </div>

            <div className="settings-card__input-container">
              <p>Attack (s): {envelopeParams.attack.toFixed(2)}</p>
              <Slider
                size="small"
                value={envelopeParams.attack}
                min={0}
                max={10}
                step={0.01}
                onChange={handleEnvelopeChange("attack")}
                valueLabelDisplay="auto"
              />
            </div>

            <div className="settings-card__input-container">
              <p>Decay (s): {envelopeParams.decay.toFixed(2)}</p>
              <Slider
                size="small"
                value={envelopeParams.decay}
                min={0}
                max={10}
                step={0.01}
                onChange={handleEnvelopeChange("decay")}
                valueLabelDisplay="auto"
              />
            </div>

            <div className="settings-card__input-container">
              <p>Sustain: {envelopeParams.sustain.toFixed(2)}</p>
              <Slider
                size="small"
                value={envelopeParams.sustain}
                min={0}
                max={1}
                step={0.01}
                onChange={handleEnvelopeChange("sustain")}
                valueLabelDisplay="auto"
              />
            </div>

            <div className="settings-card__input-container">
              <p>Release (s): {envelopeParams.release.toFixed(2)}</p>
              <Slider
                size="small"
                value={envelopeParams.release}
                min={0}
                max={10}
                step={0.01}
                onChange={handleEnvelopeChange("release")}
                valueLabelDisplay="auto"
              />
            </div>
          </details>

          <details className="settings-card__details">
            <summary className="settings-card__summary">Sound Input</summary>
            <div className="settings-card__sound-mode">
              <button
                onClick={() => setInputMode("tuningSystem")}
                className={`settings-card__sound-mode-button ${inputMode === "tuningSystem" ? "settings-card__sound-mode-button_selected" : ""}`}
              >
                Tuning System
              </button>
              <button
                onClick={() => setInputMode("selection")}
                className={`settings-card__sound-mode-button ${inputMode === "selection" ? "settings-card__sound-mode-button_selected" : ""}`}
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
                value={selectedMidiInputId || ""}
                onChange={(e) => setSelectedMidiInputId(e.target.value || null)}
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
                onClick={() => setOutputMode("mute")}
                className={`settings-card__sound-mode-button ${outputMode === "mute" ? "settings-card__sound-mode-button_selected" : ""}`}
              >
                Mute
              </button>
              <button
                onClick={() => setOutputMode("waveform")}
                className={`settings-card__sound-mode-button ${outputMode === "waveform" ? "settings-card__sound-mode-button_selected" : ""}`}
              >
                Waveform
              </button>
              <button
                onClick={() => setOutputMode("midi")}
                className={`settings-card__sound-mode-button ${outputMode === "midi" ? "settings-card__sound-mode-button_selected" : ""}`}
              >
                Midi
              </button>
            </div>

            {outputMode === "waveform" && (
              <div className="settings-card__input-container">
                <label htmlFor="waveform-select" className="settings-card__label">
                  Waveform:
                </label>
                <select id="waveform-select" value={envelopeParams.waveform} onChange={handleWaveformChange} className="settings-card__select">
                  <option value="sine">Sine</option>
                  <option value="square">Square</option>
                  <option value="sawtooth">Sawtooth</option>
                  <option value="triangle">Triangle</option>
                </select>
              </div>
            )}

            {outputMode === "midi" && (
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
                    value={selectedMidiOutputId || ""}
                    onChange={(e) => setSelectedMidiOutputId(e.target.value || null)}
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
                    value={pitchBendRange}
                    onChange={handlePitchBendRangeChange}
                    className="settings-card__number-input"
                    min={0}
                    max={50}
                  />
                </div>
              </>
            )}
          </details>

          <details className="settings-card__details">
            <summary className="settings-card__summary">Filters</summary>
            {
              Object.keys(filters).map((key) => (
                <div key={key} className="settings-card__filter-container">
                  <label htmlFor={`${key}-filter`} className="settings-card__filter-label">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
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
              ))
            }
          </details>

          <button className="settings-card__clear-button" onClick={clearSelections}>
            Clear Selections
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsCard;
