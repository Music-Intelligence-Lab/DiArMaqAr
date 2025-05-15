import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "tuningSystems.json");
const maqamat = path.join(process.cwd(), "data", "maqamat.json");
const ajnas = path.join(process.cwd(), "data", "ajnas.json");

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

      tuningSystem.maqamat = [];
      tuningSystem.ajnas = [];

      for (const noteNames of tuningSystem.noteNames) {
        const tempMaqamat = [];
        for (const maqam of maqamatData) {
          const ascendingNotes: string[] = maqam.ascendingNoteNames;
          const descendingNotes: string[] = maqam.descendingNoteNames;

          if (ascendingNotes.every((note: string) => noteNames.includes(note)) && descendingNotes.every((note: string) => noteNames.includes(note))) {
            tempMaqamat.push(maqam.name);
          }
        }

        tuningSystem.maqamat.push(tempMaqamat);
        const tempAjnas = [];
        for (const jins of ajnasData) {
          const jinsNoteNames = jins.noteNames;
          if (jinsNoteNames.every((note: string) => noteNames.includes(note))) {
            tempAjnas.push(jins.name);
          }
        }
        tuningSystem.ajnas.push(tempAjnas);
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
