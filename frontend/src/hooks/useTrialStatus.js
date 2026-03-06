import { useState, useEffect, useCallback } from 'react';
import trialService from '../services/trialService';

export const useTrialStatus = (invitationId, enabled = true) => {
  const [trialStatus, setTrialStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrialStatus = useCallback(async () => {
    if (!invitationId || !enabled) return;

    try {
      setLoading(true);
      const response = await trialService.getTrialStatus(invitationId);
      setTrialStatus(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [invitationId, enabled]);

  useEffect(() => {
    fetchTrialStatus();

    // Poll every 5 seconds if in trial mode
    if (enabled && invitationId) {
      const interval = setInterval(fetchTrialStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchTrialStatus, enabled, invitationId]);

  return {
    trialStatus,
    loading,
    error,
    refetch: fetchTrialStatus,
  };
};

export default useTrialStatus;
