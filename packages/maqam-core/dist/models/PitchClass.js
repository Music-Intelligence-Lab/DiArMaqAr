"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateInterval = calculateInterval;
exports.matchingIntervals = matchingIntervals;
exports.matchingListOfIntervals = matchingListOfIntervals;
const computeFractionInterval_1 = __importDefault(require("../functions/computeFractionInterval"));
function convertFractionToDecimal(fraction) {
    const [numerator, denominator] = fraction.split("/").map(Number);
    return numerator / denominator;
}
function calculateInterval(firstPitchClass, secondPitchClass) {
    const fraction = (0, computeFractionInterval_1.default)(firstPitchClass.fraction, secondPitchClass.fraction);
    const cents = parseFloat(secondPitchClass.cents) - parseFloat(firstPitchClass.cents);
    const decimalRatio = convertFractionToDecimal(fraction);
    const stringLength = parseFloat(secondPitchClass.stringLength) - parseFloat(firstPitchClass.stringLength);
    const fretDivision = parseFloat(secondPitchClass.fretDivision) - parseFloat(firstPitchClass.fretDivision);
    const index = secondPitchClass.index * secondPitchClass.octave - firstPitchClass.index * firstPitchClass.octave;
    const originalValueType = secondPitchClass.originalValueType;
    let originalValue = "";
    if (originalValueType === "fraction")
        originalValue = fraction;
    else if (originalValueType === "cents")
        originalValue = cents.toFixed(2);
    else if (originalValueType === "decimalRatio")
        originalValue = decimalRatio.toFixed(2);
    else if (originalValueType === "stringLength")
        originalValue = stringLength.toFixed(2);
    return {
        fraction,
        cents,
        decimalRatio,
        stringLength,
        fretDivision,
        index,
        originalValue,
        originalValueType,
    };
}
function matchingIntervals(firstInterval, secondInterval, centsTolerance = 5) {
    const originalValueType = firstInterval.originalValueType;
    if (originalValueType === "fraction" || originalValueType === "decimalRatio")
        return firstInterval.fraction === secondInterval.fraction;
    else
        return Math.abs(firstInterval.cents - secondInterval.cents) <= centsTolerance;
}
function matchingListOfIntervals(firstIntervals, secondIntervals, centsTolerance = 5) {
    if (firstIntervals.length !== secondIntervals.length)
        return false;
    for (let i = 0; i < firstIntervals.length; i++) {
        if (!matchingIntervals(firstIntervals[i], secondIntervals[i], centsTolerance))
            return false;
    }
    return true;
}
//# sourceMappingURL=PitchClass.js.map