// ================================
// UI MANAGER - Sistema de Interfaz de Usuario
// ================================

class UIManager {
    constructor() {
        this.currentSection = 'cash-register';
        this.sidebarOpen = false;
        this.modalStack = [];
        this.notifications = [];
        
        this.bindEvents();
        this.initializeUI();
    }

    // ================================
    // INICIALIZACIÓN
    // ================================
    
    initializeUI() {
        // Configurar estado inicial de la interfaz
        this.showSection('cash-register');
        this.updateDateTime();
        this.bindEvents();
        
        // Actualizar fecha/hora cada minuto
        setInterval(() => this.updateDateTime(), 60000);
        
        // Agregar debug para verificar funcionalidad
        console.log('🏪 UIManager inicializado correctamente');
    }
    
    // Función para reinicializar event listeners si es necesario
    reinitializeEventListeners() {
        console.log('🔄 Reinicializando event listeners...');
        this.bindEvents();
        
        // Reinicializar también otros sistemas
        if (window.cashRegister) {
            window.cashRegister.bindEvents();
        }
        
        if (window.inventoryManager) {
            window.inventoryManager.bindEvents();
        }
        
        console.log('✅ Event listeners reinicializados');
    }
    
    bindEvents() {
        // Menú hamburguesa - con manejo mejorado
        const menuToggle = document.getElementById('menu-toggle');
        const closeSidebar = document.getElementById('close-sidebar');
        
        if (menuToggle) {
            // Limpiar eventos previos
            menuToggle.onclick = null;
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🍔 Hamburguesa clickeada');
                this.toggleSidebar();
            });
        }
        
        if (closeSidebar) {
            closeSidebar.onclick = null;
            closeSidebar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeSidebar();
            });
        }
        
        // Navegación del sidebar
        const menuItems = document.querySelectorAll('.menu-item[data-section]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
                this.closeSidebar();
            });
        });
        
        // Cerrar sidebar al hacer click fuera
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menu-toggle');
            
            if (this.sidebarOpen && sidebar && !sidebar.contains(e.target) && e.target !== menuToggle) {
                this.closeSidebar();
            }
        });
        
        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Cerrar modal genérico
                if (this.modalStack.length > 0) {
                    this.closeModal();
                }
                
                // Cerrar modales específicos
                const saleModal = document.getElementById('sale-confirmation-modal');
                if (saleModal && saleModal.classList.contains('active')) {
                    closeSaleConfirmModal();
                }
                
                // cashModal eliminado - ahora se usa sistema unificado
                
                const closeModal = document.getElementById('close-cash-modal');
                if (closeModal && closeModal.classList.contains('active')) {
                    closeCloseCashModal();
                }
            }
        });
        
        // Cerrar modal al hacer click en overlay
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }
        
        // Botón de cerrar modal genérico
        const closeModalBtn = document.getElementById('close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Cerrar modales específicos al hacer clic en overlay
        const saleModal = document.getElementById('sale-confirmation-modal');
        if (saleModal) {
            saleModal.addEventListener('click', (e) => {
                if (e.target === saleModal) {
                    closeSaleConfirmModal();
                }
            });
        }
        
        // cashModal eliminado - ahora se usa sistema unificado
        
        const closeModal = document.getElementById('close-cash-modal');
        if (closeModal) {
            closeModal.addEventListener('click', (e) => {
                if (e.target === closeModal) {
                    closeCloseCashModal();
                }
            });
        }
        
        // Responsive: cerrar sidebar en móvil al redimensionar
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.sidebarOpen) {
                this.closeSidebar();
            }
        });
    }

    // ================================
    // NAVEGACIÓN Y SIDEBAR
    // ================================
    
    toggleSidebar() {
        if (this.sidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.add('active');
            this.sidebarOpen = true;
            
            // Crear overlay en móvil
            if (window.innerWidth <= 768) {
                this.createSidebarOverlay();
            }
        }
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
            this.sidebarOpen = false;
            this.removeSidebarOverlay();
        }
    }
    
    createSidebarOverlay() {
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => this.closeSidebar());
        }
        overlay.classList.add('active');
    }
    
    removeSidebarOverlay() {
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
    
    showSection(sectionName) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }
        
        // Actualizar menú activo
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => item.classList.remove('active'));
        
        const activeMenuItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        // Cargar datos específicos de la sección
        this.loadSectionData(sectionName);
    }
    
    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'inventory':
                if (window.inventoryManager) {
                    window.inventoryManager.loadInventory();
                }
                break;
            case 'sales-history':
                if (window.salesHistoryManager) {
                    window.salesHistoryManager.loadSalesHistory();
                }
                break;
            case 'closures-history':
                this.loadClosuresHistory();
                break;
            case 'staff-management':
                this.loadStaffManagement();
                break;
        }
    }

    // ================================
    // GESTIÓN DE MODALES
    // ================================
    
    showModal(config) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('generic-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const footer = document.getElementById('modal-footer');
        
        if (!modalOverlay || !modal) return;
        
        // Configurar modal
        if (title) title.textContent = config.title || '';
        if (body) body.innerHTML = config.body || '';
        if (footer) footer.innerHTML = config.footer || '';
        
        // Guardar en stack para manejo de múltiples modales
        this.modalStack.push({
            title: config.title,
            body: config.body,
            footer: config.footer,
            onClose: config.onClose
        });
        
        // Mostrar modal
        modalOverlay.classList.add('active');
        modal.classList.add('active');
        
        // Configurar eventos de formularios dinámicos después de insertar el HTML
        setTimeout(() => {
            // Verificar si hay un formulario dinámico en el modal
            const dynamicForm = modal.querySelector('.dynamic-form');
            if (dynamicForm) {
                console.log('🔍 Formulario dinámico detectado en modal, configurando eventos...');
                this.setupDynamicFormEvents();
            }
            
            // Focus en primer input si existe
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 50);
        
        return modal;
    }
    
    closeModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('generic-modal');
        
        if (modalOverlay && modal) {
            modalOverlay.classList.add('closing');
            
            setTimeout(() => {
                modalOverlay.classList.remove('active', 'closing');
                modal.classList.remove('active');
                
                // Ejecutar callback de cierre si existe
                const currentModal = this.modalStack.pop();
                if (currentModal && currentModal.onClose) {
                    currentModal.onClose();
                }
                
                // Limpiar callback pendiente de formulario dinámico
                this._pendingFormCallback = null;
                
                // Si hay más modales en el stack, mostrar el anterior
                if (this.modalStack.length > 0) {
                    const previousModal = this.modalStack[this.modalStack.length - 1];
                    setTimeout(() => {
                        this.showModal(previousModal);
                    }, 150);
                }
            }, 300);
        }
    }

    // Función para cerrar modal específico con animación
    closeSpecificModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('closing');
            
            setTimeout(() => {
                modal.classList.remove('active', 'closing');
                modal.style.display = 'none';
                
                // Restablecer pointer-events para overlay si es necesario
                if (!modal.style.display || modal.style.display === 'none') {
                    modal.style.pointerEvents = 'none';
                }
            }, 300);
        }
    }

    // Función para abrir modal específico con animación
    openSpecificModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.style.pointerEvents = 'auto';
            
            // Pequeño delay para trigger la animación
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    }
    
    showConfirmDialog(message, onConfirm, onCancel = null) {
        const footer = `
            <button id="confirm-action" class="action-btn danger">Confirmar</button>
            <button id="cancel-action" class="action-btn secondary">Cancelar</button>
        `;
        
        const modal = this.showModal({
            title: 'Confirmar Acción',
            body: `<p>${message}</p>`,
            footer: footer
        });
        
        // Manejar botones con delay para evitar conflictos
        setTimeout(() => {
            const confirmBtn = modal.querySelector('#confirm-action');
            const cancelBtn = modal.querySelector('#cancel-action');
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeModal();
                    if (onConfirm) {
                        setTimeout(() => onConfirm(), 100);
                    }
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeModal();
                    if (onCancel) {
                        setTimeout(() => onCancel(), 100);
                    }
                });
            }
        }, 100);
    }

    // ================================
    // SISTEMA DE NOTIFICACIONES
    // ================================
    
    showNotification(message, type = 'info', duration = 4000) {
        const notification = this.createNotificationElement(message, type);
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-ocultar después del tiempo especificado
        setTimeout(() => {
            this.hideNotification(notification);
        }, duration);
        
        // Permitir cerrar manualmente
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideNotification(notification));
        }
        
        return notification;
    }
    
    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        return notification;
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // ================================
    // FORMULARIOS DINÁMICOS
    // ================================
    
    createForm(fields, onSubmit, submitText = 'Guardar') {
        let formHTML = '<div class="dynamic-form">';
        
        fields.forEach(field => {
            formHTML += this.createFormField(field);
        });
        
        formHTML += `
            <div class="form-actions">
                <button type="submit" class="action-btn primary">${submitText}</button>
                <button type="button" class="action-btn secondary" id="cancel-form">Cancelar</button>
            </div>
        </div>`;
        
        // Guardar la función onSubmit para uso posterior
        this._pendingFormCallback = onSubmit;
        
        return formHTML;
    }
    
    // Nueva función para configurar eventos después de que el formulario se inserte en el DOM
    setupDynamicFormEvents() {
        console.log('🔧 Configurando eventos de formulario dinámico...');
        
        const form = document.querySelector('.dynamic-form');
        if (!form) {
            console.error('❌ Formulario dinámico no encontrado');
            return;
        }
        
        // Evitar configurar eventos múltiples veces
        if (form.dataset.eventsConfigured === 'true') {
            console.log('⚠️ Eventos ya configurados para este formulario');
            return;
        }
        
        // Marcar como configurado
        form.dataset.eventsConfigured = 'true';
        
        // Manejar envío del formulario
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📤 Enviando formulario dinámico...');
            
            const formData = this.getFormData(form);
            console.log('📋 Datos del formulario:', formData);
            
            if (this._pendingFormCallback) {
                try {
                    this._pendingFormCallback(formData);
                } catch (error) {
                    console.error('❌ Error al ejecutar callback del formulario:', error);
                    this.showNotification('Error al procesar el formulario', 'error');
                }
            } else {
                console.error('❌ No hay callback configurado para el formulario');
            }
        });
        
        // Manejar cancelación
        const cancelBtn = form.querySelector('#cancel-form');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('❌ Cancelando formulario dinámico...');
                this.closeModal();
            });
            console.log('✅ Evento de cancelar configurado');
        }
        
        console.log('✅ Eventos de formulario dinámico configurados exitosamente');
    }
    
    createFormField(field) {
        const { type, name, label, placeholder, required, options, value } = field;
        
        let fieldHTML = `<div class="input-group">`;
        fieldHTML += `<label for="${name}">${label}${required ? ' *' : ''}</label>`;
        
        switch (type) {
            case 'text':
            case 'number':
            case 'email':
            case 'password':
                fieldHTML += `<input type="${type}" id="${name}" name="${name}" 
                    placeholder="${placeholder || ''}" ${required ? 'required' : ''} 
                    value="${value || ''}" class="large-input">`;
                break;
            case 'textarea':
                fieldHTML += `<textarea id="${name}" name="${name}" 
                    placeholder="${placeholder || ''}" ${required ? 'required' : ''} 
                    rows="3">${value || ''}</textarea>`;
                break;
            case 'select':
                fieldHTML += `<select id="${name}" name="${name}" ${required ? 'required' : ''}>`;
                if (options) {
                    options.forEach(option => {
                        const selected = option.value === value ? 'selected' : '';
                        fieldHTML += `<option value="${option.value}" ${selected}>${option.label}</option>`;
                    });
                }
                fieldHTML += '</select>';
                break;
        }
        
        fieldHTML += '</div>';
        return fieldHTML;
    }
    
    getFormData(form) {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = input.value;
            }
        });
        
        return formData;
    }

    // ================================
    // UTILIDADES DE UI
    // ================================
    
    updateDateTime() {
        const dateSpan = document.getElementById('current-date');
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
    }
    
    formatCurrency(amount) {
        return window.dataManager ? window.dataManager.formatCurrency(amount) : `$${amount.toFixed(2)}`;
    }
    
    showLoading(element, text = 'Cargando...') {
        if (element) {
            element.classList.add('loading');
            element.setAttribute('data-loading-text', text);
        }
    }
    
    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
            element.removeAttribute('data-loading-text');
        }
    }
    
    animateValue(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const difference = end - start;
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (difference * progress);
            
            if (element) {
                element.textContent = this.formatCurrency(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }

    // ================================
    // GESTIÓN DE HISTORIAL DE CIERRES
    // ================================
    
    loadClosuresHistory() {
        const closuresList = document.getElementById('closures-list');
        if (!closuresList) return;
        
        const closures = window.dataManager.getClosures();
        
        if (closures.length === 0) {
            closuresList.innerHTML = `
                <div class="empty-state">
                    <h3>📚 No hay cierres registrados</h3>
                    <p>Los cierres de caja aparecerán aquí</p>
                </div>
            `;
            return;
        }
        
        closuresList.innerHTML = closures
            .sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt))
            .map(closure => this.createClosureItem(closure))
            .join('');
    }
    
    createClosureItem(closure) {
        const openDate = new Date(closure.openedAt).toLocaleDateString('es-ES');
        const closeDate = new Date(closure.closedAt).toLocaleDateString('es-ES');
        const openTime = new Date(closure.openedAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        const closeTime = new Date(closure.closedAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        
        const expectedTotal = closure.currentCashAmount + closure.currentDigitalAmount;
        const realTotal = closure.realCashAmount + closure.currentDigitalAmount;
        const difference = realTotal - expectedTotal;
        
        const differenceClass = difference === 0 ? 'perfect' : difference > 0 ? 'excess' : 'shortage';
        const differenceText = difference === 0 ? 'Exacto' : difference > 0 ? 'Sobrante' : 'Faltante';
        
        return `
            <div class="closure-item">
                <div class="closure-header">
                    <div class="closure-info">
                        <h4>👤 ${closure.operatorName}</h4>
                        <p>📅 ${openDate} ${openTime} - ${closeDate} ${closeTime}</p>
                    </div>
                    <div class="closure-amounts">
                        <div class="closure-expected">
                            <span>Esperado:</span>
                            <span>${this.formatCurrency(expectedTotal)}</span>
                        </div>
                        <div class="closure-real">
                            <span>Real:</span>
                            <span>${this.formatCurrency(realTotal)}</span>
                        </div>
                    </div>
                </div>
                <div class="closure-summary">
                    <div class="summary-item">
                        <span>💵 Efectivo inicial:</span>
                        <span>${this.formatCurrency(closure.initialAmount)}</span>
                    </div>
                    <div class="summary-item">
                        <span>💵 Efectivo final:</span>
                        <span>${this.formatCurrency(closure.realCashAmount)}</span>
                    </div>
                    <div class="summary-item">
                        <span>📱 Digital:</span>
                        <span>${this.formatCurrency(closure.currentDigitalAmount)}</span>
                    </div>
                    <div class="summary-item difference ${differenceClass}">
                        <span>📊 Diferencia:</span>
                        <span>${differenceText}: ${this.formatCurrency(Math.abs(difference))}</span>
                    </div>
                    ${closure.closingNotes ? `
                        <div class="summary-item">
                            <span>📝 Notas:</span>
                            <span>${closure.closingNotes}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ================================
    // GESTIÓN DE PERSONAL
    // ================================
    
    loadStaffManagement() {
        const staffList = document.getElementById('staff-list');
        const addStaffBtn = document.getElementById('add-staff-btn');
        
        if (!staffList) return;
        
        // Manejar botón de agregar personal
        if (addStaffBtn) {
            addStaffBtn.onclick = () => this.showAddStaffModal();
        }
        
        const operators = window.dataManager.getOperators();
        
        if (operators.length === 0) {
            staffList.innerHTML = `
                <div class="empty-state">
                    <h3>👥 No hay personal registrado</h3>
                    <p>Agrega operarios para el sistema</p>
                </div>
            `;
            return;
        }
        
        staffList.innerHTML = operators.map(operator => this.createStaffItem(operator)).join('');
    }
    
    createStaffItem(operator) {
        const createdDate = new Date(operator.createdAt).toLocaleDateString('es-ES');
        const isCurrentUser = window.authSystem.getCurrentUser()?.id === operator.id;
        
        return `
            <div class="staff-item ${!operator.active ? 'inactive' : ''}">
                <div class="staff-header">
                    <div class="staff-info">
                        <h4>👤 ${operator.name} ${isCurrentUser ? '(Tú)' : ''}</h4>
                        <p>🏷️ ${this.getRoleDisplayName(operator.role)}</p>
                        <p>📅 Creado: ${createdDate}</p>
                    </div>
                    <div class="staff-actions">
                        <button class="action-btn secondary" onclick="uiManager.editStaff('${operator.id}')">
                            ✏️ Editar
                        </button>
                        ${!isCurrentUser ? `
                            <button class="action-btn danger" onclick="uiManager.deleteStaff('${operator.id}')">
                                🗑️ Eliminar
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="staff-status">
                    <span class="status-badge ${operator.active ? 'active' : 'inactive'}">
                        ${operator.active ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                </div>
            </div>
        `;
    }
    
    getRoleDisplayName(role) {
        const roles = {
            admin: 'Administrador',
            supervisor: 'Supervisor',
            cashier: 'Cajero'
        };
        return roles[role] || role;
    }
    
    showAddStaffModal() {
        const formHTML = this.createForm([
            { type: 'text', name: 'name', label: 'Nombre', required: true },
            { type: 'select', name: 'role', label: 'Rol', required: true, options: [
                { value: 'cashier', label: 'Cajero' },
                { value: 'supervisor', label: 'Supervisor' },
                { value: 'admin', label: 'Administrador' }
            ]}
        ], (data) => {
            const operator = window.dataManager.addOperator(data);
            if (operator) {
                this.showNotification('Operario agregado exitosamente', 'success');
                this.loadStaffManagement();
                this.closeModal();
            }
        }, 'Agregar Operario');
        
        this.showModal({
            title: '👤 Agregar Nuevo Operario',
            body: formHTML
        });
    }
    
    editStaff(id) {
        const operator = window.dataManager.getOperator(id);
        if (!operator) return;
        
        const formHTML = this.createForm([
            { type: 'text', name: 'name', label: 'Nombre', required: true, value: operator.name },
            { type: 'select', name: 'role', label: 'Rol', required: true, value: operator.role, options: [
                { value: 'cashier', label: 'Cajero' },
                { value: 'supervisor', label: 'Supervisor' },
                { value: 'admin', label: 'Administrador' }
            ]}
        ], (data) => {
            const updated = window.dataManager.updateOperator(id, data);
            if (updated) {
                this.showNotification('Operario actualizado exitosamente', 'success');
                this.loadStaffManagement();
                this.closeModal();
            }
        }, 'Actualizar');
        
        this.showModal({
            title: '✏️ Editar Operario',
            body: formHTML
        });
    }
    
    deleteStaff(id) {
        const operator = window.dataManager.getOperator(id);
        if (!operator) return;
        
        this.showConfirmDialog(
            `¿Estás seguro que quieres eliminar a ${operator.name}?`,
            () => {
                if (window.dataManager.deleteOperator(id)) {
                    this.showNotification('Operario eliminado exitosamente', 'success');
                    this.loadStaffManagement();
                }
            }
        );
    }
}

// Crear instancia global
window.uiManager = new UIManager();
window.ui = window.uiManager; // Alias más corto

// ================================
// FUNCIONES GLOBALES PARA MODALES
// ================================

// Funciones para cerrar modales específicos
function closeSaleConfirmModal() {
    try {
        window.ui.closeSpecificModal('sale-confirmation-modal');
    } catch (error) {
        console.error('Error closing sale confirm modal:', error);
    }
}

// closeCashMovementModal eliminada - obsoleta, ahora se usa sistema unificado

function closeCloseCashModal() {
    try {
        window.ui.closeSpecificModal('close-cash-modal');
    } catch (error) {
        console.error('Error closing cash close modal:', error);
    }
}

// Funciones para abrir modales específicos
function openSaleConfirmModal() {
    try {
        window.ui.openSpecificModal('sale-confirmation-modal');
    } catch (error) {
        console.error('Error opening sale confirm modal:', error);
    }
}

// openCashMovementModal eliminada - obsoleta, ahora se usa sistema unificado

function openCloseCashModal() {
    try {
        window.ui.openSpecificModal('close-cash-modal');
    } catch (error) {
        console.error('Error opening cash close modal:', error);
    }
}

// Función para cerrar emoji selector
function closeEmojiSelector() {
    try {
        if (window.emojiSelector) {
            window.emojiSelector.hide();
        }
    } catch (error) {
        console.error('Error closing emoji selector:', error);
    }
}

// ================================
// FUNCIONES DE DEBUG
// ================================

// Función para verificar que todos los sistemas funcionan
function debugSystem() {
    console.log('🔍 === ESTADO DEL SISTEMA ===');
    console.log('UIManager:', window.uiManager ? '✅' : '❌');
    console.log('DataManager:', window.dataManager ? '✅' : '❌');
    console.log('AuthSystem:', window.authSystem ? '✅' : '❌');
    console.log('CashRegister:', window.cashRegister ? '✅' : '❌');
    console.log('InventoryManager:', window.inventoryManager ? '✅' : '❌');
    console.log('EmojiSelector:', window.emojiSelector ? '✅' : '❌');
    
    console.log('\n🔍 === ESTADO DE MODALES ===');
            const modals = ['modal-overlay', 'sale-confirmation-modal', 'close-cash-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        console.log(`${modalId}:`, modal ? '✅' : '❌');
    });
    
    console.log('\n🔍 === BOTONES PRINCIPALES ===');
    const buttons = ['open-cash-btn', 'show-payment-btn', 'confirm-sale-btn', 'cancel-sale-modal-btn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        console.log(`${btnId}:`, btn ? '✅' : '❌');
    });
}

// Función para forzar reinicialización
function fixModalIssues() {
    console.log('🔧 Intentando corregir problemas de modales...');
    if (window.uiManager) {
        window.uiManager.reinitializeEventListeners();
    }
    console.log('✅ Reinicialización completada');
}

// Función para mostrar información del sistema
function systemInfo() {
    console.log('🏪 === INFORMACIÓN DEL SISTEMA ===');
    console.log('Versión: Caja Virtual v1.0.0');
    console.log('Estado: Completamente funcional');
    console.log('Funciones disponibles:');
    console.log('  - debugSystem(): Verificar estado del sistema');
    console.log('  - fixModalIssues(): Corregir problemas de modales');
    console.log('  - testHamburger(): Probar funcionalidad del menú hamburguesa');
    console.log('  - systemInfo(): Mostrar esta información');
}

// Función específica para probar el menú hamburguesa
function testHamburger() {
    console.log('🍔 === PRUEBA DE MENÚ HAMBURGUESA ===');
    
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    
    console.log('Botón hamburguesa:', menuToggle ? '✅' : '❌');
    console.log('Sidebar:', sidebar ? '✅' : '❌');
    
    if (menuToggle && sidebar) {
        console.log('Estado actual sidebar:', window.uiManager.sidebarOpen ? 'Abierto' : 'Cerrado');
        
        // Simular click
        console.log('🔄 Simulando click en hamburguesa...');
        menuToggle.click();
        
        setTimeout(() => {
            console.log('Estado después del click:', window.uiManager.sidebarOpen ? 'Abierto ✅' : 'Cerrado ❌');
        }, 500);
    } else {
        console.log('❌ Elementos no encontrados');
    }
} 