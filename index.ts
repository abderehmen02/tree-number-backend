import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import treeNodesRoutes from "./routes/treeNodes.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.get("/", (req, res) => res.status(200).json({ success: true }));
app.use("/auth", authRoutes);
app.use("/tree-nodes", treeNodesRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:3000");
});
