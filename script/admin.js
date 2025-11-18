// Sample product data - in real app, this would come from API
let products = [
    {
        card_id: 259,
        name: "Соска CAMERA блок ЛЕНТА 12шт думалок",
        price: 25000,
        image: "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
        originalName: "Соска CAMERA блок ЛЕНТА 12шт думалок",
        originalPrice: 25000
    },
    {
        card_id: 258,
        name: "ЗАПАС СОСКА CAMERA {72шт}",
        price: 1000,
        image: "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
        originalName: "ЗАПАС СОСКА CAMERA {72шт}",
        originalPrice: 1000
    }
];

// Track modified products
let modifiedProducts = new Set();

// DOM elements
const productsContainer = document.getElementById('productsContainer');
const saveAllBtn = document.getElementById('saveAllBtn');
const totalProductsElement = document.getElementById('totalProducts');
const modifiedProductsElement = document.getElementById('modifiedProducts');

// Format price to Uzbek som format
function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
}

// Check if product is modified
function isProductModified(product) {
    return product.name !== product.originalName || product.price !== product.originalPrice;
}

// Update statistics
function updateStatistics() {
    totalProductsElement.textContent = products.length;
    modifiedProductsElement.textContent = modifiedProducts.size;
}

// Render products
function renderProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const isModified = isProductModified(product);
        const productCard = document.createElement('div');
        productCard.className = `admin-product-card ${isModified ? 'modified' : ''}`;
        
        productCard.innerHTML = `
            ${isModified ? '<div class="modified-badge">O\'zgartirildi</div>' : ''}
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=Rasm+Yuklanmadi'">
            </div>
            <div class="product-info">
                <div class="product-id">ID: ${product.card_id}</div>
                
                <div class="form-group">
                    <label for="name-${product.card_id}">Mahsulot nomi:</label>
                    <input 
                        type="text" 
                        id="name-${product.card_id}" 
                        class="form-input name-input ${product.name !== product.originalName ? 'modified' : ''}" 
                        value="${product.name}"
                        data-field="name"
                        data-product-id="${product.card_id}"
                    >
                </div>
                
                <div class="form-group">
                    <label for="price-${product.card_id}">Narxi (so'm):</label>
                    <input 
                        type="number" 
                        id="price-${product.card_id}" 
                        class="form-input price-input ${product.price !== product.originalPrice ? 'modified' : ''}" 
                        value="${product.price}"
                        data-field="price"
                        data-product-id="${product.card_id}"
                        min="0"
                    >
                </div>
                
                <button class="save-btn-card" data-product-id="${product.card_id}" ${!isModified ? 'disabled' : ''}>
                    <i class="fa-solid fa-floppy-disk"></i>
                    Saqlash
                </button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
    
    // Add event listeners
    addEventListeners();
    updateStatistics();
}

// Add event listeners to inputs and buttons
function addEventListeners() {
    // Input change events
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', handleInputChange);
    });
    
    // Individual save buttons
    document.querySelectorAll('.save-btn-card').forEach(button => {
        button.addEventListener('click', handleSaveProduct);
    });
}

// Handle input changes
function handleInputChange(e) {
    const input = e.target;
    const productId = parseInt(input.getAttribute('data-product-id'));
    const field = input.getAttribute('data-field');
    const value = field === 'price' ? parseInt(input.value) || 0 : input.value;
    
    // Find product and update
    const product = products.find(p => p.card_id === productId);
    if (product) {
        product[field] = value;
        
        // Update modified status
        const isModified = isProductModified(product);
        const productCard = input.closest('.admin-product-card');
        const saveButton = productCard.querySelector('.save-btn-card');
        const modifiedBadge = productCard.querySelector('.modified-badge');
        
        if (isModified) {
            modifiedProducts.add(productId);
            productCard.classList.add('modified');
            input.classList.add('modified');
            saveButton.disabled = false;
            
            if (!modifiedBadge) {
                const badge = document.createElement('div');
                badge.className = 'modified-badge';
                badge.textContent = 'O\'zgartirildi';
                productCard.prepend(badge);
            }
        } else {
            modifiedProducts.delete(productId);
            productCard.classList.remove('modified');
            input.classList.remove('modified');
            saveButton.disabled = true;
            
            if (modifiedBadge) {
                modifiedBadge.remove();
            }
        }
        
        updateStatistics();
    }
}

// Handle individual product save
function handleSaveProduct(e) {
    const button = e.target;
    const productId = parseInt(button.getAttribute('data-product-id'));
    saveProduct(productId);
}

// Save individual product
function saveProduct(productId) {
    const product = products.find(p => p.card_id === productId);
    if (product && isProductModified(product)) {
        // Simulate API call
        showMessage(`"${product.name}" mahsuloti saqlandi!`, 'success');
        
        // Update original values
        product.originalName = product.name;
        product.originalPrice = product.price;
        
        // Remove from modified set
        modifiedProducts.delete(productId);
        
        // Update UI
        renderProducts();
    }
}

// Save all modified products
function saveAllProducts() {
    if (modifiedProducts.size === 0) {
        showMessage('O\'zgartirilgan mahsulotlar yo\'q!', 'error');
        return;
    }
    
    // Simulate API call for all modified products
    modifiedProducts.forEach(productId => {
        const product = products.find(p => p.card_id === productId);
        if (product) {
            product.originalName = product.name;
            product.originalPrice = product.price;
        }
    });
    
    showMessage(`Barcha ${modifiedProducts.size} ta mahsulot saqlandi!`, 'success');
    
    // Clear modified set and update UI
    modifiedProducts.clear();
    renderProducts();
}

// Show message
function showMessage(text, type = 'success') {
    // Remove existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Initialize original values for products
function initializeOriginalValues() {
    products.forEach(product => {
        product.originalName = product.name;
        product.originalPrice = product.price;
    });
}

// Event listeners
saveAllBtn.addEventListener('click', saveAllProducts);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeOriginalValues();
    renderProducts();
});

// Add some sample products for demonstration
function addSampleProducts() {
    const sampleProducts = [
        {
            card_id: 260,
            name: "Smartphone Samsung Galaxy S23",
            price: 8500000,
            image: "https://images.samsung.com/is/image/samsung/p6pim/uz/2302/gallery/uz-galaxy-s23-s918-sm-s918bzkjskz-534542917"
        },
        {
            card_id: 261,
            name: "Laptop HP Pavilion 15",
            price: 12500000,
            image: "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08293748.png"
        }
    ];
    
    sampleProducts.forEach(product => {
        product.originalName = product.name;
        product.originalPrice = product.price;
    });
    
    products = [...products, ...sampleProducts];
}

// Uncomment the line below to add sample products for testing
// addSampleProducts();