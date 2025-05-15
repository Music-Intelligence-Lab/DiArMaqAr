import gcd from "./gcd";

export default function computeRatio(prev: string, next: string) {
  const [a, b] = prev.split("/").map(Number);
  const [c, d] = next.split("/").map(Number);
  const num = c * b;
  const den = d * a;
  const g = gcd(num, den);
  return `${num / g}:${den / g}`;
}
