import { NextResponse, NextRequest } from "next/server";
import { getLlmLogs, deleteAllLlmLogs } from "@/server/lib/llmLogger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    // Fetch all logs (could be optimized for large tables)
    const allLogs = await getLlmLogs();
    const totalCount = allLogs.length;
    const logs = allLogs.slice((page - 1) * pageSize, page * pageSize);
    return NextResponse.json({ logs, totalCount });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load logs", details: err }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await deleteAllLlmLogs();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete logs", details: err }, { status: 500 });
  }
} 