import { Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useAppContext } from '../../context/AppContext';

const NotificationCard = ({ notification }) => {
  const { formatDetectionDate = (date) => date, updateDetectionStatus } = useAppContext();

  const handleStatusUpdate = (newStatus) => {
    if (notification?.id && updateDetectionStatus) {
      updateDetectionStatus(notification.id, newStatus);
    }
  };

  // Fallback values for missing properties
  const confidence = (notification?.confidence ?? 0) * 100;
  const imageUrl = notification?.image_url || 'https://e3.365dm.com/25/03/1600x900/skynews-india-delhi-garbage-mountain_6848989.jpg?20250307131130'; // Use backend-provided URL
  const detectedAt = notification?.detected_at || new Date().toISOString();
  const latitude = notification?.latitude?.toFixed(4) || '0.0000';
  const longitude = notification?.longitude?.toFixed(4) || '0.0000';
  const source = notification?.source || 'unknown';

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 mb-4 md:mb-0 relative">
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
              AI Confidence: {confidence.toFixed(0)}%
            </div>
            <img
              src={imageUrl} // Use backend-provided URL
              alt={`Garbage at ${latitude}, ${longitude}`}
              className="rounded-lg w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = 'https://e3.365dm.com/25/03/1600x900/skynews-india-delhi-garbage-mountain_6848989.jpg?20250307131130'; // Fallback image
              }}
            />
          </div>

          <div className="md:w-3/4 md:pl-6">
            <div className="flex flex-col md:flex-row md:justify-between mb-2">
              <h3 className="text-lg font-medium text-indigo-900 mb-1 md:mb-0">
                Detection #{notification?.id?.slice(-4) || '0000'}
              </h3>
              <StatusBadge status={notification?.status} />
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {typeof formatDetectionDate === 'function'
                  ? formatDetectionDate(detectedAt)
                  : detectedAt}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-500">Coordinates:</p>
                <p className="font-medium">
                  {latitude}, {longitude}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Source:</p>
                <p className="font-medium capitalize">{source}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              {notification?.status === 'pending' && (
                <button 
                  onClick={() => handleStatusUpdate('in_progress')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700"
                >
                  Assign Cleanup Team
                </button>
              )}
              {notification?.status === 'in_progress' && (
                <button 
                  onClick={() => handleStatusUpdate('completed')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mark as Complete
                </button>
              )}
              {notification?.status === 'completed' && (
                <button
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 opacity-50"
                  disabled
                >
                  Cleanup Complete
                </button>
              )}
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;