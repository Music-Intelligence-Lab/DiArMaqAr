import React from "react";
import { useAppContext } from "@/contexts/app-context";
import Maqam from "@/models/Maqam";
import { SelectedCell } from "@/contexts/app-context";

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
    setSelectedJins,
  } = useAppContext();

  // Derive displayed note names based on current selection and mode
  const usedNoteNames = getNoteNamesUsedInTuningSystem();

  // Map selectedCells to note names
  const selectedCellNoteNames = selectedCells.map((cell: SelectedCell) => {
    return getSelectedCellDetails(cell).noteName;
  });

  const checkIfMaqamIsSelectable = (maqam: Maqam) => {
    return (
      maqam.getAscendingNoteNames().every((noteName) => usedNoteNames.includes(noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => usedNoteNames.includes(noteName))
    );
  };

  const checkIfNoteNameIsUnsaved = (noteName: string, ascending: boolean) => {
    if (!selectedMaqam) return true;
    const id = selectedMaqam.getId();
    const originalMaqam = maqamat.find((maqam) => maqam.getId() === id);
    if (!originalMaqam) return true;

    const originalNoteNames = ascending ? originalMaqam.getAscendingNoteNames() : originalMaqam.getDescendingNoteNames();

    return !originalNoteNames.includes(noteName);
  };

  // Handle clicking on a Maqam in the list
  const handleClickMaqam = (maqam: Maqam) => {
    // when selecting, populate cells for asc or desc based on stored noteNames
    setSelectedMaqam(maqam);
    console.log(maqam)
    setSelectedJins(null);
    const namesToSelect = isAscending ? maqam.getAscendingNoteNames() : maqam.getDescendingNoteNames();

    // translate names back into SelectedCell[] by matching against usedNoteNames
    const newCells: SelectedCell[] = [];
    usedNoteNames.forEach((name, idx) => {
      if (namesToSelect.includes(name)) {
        let octave = 0;
        let index = idx;
        // assume 4 octaves evenly divided
        const perOct = usedNoteNames.length / 4;
        while (index >= perOct) {
          octave++;
          index -= perOct;
        }
        newCells.push({ octave, index });
      }
    });
    setSelectedCells(newCells);
  };

  // Save or update Maqam
  const handleSaveMaqam = async () => {
    if (!selectedMaqam) return;
    // build new Maqam instance with both asc and desc noteNames
    const ascNames = isAscending ? selectedCellNoteNames : selectedMaqam.getAscendingNoteNames();
    const descNames = !isAscending ? selectedCellNoteNames : selectedMaqam.getDescendingNoteNames();

    const updated = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      ascNames,
      descNames,
      selectedMaqam.getSuyur()
    );

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

  const displayNoteNames = (noteNames: string[], ascending: boolean) => {
    return noteNames.map((noteName) => {
      return (
        <span
          key={noteName + " " + ascending}
          className={"maqam-manager__selected-note " + (checkIfNoteNameIsUnsaved(noteName, ascending) ? "maqam-manager__selected-note_unsaved" : "")}
        >
          {noteName}{" "}
        </span>
      );
    });
  };

  return (
    <div className="maqam-manager">
      <h2 className="maqam-manager__header">
        Maqam Manager
        {selectedMaqam && (
          <span className="maqam-manager__selections">
            {` - Selected Notes (${isAscending ? "Ascending" : "Descending"}): `} {displayNoteNames(selectedCellNoteNames, isAscending)}
            <button className="maqam-manager__toggle-button" onClick={() => setIsAscending((prev) => !prev)}>
              Switch to {isAscending ? "Descending" : "Ascending"}
            </button>
          </span>
        )}
      </h2>
      {selectedMaqam && selectedMaqam.getAscendingNoteNames().length + selectedMaqam.getDescendingNoteNames().length > 0 && (
        <>
          <div className="maqam-manager__selections">
            {isAscending ? (
              <>
                <div className="maqam-manager__selections-row">Ascending: {displayNoteNames(selectedMaqam.getAscendingNoteNames(), true)}</div>
                <div className="maqam-manager__selections-row">Descending: {displayNoteNames(selectedMaqam.getDescendingNoteNames(), false)}</div>
              </>
            ) : (
              <>
                <div className="maqam-manager__selections-row">Descending: {displayNoteNames(selectedMaqam.getDescendingNoteNames(), false)}</div>
                <div className="maqam-manager__selections-row">Ascending: {displayNoteNames(selectedMaqam.getAscendingNoteNames(), true)}</div>
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
                new Maqam(selectedMaqam.getId(), e.target.value, selectedMaqam.getAscendingNoteNames(), selectedMaqam.getDescendingNoteNames(), selectedMaqam.getSuyur())
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
