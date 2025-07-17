"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allNotes = exports.octaveFourNoteNames = exports.octaveThreeNoteNames = exports.octaveTwoNoteNames = exports.octaveOneNoteNames = exports.octaveZeroNoteNames = void 0;
exports.getNoteNameIndex = getNoteNameIndex;
exports.getNoteNameIndexAndOctave = getNoteNameIndexAndOctave;
exports.getNoteNameFromIndexAndOctave = getNoteNameFromIndexAndOctave;
exports.shiftNoteName = shiftNoteName;
exports.octaveZeroNoteNames = [
    "qarār yegāh",
    "qarār qarār nīm ḥiṣār",
    "qarār shūrī",
    "qarār qarār ḥiṣār",
    "qarār qarār tīk ḥiṣār/shūrī",
    "qarār nīm ʿushayrān",
    "qarār ʿushayrān",
    "qarār nīm ʿajam ʿushayrān",
    "qarār ʿajam ʿushayrān",
    "qarār nairūz",
    "qarār tīk ʿajam ʿushayrān",
    "qarār ʿirāq",
    "qarār rahāwī",
    "qarār nīm kawasht/rahāwī",
    "qarār kawasht",
    "qarār tīk kawasht",
    "qarār rāst",
    "qarār tīk rāst",
    "qarār nīm zirguleh",
    "qarār zirguleh",
    "qarār tīk zirguleh",
    "qarār dūgāh",
    "qarār nīm kurdī/nahāwand",
    "qarār nahāwand",
    "qarār kurdī",
    "qarār tīk kūrdī",
    "qarār segāh",
    "qarār nīm buselīk",
    "qarār buselīk/ʿushshāq",
    "qarār tīk buselīk",
    "qarār chahargāh",
    "qarār tīk chahargāh",
    "qarār nīm ḥijāz",
    "qarār ṣabā",
    "qarār ḥijāz",
    "qarār tīk ḥijāz/ṣabā",
    "nīm yegāh",
];
exports.octaveOneNoteNames = [
    "yegāh", // 0
    "qarār nīm ḥiṣār", // 1
    "shūrī",
    "qarār ḥiṣār", // 3
    "qarār tīk ḥiṣār/shūrī", // 4
    "nīm ʿushayrān",
    "ʿushayrān", //6
    "nīm ʿajam ʿushayrān", // 7
    "ʿajam ʿushayrān", // 8
    "nairūz",
    "tīk ʿajam ʿushayrān",
    "ʿirāq", // 11
    "rahāwī",
    "nīm kawasht", // 13
    "kawasht", // 14
    "tīk kawasht",
    "rāst", // 16
    "tīk rāst",
    "nīm zirguleh", // 18
    "zirguleh", // 19
    "tīk zirguleh", // 20
    "dūgāh", // 21
    "nīm kurdī/nahāwand", // 22
    "nahāwand",
    "kurdī", // 24
    "tīk kūrdī",
    "segāh", // 26
    "nīm buselīk", // 27
    "buselīk/ʿushshāq", // 28
    "tīk buselīk",
    "chahargāh", // 30
    "tīk chahargāh",
    "nīm ḥijāz", // 32
    "ṣabā",
    "ḥijāz", // 34
    "tīk ḥijāz/ṣabā", // 35
    "nīm nawā",
];
exports.octaveTwoNoteNames = [
    "nawā",
    "nīm ḥiṣār",
    "jawāb shūrī",
    "ḥiṣār",
    "tīk ḥiṣār",
    "nīm ḥusaynī",
    "ḥusaynī",
    "nīm ʿajam",
    "ʿajam",
    "jawāb nairūz",
    "tīk ʿajam",
    "awj",
    "jawāb rahāwī",
    "nīm māhūr",
    "māhūr",
    "tīk māhūr",
    "kurdān",
    "tīk kurdān",
    "nīm shahnāz",
    "shahnāz",
    "jawāb tīk zirguleh",
    "muḥayyar",
    "nīm sunbuleh",
    "jawāb nahāwand",
    "sunbuleh/zawāl",
    "jawāb tīk kūrdī",
    "buzurk",
    "jawāb nīm buselīk",
    "jawāb buselīk",
    "jawāb tīk buselīk",
    "mahurān",
    "tīk mahurān",
    "jawāb nīm ḥijāz",
    "jawāb ṣabā",
    "jawāb ḥijāz",
    "jawāb tīk ḥijāz",
    "nīm saham/ramal tūtī",
];
exports.octaveThreeNoteNames = [
    "saham/ramal tūtī",
    "jawāb nīm ḥiṣār",
    "jawāb jawāb shūrī",
    "jawāb ḥiṣār",
    "jawāb tīk ḥiṣār",
    "jawāb nīm ḥusaynī",
    "jawāb ḥusaynī",
    "jawāb nīm ʿajam",
    "jawāb ʿajam",
    "jawāb jawāb nairūz",
    "jawāb tīk ʿajam",
    "jawāb awj",
    "jawāb jawāb rahāwī",
    "jawāb nīm māhūr",
    "jawāb māhūr",
    "jawāb tīk māhūr",
    "jawāb kurdān",
    "jawāb tīk kurdān",
    "jawāb nīm shahnāz",
    "jawāb shahnāz",
    "jawāb jawāb tīk zirguleh",
    "jawāb muḥayyar",
    "jawāb nīm sunbuleh",
    "jawāb jawāb nahāwand",
    "jawāb sunbuleh/zawāl",
    "jawāb jawāb tīk kūrdī",
    "jawāb buzurk",
    "jawāb jawāb nīm buselīk",
    "jawāb jawāb buselīk",
    "jawāb jawāb tīk buselīk",
    "jawāb mahurān",
    "jawāb tīk mahurān",
    "jawāb jawāb nīm ḥijāz",
    "jawāb jawāb ṣabā",
    "jawāb jawāb ḥijāz",
    "jawāb jawāb tīk ḥijāz",
    "jawāb saham/ramal tūtī",
];
exports.octaveFourNoteNames = [
    "jawāb saham/ramal tūtī",
    "jawāb jawāb nīm ḥiṣār",
    "jawāb jawāb jawāb shūrī",
    "jawāb jawāb ḥiṣār",
    "jawāb jawāb tīk ḥiṣār",
    "jawāb jawāb nīm ḥusaynī",
    "jawāb jawāb ḥusaynī",
    "jawāb jawāb nīm ʿajam",
    "jawāb jawāb ʿajam",
    "jawāb jawāb jawāb nairūz",
    "jawāb jawāb tīk ʿajam",
    "jawāb jawāb awj",
    "jawāb jawāb jawāb rahāwī",
    "jawāb jawāb nīm māhūr",
    "jawāb jawāb māhūr",
    "jawāb jawāb tīk māhūr",
    "jawāb jawāb kurdān",
    "jawāb jawāb nīm shahnāz",
    "jawāb jawāb shahnāz",
    "jawāb jawāb jawāb tīk zirguleh",
    "jawāb jawāb muḥayyar",
    "jawāb jawāb nīm sunbuleh",
    "jawāb jawāb jawāb nahāwand",
    "jawāb jawāb sunbuleh/zawāl",
    "jawāb jawāb jawāb tīk kūrdī",
    "jawāb jawāb buzurk",
    "jawāb jawāb jawāb nīm buselīk",
    "jawāb jawāb jawāb buselīk",
    "jawāb jawāb jawāb tīk buselīk",
    "jawāb jawāb mahurān",
    "jawāb jawāb tīk mahurān",
    "jawāb jawāb jawāb nīm ḥijāz",
    "jawāb jawāb jawāb ṣabā",
    "jawāb jawāb jawāb ḥijāz",
    "jawāb jawāb jawāb tīk ḥijāz",
    "jawāb jawāb saham/ramal tūtī",
];
exports.allNotes = [
    ...new Set([...exports.octaveZeroNoteNames, ...exports.octaveOneNoteNames, ...exports.octaveTwoNoteNames, ...exports.octaveThreeNoteNames, ...exports.octaveFourNoteNames]),
];
function getNoteNameIndex(noteName) {
    return exports.allNotes.indexOf(noteName);
}
function getNoteNameIndexAndOctave(noteName) {
    if (exports.octaveZeroNoteNames.includes(noteName))
        return { octave: 0, index: exports.octaveZeroNoteNames.indexOf(noteName) };
    if (exports.octaveOneNoteNames.includes(noteName))
        return { octave: 1, index: exports.octaveOneNoteNames.indexOf(noteName) };
    if (exports.octaveTwoNoteNames.includes(noteName))
        return { octave: 2, index: exports.octaveTwoNoteNames.indexOf(noteName) };
    if (exports.octaveThreeNoteNames.includes(noteName))
        return { octave: 3, index: exports.octaveThreeNoteNames.indexOf(noteName) };
    if (exports.octaveFourNoteNames.includes(noteName))
        return { octave: 4, index: exports.octaveFourNoteNames.indexOf(noteName) };
    return { index: -1, octave: -1 };
}
function getNoteNameFromIndexAndOctave(cell) {
    const { octave, index } = cell;
    if (octave === 0)
        return exports.octaveZeroNoteNames[index];
    else if (octave === 1)
        return exports.octaveOneNoteNames[index];
    else if (octave === 2)
        return exports.octaveTwoNoteNames[index];
    else if (octave === 3)
        return exports.octaveThreeNoteNames[index];
    else if (octave === 4)
        return exports.octaveFourNoteNames[index];
    else
        return "none";
}
function shiftNoteName(noteName, shift) {
    const { index, octave } = getNoteNameIndexAndOctave(noteName);
    return getNoteNameFromIndexAndOctave({
        index,
        octave: octave + shift,
    });
}
//# sourceMappingURL=NoteName.js.map