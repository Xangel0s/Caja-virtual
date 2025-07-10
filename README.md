# 🏪 Caja Virtual - Sistema de Punto de Venta

Una aplicación web completa para la gestión de una caja virtual/punto de venta, desarrollada con HTML, CSS y JavaScript puro. Ideal para pequeños negocios, tiendas, restaurantes o cualquier establecimiento que necesite un sistema de caja robusto y fácil de usar.

## ✨ Características Principales

### 🔐 Gestión de Usuarios
- **Sistema de Login**: Autenticación por nombre de operario
- **Autocompletado**: Sugerencias de operarios registrados
- **Administración de Personal**: Agregar, editar y eliminar operarios
- **Estadísticas por Operario**: Resumen de ventas y sesiones

### 💰 Punto de Venta
- **Apertura de Caja**: Configurar monto inicial
- **Transacciones Manuales**: Registrar entradas y salidas
- **Venta de Productos**: Carrito de compras con productos del inventario
- **Seguimiento en Tiempo Real**: Saldo actual y historial de movimientos
- **Cierre de Caja**: Cuadre automático con diferencias

### 📦 Gestión de Inventario
- **Catálogo de Productos**: Nombre, precio, stock y emoji representativo
- **Control de Stock**: Actualización automática con las ventas
- **Alertas de Stock**: Productos sin stock o con stock bajo
- **Edición Masiva**: Importar/exportar inventario en CSV

### 📊 Historial de Ventas

El historial de ventas es un módulo completo de análisis y reportes que incluye:

**🔍 Filtros Avanzados:**
- **Rango de fechas**: Desde/hasta con calendarios interactivos
- **Por operario**: Filtrar ventas por empleado específico
- **Por producto**: Ver ventas de productos específicos
- **Por monto**: Filtrar ventas con monto mínimo
- **Búsqueda**: Buscar por texto en productos, operarios o montos

**📈 Análisis por Pestañas:**
1. **Lista de Ventas**: Vista detallada con paginación
2. **Por Producto**: Análisis de rendimiento por producto
3. **Por Operario**: Estadísticas de desempeño por empleado
4. **Gráficos**: Visualizaciones interactivas con Chart.js

**📋 Funcionalidades de Lista:**
- Paginación inteligente (10 ventas por página)
- Ordenamiento múltiple (fecha, monto)
- Búsqueda en tiempo real
- Detalles expandidos por venta
- Información completa de productos vendidos

**📊 Análisis de Productos:**
- Gráfico de barras con top 10 productos
- Tabla con estadísticas detalladas
- Cantidad vendida, total de ventas, promedio
- Número de transacciones por producto

**👥 Análisis de Operarios:**
- Gráfico circular de distribución de ventas
- Tabla de rendimiento por empleado
- Número de ventas, total vendido, ticket promedio
- Cantidad de productos vendidos por operario

**📈 Gráficos Interactivos:**
- **Ventas por Día**: Línea de tiempo con tendencias
- **Ventas por Hora**: Patrón de actividad diaria
- **Top 5 Productos**: Gráfico circular de favoritos
- **Evolución de Ventas**: Tendencia dual (cantidad y monto)

**📑 Reportes Exportables:**
- **CSV**: Datos completos con resumen ejecutivo
- **PDF**: Reporte profesional con gráficos
- Nombres de archivo automáticos con fecha
- Resumen estadístico incluido

**🔄 Actualización Automática:**
- Recarga automática de filtros cuando hay nuevos datos
- Actualización de gráficos en tiempo real
- Sincronización con ventas de la caja
- Persistencia de filtros aplicados

**📱 Responsive Design:**
- Optimizado para móviles y tablets
- Navegación por pestañas adaptativa
- Gráficos responsivos
- Filtros adaptables a pantalla pequeña

### 📚 Historial de Cierres
- **Registro Completo**: Todas las sesiones de caja cerradas
- **Información Detallada**: Operario, fechas, montos y diferencias
- **Búsqueda y Filtros**: Por fecha, operario o monto

### 📄 Reportes y Descargas
- **Reportes TXT**: Archivos de texto plano con resumen completo
- **Reportes PDF**: Documentos profesionales con gráficos
- **Gráficos Visuales**: Proporción de ingresos vs gastos
- **Exportación de Datos**: CSV para inventario y ventas

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere servidor web (funciona localmente)
- JavaScript habilitado

### Instrucciones de Instalación

1. **Descarga los archivos**:
   - Descarga todos los archivos del proyecto
   - Asegúrate de mantener la estructura de carpetas

2. **Abre la aplicación**:
   - Abre el archivo `index.html` en tu navegador
   - O arrastra el archivo al navegador

3. **Primer uso**:
   - Ingresa tu nombre como operario
   - El sistema creará productos de ejemplo automáticamente
   - Comienza a usar la caja virtual

## 📱 Interfaz de Usuario

### Menú Principal (Hamburguesa)
- **Caja**: Punto de venta principal
- **Inventario**: Gestión de productos
- **Historial de Ventas**: Consultar ventas por fecha
- **Historial de Cierres**: Ver sesiones de caja cerradas
- **Personal**: Administrar operarios
- **Cerrar Sesión**: Salir del usuario actual

### Navegación
- **Responsive**: Funciona perfectamente en móviles, tablets y escritorio
- **Atajos de Teclado**: Ctrl+1 (Caja), Ctrl+2 (Inventario), etc.
- **Escape**: Cerrar modales y menús

## 🔧 Funcionalidades Detalladas

### Flujo de Trabajo Típico

1. **Iniciar Sesión**:
   - Ingresa tu nombre de operario
   - El sistema te recordará para futuras sesiones

2. **Abrir Caja**:
   - Haz clic en "Abrir Caja"
   - Ingresa el monto inicial
   - La caja queda lista para operar

3. **Realizar Ventas**:
   - **Método 1**: Usa la pestaña "Productos" para vender del inventario
   - **Método 2**: Usa la pestaña "Manual" para transacciones personalizadas
   - El saldo se actualiza automáticamente

4. **Cerrar Caja**:
   - Haz clic en "Cerrar Caja"
   - Ingresa el monto físico contado
   - Descarga reportes en TXT o PDF

### Gestión de Productos

- **Agregar Productos**: Nombre, precio, stock y emoji
- **Editar Productos**: Modificar información existente
- **Control de Stock**: Se actualiza automáticamente con las ventas
- **Alertas Visuales**: Productos sin stock aparecen deshabilitados

### Reportes Avanzados

#### Reporte TXT
- Información completa de la sesión
- Detalle de todos los movimientos
- Estadísticas y resumen financiero
- Formato legible y estructurado

#### Reporte PDF
- Documento profesional con gráficos
- Diseño limpio y organizado
- Gráficos de torta para ingresos vs gastos
- Listo para imprimir o compartir

## 💾 Almacenamiento de Datos

### LocalStorage
- **Persistencia**: Todos los datos se guardan en el navegador
- **Backup Automático**: Respaldos automáticos cada hora
- **Exportación**: Posibilidad de exportar todos los datos

### Estructura de Datos
```javascript
// Productos
{
  id: 1,
  name: "Coca Cola",
  price: 2.50,
  stock: 50,
  emoji: "🥤"
}

// Sesiones de Caja
{
  id: 1234567890,
  operator: "Juan Pérez",
  startTime: "2024-01-15T09:00:00Z",
  endTime: "2024-01-15T18:00:00Z",
  startAmount: 100.00,
  physicalAmount: 520.00,
  transactions: [...],
  totals: {
    income: 450.00,
    expenses: 30.00,
    calculatedBalance: 520.00,
    difference: 0.00
  }
}
```

## 🔒 Seguridad y Privacidad

- **Datos Locales**: Toda la información se almacena localmente
- **Sin Conexión**: No se envía información a servidores externos
- **Backup Manual**: Exporta tus datos cuando lo necesites
- **Limpieza**: Opción para limpiar todos los datos

## 🎨 Personalización

### Productos por Defecto
Al iniciar por primera vez, se incluyen productos de ejemplo:
- Coca Cola 🥤
- Hamburguesa 🍔
- Pizza 🍕
- Agua 💧
- Café ☕
- Sándwich 🥪
- Papas Fritas 🍟
- Helado 🍦

### Configuración
- **Moneda**: Configurable (por defecto $)
- **Nombre del Negocio**: Personalizable
- **Umbral de Stock Bajo**: Configurable (por defecto 10)

## 🛠️ Soporte Técnico

### Problemas Comunes

1. **Los datos no se guardan**:
   - Verifica que JavaScript esté habilitado
   - Asegúrate de no estar en modo incógnito

2. **Error al generar PDF**:
   - Verifica conexión a internet (se requiere para las librerías)
   - Usa un navegador moderno

3. **Aplicación lenta**:
   - Limpia el historial del navegador
   - Exporta datos y reinicia la aplicación

### Funciones de Debug

Abre la consola del navegador (F12) y usa:
```javascript
debugApp()          // Información de debug
runDiagnostics()    // Diagnósticos del sistema
restartApp()        // Reiniciar aplicación
resetApp()          // Resetear todos los datos
```

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Dispositivos
- ✅ Desktop/Laptop
- ✅ Tablets
- ✅ Smartphones
- ✅ Pantallas táctiles

## 🔮 Funcionalidades Avanzadas

### Atajos de Teclado
- `Ctrl/Cmd + 1`: Ir a Caja
- `Ctrl/Cmd + 2`: Ir a Inventario
- `Ctrl/Cmd + 3`: Ir a Historial de Ventas
- `Ctrl/Cmd + 4`: Ir a Historial de Cierres
- `Ctrl/Cmd + 5`: Ir a Personal
- `Escape`: Cerrar modal/menú

### Características Responsive
- Menú hamburguesa en dispositivos móviles
- Layouts adaptables según el tamaño de pantalla
- Optimizado para uso táctil

## 📈 Estadísticas y Métricas

### Por Operario
- Total de sesiones trabajadas
- Cantidad de ventas realizadas
- Monto total vendido
- Ticket promedio

### Por Producto
- Productos más vendidos
- Valor total en inventario
- Alertas de stock bajo

### Por Período
- Ventas diarias, semanales, mensuales
- Comparativas de rendimiento
- Gráficos de tendencias

## 🎯 Casos de Uso Ideales

- **Tiendas de conveniencia**
- **Restaurantes pequeños**
- **Cafeterías**
- **Kioscos**
- **Puestos de mercado**
- **Eventos temporales**
- **Negocios familiares**

## 📞 Contacto y Soporte

Esta aplicación es de código abierto y está disponible para uso libre. Para reportar problemas o sugerir mejoras, puedes:

1. Revisar el código fuente
2. Reportar bugs encontrados
3. Proponer nuevas funcionalidades
4. Contribuir con mejoras

## 📜 Licencia

Este proyecto está bajo licencia MIT. Puedes usar, modificar y distribuir libremente.

---

**¡Gracias por usar Caja Virtual! 🏪**

_Desarrollado con ❤️ para pequeños negocios_ 