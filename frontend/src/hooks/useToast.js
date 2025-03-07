// useToast.js - Custom hook for displaying toast notifications

import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = ({ title, description, variant }) => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 5000); // Hide toast after 5 seconds
  };

  return { toast: showToast };
};
