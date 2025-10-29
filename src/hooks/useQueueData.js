import { useState, useEffect, useCallback } from "react";
import { fetchStoreQueues, config } from "../utils/sushiroDataHelper";
import { ErrorHandler } from "../utils/errorHandler";

/**
 * Custom hook for managing queue data
 * @param {number|null} storeId - The store ID to fetch queues for
 * @param {Object} storeInfo - Store information object
 * @returns {Object} Queue data and loading state
 */
export function useQueueData(storeId, storeInfo) {
  const [queueData, setQueueData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadQueueData = useCallback(async () => {
    if (!storeId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        `Loading queue data for store: ${storeInfo?.name || storeId}`
      );
      const data = await fetchStoreQueues(storeId);
      setQueueData(data);
    } catch (error) {
      const errorMessage = ErrorHandler.getUserFriendlyMessage(error);
      setError(errorMessage);
      ErrorHandler.logError(error, "useQueueData - loadQueueData");
    } finally {
      setIsLoading(false);
    }
  }, [storeId, storeInfo?.name]);

  useEffect(() => {
    if (!storeId) return;

    loadQueueData();

    const refreshInterval = config.refreshInterval || 30000;
    console.log(`Setting refresh interval: ${refreshInterval}ms`);

    const interval = setInterval(loadQueueData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadQueueData, storeId]);

  return {
    queueData,
    isLoading,
    error,
    refetch: loadQueueData,
  };
}
