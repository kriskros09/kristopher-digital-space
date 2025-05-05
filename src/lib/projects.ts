import { Project } from '@/features/aiChat/aiChatSlice';
import { promises as fs } from 'fs';
import path from 'path';

let cachedProjects: Project[] | null = null;
let projectsCacheTime: number | null = null;
const PROJECTS_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

export async function getProjects() {
  const now = Date.now();
  if (
    cachedProjects &&
    projectsCacheTime &&
    now - projectsCacheTime < PROJECTS_TTL
  ) {
    return cachedProjects;
  }
  const projectsPath = path.join(process.cwd(), 'src/knowledge/projects.json');
  const projectsRaw = await fs.readFile(projectsPath, 'utf-8');
  cachedProjects = JSON.parse(projectsRaw);
  projectsCacheTime = now;
  return cachedProjects;
} 