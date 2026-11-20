import { GoogleGenAI } from "@google/genai";
import env from "../config/env.js";
import ApiError from "./ApiError.js";

let client = null;

const getClient = () => {
  if (!env.geminiApiKey) {
    throw new ApiError(
      503,
      "AI is not configured. Please add GEMINI_API_KEY to backend/.env",
    );
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: env.geminiApiKey,
    });
  }

  return client;
};

export const askGemini = async ({ systemInstruction, prompt }) => {
  try {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const result = (response.text || "").trim();

    if (!result) {
      throw new ApiError(
        502,
        "Gemini returned an empty response. Please try again.",
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Log complete error in backend terminal
    console.error("\n========== GEMINI API ERROR ==========");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("Code:", error.code);
    console.error("Details:", error.errorDetails);
    console.error("Full Error:", error);
    console.error("======================================\n");

    const status = Number(error.status || error.code);

    if (status === 429) {
      throw new ApiError(
        429,
        "Gemini quota exceeded. Please wait and try again.",
      );
    }

    if (status === 503) {
      throw new ApiError(
        503,
        "Gemini is temporarily busy. Please try again after a minute.",
      );
    }

    if (status === 404) {
      throw new ApiError(
        502,
        `Gemini model "${env.geminiModel}" was not found. Check GEMINI_MODEL in backend/.env.`,
      );
    }

    if (status === 401 || status === 403) {
      throw new ApiError(
        502,
        "Gemini API authentication failed. Check your API key and permissions.",
      );
    }

    if (status === 400) {
      throw new ApiError(502, `Gemini rejected the request: ${error.message}`);
    }

    throw new ApiError(
      502,
      "Gemini service is unavailable. Check the backend terminal for details.",
    );
  }
};
