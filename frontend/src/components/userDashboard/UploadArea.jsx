import { useAppContext } from '../../context/AppContext';

const UploadArea = () => {
  const { preview, file, handleFileChange, handleFileInputClick } = useAppContext();

  return (
    <div className="relative group">
      <div className={`relative border-2 rounded-xl transition-all duration-300 overflow-hidden ${
        preview ? 'border-blue-200 bg-blue-50' : 
        'border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      }`}>
        {!preview ? (
          <div className="py-10 flex flex-col items-center justify-center">
            <div className="mb-3 p-3 rounded-full bg-blue-100 text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-700">
              Drag & drop an image
            </p>
            <p className="text-sm text-gray-500 mb-2">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: JPG, PNG, JPEG (max 5MB)
            </p>
          </div>
        ) : (
          <div className="p-4">
            <div className="relative w-full rounded-lg overflow-hidden shadow-md aspect-video flex items-center justify-center bg-gray-100">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 max-w-full object-contain"
              />
              <button
                onClick={handleFileInputClick}
                className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-red-100 transition-colors duration-200"
                aria-label="Remove image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs text-white">
                {file?.name}
              </div>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          onClick={(e) => (e.target.value = null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ pointerEvents: "auto" }}
          aria-label="Upload an image"
        />
      </div>
    </div>
  );
};

export default UploadArea;