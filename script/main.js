// Product data
const products = [
  {
    card_id: 25912,
    name: "Соска CAMERA блок ЛЕНТА 12шт думалок",
    price: 24000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    card_id: 2523,
    name: "Smartphone Samsung Galaxy S23",
    price: 8500000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    card_id: 254,
    name: "Соска CAMERA блок ЛЕНТА 12шт думалок",
    price: 24000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    card_id: 255,
    name: "Smartphone Samsung Galaxy S23",
    price: 8500000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    card_id: 257,
    name: "Соска CAMERA блок ЛЕНТА 12шт думалок",
    price: 24000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    card_id: 258,
    name: "Smartphone Samsung Galaxy S23",
    price: 8500000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    card_id: 259,
    name: "Соска CAMERA блок ЛЕНТА 12шт думалок",
    price: 24000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    card_id: 260,
    name: "Smartphone Samsung Galaxy S23",
    price: 8500000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    card_id: 261,
    name: "Laptop HP Pavilion 15",
    price: 12500000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
  {
    card_id: 262,
    name: "AirPods Pro 2-nasi",
    price: 3200000,
    image:
      "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12",
  },
];

// Global variables
let cart = [];
let cartCount = 0;
let currentPage = 1;
const itemsPerPage = 8;

// DOM elements
const productsContainer = document.getElementById("productsContainer");
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const floatingCart = document.getElementById("floatingCart");
const cartCountElement = document.querySelector(".cart-count");

// Create cart popup
const cartPopupOverlay = document.createElement("div");
cartPopupOverlay.className = "cart-popup-overlay";

// Initialize cart popup
function initializeCartPopup() {
  cartPopupOverlay.innerHTML = `
        <div class="cart-popup-content">
            <div class="cart-popup-header">
                <h2 class="cart-popup-title">Savat</h2>
                <button class="close-cart-popup">&times;</button>
            </div>
            <div class="cart-items" id="cartItems">
                <!-- Cart items will be loaded here -->
            </div>
            <div class="cart-total" id="cartTotal">
                Jami: 0 so'm
            </div>
            <button class="confirm-order-btn" id="confirmOrderBtn">
                <i class="fa-solid fa-paper-plane"></i>
                Buyurtma berish
            </button>
        </div>
    `;
  document.body.appendChild(cartPopupOverlay);

  // Cart popup event listeners
  cartPopupOverlay
    .querySelector(".close-cart-popup")
    .addEventListener("click", closeCartPopup);
  cartPopupOverlay.addEventListener("click", (e) => {
    if (e.target === cartPopupOverlay) closeCartPopup();
  });

  // Confirm order button event listener
  document.getElementById("confirmOrderBtn").addEventListener("click", confirmOrder);
}

// Format price to Uzbek som format
function formatPrice(price) {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
}

// Render products with pagination
function renderProducts(productsToRender, page = 1) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = productsToRender.slice(startIndex, endIndex);

  productsContainer.innerHTML = "";

  if (paginatedProducts.length === 0) {
    productsContainer.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <h3 style="color: var(--primary-dark); margin-bottom: 1rem;">Hech qanday mahsulot topilmadi</h3>
                <p style="color: #666;">Qidiruv so'rovi bo'yicha hech qanday mahsulot topilmadi</p>
            </div>
        `;
    return;
  }

  paginatedProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    // Check if product is already in cart
    const cartItem = cart.find(item => item.card_id === product.card_id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;

    productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${
      product.name
    }" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=Rasm+Yuklanmadi'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="add-to-cart-section">
                    ${
                      currentQuantity > 0
                        ? `
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-change="-5" data-id="${product.card_id}">-5</button>
                            <button class="quantity-btn" data-change="-1" data-id="${product.card_id}">-1</button>
                            <span class="quantity-display">${currentQuantity}</span>
                            <button class="quantity-btn" data-change="+1" data-id="${product.card_id}">+1</button>
                            <button class="quantity-btn" data-change="+5" data-id="${product.card_id}">+5</button>
                        </div>
                    `
                        : `
                        <button class="add-to-cart-btn" data-id="${product.card_id}">
                            <i class="fa-solid fa-cart-plus"></i>
                            Sotib olish
                        </button>
                    `
                    }
                </div>
            </div>
        `;

    productsContainer.appendChild(productCard);
  });

  // Add event listeners
  addProductEventListeners();
  addQuantityEventListeners();

  // Render pagination
  renderPagination(productsToRender.length, page);
}

// Add event listeners to product buttons
function addProductEventListeners() {
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const productId = parseInt(e.target.getAttribute("data-id"));
      // Add 1 item when clicking "Sotib olish"
      updateCartQuantity(productId, 1);
    });
  });
}

// Add event listeners to quantity buttons
function addQuantityEventListeners() {
  document.querySelectorAll(".quantity-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const productId = parseInt(e.target.getAttribute("data-id"));
      const change = parseInt(e.target.getAttribute("data-change"));
      updateCartQuantity(productId, change);
    });
  });
}

// Update cart quantity for a product
function updateCartQuantity(productId, change) {
  const product = products.find((p) => p.card_id === productId);
  if (!product) return;

  const existingItemIndex = cart.findIndex((item) => item.card_id === productId);
  let newQuantity = 0;

  if (existingItemIndex !== -1) {
    // Update existing item
    cart[existingItemIndex].quantity += change;
    newQuantity = cart[existingItemIndex].quantity;

    // Remove item if quantity becomes 0 or less
    if (newQuantity <= 0) {
      cart.splice(existingItemIndex, 1);
      newQuantity = 0;
    }
  } else if (change > 0) {
    // Add new item only if change is positive
    cart.push({
      ...product,
      quantity: change,
    });
    newQuantity = change;
  }

  // Update cart count
  cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  updateCartCount();

  // Animate floating cart if items were added
  if (change > 0) {
    animateFloatingCart();
  }

  // Show message
  if (change > 0) {
    showMessage(
      `"${product.name}" dan ${change} ta savatga qo'shildi!`,
      "success"
    );
  } else if (change < 0 && newQuantity === 0) {
    showMessage(
      `"${product.name}" savatdan olib tashlandi!`,
      "info"
    );
  }

  // Re-render products to update quantity controls
  renderProducts(getFilteredProducts(), currentPage);
}

// Render cart items
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");
  const confirmOrderBtn = document.getElementById("confirmOrderBtn");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Savat bo'sh</p>
            </div>
        `;
    cartTotalElement.textContent = "Jami: 0 so'm";
    confirmOrderBtn.style.display = "none";
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = "";
  confirmOrderBtn.style.display = "flex";

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
            <img src="${item.image}" alt="${
      item.name
    }" class="cart-item-image" onerror="this.src='https://via.placeholder.com/60x60?text=Rasm'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-quantity">Miqdor: ${
                  item.quantity
                } ta</div>
            </div>
            <div class="cart-item-total">${formatPrice(itemTotal)}</div>
        `;

    cartItemsContainer.appendChild(cartItem);
  });

  cartTotalElement.textContent = `Jami: ${formatPrice(total)}`;
}

// Confirm order and send to API
function confirmOrder() {
  if (cart.length === 0) {
    showMessage("Savat bo'sh!", "error");
    return;
  }

  // Prepare order data
  const orderData = {
    items: cart.map(item => ({
      card_id: item.card_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    timestamp: new Date().toISOString()
  };

  // Simulate API call
  showMessage("Buyurtma yuborilmoqda...", "info");
  
  // In a real application, you would use fetch or axios here
  setTimeout(() => {
    // Simulate successful API response
    console.log("Order sent to API:", orderData);
    
    // Clear cart after successful order
    cart = [];
    cartCount = 0;
    updateCartCount();
    renderCartItems();
    renderProducts(getFilteredProducts(), currentPage);
    
    showMessage("Buyurtma muvaffaqiyatli yuborildi!", "success");
    closeCartPopup();
  }, 2000);
}

// Open cart popup
function openCartPopup() {
  renderCartItems();
  cartPopupOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Close cart popup
function closeCartPopup() {
  cartPopupOverlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Render pagination
function renderPagination(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Remove existing pagination
  const existingPagination = document.querySelector(".pagination");
  if (existingPagination) {
    existingPagination.remove();
  }

  if (totalPages <= 1) return;

  const pagination = document.createElement("div");
  pagination.className = "pagination";

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  pagination.innerHTML = `
        <button class="pagination-btn prev-btn" ${
          currentPage === 1 ? "disabled" : ""
        }>
            <i class="fa-solid fa-chevron-left"></i>
        </button>
        
        <div class="page-numbers">
            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return `<button class="page-number ${
                pageNum === currentPage ? "active" : ""
              }" data-page="${pageNum}">${pageNum}</button>`;
            }).join("")}
            ${
              totalPages > 5
                ? `<span>...</span><button class="page-number" data-page="${totalPages}">${totalPages}</button>`
                : ""
            }
        </div>        
        <button class="pagination-btn next-btn" ${
          currentPage === totalPages ? "disabled" : ""
        }>
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

  document.querySelector(".container").appendChild(pagination);

  // Pagination event listeners
  pagination.querySelector(".prev-btn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts(getFilteredProducts(), currentPage);
    }
  });

  pagination.querySelector(".next-btn").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts(getFilteredProducts(), currentPage);
    }
  });

  pagination.querySelectorAll(".page-number").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      currentPage = parseInt(e.target.getAttribute("data-page"));
      renderProducts(getFilteredProducts(), currentPage);
    });
  });
}

// Get filtered products based on search
function getFilteredProducts() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm === "") {
    return products;
  }

  return products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );
}

// Animate floating cart
function animateFloatingCart() {
  floatingCart.classList.add("added");
  setTimeout(() => {
    floatingCart.classList.remove("added");
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
function showMessage(text, type = "info") {
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const message = document.createElement("div");
  message.className = `message message-${type}`;
  message.textContent = text;
  message.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#4CAF50" : type === "error" ? "#dc3545" : "#ff9800"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(message);

  setTimeout(() => {
    message.style.animation = "slideOut 0.3s ease";
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// Event listeners
searchBtn.addEventListener("click", searchProducts);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchProducts();
  }
});

floatingCart.addEventListener("click", openCartPopup);

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  initializeCartPopup();
  renderProducts(products, currentPage);
  updateCartCount();
});