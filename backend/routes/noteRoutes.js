import express from "express";
import { body } from "express-validator";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

const router = express.Router();
router.use(protect);

router.post(
  "/",
  [
    body("projectId").isMongoId().withMessage("Valid projectId is required"),
    body("title").trim().isLength({ min: 1, max: 120 }).withMessage("Title is required (max 120 characters)"),
    body("content").optional().isString().isLength({ max: 50000 }).withMessage("Content too long"),
    body("isPublic").optional().isBoolean().withMessage("isPublic must be true or false").toBoolean(),
  ],
  validate,
  createNote
);

router.get("/detail/:noteId", getNote); // /:projectId se PEHLE
router.get("/:projectId", getNotes);

router.put(
  "/:noteId",
  [
    body("title").optional().trim().isLength({ min: 1, max: 120 }).withMessage("Title must be 1-120 characters"),
    body("content").optional().isString().isLength({ max: 50000 }).withMessage("Content too long"),
    body("isPublic").optional().isBoolean().withMessage("isPublic must be true or false").toBoolean(),
  ],
  validate,
  updateNote
);
router.delete("/:noteId", deleteNote);

export default router;