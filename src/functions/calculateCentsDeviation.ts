export default function calculateCentsDeviation(
  currentMidiNumber: number,
  currentCents: string,
  startingMidiNumber: number,
  currentNoteName?: string,
  startingNoteName?: string,
): number {

  // Special note sets that need adjustment
  const d_sharp = [3, 15, 27, 39, 51, 63, 75, 87, 99, 111, 123];
  const g_sharp = [8, 20, 32, 44, 56, 68, 80, 92, 104, 116];
  const a_sharp = [10, 22, 34, 46, 58, 70, 82, 94, 106, 118];
  const special_notes = new Set([...d_sharp, ...g_sharp, ...a_sharp]);

  let roundedCurrent = Math.round(currentMidiNumber);
  let roundedStarting = Math.round(startingMidiNumber);

  // Adjust current note: only add +1 if it's displayed as sharp, not if displayed as flat
  if (currentNoteName) {
    const isFlat = currentNoteName.endsWith('b') && !currentNoteName.includes('-') && !currentNoteName.includes('+');
    if (special_notes.has(roundedCurrent) && !isFlat) {
      roundedCurrent += 1;
    }
  } else if (special_notes.has(roundedCurrent)) {
    // Default behavior when no note name provided
    roundedCurrent += 1;
  }

  // Adjust starting note: only add +1 if it's displayed as sharp, not if displayed as flat
  if (startingNoteName) {
    const isFlat = startingNoteName.endsWith('b') && !startingNoteName.includes('-') && !startingNoteName.includes('+');
    if (special_notes.has(roundedStarting) && !isFlat) {
      roundedStarting += 1;
    }
  } else if (special_notes.has(roundedStarting)) {
    // Default behavior when no note name provided
    roundedStarting += 1;
  }

  return parseFloat(currentCents) - (roundedCurrent - roundedStarting) * 100;
}

