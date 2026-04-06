import { GoogleGenerativeAI } from "@google/generative-ai";

// @ts-ignore process is injected by convex
const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function askGemini(message: string, userContext: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
You are an AI agent for Actify.

Here is the current user context:
- Name: ${userContext.name || 'User'}
- Authorized Budget: ${userContext.maxBudget || 0} ACT Tokens
- Allowed Categories: ${userContext.allowedCategories ? userContext.allowedCategories.join(', ') : 'None'}

You can:
- search ebay
- check xp
- perform backend tasks

If action is needed, respond like:
ACTION: <name>
DATA: <details>

User: ${message}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}
