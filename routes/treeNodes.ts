// src/routes/authRoutes.ts
import { Router } from "express";
import {
  createChildNode,
  createFirstNode,
  getAllTrees,
} from "../controllers/treeNodes.js";

const router = Router();

router.post("/add-starting-node", createFirstNode);
router.post("/add-child-node", createChildNode);
router.get("/get-all-trees", getAllTrees);

export default router;
