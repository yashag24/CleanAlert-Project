import Header from '../components/userDashboard/Header';
import MainCard from '../components/userDashboard/MainCard';
import Footer from '../components/userDashboard/Footer';

const UserDashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 p-6">
      <Header />
      <MainCard />
      <Footer />
    </div>
  );
};

export default UserDashboard;
