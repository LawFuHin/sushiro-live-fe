/**
 * Application constants
 */

// Default values
export const DEFAULTS = {
  STORE_ID: 2,
  CACHE_DURATION: 3000, // 3 seconds
  REFRESH_INTERVAL: 3000, // 3 seconds
  REQUEST_TIMEOUT: 15000, // 15 seconds
  TIME_UPDATE_INTERVAL: 1000, // 1 second
  COORDINATES: {
    LATITUDE: 22,
    LONGITUDE: 114,
  },
  NUM_RESULTS: 25,
  REGION: "HK",
};

// Store ticket statuses
export const NET_TICKET_STATUS = {
  OFFLINE_MANUAL: "OFFLINE_MANUAL",
};

// Queue types
export const QUEUE_TYPES = {
  STORE: "storeQueue",
  MIXED:"mixedQueue",
  BOOTH: "boothQueue",
  RESERVATION: "reservationQueue",
};

// API endpoints
export const API_ENDPOINTS = {
  STORES: "/api/stores",
  QUEUES: "/api/queues",
  CACHE: "/api/cache",
  HEALTH: "/health",
};

// Environment variables keys
export const ENV_VARS = {
  API_URL: "REACT_APP_API_URL",
  CACHE_DURATION: "REACT_APP_CACHE_DURATION",
  REFRESH_INTERVAL: "REACT_APP_REFRESH_INTERVAL",
  DEBUG: "REACT_APP_DEBUG",
  DEFAULT_STORE_ID: "REACT_APP_DEFAULT_STORE_ID",
  NODE_ENV: "NODE_ENV",
};

// UI Constants
export const UI = {
  QUEUE_DISPLAY_COUNT: 3,
  LOADING_STATES: {
    VALIDATING_STORE: "🔍 Validating store information...",
    LOADING_QUEUE: "Loading queue data...",
  },
};

// Validation limits
export const VALIDATION = {
  MAX_NUM_RESULTS: 100,
  MIN_NUM_RESULTS: 1,
};

// Time zones
export const TIMEZONES = {
  HONG_KONG: "Asia/Hong_Kong",
};
