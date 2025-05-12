import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/ui/admin/AdminSidebar';
import { Toaster } from '@/components/ui/feedback/sonner';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Toaster />
        {children}
      </main>
    </div>
  );
} 