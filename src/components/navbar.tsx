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

export default function Navbar() {
  const { openNavigation, setOpenNavigation, setOpenBottomDrawer, openSettings, setOpenSettings, selectedMenu, setSelectedMenu } = useMenuContext();
  const { selectedTuningSystem, selectedJins, selectedMaqam } = useAppContext();

  const currentPath = usePathname().split("/")[1];

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

        <div className="navbar__center-panel"><span className="navbar__title"> Arabic Maqam Database</span> <br></br>
        {selectedTuningSystem && `Tanghīm: ${selectedTuningSystem.getCreatorEnglish()} (${selectedTuningSystem.getYear()}) ${selectedTuningSystem.getTitleEnglish()}`}<br></br>
        {selectedJins && `${selectedJins.getName()}`} {selectedMaqam && `${selectedMaqam.getName()}`}
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
          Tanghīm (Tuning System)
          {/* {selectedTuningSystem ? `${selectedTuningSystem.getCreatorEnglish()} (${selectedTuningSystem.getYear()}) ${selectedTuningSystem.getTitleEnglish()}` : "Tanghīm (Tuning System)"} */}
        </button>
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "tuningSystem-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("tuningSystem-admin")}
        >
          Tuning System Admin
        </button>
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "jins" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("jins")}
          disabled={!selectedTuningSystem}
        >
          Ajnās
          {/* {selectedJins ? selectedJins.getName() : "Ajnās"} */}
        </button>
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "jins-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("jins-admin")}
          disabled={!selectedTuningSystem}
        >
          Jins Admin
        </button>
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "maqam" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("maqam")}
          disabled={!selectedTuningSystem}
        >
          Maqāmāt
          {/* {selectedMaqam ? selectedMaqam.getName() : "Maqāmāt"} */}
        </button>
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "maqam-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("maqam-admin")}
          disabled={!selectedTuningSystem}
        >
          Maqam Admin
        </button>
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "sayr" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("sayr")}
          disabled={!selectedMaqam}
        >
          Suyūr
        </button>
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "sayr-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("sayr-admin")}
          disabled={!selectedMaqam}
        >
          Sayr Admin
        </button>
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "bibliography" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("bibliography")}
        >
          Bibliography
        </button>
        <button
          className={`navbar__bottom-bar-item ${selectedMenu === "pattern" ? "navbar__bottom-bar-item_selected" : ""}`}
          onClick={() => setSelectedMenu("pattern")}
        >
          Patterns
        </button>
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
