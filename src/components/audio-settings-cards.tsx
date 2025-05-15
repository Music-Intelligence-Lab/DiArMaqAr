"use client";

import React, { useState } from "react";
import { Box, Slider } from "@mui/material";
import { useAppContext } from "@/contexts/app-context";

const AudioSettingsCard = () => {
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
    midiOutputs,
    selectedMidiOutputId,
    setSelectedMidiOutputId,
    soundMode,
    setSoundMode,
  } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => setIsOpen(!isOpen);

  // ADSR slider handler
  const handleEnvelopeChange = (paramName: keyof typeof envelopeParams) => (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setEnvelopeParams((prev) => ({ ...prev, [paramName]: newValue }));
    }
  };

  // Waveform select handler
  const handleWaveformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEnvelopeParams((prev) => ({ ...prev, waveform: e.target.value }));
  };

  // Tempo number input handler
  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setTempo(val);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setDuration(val);
  };

  return (
    <>
      <button className="audio-settings-open-button" onClick={togglePanel}>
        {isOpen ? "Close" : "Open"}
      </button>

      <div className={`audio-settings-card ${isOpen ? "audio-settings-card--open" : ""}`}>
        <div className="audio-settings-card__content">
          <h3 className="audio-settings-card__title">Audio Settings</h3>

          {/* Tempo Input */}
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="tempo-input" style={{ display: "block", marginBottom: "4px" }}>
              Tempo (BPM):
            </label>
            <input
              type="number"
              id="tempo-input"
              value={tempo}
              onChange={handleTempoChange}
              className="audio-settings-card__number-input"
              min={20}
              max={300}
            />
          </div>

          {/* Note Duration Input */}
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="tempo-input" style={{ display: "block", marginBottom: "4px" }}>
              Duration (s):
            </label>
            <input
              type="number"
              id="tempo-input"
              value={duration}
              onChange={handleDurationChange}
              className="audio-settings-card__number-input"
              min={0.1}
              max={10}
            />
          </div>

          {/* Volume Input */}
          <Box sx={{ width: 200, mb: 2 }}>
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
          </Box>

          {/* Attack */}
          <Box sx={{ width: 200, mb: 2 }}>
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
          </Box>

          {/* Decay */}
          <Box sx={{ width: 200, mb: 2 }}>
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
          </Box>

          {/* Sustain */}
          <Box sx={{ width: 200, mb: 2 }}>
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
          </Box>

          {/* Release */}
          <Box sx={{ width: 200, mb: 2 }}>
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
          </Box>

          <div>Sound Output:</div>
          <div className="audio-settings-card__sound-mode">
            <button
              onClick={() => setSoundMode("mute")}
              className={`audio-settings-card__sound-mode-button ${soundMode === "mute" ? "audio-settings-card__sound-mode-button_selected" : ""}`}
            >
              Mute
            </button>
            <button
              onClick={() => setSoundMode("waveform")}
              className={`audio-settings-card__sound-mode-button ${
                soundMode === "waveform" ? "audio-settings-card__sound-mode-button_selected" : ""
              }`}
            >
              Waveform
            </button>
            <button
              onClick={() => setSoundMode("midi")}
              className={`audio-settings-card__sound-mode-button ${soundMode === "midi" ? "audio-settings-card__sound-mode-button_selected" : ""}`}
            >
              Midi
            </button>
          </div>

          {/* Waveform Select */}
          {soundMode === "waveform" && (
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="waveform-select" style={{ display: "block", marginBottom: "4px" }}>
                Waveform:
              </label>
              <select id="waveform-select" value={envelopeParams.waveform} onChange={handleWaveformChange} className="audio-settings-card__select">
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
          )}
          
          {soundMode === "midi" && (
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="midi-output-select" style={{ display: "block", marginBottom: "4px" }}>
                MIDI Output:
              </label>
              <select
                id="midi-output-select"
                value={selectedMidiOutputId || ""}
                onChange={(e) => setSelectedMidiOutputId(e.target.value || null)}
                className="audio-settings-card__select"
              >
                <option value="">– choose an output –</option>
                {midiOutputs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="audio-settings-card__clear-button" onClick={clearSelections}>
            Clear Selections
          </button>
        </div>
      </div>
    </>
  );
};

export default AudioSettingsCard;
