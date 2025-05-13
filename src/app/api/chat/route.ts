import { AI_VOICE_GREETING_INSTRUCTIONS, AI_VOICE_INSTRUCTIONS, CONTACT_KEYWORDS, PROJECT_KEYWORDS, SYSTEM_PROMPT } from "@/server/constants/aiPrompts";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getKnowledge } from "@/lib/knowledge";
import { getProjects } from "@/lib/projects";
import { chatRequestSchema } from "@/lib/utils/chatRequestSchema";
import { logLlmInteraction } from "@/server/lib/llmLogger";
import { createClient } from '@/lib/supabase/server';
import { validateRequest } from "@/lib/utils/validateRequest";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_PRIVATE,
});

export async function POST(req: NextRequest) {
  const route = "/api/chat";
  const timestamp = new Date().toISOString();
  let userId: string | undefined = undefined;
  try {
    // Get Supabase user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;

    // --- Rate limiting by IP ---
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rate = await checkRateLimit(ip);
    if (!rate.success) {
      await logLlmInteraction({
        timestamp,
        user_id: userId,
        route,
        prompt: "",
        response: "",
        status: "rate-limit",
        error: "Too many requests",
      });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // --- Input validation with Zod ---
    const { data: parsed, error: validationError } = await validateRequest<z.infer<typeof chatRequestSchema>>(req, chatRequestSchema);
    if (validationError) {
      await logLlmInteraction({
        timestamp,
        user_id: userId,
        route,
        prompt: JSON.stringify(parsed) || "",
        response: "",
        status: "invalid-request",
        error: JSON.stringify(validationError),
      });
      return NextResponse.json({ error: "Invalid request", details: validationError }, { status: 400 });
    }
    const { message, tts } = parsed || {};

    const apiKey = process.env.OPENAI_API_KEY_PRIVATE;
    if (!apiKey) {
      await logLlmInteraction({
        timestamp,
        user_id: userId,
        route,
        prompt: message || "",
        response: "",
        status: "error",
        error: "Missing OpenAI API key",
      });
      return NextResponse.json({ error: "Missing OpenAI API key" }, { status: 500 });
    }

    const lowerMsg = (message || "").toLowerCase();
    const isContactQuestion = CONTACT_KEYWORDS.some(k => lowerMsg.includes(k));
    const isProjectQuestion = PROJECT_KEYWORDS.some(k => lowerMsg.includes(k));
    const SHOW_PROJECT_SLIDER = false; // Set to false to disable the project slider ( temporary fix )

    if (isContactQuestion) {
      const { links } = await getKnowledge();
      await logLlmInteraction({
        timestamp,
        user_id: userId,
        route,
        prompt: message || "",
        response: JSON.stringify({ type: "contact-info", contacts: links }) || "",
        status: "success",
      });
      return NextResponse.json({
        aiMessage: null,
        type: "contact-info",
        contacts: [
          { name: "LinkedIn", url: links.linkedin },
          { name: "GitHub", url: links.github },
        ],
        audioUrl: null
      });
    }

    if (SHOW_PROJECT_SLIDER) {
      if (isProjectQuestion) {
        // Return special project-list message
        try {
          const projects = await getProjects();
          await logLlmInteraction({
            timestamp,
            user_id: userId,
            route,
            prompt: message || "",
            response: JSON.stringify({ type: "project-list", projects }) || "",
            status: "success",
          });
          return NextResponse.json({
            aiMessage: null,
            type: "project-list",
            projects,
            audioUrl: null
          });
        } catch (err) {
          await logLlmInteraction({
            timestamp,
            user_id: userId,
            route,
            prompt: message || "",
            response: "",
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          });
          return NextResponse.json({ error: "Failed to load projects", details: err }, { status: 500 });
        }
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

    await logLlmInteraction({
      timestamp,
      user_id: userId,
      route,
      prompt: message || "",
      response: aiMessage || "",
      status: "success",
    });
    return NextResponse.json({ aiMessage, audioUrl });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await logLlmInteraction({
      timestamp: new Date().toISOString(),
      user_id: userId,
      route: "/api/chat",
      prompt: "",
      response: "",
      status: "error",
      error: errorMsg,
    });
    return NextResponse.json({ error: "Server error", details: err }, { status: 500 });
  }
} 