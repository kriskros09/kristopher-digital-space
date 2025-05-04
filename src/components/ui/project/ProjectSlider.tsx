import React from "react";
import { Project } from "@/features/aiChat/aiChatSlice";
import { ProjectCard } from "./ProjectCard";

interface ProjectSliderProps {
  projects: Project[];
}

export const ProjectSlider = React.memo(function ProjectSlider({ projects }: ProjectSliderProps) {
  return (
    <div className="project-slider w-full overflow-x-auto overflow-y-hidden py-2 whitespace-nowrap">
      <div className="flex gap-4 flex-nowrap min-w-full">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
          />
        ))}
      </div>
    </div>
  );
}); 