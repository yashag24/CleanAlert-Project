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
  const [notifications, setNotifications] = useState([]); // Initialize as empty array

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Date formatting function
  const formatDetectionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000"); // Connect to the backend
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch notifications from backend on mount or user login
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/detections");
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []); // Ensure data is an array
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]); // Fallback to empty array on error
      }
    };

    fetchNotifications();
  }, [user]); // Refetch when user changes (e.g., logs in)

  // Sync notifications with local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

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
      toast({
        title: "Invalid File Type",
        description: "Please upload JPG, JPEG, or PNG files only",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
      toast({
        title: "Upload Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle deletion of detections
  const deleteDetection = async (detectionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/detections/${detectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete detection");
      }

      // Remove the deleted detection from the state
      setNotifications((prev) => prev.filter((n) => n.id !== detectionId));
      toast({
        title: "Detection Deleted",
        description: "The detection has been successfully deleted.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to delete detection:", error);
      toast({
        title: "Deletion Error",
        description: "Failed to delete the detection.",
        variant: "destructive",
      });
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
        formatDetectionDate,
        handleFileChange,
        handleUpload,
        deleteDetection, // Add this
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