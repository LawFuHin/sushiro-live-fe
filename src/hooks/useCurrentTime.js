import { useState, useEffect } from "react";
import { getCurrentHKTTime } from "../utils/timeHelpers";
import { DEFAULTS } from "../utils/constants";

/**
 * Custom hook for managing time updates
 * @param {boolean} includeSeconds - Whether to include seconds in the time display
 * @returns {string} Current time string
 */
export function useCurrentTime(includeSeconds = false) {
  const [currentTime, setCurrentTime] = useState(() =>
    getCurrentHKTTime(includeSeconds)
  );

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentHKTTime(includeSeconds));
    };

    // Update time immediately
    updateTime();

    // Update time at regular intervals
    const timeInterval = setInterval(updateTime, DEFAULTS.TIME_UPDATE_INTERVAL);
    return () => clearInterval(timeInterval);
  }, [includeSeconds]);

  return currentTime;
}
