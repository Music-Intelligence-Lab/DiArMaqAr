"use client";

import React, { useMemo } from "react";
import SettingsCard from "@/components/settings-cards";
import LanguageSelector from "@/components/language-selector";
import useAppContext from "@/contexts/app-context";
import useMenuContext from "@/contexts/menu-context";
import useLanguageContext from "@/contexts/language-context";
import useSoundContext from "@/contexts/sound-context";
import { Sayr } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import NavigationMenu from "./navigation-menu";
import { octaveOneNoteNames } from "@/models/NoteName";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";

export default function Navbar() {
  const { showAdminTabs, setShowAdminTabs, selectedMenu, setSelectedMenu } =
    useMenuContext();
  const { t, isRTL, language, getDisplayName } = useLanguageContext();
  const { stopAllSounds } = useSoundContext();
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
          .getSuyur()
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

  // Helper function to handle tab clicks with scroll behavior
  const handleTabClick = (tabName: typeof selectedMenu) => {
    const isAlreadySelected = selectedMenu === tabName;
    if (typeof window !== "undefined") {
      if (isAlreadySelected) {
        // Second click on same tab - scroll to top with smooth behavior
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
          mainContent.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        // First click on new tab - set menu and let the page scroll to top naturally
        setSelectedMenu(tabName);
      }
    } else {
      setSelectedMenu(tabName);
    }
  };

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
            onClick={() => handleTabClick("tuningSystem")}
            data-tooltip={!selectedTuningSystem ? t('tabs.tooltip.selectTuningSystem') : undefined}
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
                    }{" "}
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
            onClick={() => handleTabClick("jins")}
            disabled={!selectedTuningSystem}
            data-tooltip={!selectedTuningSystem ? t('tabs.tooltip.selectTuningSystemToExploreAjnas') : undefined}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedTuningSystem
                ? `${t('tabs.ajnas')} (${
                    ajnas.filter((jinsData) =>
                      jinsData.isJinsPossible(
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
            data-tooltip={!selectedTuningSystem ? t('tabs.tooltip.selectTuningSystemToExploreAjnas') : undefined}
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
            onClick={() => handleTabClick("maqam")}
            disabled={!selectedTuningSystem}
            data-tooltip={!selectedTuningSystem ? t('tabs.tooltip.selectTuningSystemToExploreMaqamat') : undefined}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedTuningSystem
                ? `${t('tabs.maqamat')} (${
                    maqamat.filter((maqamData) =>
                      maqamData.isMaqamPossible(
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
            data-tooltip={!selectedTuningSystem ? t('tabs.tooltip.selectTuningSystemToExploreMaqamat') : undefined}
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
            data-tooltip={!selectedMaqamData ? t('tabs.tooltip.selectMaqamToExploreSuyur') : undefined}
          >
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedMaqamData
                ? `${t('tabs.suyur')} (${selectedMaqamData.getSuyur().length})`
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
            data-tooltip={!selectedMaqamData ? t('tabs.tooltip.selectMaqamToExploreSuyur') : undefined}
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
            data-tooltip={!selectedMaqamData ? t('tabs.tooltip.selectMaqamToExploreIntiqalat') : undefined}
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
              <span className="navbar__title-line">أرشيف المقامات العربية الرقمي</span>
              <span className="navbar__title-line">Digital Arabic Maqām Archive</span>
            </h1>
          </div>
          <div className="navbar__right-panel">
            <div className="navbar__right-panel-language">
              <LanguageSelector />
            </div>
            <div className="navbar__right-panel-icon">
              <SettingsCard />
            </div>
            <div className="navbar__quick-actions">
              {/* <button 
                className="navbar__quick-action-button" 
                onClick={clearSelections}
                aria-label={t('settings.clearSelections')}
                title={t('settings.clearSelections')}
              >
                {t('settings.clearSelections')}
              </button> */}
              <button 
                className="navbar__quick-action-button" 
                onClick={stopAllSounds}
                aria-label={t('settings.stopAllSounds')}
                title={t('settings.stopAllSounds')}
              >
                {t('settings.stopAllSounds')}
              </button>
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
