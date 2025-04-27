import React, { useState, useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext.js';

const RoleSelector = ({ onRoleChange }) => {
  const [auth] = useState(() => new AuthProvider());
  const [currentRole, setCurrentRole] = useState(auth.getCurrentRole() || 'operations');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const roles = [
    { id: 'executive', label: 'Executive View' },
    { id: 'operations', label: 'Operations View' }
  ];

  useEffect(() => {
    const unsubscribe = auth.subscribe(() => {
      setCurrentRole(auth.getCurrentRole() || 'operations');
    });

    return () => unsubscribe();
  }, [auth]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setCurrentRole(newRole);

    if (auth.isAuthenticated()) {
      auth.setState({ role: newRole });
      localStorage.setItem('erp_role', newRole);
    }

    onRoleChange(newRole);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginForm.username.trim()) {
      alert('Please enter a username');
      return;
    }

    try {
      const success = await auth.login(loginForm);
      
      if (success) {
        const newRole = auth.getCurrentRole();
        setCurrentRole(newRole);
        setShowLoginModal(false);
        onRoleChange(newRole);
      } else {
        alert('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentRole('operations');
    onRoleChange('operations');
  };

  const LoginModal = () => (
    <div className="login-modal">
      <div className="login-modal-content">
        <h3>Login to Dashboard</h3>
        <form onSubmit={handleLogin}>
          <div className="form-group mt-3">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              autoFocus
            />
            <small className="form-text text-muted">Use "exec" in username for Executive role</small>
          </div>
          <div className="form-group mt-3">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <small className="form-text text-muted">Any password will work for demo</small>
          </div>
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowLoginModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn bg-primary text-light">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="role-selector p-2 d-flex align-items-center">
      <select
        value={currentRole}
        onChange={handleRoleChange}
        className="p-2 me-2"
      >
        {roles.map(role => (
          <option key={role.id} value={role.id}>
            {role.label}
          </option>
        ))}
      </select>
      
      {auth.isAuthenticated() ? (
        <div className="user-info">
          <span className="user-name">
            {auth.getCurrentUser()?.username || 'Guest'}
          </span>
          <button 
            onClick={handleLogout}
            className="btn btn-sm btn-outline-light ms-2"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowLoginModal(true)}
          className="btn btn-sm btn-outline-light"
        >
          Login
        </button>
      )}

      {showLoginModal && <LoginModal />}
    </div>
  );
};

export default RoleSelector;
