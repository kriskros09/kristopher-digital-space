import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { logLlmInteraction } from "@/server/lib/llmLogger";
import { createClient } from '@/lib/supabase/server';

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_PRIVATE,
});

export async function POST(req: NextRequest) {
  const route = "/api/openai";
  const timestamp = new Date().toISOString();
  const userId = await getUserId();
  try {
    const { systemPrompt, userPrompt } = await req.json();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });
    const aiMessage = completion.choices[0]?.message?.content || "";
    await logLlmInteraction({
      timestamp,
      user_id: userId,
      route,
      prompt: `system: ${systemPrompt} user: ${userPrompt}`,
      response: aiMessage,
      status: "success",
    });
    return NextResponse.json({ aiMessage });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logLlmInteraction({
      timestamp: new Date().toISOString(),
      user_id: userId,
      route: "/api/openai",
      prompt: "",
      response: "",
      status: "error",
      error: errorMsg,
    });
    return NextResponse.json({ error: "OpenAI request failed", details: error }, { status: 500 });
  }
} 