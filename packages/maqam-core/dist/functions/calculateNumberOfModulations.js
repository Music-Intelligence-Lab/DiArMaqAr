"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = calculateNumberOfModulations;
/**
 * Calculates the number of modulations, optionally filtering by type (ajnas or maqamat).
 * @param modulations The modulations object.
 * @param type 'all' (default): count all modulations; 'ajnas': only ajnas; 'maqamat': only maqamat
 */
function calculateNumberOfModulations(modulations, type = "all") {
    if (!modulations)
        return 0;
    // Helper to check if a hop is maqam or jins
    const isMaqam = (modulation) => modulation && "ascendingPitchClasses" in modulation;
    const isJins = (modulation) => modulation && !("ascendingPitchClasses" in modulation);
    // List all modulation arrays
    const arrays = [
        modulations.modulationsOnOne ?? [],
        modulations.modulationsOnThree ?? [],
        modulations.modulationsOnThree2p ?? [],
        modulations.modulationsOnFour ?? [],
        modulations.modulationsOnFive ?? [],
        modulations.modulationsOnSixNoThird ?? [],
        modulations.modulationsOnSixAscending ?? [],
        modulations.modulationsOnSixDescending ?? [],
    ];
    if (type === "all") {
        return arrays.reduce((acc, arr) => acc + arr.length, 0);
    }
    let count = 0;
    for (const arr of arrays) {
        for (const hop of arr) {
            if (type === "ajnas" && isJins(hop))
                count++;
            if (type === "maqamat" && isMaqam(hop))
                count++;
        }
    }
    return count;
}
//# sourceMappingURL=calculateNumberOfModulations.js.map