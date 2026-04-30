/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const searchInput = document.getElementById("searchInput");
const rtlToggle = document.getElementById("rtlToggle");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");

/* Store all products and selected products */
let allProducts = [];
let selectedProducts =
  JSON.parse(localStorage.getItem("selectedProducts")) || [];

/* Show initial placeholder */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  try {
    const response = await fetch("products.json");
    const data = await response.json();
    allProducts = data.products || [];
    renderSelectedProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        Failed to load products.
      </div>
    `;
  }
}

/* Save selected products */
function saveSelectedProducts() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

/* Render selected products list */
function renderSelectedProducts() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `<p>No products selected yet.</p>`;
    return;
  }

  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
        <div class="selected-product-item">
          <span>${product.name}</span>
          <button class="remove-product-btn" data-id="${product.id}">×</button>
        </div>
      `,
    )
    .join("");

  const removeButtons = document.querySelectorAll(".remove-product-btn");

  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.id;

      selectedProducts = selectedProducts.filter(
        (product) => String(product.id) !== String(productId),
      );

      saveSelectedProducts();
      renderSelectedProducts();
      filterProducts();
    });
  });
}

/* Display product cards */
function displayProducts(products) {
  if (!products.length) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        No matching products found
      </div>
    `;
    return;
  }

  productsContainer.innerHTML = products
    .map((product) => {
      const isSelected = selectedProducts.some(
        (selectedProduct) => String(selectedProduct.id) === String(product.id),
      );

      return `
        <div class="product-card ${isSelected ? "selected" : ""}" data-id="${product.id}">
          <img src="${product.image}" alt="${product.name}">
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.brand}</p>
            <p class="product-category">${product.category}</p>
            <p>${product.description}</p>
          </div>
        </div>
      `;
    })
    .join("");

  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    card.addEventListener("click", () => {
      const productId = card.dataset.id;

      const clickedProduct = allProducts.find(
        (product) => String(product.id) === String(productId),
      );

      if (!clickedProduct) return;

      const alreadySelected = selectedProducts.some(
        (product) => String(product.id) === String(productId),
      );

      if (alreadySelected) {
        selectedProducts = selectedProducts.filter(
          (product) => String(product.id) !== String(productId),
        );
      } else {
        selectedProducts.push(clickedProduct);
      }

      saveSelectedProducts();
      renderSelectedProducts();
      filterProducts();
    });
  });
}

/* Filter products by category and search */
function filterProducts() {
  const selectedCategory = categoryFilter.value;
  const searchText = searchInput.value.toLowerCase().trim();

  let filteredProducts = allProducts;

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory,
    );
  }

  if (searchText) {
    filteredProducts = filteredProducts.filter((product) => {
      const name = (product.name || "").toLowerCase();
      const brand = (product.brand || "").toLowerCase();
      const category = (product.category || "").toLowerCase();
      const description = (product.description || "").toLowerCase();

      return (
        name.includes(searchText) ||
        brand.includes(searchText) ||
        category.includes(searchText) ||
        description.includes(searchText)
      );
    });
  }

  if (!selectedCategory && !searchText) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        Select a category to view products
      </div>
    `;
    return;
  }

  displayProducts(filteredProducts);
}

/* Category filter event */
categoryFilter.addEventListener("change", filterProducts);

/* Product search event */
searchInput.addEventListener("input", filterProducts);

/* RTL toggle event */
rtlToggle.addEventListener("change", () => {
  if (rtlToggle.checked) {
    document.documentElement.setAttribute("dir", "rtl");
    document.body.classList.add("rtl-mode");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
    document.body.classList.remove("rtl-mode");
  }
});

/* Generate routine button placeholder */
generateRoutineBtn.addEventListener("click", () => {
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = `
      <p>Please select at least one product first.</p>
    `;
    return;
  }

  const routineText = selectedProducts
    .map(
      (product, index) => `${index + 1}. ${product.name} - ${product.category}`,
    )
    .join("<br>");

  chatWindow.innerHTML = `
    <p><strong>Your routine starter:</strong></p>
    <p>${routineText}</p>
    <p>You can now connect this button to your OpenAI API or Cloudflare Worker.</p>
  `;
});

/* Chat form placeholder */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();

  if (!message) return;

  chatWindow.innerHTML += `
    <p><strong>You:</strong> ${message}</p>
    <p><strong>Advisor:</strong> Connect this to OpenAI or your Cloudflare Worker for a real response.</p>
  `;

  userInput.value = "";
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

/* Load products on page start */
loadProducts();
