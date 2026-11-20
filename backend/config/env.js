
import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  clientUrl: process.env.CLIENT_URL,
};

// Required environment variables
if (!env.mongoUri || !env.jwtSecret || !env.clientUrl) {
  throw new Error(
    "Required environment variables are missing. Please check MONGO_URI, JWT_SECRET, and CLIENT_URL."
  );
}

// Gemini is optional
if (!env.geminiApiKey) {
  console.log("Gemini API key is missing. AI features will not work.");
}

export default env;
