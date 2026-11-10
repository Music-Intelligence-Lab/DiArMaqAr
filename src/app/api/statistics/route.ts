import { NextResponse } from "next/server";
import { getStatistics } from "@/functions/getStatistics";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { buildLinksNamespace, getCanonicalSelfUrl } from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

export const dynamic = "force-dynamic";

/**
 * GET /api/statistics
 *
 * What the archive holds, and for every tuning system on every starting note:
 * how many ajnās and maqāmāt it can build, their transpositions (taṣwīr) and
 * octave renderings, and the modulations from each kind of maqām form.
 *
 * The numbers are computed before each deploy (npm run generate-statistics),
 * not per request: they take about a minute.
 */
export async function GET(request: Request) {
  try {
    const { dataFingerprint, generatedAt, archive, tuningSystems } = getStatistics();
    const data = tuningSystems.map((row) => ({
      ...row,
      links: buildLinksNamespace({
        maqamat: `/api/tuning-systems/${row.tuningSystem.idName}/${row.startingNote.idName}/maqamat`,
        ajnas: `/api/tuning-systems/${row.tuningSystem.idName}/${row.startingNote.idName}/ajnas`,
      }),
    }));
    return addCorsHeaders(
      NextResponse.json({
        dataFingerprint,
        generatedAt,
        archive,
        count: data.length,
        data,
        links: buildLinksNamespace({ self: getCanonicalSelfUrl(request) }),
      })
    );
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return addCorsHeaders(NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 }));
  }
}
