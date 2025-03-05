import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "tuningSystems.json");

export async function PUT(request: Request) {
  try {
    const updatedArray = await request.json();

    fs.writeFileSync(dataFilePath, JSON.stringify(updatedArray, null, 2), "utf-8");

    return NextResponse.json({ message: "TuningSystems updated successfully." });
  } catch (error) {
    console.error("Error updating TuningSystems:", error);
    return new NextResponse("Failed to update TuningSystems.", { status: 500 });
  }
}
