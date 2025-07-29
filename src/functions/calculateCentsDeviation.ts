export default function calculateCentsDeviation(
  currentMidiNumber: number,
  currentCents: string,
  startingMidiNumber: number,
): number {

  // Special note sets
  const d_sharp = [3, 15, 27, 39, 51, 63, 75, 87, 99, 111, 123];
  const g_sharp = [8, 20, 32, 44, 56, 68, 80, 92, 104, 116];
  const a_sharp = [10, 22, 34, 46, 58, 70, 82, 94, 106, 118];
  const special_notes = new Set([...d_sharp, ...g_sharp, ...a_sharp]);


  let roundedCurrent = Math.round(currentMidiNumber);
  let roundedStarting = Math.round(startingMidiNumber);

  if (special_notes.has(roundedCurrent)) {
    roundedCurrent += 1;
  }

  if (special_notes.has(roundedStarting)) {
    roundedStarting += 1;
  }

  return parseFloat(currentCents) - (roundedCurrent - roundedStarting) * 100;
}

