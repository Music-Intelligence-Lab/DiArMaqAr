function gcd(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function decimalToFraction(decimal: number) {
  let bestNumerator = 1;
  let bestDenominator = 1;
  let minError = Math.abs(decimal - bestNumerator / bestDenominator);

  for (let d = 1; d <= 99; d++) {
    const n = Math.round(decimal * d);
    const error = Math.abs(decimal - n / d);
    if (error < minError) {
      minError = error;
      bestNumerator = n;
      bestDenominator = d;
    }
  }

  const gcdValue = gcd(bestNumerator, bestDenominator);
  return `${bestNumerator / gcdValue}/${bestDenominator / gcdValue}`;
}

export default function convertPitchClass(
  originalValue: string,
  inputType: "fraction" | "cents" | "decimal" | "stringLength",
  stringLength: number,
  referenceFrequency: number
) {
  // Return an object with fraction, decimal, cents, stringLength, frequency
  // or null if parsing fails
  let fractionVal = "";
  let decimalVal = 0;
  let centsVal = 0;
  let stringLenVal = 0;
  let freqVal = 0;

  try {
    if (inputType === "fraction") {
      const [num, denom] = originalValue.split("/").map(Number);
      if (isNaN(num) || isNaN(denom) || denom === 0) return null;
      fractionVal = originalValue;

      const dec = num / denom;
      decimalVal = dec;
      centsVal = 1200 * Math.log2(dec);
      stringLenVal = stringLength / dec;
      freqVal = referenceFrequency * dec;
    } else if (inputType === "cents") {
      const c = parseFloat(originalValue);
      centsVal = c;

      decimalVal = Math.pow(2, c / 1200);
      fractionVal = decimalToFraction(decimalVal);
      stringLenVal = stringLength / decimalVal;
      freqVal = referenceFrequency * decimalVal;
    } else if (inputType === "decimal") {
      const dec = parseFloat(originalValue);
      decimalVal = dec;

      fractionVal = decimalToFraction(dec);
      centsVal = 1200 * Math.log2(dec);
      stringLenVal = stringLength / dec;
      freqVal = referenceFrequency * dec;
    } else if (inputType === "stringLength") {
      const slVal = parseFloat(originalValue);
      stringLenVal = slVal;

      const ratio = stringLength / slVal;
      decimalVal = ratio;
      if (ratio <= 0 || !isFinite(ratio)) return null;

      fractionVal = decimalToFraction(ratio);
      centsVal = 1200 * Math.log2(ratio);
      freqVal = referenceFrequency * ratio;
    }
    return {
      fraction: fractionVal,
      decimal: decimalVal.toFixed(3),
      cents: centsVal.toFixed(2),
      stringLength: stringLenVal.toFixed(2),
      frequency: freqVal.toFixed(2),
    };
  } catch {
    return null;
  }
}

export function shiftPitchClass(
  baseValue: string,
  inputType: "fraction" | "decimal" | "cents" | "stringLength",
  targetOctave: 0 | 1 | 2 | 3
): string {
  if (targetOctave === 1) return baseValue;

  // We'll figure out how many 12-semitone steps from octave 1:
  //   octave0 => -12 semitones
  //   octave1 => 0 semitones
  //   octave2 => +12 semitones
  //   octave3 => +24 semitones
  const octaveSteps = targetOctave - 1; // e.g. 0 => -1, 2 => 1, 3 => 2

  try {
    if (inputType === "fraction") {
      const [num, den] = baseValue.split(/[:/]/).map(Number);
      if (!den || isNaN(num) || isNaN(den)) return baseValue;

      let newNum = num * Math.pow(2, octaveSteps);
      let newDen = den;

      // Ensure values are integers (handle negative octaveSteps with division)
      if (octaveSteps < 0) {
        const divisor = Math.pow(2, -octaveSteps);
        newDen = den * divisor;
        newNum = num;
      }

      const g = gcd(newNum, newDen);
      return `${newNum / g}/${newDen / g}`;
    } else if (inputType === "decimal") {
      // decimal => just multiply by 2^(octaveSteps)
      const dec = parseFloat(baseValue);
      const shifted = dec * Math.pow(2, octaveSteps);
      return shifted.toFixed(4); // or as many decimals as you want
    } else if (inputType === "cents") {
      // cents => just add 1200 * octaveSteps
      const c = parseFloat(baseValue);
      const shifted = c + 1200 * octaveSteps;
      return shifted.toFixed(2);
    } else if (inputType === "stringLength") {
      // stringLength => / 2^(octaveSteps),
      // because going UP an octave means frequency *2 => stringLength /2
      // so for an octaveSteps of +1 => /2, for +2 => /4, for -1 => *2, etc.
      const slVal = parseFloat(baseValue);
      const multiplier = Math.pow(2, -octaveSteps);
      // e.g. if octaveSteps=1 => multiplier=1/2
      const shifted = slVal * multiplier;
      return shifted.toFixed(2);
    }
  } catch (err) {
    console.error("Error shifting pitch class:", err);
    return baseValue; // fallback
  }

  return baseValue;
}