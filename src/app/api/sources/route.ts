import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "sources.json");

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf-8");
    const sources = JSON.parse(fileContents);
    return NextResponse.json(sources);
  } catch (error) {
    console.error("Error loading Sources:", error);
    return new NextResponse("Failed to load Sources.", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedArray = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(updatedArray, null, 2), "utf-8");
    return NextResponse.json({ message: "Sources updated successfully." });
  } catch (error) {
    console.error("Error updating Sources:", error);
    return new NextResponse("Failed to update Sources.", { status: 500 });
  }
}
