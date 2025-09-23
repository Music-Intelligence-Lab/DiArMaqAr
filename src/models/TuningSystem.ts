import { englishify } from "@/functions/export";
import NoteName, { shiftNoteName } from "./NoteName";
import { SourcePageReference } from "./bibliography/Source";

/**
 * Represents a tuning system used in Arabic maqam music theory.
 * 
 * A tuning system is a comprehensive framework that defines the available pitch relationships
 * within an octave and their cultural context. Following historical precedents like Al-Kindī's
 * 12-tone system from 874 CE, each tuning system contains:
 * 
 * 1. **Pitch Classes**: Mathematical intervals defining available pitches (ratios or cents)
 * 2. **Note Names**: Cultural vocabulary for identifying each pitch (rāst, dūgāh, segāh, etc.)
 * 3. **Reference Frequency**: Converts mathematical ratios into actual frequencies for synthesis
 * 
 * The system supports multiple octaves (below and above the primary octave) which is crucial
 * for jins and maqam analysis. Since each pitch class has both relational and absolute values,
 * all other representations can be derived through conversion formulas.
 */
export default class TuningSystem {
  /** Unique identifier generated from creator, year, and title */
  private id: string;
  
  /** English title of the tuning system */
  private titleEnglish: string;
  
  /** Arabic title of the tuning system */
  private titleArabic: string;
  
  /** Year the tuning system was documented or created */
  private year: string;
  
  /** English name of the source document/publication */
  private sourceEnglish: string;
  
  /** Arabic name of the source document/publication */
  private sourceArabic: string;
  
  /** Page references within the source document */
  private sourcePageReferences: SourcePageReference[];
  
  /** English name of the tuning system's creator/theorist */
  private creatorEnglish: string;
  
  /** Arabic name of the tuning system's creator/theorist */
  private creatorArabic: string;
  
  /** Additional English comments or descriptions */
  private commentsEnglish: string;
  
  /** Additional Arabic comments or descriptions */
  private commentsArabic: string;
  
  /** 
   * Original pitch class values as originally inputted.
   * These are NOT PitchClass objects but raw string values representing
   * the mathematical intervals (e.g., "9/8", "1.125", "204.0" cents).
   * These preserve the original format as entered, allowing for fractional
   * ratios, decimal ratios, or cent values to be stored in their native form.
   */
  private originalPitchClassValues: string[];
  
  /** 
   * Sets of note names corresponding to each pitch class.
   * Multiple sets allow for different starting note name configurations.
   */
  private noteNameSets: NoteName[][];
  
  /** 
   * Default reference frequency in Hz (e.g., 440 for A4, 220 for ʿushayrān).
   * This converts mathematical ratios into actual audible frequencies.
   */
  private defaultReferenceFrequency: number;
  
  /** 
   * Mapping of specific starting note names to their reference frequencies.
   * Allows different notes to serve as frequency anchors within the system.
   */
  private referenceFrequencies: { [noteName: string]: number };
  
  /** Traditional abjad (Arabic alphabetical) names for the pitch classes */
  private abjadNames: string[];
  
  /** String length parameter for instruments (if applicable) */
  private stringLength: number;
  
  /** Whether this tuning system has been saved to persistent storage */
  private saved: boolean;

  /**
   * Creates a new TuningSystem instance.
   * 
   * @param titleEnglish - English title of the tuning system
   * @param titleArabic - Arabic title of the tuning system
   * @param year - Year the system was documented or created
   * @param sourceEnglish - English name of the source document
   * @param sourceArabic - Arabic name of the source document
   * @param SourcePageReferences - Array of page references within the source
   * @param creatorEnglish - English name of the creator/theorist
   * @param creatorArabic - Arabic name of the creator/theorist
   * @param commentsEnglish - Additional English comments
   * @param commentsArabic - Additional Arabic comments
   * @param originalPitchClassValues - Raw input values (ratios, decimals, or cents as strings)
   * @param noteNameSets - Arrays of note names corresponding to pitch classes
   * @param abjadNames - Traditional Arabic alphabetical names
   * @param stringLength - String length parameter for instruments
   * @param referenceFrequencies - Mapping of note names to reference frequencies
   * @param defaultReferenceFrequency - Default frequency anchor (e.g., 440 Hz)
   * @param saved - Whether the system has been saved to storage
   */
  constructor(
    titleEnglish: string,
    titleArabic: string,
    year: string,
    sourceEnglish: string,
    sourceArabic: string,
    SourcePageReferences: SourcePageReference[],
    creatorEnglish: string,
    creatorArabic: string,
    commentsEnglish: string,
    commentsArabic: string,
    originalPitchClassValues: string[],
    noteNameSets: NoteName[][],
    abjadNames: string[],
    stringLength: number,
    referenceFrequencies: { [noteName: string]: number },
    defaultReferenceFrequency: number,
    saved: boolean
  ) {
    // Generate unique ID by combining creator, year, and title (sanitized)
    this.id = englishify(`${creatorEnglish}-(${year})`.replaceAll(" ", "").replaceAll("+", ""));
    this.titleEnglish = titleEnglish;
    this.titleArabic = titleArabic;
    this.year = year;
    this.sourceEnglish = sourceEnglish;
    this.sourceArabic = sourceArabic;
    this.sourcePageReferences = SourcePageReferences;
    this.creatorEnglish = creatorEnglish;
    this.creatorArabic = creatorArabic;
    this.commentsEnglish = commentsEnglish;
    this.commentsArabic = commentsArabic;
    this.originalPitchClassValues = originalPitchClassValues;
    this.noteNameSets = noteNameSets;
    this.abjadNames = abjadNames;
    this.stringLength = stringLength;
    this.referenceFrequencies = referenceFrequencies;
    this.defaultReferenceFrequency = defaultReferenceFrequency;
    this.saved = saved;
  }

  /**
   * Gets the unique identifier for this tuning system.
   * 
   * @returns Unique ID string generated from creator, year, and title
   */
  getId(): string {
    return this.id;
  }

  /**
   * Gets the English title of the tuning system.
   * 
   * @returns English title
   */
  getTitleEnglish(): string {
    return this.titleEnglish;
  }

  /**
   * Gets the Arabic title of the tuning system.
   * 
   * @returns Arabic title
   */
  getTitleArabic(): string {
    return this.titleArabic;
  }

  /**
   * Gets the year the tuning system was documented or created.
   * 
   * @returns Year as string
   */
  getYear(): string {
    return this.year;
  }

  /**
   * Gets the English name of the source document.
   * 
   * @returns English source name
   */
  getSourceEnglish(): string {
    return this.sourceEnglish;
  }

  /**
   * Gets the Arabic name of the source document.
   * 
   * @returns Arabic source name
   */
  getSourceArabic(): string {
    return this.sourceArabic;
  }

  /**
   * Gets the page references within the source document.
   * 
   * @returns Array of page references
   */
  getSourcePageReferences(): SourcePageReference[] {
    return this.sourcePageReferences;
  }

  /**
   * Gets the English name of the tuning system's creator.
   * 
   * @returns Creator's English name
   */
  getCreatorEnglish(): string {
    return this.creatorEnglish;
  }

  /**
   * Gets the Arabic name of the tuning system's creator.
   * 
   * @returns Creator's Arabic name
   */
  getCreatorArabic(): string {
    return this.creatorArabic;
  }

  /**
   * Gets additional English comments about the tuning system.
   * 
   * @returns English comments
   */
  getCommentsEnglish(): string {
    return this.commentsEnglish;
  }

  /**
   * Gets additional Arabic comments about the tuning system.
   * 
   * @returns Arabic comments
   */
  getCommentsArabic(): string {
    return this.commentsArabic;
  }

  /**
   * Gets the original pitch class values as inputted by the user.
   * 
   * These are raw string values representing mathematical intervals in their
   * original format (e.g., "9/8" for fractional ratios, "1.125" for decimals,
   * or "204.0" for cents). They are NOT PitchClass objects but preserve the
   * exact format as entered, allowing the system to maintain mathematical
   * precision and cultural authenticity of historical tuning descriptions.
   * 
   * @returns Array of original pitch class values as strings
   */
  getOriginalPitchClassValues(): string[] {
    return this.originalPitchClassValues;
  }

  /**
   * Gets the sets of note names.
   * 
   * @returns Array of note name sets
   */
  getNoteNameSets(): NoteName[][] {
    return this.noteNameSets;
  }

  /**
   * Gets the traditional abjad (Arabic alphabetical) names for pitch classes.
   * 
   * @returns Array of abjad names
   */
  getAbjadNames(): string[] {
    return this.abjadNames;
  }

  /**
   * Gets the string length parameter for instruments (if applicable).
   * 
   * @returns String length value
   */
  getStringLength(): number {
    return this.stringLength;
  }

  /**
   * Gets the mapping of note names to their reference frequencies.
   * 
   * This allows different notes within the system to serve as frequency
   * anchors for tuning and synthesis purposes.
   * 
   * @returns Object mapping note names to frequencies in Hz
   */
  getReferenceFrequencies(): { [noteName: string]: number } {
    return this.referenceFrequencies;
  }

  /**
   * Gets the default reference frequency for the tuning system.
   * 
   * This is the primary frequency anchor (e.g., 440 Hz for A4 in Western music,
   * or 220 Hz for ʿushayrān in Al-Kindī's system) used to convert mathematical
   * ratios into actual audible frequencies.
   * 
   * @returns Default reference frequency in Hz
   */
  getDefaultReferenceFrequency(): number {
    return this.defaultReferenceFrequency;
  }

  /**
   * Checks whether this tuning system has been saved to persistent storage.
   * 
   * @returns True if saved, false otherwise
   */
  isSaved(): boolean {
    return this.saved;
  }

  /**
   * Creates a string representation of the tuning system for display purposes.
   * 
   * Format: "Creator (Year) Title" (e.g., "Al-Kindī (874) 12-tone System")
   * 
   * @returns Formatted string representation
   */
  stringify(): string {
    return `${this.getCreatorEnglish()} (${this.getYear() ? this.getYear() : "NA"}) ${this.getTitleEnglish()}`;
  }

  /**
   * Gets note name sets expanded to include octaves above and below.
   * 
   * This method is crucial for jins and maqam analysis as it provides access
   * to pitch classes in multiple octaves. Each note name set is expanded to
   * include the octave below (-1) and the octave above (+1) the primary octave,
   * giving analysts access to a three-octave range for comprehensive modal analysis.
   * 
   * @returns Expanded note name sets with three octaves of coverage
   */
  getNoteNameSetsShiftedUpAndDown(): NoteName[][] {
    const usedNoteNames: NoteName[][] = [];
    for (const set of this.noteNameSets) {
      usedNoteNames.push([...set.map((noteName) => shiftNoteName(noteName, -1)), ...set, ...set.map((noteName) => shiftNoteName(noteName, 1))] as NoteName[]);
    }
    return usedNoteNames as NoteName[][];
  }

  /**
   * Creates a copy of this tuning system with new note name sets.
   * 
   * @param newNoteNames - New note name sets to use in the copy
   * @returns New TuningSystem instance with updated note names
   */
  copyWithNewNoteNameSets(newNoteNames: NoteName[][]): TuningSystem {
    return new TuningSystem(
      this.titleEnglish,
      this.titleArabic,
      this.year,
      this.sourceEnglish,
      this.sourceArabic,
      this.sourcePageReferences,
      this.creatorEnglish,
      this.creatorArabic,
      this.commentsEnglish,
      this.commentsArabic,
      this.originalPitchClassValues,
      newNoteNames,
      this.abjadNames,
      this.stringLength,
      this.referenceFrequencies,
      this.defaultReferenceFrequency,
      this.saved
    );
  }

  /**
   * Creates a blank/default tuning system for initialization purposes.
   * 
   * This factory method creates an empty tuning system with placeholder values
   * in both English and Arabic. Useful for initializing the interface before
   * users input their own tuning system data or when creating templates for
   * new systems.
   * 
   * @returns A new TuningSystem instance with default placeholder values
   */
  static createBlankTuningSystem(): TuningSystem {
    return new TuningSystem(
      "Untitled",
      "غير مسمى",
      "",
      "Unknown Source",
      "مصدر غير معروف",
      [],
      "Unknown Creator",
      "مؤلف غير معروف",
      "",
      "",
      [],
      [],
      [],
      0,
      {},
      440,
      false
    );
  }
}
