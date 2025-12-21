/**
 * Centralized Error Handling Utility
 * Provides consistent error handling across the application
 */

import { toast } from "sonner";

export interface ApiError {
  message: string;
  status?: number;
  detail?: string;
}

/**
 * Handle API errors with toast notifications
 */
export const handleApiError = (error: any, defaultMessage: string = "An error occurred"): void => {
  let errorMessage = defaultMessage;
  
  if (error?.response) {
    // HTTP error response
    errorMessage = error.response.data?.detail || error.response.data?.message || defaultMessage;
  } else if (error?.message) {
    // JavaScript error
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  toast.error(errorMessage);
};

/**
 * Handle API success with toast notifications
 */
export const handleApiSuccess = (message: string): void => {
  toast.success(message);
};

/**
 * Show loading toast
 */
export const showLoadingToast = (message: string = "Loading..."): string | number => {
  return toast.loading(message);
};

/**
 * Dismiss a specific toast
 */
export const dismissToast = (toastId: string | number): void => {
  toast.dismiss(toastId);
};

/**
 * Parse fetch response and throw error if not ok
 */
export const handleFetchResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Wrapper for API calls with automatic error handling
 */
export const apiCallWithErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  successMessage?: string,
  errorMessage?: string
): Promise<T | null> => {
  try {
    const result = await apiCall();
    if (successMessage) {
      handleApiSuccess(successMessage);
    }
    return result;
  } catch (error) {
    handleApiError(error, errorMessage);
    return null;
  }
};
