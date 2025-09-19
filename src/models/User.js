export class User {
    constructor(username, password, email = '') {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    validate() {
        const errors = [];
        
        if (!this.username || this.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        
        if (!this.password || this.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        if (this.email && !this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push('Invalid email format');
        }

        return errors;
    }

    toJSON() {
        return {
            username: this.username,
            email: this.email
        };
    }
}

export class UserError extends Error {
    constructor(message, validationErrors = []) {
        super(message);
        this.name = 'UserError';
        this.validationErrors = validationErrors;
    }
}