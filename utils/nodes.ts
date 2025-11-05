import { supabaseAdmin } from "../lib/supabaseServer.js";
import type { Database } from "../types/supabase.js";

type Node = Database["public"]["Tables"]["tree-node"]["Row"];

export const getStartingNodeChildren = async ({
  startingNodeId,
}: {
  startingNodeId: number;
}): Promise<Node & { children: Node[] }> => {
  const { data, error } = await supabaseAdmin.rpc("get_all_descendants", {
    root_id: startingNodeId,
  });

  if (error) throw error;
  if (!data) throw new Error("No data returned");

  const nodesById = new Map<number, Node & { children: Node[] }>();
  for (const node of data) {
    nodesById.set(node.id, { ...node, children: [] });
  }

  let root: (Node & { children: Node[] }) | null = null;

  for (const node of nodesById.values()) {
    const parentId = node["parent-id"];

    if (parentId === startingNodeId) {
      nodesById.get(startingNodeId)!.children.push(node);
    }

    if (parentId && nodesById.has(parentId)) {
      nodesById.get(parentId)!.children.push(node);
    }

    if (node.id === startingNodeId) {
      root = node;
    }
  }

  if (!root) throw new Error(`Root node ${startingNodeId} not found`);

  return root;
};
