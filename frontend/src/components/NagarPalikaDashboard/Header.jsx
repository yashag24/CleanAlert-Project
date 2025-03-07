import { Upload, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ handleImageUpload }) => {
  const { logout } = useAuth(); // Get logout function

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Left Section */}
        <div>
          <h1 className="text-2xl font-bold text-indigo-800">
            Nagarpalika Dashboard
          </h1>
          <p className="text-blue-600">Admin panel for garbage management</p>
        </div>

        {/* Right Section (Upload & Logout) */}
        <div className="flex items-center space-x-4">
          {/* Upload Button */}
          <button
            onClick={handleImageUpload}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Image
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
