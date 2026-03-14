import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.AI_PROVIDER_API_KEY || '' 
});

export async function POST(req: Request) {
  try {
    const { message, incidentContext } = await req.json();

    if (!process.env.AI_PROVIDER_API_KEY) {
      return Response.json({ error: 'AI API Key not configured' }, { status: 500 });
    }

    const systemInstruction = `You are a Senior DevOps Engineer helping an administrator troubleshoot a server incident.
    The user is asking you questions through the SOC Dashboard.
    Keep your answers concise, actionable, and focused on Linux/PostgreSQL/Node.js debugging.`;

    const promptContext = incidentContext 
      ? `\nContext: The user is currently looking at this incident: \n--- \nName: ${incidentContext.alert_name}\nTarget: ${incidentContext.service}\nAI Root Cause: ${incidentContext.root_cause}\n---\n` 
      : `\nContext: The user is asking a general question.\n`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: promptContext + "User Question: " + message,
      config: {
        systemInstruction,
      }
    });

    return Response.json({ response: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return Response.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
