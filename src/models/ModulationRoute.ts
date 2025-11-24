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
  /** ID of the maqam (e.g., "maqam_rast") */
  maqamId: string;
  /** URL-safe identifier */
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
  | "sixthDegreeIfNoThird";

/**
 * Represents a complete route from source to target maqam.
 */
export interface ModulationRoute {
  /** Number of modulation steps (hops) */
  hops: number;
  /** Ordered sequence of modulation steps */
  path: ModulationStep[];
}

/**
 * Represents a complete journey including optional return path.
 */
export interface ModulationJourney {
  /** The outbound route from source to destination */
  outboundRoute: ModulationRoute;
  /** Optional return route back to source (when returnToStart=true) */
  returnRoute?: ModulationRoute;
  /** Total hops for the complete journey */
  totalHops: number;
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
  /** Maximum number of hops allowed (required, prevents combinatorial explosion) */
  maxHops: number;
  /** Whether to calculate return path to starting maqam */
  returnToStart?: boolean;
  /** Maximum number of routes to return */
  limit?: number;
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
 * @param standardizeTextFn - Function to create URL-safe identifiers
 * @returns A MaqamNode representation
 */
export function createMaqamNode(
  maqam: Maqam,
  standardizeTextFn: (text: string) => string
): MaqamNode {
  const tonicNoteName = maqam.ascendingPitchClasses[0].noteName;
  return {
    maqamId: maqam.maqamId,
    maqamIdName: standardizeTextFn(maqam.name),
    maqamDisplayName: maqam.name,
    tonicId: standardizeTextFn(tonicNoteName),
    tonicDisplay: tonicNoteName,
    isTransposition: maqam.transposition,
  };
}
