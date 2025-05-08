"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminLinks = [
  { href: '/admin/llm-logs', label: 'LLM Logs' },
  { href: '/admin/feature-flags', label: 'Feature Flags' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-gray-100 border-r h-full p-4 flex flex-col gap-2 h-screen">
      <h2 className="font-bold text-lg mb-4">Admin Menu</h2>
      {adminLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`block px-3 py-2 rounded hover:bg-gray-200 transition-colors ${pathname === link.href ? 'bg-gray-200 font-semibold' : ''}`}
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
} 