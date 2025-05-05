import { AI_VOICE_GREETING_INSTRUCTIONS, AI_VOICE_INSTRUCTIONS, CONTACT_KEYWORDS, PROJECT_KEYWORDS, SYSTEM_PROMPT } from "@/server/constants/aiPrompts";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getKnowledge } from "@/lib/knowledge";
import { getProjects } from "@/lib/projects";
import { chatRequestSchema } from "@/lib/validation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_PRIVATE,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = chatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid request", details: parseResult.error }, { status: 400 });
    }
    const { message, tts } = parseResult.data;

    const apiKey = process.env.OPENAI_API_KEY_PRIVATE;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OpenAI API key" }, { status: 500 });
    }

    const lowerMsg = (message || "").toLowerCase();
    const isContactQuestion = CONTACT_KEYWORDS.some(k => lowerMsg.includes(k));
    const isProjectQuestion = PROJECT_KEYWORDS.some(k => lowerMsg.includes(k));

    if (isContactQuestion) {
      const { links } = await getKnowledge();
      return NextResponse.json({
        aiMessage: null,
        type: "contact-info",
        contacts: [
          { name: "LinkedIn", url: links.linkedin },
          { name: "GitHub", url: links.github },
          { name: "Portfolio", url: links.portfolio }
        ],
        audioUrl: null
      });
    }

    if (isProjectQuestion) {
      // Return special project-list message
      try {
        const projects = await getProjects();
        return NextResponse.json({
          aiMessage: null,
          type: "project-list",
          projects,
          audioUrl: null
        });
      } catch (err) {
        return NextResponse.json({ error: "Failed to load projects", details: err }, { status: 500 });
      }
    }

    // 1. Get AI response (skip for welcome)
    let aiMessage = "";
    if (tts === "welcome") {
      // No AI message needed for welcome
    } else {
      // Always use Kristopher SYSTEM_PROMPT and knowledge
      const { markdown } = await getKnowledge();
      const openaiRes = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: markdown },
          { role: "user", content: message || "" },
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
      const ttsRes = await fetch(`${process.env.OPENAI_API_URL}/v1/audio/speech`, {
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
    return NextResponse.json({ error: "Server error", details: err }, { status: 500 });
  }
} 