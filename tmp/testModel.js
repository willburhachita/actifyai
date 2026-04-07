import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDaxTD2vU4eD9tJjthJ-BFFAEdmz3_4JKo");

async function run() {
  try {
    const models = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDaxTD2vU4eD9tJjthJ-BFFAEdmz3_4JKo");
    const data = await models.json();
    console.log("AVAILABLE MODELS:");
    for (const m of data.models) {
      if (m.name.includes("gemini")) {
        console.log(m.name, m.supportedGenerationMethods);
      }
    }
    
    // Also test generating content with exactly what we plan to use.
    // The previous error was 404 models/gemini-1.5-flash is not found.
    // Let's use whatever is returned.
  } catch (err) {
    console.error("Test failed", err);
  }
}
run();
