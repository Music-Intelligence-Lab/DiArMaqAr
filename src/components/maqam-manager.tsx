import React from "react";
import { CellDetails, useAppContext } from "@/contexts/app-context";
import Maqam from "@/models/Maqam";
import { SelectedCell } from "@/contexts/app-context";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

export default function MaqamManager() {
  const {
    maqamat,
    selectedMaqam,
    setSelectedMaqam,
    updateAllMaqamat,
    selectedCells,
    setSelectedCells,
    getNoteNamesUsedInTuningSystem,
    getSelectedCellDetails,
    isAscending,
    setIsAscending,
    clearSelections,
    playSequence,
    playNoteFrequency,
    handleClickMaqam,
    checkIfMaqamIsSelectable,
  } = useAppContext();

  const usedNoteNames = getNoteNamesUsedInTuningSystem();

  const ascendingNoteNamesCellDetails: CellDetails[] = [];
  const descendingNoteNamesCellDetails: CellDetails[] = [];

  if (selectedMaqam) {
    usedNoteNames.forEach((name, idx) => {
      if (selectedMaqam.getAscendingNoteNames().includes(name)) {
        let octave = 0;
        let index = idx;
        // assume 4 octaves evenly divided
        const perOct = usedNoteNames.length / 4;
        while (index >= perOct) {
          octave++;
          index -= perOct;
        }
        const cellDetails = getSelectedCellDetails({ octave, index });
        ascendingNoteNamesCellDetails.push(cellDetails);
      }
    });

    usedNoteNames.forEach((name, idx) => {
      if (selectedMaqam.getDescendingNoteNames().includes(name)) {
        let octave = 0;
        let index = idx;
        // assume 4 octaves evenly divided
        const perOct = usedNoteNames.length / 4;
        while (index >= perOct) {
          octave++;
          index -= perOct;
        }
        const cellDetails = getSelectedCellDetails({ octave, index });
        descendingNoteNamesCellDetails.push(cellDetails);
      }
    });

    descendingNoteNamesCellDetails.reverse();
  }

  // Map selectedCells to note names
  const selectedCellDetails = selectedCells.map((cell: SelectedCell) => {
    return getSelectedCellDetails(cell);
  });

  const selectedCellNoteNames = selectedCellDetails.map((cellDetail) => cellDetail.noteName);

  const checkIfNoteNameIsUnsaved = (noteName: string, ascending: boolean) => {
    if (!selectedMaqam) return true;
    const id = selectedMaqam.getId();
    const originalMaqam = maqamat.find((maqam) => maqam.getId() === id);
    if (!originalMaqam) return true;

    const originalNoteNames = ascending ? originalMaqam.getAscendingNoteNames() : originalMaqam.getDescendingNoteNames();

    return !originalNoteNames.includes(noteName);
  };

  // Save or update Maqam
  const handleSaveMaqam = async () => {
    if (!selectedMaqam) return;
    // build new Maqam instance with both asc and desc noteNames
    const ascNames = isAscending ? selectedCellNoteNames : selectedMaqam.getAscendingNoteNames();
    const descNames = !isAscending ? selectedCellNoteNames : selectedMaqam.getDescendingNoteNames();

    const updated = new Maqam(selectedMaqam.getId(), selectedMaqam.getName(), ascNames, descNames, selectedMaqam.getSuyur());

    const others = maqamat.filter((m) => m.getId() !== updated.getId());
    await updateAllMaqamat([...others, updated]);
    setSelectedMaqam(updated);
  };

  // Delete Maqam
  const handleDeleteMaqam = async () => {
    if (!selectedMaqam) return;
    const filtered = maqamat.filter((m) => m.getId() !== selectedMaqam.getId());
    await updateAllMaqamat(filtered);
    setSelectedMaqam(null);
    setSelectedCells([]);
  };

  const displayNoteNames = (cellDetails: CellDetails[], ascending: boolean) => {
    return cellDetails.map((cellDetail) => {
      return (
        <span
          key={cellDetail.noteName + " " + ascending}
          onClick={() => playNoteFrequency(parseInt(cellDetail.frequency) ?? 0)}
          className={
            "maqam-manager__selected-note " + (checkIfNoteNameIsUnsaved(cellDetail.noteName, ascending) ? "maqam-manager__selected-note_unsaved" : "")
          }
        >
          {cellDetail.noteName}{" "}
        </span>
      );
    });
  };

  const playSelectedMaqam = () => {
    if (!selectedMaqam) return;

    const maqamFrequencies: number[] = [];

    ascendingNoteNamesCellDetails.forEach((cellDetail) => {
      maqamFrequencies.push(parseInt(cellDetail.frequency) ?? 0);
    });

    descendingNoteNamesCellDetails.forEach((cellDetail) => {
      maqamFrequencies.push(parseInt(cellDetail.frequency) ?? 0);
    });

    playSequence(maqamFrequencies);
  };

  return (
    <div className="maqam-manager">
      <h2 className="maqam-manager__header">
        Maqam Manager
        {selectedMaqam && (
          <span className="maqam-manager__selections">
            {` - Selected Notes (${isAscending ? "Ascending" : "Descending"}): `} {displayNoteNames(selectedCellDetails, isAscending)}
            <button className="maqam-manager__toggle-button" onClick={() => setIsAscending((prev) => !prev)}>
              Switch to {isAscending ? "Descending" : "Ascending"}
            </button>
            <button className="maqam-manager__play-button" onClick={playSelectedMaqam}>
              Play Selected Maqam <PlayCircleIcon />
            </button>
          </span>
        )}
      </h2>
      {selectedMaqam && selectedMaqam.getAscendingNoteNames().length + selectedMaqam.getDescendingNoteNames().length > 0 && (
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
      )}

      <div className="maqam-manager__list">
        {maqamat.length === 0 ? (
          <p>No maqamat available.</p>
        ) : (
          maqamat.map((maqam, index) => (
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

          <button onClick={handleSaveMaqam} className="maqam-manager__save-button">
            Save
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
