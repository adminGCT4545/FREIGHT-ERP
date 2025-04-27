import React, { useState, useEffect } from 'react';
import RevenueChart from './charts/RevenueChart.jsx';
import PerformanceChart from './charts/PerformanceChart.jsx';
import RouteAnalysisChart from './charts/RouteAnalysisChart.jsx';
import { fetchApi } from '../utils/api';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('operations');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Sample data for delivery statistics
  const deliveryStats = {
    onTime: 85,
    delayed: 12,
    failed: 3
  };

  // Sample data for active deliveries
  const activeDeliveries = [
    { id: 'DEL1001', destination: 'New York', status: 'In Transit', eta: '2h 15m' },
    { id: 'DEL1002', destination: 'Boston', status: 'Loading', eta: '3h 30m' },
    { id: 'DEL1003', destination: 'Chicago', status: 'In Transit', eta: '1h 45m' }
  ];

  // Sample data for truck status
  const trucks = [
    { id: 'T001', status: 'Active', load: '85%', location: 'Route 95' },
    { id: 'T002', status: 'Loading', load: '30%', location: 'Warehouse A' },
    { id: 'T003', status: 'Maintenance', load: '0%', location: 'Depot' },
    { id: 'T004', status: 'Active', load: '92%', location: 'Route 87' }
  ];

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Implement actual API call to fetch dashboard data
        const dashboardData = await fetchApi('/metrics/performance');
        setData(dashboardData);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to toggle between views
  const toggleView = () => {
    setCurrentView(currentView === 'executive' ? 'operations' : 'executive');
  };

  const DeliveryStats = () => (
    <div className="delivery-stats">
      <div className="stat-card">
        <div className="stat-value text-success">{deliveryStats.onTime}%</div>
        <div className="stat-label">On Time</div>
      </div>
      <div className="stat-card">
        <div className="stat-value text-warning">{deliveryStats.delayed}%</div>
        <div className="stat-label">Delayed</div>
      </div>
      <div className="stat-card">
        <div className="stat-value text-danger">{deliveryStats.failed}%</div>
        <div className="stat-label">Failed</div>
      </div>
    </div>
  );

  const ActiveDeliveriesTable = () => (
    <table className="delivery-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Destination</th>
          <th>Status</th>
          <th>ETA</th>
        </tr>
      </thead>
      <tbody>
        {activeDeliveries.map(delivery => (
          <tr key={delivery.id}>
            <td>{delivery.id}</td>
            <td>{delivery.destination}</td>
            <td>{delivery.status}</td>
            <td>{delivery.eta}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const TruckStatus = () => (
    <div className="truck-status-grid">
      {trucks.map(truck => (
        <div key={truck.id} className={`truck-card ${truck.status.toLowerCase()}`}>
          <div className="truck-id">{truck.id}</div>
          <div className="truck-info">
            <div className="truck-status">{truck.status}</div>
            <div className="truck-load">{truck.load}</div>
            <div className="truck-location">{truck.location}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const ExecutiveView = () => (
    <div className="grid">
      <div className="dashboard-card">
        <h3>Revenue Overview</h3>
        <div className="chart-container">
          <RevenueChart />
        </div>
      </div>
      <div className="dashboard-card">
        <h3>Performance Metrics</h3>
        <div className="chart-container">
          <PerformanceChart />
        </div>
      </div>
      <div className="dashboard-card">
        <h3>Delivery Statistics</h3>
        <div className="chart-container">
          <DeliveryStats />
        </div>
      </div>
    </div>
  );

  const OperationsView = () => (
    <div className="grid">
      <div className="dashboard-card">
        <h3>Active Deliveries</h3>
        <div className="chart-container">
          <ActiveDeliveriesTable />
        </div>
      </div>
      <div className="dashboard-card">
        <h3>Route Analysis</h3>
        <div className="chart-container">
          <RouteAnalysisChart />
        </div>
      </div>
      <div className="dashboard-card">
        <h3>Truck Status</h3>
        <div className="chart-container">
          <TruckStatus />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container text-center p-3">
        <h3 className="text-danger">Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => setLoading(true)} 
          className="btn bg-primary text-light p-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="view-toggle">
        <button 
          onClick={toggleView} 
          className="btn btn-outline-primary"
        >
          Switch to {currentView === 'executive' ? 'Operations' : 'Executive'} View
        </button>
      </div>
      {currentView === 'executive' ? <ExecutiveView /> : <OperationsView />}
    </div>
  );
};

export default Dashboard;
