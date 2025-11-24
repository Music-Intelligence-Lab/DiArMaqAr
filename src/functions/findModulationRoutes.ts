/**
 * Modulation Route Finding Algorithm
 *
 * Implements pathfinding between maqamat using al-Shawwa's modulation rules.
 * Uses BFS (Breadth-First Search) to find shortest paths, with support for
 * waypoints and return-to-start functionality.
 *
 * Graph Structure:
 * - Nodes: Each (maqamId, tonic) pair is a unique node
 * - Edges: Modulation possibilities based on al-Shawwa's rules (scale degrees I, III, IV, V, VI)
 */

import { standardizeText } from "@/functions/export";
import modulate from "@/functions/modulate";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { getMaqamat, getTuningSystems, getAjnas } from "@/functions/import";
import MaqamData, { Maqam, MaqamatModulations } from "@/models/Maqam";
import JinsData from "@/models/Jins";
import TuningSystemData from "@/models/TuningSystem";
import {
  ModulationGraph,
  ModulationEdge,
  MaqamNode,
  ModulationRoute,
  ModulationStep,
  ModulationJourney,
  ModulationWaypoint,
  ModulationCategory,
  createNodeKey,
  createMaqamNode,
} from "@/models/ModulationRoute";

/**
 * In-memory cache for modulation graphs.
 * Key: "tuningSystemId:startingNote"
 * Value: ModulationGraph
 */
const graphCache = new Map<string, ModulationGraph>();

/**
 * Creates a cache key for the graph cache.
 */
function createCacheKey(tuningSystemId: string, startingNote: string): string {
  return `${tuningSystemId}:${standardizeText(startingNote)}`;
}

/**
 * Clears the modulation graph cache.
 * Useful for testing or when data changes.
 */
export function clearModulationGraphCache(): void {
  graphCache.clear();
}

/**
 * Gets or builds the modulation graph for a tuning system + starting note combination.
 * Results are memoized for performance.
 *
 * @param tuningSystem - The tuning system
 * @param startingNote - The starting note name
 * @param allMaqamat - All available maqamat data
 * @param allAjnas - All available ajnas data
 * @param centsTolerance - Tolerance for pitch matching (default: 5)
 * @returns The modulation graph
 */
export function getModulationGraph(
  tuningSystem: TuningSystemData,
  startingNote: string,
  allMaqamat: MaqamData[],
  allAjnas: JinsData[],
  centsTolerance: number = 5
): ModulationGraph {
  const cacheKey = createCacheKey(tuningSystem.getId(), startingNote);

  // Return cached graph if available
  if (graphCache.has(cacheKey)) {
    return graphCache.get(cacheKey)!;
  }

  // Build the graph
  const graph = buildModulationGraph(
    tuningSystem,
    startingNote,
    allMaqamat,
    allAjnas,
    centsTolerance
  );

  // Cache the result
  graphCache.set(cacheKey, graph);

  return graph;
}

/**
 * Builds the complete modulation graph for a tuning system.
 *
 * This is a computationally expensive operation that:
 * 1. Gets all pitch classes for the tuning system
 * 2. Finds all available maqamat and their transpositions
 * 3. Calculates modulation possibilities for each maqam node
 * 4. Builds an adjacency list representation
 *
 * @param tuningSystem - The tuning system
 * @param startingNote - The starting note name
 * @param allMaqamat - All maqamat data
 * @param allAjnas - All ajnas data
 * @param centsTolerance - Tolerance for pitch matching
 * @returns The built modulation graph
 */
function buildModulationGraph(
  tuningSystem: TuningSystemData,
  startingNote: string,
  allMaqamat: MaqamData[],
  allAjnas: JinsData[],
  centsTolerance: number
): ModulationGraph {
  const nodes = new Map<string, MaqamNode>();
  const adjacencyList = new Map<string, ModulationEdge[]>();

  // Get pitch classes for this tuning system + starting note
  const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
  const allNoteNames = pitchClasses.map((pc) => pc.noteName);

  // Find all available maqamat and their transpositions
  const availableMaqamat: Maqam[] = [];

  for (const maqamData of allMaqamat) {
    // Check if maqam is possible in this tuning system
    if (!maqamData.isMaqamPossible(allNoteNames)) continue;

    // Get all transpositions of this maqam
    const transpositions = calculateMaqamTranspositions(
      pitchClasses,
      allAjnas,
      maqamData,
      true,
      centsTolerance
    );

    availableMaqamat.push(...transpositions);
  }

  // Create nodes for all available maqam transpositions
  // Use maqamIdName (URL-safe standardized name) as the key, not numeric maqamId
  for (const maqam of availableMaqamat) {
    const node = createMaqamNode(maqam, standardizeText);
    const nodeKey = createNodeKey(node.maqamIdName, node.tonicId);
    nodes.set(nodeKey, node);
    adjacencyList.set(nodeKey, []);
  }

  // Calculate modulation edges for each node
  for (const maqam of availableMaqamat) {
    const sourceNode = createMaqamNode(maqam, standardizeText);
    const sourceNodeKey = createNodeKey(sourceNode.maqamIdName, sourceNode.tonicId);

    // Calculate modulations from this maqam (maqamat mode, not ajnas)
    const modulations = modulate(
      pitchClasses,
      allAjnas,
      allMaqamat,
      maqam,
      false, // maqamat modulations, not ajnas
      centsTolerance
    ) as MaqamatModulations;

    // Process each modulation category and create edges
    const edges: ModulationEdge[] = [];

    // Helper to add edges from a modulation array
    const addEdges = (
      mods: Maqam[],
      degree: string,
      category: ModulationCategory
    ) => {
      for (const targetMaqam of mods) {
        const targetNode = createMaqamNode(targetMaqam, standardizeText);
        const targetNodeKey = createNodeKey(targetNode.maqamIdName, targetNode.tonicId);

        // Only add edge if target node exists in our graph
        if (nodes.has(targetNodeKey)) {
          edges.push({
            targetNodeKey,
            targetNode,
            degree,
            category,
          });
        }
      }
    };

    // Add edges for each modulation category
    addEdges(modulations.modulationsOnFirstDegree, "I", "firstDegree");
    addEdges(modulations.modulationsOnThirdDegree, "III", "thirdDegree");
    addEdges(modulations.modulationsOnAltThirdDegree, "III", "altThirdDegree");
    addEdges(modulations.modulationsOnFourthDegree, "IV", "fourthDegree");
    addEdges(modulations.modulationsOnFifthDegree, "V", "fifthDegree");
    addEdges(modulations.modulationsOnSixthDegreeAsc, "VI", "sixthDegreeAsc");
    addEdges(modulations.modulationsOnSixthDegreeDesc, "VI", "sixthDegreeDesc");
    addEdges(modulations.modulationsOnSixthDegreeIfNoThird, "VI", "sixthDegreeIfNoThird");

    adjacencyList.set(sourceNodeKey, edges);
  }

  return { nodes, adjacencyList };
}

/**
 * Lightweight validation to check if a maqam/tonic combination exists
 * without building the full graph. This allows early validation before
 * expensive graph construction.
 *
 * @param tuningSystem - The tuning system
 * @param startingNote - The starting note
 * @param allMaqamat - All maqamat data
 * @param allAjnas - All ajnas data
 * @param maqamId - The maqam ID to check
 * @param tonicId - Optional tonic ID to check
 * @param centsTolerance - Tolerance for pitch matching (default: 5)
 * @returns Error message if invalid, null if valid
 */
function validateNodeExists(
  tuningSystem: TuningSystemData,
  startingNote: string,
  allMaqamat: MaqamData[],
  allAjnas: JinsData[],
  maqamId: string,
  tonicId?: string,
  centsTolerance: number = 5
): string | null {
  // Get pitch classes for this tuning system + starting note
  const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
  const allNoteNames = pitchClasses.map((pc) => pc.noteName);

  // Standardize the maqam ID for matching
  // API parameters use idName format (URL-safe), not numeric ID
  const normalizedMaqamId = standardizeText(maqamId);

  // Find the maqam data by idName (URL-safe identifier)
  const maqamData = allMaqamat.find(
    (m) => standardizeText(m.getIdName()) === normalizedMaqamId
  );

  if (!maqamData) {
    return `Maqam '${maqamId}' not found`;
  }

  // Check if maqam is possible in this tuning system
  if (!maqamData.isMaqamPossible(allNoteNames)) {
    return `Maqam '${maqamId}' is not available in this tuning system`;
  }

  // If tonic specified, check if that transposition exists
  if (tonicId) {
    const normalizedTonicId = standardizeText(tonicId);
    
    // Calculate transpositions for this maqam
    const transpositions = calculateMaqamTranspositions(
      pitchClasses,
      allAjnas,
      maqamData,
      true, // withTahlil
      centsTolerance
    );

    // Check if any transposition has the requested tonic
    const hasTonic = transpositions.some((trans) => {
      const node = createMaqamNode(trans, standardizeText);
      return standardizeText(node.tonicId) === normalizedTonicId;
    });

    if (!hasTonic) {
      return `Maqam '${maqamId}' with tonic '${tonicId}' is not available in this tuning system`;
    }
  }

  return null; // Valid
}

/**
 * Finds the node key for a maqam by idName and optional tonic.
 * If tonic is not specified, returns the canonical (tahlil) form.
 *
 * @param graph - The modulation graph
 * @param maqamIdName - The maqam idName (URL-safe, e.g., "maqam_rast")
 * @param tonicId - Optional tonic ID (URL-safe)
 * @returns The node key, or null if not found
 */
function findNodeKey(
  graph: ModulationGraph,
  maqamIdName: string,
  tonicId?: string
): string | null {
  // Standardize the input for case/diacritics-insensitive matching
  const normalizedMaqamIdName = standardizeText(maqamIdName);
  const normalizedTonicId = tonicId ? standardizeText(tonicId) : undefined;

  // If tonic specified, look for exact match
  if (normalizedTonicId) {
    const exactKey = createNodeKey(normalizedMaqamIdName, normalizedTonicId);
    if (graph.nodes.has(exactKey)) {
      return exactKey;
    }
    return null;
  }

  // Otherwise, find the canonical (non-transposition) form
  for (const [key, node] of graph.nodes) {
    if (node.maqamIdName === normalizedMaqamIdName && !node.isTransposition) {
      return key;
    }
  }

  // Fallback: return first matching maqamIdName
  for (const [key, node] of graph.nodes) {
    if (node.maqamIdName === normalizedMaqamIdName) {
      return key;
    }
  }

  return null;
}

/**
 * BFS pathfinding between two nodes.
 * Returns all shortest paths (same hop count) up to the limit.
 *
 * @param graph - The modulation graph
 * @param startKey - Starting node key
 * @param endKey - Target node key
 * @param maxHops - Maximum depth to search
 * @param limit - Maximum number of paths to return
 * @returns Array of routes found
 */
function bfsShortestPaths(
  graph: ModulationGraph,
  startKey: string,
  endKey: string,
  maxHops: number,
  limit: number
): ModulationRoute[] {
  // Handle same node case
  if (startKey === endKey) {
    return [{ hops: 0, path: [] }];
  }

  const routes: ModulationRoute[] = [];
  let shortestPathLength: number | null = null;

  // BFS queue: each entry is [currentNodeKey, path taken so far]
  const queue: Array<{ nodeKey: string; path: ModulationStep[] }> = [];

  // Track visited nodes at each depth to allow multiple paths through same nodes
  // but prevent infinite loops within a single path
  queue.push({ nodeKey: startKey, path: [] });

  while (queue.length > 0 && routes.length < limit) {
    const { nodeKey, path } = queue.shift()!;
    const currentDepth = path.length;

    // Stop if we've exceeded max hops
    if (currentDepth >= maxHops) continue;

    // Stop if we've found shortest paths and this path is longer
    if (shortestPathLength !== null && currentDepth >= shortestPathLength) continue;

    // Get edges from current node
    const edges = graph.adjacencyList.get(nodeKey) || [];

    for (const edge of edges) {
      // Check if this completes a path to the target
      if (edge.targetNodeKey === endKey) {
        const sourceNode = graph.nodes.get(nodeKey)!;
        const newStep: ModulationStep = {
          from: sourceNode,
          to: edge.targetNode,
          modulationDegree: edge.degree,
          modulationCategory: edge.category,
        };

        const completePath = [...path, newStep];
        const route: ModulationRoute = {
          hops: completePath.length,
          path: completePath,
        };

        // Set shortest path length on first find
        if (shortestPathLength === null) {
          shortestPathLength = completePath.length;
        }

        // Only add if this is a shortest path
        if (completePath.length === shortestPathLength) {
          routes.push(route);
        }

        continue;
      }

      // Don't revisit nodes already in this path (prevent cycles)
      const visitedInPath = path.some(
        (step) =>
          createNodeKey(step.from.maqamId, step.from.tonicId) === edge.targetNodeKey ||
          createNodeKey(step.to.maqamId, step.to.tonicId) === edge.targetNodeKey
      );
      if (visitedInPath) continue;

      // Also check start node
      if (edge.targetNodeKey === startKey) continue;

      // Add to queue for further exploration
      const sourceNode = graph.nodes.get(nodeKey)!;
      const newStep: ModulationStep = {
        from: sourceNode,
        to: edge.targetNode,
        modulationDegree: edge.degree,
        modulationCategory: edge.category,
      };

      queue.push({
        nodeKey: edge.targetNodeKey,
        path: [...path, newStep],
      });
    }
  }

  return routes;
}

/**
 * Finds routes through a series of waypoints.
 * Chains together pathfinding between consecutive waypoints.
 *
 * @param graph - The modulation graph
 * @param waypointKeys - Ordered array of node keys (start, waypoints, end)
 * @param maxHopsPerSegment - Maximum hops for each segment
 * @param limit - Maximum total routes to return
 * @returns Array of complete routes through all waypoints
 */
function findRoutesWithWaypoints(
  graph: ModulationGraph,
  waypointKeys: string[],
  maxHopsPerSegment: number,
  limit: number
): ModulationRoute[] {
  if (waypointKeys.length < 2) {
    return [];
  }

  // Find paths between each consecutive pair of waypoints
  const segmentRoutes: ModulationRoute[][] = [];

  for (let i = 0; i < waypointKeys.length - 1; i++) {
    const startKey = waypointKeys[i];
    const endKey = waypointKeys[i + 1];

    const routes = bfsShortestPaths(
      graph,
      startKey,
      endKey,
      maxHopsPerSegment,
      limit // Get up to limit routes per segment
    );

    if (routes.length === 0) {
      // No path found for this segment - return empty
      return [];
    }

    segmentRoutes.push(routes);
  }

  // Combine segment routes (cartesian product, limited)
  return combineSegmentRoutes(segmentRoutes, limit);
}

/**
 * Combines routes from multiple segments into complete journeys.
 * Performs a limited cartesian product of segment routes.
 *
 * @param segmentRoutes - Array of route arrays for each segment
 * @param limit - Maximum routes to return
 * @returns Combined routes
 */
function combineSegmentRoutes(
  segmentRoutes: ModulationRoute[][],
  limit: number
): ModulationRoute[] {
  if (segmentRoutes.length === 0) return [];
  if (segmentRoutes.length === 1) return segmentRoutes[0].slice(0, limit);

  let combined: ModulationRoute[] = segmentRoutes[0];

  for (let i = 1; i < segmentRoutes.length; i++) {
    const nextSegment = segmentRoutes[i];
    const newCombined: ModulationRoute[] = [];

    for (const route of combined) {
      for (const nextRoute of nextSegment) {
        if (newCombined.length >= limit) break;

        newCombined.push({
          hops: route.hops + nextRoute.hops,
          path: [...route.path, ...nextRoute.path],
        });
      }
      if (newCombined.length >= limit) break;
    }

    combined = newCombined;
  }

  // Sort by total hops (shortest first)
  combined.sort((a, b) => a.hops - b.hops);

  return combined.slice(0, limit);
}

/**
 * Main entry point for finding modulation routes.
 *
 * @param tuningSystemId - The tuning system ID
 * @param startingNote - The starting note for the tuning system
 * @param fromMaqamId - Source maqam ID
 * @param toMaqamId - Target maqam ID
 * @param options - Additional options
 * @returns Object with routes and metadata
 */
export function findModulationRoutes(
  tuningSystemId: string,
  startingNote: string,
  fromMaqamId: string,
  toMaqamId: string,
  options: {
    fromTonicId?: string;
    toTonicId?: string;
    waypoints?: ModulationWaypoint[];
    maxHops: number;
    returnToStart?: boolean;
    limit?: number;
  }
): {
  journeys: ModulationJourney[];
  sourceNode: MaqamNode | null;
  targetNode: MaqamNode | null;
  waypointNodes: MaqamNode[];
  error?: string;
} {
  const {
    fromTonicId,
    toTonicId,
    waypoints = [],
    maxHops,
    returnToStart = false,
    limit = 10,
  } = options;

  // Load data
  const tuningSystems = getTuningSystems();
  const allMaqamat = getMaqamat();
  const allAjnas = getAjnas();

  // Find tuning system (use standardizeText for case-insensitive matching, consistent with other endpoints)
  const tuningSystem = tuningSystems.find(
    (ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemId)
  );
  if (!tuningSystem) {
    return {
      journeys: [],
      sourceNode: null,
      targetNode: null,
      waypointNodes: [],
      error: `Tuning system '${tuningSystemId}' not found`,
    };
  }

  // Validate starting note
  const noteNameSets = tuningSystem.getNoteNameSets();
  const matchingSet = noteNameSets.find(
    (set) => standardizeText(set[0]) === standardizeText(startingNote)
  );
  if (!matchingSet) {
    return {
      journeys: [],
      sourceNode: null,
      targetNode: null,
      waypointNodes: [],
      error: `Invalid starting note '${startingNote}'`,
    };
  }
  const validStartingNote = matchingSet[0];

  // VALIDATE ALL NODES BEFORE BUILDING THE GRAPH
  // This ensures we fail fast if any maqam/tonic combination is invalid
  // without wasting time building the expensive graph
  
  // Validate source node
  const sourceError = validateNodeExists(
    tuningSystem,
    validStartingNote,
    allMaqamat,
    allAjnas,
    fromMaqamId,
    fromTonicId
  );
  if (sourceError) {
    return {
      journeys: [],
      sourceNode: null,
      targetNode: null,
      waypointNodes: [],
      error: `Source maqam: ${sourceError}`,
    };
  }

  // Validate target node
  const targetError = validateNodeExists(
    tuningSystem,
    validStartingNote,
    allMaqamat,
    allAjnas,
    toMaqamId,
    toTonicId
  );
  if (targetError) {
    return {
      journeys: [],
      sourceNode: null,
      targetNode: null,
      waypointNodes: [],
      error: `Target maqam: ${targetError}`,
    };
  }

  // Validate all waypoint nodes
  for (const wp of waypoints) {
    const wpError = validateNodeExists(
      tuningSystem,
      validStartingNote,
      allMaqamat,
      allAjnas,
      wp.maqamId,
      wp.tonicId
    );
    if (wpError) {
      return {
        journeys: [],
        sourceNode: null,
        targetNode: null,
        waypointNodes: [],
        error: `Waypoint maqam '${wp.maqamId}': ${wpError}`,
      };
    }
  }

  // All nodes validated - now safe to build the graph and proceed with route finding
  const graph = getModulationGraph(
    tuningSystem,
    validStartingNote,
    allMaqamat,
    allAjnas
  );

  // Find source node (now that graph is built)
  const sourceNodeKey = findNodeKey(graph, fromMaqamId, fromTonicId);
  if (!sourceNodeKey) {
    // This should not happen if validation worked correctly, but handle gracefully
    return {
      journeys: [],
      sourceNode: null,
      targetNode: null,
      waypointNodes: [],
      error: `Source maqam '${fromMaqamId}'${fromTonicId ? ` with tonic '${fromTonicId}'` : ""} not found in graph`,
    };
  }
  const sourceNode = graph.nodes.get(sourceNodeKey)!;

  // Find target node
  const targetNodeKey = findNodeKey(graph, toMaqamId, toTonicId);
  if (!targetNodeKey) {
    return {
      journeys: [],
      sourceNode,
      targetNode: null,
      waypointNodes: [],
      error: `Target maqam '${toMaqamId}'${toTonicId ? ` with tonic '${toTonicId}'` : ""} not found in graph`,
    };
  }
  const targetNode = graph.nodes.get(targetNodeKey)!;

  // Resolve waypoint nodes
  const waypointKeys: string[] = [];
  const waypointNodes: MaqamNode[] = [];

  for (const wp of waypoints) {
    const wpKey = findNodeKey(graph, wp.maqamId, wp.tonicId);
    if (!wpKey) {
      return {
        journeys: [],
        sourceNode,
        targetNode,
        waypointNodes,
        error: `Waypoint maqam '${wp.maqamId}'${wp.tonicId ? ` with tonic '${wp.tonicId}'` : ""} not found in graph`,
      };
    }
    waypointKeys.push(wpKey);
    waypointNodes.push(graph.nodes.get(wpKey)!);
  }

  // Build the full path of node keys: source -> waypoints -> target
  const allKeys = [sourceNodeKey, ...waypointKeys, targetNodeKey];

  // Calculate max hops per segment (divide evenly among segments)
  const numSegments = allKeys.length - 1;
  const maxHopsPerSegment = Math.ceil(maxHops / numSegments);

  // Find outbound routes
  const outboundRoutes = findRoutesWithWaypoints(
    graph,
    allKeys,
    maxHopsPerSegment,
    limit
  );

  if (outboundRoutes.length === 0) {
    return {
      journeys: [],
      sourceNode,
      targetNode,
      waypointNodes,
      error: `No path found from '${fromMaqamId}' to '${toMaqamId}' within ${maxHops} hops`,
    };
  }

  // Build journeys
  const journeys: ModulationJourney[] = [];

  if (returnToStart) {
    // Calculate return path from target back to source
    // Use remaining hops from max
    const shortestOutbound = outboundRoutes[0].hops;
    const maxReturnHops = Math.max(1, maxHops - shortestOutbound);

    const returnRoutes = bfsShortestPaths(
      graph,
      targetNodeKey,
      sourceNodeKey,
      maxReturnHops,
      1 // Just need the shortest return path
    );

    const returnRoute = returnRoutes.length > 0 ? returnRoutes[0] : undefined;

    for (const outbound of outboundRoutes) {
      if (journeys.length >= limit) break;

      journeys.push({
        outboundRoute: outbound,
        returnRoute,
        totalHops: outbound.hops + (returnRoute?.hops || 0),
      });
    }
  } else {
    // No return path needed
    for (const outbound of outboundRoutes) {
      if (journeys.length >= limit) break;

      journeys.push({
        outboundRoute: outbound,
        totalHops: outbound.hops,
      });
    }
  }

  return {
    journeys,
    sourceNode,
    targetNode,
    waypointNodes,
  };
}
