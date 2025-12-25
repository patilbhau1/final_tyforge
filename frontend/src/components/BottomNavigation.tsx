import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Lightbulb, Phone, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const BottomNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: FolderOpen,
    },
    {
      name: 'Ideas',
      path: '/idea-generator',
      icon: Lightbulb,
    },
    {
      name: 'Contact',
      path: '/contact',
      icon: Phone,
    },
    {
      name: 'Profile',
      path: '/dashboard',
      icon: User,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Only show on mobile/tablet
  if (!isMobile && window.innerWidth > 1024) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-16 max-h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 min-h-16 px-1 ${
                active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Icon 
                className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-600'}`} 
              />
              <span 
                className={`text-xs font-medium leading-tight ${
                  active ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;