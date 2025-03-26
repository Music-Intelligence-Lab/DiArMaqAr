"use client";

import { useAppContext } from "@/contexts/app-context";
import React, { useState } from "react";

const AudioSettingsCard = () => {
  const { envelopeParams, setEnvelopeParams, playNoteFrequency } = useAppContext();
  const [frequency, setFrequency] = useState<number>(440);

  const handleEnvelopeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEnvelopeParams((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "white",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        padding: "20px",
        borderRadius: "8px",
        zIndex: 1000,
        width: "300px",
      }}
    >
      <h3>Audio Settings</h3>
      <div style={{ marginBottom: "10px" }}>
        <label>Attack (s): </label>
        <input
          type="number"
          step="0.01"
          name="attack"
          value={envelopeParams.attack}
          onChange={handleEnvelopeChange}
          style={{ width: "80px", marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Decay (s): </label>
        <input
          type="number"
          step="0.01"
          name="decay"
          value={envelopeParams.decay}
          onChange={handleEnvelopeChange}
          style={{ width: "80px", marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Sustain (level): </label>
        <input
          type="number"
          step="0.1"
          name="sustain"
          value={envelopeParams.sustain}
          onChange={handleEnvelopeChange}
          style={{ width: "80px", marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Release (s): </label>
        <input
          type="number"
          step="0.01"
          name="release"
          value={envelopeParams.release}
          onChange={handleEnvelopeChange}
          style={{ width: "80px", marginLeft: "10px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Frequency (Hz): </label>
        <input
          type="number"
          value={frequency}
          onChange={(e) => setFrequency(parseFloat(e.target.value))}
          style={{ width: "80px", marginLeft: "10px" }}
        />
      </div>
      <button
        onClick={() => playNoteFrequency(frequency)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Play Note
      </button>
    </div>
  );
};

export default AudioSettingsCard;
