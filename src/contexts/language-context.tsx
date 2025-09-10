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
export type Language = "en" | "ar";

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
 * Translation dictionaries for English and Arabic
 */
const translations = {
  en: {
    // Navigation Menu
    "nav.home": "Home",
    "nav.tools": "Tools",
    "nav.bibliography": "Bibliography",
    "nav.analytics": "Analytics",
    "nav.userGuide": "User Guide",
    "nav.about": "About",
    "nav.credits": "Credits",

    // Navbar Tabs
    "tabs.tuningSystem": "Tanāghīm (tuning systems)",
    "tabs.ajnas": "Ajnās",
    "tabs.maqamat": "Maqamāt",
    "tabs.suyur": "Suyūr",
    "tabs.intiqalat": "Intiqālāt",

    // Admin Tabs
    "tabs.tuningSystemAdmin": "Tuning System Admin",
    "tabs.jinsAdmin": "Jins Admin",
    "tabs.maqamAdmin": "Maqam Admin",
    "tabs.sayrAdmin": "Sayr Admin",
    "tabs.patternsAdmin": "Patterns Admin",

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

    // Language selector
    "language.english": "English",
    "language.arabic": "العربية",

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
    "jins.darajatAlIstiqrar": "Darajat al-Istiqrār Al-Taqlīdīya (conventional tonic/finalis)",
    "jins.selectLoadToKeyboard": "Select & Load to Keyboard",
    "jins.playJins": "Play jins",
    "jins.export": "Export",
    "jins.showDetails": "Show Details",
    "jins.hideDetails": "Hide Details",
    "jins.noteNames": "Note Names",
    "jins.abjadName": "Abjad Name",
    "jins.englishName": "English Name",
    "jins.fraction": "Fraction",
    "jins.cents": "Cents",
    "jins.centsFromZero": "Cents from 0",
    "jins.centsDeviation": "+/- 12-EDO",
    "jins.decimalRatio": "Decimal Ratio",
    "jins.stringLength": "String Length",
    "jins.fretDivision": "Fret Division",
    "jins.midiNote": "MIDI Note",
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
    "valueType.decimalRatio": "Decimal Ratio",
    "valueType.stringLength": "String Length",
    "valueType.fretDivision": "Fret Division",

    // Filter labels
    "filter.pitchClass": "Pitch Class",
    "filter.abjadName": "Abjad Name",
    "filter.englishName": "English Name",
    "filter.fraction": "Fraction",
    "filter.cents": "Cents",
    "filter.centsFromZero": "Cents from 0",
    "filter.decimalRatio": "Decimal Ratio",
    "filter.stringLength": "String Length",
    "filter.fretDivision": "Fret Division",
    "filter.midiNote": "MIDI Note",
    "filter.frequency": "Frequency",
    "filter.staffNotation": "Staff Notation",
    "filter.centsDeviation": "Cents Deviation",

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
    "maqam.darajatAlIstiqrar": "Darajat al-Istiqrār Al-Taqlīdīya (conventional tonic/finalis)",
    "maqam.selectLoadToKeyboard": "Select & Load to Keyboard",
    "maqam.ascendingDescending": "Asc > Desc",
    "maqam.ascending": "Ascending",
    "maqam.descending": "Descending",
    "maqam.export": "Export",
    "maqam.showDetails": "Show Details",
    "maqam.hideDetails": "Hide Details",
    "maqam.scaleDegrees": "Scale Degrees",
    "maqam.noteNames": "Note Names",
    "maqam.abjadName": "Abjad Name",
    "maqam.englishName": "English Name",
    "maqam.fraction": "Fraction",
    "maqam.cents": "Cents",
    "maqam.centsFromZero": "Cents from 0",
    "maqam.centsDeviation": "+/- 12-EDO",
    "maqam.decimalRatio": "Decimal Ratio",
    "maqam.stringLength": "String Length",
    "maqam.fretDivision": "Fret Division",
    "maqam.midiNote": "MIDI Note",
    "maqam.frequency": "Freq (Hz)",
    "maqam.play": "Play",
    "maqam.ajnas": "Ajnas",
    "maqam.staffNotation": "Staff Notation",
    "maqam.comments": "Comments",
    "maqam.sources": "Sources",
    "maqam.transpositionsTitle": "Taṣāwīr (transpositions)",
    "maqam.all": "All Maqamat",

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
    "octave.abjadName": "Abjad Name",
    "octave.englishName": "English Name",
    "octave.fractionRatio": "Fraction Ratio",
    "octave.cents": "Cents",
    "octave.centsDeviation": "+/- 12-EDO",
    "octave.decimalRatio": "Decimal Ratio",
    "octave.stringLength": "String Length",
    "octave.fretDivision": "Fret Division",
    "octave.midiNote": "Midi Note",
    "octave.frequency": "Freq (Hz)",
    "octave.play": "Play",
    "octave.select": "Select",
    "octave.none": "(none)",

    // Selected Pitch Classes Transpositions
    "analysis.title": "Taḥlīl (analysis)",
    "analysis.centsTolerance": "Cents Tolerance",
    "analysis.playSelectedPitchClasses": "Play Selections",
    "analysis.noteNames": "Note Names",
    "analysis.abjadName": "Abjad Name",
    "analysis.englishName": "English Name",
    "analysis.fraction": "fraction",
    "analysis.cents": "Cents",
    "analysis.centsFromZero": "Cents from 0",
    "analysis.centsDeviation": "+/- 12-EDO",
    "analysis.decimalRatio": "Decimal Ratio",
    "analysis.stringLength": "String Length",
    "analysis.fretDivision": "Fret Division",
    "analysis.midiNote": "MIDI Note",
    "analysis.frequency": "Freq (Hz)",
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
    "nav.analytics": "التحليلات",
    "nav.userGuide": "دليل المستخدم",
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

    // Language selector
    "language.english": "English",
    "language.arabic": "العربية",

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
    "jins.showDetails": "إظهار التفاصيل",
    "jins.hideDetails": "إخفاء التفاصيل",
    "jins.noteNames": "أسماء النغمات",
    "jins.abjadName": "الإسم الأبجدي",
    "jins.englishName": "الإسم الإنجليزي",
    "jins.fraction": "النسبة",
    "jins.cents": "سنت",
    "jins.centsFromZero": "سنت من الصفر",
    "jins.centsDeviation": "الإنحراف",
    "jins.decimalRatio": "النسبة عشرية",
    "jins.stringLength": "طول الوتر",
    "jins.fretDivision": "تقسيم الوتر",
    "jins.midiNote": "نوطة ميدي",
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
    "valueType.decimalRatio": "النسبة عشرية",
    "valueType.stringLength": "طول الوتر",
    "valueType.fretDivision": "تقسيم الوتر",

    // Filter labels (Arabic)
    "filter.pitchClass": "فئة النغمة",
    "filter.abjadName": "الإسم الأبجدي",
    "filter.englishName": "الإسم الإنجليزي",
    "filter.fraction": "النسبة",
    "filter.cents": "سنت",
    "filter.centsFromZero": "سنت من الصفر",
    "filter.decimalRatio": "النسبة عشرية",
    "filter.stringLength": "طول الوتر",
    "filter.fretDivision": "تقسيم الوتر",
    "filter.midiNote": "نوطة ميدي",
    "filter.frequency": "التردد",
    "filter.staffNotation": "تدوين",
    "filter.centsDeviation": "انحراف السنت",

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
    "maqam.showDetails": "إظهار التفاصيل",
    "maqam.hideDetails": "إخفاء التفاصيل",
    "maqam.scaleDegrees": "درجات المقام",
    "maqam.noteNames": "أسماء النغمات",
    "maqam.abjadName": "الإسم الأبجدي",
    "maqam.englishName": "الإسم الإنجليزي",
    "maqam.fraction": "النسبة",
    "maqam.cents": "سنت",
    "maqam.centsFromZero": "سنت من الصفر",
    "maqam.centsDeviation": "الإنحراف",
    "maqam.decimalRatio": "النسبة عشرية",
    "maqam.stringLength": "طول الوتر",
    "maqam.fretDivision": "تقسيم الوتر",
    "maqam.midiNote": "نوطة ميدي",
    "maqam.frequency": "التردد",
    "maqam.play": "استماع",
    "maqam.ajnas": "أجناس",
    "maqam.staffNotation": "تدوين",
    "maqam.comments": "تعليقات",
    "maqam.sources": "مصادر",
    "maqam.transpositionsTitle": "تصوير",
    "maqam.all": "جميع المقامات",

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
    "tuningSystem.startingNoteName": "اسم النغمة البدائية:",
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
    "octave.abjadName": "الإسم الأبجدي",
    "octave.englishName": "الإسم الإنجليزي",
    "octave.fractionRatio": "النسبة",
    "octave.cents": "سنت",
    "octave.centsDeviation": "الإنحراف",
    "octave.decimalRatio": "النسبة عشرية",
    "octave.stringLength": "طول الوتر",
    "octave.fretDivision": "تقسيم الوتر",
    "octave.midiNote": "نوطة ميدي",
    "octave.frequency": "التردد",
    "octave.play": "استماع",
    "octave.select": "اختيار",
    "octave.none": "(لا شيء)",

    // Selected Pitch Classes Transpositions (Arabic translations)
    "analysis.title": "تحليل",
    "analysis.centsTolerance": "تساهل السنت",
    "analysis.playSelectedPitchClasses": "استمعوا للنغمات المختارة",
    "analysis.noteNames": "أسماء النغمات",
    "analysis.abjadName": "الإسم الأبجدي",
    "analysis.englishName": "الإسم الإنجليزي",
    "analysis.fraction": "النسبة",
    "analysis.cents": "سنت",
    "analysis.centsFromZero": "سنت من الصفر",
    "analysis.centsDeviation": "الإنحراف",
    "analysis.decimalRatio": "النسبة عشرية",
    "analysis.stringLength": "طول الوتر",
    "analysis.fretDivision": "تقسيم الوتر",
    "analysis.midiNote": "نوطة ميدي",
    "analysis.frequency": "التردد (هرتز)",
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
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
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
    document.documentElement.lang = newLanguage === "ar" ? "ar" : "en";

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
    document.documentElement.lang = language === "ar" ? "ar" : "en";

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
