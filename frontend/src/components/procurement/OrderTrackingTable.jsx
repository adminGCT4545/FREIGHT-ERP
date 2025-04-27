import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api'; // Import the new api object

export default function OrderTrackingTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the new api.get method
        const ordersData = await api.get('/api/procurement/orders');
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError(err.message || 'Failed to load order data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center p-4">No orders found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left">Order ID</th>
            <th className="py-2 px-4 border-b text-left">Supplier</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">ETA</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="py-2 px-4 border-b">{order.id}</td>
              <td className="py-2 px-4 border-b">{order.supplier}</td>
              <td className="py-2 px-4 border-b">{order.status}</td>
              <td className="py-2 px-4 border-b">{order.eta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}