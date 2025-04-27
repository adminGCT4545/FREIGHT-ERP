import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api'; // Import the new api object
// import { Bar } from 'react-chartjs-2'; // Example chart library
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // Example chart library setup

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // Example chart library registration

export default function InventoryLevelsChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInventoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the new api.get method
        const inventoryData = await api.get('/api/procurement/inventory');
        // Basic validation for chart data structure
        if (inventoryData && inventoryData.labels && inventoryData.datasets) {
           setChartData(inventoryData);
        } else {
           throw new Error('Invalid chart data structure received');
        }
      } catch (err) {
        console.error('Failed to load inventory data:', err);
        setError(err.message || 'Failed to load inventory data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInventoryData();
  }, []);


  // Chart options (can be kept static or fetched if needed)
   const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Current Inventory Levels',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="chart-container p-4 bg-white rounded shadow">
      <h3 className="text-lg font-medium mb-2">Inventory Levels</h3>
      {loading && <div className="text-center p-4">Loading chart data...</div>}
      {error && <div className="text-center p-4 text-red-600">Error: {error}</div>}
      {!loading && !error && chartData && (
        <>
          {/* Actual chart rendering would go here, e.g., <Bar options={options} data={chartData} /> */}
          <p>Inventory levels chart placeholder... (Requires chart library setup)</p>
          <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(chartData, null, 2)}
          </pre>
        </>
      )}
      {!loading && !error && !chartData && (
         <div className="text-center p-4">No inventory data available.</div>
      )}
    </div>
  );
}