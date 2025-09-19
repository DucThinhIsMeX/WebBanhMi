import { Product, CartItem, ProductError } from '../models/Product.js';

class ProductService {
    constructor() {
        this.products = [];
        this.cart = new Map(); // productId -> CartItem
        this.initProducts();
        this.loadCart();
    }

    initProducts() {
        // Initial product data
        const initialProducts = [
            {
                id: 1,
                name: 'Bánh Mì Thịt Nguội',
                description: 'Thịt nguội, pate thơm, rau sống, dưa chua, ớt tươi',
                price: 25000,
                image: 'public/images/banh-mi-thit.jpg',
                category: 'traditional'
            },
            {
                id: 2,
                name: 'Bánh Mì Xíu Mại',
                description: 'Xíu mại nóng hổi, nước sốt đặc biệt, rau thơm',
                price: 30000,
                image: 'public/images/banh-mi-xiu-mai.jpg',
                category: 'premium'
            },
            {
                id: 3,
                name: 'Bánh Mì Thịt Nướng',
                description: 'Thịt nướng ướp sả, đồ chua, rau thơm, sốt tương đặc biệt',
                price: 28000,
                image: 'public/images/banh-mi-thit-nuong.jpg',
                category: 'traditional'
            },
            {
                id: 4,
                name: 'Bánh Mì Gà',
                description: 'Gà xé, sốt mayo, rau thơm, dưa leo',
                price: 28000,
                image: 'public/images/banh-mi-ga.jpg',
                category: 'traditional'
            },
            {
                id: 5,
                name: 'Bánh Mì Chả Cá',
                description: 'Chả cá chiên giòn, sốt tương, rau thơm',
                price: 25000,
                image: 'public/images/banh-mi-cha-ca.jpg',
                category: 'traditional'
            },
            {
                id: 6,
                name: 'Bánh Mì Chay',
                description: 'Đậu hũ chiên, nấm xào, rau củ tươi',
                price: 22000,
                image: 'public/images/banh-mi-chay.jpg',
                category: 'vegetarian'
            },
            {
                id: 7,
                name: 'Bánh Mì Đặc Biệt',
                description: 'Thịt nguội, xá xíu, trứng ốp la, pate, rau sống',
                price: 35000,
                image: 'public/images/banh-mi-dac-biet.jpg',
                category: 'premium'
            },
            {
                id: 8,
                name: 'Bánh Mì Bò Kho',
                description: 'Bò kho nấu mềm, nước sốt đậm đà, rau thơm',
                price: 35000,
                image: 'public/images/banh-mi-bo-kho.jpg',
                category: 'premium'
            }
        ];

        this.products = initialProducts.map(p => Product.fromJSON(p));
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                cartData.forEach(item => {
                    const product = this.getProduct(item.product.id);
                    if (product) {
                        this.cart.set(product.id, new CartItem(product, item.quantity));
                    }
                });
            } catch (e) {
                console.error('Failed to load cart:', e);
                this.clearCart();
            }
        }
    }

    saveCart() {
        const cartData = Array.from(this.cart.values()).map(item => item.toJSON());
        localStorage.setItem('cart', JSON.stringify(cartData));
    }

    getAllProducts() {
        return [...this.products];
    }

    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    getProduct(id) {
        return this.products.find(p => p.id === parseInt(id));
    }

    addToCart(productId) {
        const product = this.getProduct(productId);
        if (!product) {
            throw new ProductError('Product not found');
        }

        if (this.cart.has(product.id)) {
            const cartItem = this.cart.get(product.id);
            cartItem.quantity += 1;
        } else {
            this.cart.set(product.id, new CartItem(product));
        }

        this.saveCart();
    }

    removeFromCart(productId) {
        if (this.cart.delete(productId)) {
            this.saveCart();
            return true;
        }
        return false;
    }

    updateCartItemQuantity(productId, quantity) {
        const cartItem = this.cart.get(productId);
        if (!cartItem) {
            throw new ProductError('Item not in cart');
        }

        if (quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            cartItem.quantity = quantity;
            this.saveCart();
        }
    }

    getCart() {
        return Array.from(this.cart.values());
    }

    getCartCount() {
        return Array.from(this.cart.values()).reduce((sum, item) => sum + item.quantity, 0);
    }

    getCartTotal() {
        return Array.from(this.cart.values()).reduce((sum, item) => sum + item.getTotal(), 0);
    }

    clearCart() {
        this.cart.clear();
        this.saveCart();
    }

    searchProducts(query) {
        query = query.toLowerCase().trim();
        return this.products.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    }
}

// Export singleton instance
export default new ProductService();