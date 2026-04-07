import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDaxTD2vU4eD9tJjthJ-BFFAEdmz3_4JKo");

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Explain APIs simply");
    const response = await result.response;
    console.log("SUCCESS! RESPONDED:", response.text());
  } catch (err) {
    console.error("Test failed", err);
  }
}
run();
