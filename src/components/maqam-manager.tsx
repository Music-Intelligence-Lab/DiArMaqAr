import React from "react";
import { CellDetails, useAppContext } from "@/contexts/app-context";
import Maqam from "@/models/Maqam";
import { Cell } from "@/contexts/app-context";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getMaqamTranspositions } from "@/functions/transpose";

export default function MaqamManager() {
  const {
    maqamat,
    selectedMaqam,
    setSelectedMaqam,
    updateAllMaqamat,
    selectedCells,
    setSelectedCells,
    getAllCells,
    getSelectedCellDetails,
    clearSelections,
    playSequence,
    handleClickMaqam,
    checkIfMaqamIsSelectable,
    selectedTuningSystem
  } = useAppContext();

  const numberOfPitchClasses = selectedTuningSystem ? selectedTuningSystem.getPitchClasses().length : 0;

  const sortedMaqamat = [...maqamat].sort((a, b) => a.getName().localeCompare(b.getName()));

  const allCells = getAllCells();

  const allCellDetails = allCells.map(getSelectedCellDetails);

  let ascendingMaqamCellDetails: CellDetails[] = [];
  let descendingMaqamCellDetails: CellDetails[] = [];

  if (selectedMaqam) {
    ascendingMaqamCellDetails = allCells
      .map((cell) => getSelectedCellDetails(cell))
      .filter((cell) => selectedMaqam.getAscendingNoteNames().includes(cell.noteName));
    descendingMaqamCellDetails = allCells
      .map((cell) => getSelectedCellDetails(cell))
      .filter((cell) => selectedMaqam.getDescendingNoteNames().includes(cell.noteName))
      .reverse();
  }

  // Map selectedCells to note names
  const selectedCellDetails = selectedCells.map((cell: Cell) => {
    return getSelectedCellDetails(cell);
  });

  const selectedCellNoteNames = selectedCellDetails.map((cellDetail) => cellDetail.noteName);

  // const checkIfNoteNameIsUnsaved = (noteName: string, ascending: boolean) => {
  //   if (!selectedMaqam) return true;
  //   const id = selectedMaqam.getId();
  //   const originalMaqam = maqamat.find((maqam) => maqam.getId() === id);
  //   if (!originalMaqam) return true;

  //   const originalNoteNames = ascending ? originalMaqam.getAscendingNoteNames() : originalMaqam.getDescendingNoteNames();

  //   return !originalNoteNames.includes(noteName);
  // };

  // Save or update Maqam
  const handleSaveMaqam = async (maqam: Maqam) => {
    if (!selectedMaqam) return;

    const others = maqamat.filter((m) => m.getId() !== maqam.getId());
    await updateAllMaqamat([...others, maqam]);
    setSelectedMaqam(maqam);
  };

  const handleSaveAscending = async () => {
    if (!selectedMaqam) return;

    const descendingNoteNames =
      selectedMaqam.getDescendingNoteNames().length > 0 ? selectedMaqam.getDescendingNoteNames() : [...selectedCellNoteNames].reverse();

    const updated = new Maqam(selectedMaqam.getId(), selectedMaqam.getName(), selectedCellNoteNames, descendingNoteNames, selectedMaqam.getSuyur());
    handleSaveMaqam(updated);
  };

  const handleSaveDescending = async () => {
    if (!selectedMaqam) return;

    const updated = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      selectedMaqam.getAscendingNoteNames(),
      selectedCellNoteNames.reverse(),
      selectedMaqam.getSuyur()
    );
    handleSaveMaqam(updated);
  };

  // Delete Maqam
  const handleDeleteMaqam = async () => {
    if (!selectedMaqam) return;
    const filtered = maqamat.filter((m) => m.getId() !== selectedMaqam.getId());
    await updateAllMaqamat(filtered);
    setSelectedMaqam(null);
    setSelectedCells([]);
  };

  // const displayNoteNames = (cellDetails: CellDetails[], ascending: boolean) => {
  //   return cellDetails.map((cellDetail) => {
  //     return (
  //       <span
  //         key={cellDetail.noteName + " " + ascending}
  //         onClick={() => playNoteFrequency(parseInt(cellDetail.frequency) ?? 0)}
  //         className={
  //           "maqam-manager__selected-note " + (checkIfNoteNameIsUnsaved(cellDetail.noteName, ascending) ? "maqam-manager__selected-note_unsaved" : "")
  //         }
  //       >
  //         {cellDetail.noteName}{" "}
  //       </span>
  //     );
  //   });
  // };

  const playSelectedMaqam = () => {
    if (!selectedMaqam) return;

    const maqamFrequencies: number[] = [];

    ascendingMaqamCellDetails.forEach((cellDetail) => {
      maqamFrequencies.push(parseInt(cellDetail.frequency) ?? 0);
    });

    descendingMaqamCellDetails.forEach((cellDetail) => {
      maqamFrequencies.push(parseInt(cellDetail.frequency) ?? 0);
    });

    playSequence(maqamFrequencies);
  };

  return (
    <div className="maqam-manager">
      <h2 className="maqam-manager__header">
        Maqāmāt {`(${maqamat.filter((maqam) => checkIfMaqamIsSelectable(maqam)).length}/${maqamat.length})`}
        {selectedMaqam && (
          <span className="maqam-manager__selections">
            {`: ${selectedMaqam.getName()}`}{" "}
            {/* {` - Selected Notes: `} {displayNoteNames(selectedCellDetails, isAscending)}
            { <button className="maqam-manager__toggle-button" onClick={() => setIsAscending((prev) => !prev)}>
              Switch to {isAscending ? "Descending" : "Ascending"}
            </button> } */}
            <button className="maqam-manager__play-button" onClick={playSelectedMaqam}>
              <PlayCircleIcon /> Play Selected Maqam
            </button>
          </span>
        )}
      </h2>
      {/* {selectedMaqam && selectedMaqam.getAscendingNoteNames().length + selectedMaqam.getDescendingNoteNames().length > 0 && (
        <>
          <div className="maqam-manager__rows">
            {isAscending ? (
              <>
                <div className="maqam-manager__selections-row">Ascending: {displayNoteNames(ascendingNoteNamesCellDetails, true)}</div>
                <div className="maqam-manager__selections-row">Descending: {displayNoteNames(descendingNoteNamesCellDetails, false)}</div>
              </>
            ) : (
              <>
                <div className="maqam-manager__selections-row">Descending: {displayNoteNames(descendingNoteNamesCellDetails, false)}</div>
                <div className="maqam-manager__selections-row">Ascending: {displayNoteNames(ascendingNoteNamesCellDetails, true)}</div>
              </>
            )}
          </div>
        </>
      )} */}

      <div className="maqam-manager__list">
        {sortedMaqamat.length === 0 ? (
          <p>No maqamat available.</p>
        ) : (
          sortedMaqamat.map((maqam, index) => (
            <div
              key={index}
              className={
                "maqam-manager__item " +
                (maqam.getName() === selectedMaqam?.getName() ? "maqam-manager__item_selected " : "") +
                (checkIfMaqamIsSelectable(maqam) ? "maqam-manager__item_active" : "")
              }
              onClick={() => {
                if (checkIfMaqamIsSelectable(maqam)) {
                  handleClickMaqam(maqam);
                }
              }}
            >
              <div className="maqam-manager__item-name">
                <strong>{maqam.getName()}</strong>
                {checkIfMaqamIsSelectable(maqam) && <strong>{`Transpositions: ${getMaqamTranspositions(allCellDetails, maqam).length - 1}/${numberOfPitchClasses - 1}`}</strong>}
              </div>
            </div>
          ))
        )}
      </div>

      {!selectedMaqam && (
        <button
          onClick={() => setSelectedMaqam(new Maqam((maqamat.length + 1).toString(), "", [], [], []))}
          className="maqam-manager__create-new-maqam-button"
        >
          Create New Maqam
        </button>
      )}

      {selectedMaqam && (
        <div className="maqam-manager__maqam-form">
          <input
            type="text"
            value={selectedMaqam.getName()}
            onChange={(e) =>
              setSelectedMaqam(
                new Maqam(
                  selectedMaqam.getId(),
                  e.target.value,
                  selectedMaqam.getAscendingNoteNames(),
                  selectedMaqam.getDescendingNoteNames(),
                  selectedMaqam.getSuyur()
                )
              )
            }
            placeholder="Enter maqam name"
            className="maqam-manager__maqam-input"
          />

          <button onClick={() => handleSaveMaqam(selectedMaqam)} className="maqam-manager__save-button">
            Save Details
          </button>

          <button onClick={handleSaveAscending} className="maqam-manager__save-button">
            Save Ascending
          </button>

          <button onClick={handleSaveDescending} className="maqam-manager__save-button">
            Save Descending
          </button>

          <button onClick={handleDeleteMaqam} className="maqam-manager__delete-button">
            Delete
          </button>

          <button onClick={clearSelections} className="maqam-manager__clear-button">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
