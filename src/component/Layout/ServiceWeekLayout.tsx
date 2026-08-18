import React from 'react';
import { Outlet } from 'react-router-dom';
import { ServiceWeekHeader } from './ServiceWeekHeader';
import { ServiceWeekSidebar } from './ServiceWeekSidebar';

export const ServiceWeekLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900 font-sans overflow-hidden">
      {/* Top Header - Sticky */}
      <ServiceWeekHeader />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar - Sticky */}
        <ServiceWeekSidebar />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};