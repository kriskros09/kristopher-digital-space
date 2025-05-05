import { promises as fs } from 'fs';
import path from 'path';

let cachedKnowledge: { about: string; links: Record<string, string>; markdown: string } | null = null;
let knowledgeCacheTime: number | null = null;
const KNOWLEDGE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

export async function getKnowledge() {
  const now = Date.now();
  if (
    cachedKnowledge &&
    knowledgeCacheTime &&
    now - knowledgeCacheTime < KNOWLEDGE_TTL
  ) {
    return cachedKnowledge;
  }
  const aboutPath = path.join(process.cwd(), 'src/knowledge/about.md');
  const linksPath = path.join(process.cwd(), 'src/knowledge/links.json');
  const [about, linksRaw] = await Promise.all([
    fs.readFile(aboutPath, 'utf-8'),
    fs.readFile(linksPath, 'utf-8'),
  ]);
  const links = JSON.parse(linksRaw);
  const linksMarkdown = Object.entries(links)
    .map(([key, url]) => `- [${key.charAt(0).toUpperCase() + key.slice(1)}](${url})`)
    .join('\n');
  const markdown = `${about}\n\n## Links\n${linksMarkdown}`;
  cachedKnowledge = { about, links, markdown };
  knowledgeCacheTime = now;
  return cachedKnowledge;
} 