"use client";

import { Cell, useAppContext } from "@/contexts/app-context";
import Jins from "@/models/Jins";
// import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import React from "react";
import { getJinsTranspositions } from "@/functions/transpose";
import { updateAjnas } from "@/functions/update";
import { SourcePageReference } from "@/models/Source";


export default function JinsManager({ admin }: { admin: boolean }) {
  const {
    ajnas,
    setAjnas,
    selectedTuningSystem,
    selectedJins,
    setSelectedJins,
    handleClickJins,
    checkIfJinsIsSelectable,
    selectedCells,
    getSelectedCellDetails,
    clearSelections,
    // playSequence,
    getAllCells,
    sources,
  } = useAppContext();

  const sortedAjnas = [...ajnas].sort((a, b) => a.getName().localeCompare(b.getName()));

  // const selectedCellDetails = selectedCells.map((cell) => {
  //   return getSelectedCellDetails(cell);
  // });

  const allCells = getAllCells();

  const allCellDetails = allCells.map(getSelectedCellDetails);

  // const jinsCellDetails = selectedJins ? allCellDetails.filter((cell) => selectedJins.getNoteNames().includes(cell.noteName)) : [];

  const numberOfPitchClasses = selectedTuningSystem ? selectedTuningSystem.getPitchClasses().length : 0;

  const setOfAjnas = new Set(ajnas.map((j) => j.getId()));

  let newJinsIdNum = 1;
  while (setOfAjnas.has(newJinsIdNum.toString())) {
    newJinsIdNum++;
  }

  const newJinsId = newJinsIdNum.toString();

  const handleSaveJins = async () => {
    if (!selectedJins) return;
    const selectedNoteNames = selectedCells.map((cell: Cell) => {
      const details = getSelectedCellDetails(cell);
      return details.noteName;
    });

    const newJins = new Jins(selectedJins.getId(), selectedJins.getName(), selectedNoteNames, selectedJins.getSourcePageReferences());
    const newAjnas = ajnas.filter((jins) => jins.getId() !== newJins.getId());
    await updateAjnas([...newAjnas, newJins]);
    setAjnas([...newAjnas, newJins]);
  };

  // Stub handler for deleting a new jins entry.
  const handleDeleteJins = async () => {
    if (!selectedJins) return;
    const newAjnas = ajnas.filter((jins) => jins.getId() !== selectedJins.getId());
    await updateAjnas(newAjnas);
    setAjnas(newAjnas);
  };

  // const checkIfNoteNameIsUnsaved = (noteName: string) => {
  //   if (!selectedJins) return false;
  //   const id = selectedJins.getId();
  //   const originalJins = ajnas.find((jins) => jins.getId() === id);
  //   if (!originalJins) return false;
  //   const originalNoteNames = originalJins.getNoteNames();
  //   return !originalNoteNames.includes(noteName);
  // };

  // const playSelectedJins = () => {
  //   if (!selectedJins) return;
  //   const jinsCellFrequencies = jinsCellDetails.map((cellDetails) => parseInt(cellDetails.frequency) ?? 0);

  //   playSequence(jinsCellFrequencies);
  // };

  const updateSourceRefs = (refs: SourcePageReference[], index: number, newRef: Partial<SourcePageReference>) => {
    if (!selectedJins) return;
    const list = [...refs];
    list[index] = { ...list[index], ...newRef } as SourcePageReference;
    setSelectedJins(new Jins(selectedJins.getId(), selectedJins.getName(), selectedJins.getNoteNames(), list));
  };

  const removeSourceRef = (index: number) => {
    if (!selectedJins) return;
    const refs = selectedJins.getSourcePageReferences() || [];
    const newList = refs.filter((_, i) => i !== index);
    setSelectedJins(new Jins(selectedJins.getId(), selectedJins.getName(), selectedJins.getNoteNames(), newList));
  };

  const addSourceRef = () => {
    if (!selectedJins) return;
    const refs = selectedJins.getSourcePageReferences() || [];
    const newRef: SourcePageReference = { sourceId: "", page: "" };
    const newList = [...refs, newRef];
    setSelectedJins(new Jins(selectedJins.getId(), selectedJins.getName(), selectedJins.getNoteNames(), newList));
  };

  return (
    <div className="jins-manager">
      {/* <h2 className="jins-manager__header">
        Ajnās{` (${ajnas.filter((jins) => checkIfJinsIsSelectable(jins)).length}/${ajnas.length})`}
        {selectedJins && (
          <span className="jins-manager__selections">
            {`: ${selectedJins.getName()}`}{" "}
            {selectedCellDetails.length > 0 && (
              <>
                {" "}
                - Selected Notes:{" "}
                {selectedCellDetails.map((selectedCellDetail) => {
                  return (
                    <span
                      key={selectedCellDetail.noteName}
                      onClick={() => playNoteFrequency(parseInt(selectedCellDetail.frequency) ?? 0)}
                      className={"jins-manager__selected-note " + (checkIfNoteNameIsUnsaved(selectedCellDetail.noteName) ? "jins-manager__selected-note_unsaved" : "")}
                    >
                      {selectedCellDetail.noteName}{" "}
                    </span>
                  );
                })}
              </>
            )}
            <button className="jins-manager__play-button" onClick={playSelectedJins}>
              Play Selected Jins <PlayCircleIcon />
            </button>
          </span>
        )}
      </h2> */}

      <div className="jins-manager__list">
        {sortedAjnas.length === 0 ? (
          <p>No ajnas available.</p>
        ) : (
          sortedAjnas.map((jins, index) => (
            <div
              key={index}
              className={
                "jins-manager__item " +
                (jins.getName() === selectedJins?.getName() ? "jins-manager__item_selected " : "") +
                (checkIfJinsIsSelectable(jins) ? "jins-manager__item_active" : "")
              }
              onClick={() => {
                if (checkIfJinsIsSelectable(jins)) {
                  handleClickJins(jins);
                }
              }}
            >
              <div className="jins-manager__item-name">
                <strong>{jins.getName()}</strong>
                {checkIfJinsIsSelectable(jins) && (
                  <strong className="jins-manager__item-name-transpositions">{`Transpositions: ${getJinsTranspositions(allCellDetails, jins, true).length
                    }/${numberOfPitchClasses}`}</strong>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {admin && !selectedJins && (
        <button onClick={() => setSelectedJins(new Jins(newJinsId, "", [], []))} className="jins-manager__create-new-jins-button">
          Create New Jins
        </button>
      )}
      {admin && selectedJins && (
        <div className="jins-manager__jins-form">
          <input
            type="text"
            value={selectedJins.getName()}
            onChange={(e) =>
              setSelectedJins(new Jins(selectedJins.getId(), e.target.value, selectedJins.getNoteNames(), selectedJins.getSourcePageReferences()))
            }
            placeholder="Enter new jins name"
            className="jins-manager__jins-input"
          />
          <button onClick={handleSaveJins} className="jins-manager__save-button">
            Save
          </button>
          <button onClick={handleDeleteJins} className="jins-manager__delete-button">
            Delete
          </button>
          <button onClick={clearSelections} className="jins-manager__clear-button">
            Clear
          </button>
          {selectedJins && (
            <button className="jins-manager__source-add-button" onClick={addSourceRef}>
              Add Source
            </button>
          )}
          {selectedJins &&
            selectedJins.getSourcePageReferences().map((ref, idx) => (
              <div key={idx} className="jins-manager__source-item">
                <select
                  className="jins-manager__source-select"
                  value={ref.sourceId}
                  onChange={(e) => updateSourceRefs(selectedJins.getSourcePageReferences(), idx, { sourceId: e.target.value })}
                >
                  <option value="">Select source</option>
                  {sources.map((s) => (
                    <option key={s.getId()} value={s.getId()}>
                      {s.getTitleEnglish()}
                    </option>
                  ))}
                </select>
                <input
                  className="jins-manager__source-input"
                  type="text"
                  value={ref.page}
                  placeholder="Page"
                  onChange={(e) => updateSourceRefs(selectedJins.getSourcePageReferences(), idx, { page: e.target.value })}
                />
                <button className="jins-manager__source-delete-button" onClick={() => removeSourceRef(idx)}>
                  Delete
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
