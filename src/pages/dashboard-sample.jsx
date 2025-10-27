import React, { useState } from 'react';
import { 
  Shield, Bell, Users, FileText, AlertTriangle, CheckCircle, Clock, 
  Search, Plus, Filter, Download, Menu, X, Settings, LogOut, 
  TrendingUp, Calendar, Mail, BarChart3, ChevronRight, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = [
    { 
      title: 'Total Drivers', 
      value: '124', 
      change: '+12%', 
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
      color: 'blue'
    },
    { 
      title: 'Documents Expiring', 
      value: '8', 
      change: 'Next 30 days', 
      trend: 'warning',
      icon: <Clock className="w-5 h-5" />,
      color: 'yellow'
    },
    { 
      title: 'Compliance Rate', 
      value: '96%', 
      change: '+3%', 
      trend: 'up',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green'
    },
    { 
      title: 'Urgent Actions', 
      value: '3', 
      change: 'Requires attention', 
      trend: 'warning',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'red'
    }
  ];

  const recentDrivers = [
    { id: 1, name: 'John Martinez', status: 'compliant', documents: 4, expiring: 0, avatar: 'JM' },
    { id: 2, name: 'Sarah Johnson', status: 'expiring-soon', documents: 4, expiring: 1, avatar: 'SJ' },
    { id: 3, name: 'Michael Chen', status: 'expired', documents: 4, expiring: 2, avatar: 'MC' },
    { id: 4, name: 'Emily Davis', status: 'compliant', documents: 4, expiring: 0, avatar: 'ED' },
    { id: 5, name: 'Robert Wilson', status: 'pending', documents: 2, expiring: 0, avatar: 'RW' }
  ];

  const expiringDocuments = [
    { driver: 'Sarah Johnson', type: 'Driver License', expiry: '2025-11-15', daysLeft: 25, status: 'warning' },
    { driver: 'Michael Chen', type: 'Insurance', expiry: '2025-10-28', daysLeft: 7, status: 'critical' },
    { driver: 'Michael Chen', type: 'DOT Medical', expiry: '2025-10-22', daysLeft: 1, status: 'critical' },
    { driver: 'James Brown', type: 'Vehicle Registration', expiry: '2025-11-20', daysLeft: 30, status: 'warning' }
  ];

  const recentActivity = [
    { action: 'Document uploaded', detail: 'John Martinez - Driver License', time: '2 hours ago', type: 'upload' },
    { action: 'Reminder sent', detail: 'Sarah Johnson - License expiring soon', time: '5 hours ago', type: 'notification' },
    { action: 'Document verified', detail: 'Emily Davis - Insurance', time: '1 day ago', type: 'verify' },
    { action: 'New driver added', detail: 'Robert Wilson', time: '2 days ago', type: 'add' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'expiring-soon': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'expired': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'compliant': return 'Compliant';
      case 'expiring-soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      case 'pending': return 'Pending Upload';
      default: return status;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'drivers', label: 'Drivers', icon: <Users className="w-5 h-5" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen max-w-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Decorative elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                DSP Compliance
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-slate-400 truncate">admin@dsp.com</p>
              </div>
              <button className="text-slate-400 hover:text-white">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-slate-400">Welcome back, Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search drivers, documents..."
                  className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-64"
                />
              </div>
              <button className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Add Driver</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="p-6 space-y-6 "  >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                      <div className="flex items-center gap-1 text-sm">
                        {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                        {stat.trend === 'warning' && <Clock className="w-4 h-4 text-yellow-400" />}
                        <span className={stat.trend === 'up' ? 'text-green-400' : 'text-yellow-400'}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      stat.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                      stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Critical Alerts */}
          <Alert className="bg-red-500/10 border-red-500/30 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>3 documents require immediate attention - expiring within 7 days</span>
              <button className="text-sm font-medium hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </AlertDescription>
          </Alert>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Expiring Documents */}
            <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-white">Expiring Documents</CardTitle>
                  <CardDescription className="text-slate-400">Documents expiring in the next 30 days</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiringDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-2 h-2 rounded-full ${doc.status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{doc.driver}</p>
                          <p className="text-sm text-slate-400">{doc.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{doc.expiry}</p>
                          <p className={`text-xs ${doc.status === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {doc.daysLeft} days left
                          </p>
                        </div>
                      </div>
                      <button className="ml-4 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-1">
                  View All Expiring Documents <ChevronRight className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-slate-400">Latest actions across your fleet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'upload' ? 'bg-blue-500/20 text-blue-400' :
                        activity.type === 'notification' ? 'bg-yellow-500/20 text-yellow-400' :
                        activity.type === 'verify' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {activity.type === 'upload' && <FileText className="w-4 h-4" />}
                        {activity.type === 'notification' && <Bell className="w-4 h-4" />}
                        {activity.type === 'verify' && <CheckCircle className="w-4 h-4" />}
                        {activity.type === 'add' && <Plus className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-slate-400 truncate">{activity.detail}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Drivers */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Drivers</CardTitle>
                <CardDescription className="text-slate-400">Latest driver registrations and updates</CardDescription>
              </div>
              <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left text-sm font-medium text-slate-400 pb-3">Driver</th>
                      <th className="text-left text-sm font-medium text-slate-400 pb-3">Status</th>
                      <th className="text-left text-sm font-medium text-slate-400 pb-3">Documents</th>
                      <th className="text-left text-sm font-medium text-slate-400 pb-3">Expiring</th>
                      <th className="text-right text-sm font-medium text-slate-400 pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDrivers.map((driver) => (
                      <tr key={driver.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-sm">
                              {driver.avatar}
                            </div>
                            <span className="font-medium text-white">{driver.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.status)}`}>
                            {getStatusLabel(driver.status)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-slate-300">{driver.documents}/4</span>
                        </td>
                        <td className="py-4">
                          <span className={driver.expiring > 0 ? 'text-yellow-400' : 'text-green-400'}>
                            {driver.expiring}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}