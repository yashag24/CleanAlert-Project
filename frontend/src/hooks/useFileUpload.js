import { useState, useEffect } from "react";

export const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // File validation
  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Invalid File Type: Please upload JPG, JPEG, or PNG files only");
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error("File Too Large: Maximum file size is 5MB");
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      validateFile(selectedFile);
      if (preview) URL.revokeObjectURL(preview);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    } catch (err) {
      setError(err.message);
      setFile(null);
      setPreview(null);
    }
  };

  const handleUpload = async (file, getLocation, user, socket, setNotifications) => {
    if (!file || loading) return;

    setLoading(true);
    setError(null);

    try {
      const locationData = await getLocation().catch(() => ({
        latitude: null,
        longitude: null,
      }));

      const formData = new FormData();
      formData.append("image", file);
      formData.append("latitude", locationData.latitude);
      formData.append("longitude", locationData.longitude);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      setResult(data);

      if (data.prediction === "Garbage") {
        const newDetection = {
          id: data.id, // Use the ID returned by the backend
          image_url: data.image_url, // Use the image URL returned by the backend
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          confidence: data.confidence,
          status: "pending",
          detected_at: data.timestamp,
          source: "user_upload",
          userId: user?.id,
        };

        setNotifications((prev) => [newDetection, ...prev]);

        // Emit the new detection via WebSocket
        if (socket) {
          socket.emit("user_detection", newDetection);
        } else {
          console.error("WebSocket connection not established");
        }
      }
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw for handling in the component
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
    handleUpload,
    resetFileInput: () => {
      setFile(null);
      setPreview(null);
      setResult(null);
    },
  };
};