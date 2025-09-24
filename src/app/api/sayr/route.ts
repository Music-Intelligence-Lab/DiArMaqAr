import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { standardizeText } from "@/functions/export";

const dataFilePath = path.join(process.cwd(), "data", "maqamat.json");


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { maqamId, maqamName, sourceId } = body;

    // Validate input parameters
    const hasMaqamId = maqamId !== undefined && maqamId !== null && maqamId !== "";
    const hasMaqamName = maqamName !== undefined && maqamName !== null && maqamName !== "";
    const hasSourceId = sourceId !== undefined && sourceId !== null && sourceId !== "";

    const identifierCount = [hasMaqamId, hasMaqamName, hasSourceId].filter(Boolean).length;
    
    if (identifierCount === 0) {
      return NextResponse.json(
        { error: "Please provide either maqamId, maqamName, or sourceId" },
        { status: 400 }
      );
    }

    if (identifierCount > 1) {
      return NextResponse.json(
        { error: "Please provide only one of: maqamId, maqamName, or sourceId" },
        { status: 400 }
      );
    }

    // Read the maqamat data
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    const maqamat = JSON.parse(fileContent);

    if (hasMaqamId || hasMaqamName) {
      // Find the specific maqam and return its suyūr
      let maqam;
      
      if (hasMaqamId) {
        maqam = maqamat.find((m: any) => m.id === maqamId);
      } else if (hasMaqamName) {
        maqam = maqamat.find((m: any) => standardizeText(m.name) === standardizeText(maqamName));
      }
      
      if (!maqam) {
        return NextResponse.json(
          { error: "Maqam not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        maqamId: maqam.id,
        maqamName: maqam.name,
        suyūr: maqam.suyūr || []
      });
    }

    if (hasSourceId) {
      // Find all maqams that contain suyūr from the specified source
      const maqamsWithSource = maqamat
        .map((maqam: any) => {
          const suyurFromSource = (maqam.suyūr || []).filter(
            (sayr: any) => sayr.sourceId === sourceId
          );
          
          if (suyurFromSource.length > 0) {
            return {
              maqamId: maqam.id,
              maqamName: maqam.name,
              suyūr: suyurFromSource
            };
          }
          return null;
        })
        .filter((maqam: any) => maqam !== null);

      if (maqamsWithSource.length === 0) {
        return NextResponse.json(
          { error: "No maqams found with suyūr from the specified source" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        sourceId: sourceId,
        maqams: maqamsWithSource
      });
    }

    // This should never be reached due to earlier validation
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error in sayr API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
