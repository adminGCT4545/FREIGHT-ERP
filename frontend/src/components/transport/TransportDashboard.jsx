import React from 'react';
import RoutePlanner from './RoutePlanner';
import FleetStatus from './FleetStatus';
import DeliveryTrackingMap from './DeliveryTrackingMap';

export default function TransportDashboard() {
  return (
    <div className="transport-dashboard p-4">
      <h2 className="text-2xl font-semibold mb-4">Transport Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Delivery Tracking Map</h3>
          <DeliveryTrackingMap />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Route Planner</h3>
          <RoutePlanner />
        </div>
        <div className="lg:col-span-3 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Fleet Status</h3>
          <FleetStatus />
        </div>
      </div>
    </div>
  );
}