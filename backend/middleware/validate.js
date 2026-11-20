import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

// Place this after the validation rules in a route
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((e) => e.msg)
    .join(", ");
  next(new ApiError(400, message));
};

export default validate;