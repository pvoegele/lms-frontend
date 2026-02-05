import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, TruckIcon, Search, Home } from 'lucide-react';
import OfflineAlert from './OfflineAlert';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/receive', icon: Package, label: 'Receive' },
    { path: '/ship', icon: TruckIcon, label: 'Ship' },
    { path: '/lookup', icon: Search, label: 'Lookup' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineAlert />
      
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Warehouse Nexus</h1>
          <p className="text-blue-100 text-sm">Mobile Worker Interface</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-2' : ''}`} />
                  <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
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
