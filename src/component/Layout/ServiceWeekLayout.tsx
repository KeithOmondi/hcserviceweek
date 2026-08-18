// ServiceWeekLayout.tsx
import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { ServiceWeekHeader } from './ServiceWeekHeader';
import { ServiceWeekSidebar } from './ServiceWeekSidebar';

export const ServiceWeekLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu handler
  const handleMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Close mobile menu handler
  const handleMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900 font-sans overflow-hidden">
      {/* Top Header */}
      <ServiceWeekHeader 
        onMenuToggle={handleMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <ServiceWeekSidebar 
          isMobileOpen={isMobileMenuOpen}
          onClose={handleMenuClose}
        />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};