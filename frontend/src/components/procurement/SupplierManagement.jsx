import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api'; // Import the new api object

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the new api.get method
        const suppliersData = await api.get('/api/procurement/suppliers');
        setSuppliers(suppliersData);
      } catch (err) {
        console.error('Failed to load suppliers:', err);
        setError(err.message || 'Failed to load supplier data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading suppliers...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  }

  if (suppliers.length === 0) {
    return <div className="text-center p-4">No suppliers found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left">Supplier ID</th>
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Contact</th>
            <th className="py-2 px-4 border-b text-left">Performance</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td className="py-2 px-4 border-b">{supplier.id}</td>
              <td className="py-2 px-4 border-b">{supplier.name}</td>
              <td className="py-2 px-4 border-b">{supplier.contact}</td>
              <td className="py-2 px-4 border-b">{supplier.performance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}