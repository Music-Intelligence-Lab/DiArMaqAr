import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "patterns.json");

/**
 * @swagger
 * /api/patterns:
 *   get:
 *     summary: Retrieve all musical patterns
 *     description: Returns a complete collection of musical patterns used in Arabic maqam theory. These patterns include melodic motifs, rhythmic structures, ornamental figures, and compositional frameworks that are fundamental to Arabic musical practice and pedagogy.
 *     tags:
 *       - Patterns
 *     responses:
 *       200:
 *         description: Successfully retrieved patterns data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the pattern
 *                     example: "pattern_samazen_thaqil"
 *                   name:
 *                     type: string
 *                     description: Name of the musical pattern
 *                     example: "Samāʿī Thaqīl"
 *                   category:
 *                     type: string
 *                     description: Category of pattern (rhythmic, melodic, ornamental, formal)
 *                     example: "rhythmic"
 *                   structure:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         element:
 *                           type: string
 *                           description: Pattern element (note, rest, ornament)
 *                         duration:
 *                           type: number
 *                           description: Duration in beats or time units
 *                         emphasis:
 *                           type: string
 *                           description: Emphasis level (strong, weak, medium)
 *                     description: Detailed structure of the pattern
 *                   timeSignature:
 *                     type: string
 *                     description: Time signature for rhythmic patterns
 *                     example: "10/8"
 *                   tempoIndication:
 *                     type: string
 *                     description: Traditional tempo marking
 *                     example: "moderato"
 *                   contextualUsage:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Musical contexts where pattern is used
 *                     example: ["instrumental", "vocal", "improvisational"]
 *                   associatedMaqamat:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Maqamat commonly associated with this pattern
 *                     example: ["maqam_bayati", "maqam_rast"]
 *                   notation:
 *                     type: object
 *                     properties:
 *                       western:
 *                         type: string
 *                         description: Western musical notation representation
 *                       arabic:
 *                         type: string
 *                         description: Arabic musical notation representation
 *                       symbols:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Special symbols or markings
 *                     description: Various notational representations
 *                   culturalSignificance:
 *                     type: string
 *                     description: Cultural or historical importance
 *                   pedagogicalNotes:
 *                     type: string
 *                     description: Educational notes for teaching the pattern
 *                   sourceReferences:
 *                     type: array
 *                     items:
 *                       type: object
 *                     description: Academic sources documenting the pattern
 *                   variations:
 *                     type: array
 *                     items:
 *                       type: object
 *                     description: Common variations of the pattern
 *       500:
 *         description: Server error - failed to load patterns data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to load Patterns."
 */
export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf-8");
    const patterns = JSON.parse(fileContents);
    return NextResponse.json(patterns);
  } catch (error) {
    console.error("Error loading Patterns:", error);
    return new NextResponse("Failed to load Patterns.", { status: 500 });
  }
}

/**
 * @swagger
 * /api/patterns:
 *   put:
 *     summary: Update the complete patterns dataset
 *     description: Replaces the entire patterns collection with new data. This endpoint is used for administrative updates to the musical patterns database, including adding new patterns, updating structural information, and maintaining pedagogical content.
 *     tags:
 *       - Patterns
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
 *                   description: Unique identifier for the pattern
 *                 name:
 *                   type: string
 *                   description: Name of the musical pattern
 *                 category:
 *                   type: string
 *                   description: Category of pattern
 *                 structure:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Detailed pattern structure
 *                 timeSignature:
 *                   type: string
 *                   description: Time signature for rhythmic patterns
 *                 tempoIndication:
 *                   type: string
 *                   description: Traditional tempo marking
 *                 contextualUsage:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Musical contexts for usage
 *                 associatedMaqamat:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Associated maqamat
 *                 notation:
 *                   type: object
 *                   description: Notational representations
 *                 culturalSignificance:
 *                   type: string
 *                   description: Cultural importance
 *                 pedagogicalNotes:
 *                   type: string
 *                   description: Educational notes
 *                 sourceReferences:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Academic source references
 *                 variations:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Pattern variations
 *     responses:
 *       200:
 *         description: Patterns data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patterns updated successfully."
 *       500:
 *         description: Server error - failed to update patterns data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to update Patterns."
 */
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
