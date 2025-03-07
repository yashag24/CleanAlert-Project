import { Bell, Map, Upload, BarChart2, Users, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gradient-to-b from-emerald-800 via-blue-800 to-indigo-800 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Nagarpalika</h1>
        <p className="text-emerald-200 text-sm">Swachh Bharat Portal</p>
      </div>

      <nav className="mt-6">
        <div className="px-6 py-3 bg-blue-700 rounded-r-lg">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-3" />
            <span>Garbage Alerts</span>
          </div>
        </div>

        <div className="px-6 py-3 hover:bg-blue-700 cursor-pointer mt-2 rounded-r-lg hover:bg-opacity-50">
          <div className="flex items-center">
            <Map className="h-5 w-5 mr-3" />
            <span>Cleanliness Map</span>
          </div>
        </div>

        <div className="px-6 py-3 hover:bg-blue-700 cursor-pointer mt-2 rounded-r-lg hover:bg-opacity-50">
          <div className="flex items-center">
            <Upload className="h-5 w-5 mr-3" />
            <span>Manual Upload</span>
          </div>
        </div>

        <div className="px-6 py-3 hover:bg-blue-700 cursor-pointer mt-2 rounded-r-lg hover:bg-opacity-50">
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 mr-3" />
            <span>Cleanliness Trends</span>
          </div>
        </div>

        <div className="px-6 py-3 hover:bg-blue-700 cursor-pointer mt-2 rounded-r-lg hover:bg-opacity-50">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-3" />
            <span>Staff Management</span>
          </div>
        </div>

        <div className="px-6 py-3 hover:bg-blue-700 cursor-pointer mt-2 rounded-r-lg hover:bg-opacity-50">
          <div className="flex items-center">
            <Settings className="h-5 w-5 mr-3" />
            <span>Settings</span>
          </div>
        </div>
      </nav>

      <div className="absolute bottom-0 p-6 text-blue-300 text-sm">
        <p>Powered by AI Garbage Detection</p>
        <p>© 2025 Swachh Bharat Mission</p>
      </div>
    </div>
  );
};

export default Sidebar;
