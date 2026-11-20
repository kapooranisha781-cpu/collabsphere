import multer from "multer";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import ApiError from "../utils/ApiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOAD_DIR = path.resolve(__dirname, "../uploads");

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const TEXT_EXTENSIONS = [
  ".js", ".py", ".html", ".css", ".json", ".md", ".txt"
];

export const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

const ALLOWED_EXTENSIONS = [
  ...TEXT_EXTENSIONS,
  ...IMAGE_EXTENSIONS,
  ".pdf"
];

const BINARY_MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf"
};

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new ApiError(400, "File type not allowed"));
  }

  if (BINARY_MIME[ext] && BINARY_MIME[ext] !== file.mimetype) {
    return cb(new ApiError(400, "File content type does not match its extension"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

export default upload;
