import { Upload, FileImage, Bell } from 'lucide-react';

const AISummary = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 rounded-lg shadow-sm p-6 text-white">
      <h2 className="text-xl font-bold mb-2">AI Garbage Detection System</h2>
      <p className="mb-4">
        Our AI system automatically classifies uploaded images as garbage or
        clean areas, helping to keep our city beautiful.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white bg-opacity-20 rounded p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-white text-emerald-600">
              <Upload className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Upload</p>
              <p className="text-xs opacity-80">Citizens upload waste images</p>
            </div>
          </div>
        </div>
        <div className="bg-white bg-opacity-20 rounded p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-white text-blue-600">
              <FileImage className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Classify</p>
              <p className="text-xs opacity-80">AI identifies garbage areas</p>
            </div>
          </div>
        </div>
        <div className="bg-white bg-opacity-20 rounded p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-white text-indigo-600">
              <Bell className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Alert</p>
              <p className="text-xs opacity-80">Notifications sent to staff</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISummary;
