"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import SettingsCard from "@/components/settings-cards";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import { useAppContext } from "@/contexts/app-context";
import { useMenuContext } from "@/contexts/menu-context";
import { Sayr } from "@/models/Maqam";

export default function Navbar() {
  const { openNavigation, setOpenNavigation, setOpenBottomDrawer, openSettings, setOpenSettings, selectedMenu, setSelectedMenu } = useMenuContext();
  const { selectedTuningSystem, selectedJins, selectedMaqam, ajnas, checkIfJinsIsSelectable, maqamat, checkIfMaqamIsSelectable, maqamSayrId, sources, setSelectedTuningSystem, clearSelections } = useAppContext();

  const currentPath = usePathname().split("/")[1];

  const admin = false;

  const selectedSayr: Sayr | null = (selectedMaqam && maqamSayrId) ? selectedMaqam.getSuyūr().find((sayr) => sayr.id === maqamSayrId) || null : null

  const selectedSayrSource = selectedSayr ? sources.find((source) => source.getId() === selectedSayr.sourceId) : null;

  const toggleSidebar = () => {
    setOpenNavigation((prev) => !prev);
    setOpenBottomDrawer(false);
    setOpenSettings(false);
  };

  const close = () => {
    setOpenNavigation(false);
    setOpenBottomDrawer(false);
    setOpenSettings(false);
  };

  return (
    <nav className="navbar">
      <header className="navbar__top-bar">
        <div className="navbar__left-panel">
          <div className="navbar__left-panel-icon" onClick={toggleSidebar}></div>
        </div>

        <div className="navbar__center-panel"><span className="navbar__title" onClick={() => {
          clearSelections();
          setSelectedTuningSystem(null);
        }}> Arabic Maqam Database</span>

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
          {selectedTuningSystem ? <>{`${selectedTuningSystem.getCreatorEnglish()} (${selectedTuningSystem.getYear()})`} <br /> {selectedTuningSystem.getTitleEnglish()}</> : "Tanghīm (Tuning System)"}
        </button>
        {admin && <button
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
        {admin && <button
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
        {admin && <button
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
        {admin && <button
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
        {admin && <button
          className={`navbar__bottom-bar-item ${selectedMenu === "bibliography-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("bibliography-admin")}
        >
          Bibliography Admin
        </button>}
        {admin && <button
          className={`navbar__bottom-bar-item ${selectedMenu === "pattern-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("pattern-admin")}
        >
          Patterns Admin
        </button>}
      </div>

      {(openNavigation || openSettings) && <div className="navbar__backdrop" onClick={close} onTouchMove={close} />}

      <section className={"navbar__side-bar " + (openNavigation ? "navbar__side-bar_open" : "")}>
        <div className="navbar__side-bar-content" onClick={(e) => e.stopPropagation()}>
          <div className="navbar__side-bar-content-top">
            <Link onClick={close} href="/" className={`navbar__side-bar-link ${currentPath === "" ? "navbar__side-bar-link_active" : ""}`}>
              <HomeIcon />
              Home
            </Link>
            <Link
              onClick={close}
              href="/bibliography"
              className={`navbar__side-bar-link ${currentPath === "bibliography" ? "navbar__side-bar-link_active" : ""}`}
            >
              <LibraryBooksIcon />
              Bibliography
            </Link>
            <Link
              onClick={close}
              href="/patterns"
              className={`navbar__side-bar-link ${currentPath === "patterns" ? "navbar__side-bar-link_active" : ""}`}
            >
              <QueueMusicIcon />
              Patterns
            </Link>
          </div>
        </div>
      </section>
    </nav>
  );
}
