// Dashboard Component
import { RevenueChart } from './charts/RevenueChart.js';
import { PerformanceChart } from './charts/PerformanceChart.js';
import { RouteAnalysisChart } from './charts/RouteAnalysisChart.js';
import { fetchApi } from '../utils/api.js';

export class Dashboard {
    constructor({ container }) {
        this.container = container;
        this.state = {
            currentView: 'operations',
            loading: true,
            error: null,
            data: null
        };

        // Sample data for delivery statistics
        this.deliveryStats = {
            onTime: 85,
            delayed: 12,
            failed: 3
        };

        // Sample data for active deliveries
        this.activeDeliveries = [
            { id: 'DEL1001', destination: 'New York', status: 'In Transit', eta: '2h 15m' },
            { id: 'DEL1002', destination: 'Boston', status: 'Loading', eta: '3h 30m' },
            { id: 'DEL1003', destination: 'Chicago', status: 'In Transit', eta: '1h 45m' }
        ];

        // Sample data for truck status
        this.trucks = [
            { id: 'T001', status: 'Active', load: '85%', location: 'Route 95' },
            { id: 'T002', status: 'Loading', load: '30%', location: 'Warehouse A' },
            { id: 'T003', status: 'Maintenance', load: '0%', location: 'Depot' },
            { id: 'T004', status: 'Active', load: '92%', location: 'Route 87' }
        ];

        // Load initial data
        this.loadData();
    }

    async loadData() {
        try {
            this.state.loading = true;
            this.state.error = null;
            this.render();
            
            // Try to fetch data from API, fallback to sample data
            try {
                const dashboardData = await fetchApi('/metrics/performance');
                this.state.data = dashboardData;
            } catch (error) {
                console.warn('Using sample data instead of API data:', error);
                // Use sample data as fallback
                this.state.data = {
                    revenue: [
                        { month: 'Jan', value: 45000 },
                        { month: 'Feb', value: 52000 },
                        { month: 'Mar', value: 49000 },
                        { month: 'Apr', value: 58000 },
                        { month: 'May', value: 63000 },
                        { month: 'Jun', value: 59000 }
                    ],
                    performance: [
                        { metric: 'Deliveries', value: 92 },
                        { metric: 'On-Time', value: 85 },
                        { metric: 'Efficiency', value: 78 },
                        { metric: 'Customer Satisfaction', value: 88 }
                    ],
                    routes: [
                        { route: 'NYC-BOS', efficiency: 82, volume: 120 },
                        { route: 'NYC-DC', efficiency: 76, volume: 95 },
                        { route: 'BOS-CHI', efficiency: 71, volume: 85 },
                        { route: 'DC-MIA', efficiency: 65, volume: 70 }
                    ]
                };
            }
            
            this.state.loading = false;
            this.render();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.state.error = 'Failed to load dashboard data. Please try again.';
            this.state.loading = false;
            this.render();
        }
    }

    render() {
        if (this.state.loading) {
            this.container.innerHTML = `
                <div class="loading-screen">
                    <div class="spinner"></div>
                    <p>Loading dashboard data...</p>
                </div>
            `;
            return;
        }

        if (this.state.error) {
            this.container.innerHTML = `
                <div class="error-container text-center p-3">
                    <h3 class="text-danger">Error</h3>
                    <p>${this.state.error}</p>
                    <button 
                        id="retry-btn" 
                        class="btn bg-primary text-light p-2"
                    >
                        Retry
                    </button>
                </div>
            `;
            
            // Add retry button handler
            const retryBtn = this.container.querySelector('#retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.loadData());
            }
            
            return;
        }

        // Render dashboard based on current view
        this.container.innerHTML = `
            <div class="dashboard">
                <div class="view-toggle">
                    <button 
                        id="toggle-view-btn" 
                        class="btn btn-outline-primary"
                    >
                        Switch to ${this.state.currentView === 'executive' ? 'Operations' : 'Executive'} View
                    </button>
                </div>
                <div id="dashboard-view"></div>
            </div>
        `;

        // Add view toggle handler
        const toggleBtn = this.container.querySelector('#toggle-view-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleView());
        }

        // Render the appropriate view
        const viewContainer = this.container.querySelector('#dashboard-view');
        if (this.state.currentView === 'executive') {
            this.renderExecutiveView(viewContainer);
        } else {
            this.renderOperationsView(viewContainer);
        }
    }

    toggleView() {
        this.state.currentView = this.state.currentView === 'executive' ? 'operations' : 'executive';
        this.render();
        this.initializeCharts();
    }

    renderExecutiveView(container) {
        container.innerHTML = `
            <div class="grid">
                <div class="dashboard-card">
                    <h3>Revenue Overview</h3>
                    <div class="chart-container" id="revenue-chart"></div>
                </div>
                <div class="dashboard-card">
                    <h3>Performance Metrics</h3>
                    <div class="chart-container" id="performance-chart"></div>
                </div>
                <div class="dashboard-card">
                    <h3>Delivery Statistics</h3>
                    <div class="chart-container">
                        ${this.renderDeliveryStats()}
                    </div>
                </div>
            </div>
        `;
    }

    renderOperationsView(container) {
        container.innerHTML = `
            <div class="grid">
                <div class="dashboard-card">
                    <h3>Active Deliveries</h3>
                    <div class="chart-container">
                        ${this.renderActiveDeliveriesTable()}
                    </div>
                </div>
                <div class="dashboard-card">
                    <h3>Route Analysis</h3>
                    <div class="chart-container" id="route-chart"></div>
                </div>
                <div class="dashboard-card">
                    <h3>Truck Status</h3>
                    <div class="chart-container">
                        ${this.renderTruckStatus()}
                    </div>
                </div>
            </div>
        `;
    }

    renderDeliveryStats() {
        return `
            <div class="delivery-stats">
                <div class="stat-card">
                    <div class="stat-value text-success">${this.deliveryStats.onTime}%</div>
                    <div class="stat-label">On Time</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value text-warning">${this.deliveryStats.delayed}%</div>
                    <div class="stat-label">Delayed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value text-danger">${this.deliveryStats.failed}%</div>
                    <div class="stat-label">Failed</div>
                </div>
            </div>
        `;
    }

    renderActiveDeliveriesTable() {
        return `
            <table class="delivery-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Destination</th>
                        <th>Status</th>
                        <th>ETA</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.activeDeliveries.map(delivery => `
                        <tr>
                            <td>${delivery.id}</td>
                            <td>${delivery.destination}</td>
                            <td>${delivery.status}</td>
                            <td>${delivery.eta}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderTruckStatus() {
        return `
            <div class="truck-status-grid">
                ${this.trucks.map(truck => `
                    <div class="truck-card ${truck.status.toLowerCase()}">
                        <div class="truck-id">${truck.id}</div>
                        <div class="truck-info">
                            <div class="truck-status">${truck.status}</div>
                            <div class="truck-load">${truck.load}</div>
                            <div class="truck-location">${truck.location}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    initializeCharts() {
        if (!this.state.data) return;

        try {
            if (this.state.currentView === 'executive') {
                // Initialize executive view charts
                const revenueChartEl = document.getElementById('revenue-chart');
                if (revenueChartEl) {
                    new RevenueChart(revenueChartEl, {
                        animate: true,
                        data: this.state.data.revenue || []
                    });
                }

                const performanceChartEl = document.getElementById('performance-chart');
                if (performanceChartEl) {
                    new PerformanceChart(performanceChartEl, {
                        animate: true,
                        data: this.state.data.performance || []
                    });
                }
            } else {
                // Initialize operations view charts
                const routeChartEl = document.getElementById('route-chart');
                if (routeChartEl) {
                    new RouteAnalysisChart(routeChartEl, {
                        animate: true,
                        data: this.state.data.routes || []
                    });
                }
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }
}
