// ================================
// ARREGLO ESPECÍFICO PARA SIDEBAR
// ================================

console.log('🔧 Iniciando diagnóstico y arreglo del sidebar...');

// Función para diagnosticar y arreglar el sidebar
function fixSidebarIssues() {
    console.log('🔍 === DIAGNÓSTICO COMPLETO DEL SIDEBAR ===');
    
    // 1. Verificar elementos del DOM
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    
    console.log('📱 Menu toggle button:', menuToggle ? '✅ Encontrado' : '❌ No encontrado');
    console.log('📋 Sidebar element:', sidebar ? '✅ Encontrado' : '❌ No encontrado');
    console.log('❌ Close sidebar button:', closeSidebar ? '✅ Encontrado' : '❌ No encontrado');
    
    if (!menuToggle || !sidebar) {
        console.error('❌ ELEMENTOS CRÍTICOS NO ENCONTRADOS');
        return false;
    }
    
    // 2. Verificar clases CSS
    console.log('🎨 Clases actuales del sidebar:', sidebar.className);
    console.log('📍 Posición actual left:', getComputedStyle(sidebar).left);
    console.log('🔄 Transición CSS:', getComputedStyle(sidebar).transition);
    
    // 3. Verificar estado del UIManager
    if (window.uiManager) {
        console.log('🎯 UIManager encontrado:', '✅');
        console.log('📊 Estado sidebar abierto:', window.uiManager.sidebarOpen);
    } else {
        console.log('🎯 UIManager:', '❌ No encontrado');
    }
    
    // 4. Limpiar eventos previos y reagregar
    console.log('🧹 Limpiando y reestableciendo eventos...');
    
    // Clonar elementos para limpiar todos los eventos
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
    
    if (closeSidebar) {
        const newCloseSidebar = closeSidebar.cloneNode(true);
        closeSidebar.parentNode.replaceChild(newCloseSidebar, closeSidebar);
    }
    
    // 5. Reestablecer eventos con funciones simples
    const newMenuToggleElement = document.getElementById('menu-toggle');
    const newCloseSidebarElement = document.getElementById('close-sidebar');
    
    let sidebarOpen = false;
    
    function toggleSidebar() {
        console.log('🍔 Toggle sidebar llamado. Estado actual:', sidebarOpen ? 'Abierto' : 'Cerrado');
        
        sidebarOpen = !sidebarOpen;
        
        if (sidebarOpen) {
            sidebar.classList.add('active');
            console.log('✅ Sidebar abierto - clase "active" agregada');
            
            // Actualizar UIManager si existe
            if (window.uiManager) {
                window.uiManager.sidebarOpen = true;
            }
            
            // Crear overlay para móvil
            createSidebarOverlay();
        } else {
            sidebar.classList.remove('active');
            console.log('✅ Sidebar cerrado - clase "active" removida');
            
            // Actualizar UIManager si existe
            if (window.uiManager) {
                window.uiManager.sidebarOpen = false;
            }
            
            // Remover overlay
            removeSidebarOverlay();
        }
        
        // Verificar estado después del cambio
        setTimeout(() => {
            const computedLeft = getComputedStyle(sidebar).left;
            console.log('📍 Nueva posición left:', computedLeft);
            console.log('🔄 Estado final del sidebar:', sidebarOpen ? 'Abierto ✅' : 'Cerrado ✅');
        }, 100);
    }
    
    function createSidebarOverlay() {
        // Remover overlay existente
        removeSidebarOverlay();
        
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay active';
        overlay.id = 'sidebar-overlay-fix';
        
        overlay.addEventListener('click', toggleSidebar);
        
        document.body.appendChild(overlay);
        console.log('🌫️ Overlay del sidebar creado');
    }
    
    function removeSidebarOverlay() {
        const overlay = document.getElementById('sidebar-overlay-fix');
        if (overlay) {
            overlay.remove();
            console.log('🌫️ Overlay del sidebar removido');
        }
    }
    
    // 6. Agregar eventos mejorados
    newMenuToggleElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🍔 Click en hamburguesa detectado');
        toggleSidebar();
    });
    
    if (newCloseSidebarElement) {
        newCloseSidebarElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('❌ Click en cerrar sidebar detectado');
            if (sidebarOpen) {
                toggleSidebar();
            }
        });
    }
    
    // 7. Manejar clicks fuera del sidebar
    document.addEventListener('click', function(e) {
        if (sidebarOpen && !sidebar.contains(e.target) && 
            e.target !== newMenuToggleElement && 
            !newMenuToggleElement.contains(e.target)) {
            console.log('👆 Click fuera del sidebar detectado');
            toggleSidebar();
        }
    });
    
    // 8. Exponer función de prueba
    window.testSidebarFixed = function() {
        console.log('🧪 === PRUEBA DEL SIDEBAR ARREGLADO ===');
        console.log('Estado actual:', sidebarOpen ? 'Abierto' : 'Cerrado');
        toggleSidebar();
        setTimeout(() => {
            console.log('Estado después de la prueba:', sidebarOpen ? 'Abierto' : 'Cerrado');
        }, 500);
    };
    
    console.log('✅ SIDEBAR ARREGLADO EXITOSAMENTE');
    console.log('🧪 Para probar manualmente ejecuta: testSidebarFixed()');
    
    return true;
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixSidebarIssues);
} else {
    // Si ya está cargado, ejecutar inmediatamente
    setTimeout(fixSidebarIssues, 100);
} 