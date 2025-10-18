import { SourcePageReference } from "./bibliography/Source";
import PitchClass, { PitchClassInterval } from "./PitchClass";
import NoteName from "./NoteName";
import { getPitchClassIntervals } from "@/functions/getPitchClassIntervals";
import { standardizeText } from "@/functions/export";
import shiftPitchClassByOctave from "@/functions/shiftPitchClassByOctave";

/**
 * Interface for serializing JinsData to JSON format.
 * Used for data persistence and API communication.
 */
export interface JinsDataInterface {
  id: string;
  idName: string;
  name: string;
  noteNames: NoteName[];
  commentsEnglish: string;
  commentsArabic: string;
  SourcePageReferences: SourcePageReference[];
  numberOfTranspositions?: number;
  version?: string;
}

/**
 * Represents the raw, tuning-system-independent definition of a jins.
 * 
 * A jins is a melodic fragment typically consisting of three to five pitch classes
 * that serves as a fundamental building block for constructing maqāmāt. JinsData
 * contains only the abstract note names (dūgāh, kurdī, chahārgāh, etc.) without
 * any connection to specific pitch classes or tuning systems.
 * 
 * This class represents the "template" or "blueprint" of a jins as it would appear
 * in theoretical texts or JSON data files. To create an actual playable jins with
 * specific pitches, this data must be combined with a tuning system through the
 * getTahlil() method to produce a Jins interface instance.
 * 
 * **Key Distinction**: JinsData contains only note names (cultural/theoretical
 * identifiers), while the Jins interface contains actual pitch classes with
 * frequencies and intervallic relationships within a specific tuning system.
 */
export default class JinsData {
  /** Unique identifier for this jins */
  private id: string;

  /** Unique identifier for this jins */
  private idName: string;
  /** Name of the jins (e.g., "Jins Kurd", "Jins Hijaz") */
  private name: string;

  /**
   * Array of note names that define this jins.
   * These are cultural/theoretical identifiers (dūgāh, kurdī, etc.)
   * without any connection to specific frequencies or tuning systems.
   */
  private noteNames: NoteName[];

  /** English-language comments or description */
  private commentsEnglish: string;

  /** Arabic-language comments or description */
  private commentsArabic: string;

  /** References to source documents where this jins is documented */
  private SourcePageReferences: SourcePageReference[];

  /** ISO 8601 timestamp of last modification */
  private version!: string;

  /**
   * Creates a new JinsData instance with abstract note names.
   *
   * @param id - Unique identifier for this jins
   * @param name - Name of the jins (e.g., "Jins Kurd")
   * @param noteNames - Array of note name strings (not yet typed as NoteName)
   * @param commentsEnglish - English description or comments
   * @param commentsArabic - Arabic description or comments
   * @param SourcePageReferences - References to source documents
   * @param version - ISO 8601 timestamp of last modification (defaults to current time)
   */
  constructor(
    id: string,
    name: string,
    noteNames: string[],
    commentsEnglish: string,
    commentsArabic: string,
    SourcePageReferences: SourcePageReference[],
    version?: string
  ) {
    this.id = id;
    this.idName = standardizeText(name);
    this.name = name;
    this.noteNames = noteNames;
    this.commentsEnglish = commentsEnglish;
    this.commentsArabic = commentsArabic;
    this.SourcePageReferences = SourcePageReferences;
    this.version = version || new Date().toISOString();
  }

  /**
   * Gets the unique identifier of this jins.
   * 
   * @returns The jins ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Gets the standardized ID name of this jins.
   * 
   * @returns The jins ID name
   */
  getIdName(): string {
    return this.idName;
  }

  /**
   * Gets the name of this jins.
   * 
   * @returns The jins name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets the array of note names that define this jins.
   * 
   * These are abstract cultural identifiers without connection to specific
   * pitch frequencies. To get actual playable pitches, use getTahlil() with
   * a specific tuning system.
   * 
   * @returns Array of note names
   */
  getNoteNames(): NoteName[] {
    return this.noteNames;
  }

  /**
   * Gets the English-language comments for this jins.
   * 
   * @returns English comments
   */
  getCommentsEnglish(): string {
    return this.commentsEnglish;
  }

  /**
   * Gets the Arabic-language comments for this jins.
   * 
   * @returns Arabic comments
   */
  getCommentsArabic(): string {
    return this.commentsArabic;
  }

  /**
   * Gets the source page references for this jins.
   *
   * @returns Array of source page references
   */
  getSourcePageReferences(): SourcePageReference[] {
    return this.SourcePageReferences;
  }

  /**
   * Gets the version timestamp of this jins.
   *
   * @returns ISO 8601 timestamp string
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Sets the version timestamp of this jins.
   *
   * @param version - ISO 8601 timestamp string
   */
  setVersion(version: string): void {
    this.version = version;
  }

  /**
   * Checks if this jins can be constructed within a given tuning system.
   * 
   * A jins is only selectable/constructible if ALL of its required note names
   * exist within the tuning system's available pitch classes. The platform
   * searches across all four octaves when determining compatibility.
   * 
   * For example, in Al-Kindī's tuning system:
   * - Jins Kurd (dūgāh, kurdī, chahārgāh, nawā) ✓ CAN be constructed
   * - Jins Chahārgāh (chahārgāh, nawā, nīm ḥusaynī, ʿajam) ✗ CANNOT because
   *   Al-Kindī's system lacks "nīm ḥusaynī"
   * 
   * @param allNoteNames - All note names available in the tuning system
   * @returns True if all required note names are available, false otherwise
   */
  isJinsPossible(allNoteNames: NoteName[]): boolean {
    return this.noteNames.every((noteName) => allNoteNames.some((allNoteName) => allNoteName === noteName));
  }

  /**
   * Creates a copy of this jins with new source page references.
   *
   * @param newSourcePageReferences - New source page references to use
   * @returns New JinsData instance with updated references
   */
  createJinsWithNewSourcePageReferences(newSourcePageReferences: SourcePageReference[]): JinsData {
    return new JinsData(this.id, this.name, this.noteNames, this.commentsEnglish, this.commentsArabic, newSourcePageReferences, this.version);
  }

  /**
   * Converts this abstract jins into a concrete, playable tahlil (original form).
   * 
   * This is the crucial method that bridges the gap between abstract note names
   * and actual musical pitch classes. It takes the jins's note names and matches them
   * with corresponding pitch classes from a specific tuning system, creating
   * a Jins interface instance with:
   * 
   * - Actual frequency values
   * - Intervallic relationships between pitches
   * - Playable musical content
   * 
   * The resulting Jins represents the "tahlil" (original/root form) of the jins,
   * as opposed to "taswir" (transpositions) which would start from different
   * pitch classes but maintain the same intervallic patterns.
   * 
   * @param allPitchClasses - All pitch classes available in the tuning system
   * @returns Jins interface instance with concrete pitches and intervals
   */
  getTahlil(allPitchClasses: PitchClass[]): Jins {
      const pitchClasses = allPitchClasses.filter((pitchClass) => this.noteNames.includes(pitchClass.noteName));
      const pitchClassIntervals: PitchClassInterval[] = getPitchClassIntervals(pitchClasses);
      return {
        jinsId: this.id,
        name: this.name,
        transposition: false,
        jinsPitchClasses: pitchClasses,
        jinsPitchClassIntervals: pitchClassIntervals,
      };
    }

  /**
   * Converts this JinsData to a plain object for JSON serialization.
   *
   * @returns Plain object representation suitable for JSON storage
   */
  convertToObject(): JinsDataInterface {
    return {
      id: this.id,
      idName: this.idName,
      name: this.name,
      noteNames: this.noteNames,
      commentsEnglish: this.commentsEnglish,
      commentsArabic: this.commentsArabic,
      SourcePageReferences: this.SourcePageReferences,
      version: this.version,
    };
  }
}

/**
 * Represents a concrete, tuning-system-specific jins with actual pitch classes.
 * 
 * This interface represents a jins that has been "realized" within a specific
 * tuning system, containing actual pitch classes with frequencies and intervallic
 * relationships. Unlike JinsData (which contains only abstract note names),
 * a Jins interface instance is playable and can be used for audio synthesis.
 * 
 * **Tahlil vs Taswir**:
 * - **Tahlil** (transposition: false): The original form of the jins starting
 *   from its traditional root note (e.g., Jins Kurd starting on dūgāh)
 * - **Taswir** (transposition: true): A transposition of the jins starting
 *   from a different pitch class while preserving intervallic relationships
 *   (e.g., Jins Kurd al-Muhayyar starting on muhayyar/octave of dūgāh)
 * 
 * The transposition algorithm uses pattern matching to find all valid starting
 * positions within the tuning system where the complete interval pattern can
 * be realized, ensuring authentic intervallic structure is maintained.
 */
export interface Jins {
  /** ID of the original jins this instance is based on */
  jinsId: string;
  
  /** 
   * Name of this jins instance.
   * For tahlil: original name (e.g., "Jins Kurd")
   * For taswir: includes transposition info (e.g., "Jins Kurd al-Muhayyar")
   */
  name: string;
  
  /** 
   * Whether this is a transposition (taswir) or original form (tahlil).
   * false = tahlil (original), true = taswir (transposition)
   */
  transposition: boolean;
  
  /** 
   * Array of actual pitch classes with frequencies and note names.
   * These are the concrete, playable pitches within the tuning system.
   */
  jinsPitchClasses: PitchClass[];
  
  /** 
   * Intervallic relationships between consecutive pitch classes.
   * These intervals remain consistent between tahlil and taswir forms.
   */
  jinsPitchClassIntervals: PitchClassInterval[];
}

/**
 * Represents possible modulations between different ajnās.
 * 
 * In Arabic maqam theory, modulations occur when moving from one jins to another
 * within a melodic progression. This interface categorizes modulations based on
 * which scale degree they occur on and their directional characteristics.
 * 
 * Each property contains an array of possible target ajnās that can be reached
 * through modulation from a given starting maqam, organized by the scale degree
 * where the modulation occurs and the melodic direction.
 */
export interface AjnasModulations {
  /** Modulations that occur on the first scale degree */
  modulationsOnFirstDegree: Jins[];
  
  /** Modulations that occur on the third scale degree */
  modulationsOnThirdDegree: Jins[];
  
  /** Modulations that occur on the third scale degree (second pattern) */
  modulationsOnAltThirdDegree: Jins[];
  
  /** Modulations that occur on the fourth scale degree */
  modulationsOnFourthDegree: Jins[];
  
  /** Modulations that occur on the fifth scale degree */
  modulationsOnFifthDegree: Jins[];
  
  /** Ascending modulations that occur on the sixth scale degree */
  modulationsOnSixthDegreeAsc: Jins[];
  
  /** Descending modulations that occur on the sixth scale degree */
  modulationsOnSixthDegreeDesc: Jins[];
  
  /** Modulations on the sixth scale degree without using the third */
  modulationsOnSixthDegreeIfNoThird: Jins[];
  
  /** The note name of the second degree (plus variations) */
  noteName2pBelowThird: string;
}

/**
 * Shifts a jins to a different octave while maintaining intervallic relationships.
 * 
 * @param allPitchClasses - All available pitch classes in the tuning system
 * @param jins - The jins to shift
 * @param octaveShift - Number of octaves to shift (positive = up, negative = down)
 * @returns New Jins instance shifted by the specified number of octaves
 */
export function shiftJinsByOctaves(allPitchClasses: PitchClass[], jins: Jins, octaveShift: number): Jins | null {
  // Defensive check for undefined jins or jinsPitchClasses
  if (!jins || !jins.jinsPitchClasses) {
    console.warn('⚠️ shiftJinsByOctaves: jins or jinsPitchClasses is undefined', {
      jinsExists: !!jins,
      jinsId: jins?.jinsId,
      jinsName: jins?.name,
      jinsPitchClassesExists: !!jins?.jinsPitchClasses
    });
    return null;
  }
  
  const shiftedPitchClasses = jins.jinsPitchClasses.map((pc) => shiftPitchClassByOctave(allPitchClasses, pc, octaveShift));
  
  // Check if any pitch class shift failed (indicated by empty noteName)
  const allValid = shiftedPitchClasses.every(pc => pc.noteName !== "");
  
  if (!allValid) {
    // Return null if octave shift would put any note out of bounds
    return null;
  }

  const shiftedPitchClassIntervals = getPitchClassIntervals(shiftedPitchClasses);
  
  // Extract the base jins name (remove any existing "al-" suffix and what follows)
  let baseJinsName = jins.name;
  const alIndex = baseJinsName.indexOf(' al-');
  if (alIndex !== -1) {
    baseJinsName = baseJinsName.substring(0, alIndex);
  }
  
  // Create new name with the shifted tonic
  const newTonicName = shiftedPitchClasses[0].noteName;
  const newName = `${baseJinsName} al-${newTonicName}`;
  
  return {
    jinsId: jins.jinsId,
    name: newName,
    transposition: jins.transposition,
    jinsPitchClasses: shiftedPitchClasses,
    jinsPitchClassIntervals: shiftedPitchClassIntervals,
  };}

/**
 * Compares two jins instances for equality based on ID, length, and starting note.
 * 
 * @param jinsA - First jins to compare
 * @param jinsB - Second jins to compare
 * @returns True if the jins are considered equal, false otherwise
 */
export function ajnasAreEqual(jinsA: Jins, jinsB: Jins): boolean {
  if (jinsA.jinsPitchClasses.length !== jinsB.jinsPitchClasses.length) return false;
  else if (jinsA.jinsId !== jinsB.jinsId) return false;
  else if (jinsA.jinsPitchClasses[0].noteName !== jinsB.jinsPitchClasses[0].noteName) return false;
  else return true;
}