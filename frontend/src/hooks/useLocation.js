import { useState } from 'react';

const useLocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    status: 'idle',
  });

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocation((prev) => ({ ...prev, status: 'error' }));
        return reject('Geolocation not supported');
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            status: 'success',
          });
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setLocation((prev) => ({ ...prev, status: 'error' }));
          reject(error.message);
        }
      );
    });
  };

  return { getLocation };
};

export default useLocation;
