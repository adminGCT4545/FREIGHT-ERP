import React, { useCallback } from 'react';
import ChartBase from './ChartBase.jsx';
import { fetchApi } from '../../utils/api';

const RevenueChart = () => {
  const fetchRevenueData = useCallback(async () => {
    try {
      const jsonData = await fetchApi('/metrics/revenue');
      // Transform API data to chart format
      return {
        labels: jsonData.monthly.labels,
        datasets: [
          {
            label: 'Monthly Revenue',
            data: jsonData.monthly.data,
            backgroundColor: 'rgba(66, 133, 244, 0.2)',
            borderColor: 'rgba(66, 133, 244, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'YTD Growth',
            data: jsonData.monthly.data.map((val, idx) =>
              val * (1 + jsonData.yearToDate.growth / 100)
            ),
            backgroundColor: 'rgba(52, 168, 83, 0.2)',
            borderColor: 'rgba(52, 168, 83, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw new Error('Failed to fetch revenue data');
    }
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Chart configuration options
  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Revenue Overview',
        font: {
          size: 16
        }
      },
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Period'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  };

  return (
    <ChartBase
      type="line"
      options={chartOptions}
      onDataLoad={fetchRevenueData}
      height="400px"
    />
  );
};

export default RevenueChart;
