import React, { useState, useEffect } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx'; // Import Login component
import { AuthProvider } from './context/AuthContext.js';

const App = () => {
  // Use useMemo to ensure AuthProvider instance is stable across renders
  const authProvider = useMemo(() => new AuthProvider(), []);
  const [authState, setAuthState] = useState(authProvider.state);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authProvider.subscribe(setAuthState);
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [authProvider]); // Re-subscribe if authProvider instance changes (it shouldn't with useMemo)

  const handleLogout = () => {
    authProvider.logout();
  };

  // No separate loading/error state needed here anymore, handled by auth state/components

  return (
    <div id="app">
      {authState.isAuthenticated ? (
        <>
          <header className="dashboard-header">
            <div className="container d-flex justify-content-between align-items-center">
              <h1 className="m-0">ERP Dashboard</h1>
              <div className="user-info">
                <span>Welcome, {authState.user?.username} ({authState.user?.role})</span>
                <button onClick={handleLogout} className="btn btn-link text-light ml-3">
                  Logout
                </button>
              </div>
            </div>
          </header>
          <main className="container">
            {/* Pass user role to Dashboard if needed for conditional rendering inside */}
            <Dashboard userRole={authState.user?.role} />
          </main>
        </>
      ) : (
        // Render Login component if not authenticated
        <Login authProvider={authProvider} />
      )}
    </div>
  );
};

export default App;
