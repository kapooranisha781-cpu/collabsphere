import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  // The password is hashed automatically by the pre("save") hook in the model
  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { user, token: generateToken(user._id) },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // password has select:false, so we must ask for it explicitly
  const user = await User.findOne({ email }).select("+password");

  // Same message for "no such user" and "wrong password" so attackers can't tell which emails exist
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({
    success: true,
    message: "Logged in successfully",
    data: { user, token: generateToken(user._id) },
  });
});

// GET /api/auth/me  (protected)
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Profile fetched",
    data: { user: req.user },
  });
});