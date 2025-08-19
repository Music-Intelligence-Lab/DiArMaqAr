import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import NoteName, {
  octaveOneNoteNames,
  octaveTwoNoteNames,
  TransliteratedNoteNameOctaveOne,
  TransliteratedNoteNameOctaveTwo,
} from "@/models/NoteName";
import getNoteNamesUsedInTuningSystem from "@/functions/getNoteNamesUsedInTuningSystem";

const dataFilePath = path.join(process.cwd(), "data", "tuningSystems.json");
const maqamat = path.join(process.cwd(), "data", "maqamat.json");
const ajnas = path.join(process.cwd(), "data", "ajnas.json");

/**
 * @swagger
 * /api/tuningSystems:
 *   get:
 *     summary: Retrieve all tuning systems
 *     description: Returns a complete list of tuning systems used in Arabic music. Each tuning system defines the microtonal pitch relationships and frequency ratios for specific musical scales and theoretical frameworks.
 *     tags:
 *       - Tuning Systems
 *     responses:
 *       200:
 *         description: Successfully retrieved tuning systems data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the tuning system
 *                     example: "Ronzevalle-(1904)-ModernistArabicTuning"
 *                   name:
 *                     type: string
 *                     description: Name of the tuning system
 *                     example: "24-Tone Equal Temperament"
 *                   pitchClasses:
 *                     type: array
 *                     items:
 *                       type: object
 *                     description: Array of pitch classes with frequency ratios and note names
 *                   description:
 *                     type: string
 *                     description: Detailed description of the tuning system
 *                   octaveDivisions:
 *                     type: number
 *                     description: Number of divisions per octave
 *                     example: 24
 *                   centsPerStep:
 *                     type: number
 *                     description: Cents interval between consecutive steps
 *                     example: 50
 *                   commentsEnglish:
 *                     type: string
 *                     description: English commentary on the tuning system
 *                   commentsArabic:
 *                     type: string
 *                     description: Arabic commentary on the tuning system
 *                   sourcePageReferences:
 *                     type: array
 *                     items:
 *                       type: object
 *                     description: Academic source references
 *       500:
 *         description: Server error - failed to load tuning systems data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to load Tuning Systems."
 */
function mapIndices(notesToMap: NoteName[], numberOfPitchClasses: number) {
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

      const numberOfPitchClasses = tuningSystem.tuningSystemPitchClasses.length;

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

/**
 * @swagger
 * /api/tuningSystems:
 *   put:
 *     summary: Update the complete tuning systems dataset
 *     description: Replaces the entire tuning systems collection with new data. This endpoint is used for administrative updates to the tuning systems database, including modifications to frequency ratios and pitch class definitions.
 *     tags:
 *       - Tuning Systems
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the tuning system
 *                 name:
 *                   type: string
 *                   description: Name of the tuning system
 *                 pitchClasses:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Array of pitch classes with frequency ratios
 *                 description:
 *                   type: string
 *                   description: Detailed description of the tuning system
 *                 octaveDivisions:
 *                   type: number
 *                   description: Number of divisions per octave
 *                 centsPerStep:
 *                   type: number
 *                   description: Cents interval between steps
 *                 commentsEnglish:
 *                   type: string
 *                   description: English commentary
 *                 commentsArabic:
 *                   type: string
 *                   description: Arabic commentary
 *                 sourcePageReferences:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Academic source references
 *     responses:
 *       200:
 *         description: Tuning systems data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tuning Systems updated successfully."
 *       500:
 *         description: Server error - failed to update tuning systems data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to update Tuning Systems."
 */
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
