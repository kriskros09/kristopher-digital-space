import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";

const SYSTEM_PROMPT = "You may only answer questions about Kristopher using the information provided in the following knowledge files. Do not make up information.";

let cachedKnowledge: string | null = null;

async function getKnowledge() {
  if (cachedKnowledge) return cachedKnowledge;
  const aboutPath = path.join(process.cwd(), "src/knowledge/about.md");
  cachedKnowledge = await fs.readFile(aboutPath, "utf-8");
  return cachedKnowledge;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { message } = req.body;
    const knowledge = await getKnowledge();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: knowledge },
        { role: "user", content: message },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });
    const aiMessage = completion.choices[0]?.message?.content || "";
    res.status(200).json({ aiMessage });
  } catch (error) {
    res.status(500).json({ error: "OpenAI request failed", details: error });
  }
} 