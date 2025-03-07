import { useAppContext } from '../../context/AppContext';

const AnalysisResults = () => {
  const { result } = useAppContext();

  return (
    <div className="border-t border-gray-100">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Analysis Results
        </h3>

        <div className="space-y-6">
          {/* Prediction Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-5 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700 font-medium">Classification</span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  result.prediction === 'Garbage'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {result.prediction}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Confidence</span>
                  <span className="text-sm font-medium text-gray-700">
                    {(result.confidence * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      result.prediction === 'Garbage'
                        ? 'bg-gradient-to-r from-yellow-300 to-red-500'
                        : 'bg-gradient-to-r from-blue-300 to-green-500'
                    }`}
                    style={{ width: `${(result.confidence ?? 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Card */}
          {(result.latitude && result.longitude) || result.location_name ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 shadow-inner">
              <h4 className="text-gray-700 font-medium mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Location Information
              </h4>

              <div className="space-y-3">
                {result.latitude && result.longitude && (
                  <div className="flex items-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">
                        GPS Coordinates
                      </span>
                      <span className="text-gray-700 font-mono text-sm">
                        {Number(result.latitude).toFixed(6)},{' '}
                        {Number(result.longitude).toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}

                {result.location_name && (
                  <div className="flex items-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">
                        Address
                      </span>
                      <span className="text-gray-700 text-sm">
                        {result.location_name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
