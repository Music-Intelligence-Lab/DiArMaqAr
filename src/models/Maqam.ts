import { getPitchClassIntervals } from "@/functions/getPitchClassIntervals";
import PitchClass, { PitchClassInterval } from "./PitchClass";
import { AjnasModulations, Jins } from "./Jins";
import NoteName from "./NoteName";
import { SourcePageReference } from "./bibliography/Source";
import { standardizeText } from "@/functions/export";
import shiftPitchClassByOctave from "@/functions/shiftPitchClassByOctave";

/**
 * Interface for serializing MaqamData to JSON format.
 * Used for data persistence and API communication.
 */
export interface MaqamDataInterface {
  id: string;
  idName: string;
  name: string;
  ascendingNoteNames: NoteName[];
  descendingNoteNames: NoteName[];
  suyur: Sayr[];
  commentsEnglish: string;
  commentsArabic: string;
  sourcePageReferences: SourcePageReference[];
  numberOfTranspositions?: number;
  version?: string;
}

/**
 * Represents the raw, tuning-system-independent definition of a maqam.
 * 
 * A maqam is a complete modal framework that differs from ajnas in its scope and
 * structure, representing a comprehensive melodic system rather than a building block
 * component. Each maqām contains both an ascending sequence (ṣuʿūd) and a descending
 * sequence (hubūṭ) of note names, both consisting of seven or more notes that can be
 * either identical (symmetric) or different (asymmetric).
 * 
 * MaqamData contains only abstract note names without connection to specific pitch
 * classes or tuning systems, serving as the "template" or "blueprint" of a maqam
 * as it would appear in theoretical texts or JSON data files. To create an actual
 * playable maqam with specific pitches, this data must be combined with a tuning
 * system through the getTahlil() method to produce a Maqam interface instance.
 * 
 * **Key Features**:
 * - **Bidirectional sequences**: Separate ascending (ṣuʿūd) and descending (hubūṭ) paths
 * - **Asymmetrical structure**: Platform visually distinguishes notes appearing only in
 *   descending sequences
 * - **Embedded ajnas analysis**: Algorithm identifies all possible ajnās patterns within
 *   both sequences using cents tolerance matching
 * - **suyur integration**: Traditional melodic development pathways defining performance practice
 * 
 * **Key Distinction**: MaqamData contains only note names (cultural/theoretical
 * identifiers), while the Maqam interface contains actual pitch classes with
 * frequencies and intervallic relationships within a specific tuning system.
 */
export default class MaqamData {
  /** Unique identifier for this maqam */
  private id: string;
  
  private idName: string;
  /** Name of the maqam (e.g., "Maqam Farahfazza", "Maqam Rast") */
  private name: string;
  
  /** 
   * Ascending sequence (ṣuʿūd) of note names.
   * These are cultural/theoretical identifiers without connection to specific frequencies.
   * Must contain seven or more notes defining the upward melodic progression.
   */
  private ascendingNoteNames: NoteName[];
  
  /** 
   * Descending sequence (hubūṭ) of note names.
   * These define the downward melodic progression and may differ from the ascending
   * sequence in asymmetric maqamat, creating distinctive directional characteristics.
   */
  private descendingNoteNames: NoteName[];
  
  /** 
   * suyur (traditional melodic development pathways).
   * Define how the maqam unfolds in performance practice, including characteristic
   * progressions, emphasis points, and developmental patterns beyond basic sequences.
   */
  private suyur: Sayr[];
  
  /** English-language comments or description */
  private commentsEnglish: string;
  
  /** Arabic-language comments or description */
  private commentsArabic: string;
  
  /** References to source documents where this maqam is documented */
  private sourcePageReferences: SourcePageReference[];

  /** ISO 8601 timestamp of last modification */
  private version!: string;

  /** Legacy property - consider removing in future refactoring */
  ascendingPitchClasses: any;

  /**
   * Creates a new MaqamData instance with abstract note names.
   *
   * @param id - Unique identifier for this maqam
   * @param name - Name of the maqam (e.g., "Maqam Farahfazza")
   * @param ascendingNoteNames - Ascending sequence (ṣuʿūd) of note names
   * @param descendingNoteNames - Descending sequence (hubūṭ) of note names
   * @param suyur - Traditional melodic development pathways
   * @param commentsEnglish - English description or comments
   * @param commentsArabic - Arabic description or comments
   * @param sourcePageReferences - References to source documents
   * @param version - ISO 8601 timestamp of last modification (defaults to current time)
   */
  constructor(
    id: string,
    name: string,
    ascendingNoteNames: NoteName[],
    descendingNoteNames: NoteName[],
    suyur: Sayr[],
    commentsEnglish: string,
    commentsArabic: string,
    sourcePageReferences: SourcePageReference[],
    version?: string
  ) {
    this.id = id;
    this.idName = standardizeText(name);
    this.name = name;
    this.ascendingNoteNames = ascendingNoteNames;
    this.descendingNoteNames = descendingNoteNames;
    this.suyur = suyur;
    this.commentsEnglish = commentsEnglish;
    this.commentsArabic = commentsArabic;
    this.sourcePageReferences = sourcePageReferences;
    this.version = version || new Date().toISOString();
  }

  /**
   * Gets the unique identifier of this maqam.
   * 
   * @returns The maqam ID
   */
  getId(): string {
    return this.id;
  }

  getIdName(): string {
    return this.idName;
  }

  /**
   * Gets the name of this maqam.
   * 
   * @returns The maqam name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets the ascending sequence (ṣuʿūd) note names.
   * 
   * These are abstract cultural identifiers without connection to specific
   * pitch frequencies. To get actual playable pitches, use getTahlil() with
   * a specific tuning system.
   * 
   * @returns Array of ascending note names
   */
  getAscendingNoteNames(): NoteName[] {
    return this.ascendingNoteNames;
  }

  /**
   * Gets the descending sequence (hubūṭ) note names.
   * 
   * These may differ from ascending names in asymmetric maqamat, creating
   * distinctive directional characteristics that are essential to the maqam's identity.
   * 
   * @returns Array of descending note names
   */
  getDescendingNoteNames(): NoteName[] {
    return this.descendingNoteNames;
  }

  /**
   * Gets the suyur (traditional melodic development pathways).
   * 
   * suyur define how the maqam unfolds in performance practice, going beyond
   * basic ascending/descending sequences to describe characteristic progressions,
   * emphasis points, and developmental patterns.
   * 
   * @returns Array of sayr objects
   */
  getSuyur(): Sayr[] {
    return this.suyur;
  }

  /**
   * Gets the English-language comments for this maqam.
   * 
   * @returns English comments
   */
  getCommentsEnglish(): string {
    return this.commentsEnglish;
  }

  /**
   * Gets the Arabic-language comments for this maqam.
   * 
   * @returns Arabic comments
   */
  getCommentsArabic(): string {
    return this.commentsArabic;
  }

  /**
   * Gets the source page references for this maqam.
   *
   * @returns Array of source page references
   */
  getSourcePageReferences(): SourcePageReference[] {
    return this.sourcePageReferences;
  }

  /**
   * Gets the version timestamp of this maqam.
   *
   * @returns ISO 8601 timestamp string
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Sets the version timestamp of this maqam.
   *
   * @param version - ISO 8601 timestamp string
   */
  setVersion(version: string): void {
    this.version = version;
  }

  /**
   * Checks if this maqam has symmetric ascending and descending sequences.
   * 
   * A symmetric maqam has identical ascending and descending sequences when the
   * descending sequence is reversed. Asymmetric maqamat have different note patterns
   * for ascent and descent, creating distinctive directional characteristics that
   * are visually distinguished in the platform interface.
   * 
   * @returns True if the maqam is symmetric, false if asymmetric
   */
  isMaqamSymmetric(): boolean {
    if (this.ascendingNoteNames.length !== this.descendingNoteNames.length) {
      return false;
    }

    for (let i = 0; i < this.ascendingNoteNames.length; i++) {
      if (this.ascendingNoteNames[i] !== this.descendingNoteNames[this.descendingNoteNames.length - 1 - i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if this maqam can be constructed within a given tuning system.
   * 
   * A maqam is only selectable/constructible if ALL note names in BOTH its
   * ascending and descending sequences exist within the tuning system's available
   * pitch classes. The platform searches across all four octaves when determining
   * compatibility, similar to ajnas but with the additional requirement that both
   * directional sequences must be fully supported.
   * 
   * For example, in Al-Kindī's tuning system:
   * - Maqam Farahfazza (yegah → dūgāh ascending, dūgāh → yegah descending) ✓ CAN be constructed
   * - A hypothetical maqam requiring "nīm ḥusaynī" ✗ CANNOT because Al-Kindī's system lacks this note
   * 
   * @param allNoteNames - All note names available in the tuning system
   * @returns True if all required note names are available in both sequences, false otherwise
   */
  isMaqamPossible(allNoteNames: NoteName[]): boolean {
    return (
      this.ascendingNoteNames.every((noteName) => allNoteNames.includes(noteName)) &&
      this.descendingNoteNames.every((noteName) => allNoteNames.includes(noteName))
    );
  }

  /**
   * Converts this abstract maqam into a concrete, playable tahlil (original form).
   * 
   * This is the crucial method that bridges the gap between abstract note names
   * and actual musical pitches. It processes both ascending and descending sequences
   * separately, matching note names with corresponding pitch classes from a specific
   * tuning system, creating a Maqam interface instance with:
   * 
   * - Actual frequency values for both sequences
   * - Intervallic relationships between consecutive pitches in both directions
   * - Playable musical content with directional characteristics
   * - Foundation for embedded ajnas analysis and suyur transposition
   * 
   * The resulting Maqam represents the "tahlil" (original/root form) of the maqam,
   * as opposed to "taswir" (transpositions) which would start from different
   * pitch classes but maintain the same intervallic patterns and directional structure.
   * 
   * @param allPitchClasses - All pitch classes available in the tuning system
   * @returns Maqam interface instance with concrete pitches and intervals
   */
  getTahlil(allPitchClasses: PitchClass[]): Maqam {
    const ascendingPitchClasses = allPitchClasses.filter((pitchClass) => this.ascendingNoteNames.includes(pitchClass.noteName));
    const ascendingPitchClassIntervals: PitchClassInterval[] = getPitchClassIntervals(ascendingPitchClasses);
    const descendingPitchClasses = allPitchClasses.filter((pitchClass) => this.descendingNoteNames.includes(pitchClass.noteName)).reverse();
    const descendingPitchClassIntervals: PitchClassInterval[] = getPitchClassIntervals(descendingPitchClasses);
    return {
      maqamId: this.id,
      name: this.name,
      transposition: false,
      ascendingPitchClasses: ascendingPitchClasses,
      ascendingPitchClassIntervals: ascendingPitchClassIntervals,
      descendingPitchClasses: descendingPitchClasses,
      descendingPitchClassIntervals: descendingPitchClassIntervals,
    };
  }

  /**
   * Creates a copy of this maqam with new suyur pathways.
   * 
   * This method preserves all other properties while allowing for suyur
   * modifications, useful for exploring different performance traditions
   * or creating variants with alternative melodic development patterns.
   * 
   * @param newsuyur - New suyur pathways to use in the copy
   * @returns New MaqamData instance with updated suyur
   */
  createMaqamWithNewSuyur(newsuyur: Sayr[]): MaqamData {
    return new MaqamData(
      this.id,
      this.name,
      this.ascendingNoteNames,
      this.descendingNoteNames,
      newsuyur,
      this.commentsEnglish,
      this.commentsArabic,
      this.sourcePageReferences
    );
  }

  /**
   * Creates a copy of this maqam with new source page references.
   * 
   * @param newSourcePageReferences - New source page references to use
   * @returns New MaqamData instance with updated references
   */
  createMaqamWithNewSourcePageReferences(newSourcePageReferences: SourcePageReference[]): MaqamData {
    return new MaqamData(
      this.id,
      this.name,
      this.ascendingNoteNames,
      this.descendingNoteNames,
      this.suyur,
      this.commentsEnglish,
      this.commentsArabic,
      newSourcePageReferences
    );
  }

  /**
   * Converts this MaqamData to a plain object for JSON serialization.
   * 
   * @returns Plain object representation suitable for JSON storage
   */
  convertToObject(): MaqamDataInterface {
    return {
      id: this.id,
      idName: this.idName,
      name: this.name,
      ascendingNoteNames: this.ascendingNoteNames,
      descendingNoteNames: this.descendingNoteNames,
      suyur: this.suyur,
      commentsEnglish: this.commentsEnglish,
      commentsArabic: this.commentsArabic,
      sourcePageReferences: this.sourcePageReferences,
    };
  }
}

/**
 * Represents a structured melodic development pathway (sayr) within a maqam.
 * 
 * suyur (plural of sayr) represent traditional melodic development pathways that
 * define how a maqam unfolds in performance practice, going beyond basic ascending
 * and descending sequences to describe characteristic melodic progressions,
 * emphasis points, and developmental patterns. When a maqām is transposed, the
 * platform automatically transposes its associated sayr by converting note names
 * and adjusting jins and maqām references to their transposed equivalents.
 */
export interface Sayr {
  /** Unique identifier for this sayr */
  id: string;

  /** English name of the sayr's creator/documenter */
  creatorEnglish: string;

  /** Arabic name of the sayr's creator/documenter */
  creatorArabic: string;

  /** ID of the source document where this sayr is documented */
  sourceId: string;

  /** Page reference within the source document */
  page: string;

  /** English comments about this sayr */
  commentsEnglish: string;

  /** Arabic comments about this sayr */
  commentsArabic: string;

  /** Array of stops defining the melodic development pathway */
  stops: SayrStop[];

  /** ISO 8601 timestamp of last modification */
  version?: string;
}

/**
 * Represents a single stop within a sayr (melodic development pathway).
 * 
 * Each stop can represent different types of musical elements that guide
 * performance practice and melodic development within the maqam.
 */
export interface SayrStop {
  /** Type of stop: specific note, jins fragment, maqam reference, or directional instruction */
  type: "note" | "jins" | "maqam" | "direction";
  
  /** The value/identifier for this stop (note name, jins name, maqam name, or direction) */
  value: string;
  
  /** Optional starting note for jins or maqam references */
  startingNote?: NoteName;
  
  /** Optional directional instruction for melodic movement */
  direction?: "ascending" | "descending";
}

/**
 * Represents a concrete, tuning-system-specific maqam with actual pitch classes.
 * 
 * This interface represents a maqam that has been "realized" within a specific
 * tuning system, containing actual pitch classes with frequencies and intervallic
 * relationships for both ascending and descending sequences. Unlike MaqamData
 * (which contains only abstract note names), a Maqam interface instance is
 * playable and can be used for audio synthesis and comprehensive analysis.
 * 
 * **Tahlil vs Taswir**:
 * - **Tahlil** (transposition: false): The original form of the maqam starting
 *   from its traditional root note (e.g., Maqam Farahfazza starting on yegah)
 * - **Taswir** (transposition: true): A transposition of the maqam starting
 *   from a different pitch class while preserving intervallic relationships and
 *   directional characteristics (e.g., Maqam Farahfazza al-Rast starting on rast)
 * 
 * **Advanced Features**:
 * - **Embedded ajnas analysis**: Algorithm identifies all possible ajnās patterns
 *   within both ascending and descending sequences using cents tolerance matching
 * - **Automatic transposition**: Both sequences and embedded ajnas are systematically
 *   transposed while maintaining authentic intervallic structure
 * - **suyur integration**: Associated melodic development pathways are automatically
 *   transposed with note name conversion and jins/maqam reference adjustment
 * 
 * The transposition algorithm separately processes both sequences, ensuring all
 * required note names exist within the tuning system's four octaves before
 * generating a valid transposition.
 */
export interface Maqam {
  /** ID of the original maqam this instance is based on */
  maqamId: string;
  
  /** 
   * Name of this maqam instance.
   * For tahlil: original name (e.g., "Maqam Farahfazza")
   * For taswir: includes transposition info (e.g., "Maqam Farahfazza al-Rast")
   */
  name: string;
  
  /** 
   * Whether this is a transposition (taswir) or original form (tahlil).
   * false = tahlil (original), true = taswir (transposition)
   */
  transposition: boolean;
  
  /** 
   * Array of actual pitch classes for the ascending sequence (ṣuʿūd).
   * These are the concrete, playable pitches within the tuning system.
   */
  ascendingPitchClasses: PitchClass[];
  
  /** 
   * Intervallic relationships between consecutive pitch classes in ascending sequence.
   * These intervals remain consistent between tahlil and taswir forms.
   */
  ascendingPitchClassIntervals: PitchClassInterval[];
  
  /** 
   * Optional array of embedded ajnas found within the ascending sequence.
   * Generated through algorithmic pattern matching against known ajnās database.
   */
  ascendingMaqamAjnas?: (Jins | null)[];
  
  /** 
   * Array of actual pitch classes for the descending sequence (hubūṭ).
   * May differ from ascending sequence in asymmetric maqamat.
   */
  descendingPitchClasses: PitchClass[];
  
  /** 
   * Intervallic relationships between consecutive pitch classes in descending sequence.
   * These intervals remain consistent between tahlil and taswir forms.
   */
  descendingPitchClassIntervals: PitchClassInterval[];
  
  /** 
   * Optional array of embedded ajnas found within the descending sequence.
   * Generated through algorithmic pattern matching against known ajnās database.
   */
  descendingMaqamAjnas?: (Jins | null)[];
  
  /** 
   * Optional modulation possibilities to other maqamat or ajnas.
   * Defines possible transitions from this maqam to others.
   */
  modulations?: MaqamatModulations | AjnasModulations;
  
  /** Optional number of steps/hops for modulation analysis */
  numberOfHops?: number;
}

/**
 * Represents possible modulations (transitions) between different maqamat.
 * 
 * In Arabic maqam theory, modulations occur when transitioning from one maqam to
 * another within a melodic progression. This interface categorizes modulations
 * based on which scale degree they occur on and their directional characteristics,
 * similar to ajnas modulations but operating at the complete modal framework level.
 * 
 * Each property contains an array of possible target maqamat that can be reached
 * through modulation from a given starting maqam, organized by the scale degree
 * where the modulation occurs and the melodic direction.
 */
export interface MaqamatModulations {
  /** Modulations that occur on the first scale degree */
  modulationsOnFirstDegree: Maqam[];
  
  /** Modulations that occur on the third scale degree */
  modulationsOnThirdDegree: Maqam[];
  
  /** Modulations that occur on the third scale degree (second pattern) */
  modulationsOnAltThirdDegree: Maqam[];
  
  /** Modulations that occur on the fourth scale degree */
  modulationsOnFourthDegree: Maqam[];
  
  /** Modulations that occur on the fifth scale degree */
  modulationsOnFifthDegree: Maqam[];
  
  /** Ascending modulations that occur on the sixth scale degree */
  modulationsOnSixthDegreeAsc: Maqam[];
  
  /** Descending modulations that occur on the sixth scale degree */
  modulationsOnSixthDegreeDesc: Maqam[];
  
  /** Modulations on the sixth scale degree without using the third */
  modulationsOnSixthDegreeIfNoThird: Maqam[];
  
  /** The note name of the second degree (plus variations) */
  noteName2pBelowThird: string;
}

/**
 * Shifts a maqam to a different octave while maintaining intervallic relationships.
 * 
 * @param allPitchClasses - All available pitch classes in the tuning system
 * @param maqam - The maqam to shift
 * @param octaveShift - Number of octaves to shift (positive = up, negative = down)
 * @returns New Maqam instance shifted by the specified number of octaves
 */
export function shiftMaqamByOctaves(allPitchClasses: PitchClass[], maqam: Maqam, octaveShift: number): Maqam | null {
  // Defensive check for undefined maqam or pitch class arrays
  if (!maqam || !maqam.ascendingPitchClasses || !maqam.descendingPitchClasses) {
    console.warn('⚠️ shiftMaqamByOctaves: maqam or pitch class arrays are undefined', {
      maqamExists: !!maqam,
      maqamId: maqam?.maqamId,
      maqamName: maqam?.name,
      ascendingPitchClassesExists: !!maqam?.ascendingPitchClasses,
      descendingPitchClassesExists: !!maqam?.descendingPitchClasses
    });
    return null;
  }
  
  const shiftedAscendingPitchClasses = maqam.ascendingPitchClasses.map((pc) => shiftPitchClassByOctave(allPitchClasses, pc, octaveShift));
  const shiftedDescendingPitchClasses = maqam.descendingPitchClasses.map((pc) => shiftPitchClassByOctave(allPitchClasses, pc, octaveShift));

  // Check if any pitch class shift failed (indicated by empty noteName)
  const ascendingValid = shiftedAscendingPitchClasses.every(pc => pc.noteName !== "");
  const descendingValid = shiftedDescendingPitchClasses.every(pc => pc.noteName !== "");
  
  if (!ascendingValid || !descendingValid) {
    // Return null if octave shift would put any note out of bounds
    return null;
  }

  const shiftedAscendingIntervals = getPitchClassIntervals(shiftedAscendingPitchClasses);
  const shiftedDescendingIntervals = getPitchClassIntervals(shiftedDescendingPitchClasses);

  // Extract the base maqam name (remove any existing "al-" suffix and what follows)
  let baseMaqamName = maqam.name;
  const alIndex = baseMaqamName.indexOf(' al-');
  if (alIndex !== -1) {
    baseMaqamName = baseMaqamName.substring(0, alIndex);
  }
  
  // Create new name with the shifted tonic
  const newTonicName = shiftedAscendingPitchClasses[0].noteName;
  const newName = `${baseMaqamName} al-${newTonicName}`;
  
  return {
    maqamId: maqam.maqamId,
    name: newName,
    transposition: maqam.transposition,
    ascendingPitchClasses: shiftedAscendingPitchClasses,
    ascendingPitchClassIntervals: shiftedAscendingIntervals,
    descendingPitchClasses: shiftedDescendingPitchClasses,
    descendingPitchClassIntervals: shiftedDescendingIntervals,
    ascendingMaqamAjnas: maqam.ascendingMaqamAjnas,
    descendingMaqamAjnas: maqam.descendingMaqamAjnas,
    modulations: maqam.modulations,
    numberOfHops: maqam.numberOfHops,
  };
}

/**
 * Compares two maqam instances for equality based on ID, transposition, and sequences.
 * 
 * @param maqamA - First maqam to compare
 * @param maqamB - Second maqam to compare
 * @returns True if the maqamat are considered equal, false otherwise
 */
export function maqamatAreEqual(maqamA: Maqam, maqamB: Maqam): boolean {
  if (maqamA.maqamId !== maqamB.maqamId) return false;
  else if (maqamA.transposition !== maqamB.transposition) return false;
  else if (maqamA.ascendingPitchClasses.length !== maqamB.ascendingPitchClasses.length) return false;
  else if (maqamA.descendingPitchClasses.length !== maqamB.descendingPitchClasses.length) return false;
  else if (maqamA.ascendingPitchClasses[0].noteName !== maqamB.ascendingPitchClasses[0].noteName) return false;
  else if (maqamA.descendingPitchClasses[0].noteName !== maqamB.descendingPitchClasses[0].noteName) return false;
  return true;
}