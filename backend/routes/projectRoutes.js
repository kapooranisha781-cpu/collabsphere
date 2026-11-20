import express from "express";
import { body, param } from "express-validator";
import {
  createProject,
  getProjects,
  getDashboardSummary,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  toggleSharing,
  getProjectActivity,
  getRecentActivity,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { projectAccess, ownerOnly } from "../middleware/projectAccess.js";
import validate from "../middleware/validate.js";

const router = express.Router();
router.use(protect); // is file ke saare routes login maangte hain

const projectRules = [
  body("name").trim().isLength({ min: 3, max: 80 }).withMessage("Project name must be 3-80 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description max 500 characters"),
];

router.post("/", projectRules, validate, createProject);
router.get("/", getProjects);
router.get("/dashboard/summary", getDashboardSummary); // /:projectId se PEHLE hona zaroori hai
router.get("/activity", getRecentActivity);
router.get("/:projectId", projectAccess, getProject);
router.get("/:projectId/activity", projectAccess, getProjectActivity);

router.put(
  "/:projectId",
  projectAccess,
  ownerOnly,
  [
    body("name").optional().trim().isLength({ min: 3, max: 80 }).withMessage("Project name must be 3-80 characters"),
    body("description").optional().trim().isLength({ max: 500 }).withMessage("Description max 500 characters"),
    body("readme").optional().isString().isLength({ max: 50000 }).withMessage("README too long"),
  ],
  validate,
  updateProject
);
router.delete("/:projectId", projectAccess, ownerOnly, deleteProject);

router.post(
  "/:projectId/members",
  projectAccess,
  ownerOnly,
  [body("email").trim().toLowerCase().isEmail().withMessage("Please provide a valid email")],
  validate,
  addMember
);
router.delete(
  "/:projectId/members/:memberId",
  projectAccess,
  ownerOnly,
  [param("memberId").isMongoId().withMessage("Invalid member id")],
  validate,
  removeMember
);

router.put(
  "/:projectId/share",
  projectAccess,
  ownerOnly,
  [body("enabled").isBoolean().withMessage("enabled must be true or false").toBoolean()],
  validate,
  toggleSharing
);

export default router;