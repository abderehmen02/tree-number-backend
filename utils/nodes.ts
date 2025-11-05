import { supabaseAdmin } from "../lib/supabaseServer.js";
import type { Database } from "../types/supabase.js";

type Node = Database["public"]["Tables"]["tree-node"]["Row"];
export type Tree = Node & { children: Node[] };
export const getStartingNodeChildren = async ({
  startingNodeId,
}: {
  startingNodeId: number;
}): Promise<Tree> => {
  const { data, error } = await supabaseAdmin.rpc("get_all_descendants", {
    root_id: startingNodeId,
  });

  if (error) throw error;
  if (!data) throw new Error("No data returned");

  const nodesById = new Map<number, Node & { children: Node[] }>();

  // Normalize and initialize children arrays
  for (const raw of data) {
    const node = {
      ...raw,
      parentId: raw["parent-id"],
      userId: raw["user-id"],
      isStartingNode: raw["is-starting-node"],
      children: [] as (Node & { children: Node[] })[],
    };
    nodesById.set(node.id, node);
  }

  let root: (Node & { children: Node[] }) | null = null;

  // Build the tree
  nodesById.forEach((node) => {
    if (node["parent-id"] && nodesById.has(node["parent-id"])) {
      nodesById.get(node["parent-id"])!.children.push(node);
    }
    if (node.id === startingNodeId) {
      root = node;
    }
  });

  if (!root) throw new Error(`Root node ${startingNodeId} not found`);

  return root;
};
