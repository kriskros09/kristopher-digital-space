import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const aboutPath = path.join(process.cwd(), "src/knowledge/about.md");
    const linksPath = path.join(process.cwd(), "src/knowledge/links.json");

    const [about, linksRaw] = await Promise.all([
      fs.readFile(aboutPath, "utf-8"),
      fs.readFile(linksPath, "utf-8"),
    ]);
    const links = JSON.parse(linksRaw);

    return NextResponse.json({ about, links });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load knowledge files." }, { status: 500 });
  }
} 