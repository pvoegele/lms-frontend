import { Package, TruckIcon, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const quickActions = [
    {
      to: '/receive',
      icon: Package,
      label: 'Receive Stock',
      description: 'Record incoming inventory',
      color: 'bg-green-500',
    },
    {
      to: '/ship',
      icon: TruckIcon,
      label: 'Ship Stock',
      description: 'Process outgoing orders',
      color: 'bg-blue-500',
    },
    {
      to: '/lookup',
      icon: FileText,
      label: 'Stock Lookup',
      description: 'Check inventory levels',
      color: 'bg-purple-500',
    },
  ];

  const recentActivity = [
    { id: 1, type: 'Received', doc: 'RCV-001', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'Shipped', doc: 'SHP-045', time: '4 hours ago', status: 'completed' },
    { id: 3, type: 'Received', doc: 'RCV-002', time: '6 hours ago', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">Ready to manage warehouse operations</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="bg-white rounded-lg shadow p-6 flex items-center gap-4 hover:shadow-lg transition-shadow active:scale-95 transition-transform"
              >
                <div className={`${action.color} text-white p-4 rounded-lg`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-lg">{action.label}</h4>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="border-b border-gray-100 last:border-0 p-4 flex items-center gap-4"
            >
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {activity.type} - {activity.doc}
                </p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
              <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm mb-1">Today's Receipts</p>
          <p className="text-3xl font-bold text-gray-800">12</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm mb-1">Today's Shipments</p>
          <p className="text-3xl font-bold text-gray-800">8</p>
        </div>
      </div>
    </div>
  );
}
