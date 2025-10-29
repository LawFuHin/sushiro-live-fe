import { useState, useEffect, useCallback } from "react";
import { fetchSushiroStores } from "../utils/sushiroDataHelper";
import { DEFAULTS, ENV_VARS } from "../utils/constants";
import { ErrorHandler } from "../utils/errorHandler";

/**
 * Custom hook for managing store ID validation and selection
 * @returns {Object} Store ID, store info, loading state, and error
 */
export function useStoreValidation() {
  const [storeId, setStoreId] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getValidStoreId = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const urlParams = new URLSearchParams(window.location.search);
      const urlStoreId = urlParams.get("storeId");
      const storesData = await fetchSushiroStores();

      if (!Array.isArray(storesData) || storesData.length === 0) {
        throw new Error("No stores available");
      }

      // Try URL parameter first
      if (urlStoreId) {
        const requestedStoreId = parseInt(urlStoreId, 10);

        if (!isNaN(requestedStoreId)) {
          const foundStore = storesData.find(
            (store) => store.id === requestedStoreId
          );

          if (foundStore) {
            console.log(
              `Using store from URL: ${foundStore.name} (ID: ${requestedStoreId})`
            );
            setStoreInfo(foundStore);
            return requestedStoreId;
          }

          console.warn(`Store ID ${requestedStoreId} not found`);
        } else {
          console.warn(`Invalid store ID in URL: ${urlStoreId}`);
        }
      }

      // Fall back to environment or default
      const envStoreId = process.env[ENV_VARS.DEFAULT_STORE_ID];
      const defaultStoreId = envStoreId
        ? parseInt(envStoreId, 10)
        : DEFAULTS.STORE_ID;

      const defaultStore = storesData.find(
        (store) => store.id === defaultStoreId
      );

      if (defaultStore) {
        console.log(
          `Using default store: ${defaultStore.name} (ID: ${defaultStoreId})`
        );
        setStoreInfo(defaultStore);
        return defaultStoreId;
      }

      // Use first available store as last resort
      const firstStore = storesData[0];
      console.log(
        `Using first available store: ${firstStore.name} (ID: ${firstStore.id})`
      );
      setStoreInfo(firstStore);
      return firstStore.id;
    } catch (error) {
      ErrorHandler.logError(error, "useStoreValidation - getValidStoreId");
      setError(ErrorHandler.getUserFriendlyMessage(error));

      // Final fallback
      const fallbackId = process.env[ENV_VARS.DEFAULT_STORE_ID]
        ? parseInt(process.env[ENV_VARS.DEFAULT_STORE_ID], 10)
        : DEFAULTS.STORE_ID;

      console.log(`Using fallback store ID: ${fallbackId}`);
      return fallbackId;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeStoreId = async () => {
      const validStoreId = await getValidStoreId();
      setStoreId(validStoreId);
    };

    initializeStoreId();
  }, [getValidStoreId]);

  return {
    storeId,
    storeInfo,
    isLoading,
    error,
    refetch: getValidStoreId,
  };
}
