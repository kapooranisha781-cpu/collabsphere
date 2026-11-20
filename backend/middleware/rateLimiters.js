import rateLimit from "express-rate-limit";
import ApiError from "../utils/ApiError.js";

// AI endpoints: har user ke liye 10 requests per minute (protect ke BAAD lagana)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  handler: (req, res, next) =>
    next(new ApiError(429, "Too many AI requests. Please wait a minute and try again.")),
});