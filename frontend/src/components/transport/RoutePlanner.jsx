import React, { useState } from 'react';
import { api } from '../../utils/api'; // Import the new api object

export default function RoutePlanner() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [plannedRoute, setPlannedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlannedRoute(null); // Clear previous route

    try {
      // Use the new api.post method
      const responseData = await api.post('/api/transport/plan-route', { origin, destination });

      // The fetchApi function now directly returns the data on success
      setPlannedRoute(responseData);
    } catch (err) {
      console.error('Failed to plan route:', err);
      setError(err.message || 'Failed to plan route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-planner">
      <form onSubmit={handlePlanRoute} className="space-y-3">
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origin</label>
          <input
            type="text"
            id="origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter origin address"
            required
          />
        </div>
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter destination address"
            required
          />
        </div>
        <button type="submit" className="btn btn-secondary w-full" disabled={loading}>
          {loading ? 'Planning...' : 'Plan Route'}
        </button>
      </form>

      {error && <div className="mt-4 text-red-600 text-center">Error: {error}</div>}

      {plannedRoute && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h4 className="font-semibold">Planned Route:</h4>
          <p>Distance: {plannedRoute.distance}</p>
          <p>Duration: {plannedRoute.duration}</p>
          {plannedRoute.estimatedCost && <p>Est. Cost: ${plannedRoute.estimatedCost}</p>}
          {plannedRoute.waypoints && <p>Waypoints: {plannedRoute.waypoints.join(', ')}</p>}
        </div>
      )}
    </div>
  );
}