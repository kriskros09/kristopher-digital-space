import { TimelineItem } from "@/components/ui/radial-orbital-timeline";
import { MonitorIcon, CircleUserRound, BriefcaseIcon } from "lucide-react";

export const dockNavigationItems = [
  {
    title: 'Projects',
    icon: (
      <MonitorIcon className='h-full w-full text-zinc-400' />
    ),
  },
  {
    title: 'About me',
    icon: (
      <CircleUserRound className='h-full w-full text-zinc-400' />
    ),
  },
  {
    title: 'Expertise',
    icon: (
      <BriefcaseIcon className='h-full w-full text-zinc-400' />
    ),
  },
];

export const timelineData: (TimelineItem & { tech?: string[] })[] = [
  {
    id: 1,
    title: "Ideation",
    date: "Jan 2024",
    content: "Define project goals, user needs, and initial research.",
    category: "Ideation",
    icon: "Lightbulb",
    relatedIds: [2],
    status: "completed",
    energy: 100,
    tech: [],
  },
  {
    id: 2,
    title: "Planning",
    date: "Jan 2024",
    content: "Roadmap, milestones, and resource allocation.",
    category: "Planning",
    icon: "Calendar",
    relatedIds: [1, 3],
    status: "completed",
    energy: 95,
    tech: [],
  },
  {
    id: 3,
    title: "Design",
    date: "Feb 2024",
    content: "Wireframes and user flows in Figma.",
    category: "Design",
    icon: "FileText",
    relatedIds: [2, 4],
    status: "completed",
    energy: 90,
    tech: ["Figma"],
  },
  {
    id: 4,
    title: "Frontend",
    date: "Feb-Mar 2024",
    content: "UI with React, Next.js, and Tailwind CSS.",
    category: "Frontend",
    icon: "Code",
    relatedIds: [3, 5],
    status: "in-progress",
    energy: 80,
    tech: ["React", "Next.js", "Tailwind"],
  },
  {
    id: 5,
    title: "Backend",
    date: "Mar 2024",
    content: "APIs and database with Node, Express, PostgreSQL.",
    category: "Backend",
    icon: "Server",
    relatedIds: [4, 6],
    status: "in-progress",
    energy: 70,
    tech: ["Node", "Express", "PostgreSQL"],
  },
  {
    id: 6,
    title: "Testing",
    date: "Apr 2024",
    content: "Connect FE/BE, write tests, QA.",
    category: "Testing",
    icon: "User",
    relatedIds: [5, 7],
    status: "pending",
    energy: 50,
    tech: ["Jest"],
  },
  {
    id: 7,
    title: "Deployment",
    date: "Apr 2024",
    content: "Docker, CI/CD, cloud setup.",
    category: "Deployment",
    icon: "Layers",
    relatedIds: [6, 8],
    status: "pending",
    energy: 30,
    tech: ["Docker", "CI/CD"],
  },
  {
    id: 8,
    title: "Release",
    date: "May 2024",
    content: "Go live, monitor, and gather feedback.",
    category: "Release",
    icon: "Clock",
    relatedIds: [7],
    status: "pending",
    energy: 10,
    tech: [],
  },
];