import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "ajnas.json");

/**
 * @swagger
 * /api/ajnas:
 *   get:
 *     summary: Retrieve all ajnas (tetrachordal structures)
 *     description: Returns a complete list of ajnas (plural of jins) - the melodic tetrachordal structures that serve as building blocks for maqamat. Each jins contains note names, source references, and theoretical commentary.
 *     tags:
 *       - Ajnas
 *     responses:
 *       200:
 *         description: Successfully retrieved ajnas data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the jins
 *                     example: "1"
 *                   name:
 *                     type: string
 *                     description: Name of the jins
 *                     example: "Bayātī"
 *                   noteNames:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Note names that comprise the jins
 *                     example: ["rāst", "dūgāh", "segāh", "chahārgāh"]
 *                   commentsEnglish:
 *                     type: string
 *                     description: English commentary on the jins
 *                   commentsArabic:
 *                     type: string
 *                     description: Arabic commentary on the jins
 *                   sourcePageReferences:
 *                     type: array
 *                     items:
 *                       type: object
 *                     description: Academic source references
 *       500:
 *         description: Server error - failed to load ajnas data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to load Ajnas."
 */
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

/**
 * @swagger
 * /api/ajnas:
 *   put:
 *     summary: Update the complete ajnas dataset
 *     description: Replaces the entire ajnas collection with new data. This endpoint is used for administrative updates to the ajnas database.
 *     tags:
 *       - Ajnas
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
 *                   description: Unique identifier for the jins
 *                 name:
 *                   type: string
 *                   description: Name of the jins
 *                 noteNames:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Note names that comprise the jins
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
 *         description: Ajnas data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ajnas updated successfully."
 *       500:
 *         description: Server error - failed to update ajnas data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to update Ajnas."
 */
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
