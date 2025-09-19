import { User, UserError } from '../models/User.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.initFromStorage();
    }

    initFromStorage() {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const { username, email } = JSON.parse(userData);
                this.currentUser = new User(username, '', email);
                this.isAuthenticated = true;
            } catch (e) {
                console.error('Failed to load user data:', e);
                this.logout();
            }
        }
    }

    async login(username, password) {
        const user = new User(username, password);
        const errors = user.validate();

        if (errors.length > 0) {
            throw new UserError('Validation failed', errors);
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // For testing purposes, accept any non-empty credentials
        if (username && password) {
            this.currentUser = user;
            this.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(user.toJSON()));
            return { success: true, user: this.currentUser };
        }

        throw new UserError('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/index.html';
            return false;
        }
        return true;
    }
}

// Export singleton instance
export default new AuthService();