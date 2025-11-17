// Product data
const products = [
    {
        card_id: 259,
        name: "Соска CAMERA блок ЛЕНТА 12шт думалок",
        price: 24000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 260,
        name: "Smartphone Samsung Galaxy S23",
        price: 8500000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 261,
        name: "Laptop HP Pavilion 15",
        price: 12500000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 262,
        name: "AirPods Pro 2-nasi",
        price: 3200000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 263,
        name: "Smart Watch Series 8",
        price: 2800000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 264,
        name: "Tablet iPad Air",
        price: 6500000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 265,
        name: "Gaming Mouse RGB",
        price: 450000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 266,
        name: "Wireless Keyboard",
        price: 680000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 267,
        name: "Bluetooth Speaker",
        price: 890000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 268,
        name: "Digital Camera DSLR",
        price: 12500000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 269,
        name: "Gaming Headset",
        price: 750000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 270,
        name: "External Hard Drive 2TB",
        price: 1200000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    },
    {
        card_id: 271,
        name: "Monitor 27 inch 4K",
        price: 4500000,
        image: 'https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12'
    }
];

// Global variables
let cart = [];
let cartCount = 0;
let currentPage = 1;
const itemsPerPage = 8;

// DOM elements
const productsContainer = document.getElementById('productsContainer');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const floatingCart = document.getElementById('floatingCart');
const cartCountElement = document.querySelector('.cart-count');
const popupOverlay = document.createElement('div');
popupOverlay.className = 'popup-overlay';

// Initialize popup
function initializePopup() {
    popupOverlay.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h2 class="popup-title">Mahsulotni sotib olish</h2>
                <button class="close-popup">&times;</button>
            </div>
            <div class="popup-body">
                <img src="" alt="" class="popup-product-image">
                <h3 class="popup-product-name"></h3>
                <div class="popup-product-price"></div>
                <div class="quantity-controls">
                    <button class="quantity-btn" data-change="-1">-1</button>
                    <span class="quantity-display">1</span>
                    <button class="quantity-btn" data-change="+1">+1</button>
                </div>
                <button class="send-btn">
                    <i class="fa-solid fa-paper-plane"></i>
                    Buyurtma berish
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(popupOverlay);
    
    // Popup event listeners
    popupOverlay.querySelector('.close-popup').addEventListener('click', closePopup);
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) closePopup();
    });
    
    // Quantity buttons
    popupOverlay.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityChange);
    });
    
    // Send button
    popupOverlay.querySelector('.send-btn').addEventListener('click', handleOrder);
}

// Format price to Uzbek som format
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
}

// Render products with pagination
function renderProducts(productsToRender, page = 1) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = productsToRender.slice(startIndex, endIndex);
    
    productsContainer.innerHTML = '';
    
    if (paginatedProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <h3 style="color: var(--primary-dark); margin-bottom: 1rem;">Hech qanday mahsulot topilmadi</h3>
                <p style="color: #666;">Qidiruv so'rovi bo'yicha hech qanday mahsulot topilmadi</p>
            </div>
        `;
        return;
    }
    
    paginatedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=Rasm+Yuklanmadi'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <button class="add-to-cart-btn" data-id="${product.card_id}">
                    <i class="fa-solid fa-cart-plus"></i>
                    Sotib olish
                </button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
    
    // Add event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            openPopup(parseInt(e.target.getAttribute('data-id')));
        });
    });
    
    // Render pagination
    renderPagination(productsToRender.length, page);
}

// Render pagination
function renderPagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Remove existing pagination
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    if (totalPages <= 1) return;
    
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    pagination.innerHTML = `
        <button class="pagination-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i>
        </button>
        
        <div class="page-numbers">
            ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                const pageNum = i + 1;
                return `<button class="page-number ${pageNum === currentPage ? 'active' : ''}" data-page="${pageNum}">${pageNum}</button>`;
            }).join('')}
            ${totalPages > 5 ? `<span>...</span><button class="page-number" data-page="${totalPages}">${totalPages}</button>` : ''}
        </div>        
        <button class="pagination-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;
    
    document.querySelector('.container').appendChild(pagination);
    
    // Pagination event listeners
    pagination.querySelector('.prev-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts(getFilteredProducts(), currentPage);
        }
    });
    
    pagination.querySelector('.next-btn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts(getFilteredProducts(), currentPage);
        }
    });
    
    pagination.querySelectorAll('.page-number').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentPage = parseInt(e.target.getAttribute('data-page'));
            renderProducts(getFilteredProducts(), currentPage);
        });
    });
}

// Get filtered products based on search
function getFilteredProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        return products;
    }
    
    return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
}

// Open popup
function openPopup(productId) {
    const product = products.find(p => p.card_id === productId);
    
    if (product) {
        popupOverlay.querySelector('.popup-product-image').src = product.image;
        popupOverlay.querySelector('.popup-product-name').textContent = product.name;
        popupOverlay.querySelector('.popup-product-price').textContent = formatPrice(product.price);
        popupOverlay.querySelector('.quantity-display').textContent = '1';
        popupOverlay.querySelector('.popup-body').setAttribute('data-product-id', productId);
        
        popupOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close popup
function closePopup() {
    popupOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Handle quantity change
function handleQuantityChange(e) {
    const change = parseInt(e.target.getAttribute('data-change'));
    const quantityDisplay = popupOverlay.querySelector('.quantity-display');
    let currentQuantity = parseInt(quantityDisplay.textContent);
    
    currentQuantity += change;
    
    if (currentQuantity < 1) {
        currentQuantity = 1;
    }
    
    if (currentQuantity > 99) {
        currentQuantity = 99;
    }
    
    quantityDisplay.textContent = currentQuantity;
}

// Handle order
function handleOrder() {
    const productId = parseInt(popupOverlay.querySelector('.popup-body').getAttribute('data-product-id'));
    const quantity = parseInt(popupOverlay.querySelector('.quantity-display').textContent);
    const product = products.find(p => p.card_id === productId);
    
    if (product) {
        // Add to cart
        const existingItem = cart.find(item => item.card_id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        cartCount += quantity;
        updateCartCount();
        
        // Animate floating cart
        animateFloatingCart();
        
        // Show success message
        showMessage(`"${product.name}" dan ${quantity} ta savatga qo'shildi!`, 'success');
        
        closePopup();
    }
}

// Animate floating cart
function animateFloatingCart() {
    floatingCart.classList.add('added');
    setTimeout(() => {
        floatingCart.classList.remove('added');
    }, 600);
}

// Update cart count
function updateCartCount() {
    cartCountElement.textContent = cartCount;
}

// Search functionality
function searchProducts() {
    currentPage = 1;
    renderProducts(getFilteredProducts(), currentPage);
}

// Show message
function showMessage(text, type = 'info') {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#ff9800'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Event listeners
searchBtn.addEventListener('click', searchProducts);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializePopup();
    renderProducts(products, currentPage);
    updateCartCount();
});