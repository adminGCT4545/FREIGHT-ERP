// Role Selector Component
import { AuthProvider } from '../context/AuthContext.js';

export class RoleSelector {
    constructor({ container, onRoleChange }) {
        this.container = container;
        this.onRoleChange = onRoleChange;
        this.auth = new AuthProvider();
        
        this.roles = [
            { id: 'executive', label: 'Executive View' },
            { id: 'operations', label: 'Operations View' }
        ];
        
        this.currentRole = this.auth.getCurrentRole() || 'operations';
        
        // Subscribe to auth changes
        this.auth.subscribe(() => {
            this.currentRole = this.auth.getCurrentRole() || 'operations';
            this.render();
        });
        
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="role-selector p-2 d-flex align-items-center">
                <select id="role-select" class="p-2 me-2">
                    ${this.roles.map(role => `
                        <option value="${role.id}" 
                            ${this.currentRole === role.id ? 'selected' : ''}>
                            ${role.label}
                        </option>
                    `).join('')}
                </select>
                ${this.auth.isAuthenticated() ? `
                    <div class="user-info">
                        <span class="user-name">${this.getUserDisplayName()}</span>
                        <button id="logout-btn" class="btn btn-sm btn-outline-light ms-2">Logout</button>
                    </div>
                ` : `
                    <button id="login-btn" class="btn btn-sm btn-outline-light">Login</button>
                `}
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    getUserDisplayName() {
        const user = this.auth.getCurrentUser();
        return user ? user.username : 'Guest';
    }

    attachEventListeners() {
        const select = this.container.querySelector('#role-select');
        select.addEventListener('change', (e) => {
            this.currentRole = e.target.value;
            
            // Update auth state with new role
            if (this.auth.isAuthenticated()) {
                this.auth.setState({ role: this.currentRole });
                localStorage.setItem('erp_role', this.currentRole);
            }
            
            this.onRoleChange(this.currentRole);
        });
        
        // Add login button handler
        const loginBtn = this.container.querySelector('#login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        // Add logout button handler
        const logoutBtn = this.container.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }
    
    showLoginModal() {
        // Create a simple modal for login
        const modal = document.createElement('div');
        modal.className = 'login-modal';
        modal.innerHTML = `
            <div class="login-modal-content">
                <h3>Login to Dashboard</h3>
                <div class="form-group mt-3">
                    <label for="username">Username</label>
                    <input type="text" id="username" class="form-control" placeholder="Username">
                    <small class="form-text text-muted">Use "exec" in username for Executive role</small>
                </div>
                <div class="form-group mt-3">
                    <label for="password">Password</label>
                    <input type="password" id="password" class="form-control" placeholder="Password">
                    <small class="form-text text-muted">Any password will work for demo</small>
                </div>
                <div class="d-flex justify-content-between mt-4">
                    <button id="cancel-login" class="btn btn-secondary">Cancel</button>
                    <button id="submit-login" class="btn bg-primary text-light">Login</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Focus on username input for better UX
        setTimeout(() => {
            const usernameInput = document.getElementById('username');
            if (usernameInput) usernameInput.focus();
        }, 100);
        
        // Create reusable function for modal removal
        const removeModal = () => {
            try {
                if (modal && document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            } catch (error) {
                console.error('Error removing login modal:', error);
            }
        };
        
        // Handle Enter key in password field
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('submit-login')?.click();
                }
            });
        }
        
        // Add modal event listeners
        const cancelButton = document.getElementById('cancel-login');
        if (cancelButton) {
            cancelButton.addEventListener('click', removeModal);
        }
        
        const submitButton = document.getElementById('submit-login');
        if (submitButton) {
            submitButton.addEventListener('click', async () => {
                const username = document.getElementById('username')?.value || '';
                const password = document.getElementById('password')?.value || '';
                
                if (!username.trim()) {
                    alert('Please enter a username');
                    return;
                }
                
                // Try to login
                try {
                    const success = await this.auth.login({ username, password });
                    
                    if (success) {
                        // Update role selector with new role
                        this.currentRole = this.auth.getCurrentRole();
                        
                        // Remove modal
                        removeModal();
                        
                        // Trigger role change
                        this.onRoleChange(this.currentRole);
                    } else {
                        alert('Login failed. Please try again.');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    alert('An error occurred during login. Please try again.');
                }
            });
        }
    }
    
    handleLogout() {
        this.auth.logout();
        this.currentRole = 'operations';
        this.onRoleChange(this.currentRole);
    }
}
