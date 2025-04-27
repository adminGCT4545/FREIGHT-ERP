import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api'; // Import the new api object

export default function FleetStatus() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFleetStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the new api.get method
        const fleetData = await api.get('/api/transport/fleet');
        setFleet(fleetData);
      } catch (err) {
        console.error('Failed to load fleet status:', err);
        setError(err.message || 'Failed to load fleet status. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFleetStatus();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'en route': return 'text-blue-600';
      case 'idle': return 'text-gray-600';
      case 'loading': return 'text-yellow-600';
      case 'maintenance': return 'text-red-600';
      default: return 'text-black';
    }
  };

  return (
    <div className="fleet-status overflow-x-auto">
      {loading && <div className="text-center p-4">Loading fleet status...</div>}
      {error && <div className="text-center p-4 text-red-600">Error: {error}</div>}
      {!loading && !error && fleet.length === 0 && (
        <div className="text-center p-4">No fleet data available.</div>
      )}
      {!loading && !error && fleet.length > 0 && (
        <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left">Vehicle ID</th>
            <th className="py-2 px-4 border-b text-left">Driver</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Location</th>
            <th className="py-2 px-4 border-b text-left">Maintenance Due</th>
          </tr>
        </thead>
        <tbody>
          {fleet.map((vehicle) => (
            <tr key={vehicle.id}>
              <td className="py-2 px-4 border-b">{vehicle.id}</td>
              <td className="py-2 px-4 border-b">{vehicle.driver}</td>
              <td className={`py-2 px-4 border-b font-semibold ${getStatusColor(vehicle.status)}`}>
                {vehicle.status}
              </td>
              {/* Displaying location - adjust if format is different (e.g., object with lat/lon) */}
              <td className="py-2 px-4 border-b">{typeof vehicle.location === 'object' ? `Lat: ${vehicle.location.lat}, Lon: ${vehicle.location.lon}` : vehicle.location}</td>
              <td className="py-2 px-4 border-b">{vehicle.maintenanceDue}</td>
            </tr>
          ))}
        </tbody>
        </table>
      )}
    </div>
  );
}