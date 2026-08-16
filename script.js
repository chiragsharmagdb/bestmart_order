// ============================================
// PRODUCT ORDER CHECKLIST - MAIN APPLICATION LOGIC
// ============================================

// Global state management
let orderState = {}; // { productId: { quantity, selected, productName, category, subcategory } }
let expandedCategories = new Set();
let expandedSubcategories = new Set();
let currentSearchTerm = '';
let currentSortOrder = 'default';
let allProducts = []; // Flattened product list with IDs

// DOM Elements
const categoryListEl = document.getElementById('categoryList');
const emptyStateEl = document.getElementById('emptyState');
const emptyStateTextEl = document.getElementById('emptyStateText');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const statsProductsEl = document.getElementById('statProducts');
const statsSelectedEl = document.getElementById('statSelected');
const statsQuantityEl = document.getElementById('statQuantity');
const statsCategoriesEl = document.getElementById('statCategories');
const selectedCounterSmallEl = document.getElementById('selectedCounterSmall');
const orderItemsListEl = document.getElementById('orderItemsList');
const copyOrderBtn = document.getElementById('copyOrderBtn');
const clearOrderBtn = document.getElementById('clearOrderBtn');
const clearSavedOrderBtn = document.getElementById('clearSavedOrderBtn');
const selectAllVisibleBtn = document.getElementById('selectAllVisibleBtn');
const unselectAllVisibleBtn = document.getElementById('unselectAllVisibleBtn');
const sortSelect = document.getElementById('sortSelect');
const copyFormatSelect = document.getElementById('copyFormatSelect');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const csvFileInput = document.getElementById('csvFileInput');
const toastContainer = document.getElementById('toastContainer');

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Load saved state from localStorage
    loadStateFromStorage();
    
    // Build flattened product list with stable IDs
    buildProductIndex();
    
    // Render initial UI
    renderCategories();
    updateStats();
    updateOrderSummary();
    
    // Set up event listeners
    setupEventListeners();
    
    // Apply saved expanded states
    restoreExpandedStates();
}

// ============================================
// PRODUCT INDEX & ID GENERATION
// ============================================
function buildProductIndex() {
    allProducts = [];
    let idCounter = 0;
    
    products.forEach(category => {
        const categoryName = category.category;
        
        if (category.subcategory && typeof category.subcategory === 'string') {
            // Single subcategory
            addSubcategoryProducts(categoryName, category.subcategory, category.products, idCounter);
            idCounter += category.products.length;
        } else if (category.subcategories && Array.isArray(category.subcategories)) {
            // Multiple subcategories
            category.subcategories.forEach(sub => {
                addSubcategoryProducts(categoryName, sub.name || sub.subcategory, sub.products, idCounter);
                idCounter += (sub.products?.length || 0);
            });
        } else {
            // Fallback: treat as subcategory named 'General'
            addSubcategoryProducts(categoryName, 'General', category.products, idCounter);
            idCounter += category.products.length;
        }
    });
}

function addSubcategoryProducts(categoryName, subcategoryName, productList, startId) {
    if (!productList || !Array.isArray(productList)) return;
    
    productList.forEach((productName, index) => {
        const productId = `prod_${startId + index}`;
        allProducts.push({
            id: productId,
            category: categoryName,
            subcategory: subcategoryName,
            productName: productName
        });
        
        // Initialize order state if not exists
        if (!orderState[productId]) {
            orderState[productId] = {
                quantity: 0,
                selected: false,
                productName: productName,
                category: categoryName,
                subcategory: subcategoryName
            };
        }
    });
}

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================
function saveStateToStorage() {
    try {
        const stateToSave = {
            orderState: orderState,
            expandedCategories: Array.from(expandedCategories),
            expandedSubcategories: Array.from(expandedSubcategories),
            copyFormat: copyFormatSelect?.value || 'simple',
            sortOrder: currentSortOrder
        };
        localStorage.setItem('productOrderAppState', JSON.stringify(stateToSave));
    } catch (e) {
        console.warn('Failed to save state:', e);
    }
}

function loadStateFromStorage() {
    try {
        const savedState = localStorage.getItem('productOrderAppState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            
            if (parsed.orderState) {
                orderState = parsed.orderState;
            }
            if (parsed.expandedCategories) {
                expandedCategories = new Set(parsed.expandedCategories);
            }
            if (parsed.expandedSubcategories) {
                expandedSubcategories = new Set(parsed.expandedSubcategories);
            }
            if (parsed.copyFormat) {
                setTimeout(() => {
                    if (copyFormatSelect) copyFormatSelect.value = parsed.copyFormat;
                }, 0);
            }
            if (parsed.sortOrder) {
                currentSortOrder = parsed.sortOrder;
                setTimeout(() => {
                    if (sortSelect) sortSelect.value = currentSortOrder;
                }, 0);
            }
        }
    } catch (e) {
        console.warn('Failed to load saved state:', e);
    }
}

function clearSavedOrder() {
    if (confirm('Clear all saved data and reset the order?')) {
        orderState = {};
        expandedCategories.clear();
        expandedSubcategories.clear();
        currentSortOrder = 'default';
        
        localStorage.removeItem('productOrderAppState');
        
        buildProductIndex();
        renderCategories();
        updateStats();
        updateOrderSummary();
        
        showToast('Saved order cleared', 'info');
    }
}

// ============================================
// RENDERING FUNCTIONS
// ============================================
function getSortedCategories() {
    let categoryNames = [...new Set(allProducts.map(p => p.category))];
    
    if (currentSortOrder === 'az') {
        categoryNames.sort((a, b) => a.localeCompare(b));
    } else if (currentSortOrder === 'za') {
        categoryNames.sort((a, b) => b.localeCompare(a));
    }
    
    return categoryNames;
}

function getSortedSubcategories(categoryName) {
    let subNames = [...new Set(allProducts.filter(p => p.category === categoryName).map(p => p.subcategory))];
    
    if (currentSortOrder === 'az') {
        subNames.sort((a, b) => a.localeCompare(b));
    } else if (currentSortOrder === 'za') {
        subNames.sort((a, b) => b.localeCompare(a));
    }
    
    return subNames;
}

function getSortedProducts(categoryName, subcategoryName) {
    let productsList = allProducts.filter(p => 
        p.category === categoryName && p.subcategory === subcategoryName
    );
    
    if (currentSortOrder === 'az') {
        productsList.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (currentSortOrder === 'za') {
        productsList.sort((a, b) => b.productName.localeCompare(a.productName));
    }
    
    return productsList;
}

function filterProductsBySearch(products) {
    if (!currentSearchTerm) return products;
    
    const searchLower = currentSearchTerm.toLowerCase();
    return products.filter(p => 
        p.productName.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.subcategory.toLowerCase().includes(searchLower)
    );
}

function renderCategories() {
    const categories = getSortedCategories();
    let hasVisibleContent = false;
    
    let html = '';
    
    categories.forEach(categoryName => {
        const categoryProducts = allProducts.filter(p => p.category === categoryName);
        const filteredCategoryProducts = filterProductsBySearch(categoryProducts);
        
        if (filteredCategoryProducts.length === 0 && currentSearchTerm) return;
        
        hasVisibleContent = true;
        
        const subcategories = getSortedSubcategories(categoryName);
        const totalCategoryProducts = categoryProducts.length;
        const selectedInCategory = categoryProducts.filter(p => orderState[p.id]?.selected).length;
        const isExpanded = expandedCategories.has(categoryName);
        const isAllSelected = selectedInCategory === totalCategoryProducts && totalCategoryProducts > 0;
        const isSomeSelected = selectedInCategory > 0 && !isAllSelected;
        
        html += `
            <div class="category-card ${isExpanded ? 'expanded' : ''}" data-category="${categoryName}">
                <div class="category-header" data-action="toggle-category" data-category="${categoryName}">
                    <div class="category-checkbox-wrapper">
                        <input type="checkbox" class="category-checkbox" 
                               data-action="select-category" 
                               data-category="${categoryName}"
                               ${isAllSelected ? 'checked' : ''}
                               ${isSomeSelected ? 'data-indeterminate="true"' : ''}>
                    </div>
                    <div class="category-title">
                        ${categoryName}
                        <span class="category-badge">${totalCategoryProducts}</span>
                    </div>
                    <span class="category-arrow">▶</span>
                </div>
                <div class="category-content">
                    ${subcategories.map(subName => {
                        const subProducts = getSortedProducts(categoryName, subName);
                        const filteredSubProducts = filterProductsBySearch(subProducts);
                        
                        if (filteredSubProducts.length === 0 && currentSearchTerm) return '';
                        
                        const totalSubProducts = subProducts.length;
                        const selectedInSub = subProducts.filter(p => orderState[p.id]?.selected).length;
                        const isSubExpanded = expandedSubcategories.has(`${categoryName}_${subName}`);
                        const isSubAllSelected = selectedInSub === totalSubProducts && totalSubProducts > 0;
                        const isSubSomeSelected = selectedInSub > 0 && !isSubAllSelected;
                        
                        return `
                            <div class="subcategory-section ${isSubExpanded ? 'expanded' : ''}" 
                                 data-subcategory="${categoryName}_${subName}">
                                <div class="subcategory-header" data-action="toggle-subcategory" 
                                     data-category="${categoryName}" data-subcategory="${subName}">
                                    <input type="checkbox" class="subcategory-checkbox" 
                                           data-action="select-subcategory" 
                                           data-category="${categoryName}" 
                                           data-subcategory="${subName}"
                                           ${isSubAllSelected ? 'checked' : ''}
                                           ${isSubSomeSelected ? 'data-indeterminate="true"' : ''}>
                                    <span class="subcategory-title">
                                        ${subName}
                                        <span class="subcategory-badge">${totalSubProducts}</span>
                                    </span>
                                    <span class="subcategory-arrow">▶</span>
                                </div>
                                <div class="subcategory-products">
                                    ${filteredSubProducts.map(p => {
                                        const state = orderState[p.id];
                                        const isChecked = state?.selected || false;
                                        const qty = state?.quantity || 0;
                                        
                                        return `
                                            <div class="product-row ${isChecked ? 'checked' : ''}" data-product-id="${p.id}">
                                                <input type="checkbox" class="product-checkbox" 
                                                       data-action="toggle-product" 
                                                       data-product-id="${p.id}"
                                                       ${isChecked ? 'checked' : ''}>
                                                <span class="product-name" data-action="toggle-product" data-product-id="${p.id}">
                                                    ${p.productName}
                                                </span>
                                                <div class="quantity-controls">
                                                    <button class="qty-btn minus" data-action="decrement" data-product-id="${p.id}">−</button>
                                                    <input type="number" class="qty-input" 
                                                           value="${qty}" min="0" 
                                                           data-action="qty-input" 
                                                           data-product-id="${p.id}">
                                                    <button class="qty-btn plus" data-action="increment" data-product-id="${p.id}">+</button>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    categoryListEl.innerHTML = html;
    
    // Update indeterminate states
    updateIndeterminateStates();
    
    // Show/hide empty state
    if (!hasVisibleContent) {
        emptyStateEl.classList.remove('hidden');
        emptyStateTextEl.textContent = currentSearchTerm ? 
            `No products found for "${currentSearchTerm}"` : 
            'No products found.';
    } else {
        emptyStateEl.classList.add('hidden');
    }
}

function updateIndeterminateStates() {
    // Category checkboxes
    document.querySelectorAll('.category-checkbox[data-indeterminate="true"]').forEach(cb => {
        cb.indeterminate = true;
    });
    document.querySelectorAll('.category-checkbox:not([data-indeterminate="true"])').forEach(cb => {
        cb.indeterminate = false;
    });
    
    // Subcategory checkboxes
    document.querySelectorAll('.subcategory-checkbox[data-indeterminate="true"]').forEach(cb => {
        cb.indeterminate = true;
    });
    document.querySelectorAll('.subcategory-checkbox:not([data-indeterminate="true"])').forEach(cb => {
        cb.indeterminate = false;
    });
}

// ============================================
// STATE MANAGEMENT
// ============================================
function updateProductState(productId, updates) {
    if (!orderState[productId]) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        orderState[productId] = {
            quantity: 0,
            selected: false,
            productName: product.productName,
            category: product.category,
            subcategory: product.subcategory
        };
    }
    
    Object.assign(orderState[productId], updates);
    
    // Validate consistency
    const state = orderState[productId];
    if (state.quantity > 0 && !state.selected) {
        state.selected = true;
    }
    if (state.quantity === 0 && state.selected) {
        state.selected = false;
    }
    if (state.selected && state.quantity < 1) {
        state.quantity = 1;
    }
    if (state.quantity < 0) {
        state.quantity = 0;
        state.selected = false;
    }
    
    saveStateToStorage();
    updateStats();
    updateOrderSummary();
}

function getVisibleProducts() {
    const visibleIds = new Set();
    
    document.querySelectorAll('.product-row').forEach(row => {
        visibleIds.add(row.dataset.productId);
    });
    
    return visibleIds;
}

function selectAllVisible() {
    const visibleIds = getVisibleProducts();
    visibleIds.forEach(id => {
        updateProductState(id, { selected: true, quantity: Math.max(1, orderState[id]?.quantity || 0) });
    });
    renderCategories();
    saveStateToStorage();
    showToast(`Selected ${visibleIds.size} products`, 'success');
}

function unselectAllVisible() {
    const visibleIds = getVisibleProducts();
    visibleIds.forEach(id => {
        updateProductState(id, { selected: false, quantity: 0 });
    });
    renderCategories();
    saveStateToStorage();
    showToast(`Unselected ${visibleIds.size} products`, 'info');
}

function selectCategory(categoryName, select = true) {
    const categoryProducts = allProducts.filter(p => p.category === categoryName);
    categoryProducts.forEach(p => {
        if (select) {
            updateProductState(p.id, { selected: true, quantity: Math.max(1, orderState[p.id]?.quantity || 1) });
        } else {
            updateProductState(p.id, { selected: false, quantity: 0 });
        }
    });
}

function selectSubcategory(categoryName, subcategoryName, select = true) {
    const subProducts = allProducts.filter(p => 
        p.category === categoryName && p.subcategory === subcategoryName
    );
    subProducts.forEach(p => {
        if (select) {
            updateProductState(p.id, { selected: true, quantity: Math.max(1, orderState[p.id]?.quantity || 1) });
        } else {
            updateProductState(p.id, { selected: false, quantity: 0 });
        }
    });
}

function clearOrder() {
    if (confirm('Clear entire order?')) {
        Object.keys(orderState).forEach(key => {
            orderState[key] = {
                ...orderState[key],
                quantity: 0,
                selected: false
            };
        });
        saveStateToStorage();
        renderCategories();
        updateStats();
        updateOrderSummary();
        showToast('Order cleared', 'info');
    }
}

// ============================================
// ORDER SUMMARY & COPY
// ============================================
function updateStats() {
    const totalProducts = allProducts.length;
    const selectedProducts = Object.values(orderState).filter(s => s.selected).length;
    const totalQuantity = Object.values(orderState).reduce((sum, s) => sum + (s.quantity || 0), 0);
    const totalCategories = new Set(allProducts.map(p => p.category)).size;
    
    statsProductsEl.textContent = totalProducts;
    statsSelectedEl.textContent = selectedProducts;
    statsQuantityEl.textContent = totalQuantity;
    statsCategoriesEl.textContent = totalCategories;
    
    selectedCounterSmallEl.textContent = `${selectedProducts} items`;
}

function updateOrderSummary() {
    const selectedItems = Object.entries(orderState)
        .filter(([id, state]) => state.selected && state.quantity > 0)
        .sort((a, b) => a[1].productName.localeCompare(b[1].productName));
    
    if (selectedItems.length === 0) {
        orderItemsListEl.innerHTML = '<span style="color: var(--text-light); font-size: 0.85rem;">No products selected</span>';
    } else {
        orderItemsListEl.innerHTML = selectedItems.map(([id, state]) => {
            return `
                <span class="order-item">
                    ${state.productName}
                    <span class="item-qty">${state.quantity}</span>
                </span>
            `;
        }).join('');
    }
}

function generateOrderText(format = 'simple') {
    const selectedItems = Object.entries(orderState)
        .filter(([id, state]) => state.selected && state.quantity > 0);
    
    if (selectedItems.length === 0) return '';
    
    let orderText = '';
    
    if (format === 'simple') {
        orderText = selectedItems
            .map(([id, state]) => `${state.productName} - ${state.quantity}`)
            .join('\n');
    } else if (format === 'numbered') {
        orderText = selectedItems
            .map(([id, state], index) => `${index + 1}. ${state.productName} - ${state.quantity}`)
            .join('\n');
    } else if (format === 'category') {
        const byCategory = {};
        
        selectedItems.forEach(([id, state]) => {
            const cat = state.category || 'Other';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(`${state.productName} - ${state.quantity}`);
        });
        
        const categoryOrder = Object.entries(byCategory)
            .sort((a, b) => a[0].localeCompare(b[0]));
        
        orderText = categoryOrder.map(([cat, items]) => {
            return `${cat.toUpperCase()}\n${items.join('\n')}`;
        }).join('\n\n');
    }
    
    return orderText;
}

async function copyOrderToClipboard() {
    const format = copyFormatSelect.value;
    const orderText = generateOrderText(format);
    
    if (!orderText) {
        showToast('No products selected to copy', 'warning');
        return;
    }
    
    try {
        // Try modern Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(orderText);
        } else {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = orderText;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        showToast('✓ Order copied to clipboard', 'success');
    } catch (err) {
        console.error('Copy failed:', err);
        showToast('Failed to copy order', 'error');
    }
}

// ============================================
// CSV IMPORT/EXPORT
// ============================================
function exportToCsv() {
    const csvRows = ['Category,Subcategory,Product'];
    
    allProducts.forEach(p => {
        csvRows.push(`${p.category},${p.subcategory},${p.productName}`);
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = 'products_export.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('Products exported to CSV', 'success');
}

function importFromCsv(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csvText = e.target.result;
            const lines = csvText.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                showToast('Invalid CSV: No data rows found', 'error');
                return;
            }
            
            // Parse header
            const header = lines[0].split(',').map(h => h.trim().toLowerCase());
            const categoryIdx = header.indexOf('category');
            const subcategoryIdx = header.indexOf('subcategory');
            const productIdx = header.indexOf('product');
            
            if (categoryIdx === -1 || subcategoryIdx === -1 || productIdx === -1) {
                showToast('Invalid CSV: Must have Category, Subcategory, Product columns', 'error');
                return;
            }
            
            const importedProducts = [];
            
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                
                if (cols.length >= 3) {
                    const category = cols[categoryIdx];
                    const subcategory = cols[subcategoryIdx];
                    const product = cols[productIdx];
                    
                    if (category && subcategory && product) {
                        importedProducts.push({ category, subcategory, product });
                    }
                }
            }
            
            if (importedProducts.length === 0) {
                showToast('No valid products found in CSV', 'error');
                return;
            }
            
            // Update the products array (from products.js)
            updateProductsArray(importedProducts);
            
            showToast(`✓ Imported ${importedProducts.length} products`, 'success');
            
        } catch (err) {
            console.error('CSV import error:', err);
            showToast('Failed to import CSV', 'error');
        }
    };
    
    reader.readAsText(file);
}

function updateProductsArray(importedData) {
    // Rebuild the products array structure
    const categoryMap = {};
    
    importedData.forEach(({ category, subcategory, product }) => {
        if (!categoryMap[category]) {
            categoryMap[category] = {};
        }
        if (!categoryMap[category][subcategory]) {
            categoryMap[category][subcategory] = [];
        }
        if (!categoryMap[category][subcategory].includes(product)) {
            categoryMap[category][subcategory].push(product);
        }
    });
    
    // Convert to the expected format
    const newProducts = [];
    
    Object.entries(categoryMap).forEach(([category, subcats]) => {
        const subcatEntries = Object.entries(subcats);
        
        if (subcatEntries.length === 1) {
            // Single subcategory
            newProducts.push({
                category: category,
                subcategory: subcatEntries[0][0],
                products: subcatEntries[0][1]
            });
        } else {
            // Multiple subcategories
            newProducts.push({
                category: category,
                subcategories: subcatEntries.map(([subName, prods]) => ({
                    name: subName,
                    products: prods
                }))
            });
        }
    });
    
    // Update the global products variable
    window.products = newProducts;
    
    // Rebuild everything
    buildProductIndex();
    renderCategories();
    updateStats();
    updateOrderSummary();
    saveStateToStorage();
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.trim();
        renderCategories();
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchTerm = '';
        renderCategories();
        searchInput.focus();
    });
    
    // Sort
    sortSelect.addEventListener('change', (e) => {
        currentSortOrder = e.target.value;
        renderCategories();
        saveStateToStorage();
    });
    
    // Copy order
    copyOrderBtn.addEventListener('click', copyOrderToClipboard);
    
    // Clear order
    clearOrderBtn.addEventListener('click', clearOrder);
    clearSavedOrderBtn.addEventListener('click', clearSavedOrder);
    
    // Select all / Unselect all
    selectAllVisibleBtn.addEventListener('click', selectAllVisible);
    unselectAllVisibleBtn.addEventListener('click', unselectAllVisible);
    
    // CSV export/import
    exportCsvBtn.addEventListener('click', exportToCsv);
    csvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importFromCsv(e.target.files[0]);
            e.target.value = '';
        }
    });
    
    // Event delegation for dynamic content
    categoryListEl.addEventListener('click', handleCategoryListClick);
    categoryListEl.addEventListener('change', handleCategoryListChange);
    categoryListEl.addEventListener('input', handleCategoryListInput);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleCategoryListClick(e) {
    const target = e.target;
    const action = target.dataset.action;
    
    if (!action) return;
    
    if (action === 'toggle-category') {
        const categoryName = target.dataset.category;
        const categoryCard = target.closest('.category-card');
        
        if (categoryCard) {
            if (expandedCategories.has(categoryName)) {
                expandedCategories.delete(categoryName);
            } else {
                expandedCategories.add(categoryName);
            }
            categoryCard.classList.toggle('expanded');
            saveStateToStorage();
        }
    } else if (action === 'toggle-subcategory') {
        const categoryName = target.dataset.category;
        const subcategoryName = target.dataset.subcategory;
        const subKey = `${categoryName}_${subcategoryName}`;
        const subSection = target.closest('.subcategory-section');
        
        if (subSection) {
            if (expandedSubcategories.has(subKey)) {
                expandedSubcategories.delete(subKey);
            } else {
                expandedSubcategories.add(subKey);
            }
            subSection.classList.toggle('expanded');
            saveStateToStorage();
        }
    } else if (action === 'toggle-product') {
        const productId = target.dataset.productId;
        const state = orderState[productId];
        
        if (state) {
            if (state.selected) {
                updateProductState(productId, { selected: false, quantity: 0 });
            } else {
                updateProductState(productId, { selected: true, quantity: Math.max(1, state.quantity || 1) });
            }
            renderCategories();
            saveStateToStorage();
        }
    } else if (action === 'increment') {
        const productId = target.dataset.productId;
        const state = orderState[productId];
        
        if (state) {
            const newQty = (state.quantity || 0) + 1;
            updateProductState(productId, { 
                quantity: newQty, 
                selected: true 
            });
            // Update the specific input without full re-render for performance
            const input = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
            const row = document.querySelector(`.product-row[data-product-id="${productId}"]`);
            if (input) input.value = newQty;
            if (row) row.classList.add('checked');
            const checkbox = document.querySelector(`.product-checkbox[data-product-id="${productId}"]`);
            if (checkbox) checkbox.checked = true;
            saveStateToStorage();
        }
    } else if (action === 'decrement') {
        const productId = target.dataset.productId;
        const state = orderState[productId];
        
        if (state && state.quantity > 0) {
            const newQty = state.quantity - 1;
            const willSelect = newQty > 0;
            
            updateProductState(productId, { 
                quantity: newQty, 
                selected: willSelect 
            });
            
            const input = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
            const row = document.querySelector(`.product-row[data-product-id="${productId}"]`);
            const checkbox = document.querySelector(`.product-checkbox[data-product-id="${productId}"]`);
            
            if (input) input.value = newQty;
            if (row && !willSelect) row.classList.remove('checked');
            if (checkbox) checkbox.checked = willSelect;
            saveStateToStorage();
        }
    } else if (action === 'select-category') {
        const categoryName = target.dataset.category;
        const isChecked = target.checked;
        selectCategory(categoryName, isChecked);
        renderCategories();
        saveStateToStorage();
    } else if (action === 'select-subcategory') {
        const categoryName = target.dataset.category;
        const subcategoryName = target.dataset.subcategory;
        const isChecked = target.checked;
        selectSubcategory(categoryName, subcategoryName, isChecked);
        renderCategories();
        saveStateToStorage();
    }
}

function handleCategoryListChange(e) {
    // Handled in click for checkbox changes
}

function handleCategoryListInput(e) {
    const target = e.target;
    
    if (target.classList.contains('qty-input')) {
        const productId = target.dataset.productId;
        let value = parseInt(target.value) || 0;
        
        if (value < 0) value = 0;
        target.value = value;
        
        updateProductState(productId, {
            quantity: value,
            selected: value > 0
        });
        
        const row = document.querySelector(`.product-row[data-product-id="${productId}"]`);
        const checkbox = document.querySelector(`.product-checkbox[data-product-id="${productId}"]`);
        
        if (row) {
            if (value > 0) row.classList.add('checked');
            else row.classList.remove('checked');
        }
        if (checkbox) checkbox.checked = value > 0;
        
        saveStateToStorage();
    }
}

function handleKeyboardShortcuts(e) {
    // '/' to focus search
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    
    // 'Escape' to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        currentSearchTerm = '';
        renderCategories();
        searchInput.blur();
    }
    
    // 'Ctrl+Enter' to copy order
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        copyOrderToClipboard();
    }
    
    // 'Ctrl+Shift+C' to clear order
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        clearOrder();
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove after animation
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 3000);
}

// ============================================
// RESTORE EXPANDED STATES
// ============================================
function restoreExpandedStates() {
    // Restore category expansion
    expandedCategories.forEach(categoryName => {
        const card = document.querySelector(`.category-card[data-category="${categoryName}"]`);
        if (card) card.classList.add('expanded');
    });
    
    // Restore subcategory expansion
    expandedSubcategories.forEach(subKey => {
        const [categoryName, subcategoryName] = subKey.split('_');
        const section = document.querySelector(`.subcategory-section[data-subcategory="${categoryName}_${subcategoryName}"]`);
        if (section) section.classList.add('expanded');
    });
}

// ============================================
// START THE APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', init);