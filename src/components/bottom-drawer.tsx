import React, { useEffect, useState } from "react";
import { Cell, CellDetails, useAppContext } from "@/contexts/app-context";
import { useMenuContext } from "@/contexts/menu-context";
import Maqam from "@/models/Maqam";
import Jins from "@/models/Jins";
import { getMaqamTranspositions, getJinsTranspositions } from "@/functions/transpose";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { SourcePageReference } from "@/models/Source";
import { updateAjnas, updateMaqamat } from "@/functions/update";

export default function BottomDrawer() {
  const {
    ajnas,
    setAjnas,
    maqamat,
    setMaqamat,
    selectedJins,
    setSelectedJins,
    handleClickJins,
    checkIfJinsIsSelectable,
    selectedMaqam,
    setSelectedMaqam,
    handleClickMaqam,
    checkIfMaqamIsSelectable,
    selectedCells,
    getSelectedCellDetails,
    getAllCells,
    clearSelections,
    playSequence,
    selectedTuningSystem,
    sources,
  } = useAppContext();

  const { openBottomDrawer, setOpenBottomDrawer, setOpenNavigation, setOpenSettings } = useMenuContext();

  const [navbarItem, setNavbarItem] = useState("ajnas"); // "ajnas" | "editJins" | "maqamat" | "editMaqam"

  useEffect(() => {
    if (navbarItem === "editJins") {
      setSelectedMaqam(null);
    } else if (navbarItem === "editMaqam") {
      setSelectedJins(null);
    }
  }, [navbarItem]);

  const togglePanel = () => {
    setOpenBottomDrawer((prev) => !prev);
    setOpenNavigation(false);
    setOpenSettings(false);
  };

  // Shared cell data
  const allCells = getAllCells();
  const allCellDetails: CellDetails[] = allCells.map(getSelectedCellDetails);
  const pitchCount = selectedTuningSystem ? selectedTuningSystem.getPitchClasses().length : 0;

  // Jins section
  const sortedAjnas = [...ajnas].sort((a, b) => a.getName().localeCompare(b.getName()));
  const jinsCellDetails = selectedJins ? allCellDetails.filter((cell) => selectedJins.getNoteNames().includes(cell.noteName)) : [];

  const setOfAjnas = new Set(ajnas.map((j) => j.getId()));
  let newJinsIdNum = 1;
  while (setOfAjnas.has(newJinsIdNum.toString())) {
    newJinsIdNum++;
  }
  const newJinsId = newJinsIdNum.toString();

  const setOfMaqamat = new Set(maqamat.map((m) => m.getId()));
  let newMaqamIdNum = 1;
  while (setOfMaqamat.has(newMaqamIdNum.toString())) {
    newMaqamIdNum++;
  }
  const newMaqamId = newMaqamIdNum.toString();

  const handleSaveJins = async () => {
    if (!selectedJins) return;
    const names = selectedCells.map((cell: Cell) => getSelectedCellDetails(cell).noteName);
    const newJins = new Jins(selectedJins.getId(), selectedJins.getName(), names, selectedJins.getSourcePageReferences());
    const others = ajnas.filter((j) => j.getId() !== newJins.getId());
    await updateAjnas([...others, newJins]);
    setAjnas([...others, newJins]);
    setSelectedJins(newJins);
    setSelectedMaqam(null);
  };

  const handleDeleteJins = async () => {
    if (!selectedJins) return;
    const remaining = ajnas.filter((j) => j.getId() !== selectedJins.getId());
    await updateAjnas(remaining);
    setAjnas(remaining);
    clearSelections();
  };

  const playSelectedJins = () => {
    if (!selectedJins) return;
    const freqs = jinsCellDetails.map((c) => parseInt(c.frequency) || 0);
    playSequence(freqs);
  };

  // Maqam section
  const sortedMaqamat = [...maqamat].sort((a, b) => a.getName().localeCompare(b.getName()));
  const ascendingDetails = selectedMaqam ? allCellDetails.filter((c) => selectedMaqam.getAscendingNoteNames().includes(c.noteName)) : [];
  const descendingDetails = selectedMaqam ? allCellDetails.filter((c) => selectedMaqam.getDescendingNoteNames().includes(c.noteName)).reverse() : [];

  const handleSaveMaqam = async (maqam: Maqam) => {
    const others = maqamat.filter((m) => m.getId() !== maqam.getId());
    await updateMaqamat([...others, maqam]);
    setMaqamat([...others, maqam]);
    setSelectedMaqam(maqam);
    setSelectedJins(null);
  };

  const handleSaveAscending = async () => {
    if (!selectedMaqam) return;
    const descNames =
      selectedMaqam.getDescendingNoteNames().length > 0
        ? selectedMaqam.getDescendingNoteNames()
        : [...selectedCells.map((c) => getSelectedCellDetails(c).noteName)].reverse();
    const updated = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      selectedCells.map((c) => getSelectedCellDetails(c).noteName),
      descNames,
      selectedMaqam.getSuyūr(),
      selectedMaqam.getSourcePageReferences()
    );
    handleSaveMaqam(updated);
  };

  const handleSaveDescending = async () => {
    if (!selectedMaqam) return;
    const updated = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      selectedMaqam.getAscendingNoteNames(),
      [...selectedCells.map((c) => getSelectedCellDetails(c).noteName)].reverse(),
      selectedMaqam.getSuyūr(),
      selectedMaqam.getSourcePageReferences()
    );
    handleSaveMaqam(updated);
  };

  const handleDeleteMaqam = async () => {
    if (!selectedMaqam) return;
    const remaining = maqamat.filter((m) => m.getId() !== selectedMaqam.getId());
    await updateMaqamat(remaining);
    setMaqamat(remaining);
    setSelectedMaqam(null);
    clearSelections();
  };

  const playSelectedMaqam = () => {
    if (!selectedMaqam) return;
    const freqs: number[] = [];
    ascendingDetails.forEach((d) => freqs.push(parseInt(d.frequency) || 0));
    descendingDetails.forEach((d) => freqs.push(parseInt(d.frequency) || 0));
    playSequence(freqs);
  };

  const updateSourceRefs = (refs: SourcePageReference[], index: number, newRef: Partial<SourcePageReference>) => {
    if (!selectedJins && !selectedMaqam) return;
    const list = [...refs];
    list[index] = { ...list[index], ...newRef } as SourcePageReference;
    if (selectedJins) {
      setSelectedJins(new Jins(selectedJins.getId(), selectedJins.getName(), selectedJins.getNoteNames(), list));
    } else if (selectedMaqam) {
      setSelectedMaqam(
        new Maqam(
          selectedMaqam.getId(),
          selectedMaqam.getName(),
          selectedMaqam.getAscendingNoteNames(),
          selectedMaqam.getDescendingNoteNames(),
          selectedMaqam.getSuyūr(),
          list
        )
      );
    }
  };

  const removeSourceRef = (index: number) => {
    if (!selectedJins && !selectedMaqam) return;
    const refs = (selectedJins ? selectedJins.getSourcePageReferences() : selectedMaqam?.getSourcePageReferences()) || [];
    const newList = refs.filter((_, i) => i !== index);
    if (selectedJins) setSelectedJins(new Jins(selectedJins.getId(), selectedJins.getName(), selectedJins.getNoteNames(), newList));
    else if (selectedMaqam)
      setSelectedMaqam(
        new Maqam(
          selectedMaqam.getId(),
          selectedMaqam.getName(),
          selectedMaqam.getAscendingNoteNames(),
          selectedMaqam.getDescendingNoteNames(),
          selectedMaqam.getSuyūr(),
          newList
        )
      );
  };

  const addSourceRef = () => {
    if (!selectedJins && !selectedMaqam) return;
    const refs = (selectedJins ? selectedJins.getSourcePageReferences() : selectedMaqam?.getSourcePageReferences()) || [];
    const newRef: SourcePageReference = { sourceId: "", page: "" };
    const newList = [...refs, newRef];
    if (selectedJins) setSelectedJins(new Jins(selectedJins.getId(), selectedJins.getName(), selectedJins.getNoteNames(), newList));
    else if (selectedMaqam)
      setSelectedMaqam(
        new Maqam(
          selectedMaqam.getId(),
          selectedMaqam.getName(),
          selectedMaqam.getAscendingNoteNames(),
          selectedMaqam.getDescendingNoteNames(),
          selectedMaqam.getSuyūr(),
          newList
        )
      );
  };

  return (
    <div className={`bottom-drawer ${openBottomDrawer ? "bottom-drawer--open" : ""}`}>
      <button className="bottom-drawer__button" onClick={togglePanel}>
        <KeyboardArrowUpIcon />
      </button>
      <div className="bottom-drawer__panel">
        <div className="bottom-drawer__content">
          <div className="bottom-drawer__navbar">
            <div
              className={`bottom-drawer__navbar-item ${navbarItem === "ajnas" ? "bottom-drawer__navbar-item_selected" : ""}`}
              onClick={() => setNavbarItem("ajnas")}
            >
              Ajnas
            </div>
            <div
              className={`bottom-drawer__navbar-item ${navbarItem === "editJins" ? "bottom-drawer__navbar-item_selected" : ""}`}
              onClick={() => setNavbarItem("editJins")}
            >
              {selectedJins ? "Edit Jins" : "Create Jins"}
            </div>
            <div
              className={`bottom-drawer__navbar-item ${navbarItem === "maqamat" ? "bottom-drawer__navbar-item_selected" : ""}`}
              onClick={() => setNavbarItem("maqamat")}
            >
              Maqāmāt
            </div>
            <div
              className={`bottom-drawer__navbar-item ${navbarItem === "editMaqam" ? "bottom-drawer__navbar-item_selected" : ""}`}
              onClick={() => setNavbarItem("editMaqam")}
            >
              {selectedMaqam ? "Edit Maqām" : "Create Maqām"}
            </div>
          </div>

          <div className="bottom-drawer__body">
            {navbarItem === "ajnas" && (
              <div className="jins-manager__list">
                {sortedAjnas.map((j, i) => (
                  <div
                    key={i}
                    className={`jins-manager__item ${j.getName() === selectedJins?.getName() ? "jins-manager__item_selected" : ""} ${
                      checkIfJinsIsSelectable(j) ? "jins-manager__item_active" : ""
                    }`}
                    onClick={() => checkIfJinsIsSelectable(j) && handleClickJins(j)}
                  >
                    <div className="jins-manager__item-name">
                      <strong>{j.getName()}</strong>
                      {checkIfJinsIsSelectable(j) && (
                        <strong className="jins-manager__item-name-transpositions">
                          {`Transpositions: ${getJinsTranspositions(allCellDetails, j, true).length}/${pitchCount}`}
                        </strong>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {navbarItem === "editJins" && (
              <div className="jins-manager__jins-form">
                {selectedJins && (
                  <button className="jins-manager__play-button" onClick={playSelectedJins}>
                    <PlayCircleIcon /> Play Jins
                  </button>
                )}
                <input
                  type="text"
                  value={selectedJins?.getName() || ""}
                  onChange={(e) =>
                    setSelectedJins(
                      new Jins(
                        selectedJins?.getId() || newJinsId,
                        e.target.value,
                        selectedJins?.getNoteNames() || [],
                        selectedJins?.getSourcePageReferences() || []
                      )
                    )
                  }
                  placeholder="Enter jins name"
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

            {navbarItem === "maqamat" && (
              <div className="maqam-manager__list">
                {sortedMaqamat.map((m, i) => (
                  <div
                    key={i}
                    className={`maqam-manager__item ${m.getName() === selectedMaqam?.getName() ? "maqam-manager__item_selected" : ""} ${
                      checkIfMaqamIsSelectable(m) ? "maqam-manager__item_active" : ""
                    }`}
                    onClick={() => checkIfMaqamIsSelectable(m) && handleClickMaqam(m)}
                  >
                    <div className="maqam-manager__item-name">
                      <strong>{`‏${m.getName()}${!m.isMaqamSymmetric() ? "*" : ""}`}</strong>
                      {checkIfMaqamIsSelectable(m) && (
                        <strong className="maqam-manager__item-name-transpositions">
                          {`Transpositions: ${getMaqamTranspositions(allCellDetails, m, true).length}/${pitchCount}`}
                        </strong>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {navbarItem === "editMaqam" && (
              <div className="maqam-manager__maqam-form">
                {selectedMaqam && (
                  <button className="maqam-manager__play-button" onClick={playSelectedMaqam}>
                    <PlayCircleIcon /> Play Maqām
                  </button>
                )}
                <input
                  type="text"
                  value={selectedMaqam?.getName() || ""}
                  onChange={(e) =>
                    setSelectedMaqam(
                      new Maqam(
                        selectedMaqam?.getId() || newMaqamId,
                        e.target.value,
                        selectedMaqam?.getAscendingNoteNames() || [],
                        selectedMaqam?.getDescendingNoteNames() || [],
                        selectedMaqam?.getSuyūr() || [],
                        selectedMaqam?.getSourcePageReferences() || []
                      )
                    )
                  }
                  placeholder="Enter maqam name"
                  className="maqam-manager__maqam-input"
                />
                <button onClick={() => selectedMaqam && handleSaveMaqam(selectedMaqam)} className="maqam-manager__save-button">
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

                {selectedMaqam && (
                  <button className="maqam-manager__source-add-button" onClick={addSourceRef}>
                    Add Source
                  </button>
                )}
                {selectedMaqam &&
                  selectedMaqam.getSourcePageReferences().map((ref, idx) => (
                    <div key={idx} className="maqam-manager__source-item">
                      <select
                        className="maqam-manager__source-select"
                        value={ref.sourceId}
                        onChange={(e) => updateSourceRefs(selectedMaqam.getSourcePageReferences(), idx, { sourceId: e.target.value })}
                      >
                        <option value="">Select source</option>
                        {sources.map((s) => (
                          <option key={s.getId()} value={s.getId()}>
                            {s.getTitleEnglish()}
                          </option>
                        ))}
                      </select>
                      <input
                        className="maqam-manager__source-input"
                        type="text"
                        value={ref.page}
                        placeholder="Page"
                        onChange={(e) => updateSourceRefs(selectedMaqam.getSourcePageReferences(), idx, { page: e.target.value })}
                      />
                      <button className="maqam-manager__source-delete-button" onClick={() => removeSourceRef(idx)}>
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
