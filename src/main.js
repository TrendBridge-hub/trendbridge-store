// TrendBridge Store Logic
import '../style.css';

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const elements = {
    productGrid: document.getElementById('product-grid'),
    productDetail: document.getElementById('product-detail'),
    cartBtn: document.getElementById('cart-btn'),
    cartSidebar: document.getElementById('cart-sidebar'),
    cartOverlay: document.getElementById('cart-overlay'),
    closeCart: document.getElementById('close-cart'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    cartCount: document.getElementById('cart-count'),
    checkoutBtn: document.getElementById('checkout-btn')
};

// Initialize
async function init() {
    await fetchProducts();
    
    if (elements.productGrid) renderGrid();
    if (elements.productDetail) renderDetail();
    
    updateCartUI();
    setupEventListeners();
}

async function fetchProducts() {
    try {
        const response = await fetch('/products.json');
        products = await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function renderGrid() {
    elements.productGrid.innerHTML = products.map(product => `
        <div class="product-card group">
            <a href="/product.html?id=${product.id}" class="block relative overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute top-4 left-4">
                    <span class="badge-trending">Trending</span>
                </div>
            </a>
            <div class="p-6">
                <div class="mb-1">
                    <span class="text-xs font-bold text-accent uppercase tracking-widest">${product.category}</span>
                </div>
                <h3 class="text-xl font-bold mb-2">
                    <a href="/product.html?id=${product.id}" class="hover:text-accent transition-colors">${product.name}</a>
                </h3>
                <div class="flex items-center gap-3 mb-4">
                    <span class="text-xl font-bold text-primary">$${product.price.toFixed(2)}</span>
                    ${product.original_price ? `<span class="text-sm text-secondary line-through">$${product.original_price.toFixed(2)}</span>` : ''}
                </div>
                <button onclick="addToCart('${product.id}')" class="btn-primary w-full flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function renderDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const product = products.find(p => p.id === id);

    if (!product) {
        if (elements.productDetail) {
            elements.productDetail.innerHTML = '<p class="text-center col-span-2 py-20 text-xl font-medium">Product not found.</p>';
        }
        return;
    }

    elements.productDetail.innerHTML = `
        <div class="relative group">
            <div class="rounded-3xl overflow-hidden bg-gray-100 shadow-2xl">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
            </div>
            <div class="absolute top-6 left-6">
                <span class="bg-white/90 backdrop-blur-sm text-accent text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">
                    Trending Now
                </span>
            </div>
        </div>
        <div class="flex flex-col justify-center py-6 md:py-12">
            <nav class="text-xs font-bold uppercase tracking-widest text-secondary mb-4">
                <a href="/" class="hover:text-accent transition-colors">Home</a> / <span class="text-accent">${product.category}</span>
            </nav>
            <h1 class="text-4xl md:text-6xl font-extrabold text-primary mb-6 leading-tight">${product.name}</h1>
            <div class="flex items-center gap-4 mb-8">
                <span class="text-3xl md:text-4xl font-bold text-accent">$${product.price.toFixed(2)}</span>
                ${product.original_price ? `<span class="text-xl text-secondary line-through">$${product.original_price.toFixed(2)}</span>` : ''}
                <span class="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded">SAVE ${Math.round((1 - product.price/product.original_price) * 100)}%</span>
            </div>
            
            <div class="prose prose-slate mb-10">
                <p class="text-lg text-secondary leading-relaxed">${product.description}</p>
            </div>

            ${product.features ? `
            <ul class="space-y-4 mb-10">
                ${product.features.map(feature => `
                    <li class="flex items-center gap-3 text-secondary font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-teal-500"><path d="M20 6 9 17l-5-5"/></svg>
                        ${feature}
                    </li>
                `).join('')}
            </ul>
            ` : ''}

            <div class="flex flex-col sm:flex-row gap-4 mb-8">
                <button onclick="addToCart('${product.id}')" class="btn-secondary flex-1 py-4 text-lg">
                    Add to Cart
                </button>
                <button onclick="buyNow('${product.id}')" class="btn-primary flex-1 py-4 text-lg">
                    Buy Now
                </button>
            </div>

            <!-- Trust Badges -->
            <div class="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                <div class="flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary mb-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                    <span class="text-[10px] font-bold uppercase tracking-tighter text-secondary">Secure SSL</span>
                </div>
                <div class="flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary mb-2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    <span class="text-[10px] font-bold uppercase tracking-tighter text-secondary">Buyer Protection</span>
                </div>
                <div class="flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary mb-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    <span class="text-[10px] font-bold uppercase tracking-tighter text-secondary">Fast Delivery</span>
                </div>
            </div>
        </div>
    `;
}

// Cart Actions
window.buyNow = (id) => {
    const product = products.find(p => p.id === id);
    if (product && product.stripe_link && product.stripe_link !== '#') {
        window.location.href = product.stripe_link;
    } else {
        alert('Stripe checkout for this product is coming soon!');
    }
};

window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    toggleCart(true);
};

window.updateQuantity = (id, delta) => {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update count badge
    if (totalCount > 0) {
        elements.cartCount.innerText = totalCount;
        elements.cartCount.classList.remove('hidden');
    } else {
        elements.cartCount.classList.add('hidden');
    }

    // Update items list
    if (cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="text-center py-20 bg-gray-50 rounded-2xl">
                <p class="text-secondary font-medium mb-4">Your cart is empty</p>
                <button onclick="toggleCart(false)" class="btn-primary py-2 text-sm">Start shopping</button>
            </div>
        `;
        elements.checkoutBtn.disabled = true;
    } else {
        elements.cartItems.innerHTML = cart.map(item => `
            <div class="flex gap-6 items-center">
                <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-cover rounded-2xl bg-gray-100">
                <div class="flex-1">
                    <h4 class="font-bold text-primary mb-1 line-clamp-1">${item.name}</h4>
                    <p class="text-accent font-bold mb-3">$${item.price.toFixed(2)}</p>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center border border-gray-200 rounded-full px-2 py-1">
                            <button onclick="updateQuantity('${item.id}', -1)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">-</button>
                            <span class="w-8 text-center text-sm font-bold">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', 1)" class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">+</button>
                        </div>
                        <button onclick="updateQuantity('${item.id}', -${item.quantity})" class="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
        elements.checkoutBtn.disabled = false;
    }

    elements.cartTotal.innerText = `$${totalPrice.toFixed(2)}`;
}

function toggleCart(show) {
    if (show) {
        elements.cartSidebar.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    } else {
        elements.cartSidebar.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}

function setupEventListeners() {
    elements.cartBtn.addEventListener('click', () => toggleCart(true));
    elements.closeCart.addEventListener('click', () => toggleCart(false));
    elements.cartOverlay.addEventListener('click', () => toggleCart(false));
    
    elements.checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            // For now, redirect to the first item's stripe link
            window.location.href = cart[0].stripe_link;
        }
    });
}

init();
