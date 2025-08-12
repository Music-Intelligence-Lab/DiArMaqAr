import NoteName, { getNoteNameIndexAndOctave } from "@/models/NoteName";

/**
 * Maps note names to Shawwa theoretical categories for maqam analysis.
 * 
 * The Shawwa system is a theoretical framework for analyzing Arabic maqam
 * scales that categorizes notes into different types based on their
 * intervallic relationships. This mapping is crucial for modulation
 * analysis and theoretical study of maqam structures.
 * 
 * Categories:
 * - "n": Natural notes (stable, consonant scale degrees)
 * - "1p": One-part notes (quarter-tone alterations)
 * - "2p": Two-part notes (half-tone alterations) 
 * - "/": Not applicable or undefined
 * 
 * @param noteName - The note name to classify
 * @returns The Shawwa category for the given note
 * 
 * @example
 * shawwaMapping("D3Js") // Returns "n" (natural)
 * 
 * @example
 * shawwaMapping("D3+") // Returns "1p" (one-part, quarter-sharp)
 * 
 * @example
 * shawwaMapping("D#3") // Returns "2p" (two-part, half-sharp)
 * 
 * @example
 * shawwaMapping("none") // Returns "/" (not applicable)
 */
export default function shawwaMapping(noteName: NoteName): "n" | "1p" | "2p" | "/" {
  // Handle the special "none" case
  if (noteName === "none") return "/";
  
  // Get the index of the note within the note name system
  const index = getNoteNameIndexAndOctave(noteName).index;

  // Define the index sets for each Shawwa category
  // These indices correspond to specific positions in the note name array
  
  // Natural notes: stable, consonant degrees in maqam theory
  const naturalIndices = [0, 6, 11, 16, 21, 26, 30];
  
  // One-part notes: quarter-tone alterations (microtonal sharps)
  const onePartIndices = [1, 4, 7, 13, 18, 20, 22, 27, 32, 35];
  
  // Two-part notes: half-tone alterations (standard sharps/flats)
  const twoPartIndices = [3, 8, 14, 19, 24, 28, 34];

  // Classify the note based on its index
  if (naturalIndices.includes(index)) {
    return "n";     // Natural note
  } else if (onePartIndices.includes(index)) {
    return "1p";    // One-part (quarter-tone) alteration
  } else if (twoPartIndices.includes(index)) {
    return "2p";    // Two-part (half-tone) alteration
  } else {
    return "/";     // Undefined or not applicable
  }
}
