import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "ajnas.json");

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf-8");
    const ajnas = JSON.parse(fileContents);
    return NextResponse.json(ajnas);
  } catch (error) {
    console.error("Error loading Ajnas:", error);
    return new NextResponse("Failed to load Ajnas.", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedArray = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(updatedArray, null, 2), "utf-8");
    return NextResponse.json({ message: "Ajnas updated successfully." });
  } catch (error) {
    console.error("Error updating Ajnas:", error);
    return new NextResponse("Failed to update Ajnas.", { status: 500 });
  }
}
