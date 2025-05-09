import { memo } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/features/aiChat/aiChatSlice";
import Image from "next/image";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const handleReadMore = () => {
    router.push(`/projects/${project.slug}`);
  };
  return (
    <div
      className="relative w-72 min-w-[18rem] max-w-xs aspect-[3/4] rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-95 bg-black group cursor-pointer"
      tabIndex={0}
      aria-label={`Project: ${project.name}`}
      role="group"
      onClick={handleReadMore}
      onKeyDown={handleReadMore}
    >
      {project.image ? (
        <Image
          src={project.image}
          alt={project.name}
          fill
          className="absolute inset-0 w-full h-full object-cover bg-neutral-200"
          priority={false}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 text-gray-500 text-lg font-semibold">
          {project.name}
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
      {/* Content overlay */}
      <div className="relative z-10 p-6 flex flex-col h-full justify-end">
        <h3 className="font-bold text-xl text-white mb-2 drop-shadow-md" title={project.name}>
          {project.name}
        </h3>
        <p className="text-white/80 text-sm mb-4 line-clamp-2 drop-shadow-md" title={project.description}>
          {project.description}
        </p>
        <a
          href={`/projects/${project.slug}`}
          onClick={e => { e.preventDefault(); handleReadMore(); }}
          className="inline-flex items-center text-white font-medium group/readmore w-fit hover:underline focus:outline-none"
          tabIndex={-1}
        >
          Read more
          <svg
            className="ml-1 w-4 h-4 transition-transform group-hover/readmore:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}); 