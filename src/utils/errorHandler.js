import React from "react";

/**
 * Centralized error handling utilities
 */

// Error types for better error categorization
export const ErrorTypes = {
  NETWORK_ERROR: "NETWORK_ERROR",
  API_ERROR: "API_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN_ERROR, originalError = null) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error handler utility functions
 */
export class ErrorHandler {
  static categorizeError(error) {
    if (error instanceof AppError) {
      return error;
    }

    if (error.name === "TimeoutError" || error.message.includes("timeout")) {
      return new AppError(
        "Request timed out. Please try again.",
        ErrorTypes.TIMEOUT_ERROR,
        error
      );
    }

    if (error.message.includes("fetch") || error.message.includes("network")) {
      return new AppError(
        "Network error. Please check your connection.",
        ErrorTypes.NETWORK_ERROR,
        error
      );
    }

    if (error.status >= 400 && error.status < 500) {
      return new AppError(
        "Invalid request. Please try again.",
        ErrorTypes.API_ERROR,
        error
      );
    }

    if (error.status >= 500) {
      return new AppError(
        "Server error. Please try again later.",
        ErrorTypes.API_ERROR,
        error
      );
    }

    return new AppError(
      error.message || "An unexpected error occurred.",
      ErrorTypes.UNKNOWN_ERROR,
      error
    );
  }

  static getUserFriendlyMessage(error) {
    const categorizedError = this.categorizeError(error);

    switch (categorizedError.type) {
      case ErrorTypes.NETWORK_ERROR:
        return "Unable to connect. Please check your internet connection and try again.";
      case ErrorTypes.TIMEOUT_ERROR:
        return "Request is taking too long. Please try again.";
      case ErrorTypes.API_ERROR:
        return "Service temporarily unavailable. Please try again in a moment.";
      case ErrorTypes.VALIDATION_ERROR:
        return categorizedError.message;
      default:
        return "Something went wrong. Please refresh the page and try again.";
    }
  }

  static logError(error, context = "") {
    const categorizedError = this.categorizeError(error);
    const errorInfo = {
      type: categorizedError.type,
      message: categorizedError.message,
      context,
      timestamp: categorizedError.timestamp,
      stack: categorizedError.stack,
      originalError: categorizedError.originalError,
    };

    console.error("[ERROR]", errorInfo);

    // In production, you might want to send this to an error tracking service
    // Example: Sentry.captureException(categorizedError);
  }
}

/**
 * React error boundary helper
 */
export const createErrorBoundary = (fallbackComponent) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      ErrorHandler.logError(
        error,
        `Error Boundary: ${errorInfo.componentStack}`
      );
    }

    render() {
      if (this.state.hasError) {
        return fallbackComponent
          ? fallbackComponent(this.state.error)
          : React.createElement("div", null, "Something went wrong.");
      }

      return this.props.children;
    }
  };
};
