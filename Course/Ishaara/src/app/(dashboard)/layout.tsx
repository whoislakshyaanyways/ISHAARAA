import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Header />
      <div className="flex-1 flex justify-center lg:pl-64">
        {/* Left fixed navigation sidebar */}
        <Sidebar />

        {/* Center content + Right sidebar wrapper */}
        <div className="flex-1 flex justify-center max-w-6xl w-full">
          {/* Center main content container */}
          <main className="flex-1 min-w-0 max-w-2xl pb-20 lg:pb-12 px-4 sm:px-6">
            {children}
          </main>

          {/* Right gamification stats sidebar */}
          <RightSidebar />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
