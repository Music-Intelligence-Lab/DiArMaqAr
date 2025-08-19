import { NextResponse } from "next/server";
import { generateAndWriteAnalytics } from "@/functions/generate-analytics";

/**
 * @swagger
 * /api/generate-analytics:
 *   post:
 *     summary: Generate and save comprehensive musical analytics
 *     description: Performs extensive analytical computations across the entire maqam theory dataset and writes the results to the analytics.json file. Generates statistical analyses, frequency distributions, intervallic relationships, modulation patterns, and cross-references between maqamat, ajnas, and tuning systems for research and educational purposes.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Analytics generated and saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether analytics generation was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Analytics generated and written successfully."
 *                 generationDetails:
 *                   type: object
 *                   properties:
 *                     totalComputations:
 *                       type: integer
 *                       description: Number of analytical computations performed
 *                     dataCategories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Categories of data analyzed
 *                       example: ["maqamat", "ajnas", "tuning_systems", "modulations"]
 *                     fileSize:
 *                       type: number
 *                       description: Size of generated analytics file in bytes
 *                     analysisTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Types of analyses performed
 *                       example: ["intervallic_patterns", "frequency_analysis", "statistical_summary"]
 *                   description: Details about the analytics generation process
 *       500:
 *         description: Server error during analytics generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether analytics generation failed
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message describing the failure
 *                   example: "Failed to generate analytics."
 *                 error:
 *                   type: string
 *                   description: Detailed error information
 */
export async function POST() {
  try {
    generateAndWriteAnalytics();
    return NextResponse.json({ success: true, message: "Analytics generated and written successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to generate analytics." }, { status: 500 });
  }
}
