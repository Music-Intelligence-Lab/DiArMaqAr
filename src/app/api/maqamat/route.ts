import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "maqamat.json");

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf-8");
    const maqamat = JSON.parse(fileContents);
    return NextResponse.json(maqamat);
  } catch (error) {
    console.error("Error loading Maqamat:", error);
    return new NextResponse("Failed to load Maqamat.", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedArray = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(updatedArray, null, 2), "utf-8");
    return NextResponse.json({ message: "Maqamat updated successfully." });
  } catch (error) {
    console.error("Error updating Maqamat:", error);
    return new NextResponse("Failed to update Maqamat.", { status: 500 });
  }
}
