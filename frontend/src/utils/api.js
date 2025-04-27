const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Generic API request function with authentication and error handling
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options (method, body, headers)
 * @returns {Promise<any>} Response data
 */
export const fetchApi = async (endpoint, options = {}) => {
  const startTime = performance.now();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Prepare request configuration
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session handling
  };

  // Add request body for non-GET requests
  if (options.body && config.method !== 'GET') {
    config.body = JSON.stringify(options.body);
  }

  // Add authentication token if available
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  console.log(`[API] 🚀 ${config.method} Request to: ${url}`);

  try {
    const response = await fetch(url, config);
    const endTime = performance.now();
    console.log(`[API] ⏱️ Request took ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`[API] 📡 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    console.log(`[API] 📦 Response structure:`, {
      success: jsonResponse.success,
      hasData: !!jsonResponse.data,
      dataType: typeof jsonResponse.data
    });
    
    if (!jsonResponse.success) {
      throw new Error(jsonResponse.error || 'API request failed');
    }
    
    // For successful responses, return the data
    if (jsonResponse.success) {
      return jsonResponse.data;
    }

    // For API-level errors (where success: false)
    throw new Error(jsonResponse.error || 'API request failed');
  } catch (error) {
    console.error('[API] ❌ Request failed:', {
      endpoint,
      method: config.method,
      error: error.message,
      stack: error.stack
    });

    // Enhance error with additional context
    const enhancedError = new Error(error.message);
    enhancedError.status = error.status;
    enhancedError.endpoint = endpoint;
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: (endpoint, options = {}) => fetchApi(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => fetchApi(endpoint, { ...options, method: 'POST', body: data }),
  put: (endpoint, data, options = {}) => fetchApi(endpoint, { ...options, method: 'PUT', body: data }),
  delete: (endpoint, options = {}) => fetchApi(endpoint, { ...options, method: 'DELETE' }),
};