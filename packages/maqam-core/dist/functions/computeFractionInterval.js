"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = computeFractionInterval;
const gcd_1 = __importDefault(require("./gcd"));
function computeFractionInterval(firstFraction, secondFraction) {
    const [a, b] = firstFraction.split("/").map(Number);
    const [c, d] = secondFraction.split("/").map(Number);
    const num = c * b;
    const den = d * a;
    const g = (0, gcd_1.default)(num, den);
    return `${num / g}/${den / g}`;
}
//# sourceMappingURL=computeFractionInterval.js.map