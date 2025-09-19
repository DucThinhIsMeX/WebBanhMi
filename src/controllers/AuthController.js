import AuthService from '../services/AuthService.js';
import { UserError } from '../models/User.js';

export default class AuthController {
    constructor() {
        this.bindEvents();
        this.setupUI();
    }

    bindEvents() {
        const loginForm = document.querySelector('.login-card');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Reset form validation on input
        const inputs = document.querySelectorAll('.field input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const errorElement = input.parentElement.querySelector('.error-message');
                if (errorElement) {
                    errorElement.remove();
                }
            });
        });
    }

    setupUI() {
        if (AuthService.isLoggedIn()) {
            // If we're on the login page but already logged in, redirect to products
            if (window.location.pathname.includes('index.html')) {
                window.location.href = 'products.html';
            }
        } else {
            // If we're on a protected page and not logged in, redirect to login
            if (!window.location.pathname.includes('index.html')) {
                window.location.href = 'index.html';
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        // Clear previous errors
        this.clearErrors();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';

            await AuthService.login(username, password);
            
            // Animate transition
            document.querySelector('.login-wrap').style.opacity = '0';
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 300);

        } catch (error) {
            if (error instanceof UserError) {
                if (error.validationErrors?.length > 0) {
                    this.showValidationErrors(error.validationErrors);
                } else {
                    this.showError('Invalid username or password');
                }
            } else {
                this.showError('An unexpected error occurred. Please try again.');
            }

            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    logout() {
        AuthService.logout();
        window.location.href = 'index.html';
    }

    showValidationErrors(errors) {
        errors.forEach(error => {
            if (error.includes('Username')) {
                this.showFieldError('username', error);
            } else if (error.includes('Password')) {
                this.showFieldError('password', error);
            }
        });
    }

    showFieldError(fieldId, message) {
        const input = document.getElementById(fieldId);
        input.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        input.parentElement.appendChild(errorDiv);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;

        const form = document.querySelector('.login-card');
        form.insertBefore(errorDiv, form.firstChild);
    }

    clearErrors() {
        document.querySelectorAll('.error-message, .form-error').forEach(el => el.remove());
        document.querySelectorAll('.field input').forEach(input => input.classList.remove('error'));
    }
}