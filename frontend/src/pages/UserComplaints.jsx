import { useAppContext } from '../context/AppContext';
import NotificationCard from '../components/NagarPalikaDashboard/NotificationCard';
import { motion } from 'framer-motion';

const UserComplaints = () => {
  const { getUserComplaints } = useAppContext();
  const complaints = getUserComplaints();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Complaints</h1>
        <div className="space-y-4">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NotificationCard notification={complaint} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              You haven't submitted any complaints yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserComplaints;