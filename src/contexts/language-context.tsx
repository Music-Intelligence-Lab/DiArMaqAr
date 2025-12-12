"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { getDynamicArabicName } from "@/functions/dynamicArabicConverter";

/**
 * Supported languages in the application
 */
export type Language = "en" | "ar" | "fr";

/**
 * Interface for the language context that manages language state and translation functions
 */
interface LanguageContextInterface {
  language: Language; // Current selected language
  setLanguage: (language: Language) => void; // Function to change language
  isRTL: boolean; // Whether current language is right-to-left
  t: (key: string) => string; // Translation function for localized strings
  getDisplayName: (name: string, type: "note" | "jins" | "maqam") => string; // Get localized display name
}

/**
 * React context for managing language state across the application
 */
const LanguageContext = createContext<LanguageContextInterface | undefined>(
  undefined
);

/**
 * Translation dictionaries for English, Arabic, and French
 */
const translations = {
  en: {
    // Navigation Menu
    "nav.home": "Home",
    "nav.tools": "Tools",
    "nav.bibliography": "Bibliography",
    "nav.statistics": "Statistics",
    "nav.documentation": "Documentation",
    "nav.about": "About",
    "nav.credits": "Credits",

    // Navbar Tabs
    "tabs.tuningSystem": "Tanāghīm (tuning systems)",
    "tabs.ajnas": "Ajnās",
    "tabs.maqamat": "Maqāmāt",
    "tabs.suyur": "Suyūr",
    "tabs.intiqalat": "Intiqālāt",

    // Admin Tabs
    "tabs.tuningSystemAdmin": "Tuning System Admin",
    "tabs.jinsAdmin": "Jins Admin",
    "tabs.maqamAdmin": "Maqam Admin",
    "tabs.sayrAdmin": "Sayr Admin",
    "tabs.patternsAdmin": "Patterns Admin",

    // Navbar Tooltips
    "tabs.tooltip.selectTuningSystem": "Select a tuning system",
    "tabs.tooltip.selectTuningSystemToExploreAjnas": "Select a tuning system to explore ajnās",
    "tabs.tooltip.selectTuningSystemToExploreMaqamat": "Select a tuning system to explore maqāmāt",
    "tabs.tooltip.selectMaqamToExploreSuyur": "Select a maqām to explore suyūr",
    "tabs.tooltip.selectMaqamToExploreIntiqalat": "Select a maqām to explore intiqālāt",

    // Settings
    "settings.userMode": "User Mode",
    "settings.adminMode": "Admin Mode",
    "settings.title": "Sound and app settings",
    "settings.pattern": "Pattern",
    "settings.tempo": "Tempo (BPM):",
    "settings.patternSelect": "Pattern Select:",
    "settings.droneOn": "Drone On",
    "settings.droneOff": "Drone Off",
    "settings.liveInput": "Live Input",
    "settings.midiInput": "MIDI Input:",
    "settings.refresh": "Refresh",
    "settings.chooseInput": "– choose an input –",
    "settings.qwerty": "QWERTY",
    "settings.midi": "MIDI",
    "settings.tuningSystem": "Tuning System",
    "settings.jinsOrMaqam": "Jins/Maqām",
    "settings.envelope": "Envelope",
    "settings.volume": "Volume:",
    "settings.droneVolume": "Drone volume:",
    "settings.attack": "Attack (s):",
    "settings.release": "Release (s):",
    "settings.timbre": "Timbre",
    "settings.output": "Output",
    "settings.midiOutput": "MIDI Output:",
    "settings.chooseOutput": "– choose an output –",
    "settings.pitchBendRange": "Pitch Bend Range (semitones):",
    "settings.useMPE": "Use MPE",
    "settings.clearSelections": "Clear Selections",
    "settings.clearHangingNotes": "Clear Hanging Notes",
    "settings.stopAllSounds": "Stop All Sounds",
    "settings.web": "Web",
    "settings.midiMode": "MIDI",
    "settings.waveform": "Waveform:",
    "settings.basic": "Basic",
    "settings.customPeriodic": "Custom Periodic",
    "settings.aperiodic": "Aperiodic",
    "settings.mute": "Mute",
    "settings.waveformMode": "Waveform",
    "settings.resetEnvelope": "Reset Envelope",
    "settings.octaveShift": "Octave Shift",
    "settings.octaveDown": "↓",
    "settings.octaveUp": "↑",
    "settings.reset": "Reset",
    "settings.octaves": "octave(s)",

    // Language selector
    "language.english": "English",
    "language.arabic": "العربية",
    "language.french": "Français",

    // Jins Manager
    "jins.noAjnasAvailable": "No ajnas available.",
    "jins.transpositions": "Transpositions",
    "jins.createNewJins": "Create New Jins",
    "jins.enterNewJinsName": "Enter new jins name",
    "jins.save": "Save",
    "jins.delete": "Delete",
    "jins.clear": "Clear",
    "jins.addSource": "Add Source",
    "jins.selectSource": "Select source",
    "jins.page": "Page",
    "jins.commentsEnglish": "Comments (English)",
    "jins.commentsArabic": "Comments (Arabic)",

    // Jins Transpositions
    "jins.analysis": "Taḥlīl (analysis)",
    "jins.centsTolerance": "Cents Tolerance",
    "jins.darajatAlIstiqrar": "Darajat al-Istiqrār al-Taqlīdīya (conventional tonic/finalis)",
    "jins.selectLoadToKeyboard": "Select & Load to Keyboard",
    "jins.playJins": "Play jins",
    "jins.export": "Export",
    "jins.copyTable": "Copy Table",
    "jins.showDetails": "Show Details",
    "jins.hideDetails": "Hide Details",
    "jins.noteNames": "Note Names",
    "jins.pitchClass": "Pitch Class",
    "jins.abjadName": "Abjad",
    "jins.englishName": "English Name",
    "jins.solfege": "Solfege",
    "jins.fraction": "Fraction",
    "jins.cents": "Cents",
    "jins.centsFromZero": "Cents from 0",
    "jins.centsDeviation": "12-EDO Deviation",
    "jins.decimalRatio": "Decimal",
    "jins.stringLength": "String Length",
    "jins.fretDivision": "Fret Division",
    "jins.midiNote": "MIDI Decimal",
    "jins.midiNoteDeviation": "MIDI & Deviation",
    "jins.frequency": "Freq (Hz)",
    "jins.play": "Play",
    "jins.staffNotation": "Staff Notation",
    "jins.comments": "Comments",
    "jins.sources": "Sources",
    "jins.transpositionsTitle": "Taṣāwīr (transpositions)",
    "jins.all": "All Ajnas",

    // Value types
    "valueType.fraction": "Fraction",
    "valueType.cents": "Cents",
    "valueType.decimalRatio": "Decimal",
    "valueType.stringLength": "String Length",
    "valueType.fretDivision": "Fret Division",

    // Filter labels
    "filter.pitchClass": "Pitch Class",
    "filter.abjadName": "Abjad",
    "filter.englishName": "English Name",
    "filter.solfege": "Solfege",
    "filter.fraction": "Fraction",
    "filter.cents": "Cents",
    "filter.centsFromZero": "Cents from 0",
    "filter.decimalRatio": "Decimal",
    "filter.stringLength": "String Length",
    "filter.fretDivision": "Fret Division",
    "filter.midiNote": "MIDI Decimal",
    "filter.midiNoteDeviation": "MIDI & Deviation",
    "filter.frequency": "Freq (Hz)",
    "filter.staffNotation": "Staff Notation",
    "filter.centsDeviation": "12-EDO Deviation",

    // Maqam Manager
    "maqam.transpositions": "Transpositions",
    "maqam.createNewMaqam": "Create New Maqam",
    "maqam.enterMaqamName": "Enter maqam name",
    "maqam.saveName": "Save Name",
    "maqam.saveAscending": "Save Ascending",
    "maqam.saveDescending": "Save Descending",
    "maqam.delete": "Delete",
    "maqam.clear": "Clear",
    "maqam.addSource": "Add Source",
    "maqam.selectSource": "Select source",
    "maqam.page": "Page",
    "maqam.commentsEnglish": "Comments (English)",
    "maqam.commentsArabic": "Comments (Arabic)",

    // Maqam Transpositions
    "maqam.analysis": "Taḥlīl (analysis)",
    "maqam.centsTolerance": "Cents Tolerance",
    "maqam.darajatAlIstiqrar": "Darajat al-Istiqrār al-Taqlīdīya (conventional tonic/finalis)",
    "maqam.selectLoadToKeyboard": "Select & Load to Keyboard",
    "maqam.ascendingDescending": "Asc > Desc",
    "maqam.ascending": "Ascending",
    "maqam.descending": "Descending",
    "maqam.export": "Export",
    "maqam.copyTable": "Copy Table",
    "maqam.showDetails": "Show Details",
    "maqam.hideDetails": "Hide Details",
    "maqam.scaleDegrees": "Maqām Degree",
    "maqam.noteNames": "Note Names",
    "maqam.pitchClass": "Pitch Class",
    "maqam.abjadName": "Abjad",
    "maqam.englishName": "English Name",
    "maqam.solfege": "Solfege",
    "maqam.fraction": "Fraction",
    "maqam.cents": "Cents",
    "maqam.centsFromZero": "Cents from 0",
    "maqam.centsDeviation": "12-EDO Deviation",
    "maqam.decimalRatio": "Decimal",
    "maqam.stringLength": "String Length",
    "maqam.fretDivision": "Fret Division",
    "maqam.midiNote": "MIDI Decimal",
    "maqam.midiNoteDeviation": "MIDI & Deviation",
    "maqam.frequency": "Freq (Hz)",
    "maqam.play": "Play",
    "maqam.ajnas": "Ajnas",
    "maqam.staffNotation": "Staff Notation",
    "maqam.comments": "Comments",
    "maqam.sources": "Sources",
    "maqam.transpositionsTitle": "Taṣāwīr (transpositions)",
    "maqam.all": "All Maqamat",
    "maqam.groupByJins": "Group by Jins",
    "maqam.groupByStartingNote": "Group by Starting Note",
    "maqam.noJins": "no jins",

    // Tuning System Manager
    "tuningSystem.all": "All Tuning Systems",
    "tuningSystem.8th10thCentury": "8th–10th c. CE",
    "tuningSystem.11th15thCentury": "11th–15th c. CE",
    "tuningSystem.16th19thCentury": "16th–19th c. CE",
    "tuningSystem.20th21stCentury": "20th–21st c. CE",
    "tuningSystem.selectOrCreate": "Select Tuning System or Create New:",
    "tuningSystem.createNew": "-- Create New System --",
    "tuningSystem.none": "-- None --",
    "tuningSystem.sortBy": "Sort By:",
    "tuningSystem.id": "ID",
    "tuningSystem.creator": "Creator (English)",
    "tuningSystem.year": "Year",
    "tuningSystem.titleEnglish": "Title (English)",
    "tuningSystem.titleArabic": "Title (Arabic)",
    "tuningSystem.creatorEnglish": "Creator (English)",
    "tuningSystem.creatorArabic": "Creator (Arabic)",
    "tuningSystem.commentsEnglish": "Comments (English)",
    "tuningSystem.commentsArabic": "Comments (Arabic)",
    "tuningSystem.addSource": "Add Source",
    "tuningSystem.selectSource": "Select source",
    "tuningSystem.page": "Page",
    "tuningSystem.delete": "Delete",
    "tuningSystem.pitchClasses": "Pitch Classes (one per line)",
    "tuningSystem.stringLength": "String Length",
    "tuningSystem.defaultReferenceFrequency": "Default Reference Frequency",
    "tuningSystem.save": "Save Tuning System Changes",
    "tuningSystem.create": "Create New Tuning System",
    "tuningSystem.deleteTuningSystem": "Delete Tuning System",
    "tuningSystem.startingNoteName": "Starting Note Name:",
    "tuningSystem.frequency": "Frequency (Hz):",
    "tuningSystem.saveNoteConfiguration": "Save Note Name Configuration",
    "tuningSystem.deleteNoteConfiguration": "Delete Note Name Configuration",
    "tuningSystem.export": "Export:",
    "tuningSystem.comments": "Comments:",
    "tuningSystem.sources": "Sources:",
    "tuningSystem.noSystemsAvailable": "No tuning systems available.",
    "tuningSystem.unsaved": "unsaved",

    // Tuning System Octave Tables
    "octave.title": "Dīwān (octave)",
    "octave.cascadeEnabled": "Cascade Enabled",
    "octave.cascadeDisabled": "Cascade Disabled",
    "octave.pitchClass": "Pitch Class",
    "octave.noteNames": "Note Name",
    "octave.abjadName": "Abjad",
    "octave.englishName": "English Name",
    "octave.solfege": "Solfege",
    "octave.fractionRatio": "Fraction Ratio",
    "octave.cents": "Cents",
    "octave.centsDeviation": "12-EDO Deviation",
    "octave.decimalRatio": "Decimal",
    "octave.stringLength": "String Length",
    "octave.fretDivision": "Fret Division",
    "octave.midiNote": "MIDI Decimal",
    "octave.midiNoteDeviation": "MIDI & Deviation",
    "octave.frequency": "Freq (Hz)",
    "octave.play": "Play",
    "octave.select": "Select",
    "octave.staffNotation": "Staff Notation",
    "octave.copyTable": "Copy Table",
    "octave.none": "(none)",

    // Selected Pitch Classes Transpositions
    "analysis.title": "Taḥlīl (analysis)",
    "analysis.selectedPitchClasses": "Selected Pitch Classes",
    "analysis.centsTolerance": "Cents Tolerance",
    "analysis.playSelectedPitchClasses": "Play Selections",
    "analysis.copyTable": "Copy Table",
    "analysis.copyTableToClipboard": "Copy Table to Clipboard",
    "analysis.tableCopied": "Table copied to clipboard!",
    "analysis.copyFailed": "Failed to copy table.",
    "analysis.noteNames": "Note Names",
    "analysis.pitchClass": "Pitch Class",
    "analysis.abjadName": "Abjad",
    "analysis.englishName": "English Name",
    "analysis.solfege": "Solfege",
    "analysis.fraction": "fraction",
    "analysis.cents": "Cents",
    "analysis.centsFromZero": "Cents from 0",
    "analysis.centsDeviation": "12-EDO Deviation",
    "analysis.decimalRatio": "Decimal",
    "analysis.stringLength": "String Length",
    "analysis.fretDivision": "Fret Division",
    "analysis.midiNote": "MIDI Decimal",
    "analysis.midiNoteDeviation": "MIDI & Deviation",
    "analysis.frequency": "Freq (Hz)",
    "analysis.staffNotation": "Staff Notation",
    "analysis.play": "Play",

    // Modulations
    "modulations.expand": "Expand",
    "modulations.collapse": "Collapse",
    "modulations.ajnasModulations": "ajnās modulations",
    "modulations.maqamatModulations": "maqāmāt modulations",
    "modulations.deleteHop": "Delete Hop",
    "modulations.tonic": "Tonic",
    "modulations.third": "Third",
    "modulations.thirdAlternative": "Third (alternative)",
    "modulations.fourth": "Fourth",
    "modulations.fifth": "Fifth",
    "modulations.sixthIfNoThird": "Sixth (if no Third)",
    "modulations.sixthAscending": "Sixth (ascending)",
    "modulations.sixthDescending": "Sixth (descending)",
    "modulations.octaveShift": "Octave Shift (-1)",

    // Sayr Manager
    "sayr.selectOrCreate": "Select Sayr or Create New:",
    "sayr.newSayr": "-- New Sayr --",
    "sayr.noSuyurAvailable": "No suyūr available.",
    "sayr.noSource": "No Source",
    "sayr.source": "Source",
    "sayr.selectSource": "Select source",
    "sayr.page": "Page",
    "sayr.commentsEnglish": "Comments (English)",
    "sayr.commentsArabic": "Comments (Arabic)",
    "sayr.commentsOnSayr": "Comments on Sayr of",
    "sayr.stops": "Stops",
    "sayr.addStop": "+ Add Stop",
    "sayr.note": "note",
    "sayr.jins": "jins",
    "sayr.maqam": "maqam",
    "sayr.direction": "direction",
    "sayr.none": "(none)",
    "sayr.noDirection": "(no direction)",
    "sayr.ascending": "ascending",
    "sayr.descending": "descending",
    "sayr.ascend": "ascend",
    "sayr.descend": "descend",
    "sayr.ascendTo": "ascend to",
    "sayr.descendTo": "descend to",
    "sayr.delete": "Delete",
    "sayr.updateSayr": "Update Sayr",
    "sayr.saveSayr": "Save Sayr",
    "sayr.deleteSayr": "Delete Sayr",
    "sayr.definiteArticle": " al-",
    "sayr.transpositionWarning":
      "Some notes in this sayr could not be transposed due to tuning system limitations.",
  },
  ar: {
    // Navigation Menu
    "nav.home": "الرئيسية",
    "nav.tools": "الأدوات",
    "nav.bibliography": "المراجع",
    "nav.statistics": "الإحصائيات",
    "nav.documentation": "التوثيق",
    "nav.about": "حول المنصة",
    "nav.credits": "صفحة الإعتمادات",

    // Navbar Tabs
    "tabs.tuningSystem": "تناغيم",
    "tabs.ajnas": "أجناس",
    "tabs.maqamat": "مقامات",
    "tabs.suyur": "سيور",
    "tabs.intiqalat": "إنتقالات",

    // Admin Tabs
    "tabs.tuningSystemAdmin": "إدارة نظام التنغيم",
    "tabs.jinsAdmin": "إدارة الجنس",
    "tabs.maqamAdmin": "إدارة المقام",
    "tabs.sayrAdmin": "إدارة السَير",
    "tabs.patternsAdmin": "إدارة الأنماط",

    // Navbar Tooltips
    "tabs.tooltip.selectTuningSystem": "اختر نظام تنغيم",
    "tabs.tooltip.selectTuningSystemToExploreAjnas": "اختر نظام تنغيم لاستكشاف الأجناس",
    "tabs.tooltip.selectTuningSystemToExploreMaqamat": "اختر نظام تنغيم لاستكشاف المقامات",
    "tabs.tooltip.selectMaqamToExploreSuyur": "اختر مقاماً لاستكشاف السيور",
    "tabs.tooltip.selectMaqamToExploreIntiqalat": "اختر مقاماً لاستكشاف الانتقالات",

    // Settings
    "settings.userMode": "وضع المستخدم",
    "settings.adminMode": "وضع الإدارة",
    "settings.title": "إعدادات الصوت والتطبيق",
    "settings.pattern": "نمط",
    "settings.tempo": "السرعة (نبضة/دقيقة):",
    "settings.patternSelect": "اختيار النمط:",
    "settings.droneOn": "تفعيل الدرون",
    "settings.droneOff": "إيقاف الدرون",
    "settings.liveInput": "إدخال مباشر",
    "settings.midiInput": "مدخل ميدي:",
    "settings.refresh": "تحديث",
    "settings.chooseInput": "– اختر مدخلاً –",
    "settings.qwerty": "كيبورد",
    "settings.midi": "ميدي",
    "settings.tuningSystem": "نظام التنغيم",
    "settings.jinsOrMaqam": "جنس/مقام",
    "settings.envelope": "مُغلّف الصوت",
    "settings.volume": "الصوت:",
    "settings.droneVolume": "مستوى صوت الدرون:",
    "settings.attack": "البداية (ثانية):",
    "settings.release": "النهاية (ثانية):",
    "settings.timbre": "اللون الصوتي",
    "settings.output": "الإخراج",
    "settings.midiOutput": "مخرج ميدي:",
    "settings.chooseOutput": "– اختر مخرجاً –",
    "settings.pitchBendRange": "نطاق التحكم بالطبقة (نصف نغمة):",
    "settings.useMPE": "استخدام MPE",
    "settings.clearSelections": "مسح التحديدات",
    "settings.clearHangingNotes": "مسح النغمات العالقة",
    "settings.stopAllSounds": "إيقاف جميع الأصوات",
    "settings.web": "ويب",
    "settings.midiMode": "ميدي",
    "settings.waveform": "شكل الموجة:",
    "settings.basic": "أساسي",
    "settings.customPeriodic": "دوري مخصص",
    "settings.aperiodic": "غير دوري",
    "settings.mute": "كتم الصوت",
    "settings.waveformMode": "شكل الموجة",
    "settings.resetEnvelope": "إعادة تعيين المُغلّف",
    "settings.octaveShift": "إزاحة الأوكتاف",
    "settings.octaveDown": "↓",
    "settings.octaveUp": "↑",
    "settings.reset": "إعادة",
    "settings.octaves": "أوكتاف",

    // Language selector
    "language.english": "English",
    "language.arabic": "العربية",
    "language.french": "Français",

    // Jins Manager (Arabic translations)
    "jins.noAjnasAvailable": "لا توجد أجناس متاحة",
    "jins.transpositions": "تصاوير",
    "jins.createNewJins": "إنشاء جنس جديد",
    "jins.enterNewJinsName": "أدخل اسم الجنس الجديد",
    "jins.save": "حفظ",
    "jins.delete": "حذف",
    "jins.clear": "مسح",
    "jins.addSource": "إضافة مصدر",
    "jins.selectSource": "اختر مصدراً",
    "jins.page": "صفحة",
    "jins.commentsEnglish": "تعليقات (إنجليزية)",
    "jins.commentsArabic": "تعليقات (عربية)",

    // Jins Transpositions (Arabic translations)
    "jins.analysis": "تحليل",
    "jins.centsTolerance": "تساهل السنت",
    "jins.darajatAlIstiqrar": "درجة استقرار المقام",
    "jins.selectLoadToKeyboard": "اختر وحمّل على لوحة المفاتيح",
    "jins.playJins": "استمعوا للجنس",
    "jins.export": "تصدير",
    "jins.copyTable": "نسخ الجدول",
    "jins.showDetails": "إظهار التفاصيل",
    "jins.hideDetails": "إخفاء التفاصيل",
    "jins.noteNames": "أسماء النغمات",
    "jins.pitchClass": "فئة النغمة",
    "jins.abjadName": "أبجد",
    "jins.englishName": "الإسم الإنجليزي",
    "jins.solfege": "سولفيج",
    "jins.fraction": "النسبة",
    "jins.cents": "سنت",
    "jins.centsFromZero": "سنت من الصفر",
    "jins.centsDeviation": "الإنحراف",
    "jins.decimalRatio": "عشري",
    "jins.stringLength": "طول الوتر",
    "jins.fretDivision": "تقسيم الوتر",
    "jins.midiNote": "نوطة ميدي",
    "jins.midiNoteDeviation": "انحراف نوطة ميدي",
    "jins.frequency": "التردد",
    "jins.play": "استماع",
    "jins.staffNotation": "تدوين",
    "jins.comments": "تعليقات",
    "jins.sources": "مصادر",
    "jins.transpositionsTitle": "تصوير",
    "jins.all": "جميع الأجناس",

    // Value types (Arabic translations)
    "valueType.fraction": "النسبة",
    "valueType.cents": "سنت",
    "valueType.decimalRatio": "عشري",
    "valueType.stringLength": "طول الوتر",
    "valueType.fretDivision": "تقسيم الوتر",

    // Filter labels (Arabic)
    "filter.pitchClass": "فئة النغمة",
    "filter.abjadName": "أبجد",
    "filter.englishName": "الإسم الإنجليزي",
    "filter.solfege": "سولفيج",
    "filter.fraction": "النسبة",
    "filter.cents": "سنت",
    "filter.centsFromZero": "سنت من الصفر",
    "filter.decimalRatio": "عشري",
    "filter.stringLength": "طول الوتر",
    "filter.fretDivision": "تقسيم الوتر",
    "filter.midiNote": "نوطة ميدي",
    "filter.midiNoteDeviation": "انحراف نوطة ميدي",
    "filter.frequency": "التردد",
    "filter.staffNotation": "تدوين",
    "filter.centsDeviation": "انحراف 12-EDO",

    // Maqam Manager (Arabic translations)
    "maqam.transpositions": "تصاوير",
    "maqam.createNewMaqam": "إنشاء مقام جديد",
    "maqam.enterMaqamName": "أدخل اسم المقام",
    "maqam.saveName": "حفظ الإسم",
    "maqam.saveAscending": "حفظ الصعود",
    "maqam.saveDescending": "حفظ العبوط",
    "maqam.delete": "حذف",
    "maqam.clear": "مسح",
    "maqam.addSource": "إضافة مصدر",
    "maqam.selectSource": "اختر مصدراً",
    "maqam.page": "صفحة",
    "maqam.commentsEnglish": "تعليقات (إنجليزية)",
    "maqam.commentsArabic": "تعليقات (عربية)",

    // Maqam Transpositions (Arabic translations)
    "maqam.analysis": "تحليل",
    "maqam.centsTolerance": "تساهل السنت",
    "maqam.darajatAlIstiqrar": "درجة الاستقرار التقليدية",
    "maqam.selectLoadToKeyboard": "اختر وحمّل على لوحة المفاتيح",
    "maqam.ascendingDescending": "صعوداً > هبوطاً",
    "maqam.ascending": "صعوداً",
    "maqam.descending": "هبوطاً",
    "maqam.export": "تصدير",
    "maqam.copyTable": "نسخ الجدول",
    "maqam.showDetails": "إظهار التفاصيل",
    "maqam.hideDetails": "إخفاء التفاصيل",
    "maqam.scaleDegrees": "درجة المقام",
    "maqam.noteNames": "أسماء النغمات",
    "maqam.pitchClass": "فئة النغمة",
    "maqam.abjadName": "أبجد",
    "maqam.englishName": "الإسم الإنجليزي",
    "maqam.solfege": "سولفيج",
    "maqam.fraction": "النسبة",
    "maqam.cents": "سنت",
    "maqam.centsFromZero": "سنت من الصفر",
    "maqam.centsDeviation": "الإنحراف",
    "maqam.decimalRatio": "عشري",
    "maqam.stringLength": "طول الوتر",
    "maqam.fretDivision": "تقسيم الوتر",
    "maqam.midiNote": "نوطة ميدي",
    "maqam.midiNoteDeviation": "انحراف نوطة ميدي",
    "maqam.frequency": "التردد",
    "maqam.play": "استماع",
    "maqam.ajnas": "أجناس",
    "maqam.staffNotation": "تدوين",
    "maqam.comments": "تعليقات",
    "maqam.sources": "مصادر",
    "maqam.transpositionsTitle": "تصوير",
    "maqam.all": "جميع المقامات",
    "maqam.groupByJins": "تجميع بالأجناس",
    "maqam.groupByStartingNote": "تجميع بالنغمة الأولى",
    "maqam.noJins": "بلا جنس",

    // Tuning System Manager (Arabic translations)
    "tuningSystem.all": "جميع التناغيم",
    "tuningSystem.8th10thCentury": "القرن 8-10 م.",
    "tuningSystem.11th15thCentury": "القرن 11-15 م.",
    "tuningSystem.16th19thCentury": "القرن 16-19 م.",
    "tuningSystem.20th21stCentury": "القرن 20-21 م.",
    "tuningSystem.selectOrCreate": "اختر نظام التنغيم أو أنشئ جديداً:",
    "tuningSystem.createNew": "-- إنشاء نظام جديد --",
    "tuningSystem.none": "-- لا شيء --",
    "tuningSystem.sortBy": "ترتيب حسب:",
    "tuningSystem.id": "المعرف",
    "tuningSystem.creator": "المؤلف (إنجليزي)",
    "tuningSystem.year": "السنة",
    "tuningSystem.titleEnglish": "العنوان (إنجليزي)",
    "tuningSystem.titleArabic": "العنوان (عربي)",
    "tuningSystem.creatorEnglish": "المؤلف (إنجليزي)",
    "tuningSystem.creatorArabic": "المؤلف (عربي)",
    "tuningSystem.commentsEnglish": "تعليقات (إنجليزية)",
    "tuningSystem.commentsArabic": "تعليقات (عربية)",
    "tuningSystem.addSource": "إضافة مصدر",
    "tuningSystem.selectSource": "اختر مصدراً",
    "tuningSystem.page": "صفحة",
    "tuningSystem.delete": "حذف",
    "tuningSystem.pitchClasses": "فئات النغمات (واحدة في كل سطر)",
    "tuningSystem.stringLength": "طول الوتر",
    "tuningSystem.defaultReferenceFrequency": "التردد المرجع الافتراضي",
    "tuningSystem.save": "حفظ تعديلات نظام التنغيم",
    "tuningSystem.create": "إنشاء نظام تنغيم جديد",
    "tuningSystem.deleteTuningSystem": "حذف نظام التنغيم",
    "tuningSystem.startingNoteName": "اسم اول نغمة في بنية التنغيم:",
    "tuningSystem.frequency": "الالتردد (هرتز):",
    "tuningSystem.saveNoteConfiguration": "حفظ إعداد أسماء النغمات",
    "tuningSystem.deleteNoteConfiguration": "حذف إعداد أسماء النغمات",
    "tuningSystem.export": "تصدير:",
    "tuningSystem.comments": "تعليقات:",
    "tuningSystem.sources": "مصادر:",
    "tuningSystem.noSystemsAvailable": "لا توجد أنظمة تنغيم متاحة.",
    "tuningSystem.unsaved": "غير محفوظ",

    // Tuning System Octave Tables (Arabic translations)
    "octave.title": "الديوان (أوكتاف)",
    "octave.cascadeEnabled": "التتالي مُفعَّل",
    "octave.cascadeDisabled": "التتالي مُعطَّل",
    "octave.pitchClass": "فئة النغمة",
    "octave.noteNames": "أسماء النغمات",
    "octave.abjadName": "أبجد",
    "octave.englishName": "الإسم الإنجليزي",
    "octave.solfege": "سولفيج",
    "octave.fractionRatio": "النسبة",
    "octave.cents": "سنت",
    "octave.centsDeviation": "الإنحراف",
    "octave.decimalRatio": "عشري",
    "octave.stringLength": "طول الوتر",
    "octave.fretDivision": "تقسيم الوتر",
    "octave.midiNote": "نوطة ميدي",
    "octave.midiNoteDeviation": "انحراف نوطة ميدي",
    "octave.frequency": "التردد",
    "octave.play": "استماع",
    "octave.select": "اختيار",
    "octave.staffNotation": "تدوين",
    "octave.copyTable": "نسخ الجدول",
    "octave.none": "(لا شيء)",

    // Selected Pitch Classes Transpositions (Arabic translations)
    "analysis.title": "تحليل",
    "analysis.selectedPitchClasses": "الدرجات الصوتية المختارة",
    "analysis.centsTolerance": "تساهل السنت",
    "analysis.playSelectedPitchClasses": "استمعوا للنغمات المختارة",
    "analysis.copyTable": "نسخ الجدول",
    "analysis.copyTableToClipboard": "نسخ الجدول إلى الحافظة",
    "analysis.tableCopied": "تم نسخ الجدول إلى الحافظة!",
    "analysis.copyFailed": "فشل نسخ الجدول.",
    "analysis.noteNames": "أسماء النغمات",
    "analysis.pitchClass": "فئة النغمة",
    "analysis.abjadName": "أبجد",
    "analysis.englishName": "الإسم الإنجليزي",
    "analysis.solfege": "سولفيج",
    "analysis.fraction": "النسبة",
    "analysis.cents": "سنت",
    "analysis.centsFromZero": "سنت من الصفر",
    "analysis.centsDeviation": "الإنحراف",
    "analysis.decimalRatio": "عشري",
    "analysis.stringLength": "طول الوتر",
    "analysis.fretDivision": "تقسيم الوتر",
    "analysis.midiNote": "نوطة ميدي",
    "analysis.midiNoteDeviation": "انحراف نوطة ميدي",
    "analysis.frequency": "التردد (هرتز)",
    "analysis.staffNotation": "تدوين",
    "analysis.play": "استماع",

    // Modulations (Arabic translations)
    "modulations.expand": "توسيع",
    "modulations.collapse": "طي",
    "modulations.ajnasModulations": "إنتقالات الأجناس",
    "modulations.maqamatModulations": "إنتقالات المقامات",
    "modulations.deleteHop": "حذف القفزة",
    "modulations.tonic": "القرار",
    "modulations.third": "الثالثة",
    "modulations.thirdAlternative": "الثالثة (البديلة)",
    "modulations.fourth": "الرابعة",
    "modulations.fifth": "الخامسة",
    "modulations.sixthIfNoThird": "السادسة (إذا لم توجد ثالثة)",
    "modulations.sixthAscending": "السادسة (صعوداًة)",
    "modulations.sixthDescending": "السادسة (هبوطاًة)",
    "modulations.octaveShift": "إزاحة الأوكتاف (-١)",

    // Sayr Manager (Arabic translations)
    "sayr.selectOrCreate": "اختر السير أو أنشئ جديداً:",
    "sayr.newSayr": "-- سير جديد --",
    "sayr.noSuyurAvailable": "لا توجد سيور متاحة.",
    "sayr.noSource": "لا يوجد مصدر",
    "sayr.source": "المصدر",
    "sayr.selectSource": "اختر مصدراً",
    "sayr.page": "صفحة",
    "sayr.commentsEnglish": "تعليقات (إنجليزية)",
    "sayr.commentsArabic": "تعليقات (عربية)",
    "sayr.commentsOnSayr": "تعليقات على سير",
    "sayr.stops": "وقفات",
    "sayr.addStop": "+ إضافة وقفة",
    "sayr.note": "نغمة",
    "sayr.jins": "جنس",
    "sayr.maqam": "مقام",
    "sayr.direction": "اتجاه",
    "sayr.none": "(لا شيء)",
    "sayr.noDirection": "(لا يوجد اتجاه)",
    "sayr.ascending": "صعوداً",
    "sayr.descending": "هبوطاً",
    "sayr.ascend": "صعود",
    "sayr.descend": "هبوط",
    "sayr.ascendTo": "صعود إلى",
    "sayr.descendTo": "هبوط إلى",
    "sayr.delete": "حذف",
    "sayr.updateSayr": "تحديث السير",
    "sayr.saveSayr": "حفظ السير",
    "sayr.deleteSayr": "حذف السير",
    "sayr.definiteArticle": " ال",
    "sayr.transpositionWarning":
      "لا يمكن نقل بعض النغمات في هذا السير بسبب قيود نظام الضبط.",
  },
  fr: {
    // Navigation Menu
    "nav.home": "Accueil",
    "nav.tools": "Outils",
    "nav.bibliography": "Bibliographie",
    "nav.statistics": "Statistiques",
    "nav.documentation": "Documentation",
    "nav.about": "À propos",
    "nav.credits": "Crédits",

    // Navbar Tabs
    "tabs.tuningSystem": "Tanāghīm (systèmes d'accord)",
    "tabs.ajnas": "Ajnās",
    "tabs.maqamat": "Maqāmāt",
    "tabs.suyur": "Suyūr",
    "tabs.intiqalat": "Intiqālāt",

    // Admin Tabs
    "tabs.tuningSystemAdmin": "Administration du système d'accord",
    "tabs.jinsAdmin": "Administration du jins",
    "tabs.maqamAdmin": "Administration du maqām",
    "tabs.sayrAdmin": "Administration du sayr",
    "tabs.patternsAdmin": "Administration des motifs",

    // Navbar Tooltips
    "tabs.tooltip.selectTuningSystem": "Sélectionner un système d'accord",
    "tabs.tooltip.selectTuningSystemToExploreAjnas": "Sélectionner un système d'accord pour explorer les ajnās",
    "tabs.tooltip.selectTuningSystemToExploreMaqamat": "Sélectionner un système d'accord pour explorer les maqāmāt",
    "tabs.tooltip.selectMaqamToExploreSuyur": "Sélectionner un maqām pour explorer les suyūr",
    "tabs.tooltip.selectMaqamToExploreIntiqalat": "Sélectionner un maqām pour explorer les intiqālāt",

    // Settings
    "settings.userMode": "Mode utilisateur",
    "settings.adminMode": "Mode administrateur",
    "settings.title": "Paramètres audio et application",
    "settings.pattern": "Motif",
    "settings.tempo": "Tempo (BPM) :",
    "settings.patternSelect": "Sélection du motif :",
    "settings.droneOn": "Drone activé",
    "settings.droneOff": "Drone désactivé",
    "settings.liveInput": "Entrée en direct",
    "settings.midiInput": "Entrée MIDI :",
    "settings.refresh": "Actualiser",
    "settings.chooseInput": "– choisir une entrée –",
    "settings.qwerty": "AZERTY",
    "settings.midi": "MIDI",
    "settings.tuningSystem": "Système d'accord",
    "settings.jinsOrMaqam": "Jins/Maqām",
    "settings.envelope": "Enveloppe",
    "settings.volume": "Volume :",
    "settings.droneVolume": "Volume du drone :",
    "settings.attack": "Attaque (s) :",
    "settings.release": "Relâchement (s) :",
    "settings.timbre": "Timbre",
    "settings.output": "Sortie",
    "settings.midiOutput": "Sortie MIDI :",
    "settings.chooseOutput": "– choisir une sortie –",
    "settings.pitchBendRange": "Plage de pitch bend (demi-tons) :",
    "settings.useMPE": "Utiliser MPE",
    "settings.clearSelections": "Effacer les sélections",
    "settings.clearHangingNotes": "Effacer les notes suspendues",
    "settings.stopAllSounds": "Arrêter tous les sons",
    "settings.web": "Web",
    "settings.midiMode": "MIDI",
    "settings.waveform": "Forme d'onde :",
    "settings.basic": "Basique",
    "settings.customPeriodic": "Périodique personnalisé",
    "settings.aperiodic": "Apériodique",
    "settings.mute": "Muet",
    "settings.waveformMode": "Forme d'onde",
    "settings.resetEnvelope": "Réinitialiser l'enveloppe",
    "settings.octaveShift": "Décalage d'octave",
    "settings.octaveDown": "↓",
    "settings.octaveUp": "↑",
    "settings.reset": "Réinitialiser",
    "settings.octaves": "octave(s)",

    // Language selector
    "language.english": "English",
    "language.arabic": "العربية",
    "language.french": "Français",

    // Jins Manager
    "jins.noAjnasAvailable": "Aucun ajnās disponible.",
    "jins.transpositions": "Transpositions",
    "jins.createNewJins": "Créer un nouveau jins",
    "jins.enterNewJinsName": "Entrer le nom du nouveau jins",
    "jins.save": "Enregistrer",
    "jins.delete": "Supprimer",
    "jins.clear": "Effacer",
    "jins.addSource": "Ajouter une source",
    "jins.selectSource": "Sélectionner une source",
    "jins.page": "Page",
    "jins.commentsEnglish": "Commentaires (anglais)",
    "jins.commentsArabic": "Commentaires (arabe)",

    // Jins Transpositions
    "jins.analysis": "Taḥlīl (analyse)",
    "jins.centsTolerance": "Tolérance en cents",
    "jins.darajatAlIstiqrar": "Darajat al-Istiqrār al-Taqlīdīya (tonique/finalis conventionnel)",
    "jins.selectLoadToKeyboard": "Sélectionner et charger sur le clavier",
    "jins.playJins": "Jouer le jins",
    "jins.export": "Exporter",
    "jins.copyTable": "Copier le tableau",
    "jins.showDetails": "Afficher les détails",
    "jins.hideDetails": "Masquer les détails",
    "jins.noteNames": "Noms des notes",
    "jins.pitchClass": "Classe de hauteur",
    "jins.abjadName": "Nom abjad",
    "jins.englishName": "Nom anglais",
    "jins.solfege": "Solfège",
    "jins.fraction": "Fraction",
    "jins.cents": "Cents",
    "jins.centsFromZero": "Cents depuis 0",
    "jins.centsDeviation": "Déviation 12-EDO",
    "jins.decimalRatio": "Rapport décimal",
    "jins.stringLength": "Longueur de corde",
    "jins.fretDivision": "Division de frette",
    "jins.midiNote": "Note MIDI décimale",
    "jins.midiNoteDeviation": "MIDI et déviation",
    "jins.frequency": "Fréq. (Hz)",
    "jins.play": "Jouer",
    "jins.staffNotation": "Notation sur portée",
    "jins.comments": "Commentaires",
    "jins.sources": "Sources",
    "jins.transpositionsTitle": "Taṣāwīr (transpositions)",
    "jins.all": "Tous les ajnās",

    // Value types
    "valueType.fraction": "Fraction",
    "valueType.cents": "Cents",
    "valueType.decimalRatio": "Rapport décimal",
    "valueType.stringLength": "Longueur de corde",
    "valueType.fretDivision": "Division de frette",

    // Filter labels
    "filter.pitchClass": "Classe de hauteur",
    "filter.abjadName": "Nom abjad",
    "filter.englishName": "Nom anglais",
    "filter.solfege": "Solfège",
    "filter.fraction": "Fraction",
    "filter.cents": "Cents",
    "filter.centsFromZero": "Cents depuis 0",
    "filter.decimalRatio": "Rapport décimal",
    "filter.stringLength": "Longueur de corde",
    "filter.fretDivision": "Division de frette",
    "filter.midiNote": "Note MIDI décimale",
    "filter.midiNoteDeviation": "MIDI et déviation",
    "filter.frequency": "Fréq. (Hz)",
    "filter.staffNotation": "Notation sur portée",
    "filter.centsDeviation": "Déviation 12-EDO",

    // Maqam Manager
    "maqam.transpositions": "Transpositions",
    "maqam.createNewMaqam": "Créer un nouveau maqām",
    "maqam.enterMaqamName": "Entrer le nom du maqām",
    "maqam.saveName": "Enregistrer le nom",
    "maqam.saveAscending": "Enregistrer l'ascendant",
    "maqam.saveDescending": "Enregistrer le descendant",
    "maqam.delete": "Supprimer",
    "maqam.clear": "Effacer",
    "maqam.addSource": "Ajouter une source",
    "maqam.selectSource": "Sélectionner une source",
    "maqam.page": "Page",
    "maqam.commentsEnglish": "Commentaires (anglais)",
    "maqam.commentsArabic": "Commentaires (arabe)",

    // Maqam Transpositions
    "maqam.analysis": "Taḥlīl (analyse)",
    "maqam.centsTolerance": "Tolérance en cents",
    "maqam.darajatAlIstiqrar": "Darajat al-Istiqrār al-Taqlīdīya (tonique/finalis conventionnel)",
    "maqam.selectLoadToKeyboard": "Sélectionner et charger sur le clavier",
    "maqam.ascendingDescending": "Asc > Desc",
    "maqam.ascending": "Ascendant",
    "maqam.descending": "Descendant",
    "maqam.export": "Exporter",
    "maqam.copyTable": "Copier le tableau",
    "maqam.showDetails": "Afficher les détails",
    "maqam.hideDetails": "Masquer les détails",
    "maqam.scaleDegrees": "Degré de maqām",
    "maqam.noteNames": "Noms des notes",
    "maqam.pitchClass": "Classe de hauteur",
    "maqam.abjadName": "Nom abjad",
    "maqam.englishName": "Nom anglais",
    "maqam.solfege": "Solfège",
    "maqam.fraction": "Fraction",
    "maqam.cents": "Cents",
    "maqam.centsFromZero": "Cents depuis 0",
    "maqam.centsDeviation": "Déviation 12-EDO",
    "maqam.decimalRatio": "Rapport décimal",
    "maqam.stringLength": "Longueur de corde",
    "maqam.fretDivision": "Division de frette",
    "maqam.midiNote": "Note MIDI décimale",
    "maqam.midiNoteDeviation": "MIDI et déviation",
    "maqam.frequency": "Fréq. (Hz)",
    "maqam.play": "Jouer",
    "maqam.ajnas": "Ajnās",
    "maqam.staffNotation": "Notation sur portée",
    "maqam.comments": "Commentaires",
    "maqam.sources": "Sources",
    "maqam.transpositionsTitle": "Taṣāwīr (transpositions)",
    "maqam.all": "Tous les maqāmāt",
    "maqam.groupByJins": "Grouper par jins",
    "maqam.groupByStartingNote": "Grouper par note de départ",
    "maqam.noJins": "sans jins",

    // Tuning System Manager
    "tuningSystem.all": "Tous les systèmes d'accord",
    "tuningSystem.8th10thCentury": "8e–10e s. EC",
    "tuningSystem.11th15thCentury": "11e–15e s. EC",
    "tuningSystem.16th19thCentury": "16e–19e s. EC",
    "tuningSystem.20th21stCentury": "20e–21e s. EC",
    "tuningSystem.selectOrCreate": "Sélectionner un système d'accord ou en créer un nouveau :",
    "tuningSystem.createNew": "-- Créer un nouveau système --",
    "tuningSystem.none": "-- Aucun --",
    "tuningSystem.sortBy": "Trier par :",
    "tuningSystem.id": "ID",
    "tuningSystem.creator": "Créateur (anglais)",
    "tuningSystem.year": "Année",
    "tuningSystem.titleEnglish": "Titre (anglais)",
    "tuningSystem.titleArabic": "Titre (arabe)",
    "tuningSystem.creatorEnglish": "Créateur (anglais)",
    "tuningSystem.creatorArabic": "Créateur (arabe)",
    "tuningSystem.commentsEnglish": "Commentaires (anglais)",
    "tuningSystem.commentsArabic": "Commentaires (arabe)",
    "tuningSystem.addSource": "Ajouter une source",
    "tuningSystem.selectSource": "Sélectionner une source",
    "tuningSystem.page": "Page",
    "tuningSystem.delete": "Supprimer",
    "tuningSystem.pitchClasses": "Classes de hauteur (une par ligne)",
    "tuningSystem.stringLength": "Longueur de corde",
    "tuningSystem.defaultReferenceFrequency": "Fréquence de référence par défaut",
    "tuningSystem.save": "Enregistrer les modifications du système d'accord",
    "tuningSystem.create": "Créer un nouveau système d'accord",
    "tuningSystem.deleteTuningSystem": "Supprimer le système d'accord",
    "tuningSystem.startingNoteName": "Nom de la note de départ :",
    "tuningSystem.frequency": "Fréquence (Hz) :",
    "tuningSystem.saveNoteConfiguration": "Enregistrer la configuration des noms de notes",
    "tuningSystem.deleteNoteConfiguration": "Supprimer la configuration des noms de notes",
    "tuningSystem.export": "Exporter :",
    "tuningSystem.comments": "Commentaires :",
    "tuningSystem.sources": "Sources :",
    "tuningSystem.noSystemsAvailable": "Aucun système d'accord disponible.",
    "tuningSystem.unsaved": "non enregistré",

    // Tuning System Octave Tables
    "octave.title": "Dīwān (octave)",
    "octave.cascadeEnabled": "Cascade activée",
    "octave.cascadeDisabled": "Cascade désactivée",
    "octave.pitchClass": "Classe de hauteur",
    "octave.noteNames": "Nom de note",
    "octave.abjadName": "Nom abjad",
    "octave.englishName": "Nom anglais",
    "octave.solfege": "Solfège",
    "octave.fractionRatio": "Rapport de fraction",
    "octave.cents": "Cents",
    "octave.centsDeviation": "Déviation 12-EDO",
    "octave.decimalRatio": "Rapport décimal",
    "octave.stringLength": "Longueur de corde",
    "octave.fretDivision": "Division de frette",
    "octave.midiNote": "Note MIDI décimale",
    "octave.midiNoteDeviation": "MIDI et déviation",
    "octave.frequency": "Fréq. (Hz)",
    "octave.play": "Jouer",
    "octave.select": "Sélectionner",
    "octave.staffNotation": "Notation sur portée",
    "octave.copyTable": "Copier le tableau",
    "octave.none": "(aucun)",

    // Selected Pitch Classes Transpositions
    "analysis.title": "Taḥlīl (analyse)",
    "analysis.selectedPitchClasses": "Classes de hauteur sélectionnées",
    "analysis.centsTolerance": "Tolérance en cents",
    "analysis.playSelectedPitchClasses": "Jouer les sélections",
    "analysis.copyTable": "Copier le tableau",
    "analysis.copyTableToClipboard": "Copier le tableau dans le presse-papiers",
    "analysis.tableCopied": "Tableau copié dans le presse-papiers !",
    "analysis.copyFailed": "Échec de la copie du tableau.",
    "analysis.noteNames": "Noms des notes",
    "analysis.pitchClass": "Classe de hauteur",
    "analysis.abjadName": "Nom abjad",
    "analysis.englishName": "Nom anglais",
    "analysis.solfege": "Solfège",
    "analysis.fraction": "fraction",
    "analysis.cents": "Cents",
    "analysis.centsFromZero": "Cents depuis 0",
    "analysis.centsDeviation": "Déviation 12-EDO",
    "analysis.decimalRatio": "Rapport décimal",
    "analysis.stringLength": "Longueur de corde",
    "analysis.fretDivision": "Division de frette",
    "analysis.midiNote": "Note MIDI décimale",
    "analysis.midiNoteDeviation": "MIDI et déviation",
    "analysis.frequency": "Fréq. (Hz)",
    "analysis.staffNotation": "Notation sur portée",
    "analysis.play": "Jouer",

    // Modulations
    "modulations.expand": "Développer",
    "modulations.collapse": "Réduire",
    "modulations.ajnasModulations": "modulations des ajnās",
    "modulations.maqamatModulations": "modulations des maqāmāt",
    "modulations.deleteHop": "Supprimer le saut",
    "modulations.tonic": "Tonique",
    "modulations.third": "Tierce",
    "modulations.thirdAlternative": "Tierce (alternative)",
    "modulations.fourth": "Quarte",
    "modulations.fifth": "Quinte",
    "modulations.sixthIfNoThird": "Sixte (s'il n'y a pas de tierce)",
    "modulations.sixthAscending": "Sixte (ascendante)",
    "modulations.sixthDescending": "Sixte (descendante)",
    "modulations.octaveShift": "Décalage d'octave (-1)",

    // Sayr Manager
    "sayr.selectOrCreate": "Sélectionner un sayr ou en créer un nouveau :",
    "sayr.newSayr": "-- Nouveau sayr --",
    "sayr.noSuyurAvailable": "Aucun suyūr disponible.",
    "sayr.noSource": "Aucune source",
    "sayr.source": "Source",
    "sayr.selectSource": "Sélectionner une source",
    "sayr.page": "Page",
    "sayr.commentsEnglish": "Commentaires (anglais)",
    "sayr.commentsArabic": "Commentaires (arabe)",
    "sayr.commentsOnSayr": "Commentaires sur le sayr de",
    "sayr.stops": "Arrêts",
    "sayr.addStop": "+ Ajouter un arrêt",
    "sayr.note": "note",
    "sayr.jins": "jins",
    "sayr.maqam": "maqām",
    "sayr.direction": "direction",
    "sayr.none": "(aucun)",
    "sayr.noDirection": "(pas de direction)",
    "sayr.ascending": "ascendant",
    "sayr.descending": "descendant",
    "sayr.ascend": "monter",
    "sayr.descend": "descendre",
    "sayr.ascendTo": "monter vers",
    "sayr.descendTo": "descendre vers",
    "sayr.delete": "Supprimer",
    "sayr.updateSayr": "Mettre à jour le sayr",
    "sayr.saveSayr": "Enregistrer le sayr",
    "sayr.deleteSayr": "Supprimer le sayr",
    "sayr.definiteArticle": " al-",
    "sayr.transpositionWarning":
      "Certaines notes de ce sayr n'ont pas pu être transposées en raison des limitations du système d'accord.",
  },
};

/**
 * Provider component that wraps the app and provides language context to all child components
 * Manages language state, localStorage persistence, and document direction
 */
export function LanguageContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  /**
   * Load saved language from localStorage on component mount
   */
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "maqam-network-language"
    ) as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar" || savedLanguage === "fr")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  /**
   * Sets the language and persists it to localStorage
   * Also updates document direction and language attributes
   */
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("maqam-network-language", newLanguage);

    // Update document direction
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLanguage === "ar" ? "ar" : newLanguage === "fr" ? "fr" : "en";

    // Force a re-render by adding a class to trigger CSS changes
    document.body.className = document.body.className.replace(
      /\b(ltr|rtl)\b/g,
      ""
    );
    document.body.classList.add(newLanguage === "ar" ? "rtl" : "ltr");
  };

  /**
   * Set initial document direction and language on component mount
   */
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language === "ar" ? "ar" : language === "fr" ? "fr" : "en";

    // Also set body class for additional CSS targeting
    document.body.className = document.body.className.replace(
      /\b(ltr|rtl)\b/g,
      ""
    );
    document.body.classList.add(language === "ar" ? "rtl" : "ltr");
  }, [language]);

  const isRTL = language === "ar";

  /**
   * Translation function that returns localized string for a given key
   */
  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  /**
   * Gets the appropriate display name based on current language
   * For Arabic, uses dynamic Arabic name conversion; for English, returns transliterated name
   */
  const getDisplayName = (
    name: string,
    type: "note" | "jins" | "maqam"
  ): string => {
    if (language === "ar") {
      return getDynamicArabicName(name, type);
    }
    return name; // Return transliterated name for English
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isRTL,
        t,
        getDisplayName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Custom hook to access the language context
 * Must be used within a LanguageContextProvider
 */
export default function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      "useLanguageContext must be used within a LanguageContextProvider"
    );
  }
  return context;
}
