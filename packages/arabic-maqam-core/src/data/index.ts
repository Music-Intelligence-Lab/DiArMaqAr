// Data - Static data files for Arabic maqam theory
import ajnasData from './ajnas.json';
import maqamatData from './maqamat.json';
import patternsData from './patterns.json';
import sourcesData from './sources.json';
import tuningSystemsData from './tuningSystems.json';

export {
  ajnasData,
  maqamatData,
  patternsData,
  sourcesData,
  tuningSystemsData
};

// Re-export individual data sets
export { ajnasData as ajnas };
export { maqamatData as maqamat };
export { patternsData as patterns };
export { sourcesData as sources };
export { tuningSystemsData as tuningSystems };
