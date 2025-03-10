export function fractionToDecimal(frac: string) {
  // frac might be "3/2" or "4:3"
  const [num, den] = frac.split(/[:/]/).map(Number);
  return num / den;
}

export function decimalToFraction(decimal: number) {
  // naive approach to best fraction within denominators up to some bound
  let bestNum = 1;
  let bestDen = 1;
  let minError = Math.abs(decimal - bestNum / bestDen);
  for (let d = 1; d <= 64; d++) {
    const n = Math.round(decimal * d);
    const error = Math.abs(decimal - n / d);
    if (error < minError) {
      minError = error;
      bestNum = n;
      bestDen = d;
    }
  }
  return `${bestNum}/${bestDen}`;
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
      const dec = fractionToDecimal(originalValue);
      fractionVal = originalValue;
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
      // ratio = (stringLength / thisValue)
      const slVal = parseFloat(originalValue);
      const ratio = stringLength / slVal;
      decimalVal = ratio;
      fractionVal = decimalToFraction(ratio);
      centsVal = 1200 * Math.log2(ratio);
      stringLenVal = slVal;
      freqVal = referenceFrequency * ratio;
    }
    // Round/truncate as you prefer:
    return {
      fraction: fractionVal,
      decimal: decimalVal.toFixed(3),
      cents: centsVal.toFixed(2),
      stringLength: stringLenVal.toFixed(2),
      frequency: freqVal.toFixed(2),
    };
  } catch {
    // If any parse error
    return null;
  }
}