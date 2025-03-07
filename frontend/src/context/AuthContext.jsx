import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation

  // Load user from localStorage on startup
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Register Function
  const register = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Register API Response:", data); // Debugging

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      return { success: true, message: "Registration successful" };
    } catch (error) {
      console.error("Register Error:", error.message);
      throw error;
    }
  };

  // Login Function
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login API Response:", data); // Debugging

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (!data.user || !data.user.role) {
        console.error("Invalid user data:", data);
        throw new Error("Invalid user data received");
      }

      setCurrentUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Redirecting to dashboard...");
      navigate("/dashboard"); // 🔥 Redirect user after successful login

      return { success: true, message: "Login successful" };
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error;
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login"); // 🔥 Redirect to login after logout
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook for Authentication Context
export const useAuth = () => useContext(AuthContext);
