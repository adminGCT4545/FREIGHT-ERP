import React, { useCallback } from 'react';
import ChartBase from './ChartBase.jsx';
import { fetchApi } from '../../utils/api';

const RouteAnalysisChart = () => {
  const fetchRouteData = useCallback(async () => {
    try {
      const jsonData = await fetchApi('/metrics/routes');
      // Transform API data to chart format
      return {
        labels: jsonData.routes.map(route => route.name),
        datasets: [
          {
            label: 'Efficiency',
            data: jsonData.routes.map(route => route.efficiency),
            backgroundColor: 'rgba(66, 133, 244, 0.5)',
            borderColor: 'rgba(66, 133, 244, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(66, 133, 244, 1)',
            pointRadius: 3
          },
          {
            label: 'Utilization',
            data: jsonData.routes.map(route => route.utilization),
            backgroundColor: 'rgba(219, 68, 55, 0.5)',
            borderColor: 'rgba(219, 68, 55, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(219, 68, 55, 1)',
            pointRadius: 3
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching route analysis data:', error);
      throw new Error('Failed to fetch route analysis data');
    }
  }, []);

  // Chart configuration options
  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Route Analysis',
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
              label += context.parsed.y + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Percentage'
        },
        ticks: {
          stepSize: 20,
          callback: value => value + '%'
        }
      }
    }
  };

  return (
    <ChartBase
      type="bar"
      options={chartOptions}
      onDataLoad={fetchRouteData}
      height="400px"
    />
  );
};

export default RouteAnalysisChart;
