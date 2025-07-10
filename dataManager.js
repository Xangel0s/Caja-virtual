// ================================
// DATA MANAGER - Sistema de Gestión de Datos
// ================================

class DataManager {
    constructor() {
        this.storageKeys = {
            operators: 'cashSystem_operators',
            products: 'cashSystem_products',
            sales: 'cashSystem_sales',
            cashSessions: 'cashSystem_cashSessions',
            closures: 'cashSystem_closures',
            config: 'cashSystem_config',
            currentSession: 'cashSystem_currentSession'
        };
        
        this.initializeDefaultData();
    }

    // ================================
    // INICIALIZACIÓN
    // ================================
    
    initializeDefaultData() {
        // Crear operarios por defecto si no existen
        if (!this.getOperators().length) {
            this.createDefaultOperators();
        }
        
        // Crear productos por defecto si no existen
        if (!this.getProducts().length) {
            this.createDefaultProducts();
        }
        
        // Crear configuración por defecto
        if (!this.getConfig()) {
            this.createDefaultConfig();
        }
    }
    
    createDefaultOperators() {
        const defaultOperators = [
            {
                id: this.generateId(),
                name: 'Administrador',
                role: 'admin',
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'Cajero Principal',
                role: 'cashier',
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        this.saveData(this.storageKeys.operators, defaultOperators);
    }
    
    createDefaultProducts() {
        const defaultProducts = [
            {
                id: this.generateId(),
                name: 'Café Americano',
                emoji: '☕',
                price: 5.00,
                stock: 100,
                category: 'Bebidas',
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'Galletas',
                emoji: '🍪',
                price: 3.50,
                stock: 50,
                category: 'Snacks',
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'Agua Mineral',
                emoji: '💧',
                price: 2.00,
                stock: 75,
                category: 'Bebidas',
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'Sandwich',
                emoji: '🥪',
                price: 8.50,
                stock: 30,
                category: 'Comida',
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'Chocolate',
                emoji: '🍫',
                price: 4.00,
                stock: 25,
                category: 'Snacks',
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        this.saveData(this.storageKeys.products, defaultProducts);
    }
    
    createDefaultConfig() {
        const defaultConfig = {
            storeName: 'Mi Tienda',
            currency: 'S/',
            taxRate: 0.18,
            lowStockThreshold: 10,
            receiptFooter: 'Gracias por su compra',
            printReceipts: true,
            autoLogout: 30, // minutos
            backupFrequency: 7 // días
        };
        
        this.saveData(this.storageKeys.config, defaultConfig);
    }

    // ================================
    // UTILIDADES GENERALES
    // ================================
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    formatCurrency(amount) {
        const config = this.getConfig();
        return `${config.currency}${amount.toFixed(2)}`;
    }
    
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }
    
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    // ================================
    // GESTIÓN DE OPERARIOS
    // ================================
    
    getOperators() {
        return this.getData(this.storageKeys.operators) || [];
    }
    
    getOperator(id) {
        return this.getOperators().find(op => op.id === id);
    }
    
    addOperator(operatorData) {
        const operators = this.getOperators();
        const newOperator = {
            id: this.generateId(),
            ...operatorData,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        operators.push(newOperator);
        this.saveData(this.storageKeys.operators, operators);
        return newOperator;
    }
    
    updateOperator(id, data) {
        const operators = this.getOperators();
        const index = operators.findIndex(op => op.id === id);
        
        if (index !== -1) {
            operators[index] = { ...operators[index], ...data, updatedAt: new Date().toISOString() };
            this.saveData(this.storageKeys.operators, operators);
            return operators[index];
        }
        return null;
    }
    
    deleteOperator(id) {
        const operators = this.getOperators();
        const filtered = operators.filter(op => op.id !== id);
        this.saveData(this.storageKeys.operators, filtered);
        return true;
    }

    // ================================
    // GESTIÓN DE PRODUCTOS
    // ================================
    
    getProducts() {
        return this.getData(this.storageKeys.products) || [];
    }
    
    getActiveProducts() {
        return this.getProducts().filter(product => product.active);
    }
    
    getProduct(id) {
        return this.getProducts().find(product => product.id === id);
    }
    
    addProduct(productData) {
        const products = this.getProducts();
        const newProduct = {
            id: this.generateId(),
            ...productData,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        this.saveData(this.storageKeys.products, products);
        return newProduct;
    }
    
    updateProduct(id, data) {
        const products = this.getProducts();
        const index = products.findIndex(product => product.id === id);
        
        if (index !== -1) {
            products[index] = { ...products[index], ...data, updatedAt: new Date().toISOString() };
            this.saveData(this.storageKeys.products, products);
            return products[index];
        }
        return null;
    }
    
    updateProductStock(id, newStock) {
        return this.updateProduct(id, { stock: newStock });
    }
    
    deleteProduct(id) {
        return this.updateProduct(id, { active: false });
    }

    // ================================
    // GESTIÓN DE VENTAS
    // ================================
    
    getSales() {
        return this.getData(this.storageKeys.sales) || [];
    }
    
    addSale(saleData) {
        const sales = this.getSales();
        const newSale = {
            id: this.generateId(),
            ...saleData,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };
        
        sales.push(newSale);
        this.saveData(this.storageKeys.sales, sales);
        
        // Actualizar stock de productos
        if (saleData.items) {
            saleData.items.forEach(item => {
                if (item.productId) {
                    const product = this.getProduct(item.productId);
                    if (product) {
                        this.updateProductStock(item.productId, product.stock - item.quantity);
                    }
                }
            });
        }
        
        return newSale;
    }
    
    getSalesByDate(date) {
        return this.getSales().filter(sale => sale.date === date);
    }
    
    getSalesByOperator(operatorId) {
        return this.getSales().filter(sale => sale.operatorId === operatorId);
    }
    
    deleteSale(saleId) {
        const sales = this.getSales();
        const saleIndex = sales.findIndex(sale => sale.id === saleId);
        
        if (saleIndex === -1) {
            throw new Error('Venta no encontrada');
        }
        
        // Eliminar la venta del array
        sales.splice(saleIndex, 1);
        
        // Guardar los cambios
        this.saveData(this.storageKeys.sales, sales);
        
        return true;
    }
    
    getSalesByDateRange(startDate, endDate) {
        return this.getSales().filter(sale => {
            return sale.date >= startDate && sale.date <= endDate;
        });
    }

    // ================================
    // GESTIÓN DE SESIONES DE CAJA
    // ================================
    
    getCurrentSession() {
        return this.getData(this.storageKeys.currentSession);
    }
    
    createCashSession(operatorId, initialAmount, notes = '') {
        const session = {
            id: this.generateId(),
            operatorId,
            operatorName: this.getOperator(operatorId)?.name || 'Desconocido',
            initialAmount,
            currentCashAmount: initialAmount,
            currentDigitalAmount: 0,
            notes,
            openedAt: new Date().toISOString(),
            isOpen: true,
            transactions: []
        };
        
        this.saveData(this.storageKeys.currentSession, session);
        return session;
    }
    
    updateSessionAmounts(cashAmount, digitalAmount) {
        const session = this.getCurrentSession();
        if (session) {
            session.currentCashAmount = cashAmount;
            session.currentDigitalAmount = digitalAmount;
            this.saveData(this.storageKeys.currentSession, session);
        }
        return session;
    }
    
    addSessionTransaction(transaction) {
        const session = this.getCurrentSession();
        if (session) {
            session.transactions.push({
                id: this.generateId(),
                ...transaction,
                timestamp: new Date().toISOString()
            });
            this.saveData(this.storageKeys.currentSession, session);
        }
        return session;
    }
    
    closeCashSession(realCashAmount, notes = '') {
        const session = this.getCurrentSession();
        if (!session) return null;
        
        const closedSession = {
            ...session,
            realCashAmount,
            closingNotes: notes,
            closedAt: new Date().toISOString(),
            isOpen: false,
            difference: realCashAmount - session.currentCashAmount
        };
        
        // Guardar en historial de cierres
        this.addClosure(closedSession);
        
        // Limpiar sesión actual
        localStorage.removeItem(this.storageKeys.currentSession);
        
        return closedSession;
    }

    // ================================
    // HISTORIAL DE CIERRES
    // ================================
    
    getClosures() {
        return this.getData(this.storageKeys.closures) || [];
    }
    
    addClosure(closureData) {
        const closures = this.getClosures();
        closures.push(closureData);
        this.saveData(this.storageKeys.closures, closures);
        return closureData;
    }

    // ================================
    // CONFIGURACIÓN
    // ================================
    
    getConfig() {
        return this.getData(this.storageKeys.config);
    }
    
    updateConfig(configData) {
        const currentConfig = this.getConfig() || {};
        const newConfig = { ...currentConfig, ...configData };
        this.saveData(this.storageKeys.config, newConfig);
        return newConfig;
    }

    // ================================
    // ESTADÍSTICAS Y REPORTES
    // ================================
    
    getDailySalesStats(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const sales = this.getSalesByDate(targetDate);
        
        let totalSales = 0;
        let totalAmount = 0;
        let cashAmount = 0;
        let digitalAmount = 0;
        let productsSold = 0;
        
        sales.forEach(sale => {
            totalAmount += sale.total;
            productsSold += sale.items.reduce((sum, item) => sum + item.quantity, 0);
            
            switch (sale.paymentMethod) {
                case 'cash':
                    cashAmount += sale.total;
                    break;
                case 'yape':
                case 'card':
                case 'transfer':
                    digitalAmount += sale.total;
                    break;
            }
        });
        
        totalSales = sales.length;
        
        return {
            date: targetDate,
            totalSales,
            totalAmount,
            cashAmount,
            digitalAmount,
            productsSold,
            averageTicket: totalSales > 0 ? totalAmount / totalSales : 0
        };
    }
    
    getTopProducts(limit = 5, dateRange = null) {
        let sales = this.getSales();
        
        if (dateRange) {
            sales = this.getSalesByDateRange(dateRange.start, dateRange.end);
        }
        
        const productStats = {};
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const key = item.productId || item.description;
                if (!productStats[key]) {
                    productStats[key] = {
                        name: item.productId ? this.getProduct(item.productId)?.name : item.description,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productStats[key].quantity += item.quantity;
                productStats[key].revenue += item.total;
            });
        });
        
        return Object.values(productStats)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit);
    }
    
    getOperatorStats(dateRange = null) {
        let sales = this.getSales();
        
        if (dateRange) {
            sales = this.getSalesByDateRange(dateRange.start, dateRange.end);
        }
        
        const operatorStats = {};
        
        sales.forEach(sale => {
            if (!operatorStats[sale.operatorId]) {
                operatorStats[sale.operatorId] = {
                    name: sale.operatorName,
                    sales: 0,
                    revenue: 0
                };
            }
            operatorStats[sale.operatorId].sales++;
            operatorStats[sale.operatorId].revenue += sale.total;
        });
        
        return Object.values(operatorStats)
            .sort((a, b) => b.revenue - a.revenue);
    }

    // ================================
    // RESPALDO Y RECUPERACIÓN
    // ================================
    
    exportData() {
        const data = {
            operators: this.getOperators(),
            products: this.getProducts(),
            sales: this.getSales(),
            closures: this.getClosures(),
            config: this.getConfig(),
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.operators) this.saveData(this.storageKeys.operators, data.operators);
            if (data.products) this.saveData(this.storageKeys.products, data.products);
            if (data.sales) this.saveData(this.storageKeys.sales, data.sales);
            if (data.closures) this.saveData(this.storageKeys.closures, data.closures);
            if (data.config) this.saveData(this.storageKeys.config, data.config);
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
    
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeDefaultData();
    }
}

// Crear instancia global
window.dataManager = new DataManager(); 