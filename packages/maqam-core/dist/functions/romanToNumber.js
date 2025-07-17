"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = romanToNumber;
function romanToNumber(r) {
    const map = {
        I: 1,
        II: 2,
        III: 3,
        IV: 4,
        V: 5,
        VI: 6,
        VII: 7,
        VIII: 8,
        IX: 9,
        X: 10,
        XI: 11,
        XII: 12,
    };
    if (r.startsWith("+") || r.startsWith("-"))
        return map[r.slice(1)] ?? 0;
    return map[r] ?? 0;
}
//# sourceMappingURL=romanToNumber.js.map