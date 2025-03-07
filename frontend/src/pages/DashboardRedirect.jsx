import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardRedirect = () => {
  const { currentUser } = useAuth();

  console.log("🔄 DashboardRedirect Debug:", currentUser);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return currentUser.role === "admin" ? (
    <Navigate to="/nagarpalika" />
  ) : (
    <Navigate to="/user-dashboard" />
  );
};

export default DashboardRedirect;
