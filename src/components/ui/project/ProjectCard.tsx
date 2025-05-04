import React from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/features/aiChat/aiChatSlice";
import Image from "next/image";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = React.memo(function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  console.log(project.image);
  const handleMoreDetails = () => {
    router.push(`/projects/${project.slug}`);
  };
  return (
    <div
      className={
        "relative flex flex-col w-64 min-w-[16rem] max-w-xs bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105"
      }
      tabIndex={0}
      aria-label={`Project: ${project.name}`}
      role="group"
    >
      {project.image ? (
        <Image
          src={project.image}
          alt={project.name}
          width={256}
          height={160}
          className="h-40 w-full object-cover bg-neutral-200"
          style={{ objectFit: 'cover', width: '100%', height: '160px' }}
          priority={false}
        />
      ) : (
        <div className="h-40 w-full flex items-center justify-center bg-neutral-200 text-gray-500 text-lg font-semibold">
          {project.name}
        </div>
      )}
      <div className="flex-1 flex flex-col p-4 gap-2">
        <div className="font-semibold text-lg text-gray-900 truncate" title={project.name}>
          {project.name}
        </div>
        <div className="text-sm text-gray-600 line-clamp-2" title={project.description}>
          {project.description}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-mono"
            >
              {tech}
            </span>
          ))}
        </div>
        <button
          className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition"
          onClick={handleMoreDetails}
        >
          More Details
        </button>
      </div>
    </div>
  );
}); 