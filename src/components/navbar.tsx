"use client";
import React from "react";
import SettingsCard from "@/components/settings-cards";
import { useAppContext } from "@/contexts/app-context";
import { useMenuContext } from "@/contexts/menu-context";
import { Sayr } from "@/models/Maqam";

export default function Navbar() {
  const { showAdminTabs, setShowAdminTabs, selectedMenu, setSelectedMenu } = useMenuContext();
  const { selectedTuningSystem, selectedJins, selectedMaqam, ajnas, checkIfJinsIsSelectable, maqamat, checkIfMaqamIsSelectable, maqamSayrId, sources, setSelectedTuningSystem, clearSelections } = useAppContext();

  const selectedSayr: Sayr | null = (selectedMaqam && maqamSayrId) ? selectedMaqam.getSuyūr().find((sayr) => sayr.id === maqamSayrId) || null : null

  const selectedSayrSource = selectedSayr ? sources.find((source) => source.getId() === selectedSayr.sourceId) : null;

  return (
    <nav className="navbar">
      <header className="navbar__top-bar">
        <div className="navbar__left-panel">
          <div className="navbar__left-panel-icon" onClick={() => setShowAdminTabs(!showAdminTabs)}>
            {showAdminTabs ? "Admin Mode" : "User Mode"}
          </div>
        </div>

        <div className="navbar__center-panel"><span className="navbar__title" onClick={() => {
          clearSelections();
          setSelectedTuningSystem(null);
        }}> Arabic Maqām Database</span>
          <br></br><span className="navbar__subtitle">Explore and play the tanghīm, ajnās, maqāmāt and suyūr of the Arabic Maqām system</span>
        </div>
        <div className="navbar__right-panel">
          <div className="navbar__left-panel-icon">
            <SettingsCard />
          </div>
        </div>
      </header>
      <div className="navbar__bottom-bar">
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "tuningSystem" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("tuningSystem")}
        >
          {selectedTuningSystem ? <>{`${selectedTuningSystem.getCreatorEnglish()} (${selectedTuningSystem.getYear()})`} <br /> {selectedTuningSystem.getTitleEnglish()}</> : "Tanghīm (Tuning Systems)"}
        </button>
        {showAdminTabs && <button
          className={`navbar__bottom-bar-item ${selectedMenu === "tuningSystem-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("tuningSystem-admin")}
        >
          Tuning System Admin
        </button>}
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "jins" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("jins")}
          disabled={!selectedTuningSystem}
        >
          {selectedTuningSystem ? `Ajnās (${ajnas.filter((jins) => checkIfJinsIsSelectable(jins)).length}/${ajnas.length})` : "Ajnās"} <br />
          {selectedJins && selectedJins.getName()}
        </button>
        {showAdminTabs && <button
          className={`navbar__bottom-bar-item ${selectedMenu === "jins-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("jins-admin")}
          disabled={!selectedTuningSystem}
        >
          Jins Admin
        </button>}
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "maqam" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("maqam")}
          disabled={!selectedTuningSystem}
        >
          {selectedTuningSystem ? `Maqāmāt (${maqamat.filter((maqam) => checkIfMaqamIsSelectable(maqam)).length}/${maqamat.length})` : "Maqāmāt"} <br />
          {selectedMaqam && selectedMaqam.getName()}
        </button>
        {showAdminTabs && <button
          className={`navbar__bottom-bar-item ${selectedMenu === "maqam-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("maqam-admin")}
          disabled={!selectedTuningSystem}
        >
          Maqam Admin
        </button>}
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "sayr" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("sayr")}
          disabled={!selectedMaqam}
        >
          {selectedMaqam ? `Suyūr (${selectedMaqam.getSuyūr().length})` : "Suyūr"} <br />
          {selectedSayr && `${selectedSayr.creatorEnglish} ${selectedSayrSource ? `(${selectedSayrSource.getReleaseDateEnglish()})` : ""}`}
        </button>
        {showAdminTabs && <button
          className={`navbar__bottom-bar-item ${selectedMenu === "sayr-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("sayr-admin")}
          disabled={!selectedMaqam}
        >
          Sayr Admin
        </button>}
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "bibliography" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("bibliography")}
        >
          Bibliography
        </button>
        {showAdminTabs && <button
          className={`navbar__bottom-bar-item ${selectedMenu === "bibliography-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("bibliography-admin")}
        >
          Bibliography Admin
        </button>}
        {showAdminTabs && <button
          className={`navbar__bottom-bar-item ${selectedMenu === "pattern-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("pattern-admin")}
        >
          Patterns Admin
        </button>}
      </div>
    </nav>
  );
}
