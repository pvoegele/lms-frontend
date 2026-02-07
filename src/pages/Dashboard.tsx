import { Link } from 'react-router-dom';
import { Package, TruckIcon, Search, ArrowRight, Warehouse, BarChart3, Box, FileText, Scale, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const actions = [
    {
      title: 'Receive Stock',
      description: 'Create receiving documents and log incoming inventory',
      icon: Package,
      path: '/receive',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Ship Stock',
      description: 'Process outbound shipments and update stock levels',
      icon: TruckIcon,
      path: '/ship',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Stock Lookup',
      description: 'Search products and view real-time inventory status',
      icon: Search,
      path: '/lookup',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const masterData = [
    {
      title: 'Products',
      description: 'Manage product catalog',
      icon: Box,
      path: '/products',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Stock Documents',
      description: 'View transaction history',
      icon: FileText,
      path: '/documents',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Warehouses',
      description: 'Manage warehouse locations',
      icon: Warehouse,
      path: '/warehouses',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      title: 'Storage Locations',
      description: 'Configure storage bins',
      icon: MapPin,
      path: '/locations',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Units of Measure',
      description: 'View measurement units',
      icon: Scale,
      path: '/uoms',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const stats = [
    { label: 'Active Warehouses', value: '12', change: '+2 this month' },
    { label: 'Products Tracked', value: '3,847', change: '+156 this week' },
    { label: 'Transactions Today', value: '234', change: '+18% vs yesterday' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg0djJoLTR6bTAgNGg0djJoLTR6bS0yLTJoNHYyaC00em0wLTRoNHYyaC00eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAtMTI4KSIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="relative">
          <div className="mb-2 flex items-center gap-2">
            <Warehouse className="h-8 w-8" />
            <Badge variant="secondary" className="bg-white/20 text-white">v2.0</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">Warehouse Nexus</h1>
          <p className="text-blue-100 text-lg mb-6">
            Enterprise inventory management at your fingertips
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/10 backdrop-blur-sm p-3">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-blue-100">{stat.label}</div>
                <div className="text-xs text-green-300 mt-1">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center gap-4 pb-3">
                    <div className={`${action.bgColor} rounded-xl p-3 transition-transform group-hover:scale-110`}>
                      <Icon className={`h-7 w-7 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center justify-between text-lg">
                        {action.title}
                        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-gray-600" />
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Master Data Management */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Master Data</h2>
          <Badge variant="outline">Reference Data</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {masterData.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className={`${item.bgColor} rounded-lg p-2 inline-block mb-2 transition-transform group-hover:scale-110`}>
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div className="font-semibold text-sm text-gray-900 mb-1">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Your latest warehouse operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { action: 'Received', item: '150 units of SKU-4782', time: '2 hours ago', type: 'receive' },
              { action: 'Shipped', item: '75 units to Location A', time: '4 hours ago', type: 'ship' },
              { action: 'Stock checked', item: 'Product catalog updated', time: '6 hours ago', type: 'lookup' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === 'receive' ? 'bg-emerald-500' :
                    activity.type === 'ship' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{activity.action}</div>
                    <div className="text-gray-500">{activity.item}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
