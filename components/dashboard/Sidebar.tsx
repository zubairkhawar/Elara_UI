'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { mainNavItems, supportNavItems, NavItem } from './navConfig';

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:block fixed left-0 top-0 h-full bg-[#101024] border-r border-white/10 transition-all duration-300 z-40 overflow-x-hidden ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      role="dialog"
      tabIndex={-1}
      aria-label="Sidebar"
    >
      <div className="relative flex flex-col h-full max-h-full">
        {/* Header */}
        <header className={`h-16 flex items-center border-b border-white/10 ${
          isCollapsed ? 'px-2 justify-center' : 'px-6 justify-between'
        }`}>
          {!isCollapsed ? (
            <>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                Elara AI
              </h1>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/70"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/70"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </header>
        {/* End Header */}

        {/* Body - Navigation */}
        <nav className="h-full overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-[#050517] [&::-webkit-scrollbar-thumb]:bg-[#15152A]">
          <div className="pb-4 w-full flex flex-col">
            {/* MENU Section */}
            {!isCollapsed && (
              <div className="pl-4 pr-1 pt-6 pb-2">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">MENU</p>
              </div>
            )}
            <ul className={`w-full flex flex-col ${isCollapsed ? 'space-y-2 px-2 pt-4' : 'space-y-1 p-1 pt-2'}`}>
              {mainNavItems.map((item: NavItem) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      className={`min-h-[44px] w-full flex items-center gap-x-3 rounded-lg transition-all duration-200 focus:outline-none ${
                        isCollapsed
                          ? 'justify-center px-2 py-2.5'
                          : 'px-4 py-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`size-5 flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : ''}`} />
                      {!isCollapsed && (
                        <span className="font-medium text-base whitespace-nowrap flex-1">{item.name}</span>
                      )}
                    </Link>
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-gray-900 border-b-4 border-b-transparent"></div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* SUPPORT Section */}
            {!isCollapsed && (
              <div className="pl-4 pr-1 pt-6 pb-2">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">SUPPORT</p>
              </div>
            )}
            <ul className={`w-full flex flex-col ${isCollapsed ? 'space-y-2 px-2 pt-2' : 'space-y-1 p-1 pt-2'}`}>
              {supportNavItems.map((item: NavItem) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      className={`min-h-[44px] w-full flex items-center gap-x-3 rounded-lg transition-all duration-200 focus:outline-none ${
                        isCollapsed
                          ? 'justify-center px-2 py-2.5'
                          : 'px-4 py-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-br from-[#1E1E5F] to-[#7B4FFF] text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`size-5 flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : ''}`} />
                      {!isCollapsed && (
                        <span className="font-medium text-base whitespace-nowrap flex-1">{item.name}</span>
                      )}
                    </Link>
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-gray-900 border-b-4 border-b-transparent"></div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
        {/* End Body */}
      </div>
    </aside>
  );
}
