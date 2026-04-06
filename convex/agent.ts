import { askGemini } from "./gemini";

export async function processMessage(message: string, userContext: any) {
  const aiResponse = await askGemini(message, userContext);

  if (aiResponse.includes("ACTION: search_ebay")) {
    return "🔎 Searching eBay... (connect API next)";
  }

  // Future actions will be parsed and executed here

  return aiResponse;
}
