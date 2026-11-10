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
 * getBaseForm() method to produce a Jins interface instance.
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
    const cleanName = name.trim();
    this.idName = standardizeText(cleanName);
    this.name = cleanName;
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
   * pitch frequencies. To get actual playable pitches, use getBaseForm() with
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
   * Converts this abstract jins into a concrete, playable base form.
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
   * The resulting Jins represents the base form of the jins,
   * as opposed to "taswir" (transpositions) which would start from different
   * pitch classes but maintain the same intervallic patterns.
   * 
   * @param allPitchClasses - All pitch classes available in the tuning system
   * @returns Jins interface instance with concrete pitches and intervals
   */
  getBaseForm(allPitchClasses: PitchClass[]): Jins {
      const pitchClasses = allPitchClasses.filter((pitchClass) => this.noteNames.includes(pitchClass.noteName));
      const pitchClassIntervals: PitchClassInterval[] = getPitchClassIntervals(pitchClasses);
      return {
        jinsId: this.id,
        name: this.name,
        transposition: false,
        isBaseForm: true,
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
 * **The three kinds of form** (read with formTypeOf in @/functions/formType):
 * - **Base form** (isBaseForm: true): the jins on its traditional
 *   tonic (jins kurd on dūgāh)
 * - **Octave rendering** (transposition: false, isBaseForm: false): the base form
 *   one or more octaves away, on the same modal degree (jins kurd al-muḥayyar,
 *   muḥayyar being the octave of dūgāh). Not a taṣwīr: only the register moves.
 * - **Taṣwīr**, a transposition (transposition: true): the jins moved to
 *   another modal degree, keeping its intervals (jins kurd al-ḥusaynī)
 *
 * Only a taṣwīr is a transposition.
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
   * For the base form: the jins's own name (e.g., "Jins Kurd")
   * For every other form: names its tonic (e.g., "Jins Kurd al-Husayni")
   */
  name: string;
  
  /**
   * Whether this form is a taṣwīr (transposition).
   * true = taṣwīr; false = the base form OR one of its octave renderings.
   * False alone does not identify the base form — use isBaseForm, or formTypeOf.
   */
  transposition: boolean;

  /**
   * Whether this is the base form: the canonical form of this jins,
   * from which its other forms are derived. Every transposition of one jins
   * repeats that jins's jinsId, and exactly one entry is the base form.
   *
   * Distinct from `transposition`, which stays false for octave renderings
   * of the base form (e.g. jins bayyāt al-muḥayyar) because a register
   * shift is not taṣwīr. The base form is the one on the jins's canonical
   * first note. A jins the tuning system cannot build yields nothing at all,
   * so the guarantee reads: exactly one base form whenever the list is
   * non-empty.
   *
   * - transposition false + isBaseForm true  = base form
   * - transposition false + isBaseForm false = octave rendering
   * - transposition true  + isBaseForm false = taṣwīr (transposition)
   */
  isBaseForm: boolean;

  /** 
   * Array of actual pitch classes with frequencies and note names.
   * These are the concrete, playable pitches within the tuning system.
   */
  jinsPitchClasses: PitchClass[];
  
  /** 
   * Intervallic relationships between consecutive pitch classes.
   * These intervals remain consistent between the base form and its transpositions.
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
  noteNameNisfBelowThird: string;
}

/**
 * The same jins form one or more octaves away, taken from `renderings` (every
 * rendering of this jins in the pitch space, as calculateJinsForms
 * returns them) so its name, idName and flags are the canonical ones. See
 * shiftMaqamByOctaves.
 *
 * @returns The rendering on the shifted tonic, or null when a shifted note falls outside the pitch space
 */
export function shiftJinsByOctaves(allPitchClasses: PitchClass[], jins: Jins, octaveShift: number, renderings: Jins[]): Jins | null {
  const shiftedNoteNames = jins.jinsPitchClasses.map((pc) => shiftPitchClassByOctave(allPitchClasses, pc, octaveShift).noteName);
  if (shiftedNoteNames.some((noteName) => noteName === "")) return null;

  const tonic = shiftedNoteNames[0];
  const rendering = renderings.find((r) => r.jinsId === jins.jinsId && r.jinsPitchClasses[0]?.noteName === tonic);
  if (!rendering) {
    throw new Error(`${jins.name} shifted by ${octaveShift} octave(s) lands on ${tonic}, but no rendering of the jins starts there.`);
  }
  return rendering;
}

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