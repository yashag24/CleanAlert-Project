import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation(); // Get the current route

  console.log("PrivateRoute Debug:");
  console.log("Current User:", currentUser);
  console.log("Current Path:", location.pathname);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    console.log("❌ No user found! Redirecting to login...");
    return <Navigate to="/login" />;
  }

  // If user is trying to access '/', redirect based on role
  if (location.pathname === "/") {
    if (currentUser.role === "admin") {
      console.log("🔹 Admin detected! Redirecting to Nagarpalika Dashboard...");
      return <Navigate to="/nagarpalika" />;
    } else {
      console.log("✅ Regular user detected! Redirecting to User Dashboard...");
      return <Navigate to="/user-dashboard" />;
    }
  }

  return children; // Allow access to other protected routes
};

export default PrivateRoute;
