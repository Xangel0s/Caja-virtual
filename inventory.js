// ================================
// INVENTORY MANAGER - Sistema de Gestión de Inventario
// ================================

class InventoryManager {
    constructor() {
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        
        this.bindEvents();
    }

    // ================================
    // INICIALIZACIÓN Y EVENTOS
    // ================================
    
    bindEvents() {
        // Botón agregar producto
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showAddProductModal());
        }
        
        // Filtros y búsqueda (se implementarán cuando se cree la UI avanzada)
        this.bindFilterEvents();
    }
    
    bindFilterEvents() {
        // Buscar input de búsqueda cuando esté disponible
        const searchInput = document.querySelector('#inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.loadInventory();
            });
        }
        
        // Filtros de categoría - botones mejorados
        const categoryButtons = document.querySelectorAll('#inventory-section .category-filter-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Actualizar botón activo
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentFilter = btn.dataset.category;
                this.loadInventory();
            });
        });
        
        // Filtros de categoría en ventas
        const salesCategoryButtons = document.querySelectorAll('#product-sale-mode .category-filter-btn');
        salesCategoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Actualizar botón activo
                salesCategoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.loadProductsForSale(btn.dataset.category);
            });
        });
        
        // Ordenamiento
        const sortSelect = document.querySelector('#sort-inventory');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                this.sortBy = sortBy;
                this.sortOrder = sortOrder;
                this.loadInventory();
            });
        }
        
        // Botón agregar producto rápido
        const addProductQuickBtn = document.getElementById('add-product-quick-btn');
        if (addProductQuickBtn) {
            addProductQuickBtn.addEventListener('click', () => this.showAddProductModal(true));
        }
    }

    // ================================
    // CARGA Y VISUALIZACIÓN DE INVENTARIO
    // ================================
    
    loadInventory() {
        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) return;
        
        let products = window.dataManager.getActiveProducts();
        
        // Actualizar contadores de filtros
        this.updateCategoryCounters(products);
        
        // Aplicar filtros
        products = this.applyFilters(products);
        
        // Aplicar búsqueda
        if (this.searchTerm) {
            products = products.filter(product => 
                product.name.toLowerCase().includes(this.searchTerm) ||
                (product.category && product.category.toLowerCase().includes(this.searchTerm))
            );
        }
        
        // Aplicar ordenamiento
        products = this.sortProducts(products);
        
        if (products.length === 0) {
            inventoryList.innerHTML = this.getEmptyState();
            return;
        }
        
        // Renderizar productos
        inventoryList.innerHTML = products.map(product => this.createProductItem(product)).join('');
        
        // Actualizar estadísticas
        this.updateInventoryStats(products);
    }
    
    updateCategoryCounters(products) {
        const allProducts = products || window.dataManager.getActiveProducts();
        
        // Contar productos por categoría
        const counts = {
            all: allProducts.length,
            bebidas: 0,
            comidas: 0,
            otros: 0,
            'low-stock': 0,
            'out-of-stock': 0
        };
        
        const threshold = window.dataManager.getConfig()?.lowStockThreshold || 10;
        
        allProducts.forEach(product => {
            // Categorización inteligente
            const category = product.category || 'otros';
            if (category === 'bebidas' || category === 'drinks' ||
                (product.name && (product.name.toLowerCase().includes('bebida') ||
                 product.name.toLowerCase().includes('drink') ||
                 product.name.toLowerCase().includes('café') ||
                 product.name.toLowerCase().includes('té') ||
                 product.name.toLowerCase().includes('jugo') ||
                 product.name.toLowerCase().includes('refresco')))) {
                counts.bebidas++;
            } else if (category === 'comidas' || category === 'food' ||
                      (product.name && (product.name.toLowerCase().includes('comida') ||
                       product.name.toLowerCase().includes('food') ||
                       product.name.toLowerCase().includes('pizza') ||
                       product.name.toLowerCase().includes('burger') ||
                       product.name.toLowerCase().includes('sandwich')))) {
                counts.comidas++;
            } else {
                counts.otros++;
            }
            
            // Stock bajo y sin stock
            if (product.stock === 0) {
                counts['out-of-stock']++;
            } else if (product.stock <= threshold) {
                counts['low-stock']++;
            }
        });
        
        // Actualizar contadores en la UI
        this.updateFilterCounters(counts);
    }
    
    updateFilterCounters(counts) {
        const filters = [
            { category: 'all', count: counts.all },
            { category: 'bebidas', count: counts.bebidas },
            { category: 'comidas', count: counts.comidas },
            { category: 'otros', count: counts.otros },
            { category: 'low-stock', count: counts['low-stock'] },
            { category: 'out-of-stock', count: counts['out-of-stock'] }
        ];
        
        filters.forEach(filter => {
            const buttons = document.querySelectorAll(`[data-category="${filter.category}"]`);
            buttons.forEach(button => {
                const existingCounter = button.querySelector('.category-counter');
                if (existingCounter) {
                    existingCounter.remove();
                }
                
                if (filter.count > 0) {
                    const counter = document.createElement('span');
                    counter.className = 'category-counter';
                    counter.textContent = filter.count;
                    button.appendChild(counter);
                }
            });
        });
    }
    
    applyFilters(products) {
        if (this.currentFilter === 'all') return products;
        
        switch (this.currentFilter) {
            case 'low-stock':
                const threshold = window.dataManager.getConfig()?.lowStockThreshold || 10;
                return products.filter(product => product.stock <= threshold);
            case 'out-of-stock':
                return products.filter(product => product.stock === 0);
            case 'bebidas':
                return products.filter(product => 
                    product.category === 'bebidas' || 
                    product.category === 'drinks' ||
                    (product.name && product.name.toLowerCase().includes('bebida')) ||
                    (product.name && product.name.toLowerCase().includes('drink')) ||
                    (product.name && product.name.toLowerCase().includes('café')) ||
                    (product.name && product.name.toLowerCase().includes('té')) ||
                    (product.name && product.name.toLowerCase().includes('jugo')) ||
                    (product.name && product.name.toLowerCase().includes('refresco'))
                );
            case 'comidas':
                return products.filter(product => 
                    product.category === 'comidas' || 
                    product.category === 'food' ||
                    (product.name && product.name.toLowerCase().includes('comida')) ||
                    (product.name && product.name.toLowerCase().includes('food')) ||
                    (product.name && product.name.toLowerCase().includes('pizza')) ||
                    (product.name && product.name.toLowerCase().includes('burger')) ||
                    (product.name && product.name.toLowerCase().includes('sandwich'))
                );
            case 'otros':
                return products.filter(product => 
                    product.category === 'otros' || 
                    product.category === 'other' ||
                    product.category === 'objects' ||
                    (!product.category || 
                     (product.category !== 'bebidas' && product.category !== 'drinks' && 
                      product.category !== 'comidas' && product.category !== 'food'))
                );
            default:
                // Filtrar por categoría exacta
                return products.filter(product => product.category === this.currentFilter);
        }
    }
    
    sortProducts(products) {
        return products.sort((a, b) => {
            let valueA = a[this.sortBy];
            let valueB = b[this.sortBy];
            
            // Manejar valores numéricos
            if (this.sortBy === 'price' || this.sortBy === 'stock') {
                valueA = parseFloat(valueA) || 0;
                valueB = parseFloat(valueB) || 0;
            } else {
                // Manejar strings
                valueA = (valueA || '').toString().toLowerCase();
                valueB = (valueB || '').toString().toLowerCase();
            }
            
            if (this.sortOrder === 'desc') {
                return valueA < valueB ? 1 : -1;
            } else {
                return valueA > valueB ? 1 : -1;
            }
        });
    }
    
    getEmptyState() {
        if (this.searchTerm || this.currentFilter !== 'all') {
            return `
                <div class="empty-state">
                    <h3>🔍 No se encontraron productos</h3>
                    <p>Intenta ajustar los filtros de búsqueda</p>
                    <button class="action-btn secondary" onclick="inventoryManager.clearFilters()">
                        Limpiar Filtros
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="empty-state">
                <h3>📦 No hay productos en el inventario</h3>
                <p>Agrega productos para comenzar a vender</p>
                <button class="action-btn primary" onclick="inventoryManager.showAddProductModal()">
                    ➕ Agregar Primer Producto
                </button>
            </div>
        `;
    }
    
    createProductItem(product) {
        const lowStockThreshold = window.dataManager.getConfig()?.lowStockThreshold || 10;
        const stockClass = product.stock === 0 ? 'out' : product.stock <= lowStockThreshold ? 'low' : '';
        const stockText = product.stock === 0 ? 'Sin stock' : product.stock <= lowStockThreshold ? 'Stock bajo' : 'En stock';
        
        return `
            <div class="inventory-item" data-product-id="${product.id}">
                <div class="inventory-item-header">
                    <div class="inventory-item-title">
                        <span class="inventory-item-emoji">${product.emoji || '📦'}</span>
                        <span class="inventory-item-name">${product.name}</span>
                    </div>
                    <div class="inventory-item-actions">
                        <button class="edit-btn" onclick="inventoryManager.editProduct('${product.id}')" title="Editar">
                            ✏️
                        </button>
                        <button class="delete-btn" onclick="inventoryManager.deleteProduct('${product.id}')" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="inventory-item-details">
                    <div class="inventory-item-price">
                        💰 ${window.dataManager.formatCurrency(product.price)}
                    </div>
                    <div class="inventory-item-stock ${stockClass}">
                        📦 ${product.stock} unidades - ${stockText}
                    </div>
                    ${product.category ? `
                        <div class="inventory-item-category">
                            🏷️ ${product.category}
                        </div>
                    ` : ''}
                </div>
                <div class="inventory-item-actions-full">
                    <button class="action-btn secondary small" onclick="inventoryManager.adjustStock('${product.id}', 'add')">
                        ➕ Agregar Stock
                    </button>
                    <button class="action-btn warning small" onclick="inventoryManager.adjustStock('${product.id}', 'remove')">
                        ➖ Quitar Stock
                    </button>
                    <button class="action-btn info small" onclick="inventoryManager.viewProductHistory('${product.id}')">
                        📊 Historial
                    </button>
                </div>
            </div>
        `;
    }

    // ================================
    // GESTIÓN DE PRODUCTOS
    // ================================
    
    showAddProductModal(isQuick = false) {
        const categories = this.getCategories();
        const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));
        categoryOptions.unshift({ value: '', label: 'Seleccionar categoría...' });
        
        const formHTML = `
            <form class="product-form">
                <div class="input-group">
                    <label>🎯 Emoji del Producto</label>
                    <div class="emoji-input-container">
                        <input type="text" name="emoji" id="product-emoji" placeholder="📦" readonly>
                        <button type="button" class="emoji-trigger-btn">
                            <span>😀</span>
                        </button>
                    </div>
                    <div class="help-text">Haz clic en el botón para seleccionar un emoji</div>
                </div>
                
                <div class="input-group">
                    <label>📝 Nombre del Producto *</label>
                    <input type="text" name="name" required placeholder="Ej: Café americano">
                </div>
                
                <div class="input-group">
                    <label>💰 Precio *</label>
                    <input type="number" name="price" required placeholder="0.00" step="0.01" min="0">
                </div>
                
                <div class="input-group">
                    <label>📦 Stock Inicial *</label>
                    <input type="number" name="stock" required placeholder="0" min="0">
                </div>
                
                <div class="input-group">
                    <label>🏷️ Categoría</label>
                    <select name="category">
                        <option value="">Seleccionar categoría...</option>
                        <option value="bebidas">🥤 Bebidas</option>
                        <option value="comidas">🍕 Comidas</option>
                        <option value="otros">📦 Otros</option>
                        ${categories.filter(cat => !['bebidas', 'comidas', 'otros'].includes(cat))
                            .map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="window.uiManager.closeModal()">
                        ❌ Cancelar
                    </button>
                    <button type="submit" class="action-btn primary">
                        ✅ Agregar Producto
                    </button>
                </div>
            </form>
        `;
        
        const modalTitle = isQuick ? '⚡ Agregar Producto Rápido' : '📦 Agregar Nuevo Producto';
        
        window.uiManager.showModal({
            title: modalTitle,
            body: formHTML
        });
        
        // Configurar formulario inmediatamente y usar fallback para eventos
        this.setupProductForm('add');
    }
    
    // Nueva función para configurar eventos de formularios de manera confiable
    setupProductForm(mode, productId = null) {
        console.log(`🔧 Configurando formulario de producto: mode=${mode}, productId=${productId}`);
        
        // Usar timeout para asegurar que el DOM esté listo
        setTimeout(() => {
            // Para formularios de edición, el ID del emoji input es diferente
            const emojiInputId = mode === 'edit' ? 'edit-product-emoji' : 'product-emoji';
            const emojiInput = document.getElementById(emojiInputId);
            const emojiBtn = document.querySelector('.emoji-trigger-btn');
            const form = document.querySelector('.product-form');
            
            if (!form) {
                console.error('❌ No se encontró el formulario de producto');
                return;
            }
            
            console.log('✅ Formulario encontrado, configurando eventos...');
            
            // Configurar emoji selector solo si existe
            if (emojiInput && emojiBtn && window.emojiSelector) {
                // Limpiar evento previo
                emojiBtn.onclick = null;
                
                // Configurar nuevo evento
                emojiBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎨 Abriendo selector de emojis...');
                    window.emojiSelector.open({
                        targetInput: emojiInput,
                        onSelect: (emoji) => {
                            emojiInput.value = emoji;
                            const span = emojiBtn.querySelector('span');
                            if (span) span.textContent = emoji;
                            console.log(`✅ Emoji seleccionado: ${emoji}`);
                        }
                    });
                });
            }
            
            // Configurar botón cancelar
            const cancelBtn = form.querySelector('.action-btn.secondary');
            if (cancelBtn) {
                // Limpiar eventos previos
                cancelBtn.onclick = null;
                
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('❌ Cancelando formulario de producto...');
                    if (window.uiManager) {
                        window.uiManager.closeModal();
                    }
                });
            }
            
            // Configurar envío del formulario - SIEMPRE configurar, sin verificaciones
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📤 Enviando formulario de producto...');
                
                // Obtener datos del formulario manualmente
                const nameInput = form.querySelector('input[name="name"]');
                const priceInput = form.querySelector('input[name="price"]');
                const stockInput = form.querySelector('input[name="stock"]');
                const categorySelect = form.querySelector('select[name="category"]');
                const emojiInputForm = form.querySelector('input[name="emoji"]');
                
                const data = {
                    name: nameInput ? nameInput.value : '',
                    price: priceInput ? priceInput.value : '0',
                    stock: stockInput ? stockInput.value : '0',
                    category: categorySelect ? categorySelect.value : '',
                    emoji: emojiInputForm ? emojiInputForm.value : '📦'
                };
                
                console.log('📋 Datos extraídos del formulario:', data);
                
                // Validar datos antes de enviar
                if (!data.name) {
                    window.uiManager.showNotification('El nombre del producto es requerido', 'error');
                    return;
                }
                
                if (!data.price || parseFloat(data.price) <= 0) {
                    window.uiManager.showNotification('El precio debe ser mayor a 0', 'error');
                    return;
                }
                
                if (!data.stock || parseInt(data.stock) < 0) {
                    window.uiManager.showNotification('El stock no puede ser negativo', 'error');
                    return;
                }
                
                // Procesar según modo
                if (mode === 'add') {
                    console.log('🆕 Procesando como agregar producto...');
                    this.handleAddProduct(data);
                } else if (mode === 'edit' && productId) {
                    console.log(`🔄 Procesando como editar producto ID: ${productId}...`);
                    this.handleEditProduct(productId, data);
                }
            });
            
            // También configurar el botón submit directamente
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 Botón submit clickeado, disparando evento submit...');
                    
                    // Disparar evento submit del formulario
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                });
            }
            
            console.log('✅ Eventos de formulario configurados exitosamente');
            
            // Focus en primer campo
            const firstInput = form.querySelector('input[name="name"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
    
    handleAddProduct(data) {
        console.log('🔄 Iniciando handleAddProduct con datos:', data);
        
        try {
            // Validaciones previas ya hechas en setupProductForm
            
            // Crear producto
            const productData = {
                name: data.name,
                price: parseFloat(data.price),
                stock: parseInt(data.stock),
                category: data.category || 'otros',
                emoji: data.emoji || '📦'
            };
            
            console.log('💾 Guardando producto con datos:', productData);
            
            const product = window.dataManager.addProduct(productData);
            if (product) {
                console.log('✅ Producto guardado exitosamente:', product);
                window.uiManager.showNotification('Producto agregado exitosamente', 'success');
                this.loadInventory();
                window.uiManager.closeModal();
                
                // Actualizar grid de productos en caja si está disponible
                if (window.cashRegister) {
                    window.cashRegister.loadProductsGrid();
                }
            } else {
                console.error('❌ Error al guardar el producto');
                window.uiManager.showNotification('Error al agregar el producto', 'error');
            }
        } catch (error) {
            console.error('❌ Error en handleAddProduct:', error);
            window.uiManager.showNotification('Error al procesar el producto', 'error');
        }
    }
    
    editProduct(id) {
        const product = window.dataManager.getProduct(id);
        if (!product) return;
        
        const categories = this.getCategories();
        const formHTML = `
            <form class="product-form">
                <div class="input-group">
                    <label>🎯 Emoji del Producto</label>
                    <div class="emoji-input-container">
                        <input type="text" name="emoji" id="edit-product-emoji" placeholder="📦" value="${product.emoji || '📦'}" readonly>
                        <button type="button" class="emoji-trigger-btn">
                            <span>${product.emoji || '😀'}</span>
                        </button>
                    </div>
                    <div class="help-text">Haz clic en el botón para seleccionar un emoji</div>
                </div>
                
                <div class="input-group">
                    <label>📝 Nombre del Producto *</label>
                    <input type="text" name="name" required placeholder="Ej: Café americano" value="${product.name}">
                </div>
                
                <div class="input-group">
                    <label>💰 Precio *</label>
                    <input type="number" name="price" required placeholder="0.00" step="0.01" min="0" value="${product.price}">
                </div>
                
                <div class="input-group">
                    <label>📦 Stock Actual *</label>
                    <input type="number" name="stock" required placeholder="0" min="0" value="${product.stock}">
                </div>
                
                <div class="input-group">
                    <label>🏷️ Categoría</label>
                    <select name="category">
                        <option value="">Seleccionar categoría...</option>
                        <option value="bebidas" ${product.category === 'bebidas' ? 'selected' : ''}>🥤 Bebidas</option>
                        <option value="comidas" ${product.category === 'comidas' ? 'selected' : ''}>🍕 Comidas</option>
                        <option value="otros" ${product.category === 'otros' ? 'selected' : ''}>📦 Otros</option>
                        ${categories.filter(cat => !['bebidas', 'comidas', 'otros'].includes(cat))
                            .map(cat => `<option value="${cat}" ${product.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="window.uiManager.closeModal()">
                        ❌ Cancelar
                    </button>
                    <button type="submit" class="action-btn primary">
                        ✅ Actualizar Producto
                    </button>
                </div>
            </form>
        `;
        
        window.uiManager.showModal({
            title: '✏️ Editar Producto',
            body: formHTML
        });
        
        // Configurar formulario con el nuevo sistema confiable
        this.setupProductForm('edit', id);
    }
    
    handleEditProduct(id, data) {
            // Validaciones
            if (parseFloat(data.price) <= 0) {
                window.uiManager.showNotification('El precio debe ser mayor a 0', 'error');
                return;
            }
            
            if (parseInt(data.stock) < 0) {
                window.uiManager.showNotification('El stock no puede ser negativo', 'error');
                return;
            }
            
            // Actualizar producto
            const productData = {
                ...data,
                price: parseFloat(data.price),
                stock: parseInt(data.stock)
            };
            
            const updated = window.dataManager.updateProduct(id, productData);
            if (updated) {
                window.uiManager.showNotification('Producto actualizado exitosamente', 'success');
                this.loadInventory();
                window.uiManager.closeModal();
                
                // Actualizar grid de productos en caja si está disponible
                if (window.cashRegister) {
                    window.cashRegister.loadProductsGrid();
                }
            }
    }
    
    deleteProduct(id) {
        const product = window.dataManager.getProduct(id);
        if (!product) return;
        
        window.uiManager.showConfirmDialog(
            `¿Estás seguro que quieres eliminar "${product.name}"?<br><br>Este producto se desactivará pero se mantendrá en el historial de ventas.`,
            () => {
                if (window.dataManager.deleteProduct(id)) {
                    window.uiManager.showNotification('Producto eliminado exitosamente', 'success');
                    this.loadInventory();
                    
                    // Actualizar grid de productos en caja si está disponible
                    if (window.cashRegister) {
                        window.cashRegister.loadProductsGrid();
                    }
                }
            }
        );
    }

    // ================================
    // GESTIÓN DE STOCK
    // ================================
    
    adjustStock(id, action) {
        const product = window.dataManager.getProduct(id);
        if (!product) return;
        
        const actionText = action === 'add' ? 'Agregar Stock' : 'Quitar Stock';
        const placeholder = action === 'add' ? 'Cantidad a agregar' : 'Cantidad a quitar';
        
        const formHTML = window.uiManager.createForm([
            { type: 'number', name: 'quantity', label: 'Cantidad', required: true, placeholder: placeholder },
            { type: 'text', name: 'reason', label: 'Motivo', placeholder: 'Compra, ajuste, etc.' }
        ], (data) => {
            const quantity = parseInt(data.quantity);
            if (quantity <= 0) {
                window.uiManager.showNotification('La cantidad debe ser mayor a 0', 'error');
                return;
            }
            
            let newStock;
            if (action === 'add') {
                newStock = product.stock + quantity;
            } else {
                newStock = product.stock - quantity;
                if (newStock < 0) {
                    window.uiManager.showNotification('No hay suficiente stock disponible', 'error');
                    return;
                }
            }
            
            const updated = window.dataManager.updateProductStock(id, newStock);
            if (updated) {
                const message = action === 'add' 
                    ? `Se agregaron ${quantity} unidades al stock`
                    : `Se quitaron ${quantity} unidades del stock`;
                
                window.uiManager.showNotification(message, 'success');
                this.loadInventory();
                window.uiManager.closeModal();
                
                // Actualizar grid de productos en caja si está disponible
                if (window.cashRegister) {
                    window.cashRegister.loadProductsGrid();
                }
            }
        }, actionText);
        
        window.uiManager.showModal({
            title: `📦 ${actionText} - ${product.name}`,
            body: formHTML
        });
    }
    
    viewProductHistory(id) {
        const product = window.dataManager.getProduct(id);
        if (!product) return;
        
        // Obtener historial de ventas del producto
        const sales = window.dataManager.getSales();
        const productSales = sales.filter(sale => 
            sale.items.some(item => item.productId === id)
        );
        
        let historyHTML = `
            <div class="product-history">
                <h4>📊 Historial de ${product.name}</h4>
                <div class="history-stats">
                    <div class="stat-item">
                        <span>Total vendido:</span>
                        <span>${this.calculateTotalSold(productSales, id)} unidades</span>
                    </div>
                    <div class="stat-item">
                        <span>Ingresos totales:</span>
                        <span>${window.dataManager.formatCurrency(this.calculateTotalRevenue(productSales, id))}</span>
                    </div>
                    <div class="stat-item">
                        <span>Stock actual:</span>
                        <span>${product.stock} unidades</span>
                    </div>
                </div>
        `;
        
        if (productSales.length > 0) {
            historyHTML += `
                <h5>Últimas ventas:</h5>
                <div class="recent-sales">
                    ${productSales.slice(-10).reverse().map(sale => {
                        const item = sale.items.find(item => item.productId === id);
                        const date = new Date(sale.timestamp).toLocaleDateString('es-ES');
                        const time = new Date(sale.timestamp).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
                        return `
                            <div class="sale-entry">
                                <span>${date} ${time}</span>
                                <span>${item.quantity} unidades</span>
                                <span>${window.dataManager.formatCurrency(item.total)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            historyHTML += '<p>No hay ventas registradas para este producto.</p>';
        }
        
        historyHTML += '</div>';
        
        window.uiManager.showModal({
            title: '📊 Historial del Producto',
            body: historyHTML,
            footer: '<button class="action-btn secondary" onclick="uiManager.closeModal()">Cerrar</button>'
        });
    }

    // ================================
    // UTILIDADES
    // ================================
    
    getCategories() {
        const products = window.dataManager.getProducts();
        const categories = new Set();
        
        products.forEach(product => {
            if (product.category) {
                categories.add(product.category);
            }
        });
        
        return Array.from(categories).sort();
    }
    
    calculateTotalSold(sales, productId) {
        let total = 0;
        sales.forEach(sale => {
            const item = sale.items.find(item => item.productId === productId);
            if (item) {
                total += item.quantity;
            }
        });
        return total;
    }
    
    calculateTotalRevenue(sales, productId) {
        let total = 0;
        sales.forEach(sale => {
            const item = sale.items.find(item => item.productId === productId);
            if (item) {
                total += item.total;
            }
        });
        return total;
    }
    
    updateInventoryStats(products) {
        // Estadísticas básicas del inventario
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
        const lowStockItems = products.filter(product => {
            const threshold = window.dataManager.getConfig()?.lowStockThreshold || 10;
            return product.stock <= threshold && product.stock > 0;
        }).length;
        const outOfStockItems = products.filter(product => product.stock === 0).length;
        
        // Actualizar UI si hay elementos de estadísticas
        this.updateStatElement('total-products', totalProducts);
        this.updateStatElement('total-inventory-value', window.dataManager.formatCurrency(totalValue));
        this.updateStatElement('low-stock-items', lowStockItems);
        this.updateStatElement('out-of-stock-items', outOfStockItems);
    }
    
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    clearFilters() {
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        
        // Limpiar controles de UI
        const searchInput = document.querySelector('#inventory-search');
        if (searchInput) searchInput.value = '';
        
        const categoryFilter = document.querySelector('#category-filter');
        if (categoryFilter) categoryFilter.value = 'all';
        
        const sortSelect = document.querySelector('#sort-inventory');
        if (sortSelect) sortSelect.value = 'name-asc';
        
        this.loadInventory();
    }
    
    // Método para obtener productos para la caja registradora
    getProductsForSale() {
        return window.dataManager.getActiveProducts().filter(product => product.stock > 0);
    }
    
    // Verificar disponibilidad de stock
    checkStock(productId, quantity) {
        const product = window.dataManager.getProduct(productId);
        return product && product.stock >= quantity;
    }
    
    // Reducir stock después de una venta
    reduceStock(productId, quantity) {
        const product = window.dataManager.getProduct(productId);
        if (product && product.stock >= quantity) {
            return window.dataManager.updateProductStock(productId, product.stock - quantity);
        }
        return false;
    }
    
    // ================================
    // CARGA DE PRODUCTOS PARA VENTAS
    // ================================
    
    loadProductsForSale(category = 'all') {
        const productsGrid = document.getElementById('products-quick-grid');
        if (!productsGrid) return;
        
        let products = window.dataManager.getActiveProducts();
        
        // Aplicar filtro de categoría
        if (category !== 'all') {
            const tempFilter = this.currentFilter;
            this.currentFilter = category;
            products = this.applyFilters(products);
            this.currentFilter = tempFilter;
        }
        
        // Ordenar productos por popularidad o alfabéticamente
        products = products.sort((a, b) => a.name.localeCompare(b.name));
        
        if (products.length === 0) {
            productsGrid.innerHTML = this.getEmptyProductsForSale();
            return;
        }
        
        // Renderizar productos para ventas
        productsGrid.innerHTML = products.map(product => this.createProductForSale(product)).join('');
        
        // Bind events para los productos
        this.bindProductSaleEvents();
    }
    
    createProductForSale(product) {
        const lowStockThreshold = window.dataManager.getConfig()?.lowStockThreshold || 10;
        const stockClass = product.stock === 0 ? 'out-of-stock' : product.stock <= lowStockThreshold ? 'low-stock' : '';
        
        return `
            <div class="product-quick-item ${stockClass}" data-product-id="${product.id}">
                <div class="product-emoji">${product.emoji || '📦'}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">${window.dataManager.formatCurrency(product.price)}</div>
                <div class="product-stock ${product.stock === 0 ? 'out' : product.stock <= lowStockThreshold ? 'low' : ''}">
                    📦 ${product.stock} unidades
                </div>
            </div>
        `;
    }
    
    getEmptyProductsForSale() {
        return `
            <div class="empty-products">
                <div class="empty-icon">📦</div>
                <h3>No hay productos disponibles</h3>
                <p>Agrega productos al inventario para mostrarlos aquí</p>
                <button class="action-btn primary" onclick="inventoryManager.showAddProductModal()">
                    ➕ Agregar Producto
                </button>
            </div>
        `;
    }
    
    bindProductSaleEvents() {
        const productItems = document.querySelectorAll('#products-quick-grid .product-quick-item');
        productItems.forEach(item => {
            item.addEventListener('click', () => {
                const productId = item.dataset.productId;
                const product = window.dataManager.getProduct(productId);
                
                if (product && product.stock > 0) {
                    // Agregar al carrito de ventas
                    if (window.cashRegister) {
                        window.cashRegister.addProductToCart(product);
                    }
                } else {
                    if (window.uiManager) {
                        window.uiManager.showNotification('Producto sin stock', 'warning');
                    }
                }
            });
        });
    }
}

// Crear instancia global
window.inventoryManager = new InventoryManager(); 