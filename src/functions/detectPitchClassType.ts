export default function detectPitchClassType(values: string[]): "fraction" | "cents" | "decimal" | "stringLength" | "unknown" {
  /*
    Basic approach:
    - If all lines match fraction pattern (e.g. "3/2", "4:3"), call it "fraction".
    - If all lines are numeric < 1200 and ascending, call it "cents".
    - If all lines are numeric >=1.0 and <2.0 and ascending, call it "decimal".
    - If all lines are numeric and descending, call it "stringLength".
    - Otherwise, return "unknown".
  */

  if (!values.length) return "unknown";

  // Trim & filter out empties
  const cleaned = values.map((v) => v.trim()).filter((v) => v !== "");
  if (!cleaned.length) return "unknown";

  // fraction check:
  const fractionRegex = /^[1-9]\d*[/:][1-9]\d*$/;
  const allFractions = cleaned.every((val) => fractionRegex.test(val));
  if (allFractions) return "fraction";

  // parse numeric
  const numericVals = cleaned.map(Number);
  if (numericVals.some(isNaN)) return "unknown";

  // check ascending or descending
  const ascending = numericVals.every((val, i, arr) => (i === 0 ? true : val >= arr[i - 1]));
  const descending = numericVals.every((val, i, arr) => (i === 0 ? true : val <= arr[i - 1]));

  // check cents
  if (ascending && numericVals.every((v) => v >= 0 && v < 1200)) {
    return "cents";
  }

  // check decimal ratio
  if (ascending && numericVals.every((v) => v >= 1.0 && v < 2.0)) {
    return "decimal";
  }

  // check string length
  if (descending) {
    // Very simplistic test for string length
    return "stringLength";
  }

  return "unknown";
}
