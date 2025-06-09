import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import TransliteratedNoteName, {
  octaveOneNoteNames,
  octaveTwoNoteNames,
  TransliteratedNoteNameOctaveOne,
  TransliteratedNoteNameOctaveTwo,
} from "@/models/NoteName";
import getNoteNamesUsedInTuningSystem from "@/functions/getNoteNamesUsedInTuningSystem";

const dataFilePath = path.join(process.cwd(), "data", "tuningSystems.json");
const maqamat = path.join(process.cwd(), "data", "maqamat.json");
const ajnas = path.join(process.cwd(), "data", "ajnas.json");

function mapIndices(notesToMap: TransliteratedNoteName[], numberOfPitchClasses: number) {
  const O1_LEN = octaveOneNoteNames.length;
  const mappedIndices = notesToMap.map((arabicName) => {
    const i1 = octaveOneNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveOne);
    if (i1 >= 0) return i1;

    const i2 = octaveTwoNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveTwo);
    if (i2 >= 0) return O1_LEN + i2;

    return -1;
  });

  while (mappedIndices.length < numberOfPitchClasses) {
    mappedIndices.push(-1);
  }

  if (mappedIndices.length > numberOfPitchClasses) {
    mappedIndices.length = numberOfPitchClasses;
  }

  return mappedIndices;
}
export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf-8");

    const tuningSystems = JSON.parse(fileContents);

    const maqamatContents = await fs.readFile(maqamat, "utf-8");
    const maqamatData = JSON.parse(maqamatContents);

    const ajnasContents = await fs.readFile(ajnas, "utf-8");
    const ajnasData = JSON.parse(ajnasContents);

    for (let i = 0; i < tuningSystems.length; i++) {
      const tuningSystem = tuningSystems[i];

      tuningSystem.possibleMaqamat = [];
      tuningSystem.possibleAjnas = [];

      const numberOfPitchClasses = tuningSystem.pitchClasses.length;

      for (const noteNames of tuningSystem.noteNames) {
        const indices = mapIndices(noteNames.slice(0, numberOfPitchClasses), numberOfPitchClasses);
        const noteNamesUsed = getNoteNamesUsedInTuningSystem(indices);

        const tempMaqamat = [];

        for (const maqam of maqamatData) {
          const ascendingNotes: string[] = maqam.ascendingNoteNames;
          const descendingNotes: string[] = maqam.descendingNoteNames;

          if (
            ascendingNotes.every((note: string) => noteNamesUsed.includes(note)) &&
            descendingNotes.every((note: string) => noteNamesUsed.includes(note))
          ) {
            tempMaqamat.push(maqam.name);
          }
        }

        tuningSystem.possibleMaqamat.push(tempMaqamat);
        const tempAjnas = [];
        for (const jins of ajnasData) {
          const jinsNoteNames = jins.noteNames;
          if (jinsNoteNames.every((note: string) => noteNamesUsed.includes(note))) {
            tempAjnas.push(jins.name);
          }
        }
        tuningSystem.possibleAjnas.push(tempAjnas);
      }
    }

    return NextResponse.json(tuningSystems);
  } catch (error) {
    console.error("Error loading Tuning Systems:", error);
    return new NextResponse("Failed to load Tuning Systems.", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedArray = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(updatedArray, null, 2), "utf-8");
    return NextResponse.json({ message: "Tuning Systems updated successfully." });
  } catch (error) {
    console.error("Error updating Tuning Systems:", error);
    return new NextResponse("Failed to update Tuning Systems.", { status: 500 });
  }
}
