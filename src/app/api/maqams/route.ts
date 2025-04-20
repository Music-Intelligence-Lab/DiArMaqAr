import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "maqamamat.json");

export async function PUT(request: Request) {
  try {
    const updatedArray = await request.json();

    fs.writeFileSync(dataFilePath, JSON.stringify(updatedArray, null, 2), "utf-8");

    return NextResponse.json({ message: "Maqamamat updated successfully." });
  } catch (error) {
    console.error("Error updating Maqamamat:", error);
    return new NextResponse("Failed to update Maqamamat.", { status: 500 });
  }
}
