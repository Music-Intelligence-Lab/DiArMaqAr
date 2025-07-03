import { NextResponse } from "next/server";
import { generateAndWriteAnalytics } from "@/functions/generate-analytics";

export async function POST() {
  try {
    generateAndWriteAnalytics();
    return NextResponse.json({ success: true, message: "Analytics generated and written successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to generate analytics." }, { status: 500 });
  }
}
