import { join } from "path";
import { parseFileToRows } from "../../../helpers/fileParser";

export async function run(dir: string): Promise<[number, string]> {
  const filePath = join(dir, `${process.env.FILE}.txt`);
  let lines = await parseFileToRows(filePath);

  const computers = new Map<string, Set<string>>();
  for (let line of lines) {
    const [a, b] = line.split("-");
    if (!computers.has(a)) computers.set(a, new Set());
    if (!computers.has(b)) computers.set(b, new Set());
    computers.get(a)!.add(b);
    computers.get(b)!.add(a);
  }

  let task1 = 0;
  const groupsOfThree = findNetworks(computers);
  for (let g of groupsOfThree) {
    const candidates = g.filter((c) => c.charAt(0) === "t");
    if (candidates.length > 0) task1++;
  }

  const task2 = findLargestClique(lines).join(",");

  return [task1, task2];
}

function findNetworks(computers: Map<string, Set<string>>): string[][] {
  const networks: string[][] = [];

  for (const [node, neighbors] of computers.entries()) {
    const neighborsArray = Array.from(neighbors);
    for (let i = 0; i < neighborsArray.length; i++) {
      const n1 = neighborsArray[i];
      const n1Neighbors = computers.get(n1) || new Set();

      for (let j = i + 1; j < neighborsArray.length; j++) {
        const n2 = neighborsArray[j];
        if (n1Neighbors.has(n2)) {
          const network = [node, n1, n2].sort((a, b) => a.localeCompare(b));
          networks.push(network);
        }
      }
    }
  }

  return Array.from(new Set(networks.map((network) => network.join(",")))).map(
    (network) => network.split(",")
  );
}

function findLargestClique(edges: string[]): string[][] {
  // --- 1) Build adjacency info ---
  // Use a Map<string, Set<string>> to store neighbors.
  const adjacency = new Map<string, Set<string>>();

  // Helper to ensure a key in the adjacency map.
  function ensureNode(node: string) {
    if (!adjacency.has(node)) {
      adjacency.set(node, new Set<string>());
    }
  }

  // Parse edges
  for (const edge of edges) {
    const [a, b] = edge.split("-");
    ensureNode(a);
    ensureNode(b);
    adjacency.get(a)!.add(b);
    adjacency.get(b)!.add(a);
  }

  // Gather all unique nodes
  const nodes = Array.from(adjacency.keys());

  // --- 2) Bron–Kerbosch Algorithm ---
  // Keep track of all maximal cliques in `allCliques`.
  const allCliques: Set<string>[] = [];

  /**
   * Bron–Kerbosch (recursive) with pivot.
   * @param R The current clique (confirmed members).
   * @param P Potential nodes that can still join R.
   * @param X Nodes that must not be considered again for R.
   */
  function bronKerbosch(R: Set<string>, P: Set<string>, X: Set<string>): void {
    // If P and X are empty, we found a maximal clique
    if (P.size === 0 && X.size === 0) {
      // Push a copy of R (since sets are mutable)
      allCliques.push(new Set(R));
      return;
    }

    // Pivot selection: pick any from P (simplest pivot)
    const pivot = P.values().next().value;
    // Neighborhood of pivot
    const pivotNeighbors = pivot
      ? adjacency.get(pivot) ?? new Set<string>()
      : new Set<string>();

    // Iterate over P \ pivotNeighbors
    const pMinusPivotNeighbors = difference(P, pivotNeighbors);
    for (const v of pMinusPivotNeighbors) {
      // R ∪ {v}
      const Rv = new Set(R).add(v);
      // P ∩ N(v)
      const Pv = intersection(P, adjacency.get(v) ?? new Set<string>());
      // X ∩ N(v)
      const Xv = intersection(X, adjacency.get(v) ?? new Set<string>());

      bronKerbosch(Rv, Pv, Xv);

      // Move v from P to X
      P.delete(v);
      X.add(v);
    }
  }

  // --- Helpers for set operations ---
  function difference(setA: Set<string>, setB: Set<string>): Set<string> {
    const diff = new Set<string>();
    for (const elem of setA) {
      if (!setB.has(elem)) {
        diff.add(elem);
      }
    }
    return diff;
  }

  function intersection(setA: Set<string>, setB: Set<string>): Set<string> {
    const inter = new Set<string>();
    for (const elem of setA) {
      if (setB.has(elem)) {
        inter.add(elem);
      }
    }
    return inter;
  }

  // --- 3) Run Bron–Kerbosch ---
  bronKerbosch(new Set(), new Set(nodes), new Set());

  // --- 4) Filter out only the largest cliques ---
  if (allCliques.length === 0) {
    return [];
  }
  const maxSize = Math.max(...allCliques.map((c) => c.size));
  const largestCliques = allCliques
    .filter((c) => c.size === maxSize)
    .map((c) => Array.from(c).sort());

  return largestCliques;
}
