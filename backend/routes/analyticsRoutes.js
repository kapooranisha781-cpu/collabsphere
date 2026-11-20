import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { projectAccess } from "../middleware/projectAccess.js";

const router = express.Router();

router.get("/:projectId", protect, projectAccess, getAnalytics);

export default router;