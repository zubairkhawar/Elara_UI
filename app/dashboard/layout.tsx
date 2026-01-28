'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const router = useRouter();

  const sidebarMarginClass = isCollapsed ? 'md:ml-20' : 'md:ml-64';

  // Simple client-side guard: if no access token, send to login
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('elara_access_token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 bg-gray-50 ${sidebarMarginClass}`}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div
            className="w-full mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-5 md:py-6 lg:py-8 xl:py-10"
            style={{ margin: 0, maxWidth: '100%' }}
          >
            <div className="max-w-[1200px] md:max-w-[1320px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 text-gray-900" style={{ minHeight: '100vh' }}>
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </div>
  );
}
