"use client";

import React, { useState, useEffect } from "react";
import { getTuningSystems, getMaqamat } from "@/functions/import";
import TuningSystem from "@/models/TuningSystem";
import MaqamData from "@/models/Maqam";

type NoteName = string;

interface StatisticsFormData {
  maqamID: string;
  tuningSystemId: string;
  tuningSystemStartingNoteName: string;
  qararNoteName: string;
  includeTranspositions: boolean;
  includeMaqamToMaqamModulations: boolean;
  includeMaqamToJinsModulations: boolean;
  centsTolerance: number;
}

interface StatisticsResult {
  maqam: MaqamData;
  tuningSystems: { [key: string]: any };
}

function StatisticsClient() {
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [maqamat, setMaqamat] = useState<MaqamData[]>([]);
  const [availableStartingNotes, setAvailableStartingNotes] = useState<NoteName[]>([]);
  const [availableQararNotes, setAvailableQararNotes] = useState<NoteName[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatisticsResult | null>(null);

  const [formData, setFormData] = useState<StatisticsFormData>({
    maqamID: "",
    tuningSystemId: "",
    tuningSystemStartingNoteName: "",
    qararNoteName: "",
    includeTranspositions: true,
    includeMaqamToMaqamModulations: false,
    includeMaqamToJinsModulations: false,
    centsTolerance: 5,
  });

  // Load initial data
  useEffect(() => {
    try {
      const loadedTuningSystems = getTuningSystems();
      const loadedMaqamat = getMaqamat();
      setTuningSystems(loadedTuningSystems);
      setMaqamat(loadedMaqamat);

      // Set default selections if available
      if (loadedMaqamat.length > 0) {
        setFormData(prev => ({ ...prev, maqamID: loadedMaqamat[0].getId() }));
      }
      // Keep tuning system selection empty by default (ALL TUNING SYSTEMS)
    } catch (err) {
      setError("Failed to load initial data");
      console.error(err);
    }
  }, []);

  // Update available starting notes when tuning system changes
  useEffect(() => {
    if (formData.tuningSystemId) {
      const selectedSystem = tuningSystems.find(ts => ts.getId() === formData.tuningSystemId);
      if (selectedSystem) {
        const startingNotes = selectedSystem.getNoteNameSets().map((set: NoteName[]) => set[0]);
        setAvailableStartingNotes(startingNotes);
        
        // Reset starting note if current selection is not available in new system
        if (!startingNotes.includes(formData.tuningSystemStartingNoteName)) {
          setFormData(prev => ({ ...prev, tuningSystemStartingNoteName: "" }));
        }
      }
    } else {
      // When no tuning system is selected, show all possible starting notes from all systems
      const allStartingNotes = tuningSystems.flatMap(ts => 
        ts.getNoteNameSets().map((set: NoteName[]) => set[0])
      );
      const uniqueStartingNotes = Array.from(new Set(allStartingNotes));
      setAvailableStartingNotes(uniqueStartingNotes);
    }
  }, [formData.tuningSystemId, tuningSystems]);

  // Update available qarar notes based on tuning system and starting note
  useEffect(() => {
    if (formData.tuningSystemId && formData.tuningSystemStartingNoteName) {
      // Specific tuning system and starting note selected
      const selectedSystem = tuningSystems.find(ts => ts.getId() === formData.tuningSystemId);
      if (selectedSystem) {
        const selectedNoteSet = selectedSystem.getNoteNameSets().find((set: NoteName[]) => 
          set[0] === formData.tuningSystemStartingNoteName
        );
        if (selectedNoteSet) {
          const uniqueNotes = Array.from(new Set(selectedNoteSet));
          setAvailableQararNotes(uniqueNotes);
        }
      }
    } else if (formData.tuningSystemId) {
      // Only tuning system selected, show all notes from that system
      const selectedSystem = tuningSystems.find(ts => ts.getId() === formData.tuningSystemId);
      if (selectedSystem) {
        const allNotes = selectedSystem.getNoteNameSets().flat();
        const uniqueNotes = Array.from(new Set(allNotes));
        setAvailableQararNotes(uniqueNotes);
      }
    } else {
      // No specific tuning system selected, show all possible notes
      const allNotes = tuningSystems.flatMap(ts => ts.getNoteNameSets().flat());
      const uniqueNotes = Array.from(new Set(allNotes));
      setAvailableQararNotes(uniqueNotes);
    }
  }, [formData.tuningSystemId, formData.tuningSystemStartingNoteName, tuningSystems]);

  const handleFormChange = (field: keyof StatisticsFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const executeAnalysis = async () => {
    // Validate required fields - only maqam is required
    if (!formData.maqamID) {
      setError("Please select a maqam");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        maqamID: formData.maqamID,
        tuningSystemId: formData.tuningSystemId,
        tuningSystemStartingNoteName: formData.tuningSystemStartingNoteName,
        qararNoteName: formData.qararNoteName || undefined,
        includeTranspositions: formData.includeTranspositions,
        includeMaqamToMaqamModulations: formData.includeMaqamToMaqamModulations,
        includeMaqamToJinsModulations: formData.includeMaqamToJinsModulations,
        centsTolerance: formData.centsTolerance,
      };

      const response = await fetch("/api/maqam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute analysis");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
    setFormData({
      maqamID: maqamat[0]?.getId() || "",
      tuningSystemId: "", // Default to ALL TUNING SYSTEMS
      tuningSystemStartingNoteName: "",
      qararNoteName: "",
      includeTranspositions: true,
      includeMaqamToMaqamModulations: false,
      includeMaqamToJinsModulations: false,
      centsTolerance: 5,
    });
  };

  const getStatistics = () => {
    if (!result) return null;

    const tuningSystemKeys = Object.keys(result.tuningSystems);
    const totalTranspositions = tuningSystemKeys.reduce((acc, key) => {
      const data = result.tuningSystems[key];
      return acc + (Array.isArray(data) ? data.length : 1);
    }, 0);

    return {
      selectedMaqam: (result.maqam as any).name,
      tuningSystemsAnalyzed: tuningSystemKeys.length,
      totalTranspositions,
      hasModulations: formData.includeMaqamToMaqamModulations || formData.includeMaqamToJinsModulations,
    };
  };

  return (
    <div className="statistics-client">
      {/* Analysis Form */}
      <section className="statistics-client__form-section">
        <h2 className="statistics-client__section-title">Analysis Configuration</h2>
        
        <div className="statistics-client__form">
          <div className="statistics-client__form-grid">
            {/* Maqam Selection */}
            <div className="statistics-client__form-group">
              <label className="statistics-client__label">
                Maqām
                <select
                  className="statistics-client__select"
                  value={formData.maqamID}
                  onChange={(e) => handleFormChange("maqamID", e.target.value)}
                >
                  <option value="">Select Maqām...</option>
                  {maqamat.map((maqam) => (
                    <option key={maqam.getId()} value={maqam.getId()}>
                      {maqam.getName()}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Tuning System Selection */}
            <div className="statistics-client__form-group">
              <label className="statistics-client__label">
                Tuning System
                <select
                  className="statistics-client__select"
                  value={formData.tuningSystemId}
                  onChange={(e) => handleFormChange("tuningSystemId", e.target.value)}
                >
                  <option value="">ALL TUNING SYSTEMS</option>
                  {tuningSystems.map((ts) => (
                    <option key={ts.getId()} value={ts.getId()}>
                      {ts.getTitleEnglish()}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Starting Note Selection */}
            <div className="statistics-client__form-group">
              <label className="statistics-client__label">
                Starting Note
                <select
                  className="statistics-client__select"
                  value={formData.tuningSystemStartingNoteName}
                  onChange={(e) => handleFormChange("tuningSystemStartingNoteName", e.target.value)}
                >
                  <option value="">ALL STARTING NOTES</option>
                  {availableStartingNotes.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Qarar Note Selection (Optional) */}
            <div className="statistics-client__form-group">
              <label className="statistics-client__label">
                Qarar Note (Optional)
                <select
                  className="statistics-client__select"
                  value={formData.qararNoteName}
                  onChange={(e) => handleFormChange("qararNoteName", e.target.value)}
                  disabled={!formData.tuningSystemStartingNoteName}
                >
                  <option value="">Any Qarar...</option>
                  {availableQararNotes.map((note, index) => (
                    <option key={`${note}-${index}`} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Cents Tolerance */}
            <div className="statistics-client__form-group">
              <label className="statistics-client__label">
                Cents Tolerance
                <input
                  type="number"
                  className="statistics-client__input"
                  value={formData.centsTolerance}
                  onChange={(e) => handleFormChange("centsTolerance", parseInt(e.target.value) || 5)}
                  min="1"
                  max="50"
                />
              </label>
            </div>
          </div>

          {/* Options */}
          <div className="statistics-client__options">
            <h3 className="statistics-client__options-title">Analysis Options</h3>
            <div className="statistics-client__checkboxes">
              <label className="statistics-client__checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.includeTranspositions}
                  onChange={(e) => handleFormChange("includeTranspositions", e.target.checked)}
                />
                Include All Transpositions
              </label>
              <label className="statistics-client__checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.includeMaqamToMaqamModulations}
                  onChange={(e) => handleFormChange("includeMaqamToMaqamModulations", e.target.checked)}
                />
                Include Maqāmāt Modulations
              </label>
              <label className="statistics-client__checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.includeMaqamToJinsModulations}
                  onChange={(e) => handleFormChange("includeMaqamToJinsModulations", e.target.checked)}
                />
                Include Ajnās Modulations
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="statistics-client__actions">
            <button
              className="statistics-client__button statistics-client__button--primary"
              onClick={executeAnalysis}
              disabled={isLoading || !formData.maqamID}
            >
              {isLoading ? "Analyzing..." : "Run Analysis"}
            </button>
            <button
              className="statistics-client__button statistics-client__button--secondary"
              onClick={resetForm}
              disabled={isLoading}
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <section className="statistics-client__error">
          <h3>Error</h3>
          <p>{error}</p>
        </section>
      )}

      {/* Results Section */}
      {result && (
        <section className="statistics-client__results">
          <h2 className="statistics-client__section-title">Analysis Results</h2>
          
          {/* Statistics Summary */}
          {(() => {
            const stats = getStatistics();
            return stats ? (
              <div className="statistics-client__stats">
                <h3>Summary Statistics</h3>
                <div className="statistics-client__stats-grid">
                  <div className="statistics-client__stat">
                    <span className="statistics-client__stat-label">Maqām:</span>
                    <span className="statistics-client__stat-value">{stats.selectedMaqam}</span>
                  </div>
                  <div className="statistics-client__stat">
                    <span className="statistics-client__stat-label">Tuning Systems Analyzed:</span>
                    <span className="statistics-client__stat-value">{stats.tuningSystemsAnalyzed}</span>
                  </div>
                  <div className="statistics-client__stat">
                    <span className="statistics-client__stat-label">Total Transpositions:</span>
                    <span className="statistics-client__stat-value">{stats.totalTranspositions}</span>
                  </div>
                  <div className="statistics-client__stat">
                    <span className="statistics-client__stat-label">Modulations Included:</span>
                    <span className="statistics-client__stat-value">{stats.hasModulations ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Detailed Results */}
          <div className="statistics-client__detailed-results">
            <h3>Detailed Results</h3>
              {Object.entries(result.tuningSystems).map(([key, data]) => {
                const [tuningSystemId, startingNote] = key.split('_');
                const tuningSystemName = tuningSystems.find(ts => ts.getId() === tuningSystemId)?.getTitleEnglish() || tuningSystemId;
                
                return (
                  <div key={key} className="statistics-client__tuning-system-result">
                    <h4 className="statistics-client__tuning-system-title">
                      {tuningSystemName} → {startingNote}
                    </h4>
                    <div className="statistics-client__result-content">
                      {Array.isArray(data) ? (
                        // Multiple transpositions - display each in maqam-transpositions style
                        <div className="statistics-client__transpositions">
                          <p className="statistics-client__transpositions-summary">
                            Found {data.length} possible transposition{data.length !== 1 ? 's' : ''}
                          </p>
                          
                          {data.map((transposition: any, idx: number) => (
                            <div key={idx} className="statistics-client__transposition-section">
                              <h5 className="statistics-client__transposition-title">
                                Transposition {idx + 1}: {transposition.ascendingPitchClasses?.[0]?.noteName || 'Unknown'}
                              </h5>
                              
                              {/* Use maqam-transpositions table structure */}
                              <table className="statistics-client__maqam-table">
                                <tbody>
                                  {/* Ascending Section */}
                                  {transposition.ascendingPitchClasses && (
                                    <>
                                      <tr>
                                        <th className="statistics-client__section-header" colSpan={2 + transposition.ascendingPitchClasses.length * 2}>
                                          Ascending
                                        </th>
                                      </tr>
                                      <tr>
                                        <td className="statistics-client__asc-desc-column" rowSpan={6}>↗</td>
                                      </tr>
                                      
                                      {/* Scale Degrees */}
                                      <tr>
                                        <th className="statistics-client__row-header">Scale Degrees</th>
                                        {transposition.ascendingPitchClasses.map((_: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i] || (i + 1)}
                                            </th>
                                            {i < transposition.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* Note Names */}
                                      <tr>
                                        <th className="statistics-client__row-header">Note Names</th>
                                        {transposition.ascendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">{pc.noteName}</th>
                                            {i < transposition.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* Frequencies */}
                                      <tr>
                                        <th className="statistics-client__row-header">Frequency</th>
                                        {transposition.ascendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {typeof pc.frequency === 'number' ? pc.frequency.toFixed(3) : 'N/A'}
                                            </th>
                                            {i < transposition.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* MIDI Notes */}
                                      <tr>
                                        <th className="statistics-client__row-header">MIDI Note</th>
                                        {transposition.ascendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {typeof pc.midiNoteDecimal === 'number' ? pc.midiNoteDecimal.toFixed(3) : 'N/A'}
                                            </th>
                                            {i < transposition.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* Cents Deviation */}
                                      <tr>
                                        <th className="statistics-client__row-header">Cents Deviation</th>
                                        {transposition.ascendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {typeof pc.centsDeviation === 'number' ? pc.centsDeviation.toFixed(1) : 'N/A'}
                                            </th>
                                            {i < transposition.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                    </>
                                  )}
                                  
                                  {/* Spacer between ascending and descending */}
                                  {transposition.descendingPitchClasses && 
                                   JSON.stringify(transposition.descendingPitchClasses) !== JSON.stringify(transposition.ascendingPitchClasses) && (
                                    <tr>
                                      <td className="statistics-client__spacer-between" colSpan={2 + (transposition.ascendingPitchClasses?.length || 0) * 2}></td>
                                    </tr>
                                  )}
                                  
                                  {/* Descending Section */}
                                  {transposition.descendingPitchClasses && 
                                   JSON.stringify(transposition.descendingPitchClasses) !== JSON.stringify(transposition.ascendingPitchClasses) && (
                                    <>
                                      <tr>
                                        <td className="statistics-client__asc-desc-column" rowSpan={6}>↘</td>
                                      </tr>
                                      
                                      {/* Scale Degrees */}
                                      <tr>
                                        <th className="statistics-client__row-header">Scale Degrees</th>
                                        {transposition.descendingPitchClasses.map((_: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].reverse()[i] || (transposition.descendingPitchClasses.length - i)}
                                            </th>
                                            {i < transposition.descendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* Note Names */}
                                      <tr>
                                        <th className="statistics-client__row-header">Note Names</th>
                                        {transposition.descendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">{pc.noteName}</th>
                                            {i < transposition.descendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* Frequencies */}
                                      <tr>
                                        <th className="statistics-client__row-header">Frequency</th>
                                        {transposition.descendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {typeof pc.frequency === 'number' ? pc.frequency.toFixed(3) : 'N/A'}
                                            </th>
                                            {i < transposition.descendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* MIDI Notes */}
                                      <tr>
                                        <th className="statistics-client__row-header">MIDI Note</th>
                                        {transposition.descendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {typeof pc.midiNoteDecimal === 'number' ? pc.midiNoteDecimal.toFixed(3) : 'N/A'}
                                            </th>
                                            {i < transposition.descendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* Cents Deviation */}
                                      <tr>
                                        <th className="statistics-client__row-header">Cents Deviation</th>
                                        {transposition.descendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {typeof pc.centsDeviation === 'number' ? pc.centsDeviation.toFixed(1) : 'N/A'}
                                            </th>
                                            {i < transposition.descendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                    </>
                                  )}
                                </tbody>
                              </table>
                              
                              {/* Modulations */}
                              {(transposition.maqamatModulations || transposition.ajnasModulations) && (
                                <div className="statistics-client__modulations">
                                  <h6>Available Modulations</h6>
                                  {transposition.maqamatModulations && (
                                    <div className="statistics-client__modulation-section">
                                      <strong>Maqāmāt Modulations:</strong>
                                      <div className="statistics-client__modulation-grid">
                                        {Object.entries(transposition.maqamatModulations).map(([key, value]: [string, any]) => (
                                          key !== 'noteName2p' && Array.isArray(value) && value.length > 0 && (
                                            <div key={key} className="statistics-client__modulation-item">
                                              <strong>{key}:</strong> {value.join(', ')}
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {transposition.ajnasModulations && (
                                    <div className="statistics-client__modulation-section">
                                      <strong>Ajnās Modulations:</strong>
                                      <div className="statistics-client__modulation-grid">
                                        {Object.entries(transposition.ajnasModulations).map(([key, value]: [string, any]) => (
                                          key !== 'noteName2p' && Array.isArray(value) && value.length > 0 && (
                                            <div key={key} className="statistics-client__modulation-item">
                                              <strong>{key}:</strong> {value.join(', ')}
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Single result (tahlil or single transposition)
                        <div className="statistics-client__single-result">
                          {data.ascendingPitchClasses ? (
                            // Single transposition - same maqam-transpositions format
                            <div className="statistics-client__transposition-section">
                              <table className="statistics-client__maqam-table">
                                <tbody>
                                  {/* Ascending Section */}
                                  {data.ascendingPitchClasses && (
                                    <>
                                      <tr>
                                        <th className="statistics-client__section-header" colSpan={2 + data.ascendingPitchClasses.length * 2}>
                                          Ascending
                                        </th>
                                      </tr>
                                      <tr>
                                        <td className="statistics-client__asc-desc-column" rowSpan={6}>↗</td>
                                      </tr>
                                      
                                      {/* Scale Degrees */}
                                      <tr>
                                        <th className="statistics-client__row-header">Scale Degrees</th>
                                        {data.ascendingPitchClasses.map((_: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i] || (i + 1)}
                                            </th>
                                            {i < data.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* Note Names */}
                                      <tr>
                                        <th className="statistics-client__row-header">Note Names</th>
                                        {data.ascendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">{pc.noteName}</th>
                                            {i < data.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* Frequencies */}
                                      <tr>
                                        <th className="statistics-client__row-header">Frequency</th>
                                        {data.ascendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {typeof pc.frequency === 'number' ? pc.frequency.toFixed(3) : 'N/A'}
                                            </th>
                                            {i < data.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* MIDI Notes */}
                                      <tr>
                                        <th className="statistics-client__row-header">MIDI Note</th>
                                        {data.ascendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {typeof pc.midiNoteDecimal === 'number' ? pc.midiNoteDecimal.toFixed(3) : 'N/A'}
                                            </th>
                                            {i < data.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      
                                      {/* Cents Deviation */}
                                      <tr>
                                        <th className="statistics-client__row-header">Cents Deviation</th>
                                        {data.ascendingPitchClasses.map((pc: any, i: number) => (
                                          <React.Fragment key={i}>
                                            <th className="statistics-client__header-pitchClass">
                                              {typeof pc.centsDeviation === 'number' ? pc.centsDeviation.toFixed(1) : 'N/A'}
                                            </th>
                                            {i < data.ascendingPitchClasses.length - 1 && (
                                              <th className="statistics-client__header-pitchClass"></th>
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                    </>
                                  )}
                                </tbody>
                              </table>
                              
                              {/* Modulations */}
                              {(data.maqamatModulations || data.ajnasModulations) && (
                                <div className="statistics-client__modulations">
                                  <h6>Available Modulations</h6>
                                  {data.maqamatModulations && (
                                    <div className="statistics-client__modulation-section">
                                      <strong>Maqāmāt Modulations:</strong>
                                      <div className="statistics-client__modulation-grid">
                                        {Object.entries(data.maqamatModulations).map(([key, value]: [string, any]) => (
                                          key !== 'noteName2p' && Array.isArray(value) && value.length > 0 && (
                                            <div key={key} className="statistics-client__modulation-item">
                                              <strong>{key}:</strong> {value.join(', ')}
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {data.ajnasModulations && (
                                    <div className="statistics-client__modulation-section">
                                      <strong>Ajnās Modulations:</strong>
                                      <div className="statistics-client__modulation-grid">
                                        {Object.entries(data.ajnasModulations).map(([key, value]: [string, any]) => (
                                          key !== 'noteName2p' && Array.isArray(value) && value.length > 0 && (
                                            <div key={key} className="statistics-client__modulation-item">
                                              <strong>{key}:</strong> {value.join(', ')}
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            // Tahlil result - show raw JSON for now
                            <div className="statistics-client__tahlil-result">
                              <h5>Maqām Analysis (Tahlīl)</h5>
                              <pre className="statistics-client__json-display">
                                {JSON.stringify(data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}

export default StatisticsClient;