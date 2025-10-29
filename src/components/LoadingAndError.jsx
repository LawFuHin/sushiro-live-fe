import React from "react";

/**
 * Loading spinner component with optional message
 */
export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="App">
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">{message}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Error display component
 */
export function ErrorDisplay({ error, onRetry }) {
  return (
    <div className="App">
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          {onRetry && (
            <button className="btn btn-outline-danger" onClick={onRetry}>
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
