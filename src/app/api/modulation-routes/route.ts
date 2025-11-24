import { NextResponse } from "next/server";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { standardizeText } from "@/functions/export";
import { findModulationRoutes } from "@/functions/findModulationRoutes";
import { getTuningSystems } from "@/functions/import";
import { parseInArabic, getNoteNameDisplayAr, getMaqamNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import { ModulationWaypoint, MaqamNode, ModulationJourney } from "@/models/ModulationRoute";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/modulation-routes
 *
 * Finds possible modulation routes between maqamat, like a musical GPS.
 * Returns shortest paths with optional waypoints and return-to-start functionality.
 *
 * REQUIRED Query Parameters:
 * - tuningSystem: ID of tuning system
 * - startingNote: Starting note for the tuning system (URL-friendly)
 * - fromMaqam: Source maqam ID
 * - toMaqam: Target maqam ID
 * - maxHops: Maximum number of modulation steps allowed (required safeguard)
 *
 * OPTIONAL Query Parameters:
 * - fromTonic: Specific tonic for source maqam (URL-friendly)
 * - toTonic: Specific tonic for target maqam (URL-friendly)
 * - waypoints: Comma-separated maqam:tonic pairs (e.g., "maqam_bayyat:dugah,maqam_saba")
 * - returnToStart: true|false - Calculate return path (default: false)
 * - limit: Maximum routes to return (default: 10)
 * - includeArabic: true|false - Include Arabic display names (default: false)
 *
 * Response includes:
 * - routes.count: Number of routes found
 * - routes.data: Array of ModulationJourney objects
 * - context: Request metadata and constraints
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse parameters
    const tuningSystemId = searchParams.get("tuningSystem");
    const startingNote = searchParams.get("startingNote");
    const fromMaqamId = searchParams.get("fromMaqam");
    const fromTonicId = searchParams.get("fromTonic");
    const toMaqamId = searchParams.get("toMaqam");
    const toTonicId = searchParams.get("toTonic");
    const waypointsParam = searchParams.get("waypoints");
    const maxHopsParam = searchParams.get("maxHops");
    const returnToStart = searchParams.get("returnToStart") === "true";
    const limitParam = searchParams.get("limit");

    // Parse includeArabic parameter
    let inArabic = false;
    try {
      inArabic = parseInArabic(searchParams);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Invalid includeArabic parameter",
            hint: "Use ?includeArabic=true or ?includeArabic=false",
          },
          { status: 400 }
        )
      );
    }

    // Validate required parameters
    if (!tuningSystemId || tuningSystemId.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "tuningSystem parameter is required",
            hint: "Add ?tuningSystem=<id> to your request. Use /api/tuning-systems to see available options.",
          },
          { status: 400 }
        )
      );
    }

    if (!startingNote || startingNote.trim() === "") {
      const tuningSystems = getTuningSystems();
      const tuningSystem = tuningSystems.find((ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemId));
      const validOptions = tuningSystem
        ? tuningSystem.getNoteNameSets().map((set) => set[0])
        : [];

      return addCorsHeaders(
        NextResponse.json(
          {
            error: "startingNote parameter is required",
            message: "A tuning system starting note must be specified. This is mandatory for all pitch class calculations.",
            validOptions,
            hint: validOptions.length > 0
              ? `Add &startingNote=${standardizeText(validOptions[0])} to your request`
              : "Add &startingNote=<note> to your request",
          },
          { status: 400 }
        )
      );
    }

    if (!fromMaqamId || fromMaqamId.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "fromMaqam parameter is required",
            hint: "Specify the source maqam ID, e.g., ?fromMaqam=maqam_rast",
          },
          { status: 400 }
        )
      );
    }

    if (!toMaqamId || toMaqamId.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "toMaqam parameter is required",
            hint: "Specify the target maqam ID, e.g., ?toMaqam=maqam_hijaz",
          },
          { status: 400 }
        )
      );
    }

    if (!maxHopsParam || maxHopsParam.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "maxHops parameter is required",
            message: "maxHops is required to prevent combinatorial explosion in route calculation.",
            hint: "Add &maxHops=5 to your request. Recommended values: 3-7 for most use cases.",
          },
          { status: 400 }
        )
      );
    }

    const maxHops = parseInt(maxHopsParam, 10);
    if (isNaN(maxHops) || maxHops < 1) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "maxHops must be a positive integer",
            hint: "Use values like maxHops=3, maxHops=5, etc.",
          },
          { status: 400 }
        )
      );
    }

    if (maxHops > 10) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "maxHops cannot exceed 10",
            message: "Higher values may cause performance issues. Most musical modulation sequences are 2-4 hops.",
            hint: "Use maxHops=10 or lower",
          },
          { status: 400 }
        )
      );
    }

    // Parse limit
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    if (isNaN(limit) || limit < 1) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "limit must be a positive integer",
            hint: "Use values like limit=10, limit=20, etc.",
          },
          { status: 400 }
        )
      );
    }

    // Parse waypoints
    const waypoints: ModulationWaypoint[] = [];
    if (waypointsParam && waypointsParam.trim() !== "") {
      const waypointStrings = waypointsParam.split(",");

      for (const wp of waypointStrings) {
        const trimmed = wp.trim();
        if (!trimmed) continue;

        // Parse "maqamId:tonicId" or just "maqamId"
        const parts = trimmed.split(":");
        const maqamId = parts[0];
        const tonicId = parts[1];

        if (!maqamId) {
          return addCorsHeaders(
            NextResponse.json(
              {
                error: `Invalid waypoint format: '${wp}'`,
                hint: "Use format: waypoints=maqam_id:tonic or waypoints=maqam_id",
              },
              { status: 400 }
            )
          );
        }

        waypoints.push({
          maqamId,
          maqamIdName: standardizeText(maqamId),
          tonicId: tonicId || undefined,
        });
      }
    }

    // Find routes
    const result = findModulationRoutes(
      tuningSystemId,
      startingNote,
      fromMaqamId,
      toMaqamId,
      {
        fromTonicId: fromTonicId || undefined,
        toTonicId: toTonicId || undefined,
        waypoints,
        maxHops,
        returnToStart,
        limit,
      }
    );

    // Handle errors from route finding
    if (result.error) {
      const statusCode =
        result.error.includes("not found") ? 404 :
        result.error.includes("No path found") ? 200 : 400;

      if (statusCode === 200) {
        // Return empty results for "no path found" case
        return addCorsHeaders(
          NextResponse.json({
            routes: {
              count: 0,
              data: [],
            },
            context: buildContext(
              tuningSystemId,
              startingNote,
              result.sourceNode,
              result.targetNode,
              result.waypointNodes,
              maxHops,
              returnToStart,
              limit,
              inArabic
            ),
            message: result.error,
          })
        );
      }

      return addCorsHeaders(
        NextResponse.json(
          {
            error: result.error,
            hint: "Check that all maqamat exist in the specified tuning system",
          },
          { status: statusCode }
        )
      );
    }

    // Format response
    const formattedJourneys = result.journeys.map((journey) =>
      formatJourney(journey, inArabic)
    );

    return addCorsHeaders(
      NextResponse.json({
        routes: {
          count: formattedJourneys.length,
          data: formattedJourneys,
        },
        context: buildContext(
          tuningSystemId,
          startingNote,
          result.sourceNode!,
          result.targetNode!,
          result.waypointNodes,
          maxHops,
          returnToStart,
          limit,
          inArabic
        ),
      })
    );
  } catch (error) {
    console.error("Error in GET /api/modulation-routes:", error);
    return addCorsHeaders(
      NextResponse.json(
        {
          error: "Failed to calculate modulation routes",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      )
    );
  }
}

/**
 * Builds the context object for the response.
 */
function buildContext(
  tuningSystemId: string,
  startingNote: string,
  sourceNode: MaqamNode | null,
  targetNode: MaqamNode | null,
  waypointNodes: MaqamNode[],
  maxHops: number,
  returnToStart: boolean,
  limit: number,
  inArabic: boolean
): any {
  const tuningSystems = getTuningSystems();
  const tuningSystem = tuningSystems.find((ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemId));

  const context: any = {
    tuningSystem: {
      id: tuningSystemId,
      displayName: tuningSystem?.stringify() || tuningSystemId,
    },
    startingNote: {
      idName: standardizeText(startingNote),
      displayName: startingNote,
    },
    searchConstraints: {
      maxHops,
      returnToStart,
      limit,
    },
  };

  if (inArabic && tuningSystem) {
    context.tuningSystem.displayNameAr = getTuningSystemDisplayNameAr(
      tuningSystem.getCreatorArabic() || "",
      tuningSystem.getCreatorEnglish() || "",
      tuningSystem.getYear(),
      tuningSystem.getTitleArabic() || "",
      tuningSystem.getTitleEnglish() || ""
    );
    context.startingNote.displayNameAr = getNoteNameDisplayAr(startingNote);
  }

  if (sourceNode) {
    context.sourceNode = formatNode(sourceNode, inArabic);
  }

  if (targetNode) {
    context.targetNode = formatNode(targetNode, inArabic);
  }

  if (waypointNodes.length > 0) {
    context.waypoints = waypointNodes.map((node) => formatNode(node, inArabic));
  }

  return context;
}

/**
 * Formats a MaqamNode for the API response.
 */
function formatNode(node: MaqamNode, inArabic: boolean): any {
  const formatted: any = {
    maqamId: node.maqamId,
    baseMaqamIdName: node.baseMaqamIdName,
    maqamIdName: node.maqamIdName,
    maqamDisplayName: node.maqamDisplayName,
    tonicId: node.tonicId,
    tonicDisplay: node.tonicDisplay,
    isTransposition: node.isTransposition,
  };

  if (inArabic) {
    formatted.maqamDisplayNameAr = getMaqamNameDisplayAr(node.maqamDisplayName);
    formatted.tonicDisplayAr = getNoteNameDisplayAr(node.tonicDisplay);
  }

  return formatted;
}

/**
 * Formats a ModulationJourney for the API response.
 */
function formatJourney(journey: ModulationJourney, inArabic: boolean): any {
  const formatted: any = {
    totalHops: journey.totalHops,
    outboundRoute: {
      hops: journey.outboundRoute.hops,
      path: journey.outboundRoute.path.map((step) => ({
        from: formatNode(step.from, inArabic),
        to: formatNode(step.to, inArabic),
        modulationDegree: step.modulationDegree,
        modulationCategory: step.modulationCategory,
      })),
    },
  };

  if (journey.returnRoute) {
    formatted.returnRoute = {
      hops: journey.returnRoute.hops,
      path: journey.returnRoute.path.map((step) => ({
        from: formatNode(step.from, inArabic),
        to: formatNode(step.to, inArabic),
        modulationDegree: step.modulationDegree,
        modulationCategory: step.modulationCategory,
      })),
    };
  }

  return formatted;
}
