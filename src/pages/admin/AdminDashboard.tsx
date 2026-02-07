import { Link } from 'react-router-dom';
import { Building2, MapPin, Package, Ruler, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const adminSections = [
    {
      title: 'Warehouse Management',
      description: 'Manage warehouses and their configurations',
      icon: Building2,
      path: '/admin/warehouses',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Storage Locations',
      description: 'Configure storage locations within warehouses',
      icon: MapPin,
      path: '/admin/locations',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Product Catalog',
      description: 'Manage products, SKUs, and inventory items',
      icon: Package,
      path: '/admin/products',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Units of Measure',
      description: 'Define measurement units and conversion factors',
      icon: Ruler,
      path: '/admin/uoms',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg0djJoLTR6bTAgNGg0djJoLTR6bS0yLTJoNHYyaC00em0wLTRoNHYyaC00eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAtMTI4KSIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Settings className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Administration</h1>
              <p className="text-gray-300">Master Data Management</p>
            </div>
          </div>
          
          <p className="text-gray-300 max-w-2xl">
            Configure and manage the core entities of your warehouse management system.
            Create and update warehouses, storage locations, products, and units of measure.
          </p>
        </div>
      </div>

      {/* Admin Sections Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Entity Management</h2>
          <p className="text-sm text-gray-500">Manage master data for all system entities</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.path} to={section.path}>
                <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-md h-full">
                  <CardHeader className="flex flex-row items-center gap-4 pb-3">
                    <div className={`${section.bgColor} rounded-xl p-3 transition-transform group-hover:scale-110`}>
                      <Icon className={`h-7 w-7 ${section.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center justify-between text-lg">
                        {section.title}
                        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-gray-600" />
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {section.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">CRUD Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Full Create, Read, Update, and Delete functionality for all entities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Client-side and server-side validation to ensure data integrity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confirmation Dialogs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Safety confirmations for all destructive operations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
