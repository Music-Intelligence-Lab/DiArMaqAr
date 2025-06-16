"use client";

import React, { useEffect, useRef, useMemo } from "react";
import SettingsCard from "@/components/settings-cards";
import useAppContext from "@/contexts/app-context";
import useMenuContext from "@/contexts/menu-context";
import { Sayr } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import NavigationMenu from "./navigation-menu";
import { octaveOneNoteNames } from "@/models/NoteName";
export default function Navbar() {
  const { showAdminTabs, setShowAdminTabs, selectedMenu, setSelectedMenu } = useMenuContext();
  const {
    selectedTuningSystem,
    selectedJins,
    selectedJinsTransposition,
    selectedMaqam,
    selectedMaqamTransposition,
    ajnas,
    checkIfJinsIsSelectable,
    maqamat,
    checkIfMaqamIsSelectable,
    maqamSayrId,
    sources,
    selectedCells,
    setSelectedTuningSystem,
    clearSelections,
    setPitchClasses,
    setSelectedIndices,
    setNoteNames,
    getModulations,
    selectedIndices,
  } = useAppContext();

  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowRef.current) return;
    const container = rowRef.current;
    const selectedEls = container.querySelectorAll<HTMLElement>(".navbar__pc-cell_selected");
    if (selectedEls.length === 0) return;

    let minLeft = Infinity;
    let maxRight = -Infinity;

    selectedEls.forEach((el) => {
      const elLeft = el.offsetLeft;
      const elRight = elLeft + el.offsetWidth;
      if (elLeft < minLeft) minLeft = elLeft;
      if (elRight > maxRight) maxRight = elRight;
    });

    const selectedCenter = (minLeft + maxRight) / 2;
    const containerWidth = container.clientWidth;
    const targetScrollLeft = selectedCenter - containerWidth / 2;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }, [selectedCells]);

  const selectedSayr: Sayr | null = selectedMaqam && maqamSayrId ? selectedMaqam.getSuyūr().find((sayr) => sayr.id === maqamSayrId) || null : null;

  const selectedSayrSource = selectedSayr ? sources.find((source) => source.getId() === selectedSayr.sourceId) : null;

  const totalModulations = useMemo(() => {
    if (!selectedMaqam) return null;
    const transposition = selectedMaqam.convertToMaqamTransposition();
    const modulations = getModulations(transposition);
    return (
      (modulations.hopsFromOne?.length || 0) +
      (modulations.hopsFromThree?.length || 0) +
      (modulations.hopsFromThree2p?.length || 0) +
      (modulations.hopsFromFour?.length || 0) +
      (modulations.hopsFromFive?.length || 0) +
      (modulations.hopsFromSix?.length || 0)
    );
  }, [selectedMaqam, getModulations]);

  return (
    <>
      <nav className="navbar">
        <header className="navbar__top-bar">
          <div className="navbar__left-panel">
            <div className="navbar__left-panel-menu-icon">
              <NavigationMenu />
            </div>
            <div className="navbar__left-panel-admin" onClick={() => setShowAdminTabs(!showAdminTabs)}>
              {showAdminTabs ? "User Mode" : "Admin Mode"}
            </div>
          </div>
          <div className="navbar__center-panel">
            <span
              className="navbar__title"
              onClick={() => {
                clearSelections();
                setSelectedTuningSystem(null);
                setPitchClasses("");
                setSelectedIndices([]);
                setNoteNames([]);
              }}
            >
              {" "}
              شبكة المقام العربي Arabic Maqām Network
            </span>
            <br></br>
            <span className="navbar__subtitle">
              استكشفوا واعزفوا التنغيم والأجناس والمقامات في نظام المقام العربي • Explore and play the tanghīm, ajnās and maqāmāt of the Arabic Maqām
              system
            </span>
          </div>
          <div className="navbar__right-panel">
            <div className="navbar__left-panel-icon">
              <SettingsCard />
            </div>
          </div>
        </header>
        <div className="navbar__bottom-bar">
          <button
            className={`navbar__bottom-bar-item ${selectedMenu === "tuningSystem" ? "navbar__bottom-bar-item_selected " : ""} ${
              selectedTuningSystem ? "navbar__bottom-bar-item_active" : ""
            }`}
            onClick={() => setSelectedMenu("tuningSystem")}
          >
            {selectedTuningSystem ? (
              <>
                <span className="navbar__bottom-bar-item_tab-title">
                  {selectedTuningSystem.getCreatorEnglish()} ({selectedTuningSystem.getYear()})
                </span>
                <span className="navbar__bottom-bar-item_tab-subtitle">{`${selectedTuningSystem.getTitleEnglish()} (${
                  octaveOneNoteNames[selectedIndices[0]] ?? "none"
                })`}</span>
              </>
            ) : (
              "Tanghīm (Tuning Systems)"
            )}
          </button>
          {showAdminTabs && (
            <button
              className={`navbar__bottom-bar-item ${selectedMenu === "tuningSystem-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
              onClick={() => setSelectedMenu("tuningSystem-admin")}
            >
              Tuning System Admin
            </button>
          )}
          <button
            className={`navbar__bottom-bar-item ${selectedMenu === "jins" ? "navbar__bottom-bar-item_selected" : ""} ${
              selectedJins ? "navbar__bottom-bar-item_active" : ""
            }`}
            onClick={() => setSelectedMenu("jins")}
            disabled={!selectedTuningSystem}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedTuningSystem ? `Ajnās (${ajnas.filter((jins) => checkIfJinsIsSelectable(jins)).length}/${ajnas.length})` : "Ajnās"}
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {!selectedJins
                ? ""
                : selectedJinsTransposition
                ? `${selectedJins.getName()} al-${selectedJinsTransposition.noteNames[0]} (${getEnglishNoteName(
                    selectedJinsTransposition.noteNames[0]
                  )})`
                : `${selectedJins.getName()} (${selectedJins.getNoteNames()[0]}/${getEnglishNoteName(selectedJins.getNoteNames()[0])})`}
            </span>
          </button>
          {showAdminTabs && (
            <button
              className={`navbar__bottom-bar-item ${selectedMenu === "jins-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
              onClick={() => setSelectedMenu("jins-admin")}
              disabled={!selectedTuningSystem}
            >
              Jins Admin
            </button>
          )}
          <button
            className={`navbar__bottom-bar-item ${selectedMenu === "maqam" ? "navbar__bottom-bar-item_selected" : ""} ${
              selectedMaqam ? "navbar__bottom-bar-item_active" : ""
            }`}
            onClick={() => setSelectedMenu("maqam")}
            disabled={!selectedTuningSystem}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedTuningSystem ? `Maqāmāt (${maqamat.filter((maqam) => checkIfMaqamIsSelectable(maqam)).length}/${maqamat.length})` : "Maqāmāt"}{" "}
              <br />
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {!selectedMaqam
                ? ""
                : selectedMaqamTransposition
                ? `${selectedMaqam.getName()} al-${selectedMaqamTransposition.ascendingNoteNames[0]} (${getEnglishNoteName(
                    selectedMaqamTransposition.ascendingNoteNames[0]
                  )})`
                : `${selectedMaqam.getName()} (${selectedMaqam.getAscendingNoteNames()[0]}/${getEnglishNoteName(
                    selectedMaqam.getAscendingNoteNames()[0]
                  )})`}
            </span>
          </button>
          {showAdminTabs && (
            <button
              className={`navbar__bottom-bar-item ${selectedMenu === "maqam-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
              onClick={() => setSelectedMenu("maqam-admin")}
              disabled={!selectedTuningSystem}
            >
              Maqam Admin
            </button>
          )}
          <button
            className={`navbar__bottom-bar-item ${selectedMenu === "sayr" ? "navbar__bottom-bar-item_selected" : ""} ${
              selectedSayr ? "navbar__bottom-bar-item_active" : ""
            }`}
            onClick={() => setSelectedMenu("sayr")}
            disabled={!selectedMaqam}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedMaqam ? `Suyūr (${selectedMaqam.getSuyūr().length})` : "Suyūr"} <br />
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {selectedSayr && `${selectedSayr.creatorEnglish} ${selectedSayrSource ? `(${selectedSayrSource.getReleaseDateEnglish()})` : ""}`}
            </span>
          </button>
          {showAdminTabs && (
            <button
              className={`navbar__bottom-bar-item ${selectedMenu === "sayr-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
              onClick={() => setSelectedMenu("sayr-admin")}
              disabled={!selectedMaqam}
            >
              Sayr Admin
            </button>
          )}

          <button
            className={`navbar__bottom-bar-item ${selectedMenu === "modulation" ? "navbar__bottom-bar-item_selected" : ""}`}
            onClick={() => setSelectedMenu("modulation")}
            disabled={!selectedMaqam}
          >
            Intiqālāt{selectedMaqam ? ` (${totalModulations})` : ""}
          </button>

          <button
            className={`navbar__bottom-bar-item ${selectedMenu === "bibliography" ? "navbar__bottom-bar-item_selected" : ""}`}
            onClick={() => setSelectedMenu("bibliography")}
          >
            Bibliography
          </button>
          {showAdminTabs && (
            <button
              className={`navbar__bottom-bar-item ${selectedMenu === "bibliography-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
              onClick={() => setSelectedMenu("bibliography-admin")}
            >
              Bibliography Admin
            </button>
          )}
          {showAdminTabs && (
            <button
              className={`navbar__bottom-bar-item ${selectedMenu === "pattern-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
              onClick={() => setSelectedMenu("pattern-admin")}
            >
              Patterns Admin
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
