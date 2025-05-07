import { ReactNode } from "react";
import { Linkedin, Github, Globe } from "lucide-react";

export function ContactIcons({ contacts }: { contacts: { name: string; url: string }[] }) {
  const iconMap: Record<string, ReactNode> = {
    LinkedIn: <Linkedin className="w-7 h-7" />,
    GitHub: <Github className="w-7 h-7" />,
    Portfolio: <Globe className="w-7 h-7" />,
  };
  return (
    <div className="flex gap-4 justify-start items-center">
      {contacts.map(({ name, url }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          className="hover:text-blue-500 transition-colors"
        >
          {iconMap[name] || <Globe className="w-7 h-7" />}
        </a>
      ))}
    </div>
  );
}