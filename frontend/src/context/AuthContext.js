// Authentication Context
export class AuthProvider {
    constructor() {
        this.state = {
            user: this.getStorageItem('erp_user', true) || null,
            role: this.getStorageItem('erp_role') || null,
            isAuthenticated: !!this.getStorageItem('auth_token'),
            token: this.getStorageItem('auth_token')
        };
        
        // Check for existing session
        if (this.state.token) {
            this.validateToken();
        }
    }
    
    // Helper method to safely get items from localStorage
    getStorageItem(key, isJson = false) {
        try {
            const value = localStorage.getItem(key);
            return isJson && value ? JSON.parse(value) : value;
        } catch (error) {
            console.error(`Error accessing localStorage for key ${key}:`, error);
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
            console.error(`Error setting localStorage for key ${key}:`, error);
            return false;
        }
    }
    
    // Helper method to safely remove items from localStorage
    removeStorageItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing localStorage for key ${key}:`, error);
            return false;
        }
    }

    async validateToken() {
        try {
            // Simulate token validation
            // In production, this would call the backend
            console.log('Validating token:', this.state.token);
            
            // For demo purposes, we'll assume the token is valid if it exists
            if (!this.state.user) {
                // Create dummy user data if we only have a token
                const dummyUser = { 
                    id: 'user123',
                    username: 'demo_user',
                    email: 'demo@example.com'
                };
                const role = 'operations';
                
                this.setState({ 
                    user: dummyUser, 
                    role: role, 
                    isAuthenticated: true 
                });
                
                // Store in localStorage
                this.setStorageItem('erp_user', dummyUser, true);
                this.setStorageItem('erp_role', role);
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            this.logout();
        }
    }

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
            // Simulate login API call
            console.log('Login attempt:', credentials);
            
            // For demo, always succeed with dummy data
            const dummyUser = { 
                id: 'user123',
                username: credentials.username || 'demo_user',
                email: credentials.email || 'demo@example.com'
            };
            const role = credentials.username?.includes('exec') ? 'executive' : 'operations';
            const token = 'demo_token_' + Math.random().toString(36).substring(2);
            
            // Store authentication data
            this.setStorageItem('auth_token', token);
            this.setStorageItem('erp_user', dummyUser, true);
            this.setStorageItem('erp_role', role);
            
            this.setState({
                user: dummyUser,
                role: role,
                isAuthenticated: true,
                token: token
            });
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    logout() {
        this.removeStorageItem('auth_token');
        this.removeStorageItem('erp_user');
        this.removeStorageItem('erp_role');
        
        this.setState({
            user: null,
            role: null,
            isAuthenticated: false,
            token: null
        });
    }

    // Role-based access control
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
        return this.state.role;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.state.isAuthenticated;
    }
}
