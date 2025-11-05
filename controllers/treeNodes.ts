import type { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseServer.js";
import { supabase } from "../lib/supabaseClient.js";
import {
  getStartingNodeChildren as getStartingNodeChildren,
  type Tree,
} from "../utils/nodes.js";

// validation schemas
const createNodeSchema = z.object({
  parentId: z.number(),
  startingNode: z.number().optional(),
  operation: z.string(),
  value: z.number(),
});

const createFirstNodeSchema = z.object({
  value: z.number(),
});

export async function createChildNode(req: Request, res: Response) {
  try {
    const parseResult = createNodeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.message });
    }
    const { operation, parentId, startingNode, value } = parseResult.data;
    // checking if the user is authenticated
    console.log("getting user");
    const currentUser = await supabase.auth.getUser();
    if (currentUser.error)
      return res.status(401).json({
        error: "Not authorized",
        details: "please logiin or sign up in order to create nodes",
      });
    console.log(
      "data is :",
      currentUser.data.user.id,
      operation,
      value,
      parentId
    );
    // creating the node
    const { data: createdNodes, error: createError } = await supabaseAdmin
      .from("tree-node")
      .insert([
        {
          operation,
          "user-id": currentUser.data.user.id,
          "parent-id": parentId,

          value: value,
        },
      ])
      .select();
    console.log("created nodes", createdNodes);
    if (createError) {
      console.error("Supabase createUser error:", createError);
      return res.status(400).json({
        error: createError.message || "Failed to create the node",
        details: "failed to create the node",
      });
    }

    const createdNode = createdNodes && createdNodes[0];
    console.log("created node");
    if (!createdNode) {
      return res.status(500).json({
        error: "Internal Server Error",
        details: "Can not create the node",
      });
    }
    // creating the relationship
    const { data, error: createRelationError } = await supabaseAdmin
      .from("parent-child-relation")
      .insert([
        {
          childid: createdNode.id,
          parentid: parentId,
        },
      ]);

    if (createRelationError) {
      return res.status(400).json({
        error: createRelationError.message,
        details: "Failed to create the relation row",
      });
    }
    if (startingNode) {
      const newTree = await getStartingNodeChildren({
        startingNodeId: startingNode,
      });
      return res.status(201).json({
        message: "Node created",
        data: {
          newTree,
        },
      });
    } else
      return res.status(201).json({
        message: "Node created",
        data: {
          success: true,
        },
      });
  } catch (err) {
    console.error("create child node error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createFirstNode(req: Request, res: Response) {
  try {
    const parseResult = createFirstNodeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.message });
    }
    const { value } = parseResult.data;
    // checking if the user is authenticated
    const currentUser = await supabase.auth.getUser();
    console.log("current user", currentUser);
    if (currentUser.error)
      return res.status(401).json({
        error: "Not authorized",
        details: "please logiin or sign up in order to create nodes",
      });

    // creating the node
    console.log("inserting");
    const { data: createdNodes, error: createError } = await supabaseAdmin
      .from("tree-node")
      .insert([
        {
          "user-id": currentUser.data.user.id,
          value: value,
          "is-starting-node": true,
        },
      ])
      .select();
    console.log("created nodes", createdNodes);
    if (createError) {
      console.error("Error when creating the first node", createError);
      return res.status(400).json({
        error: createError.message || "Failed to create the node",
        details: "failed to create the node",
      });
    }

    const createdNode = createdNodes && createdNodes[0];
    if (!createdNode) {
      return res.status(500).json({
        error: "Internal Server Error",
        details: "Can not create the node",
      });
    }
    return res.status(201).json({
      message: "Node created",
      createdNode,
    });
  } catch (err) {
    console.error("create first node error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllTrees(req: Request, res: Response) {
  try {
    const startingNodesRes = await supabaseAdmin
      .from("tree-node")
      .select("*")
      .eq("is-starting-node", true);
    console.log("starting nodes", startingNodesRes);
    const startingNodes = startingNodesRes.data;
    console.log("startingnodes data", startingNodes);
    if (!startingNodes)
      return res.status(500).json({
        details: "Innternal server error, can not get the starting ndoes",
      });
    const allTrees: Tree[] = [];

    for (let node of startingNodes) {
      const tree = await getStartingNodeChildren({
        startingNodeId: node.id,
      });
      console.log("tree", tree);
      allTrees.push(tree);
    }
    console.log("all trees", allTrees);
    return res.status(200).json({ data: allTrees });
  } catch (err) {
    console.error("get all trees error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
