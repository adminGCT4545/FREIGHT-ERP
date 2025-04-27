// Chart Base Component
import Chart from 'chart.js/auto';

export class ChartBase {
    constructor(containerId, options = {}) {
        this.container = typeof containerId === 'string' 
            ? document.getElementById(containerId) 
            : containerId;
            
        this.options = {
            title: 'Chart',
            type: 'bar',
            yAxisLabel: 'Value',
            xAxisLabel: 'Category',
            animate: true,
            ...options
        };
        
        this.chart = null;
        this.data = null;
        this.error = null;
        
        // Generate demo data if no data provided
        if (!this.options.data) {
            this.generateDemoData();
        } else {
            this.data = this.options.data;
        }
        
        // Render chart
        this.renderChart();
    }
    
    generateDemoData() {
        // Override in child classes
        this.data = {
            labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
            datasets: [{
                label: 'Sample Data',
                data: [12, 19, 3, 5, 2],
                backgroundColor: 'rgba(66, 133, 244, 0.5)',
                borderColor: 'rgba(66, 133, 244, 1)',
                borderWidth: 1
            }]
        };
    }
    
    renderChart() {
        if (!this.data) return;
        
        try {
            // Create a canvas element for Chart.js
            this.container.innerHTML = '<canvas width="100%" height="100%"></canvas>';
            const canvas = this.container.querySelector('canvas');
            
            if (!canvas || !canvas.getContext) {
                throw new Error('Canvas element or context not available');
            }
            
            // Create Chart.js instance
            this.chart = new Chart(canvas, {
                type: this.options.type,
                data: this.data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: this.options.title,
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: this.options.xAxisLabel
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: this.options.yAxisLabel
                            },
                            beginAtZero: true
                        }
                    },
                    animation: {
                        duration: this.options.animate ? 1000 : 0
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing chart:', error);
            this.error = `Failed to initialize chart: ${error.message}`;
            this.renderError();
        }
    }
    
    renderError() {
        this.container.innerHTML = `
            <div class="error-message">
                <p class="text-danger">${this.error}</p>
                <button 
                    class="retry-button btn bg-primary text-light p-2"
                    onclick="this.renderChart()"
                >
                    Retry
                </button>
            </div>
        `;
    }
    
    renderLoading() {
        this.container.innerHTML = `
            <div class="chart-loading">
                <div class="spinner"></div>
                <p>Loading chart data...</p>
            </div>
        `;
    }
    
    update(newData) {
        if (newData) {
            this.data = newData;
        }
        
        if (this.chart) {
            this.chart.data = this.data;
            this.chart.update();
        } else {
            this.renderChart();
        }
    }
    
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}
