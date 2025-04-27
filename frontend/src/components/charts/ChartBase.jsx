import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const ChartBase = ({
  width = '100%',
  height = '300px',
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
  animate = true,
  theme = 'light',
  data = null,
  type = 'bar',
  options = {},
  onDataLoad
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(data);

  // Handle chart initialization and cleanup
  useEffect(() => {
    const initChart = () => {
      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart instance
      chartInstance.current = new Chart(ctx, {
        type,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: animate ? 1000 : 0
          },
          scales: {
            y: {
              beginAtZero: true
            }
          },
          ...options
        }
      });
    };

    if (chartData && !loading && !error) {
      initChart();
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, loading, error, type, animate, options]);

  // Handle window resize
  useEffect(() => {
    let resizeTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (chartInstance.current) {
          chartInstance.current.update();
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data if not provided and onDataLoad is available
  useEffect(() => {
    const loadData = async () => {
      if (!data && onDataLoad) {
        try {
          setLoading(true);
          setError(null);
          const newData = await onDataLoad();
          setChartData(newData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [data, onDataLoad]);

  // Update chart when new data is provided
  useEffect(() => {
    if (data) {
      setChartData(data);
      setLoading(false);
      setError(null);
    }
  }, [data]);

  // Helper function to get chart dimensions
  const getChartDimensions = () => ({
    width: chartRef.current?.parentElement.clientWidth - margin.left - margin.right,
    height: chartRef.current?.parentElement.clientHeight - margin.top - margin.bottom
  });

  if (loading) {
    return (
      <div className="chart-loading">
        <div className="spinner"></div>
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-error text-danger">
        <p>Error loading chart: {error}</p>
        <button
          className="retry-button btn bg-primary text-light p-2"
          onClick={() => setLoading(true)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartBase;
