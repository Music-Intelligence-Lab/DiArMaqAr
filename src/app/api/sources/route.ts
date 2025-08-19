import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "sources.json");

/**
 * @swagger
 * /api/sources:
 *   get:
 *     summary: Retrieve all academic sources
 *     description: Returns a complete list of academic sources and references used in the maqam theory database. These sources provide scholarly foundation for the theoretical content, including historical treatises, modern analyses, and ethnomusicological studies.
 *     tags:
 *       - Sources
 *     responses:
 *       200:
 *         description: Successfully retrieved sources data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the source
 *                     example: "source_powers_2005"
 *                   title:
 *                     type: string
 *                     description: Full title of the academic work
 *                     example: "A Taxonomy of Middle Eastern Music"
 *                   author:
 *                     type: string
 *                     description: Author(s) of the source
 *                     example: "Powers, Harold S."
 *                   publicationYear:
 *                     type: integer
 *                     description: Year of publication
 *                     example: 2005
 *                   publisher:
 *                     type: string
 *                     description: Publishing house or institution
 *                     example: "Cambridge University Press"
 *                   publicationType:
 *                     type: string
 *                     description: Type of publication (book, article, dissertation, etc.)
 *                     example: "book"
 *                   pages:
 *                     type: string
 *                     description: Relevant page numbers or page range
 *                     example: "245-267"
 *                   isbn:
 *                     type: string
 *                     description: ISBN for books
 *                   doi:
 *                     type: string
 *                     description: Digital Object Identifier for academic articles
 *                   url:
 *                     type: string
 *                     description: Online access URL if available
 *                   language:
 *                     type: string
 *                     description: Language of the source
 *                     example: "English"
 *                   abstract:
 *                     type: string
 *                     description: Brief abstract or summary
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Subject keywords for categorization
 *                     example: ["maqam", "modal theory", "Arabic music"]
 *                   citationFormat:
 *                     type: object
 *                     properties:
 *                       apa:
 *                         type: string
 *                         description: APA style citation
 *                       chicago:
 *                         type: string
 *                         description: Chicago style citation
 *                       mla:
 *                         type: string
 *                         description: MLA style citation
 *                     description: Pre-formatted citations in various academic styles
 *       500:
 *         description: Server error - failed to load sources data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to load Sources."
 */
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

/**
 * @swagger
 * /api/sources:
 *   put:
 *     summary: Update the complete sources dataset
 *     description: Replaces the entire sources collection with new data. This endpoint is used for administrative updates to the academic sources database, including adding new references, updating bibliographic information, and maintaining citation accuracy.
 *     tags:
 *       - Sources
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
 *                   description: Unique identifier for the source
 *                 title:
 *                   type: string
 *                   description: Full title of the academic work
 *                 author:
 *                   type: string
 *                   description: Author(s) of the source
 *                 publicationYear:
 *                   type: integer
 *                   description: Year of publication
 *                 publisher:
 *                   type: string
 *                   description: Publishing house or institution
 *                 publicationType:
 *                   type: string
 *                   description: Type of publication
 *                 pages:
 *                   type: string
 *                   description: Page numbers or range
 *                 isbn:
 *                   type: string
 *                   description: ISBN for books
 *                 doi:
 *                   type: string
 *                   description: Digital Object Identifier
 *                 url:
 *                   type: string
 *                   description: Online access URL
 *                 language:
 *                   type: string
 *                   description: Language of the source
 *                 abstract:
 *                   type: string
 *                   description: Brief abstract or summary
 *                 keywords:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Subject keywords
 *                 citationFormat:
 *                   type: object
 *                   description: Pre-formatted citations in various styles
 *     responses:
 *       200:
 *         description: Sources data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sources updated successfully."
 *       500:
 *         description: Server error - failed to update sources data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to update Sources."
 */
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
