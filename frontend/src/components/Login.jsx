import React, { useState } from 'react';

// Assume authProvider is passed as a prop or accessed via context
export default function Login({ authProvider }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const success = await authProvider.login({ username, password });
      if (!success) {
        // The login method in AuthContext now throws on failure,
        // so this part might not be reached if it throws.
        // Kept for safety, but error handling primarily relies on the catch block.
        setError('Login failed. Please check your credentials.');
      }
      // On successful login, the AuthProvider state update should trigger
      // the parent component (App.jsx) to re-render and show the dashboard.
    } catch (err) {
      console.error('Login component error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center">Login to your account</h3>
        <form onSubmit={handleLogin}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="username">Username</label>
              <input
                type="text"
                placeholder="Username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 w-full"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
             {/* Optional: Add Register link */}
             {/* <div className="mt-6 text-grey-dark">
                 Don't have an account?
                 <a className="text-blue-600 hover:underline" href="#">
                     Register
                 </a>
             </div> */}
          </div>
        </form>
      </div>
    </div>
  );
}