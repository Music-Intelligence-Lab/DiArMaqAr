import { NextResponse } from "next/server";
import { parseBooleanFlag } from "@/functions/parseBooleanFlag";

/**
 * Reads a route's true/false query parameters with parseBooleanFlag, or the
 * 400 response naming the first one that is neither "true" nor "false".
 *
 *   const flags = readBooleanFlags(searchParams, ["includeSources"]);
 *   if ("error" in flags) return addCorsHeaders(flags.error);
 *   const { includeSources } = flags.values;
 */
export function readBooleanFlags<Name extends string>(
  searchParams: URLSearchParams,
  names: readonly Name[]
): { values: Record<Name, boolean> } | { error: NextResponse } {
  const values = {} as Record<Name, boolean>;
  for (const name of names) {
    try {
      values[name] = parseBooleanFlag(searchParams.get(name), name);
    } catch (error) {
      return {
        error: NextResponse.json(
          {
            error: `Invalid parameter: ${name}`,
            message: error instanceof Error ? error.message : `${name} must be 'true' or 'false'`,
            validOptions: ["true", "false"],
            hint: `Use ?${name}=true or ?${name}=false, or leave it out (false)`,
          },
          { status: 400 }
        ),
      };
    }
  }
  return { values };
}
