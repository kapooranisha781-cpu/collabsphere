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

if (!env.mongoUri || !env.jwtSecret || !env.clientUrl) {
  console.log("Please check your .env file. Required values are missing.");
  process.exit(1);
}

if (!env.geminiApiKey) {
  console.log("Gemini API key is missing. AI features will not work.");
}

export default env;