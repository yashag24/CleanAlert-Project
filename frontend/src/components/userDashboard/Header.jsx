import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page
  };

  return (
    <header className="w-full max-w-[1000px] text-center mb-8 relative">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-500 to-indigo-600">
        Roadside Garbage Detection
      </h1>
      <p className="text-gray-600 max-w-xl mx-auto">
        Help keep our environment clean by identifying and reporting roadside garbage
      </p>

      {currentUser && (
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
