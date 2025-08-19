// Models - Core data structures for Arabic maqam theory
export { default as Jins, type JinsDataInterface, type AjnasModulations } from './Jins';
export { default as Maqam, type MaqamDataInterface } from './Maqam';
export { default as NoteName } from './NoteName';
export { default as Pattern } from './Pattern';
export { default as PitchClass, type PitchClassInterval } from './PitchClass';
export { default as TuningSystem } from './TuningSystem';

// Bibliography models
export * from './bibliography/Source';
