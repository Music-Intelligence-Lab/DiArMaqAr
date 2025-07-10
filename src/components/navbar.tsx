"use client";

import React, { useEffect, useRef, useMemo } from "react";
import SettingsCard from "@/components/settings-cards";
import useAppContext from "@/contexts/app-context";
import useMenuContext from "@/contexts/menu-context";
import { Sayr } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import NavigationMenu from "./navigation-menu";
import { octaveOneNoteNames } from "@/models/NoteName";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
export default function Navbar() {
  const { showAdminTabs, setShowAdminTabs, selectedMenu, setSelectedMenu } = useMenuContext();
  const {
    selectedTuningSystem,
    selectedJinsDetails,
    selectedJins,
    selectedMaqamDetails,
    selectedMaqam,
    ajnas,
    maqamat,
    maqamSayrId,
    sources,
    selectedPitchClasses,
    setSelectedTuningSystem,
    clearSelections,
    setTuningSystemPitchClasses,
    setSelectedIndices,
    getModulations,
    selectedIndices,
    allPitchClasses,
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
  }, [selectedPitchClasses]);

  const selectedSayr: Sayr | null = selectedMaqamDetails && maqamSayrId ? selectedMaqamDetails.getSuyūr().find((sayr) => sayr.id === maqamSayrId) || null : null;

  const selectedSayrSource = selectedSayr ? sources.find((source) => source.getId() === selectedSayr.sourceId) : null;

  const totalModulations = useMemo(() => {
    if (!selectedMaqamDetails) return null;
    const transposition = selectedMaqamDetails.getTahlil(allPitchClasses);
    const modulations = getModulations(transposition);
    return calculateNumberOfModulations(modulations);
  }, [selectedMaqamDetails, getModulations]);

  return (
    <>
      <nav className="navbar">
        <header className="navbar__top-bar">
          <div className="navbar__left-panel">
            <div className="navbar__left-panel-menu-icon">
              <NavigationMenu />
            </div>
            {process.env.NODE_ENV === "development" && (
              <div className="navbar__left-panel-admin" onClick={() => setShowAdminTabs(!showAdminTabs)}>
                {showAdminTabs ? "User Mode" : "Admin Mode"}
              </div>
            )}
          </div>
          <div className="navbar__center-panel">
            <span
              className="navbar__title"
              onClick={() => {
                clearSelections();
                setSelectedTuningSystem(null);
                setTuningSystemPitchClasses("");
                setSelectedIndices([]);
              }}
            >
              Arabic Maqām Network
              <br />
              شبكة المقام العربي
            </span>
            {/* <br></br>
            <span className="navbar__subtitle">استكشفوا واعزفوا التنغيم والأجناس والمقامات في نظام المقام العربي • Explore and play the tanghīm, ajnās and maqāmāt of the Arabic Maqām system</span> */}
          </div>
          <div className="navbar__right-panel">
            <div className="navbar__left-panel-icon">
              <SettingsCard />
            </div>
          </div>
        </header>
        <div className="navbar__bottom-bar">
          <button
            className={`navbar__bottom-bar-item ${selectedMenu === "tuningSystem" ? "navbar__bottom-bar-item_selected " : ""} ${selectedTuningSystem ? "navbar__bottom-bar-item_active" : ""}`}
            onClick={() => {
              setSelectedMenu("tuningSystem");
              // Scroll tuning-system-manager to top if present
              if (typeof window !== "undefined") {
                const tuningSystemManager = document.querySelector(".tuning-system-manager");
                if (tuningSystemManager) {
                  tuningSystemManager.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            }}
            disabled={!selectedTuningSystem}
          >
            {selectedTuningSystem ? (
              <>
                <span className="navbar__bottom-bar-item_tab-title">
                  {selectedTuningSystem.getCreatorEnglish()} ({selectedTuningSystem.getYear()})
                </span>
                <span className="navbar__bottom-bar-item_tab-subtitle">{`${selectedTuningSystem.getTitleEnglish()} (${octaveOneNoteNames[selectedIndices[0]] ?? "none"})`}</span>
              </>
            ) : (
              "Tanghīm (Tuning Systems)"
            )}
          </button>
          {showAdminTabs && (
            <button className={`navbar__bottom-bar-item ${selectedMenu === "tuningSystem-admin" ? "navbar__bottom-bar-item_selected" : ""}`} onClick={() => setSelectedMenu("tuningSystem-admin")}>
              Tuning System Admin
            </button>
          )}
          <button
            className={`navbar__bottom-bar-item ${selectedMenu === "jins" ? "navbar__bottom-bar-item_selected" : ""} ${selectedJinsDetails ? "navbar__bottom-bar-item_active" : ""}`}
            onClick={() => {
              setSelectedMenu("jins");
              // Scroll jins-transpositions to top if present
              if (typeof window !== "undefined") {
                const jinsTranspositions = document.querySelector(".jins-transpositions");
                if (jinsTranspositions) {
                  jinsTranspositions.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            }}
            disabled={!selectedTuningSystem}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedTuningSystem
                ? `Ajnās (${ajnas.filter((jinsDetails) => jinsDetails.isJinsSelectable(allPitchClasses.map((pitchClass) => pitchClass.noteName))).length}/${ajnas.length})`
                : "Ajnās"}
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {!selectedJinsDetails
                ? ""
                : selectedJins
                ? `${selectedJinsDetails.getName()} al-${selectedJins.jinsPitchClasses.map((pitchClass) => pitchClass.noteName)[0]} (${getEnglishNoteName(
                    selectedJins.jinsPitchClasses.map((pitchClass) => pitchClass.noteName)[0]
                  )})`
                : `${selectedJinsDetails.getName()} (${selectedJinsDetails.getNoteNames()[0]}/${getEnglishNoteName(selectedJinsDetails.getNoteNames()[0])})`}
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
            className={`navbar__bottom-bar-item ${selectedMenu === "maqam" ? "navbar__bottom-bar-item_selected" : ""} ${selectedMaqamDetails ? "navbar__bottom-bar-item_active" : ""}`}
            onClick={() => {
              setSelectedMenu("maqam");
              // Scroll maqam-transpositions to top if present
              if (typeof window !== "undefined") {
                const maqamTranspositions = document.querySelector(".maqam-transpositions");
                if (maqamTranspositions) {
                  maqamTranspositions.scrollIntoView({ behavior: "smooth", block: "start" });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            }}
            disabled={!selectedTuningSystem}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedTuningSystem
                ? `Maqāmāt (${maqamat.filter((maqamDetails) => maqamDetails.isMaqamSelectable(allPitchClasses.map((pitchClass) => pitchClass.noteName))).length}/${maqamat.length})`
                : "Maqāmāt"}{" "}
              <br />
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {!selectedMaqamDetails
                ? ""
                : selectedMaqam
                ? selectedMaqam.name
                : `${selectedMaqamDetails.getName()} (${selectedMaqamDetails.getAscendingNoteNames()[0]}/${getEnglishNoteName(selectedMaqamDetails.getAscendingNoteNames()[0])})`}
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
            className={`navbar__bottom-bar-item ${selectedMenu === "sayr" ? "navbar__bottom-bar-item_selected" : ""} ${selectedSayr ? "navbar__bottom-bar-item_active" : ""}`}
            onClick={() => setSelectedMenu("sayr")}
            disabled={!selectedMaqamDetails}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedMaqamDetails ? `Suyūr (${selectedMaqamDetails.getSuyūr().length})` : "Suyūr"} <br />
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {selectedSayr && `${selectedSayr.creatorEnglish} ${selectedSayrSource ? `(${selectedSayrSource.getPublicationDateEnglish()})` : ""}`}
            </span>
          </button>
          {showAdminTabs && (
            <button
              className={`navbar__bottom-bar-item ${selectedMenu === "sayr-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
              onClick={() => setSelectedMenu("sayr-admin")}
              disabled={!selectedMaqamDetails}
            >
              Sayr Admin
            </button>
          )}

          <button
            className={`navbar__bottom-bar-item ${selectedMenu === "modulation" ? "navbar__bottom-bar-item_selected" : ""}`}
            onClick={() => setSelectedMenu("modulation")}
            disabled={!selectedMaqamDetails}
          >
            Intiqālāt{selectedMaqamDetails ? ` (${totalModulations})` : ""}
          </button>

          <button className={`navbar__bottom-bar-item ${selectedMenu === "bibliography" ? "navbar__bottom-bar-item_selected" : ""}`} onClick={() => setSelectedMenu("bibliography")}>
            Bibliography
          </button>
          {showAdminTabs && (
            <button className={`navbar__bottom-bar-item ${selectedMenu === "bibliography-admin" ? "navbar__bottom-bar-item_selected" : ""}`} onClick={() => setSelectedMenu("bibliography-admin")}>
              Bibliography Admin
            </button>
          )}
          {showAdminTabs && (
            <button className={`navbar__bottom-bar-item ${selectedMenu === "pattern-admin" ? "navbar__bottom-bar-item_selected" : ""}`} onClick={() => setSelectedMenu("pattern-admin")}>
              Patterns Admin
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
