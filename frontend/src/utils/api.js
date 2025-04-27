const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const fetchApi = async (endpoint) => {
  const startTime = performance.now();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  console.log(`[API] 🚀 Request to: ${url}`);

  try {
    const response = await fetch(url);
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
    
    return jsonResponse.data;
  } catch (error) {
    console.error('[API] ❌ Request failed:', {
      endpoint,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};