import express from "express";
import { body } from "express-validator";
import { explain, docs, readme, improve } from "../controllers/geminiController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimiters.js";
import validate from "../middleware/validate.js";

const router = express.Router();
router.use(protect, aiLimiter);

const projectRule = body("projectId").isMongoId().withMessage("Valid projectId is required");
const contentRule = body("content")
  .isString()
  .trim()
  .isLength({ min: 1, max: 20000 })
  .withMessage("Content is required (max 20000 characters)");
const languageRule = body("language").optional().isString().isLength({ max: 30 });

router.post("/explain", [projectRule, contentRule, languageRule], validate, explain);
router.post("/docs", [projectRule, contentRule, languageRule], validate, docs);
router.post("/improve", [projectRule, contentRule, languageRule], validate, improve);
router.post(
  "/readme",
  [
    projectRule,
    body("content").optional().isString().isLength({ max: 20000 }),
    body("save").optional().isBoolean().toBoolean(),
  ],
  validate,
  readme
);

export default router;