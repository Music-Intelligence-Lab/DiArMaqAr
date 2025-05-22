import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "patterns.json");

export async function PUT(request: Request) {
  try {
    const updatedArray = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(updatedArray, null, 2), "utf-8");
    return NextResponse.json({ message: "Patterns updated successfully." });
  } catch (error) {
    console.error("Error updating Patterns:", error);
    return new NextResponse("Failed to update Patterns.", { status: 500 });
  }
}
