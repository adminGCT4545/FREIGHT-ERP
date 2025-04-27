// Main application entry point
import { Dashboard } from './components/Dashboard.js';
import { RoleSelector } from './components/RoleSelector.js';
import { AuthProvider } from './context/AuthContext.js';

class App {
    constructor() {
        this.auth = new AuthProvider();
        this.init();
    }

    async init() {
        try {
            // Initialize app once DOM is loaded
            document.addEventListener('DOMContentLoaded', () => {
                this.mountApp();
            });
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load application. Please try again.');
        }
    }

    mountApp() {
        const appContainer = document.getElementById('app');
        this.renderContent(appContainer);
    }

    renderContent(container) {
        // Remove loading screen
        const loadingScreen = container.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.remove();
        }

        // Create main app structure with improved header styling
        container.innerHTML = `
            <header class="dashboard-header">
                <div class="container d-flex justify-content-between align-items-center">
                    <h1 class="m-0">ERP Dashboard</h1>
                    <div id="role-selector"></div>
                </div>
            </header>
            <main class="container">
                <div id="dashboard-content"></div>
            </main>
        `;

        // Initialize components
        this.initializeComponents();
    }

    showError(message) {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
            <div class="error-container text-center p-5">
                <h2 class="text-danger">Error</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn bg-primary text-light p-2 m-3">
                    Retry
                </button>
            </div>
        `;
    }

    async initializeComponents() {
        // Initialize role selector with auth context
        const roleSelector = new RoleSelector({
            container: document.getElementById('role-selector'),
            onRoleChange: (role) => this.handleRoleChange(role)
        });

        // Initialize dashboard
        this.dashboard = new Dashboard({
            container: document.getElementById('dashboard-content')
        });

        // Get initial role from auth or default to operations
        const initialRole = this.auth.getCurrentRole() || 'operations';
        await this.handleRoleChange(initialRole);
        
        // Subscribe to auth changes 
        this.auth.subscribe((state) => {
            if (state.role !== this.dashboard.state.currentView) {
                this.handleRoleChange(state.role || 'operations');
            }
        });
    }

    async handleRoleChange(role) {
        console.log(`Switching to ${role} view`);
        
        // Update dashboard view based on selected role
        if (this.dashboard) {
            // Update the current view based on role
            this.dashboard.state.currentView = role;
            this.dashboard.render();
            
            // Initialize charts after rendering
            this.dashboard.initializeCharts();
        }
    }
}

// Initialize application
const app = new App();
export default app;
