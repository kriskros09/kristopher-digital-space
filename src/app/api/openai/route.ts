import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userPrompt } = await req.json();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });
    const aiMessage = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ aiMessage });
  } catch (error) {
    return NextResponse.json({ error: "OpenAI request failed" }, { status: 500 });
  }
} 