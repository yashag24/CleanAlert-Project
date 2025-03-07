import { useAppContext } from '../../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

const UploadButton = () => {
  const { loading, handleUpload, file } = useAppContext();

  return (
    <button
      onClick={handleUpload}
      disabled={loading || !file}
      className={`w-full px-6 py-3 relative overflow-hidden group 
        bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 
        text-white font-medium rounded-xl flex items-center justify-center 
        shadow-md transition-all duration-300
        ${loading || !file ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}`}
      aria-label={loading ? "Processing..." : "Upload and analyze image"}
    >
      <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-96 ease"></span>
      
      {loading ? (
        <LoadingSpinner text="Processing..." />
      ) : (
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          {file ? "Analyze Image" : "Select Image First"}
        </span>
      )}
    </button>
  );
};

export default UploadButton;