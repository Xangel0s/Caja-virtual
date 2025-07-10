// ================================
// CASH REGISTER - Sistema de Caja Registradora
// ================================

class CashRegister {
    constructor() {
        this.currentCart = [];
        this.isOpen = false;
        this.currentSession = null;
        this.saleMode = 'quick'; // 'quick' o 'products'
        this.selectedPaymentMethod = null;
        
        this.bindEvents();
        this.loadCashStatus();
    }

    // ================================
    // INICIALIZACIÓN Y EVENTOS
    // ================================
    
    bindEvents() {
        // Apertura de caja
        const openCashBtn = document.getElementById('open-cash-btn');
        if (openCashBtn) {
            openCashBtn.addEventListener('click', () => this.openCash());
        }
        
        // Cierre de caja
        const closeCashBtn = document.getElementById('close-cash-btn');
        if (closeCashBtn) {
            closeCashBtn.addEventListener('click', () => this.showCloseCashModal());
        }
        
        // Modos de venta
        const quickSaleBtn = document.getElementById('quick-sale-btn');
        const productSaleBtn = document.getElementById('product-sale-btn');
        
        if (quickSaleBtn) {
            quickSaleBtn.addEventListener('click', () => this.setSaleMode('quick'));
        }
        
        if (productSaleBtn) {
            productSaleBtn.addEventListener('click', () => this.setSaleMode('products'));
        }
        
        // Venta rápida
        const addQuickSaleBtn = document.getElementById('add-quick-sale-btn');
        if (addQuickSaleBtn) {
            addQuickSaleBtn.addEventListener('click', () => this.addQuickSale());
        }
        
        // Carrito
        const clearCartBtn = document.getElementById('clear-cart-btn');
        const showPaymentBtn = document.getElementById('show-payment-btn');
        const cancelSaleBtn = document.getElementById('cancel-sale-btn');
        
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }
        
        if (showPaymentBtn) {
            showPaymentBtn.addEventListener('click', () => this.showPaymentMethods());
        }
        
        if (cancelSaleBtn) {
            cancelSaleBtn.addEventListener('click', () => this.cancelSale());
        }
        
        // Métodos de pago
        this.bindPaymentEvents();
        
        // Movimientos de efectivo
        const cashInBtn = document.getElementById('cash-in-btn');
        const cashOutBtn = document.getElementById('cash-out-btn');
        const viewMovementsBtn = document.getElementById('view-movements-btn');
        
        if (cashInBtn) {
            cashInBtn.addEventListener('click', () => this.showCashMovementModal('in'));
        }
        
        if (cashOutBtn) {
            cashOutBtn.addEventListener('click', () => this.showCashMovementModal('out'));
        }
        
        if (viewMovementsBtn) {
            viewMovementsBtn.addEventListener('click', () => this.showCashMovementsHistory());
        }
        
        // Enter en campos de venta rápida
        this.bindQuickSaleEvents();
    }
    
    bindPaymentEvents() {
        const paymentButtons = document.querySelectorAll('.payment-btn');
        paymentButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const method = btn.dataset.method;
                this.selectPaymentMethod(method);
            });
        });
    }
    
    bindQuickSaleEvents() {
        const quickDescription = document.getElementById('quick-description');
        const quickPrice = document.getElementById('quick-price');
        
        if (quickDescription) {
            quickDescription.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    quickPrice.focus();
                }
            });
        }
        
        if (quickPrice) {
            quickPrice.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addQuickSale();
                }
            });
        }
    }

    // ================================
    // GESTIÓN DE ESTADO DE CAJA
    // ================================
    
    loadCashStatus() {
        this.currentSession = window.dataManager.getCurrentSession();
        this.isOpen = this.currentSession && this.currentSession.isOpen;
        
        this.updateCashStatusUI();
        this.showCorrectPanel();
        
        if (this.isOpen) {
            this.loadProductsGrid();
            this.updateCashSummary();
        }
    }
    
    updateCashStatusUI() {
        const statusTitle = document.getElementById('cash-status-title');
        const statusOperator = document.getElementById('cash-operator');
        const cashAmount = document.getElementById('cash-amount');
        const digitalAmount = document.getElementById('digital-amount');
        const totalAmount = document.getElementById('total-amount');
        
        if (this.isOpen && this.currentSession) {
            if (statusTitle) statusTitle.textContent = '🔓 Caja Abierta';
            if (statusOperator) statusOperator.textContent = `👤 ${this.currentSession.operatorName}`;
            if (cashAmount) cashAmount.textContent = window.dataManager.formatCurrency(this.currentSession.currentCashAmount);
            if (digitalAmount) digitalAmount.textContent = window.dataManager.formatCurrency(this.currentSession.currentDigitalAmount);
            if (totalAmount) totalAmount.textContent = window.dataManager.formatCurrency(
                this.currentSession.currentCashAmount + this.currentSession.currentDigitalAmount
            );
            
            // Actualizar estado visual
            const statusCard = document.getElementById('cash-status');
            if (statusCard) statusCard.classList.add('open');
        } else {
            if (statusTitle) statusTitle.textContent = '🔒 Caja Cerrada';
            if (statusOperator) statusOperator.textContent = 'Sin operador';
            if (cashAmount) cashAmount.textContent = '$0.00';
            if (digitalAmount) digitalAmount.textContent = '$0.00';
            if (totalAmount) totalAmount.textContent = '$0.00';
            
            // Actualizar estado visual
            const statusCard = document.getElementById('cash-status');
            if (statusCard) statusCard.classList.remove('open');
        }
    }
    
    showCorrectPanel() {
        const openingPanel = document.getElementById('cash-opening-panel');
        const activePanel = document.getElementById('cash-active-panel');
        
        if (this.isOpen) {
            if (openingPanel) openingPanel.style.display = 'none';
            if (activePanel) activePanel.style.display = 'block';
        } else {
            if (openingPanel) openingPanel.style.display = 'block';
            if (activePanel) activePanel.style.display = 'none';
        }
    }

    // ================================
    // APERTURA Y CIERRE DE CAJA
    // ================================
    
    openCash() {
        const amountInput = document.getElementById('opening-amount');
        const notesInput = document.getElementById('opening-notes');
        
        const initialAmount = parseFloat(amountInput.value) || 0;
        const notes = notesInput.value.trim();
        
        if (initialAmount < 0) {
            window.uiManager.showNotification('El monto inicial no puede ser negativo', 'error');
            return;
        }
        
        const currentUser = window.authSystem.getCurrentUser();
        if (!currentUser) {
            window.uiManager.showNotification('Error: Usuario no autenticado', 'error');
            return;
        }
        
        // Crear sesión de caja
        this.currentSession = window.dataManager.createCashSession(
            currentUser.id,
            initialAmount,
            notes
        );
        
        this.isOpen = true;
        
        // Limpiar formulario
        amountInput.value = '';
        notesInput.value = '';
        
        // Actualizar UI
        this.updateCashStatusUI();
        this.showCorrectPanel();
        this.loadProductsGrid();
        this.updateCashSummary();
        
        window.uiManager.showNotification(
            `Caja abierta con ${window.dataManager.formatCurrency(initialAmount)}`, 
            'success'
        );
    }
    
    showCloseCashModal() {
        if (!this.isOpen || !this.currentSession) {
            window.uiManager.showNotification('No hay una caja abierta', 'error');
            return;
        }
        
        // Verificar si hay ventas pendientes
        if (this.currentCart.length > 0) {
            window.uiManager.showNotification('Completa o cancela la venta actual antes de cerrar la caja', 'warning');
            return;
        }
        
        this.showClosureModal();
    }
    
    showClosureModal() {
        const closeCashModal = document.getElementById('close-cash-modal');
        if (!closeCashModal) return;
        
        // Actualizar datos del modal
        this.updateClosureModalData();
        
        // Mostrar modal
        closeCashModal.style.display = 'flex';
        
        // Bind eventos si no están bindeados
        this.bindClosureModalEvents();
        
        // Focus en input de conteo manual
        const manualCountInput = document.getElementById('manual-cash-count');
        if (manualCountInput) {
            setTimeout(() => manualCountInput.focus(), 100);
        }
    }
    
    updateClosureModalData() {
        if (!this.currentSession) return;
        
        // Información del operador
        const operatorName = document.getElementById('close-operator-name');
        const openingTime = document.getElementById('close-opening-time');
        
        if (operatorName) operatorName.textContent = this.currentSession.operatorName;
        if (openingTime) {
            const openTime = new Date(this.currentSession.openedAt).toLocaleTimeString('es-ES');
            openingTime.textContent = openTime;
        }
        
        // Calcular montos por método de pago
        const todaySales = this.getTodaySales();
        const salesByMethod = this.groupSalesByPaymentMethod(todaySales);
        
        // Efectivo
        const initialCash = this.currentSession.initialAmount;
        const cashSales = salesByMethod.cash || 0;
        const cashIn = this.getCashMovements('in');
        const cashOut = this.getCashMovements('out');
        const expectedCash = initialCash + cashSales + cashIn - cashOut;
        
        // Actualizar elementos del modal
        this.updateClosureElement('close-initial-cash', initialCash);
        this.updateClosureElement('close-cash-sales', cashSales);
        this.updateClosureElement('close-cash-in', cashIn);
        this.updateClosureElement('close-cash-out', cashOut);
        this.updateClosureElement('close-expected-cash', expectedCash);
        
        // Pagos digitales
        this.updateClosureElement('close-yape-total', salesByMethod.yape || 0);
        this.updateClosureElement('close-card-total', salesByMethod.card || 0);
        this.updateClosureElement('close-transfer-total', salesByMethod.transfer || 0);
        this.updateClosureElement('close-total-digital', this.currentSession.currentDigitalAmount);
        
        // Total general
        const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
        this.updateClosureElement('close-total-sales', totalSales);
        
        // Configurar cálculo de diferencia
        this.setupDifferenceCalculation(expectedCash);
    }
    
    bindClosureModalEvents() {
        const confirmCloseBtn = document.getElementById('confirm-close-btn');
        const cancelCloseBtn = document.getElementById('cancel-close-btn');
        const manualCountInput = document.getElementById('manual-cash-count');
        
        // Limpiar eventos previos de forma más segura
        if (confirmCloseBtn) {
            confirmCloseBtn.onclick = null;
            confirmCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.confirmCloseCash();
            });
        }
        
        if (cancelCloseBtn) {
            cancelCloseBtn.onclick = null;
            cancelCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.cancelCloseCash();
            });
        }
        
        if (manualCountInput) {
            manualCountInput.oninput = null;
            manualCountInput.addEventListener('input', () => this.calculateCashDifference());
        }
    }
    
    setupDifferenceCalculation(expectedCash) {
        this.expectedCashAmount = expectedCash;
        this.calculateCashDifference();
    }
    
    calculateCashDifference() {
        const manualCountInput = document.getElementById('manual-cash-count');
        const diffElement = document.getElementById('cash-difference');
        const diffAmountElement = document.getElementById('diff-amount');
        
        if (!manualCountInput || !diffElement || !diffAmountElement) return;
        
        const manualCount = parseFloat(manualCountInput.value) || 0;
        const difference = manualCount - this.expectedCashAmount;
        
        diffAmountElement.textContent = window.dataManager.formatCurrency(Math.abs(difference));
        
        // Actualizar clase según diferencia
        diffElement.className = 'difference-display';
        
        if (difference === 0) {
            diffElement.classList.add('perfect');
            diffAmountElement.textContent = 'Exacto ✅';
        } else if (difference > 0) {
            diffElement.classList.add('excess');
            diffAmountElement.textContent = `Sobrante: ${window.dataManager.formatCurrency(difference)}`;
        } else {
            diffElement.classList.add('shortage');
            diffAmountElement.textContent = `Faltante: ${window.dataManager.formatCurrency(Math.abs(difference))}`;
        }
    }
    
    confirmCloseCash() {
        const manualCountInput = document.getElementById('manual-cash-count');
        const closingNotesInput = document.getElementById('closing-notes');
        
        const realCashAmount = parseFloat(manualCountInput.value);
        const notes = closingNotesInput.value.trim();
        
        if (isNaN(realCashAmount) || realCashAmount < 0) {
            window.uiManager.showNotification('Ingresa un monto válido para el efectivo contado', 'error');
            return;
        }
        
        // Cerrar sesión
        const closedSession = window.dataManager.closeCashSession(realCashAmount, notes);
        
        if (closedSession) {
            this.isOpen = false;
            this.currentSession = null;
            this.clearCart();
            
            // Actualizar UI
            this.updateCashStatusUI();
            this.showCorrectPanel();
            this.cancelCloseCash(); // Cerrar modal
            
            const difference = closedSession.difference;
            let message = 'Caja cerrada exitosamente';
            
            if (difference !== 0) {
                const diffType = difference > 0 ? 'sobrante' : 'faltante';
                message += ` (${diffType}: ${window.dataManager.formatCurrency(Math.abs(difference))})`;
            }
            
            window.uiManager.showNotification(message, 'success');
        }
    }
    
    cancelCloseCash() {
        const closeCashModal = document.getElementById('close-cash-modal');
        if (closeCashModal) {
            closeCashModal.style.display = 'none';
        }
        
        // Limpiar campos
        const manualCountInput = document.getElementById('manual-cash-count');
        const closingNotesInput = document.getElementById('closing-notes');
        
        if (manualCountInput) manualCountInput.value = '';
        if (closingNotesInput) closingNotesInput.value = '';
    }

    // ================================
    // MODOS DE VENTA
    // ================================
    
    setSaleMode(mode) {
        this.saleMode = mode;
        
        // Actualizar botones
        const quickBtn = document.getElementById('quick-sale-btn');
        const productBtn = document.getElementById('product-sale-btn');
        
        if (quickBtn) quickBtn.classList.toggle('active', mode === 'quick');
        if (productBtn) productBtn.classList.toggle('active', mode === 'products');
        
        // Mostrar/ocultar modos
        const quickMode = document.getElementById('quick-sale-mode');
        const productMode = document.getElementById('product-sale-mode');
        
        if (quickMode) quickMode.style.display = mode === 'quick' ? 'block' : 'none';
        if (productMode) productMode.style.display = mode === 'products' ? 'block' : 'none';
        
        // Cargar productos si es necesario
        if (mode === 'products') {
            this.loadProductsGrid();
        }
    }
    
    loadProductsGrid() {
        const productsGrid = document.getElementById('products-quick-grid');
        if (!productsGrid) return;
        
        const products = window.inventoryManager ? 
            window.inventoryManager.getProductsForSale() : 
            window.dataManager.getActiveProducts().filter(p => p.stock > 0);
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <p>📦 No hay productos disponibles</p>
                    <p>Agrega productos al inventario</p>
                </div>
            `;
            return;
        }
        
        productsGrid.innerHTML = products.map(product => this.createProductGridItem(product)).join('');
    }
    
    createProductGridItem(product) {
        const stockClass = product.stock <= 10 ? 'low' : '';
        
        return `
            <div class="product-quick-item ${stockClass}" onclick="cashRegister.addProductToCart('${product.id}')">
                <div class="product-emoji">${product.emoji || '📦'}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">${window.dataManager.formatCurrency(product.price)}</div>
                <div class="product-stock ${stockClass}">
                    Stock: ${product.stock}
                </div>
            </div>
        `;
    }

    // ================================
    // GESTIÓN DEL CARRITO
    // ================================
    
    addQuickSale() {
        const descriptionInput = document.getElementById('quick-description');
        const priceInput = document.getElementById('quick-price');
        
        const description = descriptionInput.value.trim();
        const price = parseFloat(priceInput.value);
        
        if (!description) {
            window.uiManager.showNotification('Ingresa una descripción', 'error');
            descriptionInput.focus();
            return;
        }
        
        if (!price || price <= 0) {
            window.uiManager.showNotification('Ingresa un precio válido', 'error');
            priceInput.focus();
            return;
        }
        
        const item = {
            id: window.dataManager.generateId(),
            description: description,
            price: price,
            quantity: 1,
            total: price,
            type: 'quick'
        };
        
        this.currentCart.push(item);
        
        // Limpiar campos
        descriptionInput.value = '';
        priceInput.value = '';
        descriptionInput.focus();
        
        this.updateCartUI();
        window.uiManager.showNotification('Producto agregado al carrito', 'success');
    }
    
    addProductToCart(productId) {
        const product = window.dataManager.getProduct(productId);
        if (!product) return;
        
        if (product.stock <= 0) {
            window.uiManager.showNotification('Producto sin stock', 'error');
            return;
        }
        
        // Verificar si ya está en el carrito
        const existingItem = this.currentCart.find(item => item.productId === productId);
        
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                window.uiManager.showNotification('No hay más stock disponible', 'warning');
                return;
            }
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            const item = {
                id: window.dataManager.generateId(),
                productId: productId,
                description: product.name,
                price: product.price,
                quantity: 1,
                total: product.price,
                type: 'product',
                emoji: product.emoji
            };
            this.currentCart.push(item);
        }
        
        this.updateCartUI();
        window.uiManager.showNotification(`${product.name} agregado al carrito`, 'success');
    }
    
    updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total-amount');
        const showPaymentBtn = document.getElementById('show-payment-btn');
        
        if (!cartItems) return;
        
        if (this.currentCart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>🛒 Carrito vacío</p>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = '$0.00';
            if (showPaymentBtn) showPaymentBtn.disabled = true;
            return;
        }
        
        cartItems.innerHTML = this.currentCart.map((item, index) => this.createCartItem(item, index)).join('');
        
        const total = this.currentCart.reduce((sum, item) => sum + item.total, 0);
        if (cartTotal) cartTotal.textContent = window.dataManager.formatCurrency(total);
        if (showPaymentBtn) showPaymentBtn.disabled = false;
    }
    
    createCartItem(item, index) {
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">
                        ${item.emoji ? item.emoji + ' ' : ''}${item.description}
                    </div>
                    <div class="cart-item-details">
                        ${window.dataManager.formatCurrency(item.price)} × ${item.quantity} = ${window.dataManager.formatCurrency(item.total)}
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" onclick="cashRegister.changeQuantity(${index}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="cashRegister.changeQuantity(${index}, 1)">+</button>
                    <button class="quantity-btn remove" onclick="cashRegister.removeItem(${index})">🗑️</button>
                </div>
            </div>
        `;
    }
    
    changeQuantity(index, change) {
        if (index < 0 || index >= this.currentCart.length) return;
        
        const item = this.currentCart[index];
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            this.removeItem(index);
            return;
        }
        
        // Verificar stock para productos
        if (item.productId) {
            const product = window.dataManager.getProduct(item.productId);
            if (product && newQuantity > product.stock) {
                window.uiManager.showNotification('No hay suficiente stock', 'warning');
                return;
            }
        }
        
        item.quantity = newQuantity;
        item.total = item.quantity * item.price;
        
        this.updateCartUI();
    }
    
    removeItem(index) {
        if (index >= 0 && index < this.currentCart.length) {
            this.currentCart.splice(index, 1);
            this.updateCartUI();
            window.uiManager.showNotification('Producto eliminado del carrito', 'info');
        }
    }
    
    clearCart() {
        if (this.currentCart.length > 0) {
            this.currentCart = [];
            this.updateCartUI();
            this.hidePaymentMethods();
            window.uiManager.showNotification('Carrito limpiado', 'info');
        }
    }
    
    cancelSale() {
        if (this.currentCart.length > 0) {
            window.uiManager.showConfirmDialog(
                '¿Estás seguro que quieres cancelar esta venta?',
                () => {
                    this.clearCart();
                    this.hidePaymentMethods();
                }
            );
        }
    }

    // ================================
    // MÉTODOS DE PAGO
    // ================================
    
    showPaymentMethods() {
        if (this.currentCart.length === 0) {
            window.uiManager.showNotification('El carrito está vacío', 'error');
            return;
        }
        
        const paymentMethods = document.getElementById('payment-methods');
        const showPaymentBtn = document.getElementById('show-payment-btn');
        const cancelSaleBtn = document.getElementById('cancel-sale-btn');
        
        if (paymentMethods) paymentMethods.style.display = 'block';
        if (showPaymentBtn) showPaymentBtn.style.display = 'none';
        if (cancelSaleBtn) cancelSaleBtn.style.display = 'block';
        
        // Reset selected payment method
        this.selectedPaymentMethod = null;
        this.updatePaymentButtonsUI();
    }
    
    hidePaymentMethods() {
        const paymentMethods = document.getElementById('payment-methods');
        const showPaymentBtn = document.getElementById('show-payment-btn');
        const cancelSaleBtn = document.getElementById('cancel-sale-btn');
        
        if (paymentMethods) paymentMethods.style.display = 'none';
        if (showPaymentBtn) showPaymentBtn.style.display = 'block';
        if (cancelSaleBtn) cancelSaleBtn.style.display = 'none';
        
        this.selectedPaymentMethod = null;
        this.updatePaymentButtonsUI();
    }
    
    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        this.updatePaymentButtonsUI();
        
        // Mostrar modal de confirmación
        setTimeout(() => this.showSaleConfirmationModal(), 200);
    }
    
    updatePaymentButtonsUI() {
        const paymentButtons = document.querySelectorAll('.payment-btn');
        paymentButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.method === this.selectedPaymentMethod);
        });
    }
    
    showSaleConfirmationModal() {
        const modal = document.getElementById('sale-confirmation-modal');
        if (!modal) return;
        
        const total = this.currentCart.reduce((sum, item) => sum + item.total, 0);
        
        // Actualizar información de la venta
        const itemsCount = document.getElementById('modal-items-count');
        const totalAmount = document.getElementById('modal-total-amount');
        const paymentMethod = document.getElementById('modal-payment-method');
        
        if (itemsCount) itemsCount.textContent = this.currentCart.length;
        if (totalAmount) totalAmount.textContent = window.dataManager.formatCurrency(total);
        if (paymentMethod) paymentMethod.textContent = this.getPaymentMethodName(this.selectedPaymentMethod);
        
        // Mostrar sección específica según método de pago
        this.setupPaymentSection(this.selectedPaymentMethod, total);
        
        // Mostrar modal
        modal.style.display = 'flex';
        
        // Bind eventos
        this.bindSaleConfirmationEvents();
    }
    
    setupPaymentSection(method, total) {
        const cashSection = document.getElementById('cash-payment-section');
        const digitalSection = document.getElementById('digital-payment-section');
        
        // Ocultar todas las secciones primero
        if (cashSection) cashSection.style.display = 'none';
        if (digitalSection) digitalSection.style.display = 'none';
        
        if (method === 'cash') {
            if (cashSection) {
                cashSection.style.display = 'block';
                const cashReceived = document.getElementById('cash-received');
                if (cashReceived) {
                    cashReceived.value = total.toFixed(2);
                    cashReceived.addEventListener('input', () => this.calculateChange());
                    setTimeout(() => cashReceived.focus(), 100);
                }
                this.calculateChange();
            }
        } else {
            if (digitalSection) {
                digitalSection.style.display = 'block';
                const referenceInput = document.getElementById('payment-reference');
                if (referenceInput) {
                    setTimeout(() => referenceInput.focus(), 100);
                }
            }
        }
    }
    
    calculateChange() {
        const cashReceived = document.getElementById('cash-received');
        const changeAmount = document.getElementById('change-amount');
        
        if (!cashReceived || !changeAmount) return;
        
        const total = this.currentCart.reduce((sum, item) => sum + item.total, 0);
        const received = parseFloat(cashReceived.value) || 0;
        const change = received - total;
        
        changeAmount.textContent = window.dataManager.formatCurrency(Math.max(0, change));
        
        // Actualizar estado del botón de confirmar
        const confirmBtn = document.getElementById('confirm-sale-btn');
        if (confirmBtn) {
            confirmBtn.disabled = received < total;
        }
    }
    
    bindSaleConfirmationEvents() {
        const confirmBtn = document.getElementById('confirm-sale-btn');
        const cancelBtn = document.getElementById('cancel-sale-modal-btn');
        
        // Limpiar eventos previos de forma más segura
        if (confirmBtn) {
            // Crear un nuevo event listener sin reemplazar el elemento
            confirmBtn.onclick = null; // Limpiar onclick previo
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.confirmSale();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.onclick = null; // Limpiar onclick previo
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.cancelSaleModal();
            });
        }
    }
    
    confirmSale() {
        const total = this.currentCart.reduce((sum, item) => sum + item.total, 0);
        let cashReceived = 0;
        let paymentReference = '';
        
        // Validaciones específicas por método de pago
        if (this.selectedPaymentMethod === 'cash') {
            const cashInput = document.getElementById('cash-received');
            cashReceived = parseFloat(cashInput.value) || 0;
            
            if (cashReceived < total) {
                window.uiManager.showNotification('El efectivo recibido es insuficiente', 'error');
                return;
            }
        } else {
            const referenceInput = document.getElementById('payment-reference');
            paymentReference = referenceInput.value.trim();
        }
        
        // Crear venta
        const saleData = {
            operatorId: window.authSystem.getCurrentUser().id,
            operatorName: window.authSystem.getCurrentUser().name,
            items: this.currentCart.map(item => ({...item})),
            total: total,
            paymentMethod: this.selectedPaymentMethod,
            cashReceived: cashReceived,
            change: this.selectedPaymentMethod === 'cash' ? cashReceived - total : 0,
            reference: paymentReference
        };
        
        const sale = window.dataManager.addSale(saleData);
        
        if (sale) {
            // Actualizar montos de la sesión
            this.updateSessionAmounts(sale);
            
            // Limpiar carrito y UI
            this.clearCart();
            this.cancelSaleModal();
            this.hidePaymentMethods();
            
            // Actualizar UI de caja
            this.updateCashStatusUI();
            this.updateCashSummary();
            
            // Recargar grid de productos (stock actualizado)
            this.loadProductsGrid();
            
            // Notificación de éxito
            let message = `Venta completada: ${window.dataManager.formatCurrency(total)}`;
            if (this.selectedPaymentMethod === 'cash' && saleData.change > 0) {
                message += ` (Cambio: ${window.dataManager.formatCurrency(saleData.change)})`;
            }
            window.uiManager.showNotification(message, 'success');
        }
    }
    
    cancelSaleModal() {
        const modal = document.getElementById('sale-confirmation-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Limpiar campos
        const cashReceived = document.getElementById('cash-received');
        const paymentReference = document.getElementById('payment-reference');
        
        if (cashReceived) cashReceived.value = '';
        if (paymentReference) paymentReference.value = '';
    }

    // ================================
    // MOVIMIENTOS DE EFECTIVO
    // ================================
    
    showCashMovementModal(type) {
        if (!this.isOpen) {
            window.uiManager.showNotification('La caja debe estar abierta', 'error');
            return;
        }
        
        const actionText = type === 'in' ? 'Entrada de Efectivo' : 'Salida de Efectivo';
        const icon = type === 'in' ? '⬆️' : '⬇️';
        const buttonText = type === 'in' ? 'Registrar Entrada' : 'Registrar Salida';
        const buttonClass = type === 'in' ? 'success' : 'warning';
        
        const formHTML = `
            <form class="cash-movement-form">
                <div class="input-group">
                    <label>💰 Monto *</label>
                    <input type="number" name="amount" id="movement-amount" required placeholder="0.00" step="0.01" min="0.01" class="large-input">
                </div>
                
                <div class="input-group">
                    <label>📝 Concepto *</label>
                    <input type="text" name="concept" id="movement-concept" required placeholder="Ej: Cambio inicial, gastos, etc." class="large-input">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="window.uiManager.closeModal()">
                        ❌ Cancelar
                    </button>
                    <button type="submit" class="action-btn ${buttonClass}">
                        ${icon} ${buttonText}
                    </button>
                </div>
            </form>
        `;
        
        window.uiManager.showModal({
            title: `${icon} ${actionText}`,
            body: formHTML
        });
        
                 // Configurar eventos del formulario
         this.setupCashMovementForm(type);
     }
     
     setupCashMovementForm(type) {
         console.log(`🔧 Configurando formulario de movimiento: ${type}`);
         
         setTimeout(() => {
             const form = document.querySelector('.cash-movement-form');
             const amountInput = document.getElementById('movement-amount');
             
             if (!form) {
                 console.error('❌ No se encontró el formulario de movimientos');
                 return;
             }
             
             console.log('✅ Formulario de movimientos encontrado, configurando eventos...');
             
             // Focus en el input de monto
             if (amountInput) {
                 amountInput.focus();
             }
             
             // Configurar envío del formulario
             form.addEventListener('submit', (e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 
                 console.log('📤 Enviando formulario de movimiento...');
                 
                 // Obtener datos manualmente
                 const amountInputForm = document.getElementById('movement-amount');
                 const conceptInputForm = document.getElementById('movement-concept');
                 
                 const data = {
                     amount: amountInputForm ? amountInputForm.value : '',
                     concept: conceptInputForm ? conceptInputForm.value : ''
                 };
                 
                 console.log('📋 Datos del formulario:', data);
                 
                 this.handleCashMovement(type, data);
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
             
             // Enter en input de concepto para enviar
             const conceptInput = document.getElementById('movement-concept');
             if (conceptInput) {
                 conceptInput.addEventListener('keypress', (e) => {
                     if (e.key === 'Enter') {
                         e.preventDefault();
                         form.dispatchEvent(new Event('submit'));
                     }
                 });
             }
             
             console.log('✅ Eventos de formulario de movimientos configurados');
         }, 100);
     }
     
     handleCashMovement(type, data) {
         console.log(`🔄 Iniciando handleCashMovement tipo: ${type}, datos:`, data);
         
         try {
             const amount = parseFloat(data.amount);
             const concept = data.concept ? data.concept.trim() : '';
             
             console.log(`💰 Monto procesado: ${amount}, Concepto: "${concept}"`);
             
             if (!amount || amount <= 0) {
                 window.uiManager.showNotification('Ingresa un monto válido', 'error');
                 return;
             }
             
             if (!concept) {
                 window.uiManager.showNotification('Ingresa un concepto', 'error');
                 return;
             }
             
             // Verificar si hay suficiente efectivo para salidas
             if (type === 'out' && amount > this.currentSession.currentCashAmount) {
                 window.uiManager.showNotification('No hay suficiente efectivo en caja', 'error');
                 return;
             }
             
             // Actualizar monto de efectivo
             const newCashAmount = type === 'in' 
                 ? this.currentSession.currentCashAmount + amount
                 : this.currentSession.currentCashAmount - amount;
             
             console.log(`💵 Actualizando efectivo de ${this.currentSession.currentCashAmount} a ${newCashAmount}`);
             
             window.dataManager.updateSessionAmounts(newCashAmount, this.currentSession.currentDigitalAmount);
             
             // Registrar transacción
             const transaction = {
                 type: type === 'in' ? 'cash_in' : 'cash_out',
                 amount: amount,
                 description: concept,
                 timestamp: new Date().toISOString(),
                 operatorId: window.authSystem.getCurrentUser().id,
                 operatorName: window.authSystem.getCurrentUser().name
             };
             
             console.log('📝 Registrando transacción:', transaction);
             
             window.dataManager.addSessionTransaction(transaction);
             
             // Actualizar sesión local
             this.currentSession = window.dataManager.getCurrentSession();
             
             // Actualizar UI
             this.updateCashStatusUI();
             this.updateCashSummary();
             
             // Cerrar modal
             window.uiManager.closeModal();
             
             const actionText = type === 'in' ? 'entrada' : 'salida';
             window.uiManager.showNotification(
                 `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} de ${window.dataManager.formatCurrency(amount)} registrada`, 
                 'success'
             );
             
             console.log('✅ Movimiento de efectivo procesado exitosamente');
             
         } catch (error) {
             console.error('❌ Error en handleCashMovement:', error);
             window.uiManager.showNotification('Error al procesar el movimiento', 'error');
         }
     }
     
    // Funciones obsoletas eliminadas - ahora se usa handleCashMovement con el nuevo sistema de modales

    // ================================
    // UTILIDADES
    // ================================
    
    updateSessionAmounts(sale) {
        if (!this.currentSession) return;
        
        let newCashAmount = this.currentSession.currentCashAmount;
        let newDigitalAmount = this.currentSession.currentDigitalAmount;
        
        if (sale.paymentMethod === 'cash') {
            newCashAmount += sale.total;
        } else {
            newDigitalAmount += sale.total;
        }
        
        window.dataManager.updateSessionAmounts(newCashAmount, newDigitalAmount);
        this.currentSession = window.dataManager.getCurrentSession();
    }
    
    updateCashSummary() {
        const cashSummaryAmount = document.getElementById('cash-summary-amount');
        const digitalSummaryAmount = document.getElementById('digital-summary-amount');
        
        if (this.currentSession) {
            if (cashSummaryAmount) {
                cashSummaryAmount.textContent = window.dataManager.formatCurrency(this.currentSession.currentCashAmount);
            }
            if (digitalSummaryAmount) {
                digitalSummaryAmount.textContent = window.dataManager.formatCurrency(this.currentSession.currentDigitalAmount);
            }
        }
    }
    
    getPaymentMethodName(method) {
        const names = {
            cash: 'Efectivo',
            yape: 'Yape',
            card: 'Tarjeta',
            transfer: 'Transferencia'
        };
        return names[method] || method;
    }
    
    getTodaySales() {
        const today = new Date().toISOString().split('T')[0];
        return window.dataManager.getSalesByDate(today);
    }
    
    groupSalesByPaymentMethod(sales) {
        const grouped = {};
        sales.forEach(sale => {
            if (!grouped[sale.paymentMethod]) {
                grouped[sale.paymentMethod] = 0;
            }
            grouped[sale.paymentMethod] += sale.total;
        });
        return grouped;
    }
    
    getCashMovements(type) {
        if (!this.currentSession || !this.currentSession.transactions) return 0;
        
        const transactionType = type === 'in' ? 'cash_in' : 'cash_out';
        return this.currentSession.transactions
            .filter(t => t.type === transactionType)
            .reduce((sum, t) => sum + t.amount, 0);
    }
    
    updateClosureElement(id, amount) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = window.dataManager.formatCurrency(amount);
        }
    }
    
    // ================================
    // HISTORIAL DE MOVIMIENTOS
    // ================================
    
    showCashMovementsHistory() {
        if (!this.currentSession) {
            window.uiManager.showNotification('No hay una sesión activa', 'error');
            return;
        }
        
        const transactions = this.currentSession.transactions || [];
        const cashMovements = transactions.filter(t => t.type === 'cash_in' || t.type === 'cash_out');
        
        let historyHTML = `
            <div class="cash-movements-history">
                <div class="movements-header">
                    <h4>📋 Movimientos de Efectivo - ${new Date().toLocaleDateString()}</h4>
                    <div class="movements-summary">
                        <div class="summary-item success">
                            <span>Entradas:</span>
                            <span>${window.dataManager.formatCurrency(this.getCashMovements('in'))}</span>
                        </div>
                        <div class="summary-item danger">
                            <span>Salidas:</span>
                            <span>${window.dataManager.formatCurrency(this.getCashMovements('out'))}</span>
                        </div>
                    </div>
                </div>
        `;
        
        if (cashMovements.length === 0) {
            historyHTML += `
                <div class="no-movements">
                    <div class="no-movements-icon">💰</div>
                    <h3>No hay movimientos registrados</h3>
                    <p>Los movimientos de entrada y salida de efectivo aparecerán aquí</p>
                </div>
            `;
        } else {
            historyHTML += `
                <div class="movements-list">
                    ${cashMovements.map(movement => this.createMovementItem(movement)).join('')}
                </div>
            `;
        }
        
        historyHTML += `
                <div class="movements-actions">
                    <button class="action-btn secondary" onclick="window.uiManager.closeModal()">
                        ❌ Cerrar
                    </button>
                </div>
            </div>
        `;
        
        window.uiManager.showModal({
            title: '💰 Historial de Movimientos de Efectivo',
            body: historyHTML
        });
    }
    
    createMovementItem(movement) {
        const isIncome = movement.type === 'cash_in';
        const icon = isIncome ? '⬆️' : '⬇️';
        const typeClass = isIncome ? 'income' : 'expense';
        const typeText = isIncome ? 'Entrada' : 'Salida';
        const time = new Date(movement.timestamp || Date.now()).toLocaleTimeString();
        
        return `
            <div class="movement-item ${typeClass}">
                <div class="movement-header">
                    <div class="movement-type">
                        <span class="movement-icon">${icon}</span>
                        <span class="movement-label">${typeText}</span>
                    </div>
                    <div class="movement-amount ${typeClass}">
                        ${isIncome ? '+' : '-'}${window.dataManager.formatCurrency(movement.amount)}
                    </div>
                </div>
                <div class="movement-details">
                    <div class="movement-description">${movement.description}</div>
                    <div class="movement-meta">
                        <span class="movement-time">🕐 ${time}</span>
                        <span class="movement-operator">👤 ${movement.operatorName || 'Operario'}</span>
                    </div>
                </div>
                         </div>
         `;
     }
     
     // ================================
     // MÉTODOS AUXILIARES PARA MODALES - LIMPIEZA COMPLETADA
     // ================================
}

// Crear instancia global
window.cashRegister = new CashRegister(); 