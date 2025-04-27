const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3004;

// Sample Data
const performanceMetrics = {
  deliveryTime: {
    average: 45, // minutes
    trend: [38, 42, 45, 41, 43, 39],
    target: 40
  },
  successRate: {
    current: 95.2, // percentage
    trend: [94.1, 94.8, 95.2, 95.0, 95.2, 95.2],
    target: 96
  },
  vehicleUtilization: {
    current: 82, // percentage
    trend: [78, 80, 81, 82, 82, 83],
    target: 85
  },
  customerSatisfaction: {
    current: 4.2, // out of 5
    trend: [4.0, 4.1, 4.1, 4.2, 4.2, 4.2],
    target: 4.5
  }
};

const revenueData = {
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [128000, 135000, 142000, 148000, 152000, 158000]
  },
  quarterly: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    data: [405000, 458000, 482000, 512000]
  },
  yearToDate: {
    total: 1857000,
    growth: 12.5 // percentage
  }
};

const routeAnalysis = {
  routes: [
    {
      id: 'R001',
      name: 'Downtown Loop',
      efficiency: 87,
      utilization: 92,
      deliveries: 145,
      averageTime: 35
    },
    {
      id: 'R002',
      name: 'Suburban Route',
      efficiency: 82,
      utilization: 78,
      deliveries: 98,
      averageTime: 48
    },
    {
      id: 'R003',
      name: 'Industrial Zone',
      efficiency: 91,
      utilization: 95,
      deliveries: 167,
      averageTime: 42
    }
  ],
  summary: {
    totalRoutes: 3,
    averageEfficiency: 86.7,
    averageUtilization: 88.3
  }
};

// Custom error class
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
};

// Response validation middleware
const validateResponse = (data, type) => {
  if (!data) {
    throw new APIError(`No ${type} data available`, 404);
  }

  switch (type) {
    case 'performance':
      if (!data.deliveryTime || !data.successRate || !data.vehicleUtilization || !data.customerSatisfaction) {
        throw new APIError('Invalid performance metrics structure', 400);
      }
      break;
    case 'revenue':
      if (!data.monthly || !data.quarterly || !data.yearToDate) {
        throw new APIError('Invalid revenue data structure', 400);
      }
      break;
    case 'route':
      if (!data.routes || !Array.isArray(data.routes) || !data.summary) {
        throw new APIError('Invalid route analysis structure', 400);
      }
      break;
    default:
      throw new APIError('Invalid metrics type', 400);
  }
  return true;
};

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.get('/api/metrics/performance', (req, res, next) => {
  try {
    validateResponse(performanceMetrics, 'performance');
    res.status(200).json({
      success: true,
      data: performanceMetrics
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/metrics/revenue', (req, res, next) => {
  try {
    validateResponse(revenueData, 'revenue');
    res.status(200).json({
      success: true,
      data: revenueData
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/metrics/routes', (req, res, next) => {
  try {
    validateResponse(routeAnalysis, 'route');
    res.status(200).json({
      success: true,
      data: routeAnalysis
    });
  } catch (err) {
    next(err);
  }
});

// Handle all routes by serving the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Apply error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`ERP Dashboard server running at http://localhost:${PORT}`);
});