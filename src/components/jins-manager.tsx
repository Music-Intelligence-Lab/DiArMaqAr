"use client";

import { useAppContext } from "@/contexts/app-context";
import Jins from "@/models/Jins";
import { SelectedCell } from "@/contexts/app-context";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

export default function JinsManager() {
  const {
    ajnas,
    selectedJins,
    setSelectedJins,
    updateAllAjnas,
    selectedCells,
    setSelectedCells,
    getNoteNamesUsedInTuningSystem,
    getSelectedCellDetails,
    clearSelections,
    setSelectedMaqam,
    playSequence,
    playNoteFrequency
  } = useAppContext();

  const usedNoteNames = getNoteNamesUsedInTuningSystem();

  const selectedCellDetails = selectedCells.map((cell) => {
    return getSelectedCellDetails(cell);
  });

  const handleSaveJins = async () => {
    if (!selectedJins) return;
    const newAjnas = ajnas.filter((jins) => jins.getId() !== selectedJins.getId());
    await updateAllAjnas([...newAjnas, selectedJins]);
  };

  // Stub handler for deleting a new jins entry.
  const handleDeleteJins = async () => {
    if (!selectedJins) return;
    const newAjnas = ajnas.filter((jins) => jins.getId() !== selectedJins.getId());
    await updateAllAjnas(newAjnas);
  };

  const checkIfJinsIsSelectable = (jins: Jins) => {
    return jins.getNoteNames().every((noteName) => usedNoteNames.includes(noteName));
  };

  const checkIfNoteNameIsUnsaved = (noteName: string) => {
    if (!selectedJins) return false;
    const id = selectedJins.getId();
    const originalJins = ajnas.find((jins) => jins.getId() === id);
    if (!originalJins) return false;
    const originalNoteNames = originalJins.getNoteNames();
    return !originalNoteNames.includes(noteName);
  };

  const handleClickJins = (jins: Jins) => {
    setSelectedJins(jins);
    setSelectedMaqam(null);

    const noteNames = jins.getNoteNames();

    const newSelectedCells: SelectedCell[] = [];

    const lengthOfUsedNoteNames = usedNoteNames.length;

    for (let i = 0; i < lengthOfUsedNoteNames; i++) {
      const usedNoteName = usedNoteNames[i];

      if (noteNames.includes(usedNoteName)) {
        let octave = 0;
        let index = i;

        while (index >= lengthOfUsedNoteNames / 4) {
          octave++;
          index -= lengthOfUsedNoteNames / 4;
        }

        newSelectedCells.push({
          octave,
          index,
        });
      }
    }

    setSelectedCells(newSelectedCells);
  };

  const playSelectedJins = () => {
    if (!selectedJins) return;
    const selectedCellFrequencies = selectedCells.map((cell) => {
      const cellDetails = getSelectedCellDetails(cell);
      return parseInt(cellDetails.frequency) ?? 0;
    });

    playSequence(selectedCellFrequencies)
  }

  return (
    <div className="jins-manager">
      <h2 className="jins-manager__header">
        Jins Manager{" "}
        {selectedJins && (
          <span className="jins-manager__selections">
            {`- ${selectedJins.getName()}`}{" "}
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
            <button className="jins-manager__play-button" onClick={playSelectedJins}>Play Selected Jins <PlayCircleIcon /></button>
          </span>
        )}
      </h2>

      <div className="jins-manager__list">
        {ajnas.length === 0 ? (
          <p>No ajnas available.</p>
        ) : (
          ajnas.map((jins, index) => (
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
