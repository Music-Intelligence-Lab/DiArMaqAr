// Main entry point for @maqam-network/core package

// Export all models
export type { default as PitchClass, PitchClassInterval } from './models/PitchClass';
export { calculateInterval } from './models/PitchClass';

export type { default as TuningSystem } from './models/TuningSystem';
export type { default as JinsDetails, Jins, JinsDetailsInterface } from './models/Jins';
export type { default as MaqamDetails, Maqam, MaqamDetailsInterface } from './models/Maqam';
export type { default as NoteName } from './models/NoteName';
export type { default as Pattern } from './models/Pattern';

// Export bibliography models
export type { SourcePageReference, Source } from './models/bibliography/Source';
export type { AbstractSource } from './models/bibliography/AbstractSource';

// Export utility functions
export { default as gcd } from './functions/gcd';
export { default as computeFractionInterval } from './functions/computeFractionInterval';
export { default as camelCaseToWord } from './functions/camelCaseToWord';
export { default as detectPitchClassType } from './functions/detectPitchClassType';
export { default as midiToNoteNumber } from './functions/midiToNoteNumber';
export { default as romanToNumber } from './functions/romanToNumber';

// Export core music functions
export * from './functions/transpose';
export { default as shiftPitchClass } from './functions/shiftPitchClass';
export { default as modulate } from './functions/modulate';
export * from './functions/convertPitchClass';
export { default as extendPitchClasses } from './functions/extendPitchClasses';

// Export analysis functions
export { default as calculateNumberOfModulations } from './functions/calculateNumberOfModulations';
export { default as getFirstNoteName } from './functions/getFirstNoteName';
export { default as getNoteNamesUsedInTuningSystem } from './functions/getNoteNamesUsedInTuningSystem';
export { default as getTuningSystemCells } from './functions/getTuningSystemCells';

// Export mappings and lookup functions
export * from './functions/noteNameMappings';
export { default as shawwaMapping } from './functions/shawwaMapping';

// Export I/O functions
export * from './functions/import';
export * from './functions/export';
export * from './functions/update';

// Export data
export { default as ajnasData } from './data/ajnas.json';
export { default as maqamatData } from './data/maqamat.json';
export { default as patternsData } from './data/patterns.json';
export { default as sourcesData } from './data/sources.json';
export { default as tuningSystemsData } from './data/tuningSystems.json';
