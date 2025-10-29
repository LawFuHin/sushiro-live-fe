import { DEFAULTS, API_ENDPOINTS, ENV_VARS, VALIDATION } from "./constants";
import { ErrorHandler, AppError, ErrorTypes } from "./errorHandler";

// Cache-specific constants
const CACHE_CONFIG = {
  MAX_SIZE: 20,
  CLEANUP_SIZE: 5,
};

// Environment-based configuration
const config = {
  apiBaseUrl: process.env[ENV_VARS.API_URL],
  cacheDuration:
    parseInt(process.env[ENV_VARS.CACHE_DURATION]) || DEFAULTS.CACHE_DURATION,
  refreshInterval:
    parseInt(process.env[ENV_VARS.REFRESH_INTERVAL]) ||
    DEFAULTS.REFRESH_INTERVAL,
  debug:
    process.env[ENV_VARS.DEBUG] === "true" ||
    process.env[ENV_VARS.NODE_ENV] === "development",
  isDevelopment: process.env[ENV_VARS.NODE_ENV] === "development",
};

// Centralized logging
const logger = {
  debug: (message, ...args) => {
    if (config.debug) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message, ...args) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

// Environment validation and logging
const validateConfig = () => {
  if (!config.apiBaseUrl) {
    logger.error("REACT_APP_API_URL is not configured");
    throw new Error("API URL is required");
  }

  if (config.debug) {
    logger.debug("Environment Configuration:", {
      nodeEnv: process.env.NODE_ENV,
      apiBaseUrl: config.apiBaseUrl,
      cacheDuration: config.cacheDuration,
      refreshInterval: config.refreshInterval,
    });
  }
};

// Validate configuration on module load
validateConfig();

// Enhanced cache manager
class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < config.cacheDuration) {
      logger.debug(`Cache hit for: ${this.truncateKey(key)}`);
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key); // Remove expired entry
      logger.debug(`Cache expired for: ${this.truncateKey(key)}`);
    }

    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    logger.debug(`Cached data for: ${this.truncateKey(key)}`);
    this.cleanup();
  }

  clear() {
    this.cache.clear();
    logger.info("Cache cleared");
  }

  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()).map((key) => ({
        url: this.truncateKey(key),
        age: Date.now() - this.cache.get(key).timestamp,
      })),
    };
  }

  cleanup() {
    if (this.cache.size > CACHE_CONFIG.MAX_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove oldest entries
      for (let i = 0; i < CACHE_CONFIG.CLEANUP_SIZE; i++) {
        this.cache.delete(entries[i][0]);
      }

      logger.debug(
        `Cache cleaned up, removed ${CACHE_CONFIG.CLEANUP_SIZE} old entries`
      );
    }
  }

  truncateKey(key) {
    return key.length > 50 ? `${key.substring(0, 50)}...` : key;
  }
}

// Cache instance
const cacheManager = new CacheManager();

// Enhanced API client
class ApiClient {
  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    logger.debug(`API Request: ${endpoint}`);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: AbortSignal.timeout(DEFAULTS.REQUEST_TIMEOUT),
        ...options,
      });

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        const error = new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      const data = await response.json();
      logger.debug(`API Success: ${endpoint}`);
      return data;
    } catch (error) {
      if (error.name === "TimeoutError") {
        logger.error(`API Timeout: ${endpoint}`);
        throw new Error(`Request timeout for ${endpoint}`);
      }

      logger.error(`API Error: ${endpoint}`, error.message);
      throw error;
    }
  }

  async parseErrorResponse(response) {
    try {
      return await response.json();
    } catch {
      return { message: `HTTP ${response.status}: ${response.statusText}` };
    }
  }
}

// API client instance
const apiClient = new ApiClient();

// API functions with improved error handling and validation
export async function fetchSushiroStores(
  latitude = DEFAULTS.COORDINATES.LATITUDE,
  longitude = DEFAULTS.COORDINATES.LONGITUDE,
  numresults = DEFAULTS.NUM_RESULTS,
  region = DEFAULTS.REGION
) {
  // Validate parameters
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new AppError(
      "Invalid coordinates: latitude and longitude must be numbers",
      ErrorTypes.VALIDATION_ERROR
    );
  }

  if (
    numresults < VALIDATION.MIN_NUM_RESULTS ||
    numresults > VALIDATION.MAX_NUM_RESULTS
  ) {
    throw new AppError(
      `Invalid numresults: must be between ${VALIDATION.MIN_NUM_RESULTS} and ${VALIDATION.MAX_NUM_RESULTS}`,
      ErrorTypes.VALIDATION_ERROR
    );
  }

  const endpoint = `${API_ENDPOINTS.STORES}?latitude=${latitude}&longitude=${longitude}&numresults=${numresults}&region=${region}`;

  try {
    // Check cache first
    const cached = cacheManager.get(endpoint);
    if (cached) {
      return cached;
    }

    const data = await apiClient.request(endpoint);

    // Validate response structure
    if (!Array.isArray(data)) {
      throw new AppError(
        "Invalid response: expected array of stores",
        ErrorTypes.API_ERROR
      );
    }

    // Cache the successful response
    cacheManager.set(endpoint, data);

    return data;
  } catch (error) {
    const enhancedError = ErrorHandler.categorizeError(error);
    ErrorHandler.logError(enhancedError, "fetchSushiroStores");
    throw enhancedError;
  }
}

export async function fetchStoreQueues(storeId, region = DEFAULTS.REGION) {
  // Validate parameters
  if (
    !storeId ||
    (typeof storeId !== "number" && typeof storeId !== "string")
  ) {
    throw new AppError(
      "Invalid storeId: must be a valid number or string",
      ErrorTypes.VALIDATION_ERROR
    );
  }

  const endpoint = `${API_ENDPOINTS.QUEUES}/${storeId}?region=${region}`;

  try {
    // Check cache first
    const cached = cacheManager.get(endpoint);
    if (cached) {
      return cached;
    }

    const data = await apiClient.request(endpoint);

    // Validate response structure
    if (!data || typeof data !== "object") {
      throw new AppError(
        "Invalid response: expected queue data object",
        ErrorTypes.API_ERROR
      );
    }

    // Cache the successful response
    cacheManager.set(endpoint, data);

    return data;
  } catch (error) {
    const enhancedError = ErrorHandler.categorizeError(error);
    ErrorHandler.logError(
      enhancedError,
      `fetchStoreQueues - Store ID: ${storeId}`
    );
    throw enhancedError;
  }
}

// Utility functions with improved error handling
export async function clearApiCache() {
  try {
    // Clear frontend cache
    cacheManager.clear();

    // Clear backend cache
    await apiClient.request(API_ENDPOINTS.CACHE, { method: "DELETE" });
    logger.info("Both frontend and backend caches cleared successfully");
  } catch (error) {
    const enhancedError = ErrorHandler.categorizeError(error);
    ErrorHandler.logError(
      enhancedError,
      "clearApiCache - backend cache clear failed"
    );
    // Frontend cache is still cleared even if backend fails
    throw new AppError(
      `Cache clear partially failed: ${error.message}`,
      ErrorTypes.API_ERROR,
      error
    );
  }
}

export function getCacheStats() {
  return {
    frontend: cacheManager.getStats(),
    config: {
      cacheDuration: config.cacheDuration,
      refreshInterval: config.refreshInterval,
      debug: config.debug,
    },
  };
}

export async function checkBackendHealth() {
  try {
    const healthData = await apiClient.request(API_ENDPOINTS.HEALTH);
    logger.debug("Backend health check successful");
    return healthData;
  } catch (error) {
    const enhancedError = ErrorHandler.categorizeError(error);
    ErrorHandler.logError(enhancedError, "checkBackendHealth");
    throw enhancedError;
  }
}

// Export configuration for use in other components
export { config };
