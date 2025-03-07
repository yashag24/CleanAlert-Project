import { useState } from 'react';
import { useToast } from './useToast';
import useLocation from './useLocation';

const useFileUpload = () => {
  const { toast } = useToast();
  const { getLocation } = useLocation();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Only JPG, PNG, and JPEG files are allowed',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const handleFileInputClick = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No File Selected',
        description: 'Please select a file first',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user location
      const location = await getLocation();
      
      // Prepare form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);

      // Send to backend
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setResult(data);
      toast({
        title: 'Upload Successful',
        description: `Classification: ${data.prediction} (${(data.confidence * 100).toFixed(2)}%)`,
        variant: data.prediction === 'Garbage' ? 'destructive' : 'default'
      });

    } catch (err) {
      setError(err.message);
      toast({
        title: 'Upload Failed',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    file,
    preview,
    result,
    loading,
    error,
    handleFileChange,
    handleFileInputClick,
    handleUpload,
  };
};

export default useFileUpload;