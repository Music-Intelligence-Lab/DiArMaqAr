import { NextResponse } from "next/server";
import { standardizeText } from "@/functions/export";

/**
 * A transposed idName in the path names a tonic of its own:
 * /maqamat/maqam_rast_al_nawa is maqām rāst on nawā. This reconciles that tonic
 * with the query parameter that also names one — transposeTo, or
 * transpositionNoteName on the availability routes.
 *
 * Either may be given alone. Given together they must agree: a disagreement is
 * a 400, never a silent choice of one over the other. An empty parameter is
 * passed through untouched so the route's own empty-string check rejects it.
 */
export function mergePathTonic(
  pathId: string,
  pathTonic: string | undefined,
  paramName: string,
  paramValue: string | null
): { tonic: string | null; error?: undefined } | { tonic?: undefined; error: NextResponse } {
  if (!pathTonic) return { tonic: paramValue };
  if (paramValue === null) return { tonic: pathTonic };
  if (paramValue.trim() === "") return { tonic: paramValue };
  if (standardizeText(paramValue) === pathTonic) return { tonic: pathTonic };

  return {
    error: NextResponse.json(
      {
        error: `Conflicting tonics: '${pathId}' names the tonic '${pathTonic}', but ${paramName}=${paramValue}`,
        hint: `Name the tonic once: either the transposed idName in the path, or the base idName with ${paramName}.`,
      },
      { status: 400 }
    ),
  };
}

/**
 * For routes about a maqām or jins as a whole (its transpositions list), a
 * transposed idName in the path names more than the route can use. Rejecting it
 * says so, rather than quietly dropping the tonic.
 */
export function rejectPathTonic(pathId: string, pathTonic: string | undefined, baseIdName: string, route: string): NextResponse | null {
  if (!pathTonic) return null;

  return NextResponse.json(
    {
      error: `'${pathId}' names one transposition, but /${route} covers every transposition`,
      hint: `Use the base idName: /api/${route.replace("{idName}", baseIdName)}`,
    },
    { status: 400 }
  );
}
