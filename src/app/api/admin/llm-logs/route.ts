import { NextResponse } from "next/server";
import { getLlmLogs } from "@/server/lib/llmLogger";

export async function GET() {
  try {
    const logs = await getLlmLogs();
    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load logs", details: err }, { status: 500 });
  }
} 