// ================================
// MAIN APPLICATION - Aplicación Principal
// ================================

class CashSystemApp {
    constructor() {
        this.isInitialized = false;
        this.version = '1.0.0';
        this.modules = {};
        
        this.init();
    }

    // ================================
    // INICIALIZACIÓN DEL SISTEMA
    // ================================
    
    async init() {
        try {
            console.log('🏪 Iniciando Caja Virtual v' + this.version);
            
            // Verificar dependencias críticas
            this.checkDependencies();
            
            // Inicializar módulos en orden
            await this.initializeModules();
            
            // Configurar manejadores globales
            this.setupGlobalHandlers();
            
            // Configurar PWA si está disponible
            this.setupPWA();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            console.log('✅ Sistema inicializado correctamente');
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Error al inicializar el sistema:', error);
            this.showCriticalError(error);
        }
    }
    
    checkDependencies() {
        const required = [
            { name: 'localStorage', check: () => typeof(Storage) !== "undefined" },
            { name: 'Chart.js', check: () => typeof Chart !== 'undefined' },
            { name: 'jsPDF', check: () => typeof window.jspdf !== 'undefined' }
        ];
        
        const missing = required.filter(dep => !dep.check());
        
        if (missing.length > 0) {
            throw new Error(`Dependencias faltantes: ${missing.map(m => m.name).join(', ')}`);
        }
    }
    
    async initializeModules() {
        const initOrder = [
            'dataManager',
            'uiManager', 
            'authSystem',
            'inventoryManager',
            'cashRegister',
            'salesHistoryManager',
            'reportsManager'
        ];
        
        for (const moduleName of initOrder) {
            try {
                if (window[moduleName]) {
                    this.modules[moduleName] = window[moduleName];
                    
                    // Ejecutar inicialización post-carga si existe
                    if (this.modules[moduleName].postInit) {
                        await this.modules[moduleName].postInit();
                    }
                    
                    console.log(`✓ ${moduleName} inicializado`);
                } else {
                    console.warn(`⚠️ ${moduleName} no encontrado`);
                }
            } catch (error) {
                console.error(`❌ Error inicializando ${moduleName}:`, error);
            }
        }
    }
    
    setupGlobalHandlers() {
        // Manejo de errores globales
        window.addEventListener('error', (event) => {
            console.error('Error global capturado:', event.error);
            this.handleGlobalError(event.error);
        });
        
        // Manejo de promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesa rechazada:', event.reason);
            this.handleGlobalError(event.reason);
        });
        
        // Manejo de cambios de visibilidad (para pausar/reanudar)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onAppHidden();
            } else {
                this.onAppVisible();
            }
        });
        
        // Manejo de cierre de ventana
        window.addEventListener('beforeunload', (event) => {
            return this.onBeforeUnload(event);
        });
        
        // Atajos de teclado globales
        document.addEventListener('keydown', (event) => {
            this.handleGlobalKeyboard(event);
        });
        
        // Actualización automática de datos
        this.setupAutoRefresh();
    }

    // ================================
    // MANEJADORES DE EVENTOS GLOBALES
    // ================================
    
    handleGlobalError(error) {
        // Solo mostrar errores críticos al usuario
        if (this.isCriticalError(error)) {
            if (window.uiManager) {
                window.uiManager.showNotification(
                    'Ha ocurrido un error. Por favor, recarga la página si persiste.',
                    'error'
                );
            }
        }
        
        // Log detallado para debugging
        this.logError(error);
    }
    
    isCriticalError(error) {
        const criticalPatterns = [
            /localStorage/i,
            /quota.*exceeded/i,
            /network/i,
            /failed to fetch/i
        ];
        
        const errorMessage = error?.message || error?.toString() || '';
        return criticalPatterns.some(pattern => pattern.test(errorMessage));
    }
    
    logError(error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error?.message || 'Error desconocido',
            stack: error?.stack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            user: window.authSystem?.getCurrentUser()?.name || 'Sin autenticar'
        };
        
        // Guardar en localStorage para debugging
        try {
            const logs = JSON.parse(localStorage.getItem('cashSystem_errorLogs') || '[]');
            logs.push(errorLog);
            
            // Mantener solo los últimos 50 errores
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            
            localStorage.setItem('cashSystem_errorLogs', JSON.stringify(logs));
        } catch (e) {
            console.warn('No se pudo guardar el log de error:', e);
        }
    }
    
    handleGlobalKeyboard(event) {
        // Solo procesar si no estamos en un input
        const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
        if (isInInput) return;
        
        // Atajos con teclas de función
        switch (event.key) {
            case 'F1':
                event.preventDefault();
                this.navigateToSection('cash-register');
                this.focusQuickSale();
                break;
            case 'F2':
                event.preventDefault();
                this.navigateToSection('inventory');
                break;
            case 'F3':
                event.preventDefault();
                this.navigateToSection('sales-history');
                break;
            case 'F4':
                event.preventDefault();
                this.quickNewProduct();
                break;
            case 'F5':
                event.preventDefault();
                this.refreshCurrentSection();
                break;
            case 'Escape':
                event.preventDefault();
                this.handleEscape();
                break;
        }
        
        // Atajos globales con Ctrl/Cmd
        const isCtrl = event.ctrlKey || event.metaKey;
        
        if (isCtrl) {
            switch (event.key.toLowerCase()) {
                case 's':
                    event.preventDefault();
                    this.quickSave();
                    break;
                case 'e':
                    event.preventDefault();
                    this.quickExport();
                    break;
                case 'n':
                    event.preventDefault();
                    this.quickNewSale();
                    break;
                case 'p':
                    event.preventDefault();
                    this.quickNewProduct();
                    break;
                case 'h':
                    event.preventDefault();
                    this.showHelp();
                    break;
                case 'n':
                    event.preventDefault();
                    this.quickNewSale();
                    break;
            }
        } else {
            switch (event.key) {
                case 'F1':
                    event.preventDefault();
                    this.showHelp();
                    break;
                case 'F2':
                    event.preventDefault();
                    this.navigateToSection('cash-register');
                    break;
                case 'F3':
                    event.preventDefault();
                    this.navigateToSection('inventory');
                    break;
                case 'F4':
                    event.preventDefault();
                    this.navigateToSection('sales-history');
                    break;
                case 'Escape':
                    this.handleEscape();
                    break;
            }
        }
    }
    
    onAppHidden() {
        // Pausar operaciones no críticas cuando la app no es visible
        this.pauseAutoRefresh();
    }
    
    onAppVisible() {
        // Reanudar operaciones y actualizar datos
        this.resumeAutoRefresh();
        this.refreshCurrentSection();
    }
    
    onBeforeUnload(event) {
        // Verificar si hay operaciones pendientes
        const hasUnsavedChanges = this.checkUnsavedChanges();
        
        if (hasUnsavedChanges) {
            const message = '¿Estás seguro que quieres salir? Hay cambios sin guardar.';
            event.returnValue = message;
            return message;
        }
    }

    // ================================
    // FUNCIONES DE ATAJO
    // ================================
    
    quickSave() {
        // Guardar estado actual de forma explícita
        try {
            if (window.cashRegister?.currentCart?.length > 0) {
                // Guardar carrito temporal
                const cartBackup = {
                    cart: window.cashRegister.currentCart,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('cashSystem_cartBackup', JSON.stringify(cartBackup));
                
                if (window.uiManager) {
                    window.uiManager.showNotification('Carrito guardado temporalmente', 'success');
                }
            } else {
                if (window.uiManager) {
                    window.uiManager.showNotification('No hay cambios que guardar', 'info');
                }
            }
        } catch (error) {
            console.error('Error en quickSave:', error);
        }
    }
    
    quickExport() {
        if (window.reportsManager) {
            const today = new Date().toISOString().split('T')[0];
            window.reportsManager.generateDailySalesReport(today);
        }
    }
    
    quickNewSale() {
        this.navigateToSection('cash-register');
        
        // Focus en venta rápida si la caja está abierta
        setTimeout(() => {
            if (window.cashRegister?.isOpen) {
                const quickDescription = document.getElementById('quick-description');
                if (quickDescription) {
                    quickDescription.focus();
                }
            }
        }, 200);
    }
    
    focusQuickSale() {
        // Enfocar en el input de descripción rápida si ya estamos en la sección de caja
        setTimeout(() => {
            const quickDescription = document.getElementById('quick-description');
            if (quickDescription) {
                quickDescription.focus();
                quickDescription.select();
            }
        }, 100);
    }
    
    quickNewProduct() {
        // Navegar a inventario y abrir modal de nuevo producto
        this.navigateToSection('inventory');
        
        setTimeout(() => {
            if (window.inventoryManager) {
                window.inventoryManager.showAddProductModal();
            }
        }, 200);
    }
    
    navigateToSection(sectionName) {
        if (window.uiManager) {
            window.uiManager.showSection(sectionName);
        }
    }
    
    showHelp() {
        const helpContent = `
            <div class="help-content">
                <h3>🆘 Ayuda - Atajos de Teclado</h3>
                <div class="shortcuts-list">
                    <div class="shortcut-category">
                        <h4>🎯 Navegación Rápida</h4>
                        <div class="shortcut-item">
                            <strong>F1:</strong> Ir a Caja y enfocar venta rápida
                        </div>
                        <div class="shortcut-item">
                            <strong>F2:</strong> Ir a Inventario
                        </div>
                        <div class="shortcut-item">
                            <strong>F3:</strong> Ir a Historial de Ventas
                        </div>
                        <div class="shortcut-item">
                            <strong>F4:</strong> Agregar producto nuevo
                        </div>
                        <div class="shortcut-item">
                            <strong>F5:</strong> Actualizar sección actual
                        </div>
                    </div>
                    
                    <div class="shortcut-category">
                        <h4>⚡ Acciones Rápidas</h4>
                        <div class="shortcut-item">
                            <strong>Ctrl + N:</strong> Nueva venta rápida
                        </div>
                        <div class="shortcut-item">
                            <strong>Ctrl + P:</strong> Agregar nuevo producto
                        </div>
                        <div class="shortcut-item">
                            <strong>Ctrl + S:</strong> Guardar estado actual
                        </div>
                        <div class="shortcut-item">
                            <strong>Ctrl + E:</strong> Exportar reporte del día
                        </div>
                        <div class="shortcut-item">
                            <strong>Ctrl + H:</strong> Mostrar esta ayuda
                        </div>
                    </div>
                    
                    <div class="shortcut-category">
                        <h4>🔧 Controles</h4>
                        <div class="shortcut-item">
                            <strong>Escape:</strong> Cancelar acción actual
                        </div>
                        <div class="shortcut-item">
                            <strong>Enter:</strong> Confirmar en campos de entrada
                        </div>
                    </div>
                </div>
                
                <h4>💡 Tips de Uso:</h4>
                <ul>
                    <li>🔍 Usa los filtros de categoría con contadores dinámicos</li>
                    <li>😀 Haz clic en el botón emoji para seleccionar iconos visuales</li>
                    <li>📊 Los datos se actualizan automáticamente cada 30 segundos</li>
                    <li>💾 Todo se guarda automáticamente en tu navegador</li>
                    <li>📱 La interfaz se adapta a dispositivos móviles</li>
                    <li>🔄 Puedes trabajar sin conexión a internet</li>
                    <li>📈 Exporta reportes regularmente como respaldo</li>
                </ul>
            </div>
        `;
        
        if (window.uiManager) {
            window.uiManager.showModal({
                title: '🆘 Ayuda del Sistema',
                body: helpContent,
                footer: '<button class="action-btn primary" onclick="uiManager.closeModal()">Entendido</button>'
            });
        }
    }
    
    handleEscape() {
        // Cerrar modal si está abierto
        if (window.uiManager && window.uiManager.modalStack.length > 0) {
            window.uiManager.closeModal();
            return;
        }
        
        // Cancelar venta si hay productos en el carrito
        if (window.cashRegister?.currentCart?.length > 0) {
            window.cashRegister.cancelSale();
            return;
        }
        
        // Cerrar sidebar si está abierto
        if (window.uiManager?.sidebarOpen) {
            window.uiManager.closeSidebar();
        }
    }

    // ================================
    // ACTUALIZACIÓN AUTOMÁTICA
    // ================================
    
    setupAutoRefresh() {
        // Actualizar interfaz cada 30 segundos
        this.refreshInterval = setInterval(() => {
            this.refreshCurrentSection();
        }, 30000);
        
        // Actualizar fecha/hora cada minuto
        this.clockInterval = setInterval(() => {
            if (window.authSystem?.updateUserInfo) {
                window.authSystem.updateUserInfo();
            }
        }, 60000);
    }
    
    pauseAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
    
    resumeAutoRefresh() {
        this.setupAutoRefresh();
    }
    
    refreshCurrentSection() {
        if (!window.uiManager) return;
        
        const currentSection = window.uiManager.currentSection;
        
        switch (currentSection) {
            case 'cash-register':
                if (window.cashRegister) {
                    window.cashRegister.updateCashStatusUI();
                    window.cashRegister.updateCashSummary();
                }
                break;
            case 'inventory':
                if (window.inventoryManager) {
                    window.inventoryManager.loadInventory();
                }
                break;
            case 'sales-history':
                if (window.salesHistoryManager) {
                    window.salesHistoryManager.updateSalesSummary();
                }
                break;
        }
    }

    // ================================
    // UTILIDADES
    // ================================
    
    checkUnsavedChanges() {
        // Verificar si hay un carrito con productos
        if (window.cashRegister?.currentCart?.length > 0) {
            return true;
        }
        
        // Verificar si hay modales abiertos
        if (window.uiManager?.modalStack?.length > 0) {
            return true;
        }
        
        return false;
    }
    
    showWelcomeMessage() {
        if (window.uiManager && window.authSystem?.isLoggedIn()) {
            const user = window.authSystem.getCurrentUser();
            const isFirstTime = !localStorage.getItem('cashSystem_welcomeShown');
            
            if (isFirstTime) {
                setTimeout(() => {
                    window.uiManager.showNotification(
                        `¡Bienvenido al Sistema de Caja Virtual! 🏪\nUsa F1 para ver los atajos de teclado.`,
                        'info',
                        6000
                    );
                    localStorage.setItem('cashSystem_welcomeShown', 'true');
                }, 2000);
            }
        }
        
        // Mostrar información de debug en consola
        console.log('🏪 Caja Virtual - Sistema de Punto de Venta');
        console.log('📝 Usa debugSystem() para información de debugging');
        console.log('ℹ️ Usa systemInfo() para información del sistema');
    }
    
    showCriticalError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'critical-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h2>❌ Error Crítico</h2>
                <p>El sistema no pudo inicializarse correctamente.</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <button onclick="location.reload()" class="action-btn primary">
                    🔄 Recargar Página
                </button>
                <details>
                    <summary>Detalles técnicos</summary>
                    <pre>${error.stack || 'No disponible'}</pre>
                </details>
            </div>
        `;
        
        // Insertar al inicio del body
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }

    // ================================
    // PWA (Progressive Web App)
    // ================================
    
    setupPWA() {
        // Registrar Service Worker si está disponible
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
        
        // Manejo de instalación de PWA
        this.setupPWAInstall();
    }
    
    async registerServiceWorker() {
        try {
            // En un entorno real, aquí iría el service worker
            console.log('PWA: Service Worker registrado');
        } catch (error) {
            console.log('PWA: No se pudo registrar Service Worker');
        }
    }
    
    setupPWAInstall() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Mostrar botón de instalación personalizado
            this.showInstallPrompt(deferredPrompt);
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA: Aplicación instalada');
            if (window.uiManager) {
                window.uiManager.showNotification('¡Aplicación instalada correctamente!', 'success');
            }
        });
    }
    
    showInstallPrompt(deferredPrompt) {
        // Crear botón de instalación temporal
        const installButton = document.createElement('button');
        installButton.className = 'install-pwa-btn';
        installButton.innerHTML = '📱 Instalar App';
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            padding: 10px 15px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        installButton.addEventListener('click', async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA: Usuario aceptó instalar');
            }
            
            installButton.remove();
            deferredPrompt = null;
        });
        
        document.body.appendChild(installButton);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            if (installButton.parentNode) {
                installButton.remove();
            }
        }, 10000);
    }

    // ================================
    // MÉTODOS PÚBLICOS
    // ================================
    
    getSystemInfo() {
        return {
            version: this.version,
            initialized: this.isInitialized,
            modules: Object.keys(this.modules),
            user: window.authSystem?.getCurrentUser(),
            cashOpen: window.cashRegister?.isOpen || false,
            timestamp: new Date().toISOString()
        };
    }
    
    exportSystemData() {
        if (window.dataManager) {
            return window.dataManager.exportData();
        }
        return null;
    }
    
    async importSystemData(jsonData) {
        if (window.dataManager) {
            const success = window.dataManager.importData(jsonData);
            if (success) {
                // Recargar todas las secciones
                this.refreshCurrentSection();
                if (window.uiManager) {
                    window.uiManager.showNotification('Datos importados exitosamente', 'success');
                }
            }
            return success;
        }
        return false;
    }
    
    // Método para debugging
    debug() {
        return {
            system: this.getSystemInfo(),
            localStorage: Object.keys(localStorage).filter(key => key.startsWith('cashSystem_')),
            errors: JSON.parse(localStorage.getItem('cashSystem_errorLogs') || '[]'),
            performance: performance.now()
        };
    }
}

// ================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================

// Esperar a que se cargue el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    // Crear instancia global de la aplicación
    window.cashSystemApp = new CashSystemApp();
    
    // Exponer algunas funciones útiles globalmente
    window.debugSystem = () => window.cashSystemApp.debug();
    window.systemInfo = () => window.cashSystemApp.getSystemInfo();
}

// ================================
// ESTILOS ADICIONALES PARA ERRORES
// ================================

// Agregar estilos críticos si no se cargó el CSS
if (!document.querySelector('link[href*="style.css"]')) {
    const criticalCSS = `
        .critical-error {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        }
        .error-content {
            background: #1f2937;
            padding: 2rem;
            border-radius: 8px;
            max-width: 500px;
            text-align: center;
        }
        .error-content h2 {
            margin-top: 0;
            color: #ef4444;
        }
        .error-content button {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .error-content details {
            margin-top: 1rem;
            text-align: left;
        }
        .error-content pre {
            font-size: 12px;
            background: #000;
            padding: 1rem;
            border-radius: 4px;
            overflow: auto;
            max-height: 200px;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
}

console.log('🏪 Caja Virtual - Sistema de Punto de Venta');
console.log('📝 Usa debugSystem() para información de debugging');
console.log('ℹ️ Usa systemInfo() para información del sistema'); 