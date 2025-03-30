"use client";

import React, { useState } from "react";
import { useAppContext } from "@/contexts/app-context";

// Material UI imports
import { Box, Slider } from "@mui/material";

const AudioSettingsCard = () => {
  const { envelopeParams, setEnvelopeParams } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  // Toggles the side panel
  const togglePanel = () => setIsOpen(!isOpen);

  // A helper function to update envelope parameters via MUI Slider
  const handleEnvelopeChange =
    (paramName: string) => (event: Event, newValue: number | number[]) => {
      if (typeof newValue === "number") {
        setEnvelopeParams((prev) => ({
          ...prev,
          [paramName]: newValue,
        }));
      }
    };

  return (
    <>
      {/* The "Open" button (only shown when panel is closed) */}
      {!isOpen && (
        <button className="audio-settings-open-button" onClick={togglePanel}>
          Open
        </button>
      )}

      <div
        className={`audio-settings-card ${
          isOpen ? "audio-settings-card--open" : ""
        }`}
      >
        {/* The "Close" button (only shown when panel is open) */}
        {isOpen && (
          <button
            className="audio-settings-card__close-button"
            onClick={togglePanel}
          >
            Close
          </button>
        )}

        <div className="audio-settings-card__content">
          <h3 className="audio-settings-card__title">Audio Settings</h3>

          {/* Attack Slider */}
          <Box sx={{ width: 200, marginBottom: "16px" }}>
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

          {/* Decay Slider */}
          <Box sx={{ width: 200, marginBottom: "16px" }}>
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

          {/* Sustain Slider */}
          <Box sx={{ width: 200, marginBottom: "16px" }}>
            <p>Sustain: {envelopeParams.sustain.toFixed(2)}</p>
            <Slider
              size="small"
              value={envelopeParams.sustain}
              min={0}
              max={10}
              step={0.01}
              onChange={handleEnvelopeChange("sustain")}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Release Slider */}
          <Box sx={{ width: 200, marginBottom: "16px" }}>
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
        </div>
      </div>
    </>
  );
};

export default AudioSettingsCard;
