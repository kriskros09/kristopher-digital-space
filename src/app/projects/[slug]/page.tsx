import { notFound } from "next/navigation";
import path from "path";
import fs from "fs/promises";
import { Project } from "@/features/aiChat/aiChatSlice";
import Link from "next/link";
import { ProjectImageWithLoading } from "@/components/ui/project/ProjectImageWithLoading";

async function getProject(slug: string): Promise<Project | null> {
  const filePath = path.join(process.cwd(), "src/knowledge/projects.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const projects: Project[] = JSON.parse(raw);
  return projects.find((p) => p.slug === slug) || null;
}

export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return notFound();
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition border border-zinc-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label="Back to chat"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back
      </Link>
      {project.image ? (
        <ProjectImageWithLoading src={project.image} alt={project.name} />
      ) : (
        <div className="w-full max-h-96 flex items-center justify-center bg-neutral-200 text-gray-500 text-2xl font-semibold rounded-xl mb-6" style={{ height: '384px' }}>
          {project.name}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2 text-gray-900">{project.name}</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-mono"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="text-lg text-gray-700 mb-4">{project.description}</div>
      <div className="text-sm text-gray-500">Role: <span className="font-medium text-gray-900">{project.role}</span></div>
    </div>
  );
} 