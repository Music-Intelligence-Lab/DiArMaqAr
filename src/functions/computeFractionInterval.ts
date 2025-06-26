import gcd from "./gcd";

export default function computeFractionInterval(firstFraction: string, secondFraction: string) {
  const [a, b] = firstFraction.split("/").map(Number);
  const [c, d] = secondFraction.split("/").map(Number);
  const num = c * b;
  const den = d * a;
  const g = gcd(num, den);
  return `${num / g}/${den / g}`;
}
