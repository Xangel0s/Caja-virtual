// ================================
// SALES HISTORY MANAGER - Sistema de Historial de Ventas
// ================================

class SalesHistoryManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalPages = 1;
        this.filteredSales = [];
        this.charts = {};
        
        // Filtros
        this.filters = {
            dateFrom: '',
            dateTo: '',
            operator: '',
            product: '',
            minAmount: '',
            search: ''
        };
        
        this.sortBy = 'newest';
        this.currentTab = 'list';
        
        this.bindEvents();
    }

    // ================================
    // INICIALIZACIÓN Y EVENTOS
    // ================================
    
    bindEvents() {
        // Filtros
        const applyFiltersBtn = document.getElementById('apply-sales-filters-btn');
        const clearFiltersBtn = document.getElementById('clear-sales-filters-btn');
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
        
        // Búsqueda
        const searchInput = document.getElementById('sales-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.loadSalesHistory();
            });
        }
        
        // Ordenamiento
        const sortSelect = document.getElementById('sales-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.loadSalesHistory();
            });
        }
        
        // Paginación
        const prevPageBtn = document.getElementById('prev-page-btn');
        const nextPageBtn = document.getElementById('next-page-btn');
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.changePage(-1));
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.changePage(1));
        }
        
        // Pestañas de análisis
        const tabButtons = document.querySelectorAll('.analytics-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.showTab(tabName);
            });
        });
        
        // Exportar
        this.bindExportEvents();
    }
    
    bindExportEvents() {
        const exportCSVBtn = document.getElementById('export-sales-csv-btn');
        const exportPDFBtn = document.getElementById('export-sales-pdf-btn');
        
        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => this.exportToCSV());
        }
        
        if (exportPDFBtn) {
            exportPDFBtn.addEventListener('click', () => this.exportToPDF());
        }
    }

    // ================================
    // CARGA Y VISUALIZACIÓN
    // ================================
    
    loadSalesHistory() {
        // Obtener todas las ventas
        let sales = window.dataManager.getSales();
        
        // Aplicar filtros
        this.filteredSales = this.applyAllFilters(sales);
        
        // Aplicar ordenamiento
        this.filteredSales = this.sortSales(this.filteredSales);
        
        // Calcular paginación
        this.calculatePagination();
        
        // Actualizar UI según pestaña actual
        this.updateCurrentTab();
        
        // Actualizar resumen estadístico
        this.updateSalesSummary();
        
        // Cargar filtros dinámicos
        this.loadFilterOptions();
    }
    
    applyAllFilters(sales) {
        return sales.filter(sale => {
            // Filtro por fecha
            if (this.filters.dateFrom && sale.date < this.filters.dateFrom) return false;
            if (this.filters.dateTo && sale.date > this.filters.dateTo) return false;
            
            // Filtro por operario
            if (this.filters.operator && sale.operatorId !== this.filters.operator) return false;
            
            // Filtro por monto mínimo
            if (this.filters.minAmount && sale.total < parseFloat(this.filters.minAmount)) return false;
            
            // Filtro por producto
            if (this.filters.product) {
                const hasProduct = sale.items.some(item => 
                    item.productId === this.filters.product || 
                    item.description.toLowerCase().includes(this.filters.product.toLowerCase())
                );
                if (!hasProduct) return false;
            }
            
            // Búsqueda general
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const searchableText = [
                    sale.operatorName,
                    sale.paymentMethod,
                    sale.total.toString(),
                    ...sale.items.map(item => item.description)
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) return false;
            }
            
            return true;
        });
    }
    
    sortSales(sales) {
        return sales.sort((a, b) => {
            switch (this.sortBy) {
                case 'newest':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'oldest':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'highest':
                    return b.total - a.total;
                case 'lowest':
                    return a.total - b.total;
                default:
                    return 0;
            }
        });
    }
    
    calculatePagination() {
        this.totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }
        
        this.updatePaginationUI();
    }
    
    updatePaginationUI() {
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');
        
        if (pageInfo) {
            pageInfo.textContent = `Página ${this.currentPage} de ${this.totalPages}`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
        }
    }

    // ================================
    // PESTAÑAS DE ANÁLISIS
    // ================================
    
    showTab(tabName) {
        this.currentTab = tabName;
        
        // Actualizar botones de pestañas
        const tabButtons = document.querySelectorAll('.analytics-tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Mostrar contenido de pestaña
        const tabContents = document.querySelectorAll('.analytics-tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        // Cargar contenido específico
        this.updateCurrentTab();
    }
    
    updateCurrentTab() {
        switch (this.currentTab) {
            case 'list':
                this.updateSalesList();
                break;
            case 'products':
                this.updateProductsAnalysis();
                break;
            case 'operators':
                this.updateOperatorsAnalysis();
                break;
            case 'charts':
                this.updateChartsAnalysis();
                break;
        }
    }
    
    updateSalesList() {
        const salesList = document.getElementById('sales-list');
        if (!salesList) return;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageItems = this.filteredSales.slice(startIndex, endIndex);
        
        if (pageItems.length === 0) {
            salesList.innerHTML = this.getEmptyState();
            return;
        }

        // Mostrar skeleton loading
        salesList.innerHTML = this.generateLoadingSkeleton(Math.min(pageItems.length, 3));
        
        // Renderizar ventas con animación
        setTimeout(() => {
            salesList.innerHTML = pageItems.map(sale => this.createSaleItem(sale)).join('');
            
            // Agregar animaciones escalonadas
            const cards = salesList.querySelectorAll('.sale-item-detail');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('fade-in');
                
                // Agregar eventos de hover mejorados
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-3px)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                });
            });
        }, 200);
    }

    generateLoadingSkeleton(count) {
        return Array(count).fill().map(() => `
            <div class="loading-skeleton"></div>
        `).join('');
    }
    
    createSaleItem(sale) {
        const saleDate = new Date(sale.timestamp);
        const dateStr = saleDate.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const timeStr = saleDate.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const itemsCount = sale.items.length;
        const itemsText = itemsCount === 1 ? '1 producto' : `${itemsCount} productos`;
        
        // Obtener badge del método de pago
        const paymentBadge = this.getPaymentMethodBadge(sale.paymentMethod);
        
        // Calcular tiempo transcurrido
        const timeAgo = this.getTimeAgo(sale.timestamp);
        
        return `
            <div class="sale-item-detail" data-sale-id="${sale.id}">
                <div class="sale-item-header">
                    <div class="sale-item-info">
                        <h4>
                            <span class="sale-status-indicator completed"></span>
                            🛒 Venta #${sale.id.slice(-8).toUpperCase()}
                            ${paymentBadge}
                        </h4>
                        <p>
                            <i class="fas fa-user"></i> ${sale.operatorName} 
                            <span class="separator">•</span>
                            <i class="fas fa-calendar"></i> ${dateStr} ${timeStr}
                            <span class="separator">•</span>
                            <i class="fas fa-clock"></i> ${timeAgo}
                        </p>
                        <p>
                            <i class="fas fa-boxes"></i> ${itemsText}
                            ${sale.items.length > 1 ? `<span class="separator">•</span> <i class="fas fa-chart-line"></i> Promedio: ${window.dataManager.formatCurrency(sale.total / sale.items.length)}` : ''}
                        </p>
                    </div>
                    <div class="sale-item-actions">
                        <div class="sale-item-total">
                            ${window.dataManager.formatCurrency(sale.total)}
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn secondary" onclick="salesHistory.printSale('${sale.id}')" title="Imprimir ticket">
                                <i class="fas fa-print"></i>
                            </button>
                            <button class="action-btn danger" onclick="salesHistory.deleteSale('${sale.id}')" title="Eliminar venta">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="sale-item-content">
                    <div class="sale-products-list">
                        <h5><i class="fas fa-shopping-cart"></i> Productos vendidos:</h5>
                        ${sale.items.map(item => `
                            <div class="sale-product-item">
                                <div class="product-info">
                                    <span class="product-emoji">${item.emoji || '📦'}</span>
                                    <span class="product-name">${item.description}</span>
                                </div>
                                <div class="product-calculation">
                                    <span class="quantity">${item.quantity}</span>
                                    <span class="operator">×</span>
                                    <span class="price">${window.dataManager.formatCurrency(item.price)}</span>
                                    <span class="equals">=</span>
                                    <span class="total">${window.dataManager.formatCurrency(item.total)}</span>
                                </div>
                            </div>
                        `).join('')}
                        <div class="products-summary">
                            <div class="summary-item">
                                <span>Subtotal:</span>
                                <span>${window.dataManager.formatCurrency(sale.total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="sale-meta-info">
                        ${sale.cashReceived > 0 ? `
                            <div class="sale-meta-item cash-details">
                                <div class="meta-icon"><i class="fas fa-money-bill-wave"></i></div>
                                <div class="meta-content">
                                    <span class="sale-meta-label">Efectivo recibido:</span>
                                    <span class="sale-meta-value">${window.dataManager.formatCurrency(sale.cashReceived)}</span>
                                </div>
                            </div>
                            <div class="sale-meta-item change-details">
                                <div class="meta-icon"><i class="fas fa-hand-holding-usd"></i></div>
                                <div class="meta-content">
                                    <span class="sale-meta-label">Cambio entregado:</span>
                                    <span class="sale-meta-value">${window.dataManager.formatCurrency(sale.change || 0)}</span>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${sale.reference ? `
                            <div class="sale-meta-item reference-details">
                                <div class="meta-icon"><i class="fas fa-hashtag"></i></div>
                                <div class="meta-content">
                                    <span class="sale-meta-label">Referencia:</span>
                                    <span class="sale-meta-value">${sale.reference}</span>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="sale-meta-item timestamp-details">
                            <div class="meta-icon"><i class="fas fa-clock"></i></div>
                            <div class="meta-content">
                                <span class="sale-meta-label">Fecha completa:</span>
                                <span class="sale-meta-value">${saleDate.toLocaleString('es-ES')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getPaymentMethodBadge(method) {
        const badges = {
            'cash': '<span class="payment-method-badge cash"><i class="fas fa-money-bill"></i> Efectivo</span>',
            'yape': '<span class="payment-method-badge yape"><i class="fas fa-mobile-alt"></i> Yape</span>',
            'card': '<span class="payment-method-badge card"><i class="fas fa-credit-card"></i> Tarjeta</span>',
            'transfer': '<span class="payment-method-badge transfer"><i class="fas fa-university"></i> Transferencia</span>'
        };
        return badges[method] || `<span class="payment-method-badge">${method}</span>`;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const saleTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - saleTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Ahora mismo';
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Hace ${diffInHours}h`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `Hace ${diffInDays}d`;
        
        return saleTime.toLocaleDateString('es-ES');
    }

    // Funciones CRUD mejoradas
    printSale(saleId) {
        const sale = window.dataManager.getSales().find(s => s.id === saleId);
        if (!sale) {
            window.ui.showNotification('Venta no encontrada', 'error');
            return;
        }
        
        window.ui.showNotification('Imprimiendo ticket...', 'info');
        
        // Usar el sistema de reportes para imprimir
        if (window.reports) {
            const salesData = [sale];
            window.reports.generateSaleTicket(sale);
        }
    }

    deleteSale(saleId) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta venta?\n\nEsta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            // Obtener la venta antes de eliminarla
            const sale = window.dataManager.getSales().find(s => s.id === saleId);
            if (!sale) {
                window.ui.showNotification('Venta no encontrada', 'error');
                return;
            }
            
            // Restaurar stock de los productos
            sale.items.forEach(item => {
                if (item.productId) {
                    const product = window.dataManager.getProducts().find(p => p.id === item.productId);
                    if (product) {
                        product.stock += item.quantity;
                        window.dataManager.saveProduct(product);
                    }
                }
            });
            
            // Eliminar la venta
            window.dataManager.deleteSale(saleId);
            
            // Actualizar la vista
            this.loadSalesHistory();
            
            window.ui.showNotification('Venta eliminada correctamente. Stock restaurado.', 'success');
            
        } catch (error) {
            console.error('Error al eliminar venta:', error);
            window.ui.showNotification('Error al eliminar la venta', 'error');
        }
    }
    
    updateProductsAnalysis() {
        const productSalesChart = document.getElementById('product-sales-chart');
        const productSalesTable = document.getElementById('product-sales-table');
        
        if (!productSalesChart || !productSalesTable) return;
        
        const productStats = this.calculateProductStats();
        
        // Crear gráfico
        this.createProductChart(productStats);
        
        // Crear tabla
        this.createProductTable(productStats);
    }
    
    updateOperatorsAnalysis() {
        const operatorSalesChart = document.getElementById('operator-sales-chart');
        const operatorSalesTable = document.getElementById('operator-sales-table');
        
        if (!operatorSalesChart || !operatorSalesTable) return;
        
        const operatorStats = this.calculateOperatorStats();
        
        // Crear gráfico
        this.createOperatorChart(operatorStats);
        
        // Crear tabla
        this.createOperatorTable(operatorStats);
    }
    
    updateChartsAnalysis() {
        this.createDailySalesChart();
        this.createHourlySalesChart();
        this.createTopProductsChart();
        this.createSalesTrendChart();
    }

    // ================================
    // ESTADÍSTICAS Y CÁLCULOS
    // ================================
    
    updateSalesSummary() {
        const totalSales = this.filteredSales.length;
        const totalAmount = this.filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0;
        const totalProducts = this.filteredSales.reduce((sum, sale) => 
            sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );
        
        this.updateStatElement('total-sales-count', totalSales);
        this.updateStatElement('total-sales-amount', window.dataManager.formatCurrency(totalAmount));
        this.updateStatElement('average-ticket', window.dataManager.formatCurrency(averageTicket));
        this.updateStatElement('total-products-sold', totalProducts);
    }
    
    calculateProductStats() {
        const productStats = {};
        
        this.filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const key = item.productId || item.description;
                if (!productStats[key]) {
                    productStats[key] = {
                        name: item.description,
                        quantity: 0,
                        revenue: 0,
                        sales: 0
                    };
                }
                productStats[key].quantity += item.quantity;
                productStats[key].revenue += item.total;
                productStats[key].sales++;
            });
        });
        
        return Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
    }
    
    calculateOperatorStats() {
        const operatorStats = {};
        
        this.filteredSales.forEach(sale => {
            if (!operatorStats[sale.operatorId]) {
                operatorStats[sale.operatorId] = {
                    name: sale.operatorName,
                    sales: 0,
                    revenue: 0,
                    products: 0
                };
            }
            operatorStats[sale.operatorId].sales++;
            operatorStats[sale.operatorId].revenue += sale.total;
            operatorStats[sale.operatorId].products += sale.items.reduce((sum, item) => sum + item.quantity, 0);
        });
        
        return Object.values(operatorStats).sort((a, b) => b.revenue - a.revenue);
    }

    // ================================
    // GRÁFICOS CON CHART.JS
    // ================================
    
    createProductChart(productStats) {
        const canvas = document.getElementById('product-chart');
        if (!canvas) return;
        
        // Destruir gráfico anterior si existe
        if (this.charts.productChart) {
            this.charts.productChart.destroy();
        }
        
        const top10 = productStats.slice(0, 10);
        
        this.charts.productChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: top10.map(p => p.name),
                datasets: [{
                    data: top10.map(p => p.revenue),
                    backgroundColor: this.generateColors(top10.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Ingresos por Producto (Top 10)'
                    }
                }
            }
        });
    }
    
    createOperatorChart(operatorStats) {
        const canvas = document.getElementById('operator-chart');
        if (!canvas) return;
        
        if (this.charts.operatorChart) {
            this.charts.operatorChart.destroy();
        }
        
        this.charts.operatorChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: operatorStats.map(o => o.name),
                datasets: [{
                    label: 'Ingresos',
                    data: operatorStats.map(o => o.revenue),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ingresos por Operario'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    createDailySalesChart() {
        const canvas = document.getElementById('daily-sales-chart');
        if (!canvas) return;
        
        if (this.charts.dailySalesChart) {
            this.charts.dailySalesChart.destroy();
        }
        
        const dailyData = this.groupSalesByDay();
        
        this.charts.dailySalesChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: dailyData.map(d => d.date),
                datasets: [{
                    label: 'Ventas Diarias',
                    data: dailyData.map(d => d.amount),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolución de Ventas por Día'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    createHourlySalesChart() {
        const canvas = document.getElementById('hourly-sales-chart');
        if (!canvas) return;
        
        if (this.charts.hourlySalesChart) {
            this.charts.hourlySalesChart.destroy();
        }
        
        const hourlyData = this.groupSalesByHour();
        
        this.charts.hourlySalesChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: hourlyData.map(h => `${h.hour}:00`),
                datasets: [{
                    label: 'Ventas por Hora',
                    data: hourlyData.map(h => h.amount),
                    backgroundColor: 'rgba(153, 102, 255, 0.8)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ventas por Hora del Día'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    createTopProductsChart() {
        const canvas = document.getElementById('top-products-chart');
        if (!canvas) return;
        
        if (this.charts.topProductsChart) {
            this.charts.topProductsChart.destroy();
        }
        
        const productStats = this.calculateProductStats();
        const top5 = productStats.slice(0, 5);
        
        this.charts.topProductsChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: top5.map(p => p.name),
                datasets: [{
                    label: 'Cantidad Vendida',
                    data: top5.map(p => p.quantity),
                    backgroundColor: 'rgba(255, 159, 64, 0.8)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 5 Productos Más Vendidos'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    createSalesTrendChart() {
        const canvas = document.getElementById('sales-trend-chart');
        if (!canvas) return;
        
        if (this.charts.salesTrendChart) {
            this.charts.salesTrendChart.destroy();
        }
        
        const trendData = this.calculateSalesTrend();
        
        this.charts.salesTrendChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: trendData.map(t => t.period),
                datasets: [
                    {
                        label: 'Ingresos',
                        data: trendData.map(t => t.revenue),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Cantidad de Ventas',
                        data: trendData.map(t => t.count),
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tendencia de Ventas'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    // ================================
    // TABLAS DE DATOS
    // ================================
    
    createProductTable(productStats) {
        const container = document.getElementById('product-sales-table');
        if (!container) return;
        
        const table = `
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Ventas</th>
                        <th>Ingresos</th>
                        <th>Promedio</th>
                    </tr>
                </thead>
                <tbody>
                    ${productStats.map(product => `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.quantity}</td>
                            <td>${product.sales}</td>
                            <td>${window.dataManager.formatCurrency(product.revenue)}</td>
                            <td>${window.dataManager.formatCurrency(product.revenue / product.sales)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = table;
    }
    
    createOperatorTable(operatorStats) {
        const container = document.getElementById('operator-sales-table');
        if (!container) return;
        
        const table = `
            <table>
                <thead>
                    <tr>
                        <th>Operario</th>
                        <th>Ventas</th>
                        <th>Productos</th>
                        <th>Ingresos</th>
                        <th>Ticket Promedio</th>
                    </tr>
                </thead>
                <tbody>
                    ${operatorStats.map(operator => `
                        <tr>
                            <td>${operator.name}</td>
                            <td>${operator.sales}</td>
                            <td>${operator.products}</td>
                            <td>${window.dataManager.formatCurrency(operator.revenue)}</td>
                            <td>${window.dataManager.formatCurrency(operator.revenue / operator.sales)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = table;
    }

    // ================================
    // FILTROS
    // ================================
    
    applyFilters() {
        // Recoger valores de filtros
        this.filters.dateFrom = document.getElementById('sales-date-from')?.value || '';
        this.filters.dateTo = document.getElementById('sales-date-to')?.value || '';
        this.filters.operator = document.getElementById('sales-operator-filter')?.value || '';
        this.filters.product = document.getElementById('sales-product-filter')?.value || '';
        this.filters.minAmount = document.getElementById('sales-min-amount')?.value || '';
        
        // Resetear página
        this.currentPage = 1;
        
        // Recargar datos
        this.loadSalesHistory();
        
        window.uiManager.showNotification('Filtros aplicados', 'success');
    }
    
    clearFilters() {
        // Limpiar filtros
        this.filters = {
            dateFrom: '',
            dateTo: '',
            operator: '',
            product: '',
            minAmount: '',
            search: ''
        };
        
        // Limpiar campos de UI
        const dateFromInput = document.getElementById('sales-date-from');
        const dateToInput = document.getElementById('sales-date-to');
        const operatorSelect = document.getElementById('sales-operator-filter');
        const productSelect = document.getElementById('sales-product-filter');
        const minAmountInput = document.getElementById('sales-min-amount');
        const searchInput = document.getElementById('sales-search');
        
        if (dateFromInput) dateFromInput.value = '';
        if (dateToInput) dateToInput.value = '';
        if (operatorSelect) operatorSelect.value = '';
        if (productSelect) productSelect.value = '';
        if (minAmountInput) minAmountInput.value = '';
        if (searchInput) searchInput.value = '';
        
        // Resetear página y ordenamiento
        this.currentPage = 1;
        this.sortBy = 'newest';
        
        const sortSelect = document.getElementById('sales-sort');
        if (sortSelect) sortSelect.value = 'newest';
        
        // Recargar datos
        this.loadSalesHistory();
        
        window.uiManager.showNotification('Filtros limpiados', 'info');
    }
    
    loadFilterOptions() {
        // Cargar operarios
        this.loadOperatorFilter();
        
        // Cargar productos
        this.loadProductFilter();
    }
    
    loadOperatorFilter() {
        const operatorSelect = document.getElementById('sales-operator-filter');
        if (!operatorSelect) return;
        
        const operators = window.dataManager.getOperators();
        
        // Mantener opción "Todos"
        const currentValue = operatorSelect.value;
        operatorSelect.innerHTML = '<option value="">Todos los operarios</option>';
        
        operators.forEach(operator => {
            const option = document.createElement('option');
            option.value = operator.id;
            option.textContent = operator.name;
            operatorSelect.appendChild(option);
        });
        
        operatorSelect.value = currentValue;
    }
    
    loadProductFilter() {
        const productSelect = document.getElementById('sales-product-filter');
        if (!productSelect) return;
        
        const products = window.dataManager.getProducts();
        
        // Mantener opción "Todos"
        const currentValue = productSelect.value;
        productSelect.innerHTML = '<option value="">Todos los productos</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
        
        productSelect.value = currentValue;
    }

    // ================================
    // EXPORTACIÓN
    // ================================
    
    exportToCSV() {
        if (this.filteredSales.length === 0) {
            window.uiManager.showNotification('No hay datos para exportar', 'warning');
            return;
        }
        
        if (window.reportsManager) {
            window.reportsManager.exportSalesToCSV(this.filteredSales);
        } else {
            window.uiManager.showNotification('Módulo de reportes no disponible', 'error');
        }
    }
    
    exportToPDF() {
        if (this.filteredSales.length === 0) {
            window.uiManager.showNotification('No hay datos para exportar', 'warning');
            return;
        }
        
        if (window.reportsManager) {
            window.reportsManager.exportSalesToPDF(this.filteredSales);
        } else {
            window.uiManager.showNotification('Módulo de reportes no disponible', 'error');
        }
    }

    // ================================
    // UTILIDADES
    // ================================
    
    changePage(direction) {
        const newPage = this.currentPage + direction;
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            this.updateSalesList();
            this.updatePaginationUI();
        }
    }
    
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    getEmptyState() {
        const hasFilters = Object.values(this.filters).some(filter => filter && filter.trim() !== '');
        
        if (hasFilters) {
            return `
                <div class="empty-state fade-in">
                    <div class="empty-icon">🔍</div>
                    <h3>No se encontraron ventas</h3>
                    <p>No hay ventas que coincidan con los filtros aplicados</p>
                    <div class="empty-actions">
                        <button class="action-btn secondary" onclick="salesHistory.clearFilters()">
                            <i class="fas fa-times-circle"></i> Limpiar Filtros
                        </button>
                        <button class="action-btn primary" onclick="ui.showSection('cash-register')">
                            <i class="fas fa-plus"></i> Nueva Venta
                        </button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="empty-state fade-in">
                    <div class="empty-icon">📈</div>
                    <h3>¡Empieza a vender!</h3>
                    <p>Aún no hay ventas registradas. Las ventas aparecerán aquí una vez que realices transacciones.</p>
                    <div class="empty-tips">
                        <div class="tip-item">
                            <i class="fas fa-cash-register"></i>
                            <span>Ve a Caja Registradora para hacer tu primera venta</span>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-boxes"></i>
                            <span>Asegúrate de tener productos en tu inventario</span>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-chart-line"></i>
                            <span>Aquí podrás ver estadísticas de tus ventas</span>
                        </div>
                    </div>
                    <div class="empty-actions">
                        <button class="action-btn primary pulse" onclick="ui.showSection('cash-register')">
                            <i class="fas fa-shopping-cart"></i> Realizar Primera Venta
                        </button>
                        <button class="action-btn secondary" onclick="ui.showSection('inventory')">
                            <i class="fas fa-boxes"></i> Ver Inventario
                        </button>
                    </div>
                </div>
            `;
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
    
    generateColors(count) {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
            '#4BC0C0', '#FF6384'
        ];
        return colors.slice(0, count);
    }
    
    groupSalesByDay() {
        const grouped = {};
        
        this.filteredSales.forEach(sale => {
            const date = sale.date;
            if (!grouped[date]) {
                grouped[date] = { date, amount: 0, count: 0 };
            }
            grouped[date].amount += sale.total;
            grouped[date].count++;
        });
        
        return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    }
    
    groupSalesByHour() {
        const grouped = {};
        
        for (let i = 0; i < 24; i++) {
            grouped[i] = { hour: i, amount: 0, count: 0 };
        }
        
        this.filteredSales.forEach(sale => {
            const hour = new Date(sale.timestamp).getHours();
            grouped[hour].amount += sale.total;
            grouped[hour].count++;
        });
        
        return Object.values(grouped);
    }
    
    calculateSalesTrend() {
        const dailyData = this.groupSalesByDay();
        
        return dailyData.map(day => ({
            period: day.date,
            revenue: day.amount,
            count: day.count
        }));
    }
    
    // Destruir gráficos al cambiar de sección
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Crear instancia global
window.salesHistoryManager = new SalesHistoryManager(); 