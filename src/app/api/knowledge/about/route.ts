import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { logLlmInteraction } from "@/server/lib/llmLogger";
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function getUserId() {
  const supabase = await createSupabaseServerClient();
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error && error.status === 400 && error.code === 'refresh_token_not_found') {
      return undefined;
    }
    return user?.id;
  } catch (err) {
    console.error("[api/knowledge/about][getUserId] Failed to get user ID:", err);
    return undefined;
  }
}

export async function GET() {
  const route = "/api/knowledge/about";
  const timestamp = new Date().toISOString();
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const aboutPath = path.join(process.cwd(), "src/knowledge/about.md");
    const linksPath = path.join(process.cwd(), "src/knowledge/links.json");

    const [about, linksRaw] = await Promise.all([
      fs.readFile(aboutPath, "utf-8"),
      fs.readFile(linksPath, "utf-8"),
    ]);
    const links = JSON.parse(linksRaw);

    await logLlmInteraction({
      timestamp,
      user_id: userId,
      route,
      prompt: "GET",
      response: JSON.stringify({ about, links }),
      status: "success",
    });

    return NextResponse.json({ about, links });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logLlmInteraction({
      timestamp: new Date().toISOString(),
      user_id: userId,
      route: "/api/knowledge/about",
      prompt: "GET",
      response: "",
      status: "error",
      error: errorMsg,
    });
    return NextResponse.json({ error: "Failed to load knowledge files.", details: error }, { status: 500 });
  }
} 