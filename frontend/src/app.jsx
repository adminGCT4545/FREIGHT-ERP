import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import RoleSelector from './components/RoleSelector.jsx';
import { AuthProvider } from './context/AuthContext.js';

const App = () => {
  const [auth] = useState(() => new AuthProvider());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setError('Failed to load application. Please try again.');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleRoleChange = (role) => {
    console.log(`Switching to ${role} view`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container text-center p-5">
        <h2 className="text-danger">Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn bg-primary text-light p-2 m-3"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div id="app">
      <header className="dashboard-header">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="m-0">ERP Dashboard</h1>
          <RoleSelector onRoleChange={handleRoleChange} />
        </div>
      </header>
      <main className="container">
        <Dashboard />
      </main>
    </div>
  );
};

export default App;
