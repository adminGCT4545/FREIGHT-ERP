// Revenue Chart Component
import { ChartBase } from './ChartBase.js';

export class RevenueChart extends ChartBase {
    constructor(containerId, options = {}) {
        super(containerId, {
            ...options,
            title: 'Revenue Overview',
            type: 'line',
            yAxisLabel: 'Revenue ($)',
            xAxisLabel: 'Time Period'
        });
    }

    generateDemoData() {
        // Generate realistic revenue data
        this.data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Total Revenue',
                data: [150000, 160000, 155000, 170000, 175000, 180000],
                backgroundColor: 'rgba(66, 133, 244, 0.2)',
                borderColor: 'rgba(66, 133, 244, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Expedited Revenue',
                data: [70000, 75000, 72000, 80000, 82000, 85000],
                backgroundColor: 'rgba(52, 168, 83, 0.2)',
                borderColor: 'rgba(52, 168, 83, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
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
                type: 'line',
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
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0
                                        }).format(context.parsed.y);
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
                                text: this.options.xAxisLabel
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: this.options.yAxisLabel
                            },
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    animation: {
                        duration: this.options.animate ? 1000 : 0
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing revenue chart:', error);
            this.error = `Failed to initialize chart: ${error.message}`;
            this.renderError();
        }
    }

    renderError() {
        this.container.innerHTML = `<div class="error-message">${this.error}</div>`;
    }
}
