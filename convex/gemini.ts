import { GoogleGenerativeAI } from "@google/generative-ai";

type GeminiUserContext = {
  name?: string;
  maxBudget?: number;
  allowedCategories?: string[];
};

function buildPrompt(message: string, userContext: GeminiUserContext) {
  return `
You are an AI agent for Actify.

Here is the current user context:
- Name: ${userContext.name || "User"}
- Authorized Budget: ${userContext.maxBudget || 0} ACT Tokens
- Allowed Categories: ${userContext.allowedCategories ? userContext.allowedCategories.join(", ") : "None"}

You can:
- search ebay
- check xp
- perform backend tasks

If action is needed, respond like:
ACTION: <name>
DATA: <details>

User: ${message}
`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown Gemini error";
}

export async function askGemini(message: string, userContext: GeminiUserContext): Promise<string | null> {
  // @ts-ignore process is injected by convex
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(buildPrompt(message, userContext));
    const response = await result.response;
    const text = response.text().trim();
    return text.length ? text : null;
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    if (/reported as leaked|403|forbidden/i.test(errorMessage)) {
      console.warn(
        `[Actify WhatsApp] Gemini key rejected or leaked. Falling back to rule-based replies. ${errorMessage}`,
      );
      return null;
    }

    console.error(`[Actify WhatsApp] Gemini request failed. Falling back to rule-based replies. ${errorMessage}`);
    return null;
  }
}
