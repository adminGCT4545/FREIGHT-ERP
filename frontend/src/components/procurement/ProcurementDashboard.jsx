import React from 'react';
import OrderTrackingTable from './OrderTrackingTable';
import SupplierManagement from './SupplierManagement';
import PurchaseRequisition from './PurchaseRequisition'; // Import the new component
import InventoryLevelsChart from '../charts/InventoryLevelsChart';

export default function ProcurementDashboard() {
  return (
    <div className="procurement-dashboard p-4">
      <h2 className="text-2xl font-semibold mb-4">Procurement Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Order Tracking</h3>
          <OrderTrackingTable />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Supplier Management</h3>
          <SupplierManagement />
        </div>
        <div className="bg-white p-4 rounded shadow md:col-span-2">
          <h3 className="text-lg font-medium mb-2">Inventory Levels</h3>
          <InventoryLevelsChart />
        </div>
        {/* Add Purchase Requisition Component */}
        <div className="bg-white p-4 rounded shadow md:col-span-2">
           {/* Title moved inside PurchaseRequisition component */}
          <PurchaseRequisition />
        </div>
      </div>
    </div>
  );
}