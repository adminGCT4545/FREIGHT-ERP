import { api } from '../utils/api'; // Import the API utility

// Authentication Context
export class AuthProvider {
    constructor() {
        // Use consistent keys for storage
        const token = this.getStorageItem('authToken');
        const user = this.getStorageItem('erpUser', true);

        this.state = {
            user: user || null,
            role: user ? user.role : null, // Get role from user object if available
            isAuthenticated: !!token,
            token: token || null
        };

        // Optional: Add a check here to verify token validity with backend if needed on load
        // if (this.state.token) { this.verifyTokenWithBackend(); }
    }

    // Helper method to safely get items from localStorage
    getStorageItem(key, isJson = false) {
        try {
            const value = localStorage.getItem(key);
            return isJson && value ? JSON.parse(value) : value;
        } catch (error) {
            console.error(`Error accessing localStorage for key "${key}":`, error);
            return null;
        }
    }

    // Helper method to safely set items in localStorage
    setStorageItem(key, value, isJson = false) {
        try {
            const storageValue = isJson ? JSON.stringify(value) : value;
            localStorage.setItem(key, storageValue);
            return true;
        } catch (error) {
            console.error(`Error setting localStorage for key "${key}":`, error);
            return false;
        }
    }

    // Helper method to safely remove items from localStorage
    removeStorageItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing localStorage for key "${key}":`, error);
            return false;
        }
    }

    // Removed validateToken simulation - rely on login/logout and token presence

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }

    // Observable pattern for state updates
    listeners = new Set();

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    async login(credentials) {
        try {
            console.log('Login attempt with:', credentials.username);
            // Call the actual login API endpoint
            const responseData = await api.post('/api/auth/login', credentials);

            if (responseData && responseData.token && responseData.user) {
                const { token, user } = responseData;

                // Store authentication data
                this.setStorageItem('authToken', token);
                this.setStorageItem('erpUser', user, true); // Store user object

                this.setState({
                    user: user,
                    role: user.role, // Get role from user object
                    isAuthenticated: true,
                    token: token
                });
                console.log('Login successful for user:', user.username);
                return true; // Indicate success
            } else {
                throw new Error('Login failed: Invalid response from server.');
            }
        } catch (error) {
            console.error('Login failed:', error.message || error);
            // Optionally re-throw or handle specific error messages
            throw error; // Re-throw the error to be caught by the calling component
        }
    }

    logout() {
        console.log('Logging out user:', this.state.user?.username);
        this.removeStorageItem('authToken');
        this.removeStorageItem('erpUser');
        // No need to remove erp_role separately if it's part of erpUser

        this.setState({
            user: null,
            role: null,
            isAuthenticated: false,
            token: null
        });
        // Optionally notify backend about logout if needed
    }

    // Role-based access control (RBAC)
    hasPermission(requiredRole) {
        if (!this.state.isAuthenticated) return false;
        if (this.state.role === 'admin') return true;
        return this.state.role === requiredRole;
    }

    // Get current user info
    getCurrentUser() {
        return this.state.user;
    }

    // Get current role
    getCurrentRole() {
        return this.state.user?.role; // Safely access role from user object
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.state.isAuthenticated;
    }
}
