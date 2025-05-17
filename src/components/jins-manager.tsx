"use client";

import { CellDetails, SelectedCell, useAppContext } from "@/contexts/app-context";
import Jins from "@/models/Jins";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import React from "react";

export default function JinsManager() {
  const {
    ajnas,
    selectedJins,
    setSelectedJins,
    handleClickJins,
    checkIfJinsIsSelectable,
    updateAllAjnas,
    selectedCells,
    getSelectedCellDetails,
    clearSelections,
    playSequence,
    getAllCells,
  } = useAppContext();

  const sortedAjnas = [...ajnas].sort((a, b) => a.getName().localeCompare(b.getName()));

  // const selectedCellDetails = selectedCells.map((cell) => {
  //   return getSelectedCellDetails(cell);
  // });

  const allCells = getAllCells();

  let jinsCellDetails: CellDetails[] = [];

  if (selectedJins) {
    jinsCellDetails = allCells.map((cell) => getSelectedCellDetails(cell)).filter((cell) => selectedJins.getNoteNames().includes(cell.noteName));
  }

  const handleSaveJins = async () => {
    if (!selectedJins) return;
    const selectedNoteNames = selectedCells.map((cell: SelectedCell) => {
      const details = getSelectedCellDetails(cell);
      return details.noteName;
    });

    const newJins = new Jins(selectedJins.getId(), selectedJins.getName(), selectedNoteNames);
    const newAjnas = ajnas.filter((jins) => jins.getId() !== newJins.getId());
    await updateAllAjnas([...newAjnas, newJins]);
  };

  // Stub handler for deleting a new jins entry.
  const handleDeleteJins = async () => {
    if (!selectedJins) return;
    const newAjnas = ajnas.filter((jins) => jins.getId() !== selectedJins.getId());
    await updateAllAjnas(newAjnas);
  };

  // const checkIfNoteNameIsUnsaved = (noteName: string) => {
  //   if (!selectedJins) return false;
  //   const id = selectedJins.getId();
  //   const originalJins = ajnas.find((jins) => jins.getId() === id);
  //   if (!originalJins) return false;
  //   const originalNoteNames = originalJins.getNoteNames();
  //   return !originalNoteNames.includes(noteName);
  // };

  const playSelectedJins = () => {
    if (!selectedJins) return;
    const jinsCellFrequencies = jinsCellDetails.map((cellDetails) => parseInt(cellDetails.frequency) ?? 0);

    playSequence(jinsCellFrequencies);
  };

  return (
    <div className="jins-manager">
      <h2 className="jins-manager__header">
        Ajnās{" "}
        {selectedJins && (
          <span className="jins-manager__selections">
            {`: ${selectedJins.getName()}`}{" "}
            {/* {selectedCellDetails.length > 0 && (
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
            )} */}
            <button className="jins-manager__play-button" onClick={playSelectedJins}>
              Play Selected Jins <PlayCircleIcon />
            </button>
          </span>
        )}
      </h2>

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
              </div>
            </div>
          ))
        )}
      </div>
      {!selectedJins && (
        <button onClick={() => setSelectedJins(new Jins((ajnas.length + 1).toString(), "", []))} className="jins-manager__create-new-jins-button">
          Create New Jins
        </button>
      )}
      {selectedJins && (
        <div className="jins-manager__jins-form">
          <input
            type="text"
            value={selectedJins.getName()}
            onChange={(e) => setSelectedJins(new Jins(selectedJins.getId(), e.target.value, selectedJins.getNoteNames()))}
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
        </div>
      )}
    </div>
  );
}
