"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = modulate;
const NoteName_1 = require("../models/NoteName");
const transpose_1 = require("./transpose");
const shawwaMapping_1 = __importDefault(require("../functions/shawwaMapping"));
const Jins_1 = __importDefault(require("../models/Jins"));
function modulate(allPitchClasses, allAjnas, allMaqamat, sourceMaqamTransposition, ajnasModulationsMode, centsTolerance = 5) {
    const modulationsOnOne = [];
    const modulationsOnThree = [];
    const modulationsOnThree2p = [];
    const modulationsOnFour = [];
    const modulationsOnFive = [];
    const modulationsOnSixAscending = [];
    const modulationsOnSixDescending = [];
    const modulationsOnSixNoThird = [];
    const sourceAscendingNotes = sourceMaqamTransposition.ascendingPitchClasses.map((pitchClass) => pitchClass.noteName);
    const sourceDescendingNotes = [...sourceMaqamTransposition.descendingPitchClasses.map((pitchClass) => pitchClass.noteName)].reverse();
    let check2p = false;
    let checkSixthNoThird = false;
    let checkSixAscending = false;
    let checkSixDescending = false;
    const shawwaList = [...NoteName_1.octaveOneNoteNames, ...NoteName_1.octaveTwoNoteNames].filter((noteName) => (0, shawwaMapping_1.default)(noteName) !== "/");
    const firstDegreeNoteName = sourceAscendingNotes[0];
    const firstDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === firstDegreeNoteName);
    const secondDegreeNoteName = sourceAscendingNotes[1];
    const secondDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === secondDegreeNoteName);
    const thirdDegreeNoteName = sourceAscendingNotes[2];
    const thirdDegreeCellSIndex = allPitchClasses.findIndex((cd) => cd.noteName === thirdDegreeNoteName);
    let noteName2p = "";
    const numberOfPitchClasses = allPitchClasses.length / 4;
    const slice = allPitchClasses.slice(numberOfPitchClasses, thirdDegreeCellSIndex + 1).reverse();
    for (const pitchClasses of slice) {
        if ((0, shawwaMapping_1.default)(pitchClasses.noteName) === "2p") {
            noteName2p = pitchClasses.noteName;
            const first2pBeforeShawwaIndex = shawwaList.findIndex((noteName) => noteName === noteName2p);
            if (first2pBeforeShawwaIndex - firstDegreeShawwaIndex === 6 && first2pBeforeShawwaIndex - secondDegreeShawwaIndex === 2)
                check2p = true;
            break;
        }
    }
    if ((0, shawwaMapping_1.default)(sourceAscendingNotes[4]) === "n" && (0, shawwaMapping_1.default)(sourceAscendingNotes[6]) === "n")
        checkSixAscending = true;
    if ((0, shawwaMapping_1.default)(sourceDescendingNotes[4]) === "n" && (0, shawwaMapping_1.default)(sourceDescendingNotes[6]) === "n")
        checkSixDescending = true;
    const sixthDegreeNoteName = sourceAscendingNotes[5];
    const sixthDegreeCellSIndex = shawwaList.findIndex((noteName) => noteName === sixthDegreeNoteName);
    if ((sixthDegreeCellSIndex - firstDegreeShawwaIndex === 16 || sixthDegreeCellSIndex - firstDegreeShawwaIndex === 17) && (0, shawwaMapping_1.default)(sixthDegreeNoteName) === "n")
        checkSixthNoThird = true;
    for (const maqamOrJins of ajnasModulationsMode ? allAjnas : allMaqamat) {
        let transpositions = [];
        if (maqamOrJins instanceof Jins_1.default) {
            if (!maqamOrJins.isJinsSelectable(allPitchClasses.map((pitchClass) => pitchClass.noteName)))
                continue;
            const currentNotes = maqamOrJins.getNoteNames();
            transpositions = JSON.stringify(currentNotes) !== JSON.stringify(sourceAscendingNotes) ? [maqamOrJins.getTahlil(allPitchClasses)] : [];
            (0, transpose_1.getJinsTranspositions)(allPitchClasses, maqamOrJins, true, centsTolerance).forEach((jinsTransposition) => {
                if (JSON.stringify(currentNotes) === JSON.stringify(jinsTransposition.jinsPitchClasses.map((pitchClass) => pitchClass.noteName)))
                    return;
                transpositions.push(jinsTransposition);
            });
        }
        else {
            if (!maqamOrJins.isMaqamSelectable(allPitchClasses.map((pitchClass) => pitchClass.noteName)))
                continue;
            const currentAscendingNotes = maqamOrJins.getAscendingNoteNames();
            transpositions = JSON.stringify(currentAscendingNotes) !== JSON.stringify(sourceAscendingNotes) ? [maqamOrJins.getTahlil(allPitchClasses)] : [];
            (0, transpose_1.getMaqamTranspositions)(allPitchClasses, allAjnas, maqamOrJins, true, centsTolerance).forEach((maqamTransposition) => {
                if (JSON.stringify(currentAscendingNotes) === JSON.stringify(maqamTransposition.ascendingPitchClasses.map((pitchClass) => pitchClass.noteName)))
                    return;
                transpositions.push(maqamTransposition);
            });
        }
        for (const transposition of transpositions) {
            let currentAscendingNotes = [];
            if ("ascendingPitchClasses" in transposition) {
                currentAscendingNotes = transposition.ascendingPitchClasses.map((pitchClass) => pitchClass.noteName);
            }
            else {
                currentAscendingNotes = transposition.jinsPitchClasses.map((pitchClass) => pitchClass.noteName);
            }
            if (currentAscendingNotes[0] === sourceAscendingNotes[0])
                modulationsOnOne.push(transposition);
            if (currentAscendingNotes[0] === sourceAscendingNotes[3] && (0, shawwaMapping_1.default)(sourceAscendingNotes[3]) !== "/")
                modulationsOnFour.push(transposition);
            if (currentAscendingNotes[0] === sourceAscendingNotes[4] && (0, shawwaMapping_1.default)(sourceAscendingNotes[4]) !== "/")
                modulationsOnFive.push(transposition);
            if (currentAscendingNotes[0] === sourceAscendingNotes[2] && (0, shawwaMapping_1.default)(sourceAscendingNotes[2]) !== "/")
                modulationsOnThree.push(transposition);
            else if (check2p && currentAscendingNotes[0] === noteName2p)
                modulationsOnThree2p.push(transposition);
            else if (checkSixthNoThird && currentAscendingNotes[0] === sourceAscendingNotes[5])
                modulationsOnSixNoThird.push(transposition);
            if (checkSixAscending && currentAscendingNotes[0] === sourceAscendingNotes[5])
                modulationsOnSixAscending.push(transposition);
            if (checkSixDescending && currentAscendingNotes[0] === sourceDescendingNotes[5])
                modulationsOnSixDescending.push(transposition);
        }
    }
    if (ajnasModulationsMode) {
        return {
            modulationsOnOne,
            modulationsOnThree,
            modulationsOnThree2p: modulationsOnThree.length === 0 ? modulationsOnThree2p : [],
            modulationsOnSixNoThird: modulationsOnThree.length === 0 && modulationsOnThree2p.length === 0 ? modulationsOnThree2p : [],
            modulationsOnFour,
            modulationsOnFive,
            modulationsOnSixAscending,
            modulationsOnSixDescending,
            noteName2p,
        };
    }
    else {
        return {
            modulationsOnOne,
            modulationsOnThree,
            modulationsOnThree2p: modulationsOnThree.length === 0 ? modulationsOnThree2p : [],
            modulationsOnSixNoThird: modulationsOnThree.length === 0 && modulationsOnThree2p.length === 0 ? modulationsOnThree2p : [],
            modulationsOnFour,
            modulationsOnFive,
            modulationsOnSixAscending,
            modulationsOnSixDescending,
            noteName2p,
        };
    }
}
//# sourceMappingURL=modulate.js.map