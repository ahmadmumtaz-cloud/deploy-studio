import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { GeneratedProject, ResearchResult, GenerationMode } from "../types";

const apiKey = process.env.API_KEY;

// Define the schema for the output to ensure we get structured data
const projectSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    projectName: {
      type: Type.STRING,
      description: "A short, creative name for the python project.",
    },
    description: {
      type: Type.STRING,
      description: "A brief summary of what the application does.",
    },
    files: {
      type: Type.ARRAY,
      description: "List of files required for the project.",
      items: {
        type: Type.OBJECT,
        properties: {
          filename: { type: Type.STRING, description: "Name of the file (e.g., app.py, requirements.txt)" },
          content: { type: Type.STRING, description: "The full source code or content of the file." },
          language: { type: Type.STRING, description: "The programming language (python, text, json, html)." }
        },
        required: ["filename", "content", "language"]
      }
    },
    setupInstructions: {
      type: Type.STRING,
      description: "Step-by-step instructions on how to run the application (in Indonesian/English based on prompt)."
    }
  },
  required: ["projectName", "files", "setupInstructions", "description"]
};

export const generatePythonApp = async (prompt: string, mode: GenerationMode = 'standard'): Promise<GeneratedProject> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are an expert Senior Python Engineer and DevOps specialist. 
    Your goal is to generate complete, production-ready Python applications based on user descriptions.
    
    Guidelines:
    1.  **Frameworks:** Prefer Flask for web apps, or standard libraries for CLI tools unless specified otherwise.
    2.  **Structure:** Always include a 'requirements.txt' file for dependencies.
    3.  **Quality:** Code must be modular, follow PEP8, include comments, and handle basic errors.
    4.  **Language:** If the user speaks Indonesian, provide the instructions and description in Indonesian, but keep code comments in English or Indonesian (optional).
    5.  **Completeness:** The code should be ready to run. Do not use placeholders like "insert logic here" unless absolutely necessary. Implement the logic.
    6.  **Files:** Typically generate 'app.py' (or main.py), 'requirements.txt', and optional 'README.md' or HTML templates if needed.
    
    If the user asks for a specific feature (e.g., "AI text summarizer"), mock the AI part using a simple function or suggest a real library like HuggingFace if simple enough, but prioritize running code.
  `;

  let modelName = 'gemini-2.5-flash';
  let config: any = {
    systemInstruction: systemInstruction,
    responseMimeType: "application/json",
    responseSchema: projectSchema,
    temperature: 0.2,
  };

  if (mode === 'fast') {
    modelName = 'gemini-2.5-flash-lite';
  } else if (mode === 'thinking') {
    modelName = 'gemini-3-pro-preview';
    config = {
      ...config,
      thinkingConfig: { thinkingBudget: 32768 },
    };
    // Note: maxOutputTokens should generally not be set when using thinkingConfig unless specifically managed, 
    // but the prompt says "Do not set maxOutputTokens", so we omit it.
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: config,
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedProject;
    } else {
      throw new Error("No response generated from AI.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const researchTechStack = async (query: string): Promise<ResearchResult> => {
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  // Using gemini-2.5-flash with googleSearch as requested
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Find the best Python libraries and recent trends for: ${query}. Summarize concisely.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const sources: Array<{ title: string; uri: string }> = [];
  
  if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
    response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "Source",
          uri: chunk.web.uri,
        });
      }
    });
  }

  return {
    text: response.text || "No results found.",
    sources: sources,
  };
};

export const generateSpeechInstructions = async (text: string): Promise<ArrayBuffer> => {
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");

  // Decode base64 to ArrayBuffer
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// --- Live API Helpers ---

// We export the class/functions needed for the component to handle the connection
// Ideally, the connection logic resides in the component to manage WebSocket state, 
// but we can expose a factory here.

export const createLiveClient = () => {
  if (!apiKey) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey });
};
