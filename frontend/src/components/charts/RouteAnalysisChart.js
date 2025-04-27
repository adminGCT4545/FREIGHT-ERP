// Route Analysis Chart Component
import { ChartBase } from './ChartBase.js';

export class RouteAnalysisChart extends ChartBase {
    constructor(containerId, options = {}) {
        super(containerId, {
            ...options,
            title: 'Route Analysis',
            type: 'radar',
            yAxisLabel: '',
            xAxisLabel: ''
        });
    }

    generateDemoData() {
        // Generate realistic route analysis data
        this.data = {
            labels: ['Distance', 'Fuel Efficiency', 'Time Efficiency', 'Load Capacity', 'Safety', 'Cost Efficiency'],
            datasets: [{
                label: 'Route A',
                data: [65, 75, 90, 81, 88, 72],
                backgroundColor: 'rgba(66, 133, 244, 0.5)',
                borderColor: 'rgba(66, 133, 244, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(66, 133, 244, 1)',
                pointRadius: 3
            }, {
                label: 'Route B',
                data: [80, 70, 75, 85, 80, 65],
                backgroundColor: 'rgba(219, 68, 55, 0.5)',
                borderColor: 'rgba(219, 68, 55, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(219, 68, 55, 1)',
                pointRadius: 3
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
                type: 'radar',
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
                                    // Fix for compatibility with different Chart.js versions
                                    const value = context.raw !== undefined ? 
                                        context.raw : 
                                        (context.dataset.data[context.dataIndex] || 0);
                                    label += value + '/100';
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        r: {
                            min: 0,
                            max: 100,
                            beginAtZero: true,
                            ticks: {
                                stepSize: 20,
                                showLabelBackdrop: false
                            },
                            pointLabels: {
                                font: {
                                    size: 12
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
            console.error('Error initializing route analysis chart:', error);
            this.error = `Failed to initialize chart: ${error.message}`;
            super.renderError();
        }
    }
}
