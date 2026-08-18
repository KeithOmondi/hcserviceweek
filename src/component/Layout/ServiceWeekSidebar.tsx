import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiPlusCircle, 
  FiList 
} from 'react-icons/fi';

export const ServiceWeekSidebar: React.FC = () => {
  const navItems = [
  
    { label: 'SERVICE FORM', path: '/staff/service-week/new', icon: <FiPlusCircle size={20} /> },
    { label: 'SERVICE WEEK', path: '/staff/service-week', icon: <FiList size={20} /> },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 bg-[#163328] text-white p-4 border-r border-[#C48B28]/20 flex flex-col gap-2 shrink-0 overflow-y-auto">
      <nav className="flex flex-col gap-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-sm ${
                isActive
                  ? 'bg-[#C48B28] text-white shadow-md'
                  : 'text-gray-200 hover:bg-[#C48B28]/20 hover:text-white'
              }`
            }
          >
            <span className="flex items-center justify-center w-5 h-5">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};