import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function PurchaseRequisition() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [itemId, setItemId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantity, setQuantity] = useState('');

  // Fetch existing requisitions
  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Placeholder: Replace with actual API endpoint when created
      const data = await api.get('/api/procurement/requisitions');
      setRequisitions(data || []); // Ensure data is an array
    } catch (err) {
      console.error('Failed to load requisitions:', err);
      setError(err.message || 'Failed to load requisitions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    // Basic validation
    if (!itemId || !supplierId || !quantity || quantity <= 0) {
      setFormError('Please fill in all fields with valid values.');
      setFormLoading(false);
      return;
    }

    const newRequisition = {
      item_id: parseInt(itemId, 10),
      supplier_id: parseInt(supplierId, 10),
      quantity: parseInt(quantity, 10),
      // requested_by will likely be set on the backend based on the authenticated user
    };

    try {
      // Placeholder: Replace with actual API endpoint when created
      const createdRequisition = await api.post('/api/procurement/requisitions', newRequisition);
      // Add the new requisition to the list optimistically or refetch
      setRequisitions(prev => [...prev, createdRequisition]);
      // Clear form
      setItemId('');
      setSupplierId('');
      setQuantity('');
    } catch (err) {
      console.error('Failed to create requisition:', err);
      setFormError(err.message || 'Failed to create requisition. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="purchase-requisition p-4 bg-white rounded shadow mt-4">
      <h3 className="text-xl font-semibold mb-4">Purchase Requisitions</h3>

      {/* Requisition Creation Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
        <h4 className="text-lg font-medium mb-3">Create New Requisition</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="itemId" className="block text-sm font-medium text-gray-700">Item ID</label>
            <input
              type="number"
              id="itemId"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter Item ID"
              required
            />
          </div>
          <div>
            <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">Supplier ID</label>
            <input
              type="number"
              id="supplierId"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter Supplier ID"
              required
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter Quantity"
              required
            />
          </div>
        </div>
        {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
        <div className="mt-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={formLoading}
          >
            {formLoading ? 'Submitting...' : 'Submit Requisition'}
          </button>
        </div>
      </form>

      {/* Requisition List */}
      <h4 className="text-lg font-medium mb-3">Existing Requisitions</h4>
      {loading && <div className="text-center p-4">Loading requisitions...</div>}
      {error && <div className="text-center p-4 text-red-600">Error: {error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Req ID</th>
                <th className="py-2 px-4 border-b text-left">Item ID</th>
                <th className="py-2 px-4 border-b text-left">Supplier ID</th>
                <th className="py-2 px-4 border-b text-left">Quantity</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Requested By</th>
                <th className="py-2 px-4 border-b text-left">Request Date</th>
                {/* Add more columns as needed, e.g., Approval Date */}
              </tr>
            </thead>
            <tbody>
              {requisitions.length > 0 ? (
                requisitions.map((req) => (
                  <tr key={req.pr_id}>
                    <td className="py-2 px-4 border-b">{req.pr_id}</td>
                    <td className="py-2 px-4 border-b">{req.item_id}</td>
                    <td className="py-2 px-4 border-b">{req.supplier_id}</td>
                    <td className="py-2 px-4 border-b">{req.quantity}</td>
                    <td className="py-2 px-4 border-b">{req.status}</td>
                    <td className="py-2 px-4 border-b">{req.requested_by}</td> {/* Consider showing username instead */}
                    <td className="py-2 px-4 border-b">{new Date(req.request_date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 px-4 text-center text-gray-500">No requisitions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}