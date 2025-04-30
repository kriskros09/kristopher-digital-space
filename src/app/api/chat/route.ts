import { AI_VOICE_GREETING_INSTRUCTIONS, AI_VOICE_INSTRUCTIONS } from "@/constants/aiPrompts";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";

const SYSTEM_PROMPT = "You may only answer questions about Kristopher using the information provided in the following knowledge files. Do not make up information.";

let cachedKnowledge: string | null = null;
async function getKnowledge() {
  if (cachedKnowledge) return cachedKnowledge;
  const aboutPath = path.join(process.cwd(), "src/knowledge/about.md");
  const linksPath = path.join(process.cwd(), "src/knowledge/links.json");
  const [about, linksRaw] = await Promise.all([
    fs.readFile(aboutPath, "utf-8"),
    fs.readFile(linksPath, "utf-8"),
  ]);
  const links = JSON.parse(linksRaw);
  const linksMarkdown = Object.entries(links)
    .map(([key, url]) => `- [${key.charAt(0).toUpperCase() + key.slice(1)}](${url})`)
    .join("\n");
  cachedKnowledge = `${about}\n\n## Links\n${linksMarkdown}`;
  return cachedKnowledge;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, tts } = await req.json();
    // Allow empty message only for tts === 'welcome'
    if (tts === "welcome") {
      // proceed, no validation needed
    } else if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OpenAI API key" }, { status: 500 });
    }

    // 1. Get AI response (skip for welcome)
    let aiMessage = "";
    if (tts === "welcome") {
      // No AI message needed for welcome
    } else {
      // Always use Kristopher SYSTEM_PROMPT and knowledge
      const knowledge = await getKnowledge();
      const openaiRes = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: knowledge },
          { role: "user", content: message },
        ],
        max_tokens: 256,
        temperature: 0.7,
      });
      aiMessage = openaiRes.choices[0]?.message?.content ?? "No response from AI.";
    }

    // 2. Always generate TTS for every response (except welcome)
    let audioUrl: string | null = null;
    if (tts) {
      const ttsInput = tts === "welcome" ? AI_VOICE_GREETING_INSTRUCTIONS : aiMessage;
      const ttsInstructions = AI_VOICE_INSTRUCTIONS;
      const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: ttsInput,
          instructions: ttsInstructions,
          voice: "alloy",
          response_format: "mp3",
        }),
      });

      if (ttsRes.ok) {
        const audioBuffer = await ttsRes.arrayBuffer();
        const base64Audio = Buffer.from(new Uint8Array(audioBuffer)).toString("base64");
        audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      }
    }

    return NextResponse.json({ aiMessage, audioUrl });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 