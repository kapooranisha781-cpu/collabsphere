import express from "express";
import {
  uploadFile,
  getFiles,
  downloadFile,
  getFileContent,
  deleteFile,
} from "../controllers/fileController.js";
import { protect } from "../middleware/authMiddleware.js";
import { projectAccess } from "../middleware/projectAccess.js";
import upload from "../config/multer.js";

const router = express.Router();
router.use(protect);

// Order important: pehle login, phir access check, TAB upload (unauthorized user ka file disk par nahi jayega)
router.post("/upload/:projectId", projectAccess, upload.single("file"), uploadFile);

router.get("/download/:fileId", downloadFile);
router.get("/content/:fileId", getFileContent);
router.get("/:projectId", getFiles);
router.delete("/:fileId", deleteFile);

export default router;