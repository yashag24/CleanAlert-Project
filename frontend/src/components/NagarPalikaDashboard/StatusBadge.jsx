import React from "react";

const StatusBadge = ({ status }) => {
  // Define styles based on the status
  const statusStyles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  // Define labels based on the status
  const statusLabels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};

export default StatusBadge;
