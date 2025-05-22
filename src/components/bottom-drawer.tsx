import React, { useState } from "react";
import { Cell, CellDetails, useAppContext } from "@/contexts/app-context";
import Maqam from "@/models/Maqam";
import Jins from "@/models/Jins";
import { getMaqamTranspositions, getJinsTranspositions } from "@/functions/transpose";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

export default function BottomDrawer() {
  const {
    openBottomDrawer,
    setOpenBottomDrawer,
    setOpenNavigation,
    setOpenSettings,
    ajnas,
    maqamat,
    selectedJins,
    setSelectedJins,
    handleClickJins,
    checkIfJinsIsSelectable,
    updateAllAjnas,
    selectedMaqam,
    setSelectedMaqam,
    handleClickMaqam,
    checkIfMaqamIsSelectable,
    updateAllMaqamat,
    selectedCells,
    getSelectedCellDetails,
    getAllCells,
    clearSelections,
    playSequence,
    selectedTuningSystem,
  } = useAppContext();

  const [navbarItem, setNavbarItem] = useState(
    "ajnas"
  ); // "ajnas" | "editJins" | "maqamat" | "editMaqam"

  const togglePanel = () => {
    setOpenBottomDrawer((prev) => !prev);
    setOpenNavigation(false);
    setOpenSettings(false);
  };

  // Shared cell data
  const allCells = getAllCells();
  const allCellDetails: CellDetails[] = allCells.map(getSelectedCellDetails);
  const pitchCount = selectedTuningSystem
    ? selectedTuningSystem.getPitchClasses().length
    : 0;

  // Jins section
  const sortedAjnas = [...ajnas].sort((a, b) => a.getName().localeCompare(b.getName()));
  const jinsCellDetails = selectedJins
    ? allCellDetails.filter((cell) => selectedJins.getNoteNames().includes(cell.noteName))
    : [];

  const handleSaveJins = async () => {
    if (!selectedJins) return;
    const names = selectedCells.map((cell: Cell) => getSelectedCellDetails(cell).noteName);
    const newJins = new Jins(selectedJins.getId(), selectedJins.getName(), names);
    const others = ajnas.filter((j) => j.getId() !== newJins.getId());
    await updateAllAjnas([...others, newJins]);
    setSelectedJins(newJins);
    setSelectedMaqam(null);
  };

  const handleDeleteJins = async () => {
    if (!selectedJins) return;
    const remaining = ajnas.filter((j) => j.getId() !== selectedJins.getId());
    await updateAllAjnas(remaining);
    setSelectedJins(null);
    clearSelections();
  };

  const playSelectedJins = () => {
    if (!selectedJins) return;
    const freqs = jinsCellDetails.map((c) => parseInt(c.frequency) || 0);
    playSequence(freqs);
  };

  // Maqam section
  const sortedMaqamat = [...maqamat].sort((a, b) => a.getName().localeCompare(b.getName()));
  const ascendingDetails = selectedMaqam
    ? allCellDetails.filter((c) => selectedMaqam.getAscendingNoteNames().includes(c.noteName))
    : [];
  const descendingDetails = selectedMaqam
    ? allCellDetails
        .filter((c) => selectedMaqam.getDescendingNoteNames().includes(c.noteName))
        .reverse()
    : [];

  const handleSaveMaqam = async (maqam: Maqam) => {
    const others = maqamat.filter((m) => m.getId() !== maqam.getId());
    await updateAllMaqamat([...others, maqam]);
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
      selectedMaqam.getSuyur()
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
      selectedMaqam.getSuyur()
    );
    handleSaveMaqam(updated);
  };

  const handleDeleteMaqam = async () => {
    if (!selectedMaqam) return;
    const remaining = maqamat.filter((m) => m.getId() !== selectedMaqam.getId());
    await updateAllMaqamat(remaining);
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
                    className={`jins-manager__item ${j.getName() === selectedJins?.getName() ? "jins-manager__item_selected" : ""} ${checkIfJinsIsSelectable(j) ? "jins-manager__item_active" : ""}`}
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
                <input
                  type="text"
                  value={selectedJins?.getName() || ""}
                  onChange={(e) =>
                    setSelectedJins(new Jins(selectedJins?.getId() || "", e.target.value, selectedJins?.getNoteNames() || []))
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
                  <button className="jins-manager__play-button" onClick={playSelectedJins}>
                    <PlayCircleIcon /> Play Jins
                  </button>
                )}
              </div>
            )}

            {navbarItem === "maqamat" && (
              <div className="maqam-manager__list">
                {sortedMaqamat.map((m, i) => (
                  <div
                    key={i}
                    className={`maqam-manager__item ${m.getName() === selectedMaqam?.getName() ? "maqam-manager__item_selected" : ""} ${checkIfMaqamIsSelectable(m) ? "maqam-manager__item_active" : ""}`}
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
                <input
                  type="text"
                  value={selectedMaqam?.getName() || ""}
                  onChange={(e) =>
                    setSelectedMaqam(
                      new Maqam(
                        selectedMaqam?.getId() || "",
                        e.target.value,
                        selectedMaqam?.getAscendingNoteNames() || [],
                        selectedMaqam?.getDescendingNoteNames() || [],
                        selectedMaqam?.getSuyur() || []
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
                  <button className="maqam-manager__play-button" onClick={playSelectedMaqam}>
                    <PlayCircleIcon /> Play Maqām
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
