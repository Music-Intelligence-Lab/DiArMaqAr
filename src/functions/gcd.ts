export default function gcd(a: number, b: number): number {
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