"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = camelCaseToWord;
function camelCaseToWord(input) {
    return input
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}
//# sourceMappingURL=camelCaseToWord.js.map