// ServiceWeekHeader.tsx
import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

// Custom hook for scroll detection with proper cleanup
const useScrollPosition = (threshold: number = 10): boolean => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Function to check scroll position
    const checkScroll = () => {
      const scrolled = window.scrollY > threshold;
      setIsScrolled(scrolled);
    };

    // Initial check using requestAnimationFrame to avoid warning
    let rafId: number;
    const initialCheck = () => {
      rafId = window.requestAnimationFrame(checkScroll);
    };
    initialCheck();

    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [threshold]);

  return isScrolled;
};

interface HeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const ServiceWeekHeader: React.FC<HeaderProps> = ({
  title = 'SERVICE WEEK',
  subtitle = 'THE JUDICIARY',
  userName = 'welcome',
  onMenuToggle,
  isMobileMenuOpen = false,
}) => {
  const isScrolled = useScrollPosition(10);

  return (
    <header className={`sticky top-0 z-50 bg-[#163328] text-white px-3 sm:px-6 md:px-8 py-3 sm:py-4 border-b border-[#C48B28]/20 flex justify-between items-center transition-shadow duration-300 ${
      isScrolled ? 'shadow-lg' : 'shadow-md'
    }`}>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 hover:bg-[#C48B28]/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#C48B28]"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <FiX size={24} className="text-white" />
          ) : (
            <FiMenu size={24} className="text-white" />
          )}
        </button>

        {/* Brand Badge */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#C48B28] rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl text-white shadow-inner flex-shrink-0">
          J
        </div>
        
        <div className="min-w-0">
          <p className="text-[#C48B28] text-[8px] sm:text-[10px] md:text-xs font-semibold tracking-widest uppercase truncate">
            {subtitle}
          </p>
          <h1 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* User Profile Info */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="text-right hidden xs:block">
          <p className="text-xs sm:text-sm font-semibold truncate max-w-[80px] sm:max-w-[120px]">
            {userName}
          </p>
        </div>
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-[#C48B28]/20 border border-[#C48B28] rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-[#C48B28] flex-shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};