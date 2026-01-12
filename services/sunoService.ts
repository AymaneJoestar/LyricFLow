import { SongLyrics } from "../types";

// NOTE: Since Suno does not have a single standard public API endpoint (often uses partners or wrappers),
// this service is structured to be easily adapted to whichever specific endpoint/wrapper you use.
// It currently includes a MOCK fallback to ensure the UI works for demonstration.

const SUNO_API_URL = process.env.SUNO_API_URL || "https://api.suno-wrapper.com/generate";
const API_KEY = process.env.SUNO_API_KEY || "";

export const generateSunoAudio = async (lyrics: SongLyrics): Promise<string> => {
  // --- MOCK MODE (Activates if no API Key is set) ---
  if (!API_KEY) {
    console.warn("No Suno API Key found. Using Mock Mode.");
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3s generation time

    // Return a sample royalty-free track for demo purposes
    return "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3";
  }

  // --- SUNIAPI.ORG IMPLEMENTATION ---
  try {
    const formattedPrompt = lyrics.structure
      .map(s => `[${s.type}]\n${s.content}`)
      .join('\n\n')
      .substring(0, 2500); // 3000 char max for V4

    // 1. Start Generation
    const generateUrl = `${SUNO_API_URL}/api/v1/generate`;
    const payload = {
      prompt: formattedPrompt,
      tags: lyrics.styleDescription.substring(0, 200),
      title: lyrics.title.substring(0, 80),
      model: "V4",
      customMode: true,
      instrumental: false,
      mv: "chirp-v4",
      callBackUrl: "https://lyricflow.local/api/callback" // Required by API, but we will poll
    };

    console.log("Starting Generation:", generateUrl);

    // First Request: Create Task
    const startResponse = await fetch(generateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!startResponse.ok) {
      const err = await startResponse.text();
      throw new Error(`Suno Start Error (${startResponse.status}): ${err}`);
    }

    const startData = await startResponse.json();
    console.log("Task Started:", startData);

    // sunoapi.org returns nested data: { code: 200, msg: "success", data: { taskId: "..." } }
    const taskId = startData.data?.taskId || startData.taskId || startData.id;

    // If we can't find an ID, maybe it returned the clips directly?
    if (!taskId) {
      // Check for direct clips
      const directClip = startData[0]?.audio_url || startData.data?.[0]?.audio_url;
      if (directClip) return directClip;
      throw new Error("No Task ID or Audio URL returned. Response: " + JSON.stringify(startData));
    }

    // 2. Poll for Completion (Correct Endpoint: /api/v1/generate/record-info?taskId=...)
    const pollUrl = `${SUNO_API_URL}/api/v1/generate/record-info?taskId=${taskId}`;
    let attempts = 0;
    const maxAttempts = 60; // 5 mins max

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(r => setTimeout(r, 5000)); // Wait 5s

      console.log(`Polling Task ${taskId} (Attempt ${attempts})...`);
      const pollResponse = await fetch(pollUrl, {
        headers: { "Authorization": `Bearer ${API_KEY}` }
      });

      if (!pollResponse.ok) continue;

      const pollData = await pollResponse.json();
      console.log("Poll Response:", pollData);

      // The 'data' field likely contains the record info directly
      const record = pollData.data;
      console.log(`Task Status: ${record.status}`);

      // AGGRESSIVE AUDIO CHECK: 
      // Sometimes status is 'TEXT_SUCCESS' but audio is ready, or status is non-standard.
      // We check for audio_url regardless of status.
      let clip = null;
      if (Array.isArray(record.response)) {
        clip = record.response[0];
      } else if (record.response && typeof record.response === 'object') {
        // Check for sunoData (seen in latest logs)
        if (Array.isArray(record.response.sunoData)) {
          clip = record.response.sunoData[0];
        } else {
          // Fallback for direct object
          clip = record.response[0] || record.response;
        }
      } else {
        clip = record.clips?.[0];
      }

      // Check for audioUrl (camelCase) or audio_url (snake_case)
      const url = clip?.audioUrl || clip?.audio_url || clip?.url;
      if (url) {
        console.log("Audio found:", url);
        return url;
      }
      if (record.audio_url) return record.audio_url;

      // Status Check for Errors
      if (record.status === 'FAILED' || record.status === 'error') {
        throw new Error("Generation failed: " + (record.errorMessage || "Unknown error"));
      }

      // If status is 'SUCCESS' or 'complete' but we found no audio above:
      if (record.status === 'SUCCESS' || record.status === 'complete') {
        // Did we miss it? 
        console.warn("Status is success but no audio found in response:", record);
      }
    }

    throw new Error("Generation timed out.");

  } catch (error: any) {
    console.error("Audio Generation Failed:", error);
    throw new Error(error.message || "Unknown error");
  }
};