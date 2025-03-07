import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import PrivateRoute from './components/PrivateRoute';
import UserDashboard from './pages/UserDashboard';
import NagarpalikaDashboard from './pages/NagarPalikaDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UserComplaints from './pages/UserComplaints';

function App() {
  return (
    <Router>
      <AuthProvider> 
        <AppProvider> 
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Redirect '/' to correct dashboard */}
            <Route path="/" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
            <Route path="/user-dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
            <Route path="/nagarpalika" element={<PrivateRoute><NagarpalikaDashboard /></PrivateRoute>} />

            {/* User Complaints */}
            <Route path="/my-complaints" element={<PrivateRoute><UserComplaints /></PrivateRoute>} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
