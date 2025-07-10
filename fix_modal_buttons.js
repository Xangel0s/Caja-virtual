// ================================
// ARREGLO ESPECÍFICO PARA BOTONES DE MODALES
// ================================

console.log('🔧 Iniciando arreglo de botones de modales...');

// Función para diagnosticar y arreglar todos los eventos de modales
function fixModalButtonEvents() {
    console.log('🔍 === DIAGNÓSTICO DE BOTONES DE MODALES ===');
    
    // Lista de todos los botones de modales que necesitan eventos
    const modalButtons = [
        // Botones de confirmación de venta
        { id: 'confirm-sale-btn', action: 'confirmSale', context: 'cashRegister' },
        { id: 'cancel-sale-modal-btn', action: 'cancelSaleModal', context: 'cashRegister' },
        
        // Botones de movimiento de efectivo
        { id: 'confirm-movement-btn', action: 'confirmCashMovement', context: 'cashRegister' },
        { id: 'cancel-movement-btn', action: 'cancelCashMovement', context: 'cashRegister' },
        
        // Botones de cierre de caja
        { id: 'confirm-close-btn', action: 'confirmCloseCash', context: 'cashRegister' },
        { id: 'cancel-close-btn', action: 'cancelCloseCash', context: 'cashRegister' }
    ];
    
    // Función para limpiar y reestablecer eventos
    function reestablishButtonEvents() {
        modalButtons.forEach(buttonConfig => {
            const button = document.getElementById(buttonConfig.id);
            
            if (button) {
                console.log(`✅ Encontrado botón: ${buttonConfig.id}`);
                
                // Limpiar todos los eventos previos
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Agregar el nuevo evento
                const finalButton = document.getElementById(buttonConfig.id);
                
                finalButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log(`🔄 Ejecutando acción: ${buttonConfig.action}`);
                    
                    // Ejecutar la acción correspondiente
                    if (buttonConfig.context === 'cashRegister' && window.cashRegister) {
                        if (typeof window.cashRegister[buttonConfig.action] === 'function') {
                            window.cashRegister[buttonConfig.action]();
                        } else {
                            console.error(`❌ Función no encontrada: ${buttonConfig.action}`);
                        }
                    } else if (buttonConfig.context === 'inventory' && window.inventoryManager) {
                        if (typeof window.inventoryManager[buttonConfig.action] === 'function') {
                            window.inventoryManager[buttonConfig.action]();
                        }
                    }
                });
                
                console.log(`✅ Evento reestablecido para: ${buttonConfig.id}`);
            } else {
                console.log(`⚠️ Botón no encontrado: ${buttonConfig.id}`);
            }
        });
    }
    
    // Función especial para manejar formularios dinámicos de productos
    function fixProductFormEvents() {
        // Observer para detectar cuando se crean formularios de productos
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Buscar formularios de productos
                        const productForm = node.querySelector ? node.querySelector('.product-form') : null;
                        if (productForm || (node.classList && node.classList.contains('product-form'))) {
                            console.log('📝 Formulario de producto detectado, configurando eventos...');
                            setupProductFormEvents(productForm || node);
                        }
                        
                        // Buscar modal genérico
                        const modal = node.querySelector ? node.querySelector('.modal') : null;
                        if (modal || (node.classList && node.classList.contains('modal'))) {
                            setTimeout(() => {
                                console.log('📱 Modal detectado, reestableciendo eventos...');
                                reestablishButtonEvents();
                                fixFormSubmissions();
                            }, 100);
                        }
                    }
                });
            });
        });
        
        // Observar cambios en el DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👁️ Observer de formularios activado');
    }
    
    function setupProductFormEvents(form) {
        if (!form) return;
        
        // Manejar envío del formulario
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📤 Enviando formulario de producto...');
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Determinar si es agregar o editar
            const isEdit = form.dataset.productId || form.querySelector('[name="id"]');
            
            if (isEdit) {
                const productId = form.dataset.productId || form.querySelector('[name="id"]').value;
                if (window.inventoryManager && typeof window.inventoryManager.handleEditProduct === 'function') {
                    window.inventoryManager.handleEditProduct(productId, data);
                }
            } else {
                if (window.inventoryManager && typeof window.inventoryManager.handleAddProduct === 'function') {
                    window.inventoryManager.handleAddProduct(data);
                }
            }
        });
        
        // Manejar botón cancelar
        const cancelBtn = form.querySelector('.action-btn.secondary');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('❌ Cancelando formulario de producto...');
                if (window.uiManager && typeof window.uiManager.closeModal === 'function') {
                    window.uiManager.closeModal();
                }
            });
        }
        
        console.log('✅ Eventos de formulario de producto configurados');
    }
    
    function fixFormSubmissions() {
        // Arreglar todos los formularios dinámicos
        const forms = document.querySelectorAll('.product-form, .dynamic-form');
        forms.forEach(form => {
            if (!form.dataset.eventsFixed) {
                setupProductFormEvents(form);
                form.dataset.eventsFixed = 'true';
            }
        });
    }
    
    // Función para arreglar eventos globales de modales
    function fixGlobalModalEvents() {
        // Manejar todos los botones con onclick directo
        const buttonsWithOnclick = document.querySelectorAll('button[onclick], .action-btn[onclick]');
        buttonsWithOnclick.forEach(button => {
            const onclickValue = button.getAttribute('onclick');
            if (onclickValue && onclickValue.includes('closeModal')) {
                // Reemplazar onclick con event listener
                button.removeAttribute('onclick');
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (window.uiManager && typeof window.uiManager.closeModal === 'function') {
                        window.uiManager.closeModal();
                    }
                });
                console.log('✅ Evento onclick convertido a addEventListener para botón');
            }
        });
    }
    
    // Función de prueba para verificar que todo funcione
    window.testModalButtons = function() {
        console.log('🧪 === PRUEBA DE BOTONES DE MODALES ===');
        
        modalButtons.forEach(buttonConfig => {
            const button = document.getElementById(buttonConfig.id);
            if (button) {
                console.log(`✅ ${buttonConfig.id}: Disponible`);
                
                // Simular hover para verificar que responde
                button.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 200);
            } else {
                console.log(`❌ ${buttonConfig.id}: No encontrado`);
            }
        });
    };
    
    // Ejecutar todas las correcciones
    console.log('🔄 Reestableciendo eventos de botones...');
    reestablishButtonEvents();
    
    console.log('📝 Configurando manejo de formularios dinámicos...');
    fixProductFormEvents();
    
    console.log('🌐 Arreglando eventos globales...');
    fixGlobalModalEvents();
    
    console.log('📋 Arreglando formularios existentes...');
    fixFormSubmissions();
    
    console.log('🔧 Arreglando formularios dinámicos...');
    fixDynamicFormButtons();
    
    // Nueva función para arreglar botones de formularios dinámicos específicamente
    function fixDynamicFormButtons() {
        console.log('🔧 Arreglando botones de formularios dinámicos...');
        
        const dynamicForms = document.querySelectorAll('.dynamic-form');
        dynamicForms.forEach(form => {
            if (form.dataset.buttonEventsFixed === 'true') {
                console.log('⚠️ Eventos ya configurados para este formulario dinámico');
                return;
            }
            
            // Marcar como configurado
            form.dataset.buttonEventsFixed = 'true';
            
            // Encontrar botones submit y cancel
            const submitBtn = form.querySelector('button[type="submit"], .action-btn.primary');
            const cancelBtn = form.querySelector('button[type="button"], .action-btn.secondary, #cancel-form');
            
            if (submitBtn) {
                console.log('🔍 Arreglando botón submit en formulario dinámico...');
                
                // Limpiar eventos previos
                const newSubmitBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
                
                // Agregar nuevo evento
                const finalSubmitBtn = form.querySelector('button[type="submit"], .action-btn.primary');
                if (finalSubmitBtn) {
                    finalSubmitBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('📤 Botón submit clickeado, activando envío de formulario...');
                        
                        // Activar envío del formulario
                        const submitEvent = new Event('submit', {
                            bubbles: true,
                            cancelable: true
                        });
                        form.dispatchEvent(submitEvent);
                    });
                    console.log('✅ Evento submit reestablecido para formulario dinámico');
                }
            }
            
            if (cancelBtn) {
                console.log('🔍 Arreglando botón cancel en formulario dinámico...');
                
                // Limpiar eventos previos
                const newCancelBtn = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
                
                // Agregar nuevo evento
                const finalCancelBtn = form.querySelector('button[type="button"], .action-btn.secondary, #cancel-form');
                if (finalCancelBtn) {
                    finalCancelBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('❌ Botón cancelar clickeado, cerrando modal...');
                        
                        if (window.uiManager && typeof window.uiManager.closeModal === 'function') {
                            window.uiManager.closeModal();
                        }
                    });
                    console.log('✅ Evento cancel reestablecido para formulario dinámico');
                }
            }
        });
        
        console.log('✅ Botones de formularios dinámicos arreglados');
    }

    // Re-ejecutar cada vez que se abra un modal
    const originalShowModal = window.uiManager?.showModal;
    if (originalShowModal) {
        window.uiManager.showModal = function(...args) {
            const result = originalShowModal.apply(this, args);
            
            // Reestablecer eventos después de mostrar modal
            setTimeout(() => {
                console.log('🔄 Modal abierto, reestableciendo eventos...');
                reestablishButtonEvents();
                fixFormSubmissions();
                fixDynamicFormButtons();
            }, 150);
            
            return result;
        };
        console.log('🎯 Interceptor de showModal configurado');
    }
    
    console.log('✅ TODOS LOS BOTONES DE MODALES ARREGLADOS');
    console.log('🧪 Para probar ejecuta: testModalButtons()');
    
    return true;
}

// Ejecutar cuando todo esté cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(fixModalButtonEvents, 200);
    });
} else {
    setTimeout(fixModalButtonEvents, 200);
}

// Reinicializar cuando se cambien las secciones
document.addEventListener('sectionChanged', () => {
    setTimeout(fixModalButtonEvents, 100);
});

// Exponer funciones globalmente para debugging
window.fixModalButtonEvents = fixModalButtonEvents; 