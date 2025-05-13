import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "tuningSystems.json");

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf-8");
    const tuningSystems = JSON.parse(fileContents);
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
