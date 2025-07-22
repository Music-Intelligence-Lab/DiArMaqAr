"use client";

import React, { useEffect, useRef, useMemo } from "react";
import SettingsCard from "@/components/settings-cards";
import LanguageSelector from "@/components/language-selector";
import useAppContext from "@/contexts/app-context";
import useMenuContext from "@/contexts/menu-context";
import useLanguageContext from "@/contexts/language-context";
import { Sayr } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import NavigationMenu from "./navigation-menu";
import { octaveOneNoteNames } from "@/models/NoteName";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";

export default function Navbar() {
  const { showAdminTabs, setShowAdminTabs, selectedMenu, setSelectedMenu } =
    useMenuContext();
  const { t, isRTL } = useLanguageContext();
  const {
    selectedTuningSystem,
    selectedJinsData,
    selectedJins,
    selectedMaqamData,
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
    const selectedEls = container.querySelectorAll<HTMLElement>(
      ".navbar__pc-cell_selected"
    );
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

  const selectedSayr: Sayr | null =
    selectedMaqamData && maqamSayrId
      ? selectedMaqamData
          .getSuyūr()
          .find((sayr) => sayr.id === maqamSayrId) || null
      : null;

  const selectedSayrSource = selectedSayr
    ? sources.find((source) => source.getId() === selectedSayr.sourceId)
    : null;

  const totalModulations = useMemo(() => {
    if (!selectedMaqamData) return null;
    const transposition = selectedMaqamData.getTahlil(allPitchClasses);
    const modulations = getModulations(transposition);
    return calculateNumberOfModulations(modulations);
  }, [selectedMaqamData, getModulations]);

  // Helper function to create navbar tabs array and handle RTL ordering
  const getNavbarTabs = () => {
    const tabs = [
      {
        key: "tuningSystem",
        condition: true,
        content: (
          <button
            key="tuningSystem"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "tuningSystem"
                ? "navbar__bottom-bar-item_selected "
                : ""
            } ${selectedTuningSystem ? "navbar__bottom-bar-item_active" : ""}`}
            onClick={() => {
              setSelectedMenu("tuningSystem");
              if (typeof window !== "undefined") {
                const html = document.documentElement;
                if (html && html.scrollIntoView) {
                  html.scrollIntoView({ behavior: "smooth", block: "start" });
                } else if (document.body && document.body.scrollIntoView) {
                  document.body.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            }}
          >
            {selectedTuningSystem ? (
              <>
                <span className="navbar__bottom-bar-item_tab-title">
                  {selectedTuningSystem.getCreatorEnglish()} (
                  {selectedTuningSystem.getYear()})
                </span>
                <span className="navbar__bottom-bar-item_tab-subtitle">
                  {selectedTuningSystem.getTitleEnglish()} 
                  <br />
                  [{octaveOneNoteNames[selectedIndices[0]] ?? "none"}]
                </span>
              </>
            ) : (
              t('tabs.tuningSystem')
            )}
          </button>
        )
      },
      {
        key: "tuningSystem-admin",
        condition: showAdminTabs,
        content: (
          <button
            key="tuningSystem-admin"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "tuningSystem-admin"
                ? "navbar__bottom-bar-item_selected"
                : ""
            }`}
            onClick={() => setSelectedMenu("tuningSystem-admin")}
          >
            {t('tabs.tuningSystemAdmin')}
          </button>
        )
      },
      {
        key: "jins",
        condition: true,
        content: (
          <button
            key="jins"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "jins" ? "navbar__bottom-bar-item_selected" : ""
            } ${selectedJinsData ? "navbar__bottom-bar-item_active" : ""}`}
            onClick={() => {
              setSelectedMenu("jins");
              if (typeof window !== "undefined") {
                const jinsTranspositions = document.querySelector(
                  ".jins-transpositions"
                );
                if (jinsTranspositions) {
                  jinsTranspositions.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            }}
            disabled={!selectedTuningSystem}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedTuningSystem
                ? `${t('tabs.ajnas')} (${
                    ajnas.filter((jinsData) =>
                      jinsData.isJinsSelectable(
                        allPitchClasses.map((pitchClass) => pitchClass.noteName)
                      )
                    ).length
                  }/${ajnas.length})`
                : t('tabs.ajnas')}
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {!selectedJinsData
                ? ""
                : selectedJins
                ? `${selectedJinsData.getName()} al-${
                    selectedJins.jinsPitchClasses.map(
                      (pitchClass) => pitchClass.noteName
                    )[0]
                  } (${getEnglishNoteName(
                    selectedJins.jinsPitchClasses.map(
                      (pitchClass) => pitchClass.noteName
                    )[0]
                  )})`
                : `${selectedJinsData.getName()} (${
                    selectedJinsData.getNoteNames()[0]
                  }/${getEnglishNoteName(
                    selectedJinsData.getNoteNames()[0]
                  )})`}
            </span>
          </button>
        )
      },
      {
        key: "jins-admin",
        condition: showAdminTabs,
        content: (
          <button
            key="jins-admin"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "jins-admin"
                ? "navbar__bottom-bar-item_selected"
                : ""
            }`}
            onClick={() => setSelectedMenu("jins-admin")}
            disabled={!selectedTuningSystem}
          >
            {t('tabs.jinsAdmin')}
          </button>
        )
      },
      {
        key: "maqam",
        condition: true,
        content: (
          <button
            key="maqam"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "maqam" ? "navbar__bottom-bar-item_selected" : ""
            } ${selectedMaqamData ? "navbar__bottom-bar-item_active" : ""}`}
            onClick={() => {
              setSelectedMenu("maqam");
              if (typeof window !== "undefined") {
                const maqamTranspositions = document.querySelector(
                  ".maqam-transpositions"
                );
                if (maqamTranspositions) {
                  maqamTranspositions.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            }}
            disabled={!selectedTuningSystem}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedTuningSystem
                ? `${t('tabs.maqamat')} (${
                    maqamat.filter((maqamData) =>
                      maqamData.isMaqamSelectable(
                        allPitchClasses.map((pitchClass) => pitchClass.noteName)
                      )
                    ).length
                  }/${maqamat.length})`
                : t('tabs.maqamat')}{" "}
              <br />
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {!selectedMaqamData
                ? ""
                : selectedMaqam
                ? selectedMaqam.name
                : `${selectedMaqamData.getName()} (${
                    selectedMaqamData.getAscendingNoteNames()[0]
                  }/${getEnglishNoteName(
                    selectedMaqamData.getAscendingNoteNames()[0]
                  )})`}
            </span>
          </button>
        )
      },
      {
        key: "maqam-admin",
        condition: showAdminTabs,
        content: (
          <button
            key="maqam-admin"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "maqam-admin"
                ? "navbar__bottom-bar-item_selected"
                : ""
            }`}
            onClick={() => setSelectedMenu("maqam-admin")}
            disabled={!selectedTuningSystem}
          >
            {t('tabs.maqamAdmin')}
          </button>
        )
      },
      {
        key: "sayr",
        condition: true,
        content: (
          <button
            key="sayr"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "sayr" ? "navbar__bottom-bar-item_selected" : ""
            } ${selectedSayr ? "navbar__bottom-bar-item_active" : ""}`}
            onClick={() => setSelectedMenu("sayr")}
            disabled={!selectedMaqamData}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedMaqamData
                ? `${t('tabs.suyur')} (${selectedMaqamData.getSuyūr().length})`
                : t('tabs.suyur')}{" "}
              <br />
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {selectedSayr &&
                `${selectedSayr.creatorEnglish} ${
                  selectedSayrSource
                    ? `(${selectedSayrSource.getPublicationDateEnglish()})`
                    : ""
                }`}
            </span>
          </button>
        )
      },
      {
        key: "sayr-admin",
        condition: showAdminTabs,
        content: (
          <button
            key="sayr-admin"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "sayr-admin"
                ? "navbar__bottom-bar-item_selected"
                : ""
            }`}
            onClick={() => setSelectedMenu("sayr-admin")}
            disabled={!selectedMaqamData}
          >
            {t('tabs.sayrAdmin')}
          </button>
        )
      },
      {
        key: "modulation",
        condition: true,
        content: (
          <button
            key="modulation"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "modulation"
                ? "navbar__bottom-bar-item_selected"
                : ""
            }`}
            onClick={() => setSelectedMenu("modulation")}
            disabled={!selectedMaqamData}
          >
            {t('tabs.intiqalat')}{selectedMaqamData ? ` (${totalModulations})` : ""}
          </button>
        )
      },
      {
        key: "pattern-admin",
        condition: showAdminTabs,
        content: (
          <button
            key="pattern-admin"
            className={`navbar__bottom-bar-item ${
              selectedMenu === "pattern-admin"
                ? "navbar__bottom-bar-item_selected"
                : ""
            }`}
            onClick={() => setSelectedMenu("pattern-admin")}
          >
            {t('tabs.patternsAdmin')}
          </button>
        )
      }
    ];

    // Filter tabs by condition
    const filteredTabs = tabs.filter(tab => tab.condition);
    
    // Reverse order for RTL languages
    return isRTL ? filteredTabs.reverse() : filteredTabs;
  };

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
                {showAdminTabs ? t('settings.userMode') : t('settings.adminMode')}
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
              شبكة المقام العربي Arabic Maqām Network
            </span>
          </div>
          <div className="navbar__right-panel">
            <div className="navbar__right-panel-language">
              <LanguageSelector />
            </div>
            <div className="navbar__right-panel-icon">
              <SettingsCard />
            </div>
          </div>
        </header>
        <div className="navbar__bottom-bar">
          {getNavbarTabs().map(tab => tab.content)}
        </div>
      </nav>
    </>
  );
}
