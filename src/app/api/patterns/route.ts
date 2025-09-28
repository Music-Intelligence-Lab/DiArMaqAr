import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { handleCorsPreflightRequest, addCorsHeaders } from "../cors";

const dataFilePath = path.join(process.cwd(), "data", "patterns.json");

export const OPTIONS = handleCorsPreflightRequest;

export async function PUT(request: Request) {
  try {
    const updatedArray = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(updatedArray, null, 2), "utf-8");
    const response = NextResponse.json({ message: "Patterns updated successfully." });
    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error updating Patterns:", error);
    const errorResponse = new NextResponse("Failed to update Patterns.", { status: 500 });
    return addCorsHeaders(errorResponse);
  }
}
