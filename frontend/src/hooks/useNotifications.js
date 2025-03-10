import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const STORAGE_KEY = "garbage_detections";

export const useNotifications = (user) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

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
    } catch (error) {
      console.error("Failed to delete detection:", error);
      throw error; // Re-throw for handling in the component
    }
  };

  return {
    notifications,
    setNotifications,
    deleteDetection,
    socket,
  };
};