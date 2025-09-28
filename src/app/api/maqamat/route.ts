import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { handleCorsPreflightRequest, addCorsHeaders } from "../cors";

const dataFilePath = path.join(process.cwd(), "data", "maqamat.json");

// Handle CORS preflight requests
export async function OPTIONS() {
  return handleCorsPreflightRequest();
}

/**
 * @swagger
 * /api/maqamat:
 *   get:
 *     summary: Retrieve all maqamat (melodic modes)
 *     description: Returns a complete list of maqamat - the complete modal structures in Arabic music theory. Each maqam contains ascending and descending note sequences, suyur (melodic pathways), and source references.
 *     tags:
 *       - Maqamat
 *     responses:
 *       200:
 *         description: Successfully retrieved maqamat data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the maqam
 *                     example: "1"
 *                   name:
 *                     type: string
 *                     description: Name of the maqam
 *                     example: "Bayātī"
 *                   ascendingNoteNames:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Note names for ascending sequence (suʿūd)
 *                     example: ["rāst", "dūgāh", "segāh", "chahārgāh", "nawā", "husaynī", "ʿajam", "gerdāniye"]
 *                   descendingNoteNames:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Note names for descending sequence (hubūṭ)
 *                     example: ["gerdāniye", "ʿajam", "husaynī", "nawā", "chahārgāh", "segāh", "dūgāh", "rāst"]
 *                   suyūr:
 *                     type: array
 *                     items:
 *                       type: object
 *                     description: Melodic development pathways (suyūr) for performance practice
 *                   commentsEnglish:
 *                     type: string
 *                     description: English commentary on the maqam
 *                   commentsArabic:
 *                     type: string
 *                     description: Arabic commentary on the maqam
 *                   sourcePageReferences:
 *                     type: array
 *                     items:
 *                       type: object
 *                     description: Academic source references
 *       500:
 *         description: Server error - failed to load maqamat data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to load Maqamat."
 */
export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf-8");
    const maqamat = JSON.parse(fileContents);
    const response = NextResponse.json(maqamat);
    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error loading Maqamat:", error);
    const errorResponse = new NextResponse("Failed to load Maqamat.", { status: 500 });
    return addCorsHeaders(errorResponse);
  }
}

/**
 * @swagger
 * /api/maqamat:
 *   put:
 *     summary: Update the complete maqamat dataset
 *     description: Replaces the entire maqamat collection with new data. This endpoint is used for administrative updates to the maqamat database.
 *     tags:
 *       - Maqamat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the maqam
 *                 name:
 *                   type: string
 *                   description: Name of the maqam
 *                 ascendingNoteNames:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Note names for ascending sequence
 *                 descendingNoteNames:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Note names for descending sequence
 *                 suyūr:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Melodic development pathways
 *                 commentsEnglish:
 *                   type: string
 *                   description: English commentary
 *                 commentsArabic:
 *                   type: string
 *                   description: Arabic commentary
 *                 sourcePageReferences:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Academic source references
 *     responses:
 *       200:
 *         description: Maqamat data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Maqamat updated successfully."
 *       500:
 *         description: Server error - failed to update maqamat data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to update Maqamat."
 */
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
