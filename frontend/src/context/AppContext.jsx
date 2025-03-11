import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { useNotifications } from "../hooks/useNotifications";
import { useFileUpload } from "../hooks/useFileUpload";
import { useAuth } from "./AuthContext";
import useLocation from "../hooks/useLocation";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getLocation } = useLocation();

  // Use custom hooks
  const { notifications, setNotifications, deleteDetection, socket } =
    useNotifications(user);
  const {
    file,
    preview,
    result,
    loading,
    error,
    handleFileChange,
    handleUpload,
    resetFileInput,
  } = useFileUpload();

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

  // Handle file upload with error toast
  const handleUploadWithToast = async () => {
    try {
      await handleUpload(file, getLocation, user, socket, setNotifications);
    } catch (err) {
      toast({
        title: "Upload Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Handle deletion with toast
  const handleDeleteDetection = async (detectionId) => {
    try {
      await deleteDetection(detectionId);
      toast({
        title: "Detection Deleted",
        description: "The detection has been successfully deleted.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Deletion Error",
        description: "Failed to delete the detection.",
        variant: "destructive",
      });
    }
  };

  // Handle status update
  const updateDetectionStatus = async (detectionId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/detections/${detectionId}/status`, // Add /status
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
  
      // Update the state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === detectionId ? { ...n, status: newStatus } : n
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      throw error;
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
        handleUpload: handleUploadWithToast,
        deleteDetection: handleDeleteDetection,
        updateDetectionStatus,
        resetFileInput,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
