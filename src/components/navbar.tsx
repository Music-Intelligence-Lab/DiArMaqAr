"use client";

import React, { useMemo } from "react";
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
  const { t, isRTL, language, getDisplayName } = useLanguageContext();
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
    setSelectedTuningSystem,
    clearSelections,
    setTuningSystemPitchClasses,
    setSelectedIndices,
    getModulations,
    selectedIndices,
    allPitchClasses,
  } = useAppContext();

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
                const tuningSystemSection = document.querySelector(
                  ".tuning-system-manager"
                );
                if (tuningSystemSection) {
                  tuningSystemSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                } else {
                  // Fallback: scroll to top if tuning system section not found
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            }}
          >
            {selectedTuningSystem ? (
              <>
                <span className="navbar__bottom-bar-item_tab-title">
                  {language === 'ar' && selectedTuningSystem.getCreatorArabic() 
                    ? `${selectedTuningSystem.getCreatorArabic()} (${selectedTuningSystem.getYear()})`
                    : `${selectedTuningSystem.getCreatorEnglish()} (${selectedTuningSystem.getYear()})`
                  }
                </span>
                <span className="navbar__bottom-bar-item_tab-subtitle">
                  {language === 'ar' && selectedTuningSystem.getTitleArabic()
                    ? selectedTuningSystem.getTitleArabic()
                    : selectedTuningSystem.getTitleEnglish()
                  }
                  <br />
                  [{octaveOneNoteNames[selectedIndices[0]] ? getDisplayName(octaveOneNoteNames[selectedIndices[0]], 'note') : t('octave.none')}]
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
                ? `${getDisplayName(selectedJinsData.getName(), 'jins')} al-${getDisplayName(
                    selectedJins.jinsPitchClasses.map(
                      (pitchClass) => pitchClass.noteName
                    )[0], 'note'
                  )} (${getEnglishNoteName(
                    selectedJins.jinsPitchClasses.map(
                      (pitchClass) => pitchClass.noteName
                    )[0]
                  )})`
                : `${getDisplayName(selectedJinsData.getName(), 'jins')} (${getDisplayName(
                    selectedJinsData.getNoteNames()[0], 'note'
                  )}/${getEnglishNoteName(
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
                ? getDisplayName(selectedMaqam.name, 'maqam')
                : `${getDisplayName(selectedMaqamData.getName(), 'maqam')} (${getDisplayName(
                    selectedMaqamData.getAscendingNoteNames()[0], 'note'
                  )}/${getEnglishNoteName(
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
    const orderedTabs = isRTL ? [...filteredTabs].reverse() : filteredTabs;
    
    return orderedTabs;
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
            <h1
              className="navbar__title"
              onClick={() => {
                clearSelections();
                setSelectedTuningSystem(null);
                setTuningSystemPitchClasses("");
                setSelectedIndices([]);
                setSelectedMenu("tuningSystem");
              }}
            >
              شبكة المقام العربي Arabic Maqām Network
            </h1>
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
        <div className={`navbar__bottom-bar ${isRTL ? 'navbar__bottom-bar--rtl' : ''}`}>
          {getNavbarTabs().map(tab => tab.content)}
        </div>
      </nav>
    </>
  );
}
