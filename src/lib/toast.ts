import { toast } from 'sonner';

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

export const handleApiError = (error: unknown, defaultMessage = 'An error occurred') => {
  let errorMessage = defaultMessage;
  let errorDescription: string | undefined;

  // Type guard for axios error
  const isAxiosError = (err: unknown): err is { response?: { status: number; data?: { detail?: string | object } }; request?: unknown; message?: string } => {
    return typeof err === 'object' && err !== null;
  };

  if (isAxiosError(error)) {
    if (error.response) {
      // Backend returned an error response
      const status = error.response.status;
      const data = error.response.data;

      if (status === 400 && data?.detail) {
        errorMessage = 'Validation Error';
        errorDescription = typeof data.detail === 'string' 
          ? data.detail 
          : JSON.stringify(data.detail);
      } else if (status === 401) {
        errorMessage = 'Unauthorized';
        errorDescription = 'You are not authorized to perform this action';
      } else if (status === 403) {
        errorMessage = 'Forbidden';
        errorDescription = 'You do not have permission to perform this action';
      } else if (status === 404) {
        errorMessage = 'Not Found';
        errorDescription = 'The requested resource was not found';
      } else if (status === 409) {
        errorMessage = 'Conflict';
        errorDescription = data?.detail ? String(data.detail) : 'A conflict occurred with the current state';
      } else if (status >= 500) {
        errorMessage = 'Server Error';
        errorDescription = 'An internal server error occurred. Please try again later.';
      } else if (data?.detail) {
        errorDescription = String(data.detail);
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network Error';
      errorDescription = 'Unable to reach the server. Please check your connection.';
    } else if (error.message) {
      errorDescription = error.message;
    }
  }

  showToast.error(errorMessage, errorDescription);
};
