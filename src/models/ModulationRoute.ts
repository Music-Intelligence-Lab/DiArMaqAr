/**
 * Modulation Routing Types
 *
 * Types and interfaces for the modulation route-finding feature,
 * which calculates possible paths between maqamat similar to a
 * navigation/maps application.
 */

import { Maqam } from "./Maqam";

/**
 * Represents a node in the modulation graph.
 * Each node is a unique (maqamId, tonic) combination.
 */
export interface MaqamNode {
  /** Numeric ID of the maqam (e.g., "10") */
  maqamId: string;
  /** Base URL-safe identifier for lookups (e.g., "maqam_nahawand") - stable across transpositions */
  baseMaqamIdName: string;
  /** URL-safe identifier (e.g., "maqam_nahawand_al-kurdan") - includes transposition suffix */
  maqamIdName: string;
  /** Display name (e.g., "Maqam Rast" or "Maqam Rast al-Nawa") */
  maqamDisplayName: string;
  /** URL-safe tonic identifier */
  tonicId: string;
  /** Display name for the tonic note */
  tonicDisplay: string;
  /** Whether this is a transposition (taswir) or original form (tahlil) */
  isTransposition: boolean;
}

/**
 * Represents a single step/edge in a modulation route.
 */
export interface ModulationStep {
  /** Source maqam node */
  from: MaqamNode;
  /** Target maqam node */
  to: MaqamNode;
  /** Scale degree where modulation occurs (e.g., "I", "III", "IV", "V", "VI") */
  modulationDegree: string;
  /** Specific modulation category from al-Shawwa's rules */
  modulationCategory: ModulationCategory;
}

/**
 * Al-Shawwa's modulation categories.
 * Based on his 1946 work defining modulation rules.
 */
export type ModulationCategory =
  | "firstDegree"
  | "thirdDegree"
  | "altThirdDegree"
  | "fourthDegree"
  | "fifthDegree"
  | "sixthDegreeAsc"
  | "sixthDegreeDesc"
  | "sixthDegreeIfNoThird"
  // Non-al-Shawwā categories: an octave shift within the same modal tonic
  // slot, inserted by findModulationRoutes when BFS reaches a
  // register-equivalent sibling of the canonical target. The pair encodes
  // direction: `octaveAbove` means the reached tonic sits BELOW the
  // canonical and we shift UP (paired with `modulationDegree: "8va"`);
  // `octaveBelow` means the reached tonic sits ABOVE the canonical and we
  // shift DOWN (`modulationDegree: "8vb"`). Example: ḥijāz:muḥayyar →
  // ḥijāz:dūgāh is `octaveBelow` / `8vb`.
  | "octaveAbove"
  | "octaveBelow"
  // Downward-modulation categories: a genuine modulation to a DIFFERENT
  // maqām whose new tonic sits one octave BELOW the target of the
  // corresponding ascending rule. Emitted as standalone edges so a caller
  // can model e.g. saba:dūgāh → ajam ushayrān:ajam ushayrān as ONE hop
  // (`sixthDegreeAscOctaveBelow` / `VI-8vb`) rather than as VI↑ + 8vb.
  // Each maps 1:1 to an existing ascending category; the modulationDegree
  // field gets a `-8vb` suffix (e.g. "VI-8vb") to keep Roman-numeral degree
  // semantics unambiguous (no arrows that could be confused with the
  // ascending-vs-descending-rule distinction of the source maqām).
  | "firstDegreeOctaveBelow"
  | "thirdDegreeOctaveBelow"
  | "altThirdDegreeOctaveBelow"
  | "fourthDegreeOctaveBelow"
  | "fifthDegreeOctaveBelow"
  | "sixthDegreeAscOctaveBelow"
  | "sixthDegreeDescOctaveBelow"
  | "sixthDegreeIfNoThirdOctaveBelow";

/**
 * Represents a complete route from source to target maqam.
 */
export interface ModulationRoute {
  /** Number of modulation steps (hops) */
  hops: number;
  /** Ordered sequence of modulation steps */
  steps: ModulationStep[];
}

/**
 * One outbound journey from source to target. Return routes (when
 * `returnToStartingMaqam=true`) are delivered separately at the top level of
 * the API response under `possibleReturnRoutes`, not nested inside each
 * journey — because every outbound ends on the same canonical target, a
 * single set of return routes applies to every outbound and pairing them
 * individually would duplicate the same list N times.
 */
export interface ModulationJourney {
  /** 1-based index within the enclosing totalPossibleRoutes.data array */
  routeNumber: number;
  /** The outbound route from source to destination */
  outboundRoute: ModulationRoute;
}

/**
 * A waypoint specification for the route.
 */
export interface ModulationWaypoint {
  /** Maqam ID for the waypoint */
  maqamId: string;
  /** URL-safe maqam identifier */
  maqamIdName: string;
  /** Optional specific tonic for the waypoint */
  tonicId?: string;
}

/**
 * Request parameters for the modulation routes API.
 */
export interface ModulationRoutesRequest {
  /** Tuning system ID (required) */
  tuningSystemId: string;
  /** Starting note for the tuning system (required) */
  startingNote: string;
  /** Source maqam ID (required) */
  fromMaqamId: string;
  /** Source maqam tonic (optional, defaults to canonical) */
  fromTonicId?: string;
  /** Target maqam ID (required) */
  toMaqamId: string;
  /** Target maqam tonic (optional, defaults to canonical) */
  toTonicId?: string;
  /** Optional waypoints to pass through */
  waypoints?: ModulationWaypoint[];
  /** Maximum number of hops allowed (required, 1-20; prevents combinatorial explosion) */
  maxHops: number;
  /** Whether to calculate return path back to the starting maqam */
  returnToStartingMaqam?: boolean;
  /** Maximum number of routes to return (default: 10) */
  maxRoutes?: number;
  /**
   * When true (default), only the shortest-length routes are returned.
   * When false, the result is filled out with progressively longer routes
   * (still simple paths) up to `maxRoutes` / `maxHops`.
   */
  limitToShortestHops?: boolean;
  /**
   * When true (default), BFS may traverse register-shift (8va/8vb) edges
   * between register-equivalent siblings (e.g. muḥayyar → dūgāh). When
   * false, those edges are ignored and routes can only progress via
   * al-Shawwā's modulation rules. Useful when the caller wants a route
   * that stays within a single octave.
   */
  allowOctaveJumps?: boolean;
  /**
   * When true (default), BFS may traverse direct downward-modulation edges
   * (categories ending in `OctaveBelow`, e.g. `sixthDegreeAscOctaveBelow`)
   * that model a single-step modulation to a different maqām whose tonic
   * sits one octave below the target of the corresponding ascending rule.
   * When false, those edges are ignored and such a move can only be made
   * as an ascending modulation + separate 8vb register shift (2 hops).
   */
  allowDownwardModulation?: boolean;
}

/**
 * Response from the modulation routes API.
 */
export interface ModulationRoutesResponse {
  /** Search results */
  routes: {
    count: number;
    data: ModulationJourney[];
  };
  /** Request context and metadata */
  context: {
    tuningSystem: {
      id: string;
      displayName: string;
    };
    startingNote: {
      idName: string;
      displayName: string;
    };
    sourceNode: MaqamNode;
    targetNode: MaqamNode;
    waypoints?: MaqamNode[];
    searchConstraints: {
      maxHops: number;
      returnToStart: boolean;
      limit: number;
    };
  };
}

/**
 * Internal representation of the modulation graph.
 * Maps each node key to its outgoing edges (modulation possibilities).
 */
export interface ModulationGraph {
  /** All nodes in the graph */
  nodes: Map<string, MaqamNode>;
  /** Adjacency list: nodeKey -> list of edges */
  adjacencyList: Map<string, ModulationEdge[]>;
}

/**
 * An edge in the modulation graph representing a possible modulation.
 */
export interface ModulationEdge {
  /** Target node key */
  targetNodeKey: string;
  /** Target node details */
  targetNode: MaqamNode;
  /** Scale degree of modulation */
  degree: string;
  /** Specific category from al-Shawwa's rules */
  category: ModulationCategory;
}

/**
 * Creates a unique key for a maqam node based on maqamId and tonic.
 * Used for graph node identification and deduplication.
 *
 * @param maqamId - The maqam ID
 * @param tonicId - The URL-safe tonic identifier
 * @returns A unique string key
 */
export function createNodeKey(maqamId: string, tonicId: string): string {
  return `${maqamId}:${tonicId}`;
}

/**
 * Parses a node key back into its components.
 *
 * @param nodeKey - The node key to parse
 * @returns Object with maqamId and tonicId
 */
export function parseNodeKey(nodeKey: string): { maqamId: string; tonicId: string } {
  const [maqamId, tonicId] = nodeKey.split(":");
  return { maqamId, tonicId };
}

/**
 * Creates a MaqamNode from a Maqam interface instance.
 *
 * @param maqam - The Maqam instance
 * @param baseMaqamIdName - The stable base idName (e.g., "maqam_nahawand") from MaqamData
 * @param standardizeTextFn - Function to create URL-safe identifiers
 * @returns A MaqamNode representation
 */
export function createMaqamNode(
  maqam: Maqam,
  baseMaqamIdName: string,
  standardizeTextFn: (text: string) => string
): MaqamNode {
  const tonicNoteName = maqam.ascendingPitchClasses[0].noteName;
  return {
    maqamId: maqam.maqamId,
    baseMaqamIdName: baseMaqamIdName,
    maqamIdName: standardizeTextFn(maqam.name),
    maqamDisplayName: maqam.name,
    tonicId: standardizeTextFn(tonicNoteName),
    tonicDisplay: tonicNoteName,
    isTransposition: maqam.transposition,
  };
}
