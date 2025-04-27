# ERP Dashboard

A comprehensive ERP dashboard system for freight delivery management and analytics.

## Project Structure

```
erp-dashboard/
├── frontend/         # Browser-based frontend application
│   ├── index.html    # Main HTML entry point
│   ├── src/          # JavaScript source code
│   └── styles/       # CSS stylesheets
├── backend/         # Node.js API server (placeholder)
└── database/        # PostgreSQL schema and scripts
    ├── schema.sql   # Database schema definition
    └── sample-data.sql  # Sample data generation
```

## Technology Stack

- **Frontend**: JavaScript with Chart.js for visualization
- **Backend**: Node.js with Express (planned)
- **Database**: PostgreSQL (schema defined)

## Features

- Role-based dashboards (Executive, Operations)
- Interactive data visualization
- Simulated delivery tracking
- Performance analytics
- Route analysis
- Authentication system with role-based access

## Current Implementation Status

The frontend portion of the application is fully functional with simulated data. The backend and database integration will be implemented in future phases.

## Running the Application

### Frontend (Current Release)

The frontend can be run directly in a browser without any build steps:

1. Open the `frontend/index.html` file in a modern browser
2. Login using the following details:
   - For Operations role: any username without "exec" in it
   - For Executive role: any username containing "exec" (e.g., "executive")
   - Any password will work in this demo

### Testing the Roles

1. Operations View: Shows active deliveries, route analysis, and truck status
2. Executive View: Shows revenue charts, performance metrics, and delivery statistics

All charts and data visualizations are currently using simulated data that's generated on the client side.

## Future Implementation Roadmap

1. **Phase 1: Backend API Development** (Q2 2025)
   - Implement Express.js backend
   - Create API endpoints for dashboard data
   - Authentication system with JWT

2. **Phase 2: Database Integration** (Q3 2025)
   - Connect to PostgreSQL database
   - Real data implementation
   - Performance optimization

3. **Phase 3: Advanced Features** (Q4 2025)
   - Real-time updates
   - Advanced analytics
   - Route optimization
   - Performance monitoring

## Security

- Role-based access control implemented
- Authentication system with user persistence
- Simulated JWT token implementation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
