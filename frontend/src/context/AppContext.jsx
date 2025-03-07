import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import useLocation from "../hooks/useLocation";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const AppContext = createContext();
const STORAGE_KEY = "garbage_detections";

export const AppProvider = ({ children }) => {
  const { toast } = useToast();
  const { getLocation } = useLocation();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // File validation
  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPG, JPEG, or PNG files only",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file || loading) return;

    setLoading(true);
    setError(null);

    try {
      const locationData = await getLocation();
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
          id: Date.now().toString(),
          image_url: URL.createObjectURL(file),
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          confidence: data.confidence,
          status: "pending",
          detected_at: new Date().toISOString(),
          source: "user_upload",
          userId: user?.id,
        };

        setNotifications(prev => [newDetection, ...prev]);
        socket.emit("user_detection", newDetection);
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: "Upload Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        file,
        preview,
        result,
        loading,
        error,
        notifications,
        handleFileChange,
        handleUpload,
        handleFileInputClick: () => {
          setFile(null);
          setPreview(null);
          setResult(null);
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);