// ================================
// AUTHENTICATION SYSTEM - Sistema de Autenticación
// ================================

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.loginAttempts = 0;
        this.maxLoginAttempts = 5;
        this.blockTime = 300000; // 5 minutos en ms
        this.autoLogoutTime = null;
        
        this.initializeAuth();
        this.bindEvents();
    }

    // ================================
    // INICIALIZACIÓN
    // ================================
    
    initializeAuth() {
        // Verificar si hay una sesión guardada
        const savedSession = localStorage.getItem('cashSystem_userSession');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                // Verificar si la sesión no ha expirado (24 horas)
                const sessionAge = Date.now() - new Date(session.loginTime).getTime();
                if (sessionAge < 24 * 60 * 60 * 1000) { // 24 horas
                    this.currentUser = session.user;
                    this.showMainScreen();
                    this.startAutoLogoutTimer();
                } else {
                    this.clearSession();
                }
            } catch (error) {
                console.error('Error loading session:', error);
                this.clearSession();
            }
        }
        
        this.loadOperatorsList();
    }
    
    bindEvents() {
        // Login form
        const loginBtn = document.getElementById('login-btn');
        const operatorInput = document.getElementById('operator-name');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }
        
        if (operatorInput) {
            operatorInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
            
            // Auto-completar operarios
            operatorInput.addEventListener('input', () => this.handleOperatorInput());
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Auto-logout por inactividad
        document.addEventListener('mousemove', () => this.resetAutoLogoutTimer());
        document.addEventListener('keypress', () => this.resetAutoLogoutTimer());
        document.addEventListener('click', () => this.resetAutoLogoutTimer());
    }

    // ================================
    // GESTIÓN DE LOGIN
    // ================================
    
    handleLogin() {
        const operatorInput = document.getElementById('operator-name');
        const operatorName = operatorInput.value.trim();
        
        if (!operatorName) {
            this.showNotification('Por favor ingresa tu nombre', 'error');
            return;
        }
        
        // Verificar si está bloqueado por intentos
        if (this.isBlocked()) {
            this.showNotification('Demasiados intentos fallidos. Espera unos minutos.', 'error');
            return;
        }
        
        // Buscar operario en la base de datos
        const operators = window.dataManager.getOperators();
        let operator = operators.find(op => 
            op.name.toLowerCase() === operatorName.toLowerCase() && op.active
        );
        
        // Si no existe, crear uno nuevo
        if (!operator) {
            operator = window.dataManager.addOperator({
                name: operatorName,
                role: 'cashier'
            });
            this.showNotification(`Bienvenido ${operatorName}! Cuenta creada exitosamente.`, 'success');
        }
        
        // Login exitoso
        this.loginUser(operator);
        this.resetLoginAttempts();
        operatorInput.value = '';
    }
    
    loginUser(operator) {
        this.currentUser = operator;
        
        // Guardar sesión
        const session = {
            user: operator,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('cashSystem_userSession', JSON.stringify(session));
        
        // Mostrar pantalla principal
        this.showMainScreen();
        this.updateUserInfo();
        this.startAutoLogoutTimer();
        
        this.showNotification(`¡Bienvenido ${operator.name}!`, 'success');
    }
    
    handleLogout() {
        if (this.currentUser) {
            // Verificar si hay una caja abierta
            const currentSession = window.dataManager.getCurrentSession();
            if (currentSession && currentSession.isOpen) {
                if (!confirm('Tienes una caja abierta. ¿Estás seguro que quieres cerrar sesión?')) {
                    return;
                }
            }
            
            this.logoutUser();
        }
    }
    
    logoutUser() {
        this.showNotification(`Hasta luego ${this.currentUser.name}`, 'info');
        
        this.currentUser = null;
        this.clearSession();
        this.showLoginScreen();
        this.clearAutoLogoutTimer();
        
        // Limpiar cualquier modal abierto
        if (window.uiManager) {
            window.uiManager.closeModal();
        }
    }

    // ================================
    // GESTIÓN DE SESIONES
    // ================================
    
    clearSession() {
        localStorage.removeItem('cashSystem_userSession');
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Los administradores tienen todos los permisos
        if (this.currentUser.role === 'admin') return true;
        
        // Permisos por rol
        const permissions = {
            cashier: ['sell', 'view_sales', 'manage_cash'],
            supervisor: ['sell', 'view_sales', 'manage_cash', 'manage_inventory', 'view_reports'],
            admin: ['all']
        };
        
        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes(permission) || userPermissions.includes('all');
    }

    // ================================
    // INTERFAZ DE USUARIO
    // ================================
    
    showLoginScreen() {
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('main-screen').classList.remove('active');
        
        // Focus en el input
        setTimeout(() => {
            const operatorInput = document.getElementById('operator-name');
            if (operatorInput) operatorInput.focus();
        }, 100);
    }
    
    showMainScreen() {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
    }
    
    updateUserInfo() {
        if (!this.currentUser) return;
        
        const operatorSpan = document.getElementById('current-operator');
        const dateSpan = document.getElementById('current-date');
        
        if (operatorSpan) {
            operatorSpan.textContent = `👤 ${this.currentUser.name}`;
        }
        
        if (dateSpan) {
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const timeStr = now.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            dateSpan.textContent = `📅 ${dateStr} - ${timeStr}`;
        }
        
        // Actualizar fecha cada minuto
        if (this.dateInterval) clearInterval(this.dateInterval);
        this.dateInterval = setInterval(() => {
            this.updateUserInfo();
        }, 60000);
    }

    // ================================
    // AUTO-COMPLETAR OPERARIOS
    // ================================
    
    loadOperatorsList() {
        const operators = window.dataManager.getOperators();
        const datalist = document.getElementById('operators-list');
        
        if (datalist) {
            datalist.innerHTML = '';
            operators.forEach(operator => {
                if (operator.active) {
                    const option = document.createElement('option');
                    option.value = operator.name;
                    datalist.appendChild(option);
                }
            });
        }
    }
    
    handleOperatorInput() {
        const input = document.getElementById('operator-name');
        const value = input.value.trim();
        
        if (value.length > 0) {
            input.setAttribute('list', 'operators-list');
        } else {
            input.removeAttribute('list');
        }
    }

    // ================================
    // SEGURIDAD
    // ================================
    
    isBlocked() {
        const lastAttempt = localStorage.getItem('cashSystem_lastLoginAttempt');
        if (!lastAttempt) return false;
        
        const timeDiff = Date.now() - parseInt(lastAttempt);
        return this.loginAttempts >= this.maxLoginAttempts && timeDiff < this.blockTime;
    }
    
    resetLoginAttempts() {
        this.loginAttempts = 0;
        localStorage.removeItem('cashSystem_lastLoginAttempt');
        localStorage.removeItem('cashSystem_loginAttempts');
    }
    
    incrementLoginAttempts() {
        this.loginAttempts++;
        localStorage.setItem('cashSystem_loginAttempts', this.loginAttempts.toString());
        localStorage.setItem('cashSystem_lastLoginAttempt', Date.now().toString());
    }

    // ================================
    // AUTO-LOGOUT
    // ================================
    
    startAutoLogoutTimer() {
        const config = window.dataManager.getConfig();
        const autoLogoutMinutes = config?.autoLogout || 30;
        
        this.autoLogoutTime = Date.now() + (autoLogoutMinutes * 60 * 1000);
        
        if (this.autoLogoutTimer) clearTimeout(this.autoLogoutTimer);
        
        this.autoLogoutTimer = setTimeout(() => {
            this.showNotification('Sesión cerrada por inactividad', 'warning');
            this.logoutUser();
        }, autoLogoutMinutes * 60 * 1000);
    }
    
    resetAutoLogoutTimer() {
        if (this.isLoggedIn()) {
            this.startAutoLogoutTimer();
        }
    }
    
    clearAutoLogoutTimer() {
        if (this.autoLogoutTimer) {
            clearTimeout(this.autoLogoutTimer);
            this.autoLogoutTimer = null;
        }
        if (this.dateInterval) {
            clearInterval(this.dateInterval);
            this.dateInterval = null;
        }
    }

    // ================================
    // GESTIÓN DE PERSONAL
    // ================================
    
    addOperator(operatorData) {
        if (!this.hasPermission('manage_staff')) {
            this.showNotification('No tienes permisos para gestionar personal', 'error');
            return null;
        }
        
        return window.dataManager.addOperator(operatorData);
    }
    
    updateOperator(id, data) {
        if (!this.hasPermission('manage_staff')) {
            this.showNotification('No tienes permisos para gestionar personal', 'error');
            return null;
        }
        
        return window.dataManager.updateOperator(id, data);
    }
    
    deleteOperator(id) {
        if (!this.hasPermission('manage_staff')) {
            this.showNotification('No tienes permisos para gestionar personal', 'error');
            return false;
        }
        
        // No permitir eliminar el operario actual
        if (this.currentUser && this.currentUser.id === id) {
            this.showNotification('No puedes eliminar tu propia cuenta', 'error');
            return false;
        }
        
        return window.dataManager.deleteOperator(id);
    }

    // ================================
    // UTILIDADES
    // ================================
    
    showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones si está disponible
        if (window.uiManager) {
            window.uiManager.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    destroy() {
        this.clearAutoLogoutTimer();
        this.clearSession();
    }
}

// Crear instancia global
window.authSystem = new AuthSystem(); 