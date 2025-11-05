// src/routes/authRoutes.ts
import { Router } from "express";
import {
  signup,
  signIn,
  getUserMetadata,
} from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signIn);
router.get("/get-user", getUserMetadata);
export default router;
