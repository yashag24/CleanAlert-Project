import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  FileImage,
  AlertTriangle,
  CheckCircle,
  Users,
  PieChart,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Sidebar from '../components/NagarPalikaDashboard/Sidebar';
import Header from '../components/NagarPalikaDashboard/Header';
import StatsCard from '../components/NagarPalikaDashboard/StatsCard';
import AISummary from '../components/NagarPalikaDashboard/AISummary';
import NotificationCard from '../components/NagarPalikaDashboard/NotificationCard';
import GarbageMap from '../components/NagarPalikaDashboard/Map';
import Analytics from '../components/NagarPalikaDashboard/Analytics';

const NagarpalikaGarbageDashboard = () => {
  const { notifications = [] } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [view, setView] = useState('list'); // 'list', 'map', or 'analytics'

  useEffect(() => {
    const filtered = notifications.filter((notification) => {
      const coordinates = `${notification.latitude ?? 0}, ${notification.longitude ?? 0}`;
      const matchesSearch = coordinates.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = activeTab === 'all' || notification.status === activeTab;
      return matchesSearch && matchesStatus;
    });
    setFilteredNotifications(filtered);
  }, [searchTerm, notifications, activeTab]);

  const stats = {
    total: notifications.length,
    pending: notifications.filter((n) => n.status === 'pending').length,
    completed: notifications.filter((n) => n.status === 'completed').length,
    inProgress: notifications.filter((n) => n.status === 'in_progress').length,
  };

  const renderView = () => {
    switch (view) {
      case 'map':
        return <GarbageMap detections={filteredNotifications ?? []} />;
      case 'analytics':
        return <Analytics detections={notifications ?? []} />;
      default:
        return (
          <div className="space-y-4">
            {(filteredNotifications ?? []).map((notification) => (
              <motion.div
                key={notification.id} // ✅ Add a unique key here
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NotificationCard notification={notification} />
              </motion.div>
            ))}
            {filteredNotifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No detections found matching your criteria
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-emerald-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6">
          <StatsCard
            icon={FileImage}
            title="Total Reports"
            value={stats.total}
            borderColor="border-emerald-500"
            iconColor="text-emerald-600"
            bgColor="bg-emerald-100"
          />
          <StatsCard
            icon={AlertTriangle}
            title="Pending"
            value={stats.pending}
            borderColor="border-amber-500"
            iconColor="text-amber-600"
            bgColor="bg-amber-100"
          />
          <StatsCard
            icon={CheckCircle}
            title="In Progress"
            value={stats.inProgress}
            borderColor="border-blue-500"
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatsCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completed}
            borderColor="border-emerald-500"
            iconColor="text-emerald-600"
            bgColor="bg-emerald-100"
          />
          <StatsCard
            icon={Users}
            title="Staff Active"
            value={12}
            borderColor="border-indigo-500"
            iconColor="text-indigo-600"
            bgColor="bg-indigo-100"
          />
          <StatsCard
            icon={PieChart}
            title="AI Accuracy"
            value="94%"
            borderColor="border-blue-500"
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
          />
        </div>

        <div className="p-6 pt-0">
          <AISummary />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
            <h2 className="text-xl font-bold text-indigo-800">
              Garbage Reports
            </h2>
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by coordinates..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <div className="flex space-x-2">
                {['list', 'map', 'analytics'].map((v) => (
                  <button
                    key={v} // ✅ Add a unique key here
                    onClick={() => setView(v)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      view === v
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex space-x-2">
                {['all', 'pending', 'in_progress', 'completed'].map((tab) => (
                  <button
                    key={tab} // ✅ Add a unique key here
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default NagarpalikaGarbageDashboard;