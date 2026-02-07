import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, TruckIcon, Search, Home, Warehouse, Box, FileText } from 'lucide-react';
import OfflineAlert from './OfflineAlert';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/products', icon: Box, label: 'Products' },
    { path: '/documents', icon: FileText, label: 'Docs' },
    { path: '/receive', icon: Package, label: 'Receive' },
    { path: '/ship', icon: TruckIcon, label: 'Ship' },
    { path: '/lookup', icon: Search, label: 'Lookup' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <OfflineAlert />
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <Warehouse className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Warehouse Nexus</h1>
              <p className="text-xs text-gray-500">Mobile Worker Interface</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-2xl">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-6">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className="group relative flex flex-col items-center justify-center py-3 px-2 transition-all duration-200"
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
                  )}
                  
                  {/* Icon container */}
                  <div className={`
                    flex items-center justify-center rounded-xl p-2 transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg scale-110' 
                      : 'bg-gray-100 group-hover:bg-gray-200 group-hover:scale-105'
                    }
                  `}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'}`} />
                  </div>
                  
                  {/* Label */}
                  <span className={`
                    text-xs mt-1 transition-all duration-200
                    ${isActive 
                      ? 'font-semibold text-gray-900' 
                      : 'text-gray-600 group-hover:text-gray-900'
                    }
                  `}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
