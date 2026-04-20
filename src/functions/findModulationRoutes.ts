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

  // Add octave-shift edges between register-equivalent siblings — nodes that
  // share the same (baseMaqamIdName, modal-degree slot) but live in different
  // octaves. Register siblings can be tahlil variants (e.g. ḥijāz on qarār
  // dūgāh / dūgāh / muḥayyar, all transposition=false) or transposition
  // variants (e.g. ḥijāz al-yegāh / al-nawā, both transposition=true, shared
  // G slot). Emitting these as real edges lets BFS:
  //   (1) chain multi-octave shifts (e.g. muḥayyar → dūgāh → qarār dūgāh)
  //   (2) traverse register shifts as intermediate hops, not only at the end
  // Only adjacent siblings in octave order are connected, so the hop count
  // reflects the number of octave jumps.
  const siblingsBySlot = new Map<string, MaqamNode[]>();
  for (const node of nodes.values()) {
    const cell = getNoteNameIndexAndOctave(node.tonicDisplay as NoteName);
    if (cell.index < 0) continue; // tonic not in the NoteName tables; skip
    const slotKey = `${node.baseMaqamIdName}:${cell.index}`;
    if (!siblingsBySlot.has(slotKey)) siblingsBySlot.set(slotKey, []);
    siblingsBySlot.get(slotKey)!.push(node);
  }

  for (const siblings of siblingsBySlot.values()) {
    if (siblings.length < 2) continue;
    siblings.sort((a, b) => {
      const oa = getNoteNameIndexAndOctave(a.tonicDisplay as NoteName).octave;
      const ob = getNoteNameIndexAndOctave(b.tonicDisplay as NoteName).octave;
      return oa - ob;
    });
    for (let i = 0; i < siblings.length - 1; i++) {
      const lower = siblings[i];
      const higher = siblings[i + 1];
      const lowerKey = createNodeKey(lower.baseMaqamIdName, lower.tonicId);
      const higherKey = createNodeKey(higher.baseMaqamIdName, higher.tonicId);
      adjacencyList.get(lowerKey)!.push({
        targetNodeKey: higherKey,
        targetNode: higher,
        degree: "8va",
        category: "octaveAbove",
      });
      adjacencyList.get(higherKey)!.push({
        targetNodeKey: lowerKey,
        targetNode: lower,
        degree: "8vb",
        category: "octaveBelow",
      });
    }
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
 * BFS pathfinding between two nodes.
 *
 * With `limitToShortestHops = true` (the default): returns all shortest
 * paths (same minimum hop count) up to `limit`. Runs O(V + E) via a single
 * level-by-level BFS that builds a predecessor DAG, then reconstructs paths.
 *
 * With `limitToShortestHops = false`: returns paths in order of increasing
 * hop count — shortest first, then next-shortest, and so on — until either
 * `limit` routes are collected or depth exceeds `maxHops`. Uses iterative
 * deepening DFS with a backward-BFS distance map for pruning (so dead-end
 * branches that can't reach an endKey within the remaining budget are cut).
 *
 * @param graph - The modulation graph
 * @param startKeys - Accepted starting nodes
 * @param endKeys - Accepted ending nodes
 * @param maxHops - Maximum depth to search
 * @param limit - Maximum number of paths to return
 * @param limitToShortestHops - If true, return only shortest-length paths
 * @returns Array of routes found, ordered by hop count ascending
 */
function bfsShortestPaths(
  graph: ModulationGraph,
  startKeys: string[],
  endKeys: Set<string>,
  maxHops: number,
  limit: number,
  limitToShortestHops: boolean = true
): ModulationRoute[] {
  // Handle same-node case: any start already in the target set
  for (const sk of startKeys) {
    if (endKeys.has(sk)) return [{ hops: 0, steps: [] }];
  }

  if (limitToShortestHops) {
    return bfsAllShortestPaths(graph, startKeys, endKeys, maxHops, limit);
  }
  return bfsPathsByIncreasingHops(graph, startKeys, endKeys, maxHops, limit);
}

/**
 * Standard multi-source/multi-target all-shortest-paths BFS: level-by-level
 * relaxation fills in dist[node] (shortest hop count from any startKey) and
 * preds[node] (every (prevKey, edge) consistent with a shortest path). Walks
 * preds from each reached endKey back to a startKey to enumerate every
 * shortest path. Avg out-degree in this graph is ~52, so maxHops=5 would
 * produce 52^5 ≈ 380M path expansions under an enumerate-every-path BFS;
 * this level-by-level variant runs in O(V + E) = ~21k ops instead.
 */
function bfsAllShortestPaths(
  graph: ModulationGraph,
  startKeys: string[],
  endKeys: Set<string>,
  maxHops: number,
  limit: number
): ModulationRoute[] {
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
          dist.set(v, depth + 1);
          preds.set(v, [{ fromKey: u, edge }]);
          nextFrontierSet.add(v);
        } else if (existingDist === depth + 1) {
          preds.get(v)!.push({ fromKey: u, edge });
        }
      }
    }

    depth++;
    frontier = [...nextFrontierSet];

    for (const ek of endKeys) {
      const d = dist.get(ek);
      if (d !== undefined) {
        reachedDepth = reachedDepth === null ? d : Math.min(reachedDepth, d);
      }
    }
  }

  if (reachedDepth === null) return [];

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
        steps: [...reversedSteps].reverse(),
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
 * Iterative-deepening DFS that enumerates simple paths in order of
 * increasing hop count — shortest first, then next-shortest, and so on —
 * until `limit` routes are collected or depth > `maxHops`. Pruned by a
 * backward-BFS distance map so branches that can't possibly reach any
 * endKey within the remaining hop budget are cut before recursing.
 *
 * Complexity is worst-case exponential in `maxHops`, but the backward-
 * distance pruning is aggressive — most branches die at the first step
 * when the nearest endKey is farther than the remaining budget allows.
 * The `limit` cap provides an additional early-exit safeguard.
 */
function bfsPathsByIncreasingHops(
  graph: ModulationGraph,
  startKeys: string[],
  endKeys: Set<string>,
  maxHops: number,
  limit: number
): ModulationRoute[] {
  // Backward BFS from endKeys: distToEnd[v] = shortest hop count from v to
  // ANY endKey using a single reverse traversal of the graph. Lets us prune
  // DFS branches that can't reach an endKey within the remaining budget.
  const reverseAdj = new Map<string, string[]>();
  for (const [u, edges] of graph.adjacencyList) {
    for (const e of edges) {
      if (!reverseAdj.has(e.targetNodeKey)) reverseAdj.set(e.targetNodeKey, []);
      reverseAdj.get(e.targetNodeKey)!.push(u);
    }
  }
  const distToEnd = new Map<string, number>();
  for (const ek of endKeys) distToEnd.set(ek, 0);
  let rframe: string[] = [...endKeys];
  let rdepth = 0;
  while (rframe.length > 0 && rdepth < maxHops) {
    const next = new Set<string>();
    for (const u of rframe) {
      for (const p of reverseAdj.get(u) ?? []) {
        if (!distToEnd.has(p)) {
          distToEnd.set(p, rdepth + 1);
          next.add(p);
        }
      }
    }
    rdepth++;
    rframe = [...next];
  }

  const routes: ModulationRoute[] = [];
  const seenSigs = new Set<string>();

  // DFS with depth bound = targetDepth, collecting only paths that END at
  // an endKey at EXACTLY targetDepth hops. This yields paths in depth order
  // when called with targetDepth = 1, 2, 3, ...
  const dfs = (
    current: string,
    remaining: number,
    path: ModulationStep[],
    visited: Set<string>
  ): void => {
    if (routes.length >= limit) return;
    if (remaining === 0) {
      if (endKeys.has(current) && path.length > 0) {
        const sig = path.map((s) => s.to.maqamIdName + ":" + s.to.tonicId + "/" + s.modulationCategory).join("|");
        if (!seenSigs.has(sig)) {
          seenSigs.add(sig);
          routes.push({ hops: path.length, steps: [...path] });
        }
      }
      return;
    }
    // Prune: nothing reachable from here to an endKey in `remaining` hops
    const d = distToEnd.get(current);
    if (d === undefined || d > remaining) return;

    const edges = graph.adjacencyList.get(current) ?? [];
    for (const edge of edges) {
      if (visited.has(edge.targetNodeKey)) continue; // simple paths only
      visited.add(edge.targetNodeKey);
      path.push({
        from: graph.nodes.get(current)!,
        to: edge.targetNode,
        modulationDegree: edge.degree,
        modulationCategory: edge.category,
      });
      dfs(edge.targetNodeKey, remaining - 1, path, visited);
      path.pop();
      visited.delete(edge.targetNodeKey);
      if (routes.length >= limit) return;
    }
  };

  for (let targetDepth = 1; targetDepth <= maxHops && routes.length < limit; targetDepth++) {
    for (const sk of startKeys) {
      if (routes.length >= limit) break;
      const visited = new Set<string>([sk]);
      dfs(sk, targetDepth, [], visited);
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
          steps: [...route.steps, ...nextRoute.steps],
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
    returnToStartingMaqam?: boolean;
    maxRoutes?: number;
    limitToShortestHops?: boolean;
  }
): {
  journeys: ModulationJourney[];
  /**
   * Present only when returnToStartingMaqam=true. All shortest return
   * routes from the canonical target back to any register-equivalent of
   * the source (with trailing register-shift to the canonical source
   * when needed). Decoupled from journeys to avoid cartesian duplication.
   */
  returnRoutes?: ModulationRoute[];
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
    returnToStartingMaqam = false,
    maxRoutes = 10,
    limitToShortestHops = true,
  } = options;

  // Internal alias used as the enumeration cap across BFS / segment routines,
  // which predate the public-facing `maxRoutes` name.
  const limit = maxRoutes;

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

  // Source is pinned to its canonical tonic — a journey "from maqām X"
  // starts on X's canonical tonic by convention, never on an octave sibling.
  // Target is also pinned to the specific node `findNodeKey` resolved: the
  // exact match when `toTonic` is given, otherwise the canonical (first
  // non-transposition sibling).
  //
  // Register siblings no longer need special handling in this function —
  // `buildModulationGraph` emits 8va/8vb edges between every pair of adjacent
  // register-equivalent siblings, so BFS reaches siblings naturally via those
  // edges (and chains them for multi-octave jumps such as muḥayyar → dūgāh →
  // qarār dūgāh). The previous multi-target resolution and trailing
  // register-shift post-processing are therefore redundant and have been
  // removed.

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

  // Find outbound routes.
  //   - no waypoints: single-source / single-target BFS over the graph
  //     (which includes register-shift edges between siblings).
  //   - with waypoints: segment-chaining behaviour as before.
  let outboundRoutes: ModulationRoute[];

  if (waypoints.length === 0) {
    outboundRoutes = bfsShortestPaths(
      graph,
      [sourceNodeKey],
      new Set([targetNodeKey]),
      maxHops,
      limit,
      limitToShortestHops
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

  // Build outbound journeys. Returns are computed separately below because
  // every outbound journey ends on the same canonical target, so any return
  // route applies to any outbound — pairing them individually would just
  // duplicate the same return list N times.
  const journeys: ModulationJourney[] = [];
  for (const outbound of outboundRoutes) {
    if (journeys.length >= limit) break;
    journeys.push({
      routeNumber: journeys.length + 1,
      outboundRoute: outbound,
    });
  }

  let returnRoutes: ModulationRoute[] | undefined;
  if (returnToStartingMaqam) {
    // Return path: canonical target → canonical source. Uses the full
    // `maxHops` budget — since outbound and return are independent top-level
    // collections (not paired per journey), the return BFS should have its
    // own full hop budget, not whatever was "left over" from the outbound.
    // A long outbound (e.g. 4 hops to qarār dūgāh) would otherwise leave no
    // room for a return.
    returnRoutes = bfsShortestPaths(
      graph,
      [targetNodeKey],
      new Set([sourceNodeKey]),
      maxHops,
      limit,
      limitToShortestHops
    );
  }

  return {
    journeys,
    returnRoutes,
    sourceNode,
    targetNode,
    waypointNodes,
  };
}
