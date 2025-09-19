export class Product {
    constructor(id, name, description, price, image, category = 'general') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.image = image;
        this.category = category;
    }

    validate() {
        const errors = [];

        if (!this.name || this.name.length < 2) {
            errors.push('Product name must be at least 2 characters long');
        }

        if (!this.description) {
            errors.push('Product description is required');
        }

        if (!this.price || this.price <= 0) {
            errors.push('Product price must be greater than 0');
        }

        if (!this.image) {
            errors.push('Product image is required');
        }

        return errors;
    }

    formatPrice() {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(this.price);
    }

    static fromJSON(json) {
        return new Product(
            json.id,
            json.name,
            json.description,
            json.price,
            json.image,
            json.category
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            image: this.image,
            category: this.category
        };
    }
}

export class CartItem {
    constructor(product, quantity = 1) {
        this.product = product;
        this.quantity = quantity;
    }

    getTotal() {
        return this.product.price * this.quantity;
    }

    toJSON() {
        return {
            product: this.product.toJSON(),
            quantity: this.quantity
        };
    }
}

export class ProductError extends Error {
    constructor(message, validationErrors = []) {
        super(message);
        this.name = 'ProductError';
        this.validationErrors = validationErrors;
    }
}