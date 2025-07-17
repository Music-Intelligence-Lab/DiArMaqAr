"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = gcd;
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    const EPS = 1e-10;
    while (b > EPS) {
        const t = a % b;
        a = b;
        b = t;
    }
    return a;
}
//# sourceMappingURL=gcd.js.map