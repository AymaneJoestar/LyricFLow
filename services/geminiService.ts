
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationInput, SongLyrics } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateSongLyrics = async (input: GenerationInput): Promise<SongLyrics> => {
  const modelId = "gemini-3-flash-preview";

  let specificPrompt = '';
  if (input.mode === 'standard') {
    specificPrompt = `Topic: ${input.topic}\nMood: ${input.mood}\nGenre: ${input.genre}\nDetails: ${input.additionalInfo || "None"}`;
  } else {
    specificPrompt = `Style Reference Songs: ${input.songs.join(', ')}\nDetails: ${input.additionalInfo || "None"}`;
  }

  const prompt = `Write a high-quality, professional song based on:\n${specificPrompt}\n\nInclude Verse/Chorus structure and rhyme scheme. Also suggest 5 real matching songs.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: `You are a world-class songwriter and music critic. 
        1. Write lyrics that strictly match the requested style/topic.
        2. Provide 5 music recommendations that perfectly match the VIBE of the generated lyrics.
        3. Recommendations must be real, existing songs.
        4. Include a mix of popular hits and "deep cuts" (lesser known but perfect matches).
        5. For "reason", explain the sonic connection (e.g. "Similar tempo and synth texture", "Matches the lyrical theme of heartbreak").`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            styleDescription: { type: Type.STRING },
            structure: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ["type", "content"],
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["title", "artist", "reason"],
              },
            },
          },
          required: ["title", "styleDescription", "structure", "recommendations"],
        },
      },
    });

    return JSON.parse(response.text) as SongLyrics;
  } catch (error) {
    console.error("Lyrics Error:", error);
    throw error;
  }
};
