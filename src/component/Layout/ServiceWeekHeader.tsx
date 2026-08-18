import React, { useState, useEffect } from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
}

export const ServiceWeekHeader: React.FC<HeaderProps> = ({
  title = 'URITHI PORTAL',
  subtitle = 'THE JUDICIARY',
  userName = 'Admin User',
  userRole = 'Super Admin',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-[#163328] text-white px-8 py-4 border-b border-[#C48B28]/20 flex justify-between items-center transition-shadow duration-300 ${
      isScrolled ? 'shadow-lg' : 'shadow-md'
    }`}>
      <div className="flex items-center gap-4">
        {/* Brand Badge */}
        <div className="w-12 h-12 bg-[#C48B28] rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-inner">
          J
        </div>
        <div>
          <p className="text-[#C48B28] text-xs font-semibold tracking-widest uppercase">{subtitle}</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        </div>
      </div>

      {/* User Profile Info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold">{userName}</p>
          <p className="text-xs text-[#C48B28] font-medium">{userRole}</p>
        </div>
        <div className="w-10 h-10 bg-[#C48B28]/20 border border-[#C48B28] rounded-full flex items-center justify-center font-bold text-sm text-[#C48B28]">
          {userName.charAt(0)}
        </div>
      </div>
    </header>
  );
};