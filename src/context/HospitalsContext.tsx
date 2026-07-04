import React, { createContext, useContext, useState, useEffect } from 'react';
import { Hospital } from '../types';
import { hospitalsApi } from '../services/api';

interface HospitalsContextType {
  hospitals: Hospital[];
  isLoading: boolean;
  refetchHospitals: () => Promise<void>;
}

const HospitalsContext = createContext<HospitalsContextType | undefined>(undefined);

export const HospitalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHospitals = async () => {
    try {
      setIsLoading(true);
      const data = await hospitalsApi.getAll();
      // Ensure rating is a number and distance is calculated/present
      const formatted = data.map(h => ({
        ...h,
        rating: typeof h.rating === 'number' ? h.rating : Number(h.rating) || 0,
      })) as Hospital[];
      setHospitals(formatted);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  return (
    <HospitalsContext.Provider value={{ hospitals, isLoading, refetchHospitals: fetchHospitals }}>
      {children}
    </HospitalsContext.Provider>
  );
};

export const useHospitals = () => {
  const context = useContext(HospitalsContext);
  if (!context) {
    throw new Error('useHospitals must be used within a HospitalsProvider');
  }
  return context;
};
