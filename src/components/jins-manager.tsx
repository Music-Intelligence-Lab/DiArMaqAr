"use client";

import { useAppContext } from "@/contexts/app-context";
import Jins from "@/models/Jins";
import { SelectedCell } from "@/contexts/app-context";

export default function JinsManager() {
  const {
    ajnas,
    selectedJins,
    setSelectedJins,
    updateAllAjnas,
    setSelectedCells,
    getNoteNamesUsedInTuningSystem,
  } = useAppContext();


  const usedNoteNames = getNoteNamesUsedInTuningSystem();

  const handleSaveJins = async () => {
    if (!selectedJins) return;
    const newAjnas = ajnas.filter((jins) => jins.getName() !== selectedJins.getName());
    await updateAllAjnas([...newAjnas, selectedJins]);
  };

  // Stub handler for deleting a new jins entry.
  const handleDeleteJins = async () => {
    if (!selectedJins) return;
    const newAjnas = ajnas.filter((jins) => jins.getName() !== selectedJins.getName());
    await updateAllAjnas(newAjnas);
  };

  const checkIfJinsIsSelectable = (jins: Jins) => {
    return jins.getNoteNames().every((noteName) => usedNoteNames.includes(noteName));
  };

  const handleClickJins = (jins: Jins) => {
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
    setSelectedJins(jins);
  };

  return (
    <div className="jins-manager">
      <h2 className="jins-manager__header">Jins Manager</h2>

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
        <button onClick={() => setSelectedJins(new Jins("", []))} className="jins-manager__create-new-jins-button">
          Create New Jins
        </button>
      )}
      {selectedJins && (
        <div className="jins-manager__jins-form">
          <input
            type="text"
            value={selectedJins.getName()}
            onChange={(e) =>
              setSelectedJins((prevSelectedJins: Jins | null) => {
                return new Jins(e.target.value, prevSelectedJins ? prevSelectedJins.getNoteNames() : []);
              })
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
          <button onClick={() => setSelectedJins(null)} className="jins-manager__clear-button">
           Clear
          </button>
        </div>
      )}
    </div>
  );
}
