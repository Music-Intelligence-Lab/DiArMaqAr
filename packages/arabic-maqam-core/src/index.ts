// Arabic Maqam Core Library
// A comprehensive TypeScript library for Arabic maqam music theory

// Export all models
export * from './models';

// Export all functions  
export * from './functions';

// Export all data
export * from './data';

// Import for organized default export
import * as models from './models';
import * as functions from './functions';
import * as data from './data';

// Default export with organized structure
const arabicMaqamCore = {
  models,
  functions,
  data
};

export default arabicMaqamCore;
