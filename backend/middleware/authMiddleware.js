import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Protects a route. Expects the header:  Authorization: Bearer <token>
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized. Please log in.");
  }

  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, env.jwtSecret); // throws if invalid/expired (handled by errorHandler)

  // The user might have been deleted after the token was issued
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "User no longer exists. Please log in again.");
  }

  req.user = user;
  next();
});