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
import NoteName, { getNoteNameIndexAndOctave } from "@/models/NoteName";
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

  // Create a map from maqamId to base idName (stable identifier for lookups)
  const maqamIdToBaseIdName = new Map<string, string>();
  for (const maqamData of allMaqamat) {
    maqamIdToBaseIdName.set(maqamData.getId(), maqamData.getIdName());
  }

  // Helper to get base idName from a Maqam transposition
  const getBaseIdName = (maqam: Maqam): string => {
    return maqamIdToBaseIdName.get(maqam.maqamId) || standardizeText(maqam.name);
  };

  // Find all available maqamat and their transpositions.
  // Also build a cache keyed by maqamData id so the `modulate` calls below
  // don't recompute transpositions 398× for the same 63 maqamat — that loop
  // is the cold-start hotspot and was exceeding Netlify's function timeout.
  const availableMaqamat: Maqam[] = [];
  const transpositionsCache = new Map<string, Maqam[]>();

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

    transpositionsCache.set(maqamData.getId(), transpositions);
    availableMaqamat.push(...transpositions);
  }

  // Create nodes for all available maqam transpositions
  // Use baseMaqamIdName:tonicId as the key for consistent lookups
  for (const maqam of availableMaqamat) {
    const baseIdName = getBaseIdName(maqam);
    const node = createMaqamNode(maqam, baseIdName, standardizeText);
    const nodeKey = createNodeKey(node.baseMaqamIdName, node.tonicId);
    nodes.set(nodeKey, node);
    adjacencyList.set(nodeKey, []);
  }

  // Calculate modulation edges for each node
  for (const maqam of availableMaqamat) {
    const baseIdName = getBaseIdName(maqam);
    const sourceNode = createMaqamNode(maqam, baseIdName, standardizeText);
    const sourceNodeKey = createNodeKey(sourceNode.baseMaqamIdName, sourceNode.tonicId);

    // Calculate modulations from this maqam (maqamat mode, not ajnas).
    // Pass the prebuilt transpositionsCache so modulate() skips the inner
    // calculateMaqamTranspositions loop.
    const modulations = modulate(
      pitchClasses,
      allAjnas,
      allMaqamat,
      maqam,
      false, // maqamat modulations, not ajnas
      centsTolerance,
      transpositionsCache
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
        const targetBaseIdName = getBaseIdName(targetMaqam);
        const targetNode = createMaqamNode(targetMaqam, targetBaseIdName, standardizeText);
        const targetNodeKey = createNodeKey(targetNode.baseMaqamIdName, targetNode.tonicId);

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

    // Add edges for each modulation category. For sixth-degree modulations,
    // asc and desc rules are driven by the source's ascending vs descending
    // pitch classes (al-Shawwā rule 6). When the source is symmetric — its
    // descending sequence is the reverse of its ascending — both rules fire
    // on the same notes and emit the same targets, producing duplicate edges
    // (and therefore duplicate routes in the BFS output). Skip the
    // `sixthDegreeDesc` emission in that case so the graph carries exactly
    // one edge per (source, target, degree) for symmetric sources.
    const asc = maqam.ascendingPitchClasses;
    const desc = maqam.descendingPitchClasses;
    const isSymmetric =
      asc.length === desc.length &&
      asc.every((pc, i) => pc.noteName === desc[desc.length - 1 - i].noteName);

    addEdges(modulations.modulationsOnFirstDegree, "I", "firstDegree");
    addEdges(modulations.modulationsOnThirdDegree, "III", "thirdDegree");
    addEdges(modulations.modulationsOnAltThirdDegree, "III", "altThirdDegree");
    addEdges(modulations.modulationsOnFourthDegree, "IV", "fourthDegree");
    addEdges(modulations.modulationsOnFifthDegree, "V", "fifthDegree");
    addEdges(modulations.modulationsOnSixthDegreeAsc, "VI", "sixthDegreeAsc");
    if (!isSymmetric) {
      addEdges(modulations.modulationsOnSixthDegreeDesc, "VI", "sixthDegreeDesc");
    }
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
    const baseIdName = maqamData.getIdName();

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
      const node = createMaqamNode(trans, baseIdName, standardizeText);
      return standardizeText(node.tonicId) === normalizedTonicId;
    });

    if (!hasTonic) {
      return `Maqam '${maqamId}' with tonic '${tonicId}' is not available in this tuning system`;
    }
  }

  return null; // Valid
}

/**
 * Finds the node key for a maqam by baseMaqamIdName and optional tonic.
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

  // If tonic specified, look for exact match using baseMaqamIdName
  if (normalizedTonicId) {
    const exactKey = createNodeKey(normalizedMaqamIdName, normalizedTonicId);
    if (graph.nodes.has(exactKey)) {
      return exactKey;
    }
    return null;
  }

  // Otherwise, find the canonical (non-transposition) form by baseMaqamIdName
  for (const [key, node] of graph.nodes) {
    if (node.baseMaqamIdName === normalizedMaqamIdName && !node.isTransposition) {
      return key;
    }
  }

  // Fallback: return first matching baseMaqamIdName
  for (const [key, node] of graph.nodes) {
    if (node.baseMaqamIdName === normalizedMaqamIdName) {
      return key;
    }
  }

  return null;
}

/**
 * Finds all node keys equivalent to a given (maqamIdName, tonicId) query.
 *
 * "Equivalent" here means musically register-equivalent: nodes that share the
 * same modal tonic slot via `sameModalDegreeSlot` — e.g. maqām ḥijāz sitting
 * on dūgāh, qarār dūgāh, and muḥayyar. These are three different graph nodes
 * (different `tonicId`s, different incoming modulation edges) but all share
 * `transposition=false` because register shift is not taṣwīr.
 *
 * When the caller specifies a `tonicId`, we return just the exact match (or
 * an empty array). When no tonic is given, we return every non-transposition
 * sibling so BFS can search for a path to any of them. This lets route
 * queries like `fromMaqam=maqam_rast&toMaqam=maqam_hijaz` (no tonic) succeed
 * whenever any register variant is reachable, even when the canonical
 * non-transposition node (picked by `findNodeKey`) is in an unreachable
 * partition of the graph.
 */
function findEquivalentNodeKeys(
  graph: ModulationGraph,
  maqamIdName: string,
  tonicId?: string
): string[] {
  const normalizedMaqamIdName = standardizeText(maqamIdName);

  if (tonicId) {
    const key = createNodeKey(normalizedMaqamIdName, standardizeText(tonicId));
    return graph.nodes.has(key) ? [key] : [];
  }

  // All non-transposition (register-equivalent) variants first
  const nonTransposition: string[] = [];
  for (const [key, node] of graph.nodes) {
    if (node.baseMaqamIdName === normalizedMaqamIdName && !node.isTransposition) {
      nonTransposition.push(key);
    }
  }
  if (nonTransposition.length > 0) return nonTransposition;

  // Fallback: any matching baseMaqamIdName (including transpositions)
  const anyMatch: string[] = [];
  for (const [key, node] of graph.nodes) {
    if (node.baseMaqamIdName === normalizedMaqamIdName) anyMatch.push(key);
  }
  return anyMatch;
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
  startKeys: string[],
  endKeys: Set<string>,
  maxHops: number,
  limit: number
): ModulationRoute[] {
  // Handle same-node case: any start already in the target set
  for (const sk of startKeys) {
    if (endKeys.has(sk)) return [{ hops: 0, path: [] }];
  }

  // Standard multi-source/multi-target all-shortest-paths BFS: level-by-level
  // relaxation to fill in dist[node] (shortest hop count from any startKey)
  // and preds[node] (every (prevKey, edge) consistent with a shortest path).
  // Reconstruct all shortest paths by walking preds from each reached endKey
  // back to a startKey. Avg out-degree in this graph is ~52, so maxHops=5
  // would produce 52^5 ≈ 380M path expansions under an enumerate-every-path
  // BFS; this level-by-level variant runs in O(V + E) = ~21k ops instead.
  const dist = new Map<string, number>();
  const preds = new Map<string, Array<{ fromKey: string; edge: ModulationEdge }>>();
  const startSet = new Set(startKeys);
  for (const sk of startKeys) dist.set(sk, 0);

  let frontier: string[] = [...startSet];
  let depth = 0;
  let reachedDepth: number | null = null;

  while (frontier.length > 0 && depth < maxHops && reachedDepth === null) {
    const nextFrontierSet = new Set<string>();

    for (const u of frontier) {
      const edges = graph.adjacencyList.get(u) ?? [];
      for (const edge of edges) {
        const v = edge.targetNodeKey;
        const existingDist = dist.get(v);

        if (existingDist === undefined) {
          // First time reaching v — depth+1 is the shortest distance to v
          dist.set(v, depth + 1);
          preds.set(v, [{ fromKey: u, edge }]);
          nextFrontierSet.add(v);
        } else if (existingDist === depth + 1) {
          // Another shortest-path predecessor for v
          preds.get(v)!.push({ fromKey: u, edge });
        }
        // else: existingDist < depth + 1 means v already has a strictly
        // shorter path; this edge is on a longer path and we ignore it
      }
    }

    depth++;
    frontier = [...nextFrontierSet];

    // After this level, check whether any endKey has been reached; if so we
    // lock the shortest-path depth and stop expanding further layers.
    for (const ek of endKeys) {
      const d = dist.get(ek);
      if (d !== undefined) {
        reachedDepth = reachedDepth === null ? d : Math.min(reachedDepth, d);
      }
    }
  }

  if (reachedDepth === null) return [];

  // Collect every endKey that was reached at the shortest distance so we can
  // enumerate alternate shortest-path routes landing on different register
  // siblings within the target set.
  const reachedEnds: string[] = [];
  for (const ek of endKeys) {
    if (dist.get(ek) === reachedDepth) reachedEnds.push(ek);
  }

  const routes: ModulationRoute[] = [];

  const walk = (nodeKey: string, reversedSteps: ModulationStep[]): void => {
    if (routes.length >= limit) return;
    if (startSet.has(nodeKey)) {
      routes.push({
        hops: reversedSteps.length,
        path: [...reversedSteps].reverse(),
      });
      return;
    }
    const predList = preds.get(nodeKey) ?? [];
    for (const { fromKey, edge } of predList) {
      if (routes.length >= limit) return;
      const sourceNode = graph.nodes.get(fromKey)!;
      const step: ModulationStep = {
        from: sourceNode,
        to: edge.targetNode,
        modulationDegree: edge.degree,
        modulationCategory: edge.category,
      };
      walk(fromKey, [...reversedSteps, step]);
    }
  };

  for (const endKey of reachedEnds) {
    if (routes.length >= limit) break;
    walk(endKey, []);
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
      [startKey],
      new Set([endKey]),
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

  // Find canonical source and target nodes (for display / error messages /
  // the trailing register-shift landing). `findNodeKey` picks the first
  // non-transposition match by `baseMaqamIdName`, which we treat as the
  // canonical register for this modal tonic slot.
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

  // Resolve every register-equivalent sibling of the TARGET. When the caller
  // omits toTonic, BFS is free to land on any non-transposition variant that
  // shares the target's modal tonic slot — e.g. ḥijāz on dūgāh / qarār dūgāh
  // / muḥayyar. A trailing registerShift step relocates the journey onto the
  // canonical tonic when BFS lands on a non-canonical sibling. When toTonic
  // is specified this set collapses to one exact key (strict behaviour).
  //
  // The SOURCE is always pinned to its canonical tonic — a journey "from
  // maqām X" starts on maqām X's tonic by convention, never on an octave
  // sibling. Register-equivalent source siblings are still used as permitted
  // LANDING nodes for the return-to-start journey (outbound-target is the
  // starting point for the return, so the same multi-target logic applies).
  const targetEquivKeys = findEquivalentNodeKeys(graph, toMaqamId, toTonicId);
  const sourceEquivKeys = findEquivalentNodeKeys(graph, fromMaqamId, fromTonicId);

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

  // Helper: if a route ends at a register-equivalent sibling of the
  // canonical landing rather than the canonical itself, append a trailing
  // octave-shift step so the journey lands on the canonical tonic
  // (e.g. ḥijāz:muḥayyar → ḥijāz:dūgāh). Direction is derived from the
  // NoteName octave indices of the reached and canonical tonics — if the
  // reached tonic sits HIGHER, we shift DOWN (`8vb` / `octaveBelow`); if it
  // sits LOWER, we shift UP (`8va` / `octaveAbove`). Returns the route
  // unchanged when the caller pinned an explicit tonic or when BFS already
  // landed on the canonical node.
  const appendRegisterShiftIfNeeded = (
    route: ModulationRoute,
    canonicalKey: string
  ): ModulationRoute => {
    if (route.path.length === 0) return route;
    const last = route.path[route.path.length - 1].to;
    const reachedKey = createNodeKey(last.baseMaqamIdName, last.tonicId);
    if (reachedKey === canonicalKey) return route;
    const canonicalNode = graph.nodes.get(canonicalKey);
    if (!canonicalNode) return route;

    const reachedCell = getNoteNameIndexAndOctave(last.tonicDisplay as NoteName);
    const canonicalCell = getNoteNameIndexAndOctave(canonicalNode.tonicDisplay as NoteName);
    const reachedIsHigher = reachedCell.octave > canonicalCell.octave;

    return {
      hops: route.hops + 1,
      path: [
        ...route.path,
        {
          from: last,
          to: canonicalNode,
          modulationDegree: reachedIsHigher ? "8vb" : "8va",
          modulationCategory: reachedIsHigher ? "octaveBelow" : "octaveAbove",
        },
      ],
    };
  };

  // Find outbound routes. Two code paths:
  //   - no waypoints: run a single multi-source / multi-target BFS using the
  //     full sets of register-equivalent source and target keys so the
  //     query succeeds whenever ANY sibling is reachable.
  //   - with waypoints: keep the existing segment-chaining behaviour (strict
  //     per segment). Waypoints carry segment-to-segment state and blending
  //     register-equivalence across segments is out of scope here.
  let outboundRoutes: ModulationRoute[];

  if (waypoints.length === 0) {
    outboundRoutes = bfsShortestPaths(
      graph,
      [sourceNodeKey], // always single canonical source
      new Set(targetEquivKeys),
      maxHops,
      limit
    );
    outboundRoutes = outboundRoutes.map((r) =>
      appendRegisterShiftIfNeeded(r, targetNodeKey)
    );
  } else {
    const allKeys = [sourceNodeKey, ...waypointKeys, targetNodeKey];
    const numSegments = allKeys.length - 1;
    const maxHopsPerSegment = Math.ceil(maxHops / numSegments);
    outboundRoutes = findRoutesWithWaypoints(
      graph,
      allKeys,
      maxHopsPerSegment,
      limit
    );
  }

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
    // Return path: target (canonical) → any register-equivalent source,
    // with a trailing register-shift to the canonical source if needed.
    const shortestOutbound = outboundRoutes[0].hops;
    const maxReturnHops = Math.max(1, maxHops - shortestOutbound);

    const returnRoutes = bfsShortestPaths(
      graph,
      [targetNodeKey],
      new Set(sourceEquivKeys),
      maxReturnHops,
      1 // Just need the shortest return path
    );

    const returnRoute = returnRoutes.length > 0
      ? appendRegisterShiftIfNeeded(returnRoutes[0], sourceNodeKey)
      : undefined;

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
