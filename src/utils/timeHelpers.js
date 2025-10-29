import { TIMEZONES } from "./constants";

// Constants
const TIME_FORMAT_OPTIONS = { timeZone: TIMEZONES.HONG_KONG };

/**
 * Get current time formatted in Hong Kong timezone
 * @param {boolean} includeSeconds - Whether to include seconds in the output
 * @returns {string} Formatted time string (HH:MM or HH:MM:SS)
 */
export function getCurrentHKTTime(includeSeconds = false) {
  try {
    const now = new Date();
    const hktTime = new Date(now.toLocaleString("en-US", TIME_FORMAT_OPTIONS));

    const hours = hktTime.getHours().toString().padStart(2, "0");
    const minutes = hktTime.getMinutes().toString().padStart(2, "0");

    if (includeSeconds) {
      const seconds = hktTime.getSeconds().toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error getting HKT time:", error);
    // Fallback to local time if timezone conversion fails
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return includeSeconds
      ? `${hours}:${minutes}:${now.getSeconds().toString().padStart(2, "0")}`
      : `${hours}:${minutes}`;
  }
}

/**
 * Get current date and time in Hong Kong timezone
 * @returns {string} Formatted date and time string
 */
export function getCurrentHKTDateTime() {
  try {
    const now = new Date();
    return now.toLocaleString("en-US", {
      ...TIME_FORMAT_OPTIONS,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    console.error("Error getting HKT date time:", error);
    return new Date().toLocaleString();
  }
}
