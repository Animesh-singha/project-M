import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const AI_PROVIDER_API_KEY = process.env.AI_PROVIDER_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'gemini-2.5-flash'; 

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: AI_PROVIDER_API_KEY });

export const generateRootCause = async (alertData: any, context: { metricsContext: string, logsContext: string }) => {
  const systemInstruction = `You are a Senior Security Operations Center (SOC) Analyst and Platform Engineer. 
  Your goal is to transform raw alerts, metrics, and logs into structured intelligence.
  
  Provide a JSON response with these exact fields:
  1. "severity": (string) One of: "LOW", "MEDIUM", "HIGH", "CRITICAL".
  2. "summary": (string) Executive summary of the situation.
  3. "root_cause": (string) Technical explanation of the primary failure.
  4. "suggested_fix": (string) Actionable remediation steps.
  5. "confidence": (number) Integer from 0 to 100 based on evidence strength.
  
  Do not include markdown or text outside the JSON.`;

  const userPrompt = `
  Alert Details:
  Name: ${alertData.labels?.alertname}
  Severity: ${alertData.labels?.severity}
  Instance: ${alertData.labels?.instance}
  Description: ${alertData.annotations?.description || alertData.annotations?.summary}
  
  Correlated Context:
  ${context.metricsContext}
  
  ${context.logsContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const content = response.text;
    
    // Attempt to parse JSON response safely
    try {
      if (content) {
         return JSON.parse(content);
      } else {
          throw new Error("Empty response from Gemini");
      }
    } catch (e) {
      console.error("AI response not strictly JSON. Fallback applying.", content);
      return {
        summary: "AI generated a non-JSON response.",
        root_cause: content,
        suggested_fix: "Review AI raw output manually."
      };
    }
  } catch (err: any) {
    console.error('Failed to contact Google Gemini API:', err.message);
    return {
      summary: "Failed to generate AI analysis.",
      root_cause: "Gemini API Error",
      suggested_fix: "Check AI_PROVIDER_API_KEY and API health."
    };
  }
};
