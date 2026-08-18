// ServiceWeekSidebar.tsx
import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiPlusCircle, 
  FiList,
  FiX
} from 'react-icons/fi';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export const ServiceWeekSidebar: React.FC<SidebarProps> = ({ 
  isMobileOpen = false, 
  onClose 
}) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(location.pathname);

  const navItems = [
    { label: 'SERVICE FORM', path: '/staff/service-week/new', icon: <FiPlusCircle size={20} /> },
    { label: 'SERVICE WEEK', path: '/staff/service-week', icon: <FiList size={20} /> },
  ];

  // Close sidebar on outside click (mobile)
  // Excludes the header's toggle button so open/close doesn't fight itself
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const clickedToggleButton = target.closest('[data-sidebar-toggle]');

      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        !clickedToggleButton
      ) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen, onClose]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      if (isMobileOpen) {
        onClose?.();
      }
    }
  }, [location.pathname, isMobileOpen, onClose]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileOpen) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen, onClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const sidebarContent = (
    <>
      {/* Mobile Close Button */}
      <div className="lg:hidden flex justify-end p-2 border-b border-[#C48B28]/20">
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#C48B28]/20 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <FiX size={24} className="text-white" />
        </button>
      </div>

      <nav className="flex flex-col gap-2 px-2 sm:px-3 md:px-4 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm ${
                isActive
                  ? 'bg-[#C48B28] text-white shadow-md'
                  : 'text-gray-200 hover:bg-[#C48B28]/20 hover:text-white'
              }`
            }
          >
            <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`
          w-64 bg-[#163328] text-white border-r border-[#C48B28]/20 flex flex-col gap-2 shrink-0 overflow-y-auto
          transition-transform duration-300 ease-in-out
          fixed inset-y-0 left-0 z-50
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};