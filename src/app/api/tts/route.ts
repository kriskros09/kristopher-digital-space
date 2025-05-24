import { NextRequest, NextResponse } from "next/server";
import { AI_VOICE_INSTRUCTIONS } from "@/server/constants/aiPrompts";
import { logLlmInteraction } from "@/server/lib/llmLogger";
import { getUserIdSafe } from '@/lib/supabase/getUserId';



export async function POST(req: NextRequest) {
  const route = "/api/tts";
  const timestamp = new Date().toISOString();
  const userId = await getUserIdSafe();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      await logLlmInteraction({
        timestamp,
        user_id: userId,
        route,
        prompt: text || "",
        response: "",
        status: "invalid-request",
        error: "Missing or invalid text",
      });
      return NextResponse.json({ error: "Missing or invalid text" }, { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY_PRIVATE;
    if (!apiKey) {
      await logLlmInteraction({
        timestamp,
        user_id: userId,
        route,
        prompt: text,
        response: "",
        status: "error",
        error: "Missing OpenAI API key",
      });
      return NextResponse.json({ error: "Missing OpenAI API key" }, { status: 500 });
    }
    const ttsRes = await fetch(`${process.env.OPENAI_API_URL}/v1/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        instructions: AI_VOICE_INSTRUCTIONS,
        voice: "alloy",
        response_format: "mp3",
      }),
    });
    if (!ttsRes.ok) {
      await logLlmInteraction({
        timestamp,
        user_id: userId,
        route,
        prompt: text,
        response: "",
        status: "error",
        error: "TTS request failed",
      });
      return NextResponse.json({ error: "TTS request failed" }, { status: 500 });
    }
    const audioBuffer = await ttsRes.arrayBuffer();
    const base64Audio = Buffer.from(new Uint8Array(audioBuffer)).toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    await logLlmInteraction({
      timestamp,
      user_id: userId,
      route,
      prompt: text,
      response: audioUrl ? "[audioUrl]" : "",
      status: "success",
    });
    return NextResponse.json({ audioUrl });
  } catch (err) {
    console.error("[api/tts][POST] Unexpected error:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    await logLlmInteraction({
      timestamp: new Date().toISOString(),
      user_id: userId,
      route: "/api/tts",
      prompt: "",
      response: "",
      status: "error",
      error: errorMsg,
    });
    return NextResponse.json({ error: "Server error", details: err }, { status: 500 });
  }
} 