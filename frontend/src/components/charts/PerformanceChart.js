// Performance Chart Component
import { ChartBase } from './ChartBase.js';

export class PerformanceChart extends ChartBase {
    constructor(containerId, options = {}) {
        super(containerId, {
            ...options,
            title: 'Performance Metrics',
            type: 'bar',
            yAxisLabel: 'Performance Score',
            xAxisLabel: 'Metric'
        });
    }

    generateDemoData() {
        // Generate realistic performance metrics data
        this.data = {
            labels: ['Efficiency', 'Quality', 'Timeliness', 'Cost', 'Customer Satisfaction'],
            datasets: [{
                label: 'Current Period',
                data: [85, 92, 78, 89, 94],
                backgroundColor: 'rgba(66, 133, 244, 0.7)',
                borderColor: 'rgba(66, 133, 244, 1)',
                borderWidth: 1,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }, {
                label: 'Previous Period',
                data: [82, 88, 75, 91, 90],
                backgroundColor: 'rgba(219, 68, 55, 0.7)',
                borderColor: 'rgba(219, 68, 55, 1)',
                borderWidth: 1,
                barPercentage: 0.7,
                categoryPercentage: 0.8
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
                type: 'bar',
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
                                text: this.options.xAxisLabel
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: this.options.yAxisLabel
                            },
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '/100';
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
            console.error('Error initializing performance chart:', error);
            this.error = `Failed to initialize chart: ${error.message}`;
            super.renderError();
        }
    }
}
