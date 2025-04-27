import React, { useState, useEffect, useCallback } from 'react';
import ChartBase from './ChartBase.jsx';
import { fetchApi } from '../../utils/api';

const PerformanceChart = () => {
  const fetchPerformanceData = useCallback(async () => {
    try {
      const jsonData = await fetchApi('/metrics/performance');
      // Transform API data to chart format
      return {
        labels: ['Delivery Time', 'Success Rate', 'Vehicle Utilization', 'Customer Satisfaction'],
        datasets: [
          {
            label: 'Current Values',
            data: [
              jsonData.deliveryTime.average,
              jsonData.successRate.current,
              jsonData.vehicleUtilization.current,
              jsonData.customerSatisfaction.current * 20 // Scale from 0-5 to 0-100
            ],
            backgroundColor: 'rgba(66, 133, 244, 0.7)',
            borderColor: 'rgba(66, 133, 244, 1)',
            borderWidth: 1,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          },
          {
            label: 'Target Values',
            data: [
              jsonData.deliveryTime.target,
              jsonData.successRate.target,
              jsonData.vehicleUtilization.target,
              jsonData.customerSatisfaction.target * 20 // Scale from 0-5 to 0-100
            ],
            backgroundColor: 'rgba(219, 68, 55, 0.7)',
            borderColor: 'rgba(219, 68, 55, 1)',
            borderWidth: 1,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching performance data:', error);
      throw new Error('Failed to fetch performance data');
    }
  }, []);

  // Chart configuration options
  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Performance Metrics',
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
              label += context.parsed.y + '/100';
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
          text: 'Metric'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Performance Score'
        },
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '/100'
        }
      }
    }
  };

  return (
    <ChartBase
      type="bar"
      options={chartOptions}
      onDataLoad={fetchPerformanceData}
      height="400px"
    />
  );
};

export default PerformanceChart;
