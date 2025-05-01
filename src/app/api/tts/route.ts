import { NextRequest, NextResponse } from "next/server";
import { AI_VOICE_INSTRUCTIONS } from "@/constants/aiPrompts";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text" }, { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OpenAI API key" }, { status: 500 });
    }
    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      
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
      return NextResponse.json({ error: "TTS request failed" }, { status: 500 });
    }
    const audioBuffer = await ttsRes.arrayBuffer();
    const base64Audio = Buffer.from(new Uint8Array(audioBuffer)).toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    return NextResponse.json({ audioUrl });
  } catch (err) {
    return NextResponse.json({ error: "Server error", details: err }, { status: 500 });
  }
} 