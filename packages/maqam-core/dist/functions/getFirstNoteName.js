"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getFirstNoteName;
const NoteName_1 = require("../models/NoteName");
function getFirstNoteName(selectedIndices) {
    if (selectedIndices.length === 0)
        return "none";
    const idx = selectedIndices[0];
    if (idx < 0)
        return "none";
    return NoteName_1.octaveOneNoteNames[idx];
}
//# sourceMappingURL=getFirstNoteName.js.map