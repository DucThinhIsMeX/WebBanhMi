import ProductService from '../services/ProductService.js';
import AuthService from '../services/AuthService.js';
import { ProductError } from '../models/Product.js';

export default class ProductController {
    constructor() {
        // Ensure user is authenticated
        if (!AuthService.requireAuth()) return;

        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.init();
        this.bindEvents();
        this.loadProducts();
    }

    init() {
        // Initialize UI elements
        this.productGrid = document.getElementById('product-grid');
        this.searchInput = document.getElementById('search-products');
        this.categoryFilter = document.getElementById('category-filter');
        this.cartItemsList = document.getElementById('cart-items');
        this.cartTotal = document.getElementById('cart-total');
    }

    bindEvents() {
        // Search products
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        }

        // Filter by category
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', this.handleCategoryChange.bind(this));
        }

        // Cart toggle
        const cartToggle = document.querySelector('.cart-btn');
        if (cartToggle) {
            cartToggle.addEventListener('click', this.toggleCart.bind(this));
        }

        // Profile/Logout
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                if (confirm('Bạn có muốn đăng xuất không?')) {
                    AuthService.logout();
                    window.location.href = 'index.html';
                }
            });
        }

        // Update cart on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateCart();
            }
        });
    }

    loadProducts() {
        let products;
        
        if (this.searchQuery) {
            products = ProductService.searchProducts(this.searchQuery);
        } else if (this.currentCategory !== 'all') {
            products = ProductService.getProductsByCategory(this.currentCategory);
        } else {
            products = ProductService.getAllProducts();
        }

        this.renderProducts(products);
        this.updateCart();
    }

    renderProducts(products) {
        if (!this.productGrid) return;

        this.productGrid.innerHTML = products.map(product => `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="description">${product.description}</p>
                    <div class="price-row">
                        <span class="price">${product.formatPrice()}</span>
                        <button class="add-to-cart" data-product-id="${product.id}">
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </article>
        `).join('');

        // Add event listeners to new products
        this.productGrid.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                this.addToCart(productId);
            });
        });
    }

    handleSearch(e) {
        this.searchQuery = e.target.value;
        this.loadProducts();
    }

    handleCategoryChange(e) {
        this.currentCategory = e.target.value;
        this.loadProducts();
    }

    async addToCart(productId) {
        try {
            ProductService.addToCart(productId);
            this.updateCart();

            // Animation feedback
            const button = document.querySelector(`[data-product-id="${productId}"] .add-to-cart`);
            if (button) {
                button.classList.add('clicked');
                setTimeout(() => button.classList.remove('clicked'), 300);
            }

            // Show toast notification
            this.showToast(`Đã thêm sản phẩm vào giỏ hàng!`);

        } catch (error) {
            if (error instanceof ProductError) {
                this.showToast(error.message, 'error');
            }
        }
    }

    updateCart() {
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = ProductService.getCartCount();
        }

        // Update cart items if cart is open
        if (this.cartItemsList && this.cartItemsList.offsetParent !== null) {
            this.renderCartItems();
        }
    }

    renderCartItems() {
        const cartItems = ProductService.getCart();
        
        this.cartItemsList.innerHTML = cartItems.length ? cartItems.map(item => `
            <div class="cart-item" data-product-id="${item.product.id}">
                <img src="${item.product.image}" alt="${item.product.name}">
                <div class="cart-item-details">
                    <h4>${item.product.name}</h4>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-product-id="${item.product.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-product-id="${item.product.id}">+</button>
                    </div>
                    <span class="price">${item.product.formatPrice()}</span>
                </div>
                <button class="remove-item" data-product-id="${item.product.id}">&times;</button>
            </div>
        `).join('') : '<p class="empty-cart">Giỏ hàng trống</p>';

        // Update total
        if (this.cartTotal) {
            const total = ProductService.getCartTotal();
            this.cartTotal.textContent = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(total);
        }

        // Bind cart item events
        this.bindCartItemEvents();
    }

    bindCartItemEvents() {
        // Quantity buttons
        this.cartItemsList.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                const cartItem = ProductService.cart.get(productId);
                if (!cartItem) return;

                if (btn.classList.contains('plus')) {
                    ProductService.updateCartItemQuantity(productId, cartItem.quantity + 1);
                } else {
                    ProductService.updateCartItemQuantity(productId, cartItem.quantity - 1);
                }

                this.updateCart();
            });
        });

        // Remove buttons
        this.cartItemsList.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                ProductService.removeFromCart(productId);
                this.updateCart();
            });
        });
    }

    toggleCart() {
        const cart = document.querySelector('.cart-panel');
        if (cart) {
            cart.classList.toggle('open');
            if (cart.classList.contains('open')) {
                this.renderCartItems();
            }
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        });
    }
}