# Prerequisites Installation Guide

Before proceeding with the ERP Dashboard setup, ensure you have the following prerequisites installed:

## Required Software

1. **Node.js and npm**
   - Required version: >= 18.x
   - Download from: [https://nodejs.org/](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **PostgreSQL**
   - Required version: >= 15.x
   - Download from: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
   - Verify installation:
     ```bash
     psql --version
     ```

3. **Redis**
   - Required version: >= 7.x
   - Download from: [https://redis.io/download](https://redis.io/download)
   - Verify installation:
     ```bash
     redis-cli --version
     ```

## System Requirements

- Operating System: macOS, Linux, or Windows
- RAM: Minimum 8GB recommended
- Disk Space: At least 1GB free space
- CPU: Multi-core processor recommended for development

## Development Tools

1. **Visual Studio Code** (Recommended)
   - Download from: [https://code.visualstudio.com/](https://code.visualstudio.com/)
   
2. **Recommended VS Code Extensions**
   - ESLint
   - Prettier
   - PostgreSQL
   - Redis
   - React Developer Tools

## Post-Installation Steps

After installing the prerequisites:

1. **PostgreSQL Setup**
   ```bash
   # Create the database
   createdb erp_dashboard
   
   # Initialize schema
   psql erp_dashboard < database/schema.sql
   
   # Load sample data
   psql erp_dashboard < database/sample-data.sql
   ```

2. **Redis Setup**
   ```bash
   # Start Redis server
   redis-server
   
   # Verify Redis connection
   redis-cli ping
   ```

3. **Node.js Environment**
   ```bash
   # Install global dependencies
   npm install -g nodemon typescript ts-node
   ```

## Troubleshooting

### Common Issues

1. **Node.js/npm not found**
   - Ensure Node.js is properly installed
   - Add Node.js to your system PATH
   - Restart your terminal after installation

2. **PostgreSQL connection issues**
   - Verify PostgreSQL service is running
   - Check database credentials
   - Ensure database port (default: 5432) is not blocked

3. **Redis connection refused**
   - Verify Redis server is running
   - Check Redis port (default: 6379) is available
   - Ensure no firewall blocking Redis connection

For any other issues, please refer to the project's issue tracker or contact the development team.
