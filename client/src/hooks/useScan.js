import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useScan = () => {
  const [scanId, setScanId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Query for scan results
  const {
    data: scanData,
    refetch: refetchScan,
    isLoading: isRefetching
  } = useQuery({
    queryKey: ['scan', scanId],
    queryFn: async () => {
      if (!scanId) return null;
      const response = await axios.get(`/api/scan/${scanId}`);
      return response.data;
    },
    enabled: !!scanId,
    refetchInterval: (data) => {
      // Stop polling if scan is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      // Poll every 2 seconds while scanning
      return 2000;
    },
    retry: 3,
    retryDelay: 1000,
  });

  const startScan = async (url) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/scan', { url });
      const { scanId: newScanId } = response.data;
      
      setScanId(newScanId);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start scan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScan = () => {
    setScanId(null);
    setError(null);
  };

  return {
    scanData,
    startScan,
    resetScan,
    isLoading: isLoading || isRefetching,
    error,
    scanId
  };
};

// Hook for getting recent scans
export const useRecentScans = () => {
  return useQuery({
    queryKey: ['recentScans'],
    queryFn: async () => {
      const response = await axios.get('/api/scan');
      return response.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

// Hook for getting detailed scan analysis
export const useScanAnalysis = (scanId) => {
  return useQuery({
    queryKey: ['scanAnalysis', scanId],
    queryFn: async () => {
      if (!scanId) return null;
      const response = await axios.get(`/api/scan/${scanId}`);
      return response.data;
    },
    enabled: !!scanId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}; 