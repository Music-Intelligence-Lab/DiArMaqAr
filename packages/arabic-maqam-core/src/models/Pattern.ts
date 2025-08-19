/**
 * Represents a musical pattern in the Arabic maqam system.
 * 
 * A Pattern is a sequence of musical notes with specific durations and scale degrees
 * that can be used to demonstrate or practice melodic phrases within a maqam.
 * Each pattern contains notes with scale degrees, rhythmic durations, and target
 * emphasis information for educational and performance purposes.
 * 
 * @example
 * ```typescript
 * const pattern = new Pattern(
 *   "ascending-basic",
 *   "Basic Ascending Pattern",
 *   [
 *     { scaleDegree: "I", noteDuration: "4n", isTarget: true },
 *     { scaleDegree: "II", noteDuration: "4n", isTarget: false },
 *     { scaleDegree: "III", noteDuration: "4n", isTarget: true }
 *   ]
 * );
 * ```
 */
export default class Pattern {
  /** Unique identifier for the pattern */
  private id: string;
  
  /** Human-readable name of the pattern */
  private name: string;
  
  /** Array of notes that make up this pattern */
  private notes: PatternNote[];

  /**
   * Creates a new Pattern instance.
   * 
   * @param id - Unique identifier for this pattern
   * @param name - Human-readable name for this pattern
   * @param notes - Array of PatternNote objects that define the melodic sequence
   */
  constructor(id: string, name: string, notes: PatternNote[]) {
    this.id = id;
    this.name = name;
    this.notes = notes;
  }

  /**
   * Gets the unique identifier of this pattern.
   * 
   * @returns The pattern's ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Gets the human-readable name of this pattern.
   * 
   * @returns The pattern's name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets the array of notes that make up this pattern.
   * 
   * @returns Array of PatternNote objects
   */
  getNotes(): PatternNote[] {
    return this.notes;
  }

  /**
   * Converts the pattern to a JSON-serializable object.
   * 
   * This method is useful for saving patterns to files, sending them over
   * network requests, or storing them in databases.
   * 
   * @returns A plain object representation of the pattern
   */
  convertToJSON() {
    return {
      id: this.id,
      name: this.name,
      notes: this.notes,
    };
  }
}

/**
 * Represents a single note within a musical pattern.
 * 
 * Each PatternNote defines a musical event with its position in the scale,
 * rhythmic duration, emphasis level, and optional dynamic marking.
 * 
 * @interface PatternNote
 */
export interface PatternNote {
  /** 
   * The scale degree of this note (e.g., "I", "II", "-III", "+V").
   * Corresponds to positions in the SCALE_DEGREES array.
   */
  scaleDegree: string;
  
  /** 
   * Rhythmic duration of the note using standard musical notation.
   * Examples: "4n" = quarter note, "8d" = dotted eighth, "16t" = sixteenth triplet
   */
  noteDuration: NoteDuration;
  
  /** 
   * Whether this note should be emphasized or highlighted during playback.
   * Target notes are typically structurally important in the pattern.
   */
  isTarget: boolean;
  
  /** 
   * Optional MIDI velocity value (0-127) for dynamic expression.
   * Higher values result in louder playback.
   */
  velocity?: number;
}

/**
 * Available rhythmic duration options for pattern notes.
 * 
 * Uses standard music notation with the following suffixes:
 * - 'n' = normal (e.g., "4n" = quarter note)
 * - 'd' = dotted (adds 50% to duration, e.g., "4d" = dotted quarter)
 * - 't' = triplet (2/3 of normal duration, e.g., "4t" = quarter triplet)
 * 
 * Duration hierarchy from shortest to longest:
 * 32nd notes → 16th notes → 8th notes → quarter notes → half notes → whole notes
 * 
 * @constant
 */
export const DURATION_OPTIONS: string[] = [
  "32n",  // Thirty-second note
  "32d",  // Dotted thirty-second note
  "32t",  // Thirty-second triplet
  "16n",  // Sixteenth note
  "16d",  // Dotted sixteenth note
  "16t",  // Sixteenth triplet
  "8n",   // Eighth note
  "8d",   // Dotted eighth note
  "8t",   // Eighth triplet
  "4n",   // Quarter note
  "4d",   // Dotted quarter note
  "4t",   // Quarter triplet
  "2n",   // Half note
  "2d",   // Dotted half note
  "2t",   // Half triplet
  "1n",   // Whole note
  "1d",   // Dotted whole note
  "1t",   // Whole triplet
];

/**
 * Type representing valid note duration values.
 * Must be one of the values defined in DURATION_OPTIONS.
 */
export type NoteDuration = (typeof DURATION_OPTIONS)[number];
/**
 * Available scale degrees for pattern notes in Arabic maqam theory.
 * 
 * Scale degrees represent the intervallic relationship to the root note (tonic):
 * - Negative prefixes (e.g., "-I", "-II") indicate notes below the root
 * - "R" represents the root/tonic note
 * - Roman numerals without prefix (e.g., "I", "II") indicate notes above the root
 * - Positive prefixes (e.g., "+I", "+II") indicate notes in the next octave
 * 
 * This system allows for patterns that span multiple octaves and include
 * both ascending and descending melodic movements.
 * 
 * @constant
 */
export const SCALE_DEGREES: string[] = [
  "-I",   // One octave below tonic
  "-II",  // Major second below tonic
  "-III", // Major third below tonic
  "-IV",  // Perfect fourth below tonic
  "-V",   // Perfect fifth below tonic
  "-VI",  // Major sixth below tonic
  "-VII", // Major seventh below tonic
  "R",    // Root/Tonic note
  "I",    // Tonic (same as root in this context)
  "II",   // Major second above tonic
  "III",  // Major third above tonic
  "IV",   // Perfect fourth above tonic
  "V",    // Perfect fifth above tonic
  "VI",   // Major sixth above tonic
  "VII",  // Major seventh above tonic
  "+I",   // One octave above tonic
  "+II",  // Major second above octave
  "+III", // Major third above octave
  "+IV",  // Perfect fourth above octave
  "+V",   // Perfect fifth above octave
  "+VI",  // Major sixth above octave
  "+VII", // Major seventh above octave
];

/**
 * Reverses the melodic direction of a pattern by inverting the scale degrees.
 * 
 * This function creates a retrograde version of a pattern where the scale degrees
 * are reversed in order while preserving the original rhythmic structure and
 * target note designations. This is useful for creating variations of existing
 * patterns or for pedagogical exercises.
 * 
 * The function maintains the same note durations, target designations, and velocity
 * values in their original positions, but assigns the scale degrees in reverse order.
 * 
 * @param notes - Array of PatternNote objects to reverse
 * @returns New array with reversed scale degrees but original rhythmic structure
 * 
 * @example
 * ```typescript
 * const original = [
 *   { scaleDegree: "I", noteDuration: "4n", isTarget: true },
 *   { scaleDegree: "II", noteDuration: "8n", isTarget: false },
 *   { scaleDegree: "III", noteDuration: "4n", isTarget: true }
 * ];
 * 
 * const reversed = reversePatternNotes(original);
 * // Result: [
 * //   { scaleDegree: "III", noteDuration: "4n", isTarget: true },
 * //   { scaleDegree: "II", noteDuration: "8n", isTarget: false },
 * //   { scaleDegree: "I", noteDuration: "4n", isTarget: true }
 * // ]
 * ```
 */
export function reversePatternNotes(notes: PatternNote[]): PatternNote[] {
  const reversedScaleDegrees = notes.map((note) => note.scaleDegree).reverse();
  return notes.map((note, index) => ({
    scaleDegree: reversedScaleDegrees[index],
    noteDuration: note.noteDuration,
    isTarget: note.isTarget,
    velocity: note.velocity,
  }));
}
