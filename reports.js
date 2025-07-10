// ================================
// REPORTS MANAGER - Sistema de Reportes y Exportación
// ================================

class ReportsManager {
    constructor() {
        this.config = {
            storeName: 'Caja Virtual',
            logo: '🏪',
            address: '',
            phone: '',
            email: ''
        };
        
        this.loadConfig();
    }

    // ================================
    // CONFIGURACIÓN
    // ================================
    
    loadConfig() {
        const systemConfig = window.dataManager.getConfig();
        if (systemConfig) {
            this.config = {
                ...this.config,
                storeName: systemConfig.storeName || 'Caja Virtual'
            };
        }
    }

    // ================================
    // EXPORTACIÓN A CSV
    // ================================
    
    exportSalesToCSV(sales = null) {
        try {
            const salesData = sales || window.dataManager.getSales();
            
            if (salesData.length === 0) {
                window.uiManager.showNotification('No hay datos para exportar', 'warning');
                return;
            }
            
            const csvData = this.prepareSalesCSVData(salesData);
            const csvString = this.arrayToCSV(csvData);
            
            const fileName = `ventas_${this.formatDateForFile(new Date())}.csv`;
            this.downloadFile(csvString, fileName, 'text/csv');
            
            window.uiManager.showNotification(`Archivo CSV descargado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            window.uiManager.showNotification('Error al exportar a CSV', 'error');
        }
    }
    
    prepareSalesCSVData(sales) {
        const headers = [
            'ID Venta',
            'Fecha',
            'Hora',
            'Operario',
            'Productos',
            'Cantidad Total',
            'Subtotal',
            'Total',
            'Método de Pago',
            'Efectivo Recibido',
            'Cambio',
            'Referencia'
        ];
        
        const data = [headers];
        
        sales.forEach(sale => {
            const saleDate = new Date(sale.timestamp);
            const dateStr = saleDate.toLocaleDateString('es-ES');
            const timeStr = saleDate.toLocaleTimeString('es-ES');
            
            const products = sale.items.map(item => `${item.description} (${item.quantity})`).join('; ');
            const totalQuantity = sale.items.reduce((sum, item) => sum + item.quantity, 0);
            
            const row = [
                sale.id,
                dateStr,
                timeStr,
                sale.operatorName,
                products,
                totalQuantity,
                sale.total.toFixed(2),
                sale.total.toFixed(2),
                this.getPaymentMethodName(sale.paymentMethod),
                (sale.cashReceived || 0).toFixed(2),
                (sale.change || 0).toFixed(2),
                sale.reference || ''
            ];
            
            data.push(row);
        });
        
        return data;
    }
    
    exportInventoryToCSV() {
        try {
            const products = window.dataManager.getProducts();
            
            if (products.length === 0) {
                window.uiManager.showNotification('No hay productos para exportar', 'warning');
                return;
            }
            
            const csvData = this.prepareInventoryCSVData(products);
            const csvString = this.arrayToCSV(csvData);
            
            const fileName = `inventario_${this.formatDateForFile(new Date())}.csv`;
            this.downloadFile(csvString, fileName, 'text/csv');
            
            window.uiManager.showNotification(`Archivo CSV descargado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error exporting inventory to CSV:', error);
            window.uiManager.showNotification('Error al exportar inventario a CSV', 'error');
        }
    }
    
    prepareInventoryCSVData(products) {
        const headers = [
            'ID',
            'Nombre',
            'Emoji',
            'Precio',
            'Stock',
            'Categoría',
            'Estado',
            'Fecha Creación'
        ];
        
        const data = [headers];
        
        products.forEach(product => {
            const createdDate = new Date(product.createdAt).toLocaleDateString('es-ES');
            
            const row = [
                product.id,
                product.name,
                product.emoji || '',
                product.price.toFixed(2),
                product.stock,
                product.category || '',
                product.active ? 'Activo' : 'Inactivo',
                createdDate
            ];
            
            data.push(row);
        });
        
        return data;
    }
    
    arrayToCSV(data) {
        return data.map(row => {
            return row.map(field => {
                // Escapar comillas y campos que contengan comas
                if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
                    return `"${field.replace(/"/g, '""')}"`;
                }
                return field;
            }).join(',');
        }).join('\n');
    }

    // ================================
    // EXPORTACIÓN A PDF
    // ================================
    
    exportSalesToPDF(sales = null) {
        try {
            const salesData = sales || window.dataManager.getSales();
            
            if (salesData.length === 0) {
                window.uiManager.showNotification('No hay datos para exportar', 'warning');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            this.addPDFHeader(doc, 'Reporte de Ventas');
            this.addSalesTable(doc, salesData);
            this.addPDFFooter(doc);
            
            const fileName = `reporte_ventas_${this.formatDateForFile(new Date())}.pdf`;
            doc.save(fileName);
            
            window.uiManager.showNotification(`Archivo PDF descargado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            window.uiManager.showNotification('Error al exportar a PDF', 'error');
        }
    }
    
    exportInventoryToPDF() {
        try {
            const products = window.dataManager.getProducts();
            
            if (products.length === 0) {
                window.uiManager.showNotification('No hay productos para exportar', 'warning');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            this.addPDFHeader(doc, 'Reporte de Inventario');
            this.addInventoryTable(doc, products);
            this.addPDFFooter(doc);
            
            const fileName = `reporte_inventario_${this.formatDateForFile(new Date())}.pdf`;
            doc.save(fileName);
            
            window.uiManager.showNotification(`Archivo PDF descargado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error exporting inventory to PDF:', error);
            window.uiManager.showNotification('Error al exportar inventario a PDF', 'error');
        }
    }
    
    exportClosureReportToPDF(closure) {
        try {
            if (!closure) {
                window.uiManager.showNotification('No hay datos de cierre para exportar', 'warning');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            this.addPDFHeader(doc, 'Reporte de Cierre de Caja');
            this.addClosureDetails(doc, closure);
            this.addPDFFooter(doc);
            
            const closureDate = new Date(closure.closedAt).toLocaleDateString('es-ES').replace(/\//g, '-');
            const fileName = `cierre_caja_${closureDate}_${closure.operatorName.replace(/\s+/g, '_')}.pdf`;
            doc.save(fileName);
            
            window.uiManager.showNotification(`Reporte de cierre descargado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error exporting closure report:', error);
            window.uiManager.showNotification('Error al generar reporte de cierre', 'error');
        }
    }
    
    addPDFHeader(doc, title) {
        // Logo y nombre de la tienda
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`${this.config.logo} ${this.config.storeName}`, 20, 20);
        
        // Título del reporte
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text(title, 20, 35);
        
        // Fecha de generación
        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 20, 45);
        
        // Línea separadora
        doc.setLineWidth(0.5);
        doc.line(20, 50, 190, 50);
        
        return 55; // Retorna la posición Y para continuar
    }
    
    addSalesTable(doc, sales) {
        let y = 60;
        const pageHeight = 280;
        
        // Estadísticas generales
        const totalSales = sales.length;
        const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
        const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen General:', 20, y);
        y += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Total de ventas: ${totalSales}`, 20, y);
        doc.text(`Monto total: $${totalAmount.toFixed(2)}`, 100, y);
        y += 7;
        doc.text(`Ticket promedio: $${averageTicket.toFixed(2)}`, 20, y);
        y += 15;
        
        // Tabla de ventas
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Detalle de Ventas:', 20, y);
        y += 10;
        
        // Headers de tabla
        const headers = ['Fecha', 'Operario', 'Productos', 'Total', 'Pago'];
        const colWidths = [25, 35, 60, 25, 25];
        let x = 20;
        
        doc.setFont('helvetica', 'bold');
        headers.forEach((header, i) => {
            doc.text(header, x, y);
            x += colWidths[i];
        });
        y += 5;
        
        // Línea bajo headers
        doc.setLineWidth(0.3);
        doc.line(20, y, 190, y);
        y += 5;
        
        // Datos de ventas
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        sales.forEach(sale => {
            if (y > pageHeight) {
                doc.addPage();
                y = 20;
            }
            
            const saleDate = new Date(sale.timestamp).toLocaleDateString('es-ES');
            const products = sale.items.length === 1 
                ? sale.items[0].description 
                : `${sale.items.length} productos`;
            
            x = 20;
            doc.text(saleDate, x, y);
            x += colWidths[0];
            
            doc.text(sale.operatorName.substring(0, 15), x, y);
            x += colWidths[1];
            
            doc.text(products.substring(0, 25), x, y);
            x += colWidths[2];
            
            doc.text(`$${sale.total.toFixed(2)}`, x, y);
            x += colWidths[3];
            
            doc.text(this.getPaymentMethodName(sale.paymentMethod), x, y);
            
            y += 6;
        });
    }
    
    addInventoryTable(doc, products) {
        let y = 60;
        const pageHeight = 280;
        
        // Estadísticas del inventario
        const activeProducts = products.filter(p => p.active);
        const totalValue = activeProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const lowStockCount = activeProducts.filter(p => p.stock <= 10).length;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen de Inventario:', 20, y);
        y += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Productos activos: ${activeProducts.length}`, 20, y);
        doc.text(`Valor total: $${totalValue.toFixed(2)}`, 100, y);
        y += 7;
        doc.text(`Productos con stock bajo: ${lowStockCount}`, 20, y);
        y += 15;
        
        // Tabla de productos
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Detalle de Productos:', 20, y);
        y += 10;
        
        // Headers
        const headers = ['Producto', 'Precio', 'Stock', 'Valor', 'Estado'];
        const colWidths = [60, 25, 20, 25, 25];
        let x = 20;
        
        doc.setFont('helvetica', 'bold');
        headers.forEach((header, i) => {
            doc.text(header, x, y);
            x += colWidths[i];
        });
        y += 5;
        
        doc.setLineWidth(0.3);
        doc.line(20, y, 175, y);
        y += 5;
        
        // Datos de productos
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        products.forEach(product => {
            if (y > pageHeight) {
                doc.addPage();
                y = 20;
            }
            
            x = 20;
            doc.text(`${product.emoji || ''} ${product.name}`.substring(0, 25), x, y);
            x += colWidths[0];
            
            doc.text(`$${product.price.toFixed(2)}`, x, y);
            x += colWidths[1];
            
            doc.text(product.stock.toString(), x, y);
            x += colWidths[2];
            
            doc.text(`$${(product.price * product.stock).toFixed(2)}`, x, y);
            x += colWidths[3];
            
            doc.text(product.active ? 'Activo' : 'Inactivo', x, y);
            
            y += 6;
        });
    }
    
    addClosureDetails(doc, closure) {
        let y = 60;
        
        // Información del cierre
        const openDate = new Date(closure.openedAt);
        const closeDate = new Date(closure.closedAt);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Información del Cierre:', 20, y);
        y += 15;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Detalles del operario y fechas
        doc.text(`Operario: ${closure.operatorName}`, 20, y);
        y += 8;
        doc.text(`Apertura: ${openDate.toLocaleString('es-ES')}`, 20, y);
        y += 8;
        doc.text(`Cierre: ${closeDate.toLocaleString('es-ES')}`, 20, y);
        y += 15;
        
        // Resumen financiero
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen Financiero:', 20, y);
        y += 15;
        
        doc.setFont('helvetica', 'normal');
        
        // Efectivo
        doc.text('EFECTIVO:', 20, y);
        y += 8;
        doc.text(`Inicial: $${closure.initialAmount.toFixed(2)}`, 30, y);
        y += 6;
        
        const cashSales = this.calculateCashSales(closure);
        doc.text(`Ventas en efectivo: $${cashSales.toFixed(2)}`, 30, y);
        y += 6;
        
        const expectedCash = closure.initialAmount + cashSales;
        doc.text(`Esperado: $${expectedCash.toFixed(2)}`, 30, y);
        y += 6;
        doc.text(`Real: $${closure.realCashAmount.toFixed(2)}`, 30, y);
        y += 6;
        
        const cashDifference = closure.realCashAmount - expectedCash;
        const diffText = cashDifference === 0 ? 'Exacto' : 
                        cashDifference > 0 ? `Sobrante: $${cashDifference.toFixed(2)}` :
                        `Faltante: $${Math.abs(cashDifference).toFixed(2)}`;
        doc.text(`Diferencia: ${diffText}`, 30, y);
        y += 15;
        
        // Pagos digitales
        doc.text('PAGOS DIGITALES:', 20, y);
        y += 8;
        doc.text(`Total digital: $${closure.currentDigitalAmount.toFixed(2)}`, 30, y);
        y += 15;
        
        // Total general
        doc.setFont('helvetica', 'bold');
        const totalExpected = expectedCash + closure.currentDigitalAmount;
        const totalReal = closure.realCashAmount + closure.currentDigitalAmount;
        
        doc.text(`TOTAL ESPERADO: $${totalExpected.toFixed(2)}`, 20, y);
        y += 8;
        doc.text(`TOTAL REAL: $${totalReal.toFixed(2)}`, 20, y);
        
        // Notas de cierre
        if (closure.closingNotes) {
            y += 20;
            doc.setFont('helvetica', 'bold');
            doc.text('Notas de Cierre:', 20, y);
            y += 10;
            doc.setFont('helvetica', 'normal');
            
            // Dividir texto en líneas si es muy largo
            const maxWidth = 170;
            const lines = doc.splitTextToSize(closure.closingNotes, maxWidth);
            lines.forEach(line => {
                doc.text(line, 20, y);
                y += 6;
            });
        }
    }
    
    addPDFFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            
            // Línea superior del footer
            doc.setLineWidth(0.3);
            doc.line(20, 285, 190, 285);
            
            // Texto del footer
            doc.text(`${this.config.storeName} - Sistema de Caja Virtual`, 20, 290);
            doc.text(`Página ${i} de ${pageCount}`, 150, 290);
        }
    }

    // ================================
    // REPORTES ESPECÍFICOS
    // ================================
    
    generateDailySalesReport(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const sales = window.dataManager.getSalesByDate(targetDate);
        
        if (sales.length === 0) {
            window.uiManager.showNotification('No hay ventas para la fecha seleccionada', 'warning');
            return;
        }
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            this.addPDFHeader(doc, `Reporte Diario - ${new Date(targetDate).toLocaleDateString('es-ES')}`);
            this.addDailySalesDetails(doc, sales, targetDate);
            this.addPDFFooter(doc);
            
            const fileName = `reporte_diario_${targetDate.replace(/-/g, '_')}.pdf`;
            doc.save(fileName);
            
            window.uiManager.showNotification(`Reporte diario descargado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error generating daily report:', error);
            window.uiManager.showNotification('Error al generar reporte diario', 'error');
        }
    }
    
    addDailySalesDetails(doc, sales, date) {
        let y = 60;
        
        // Estadísticas del día
        const stats = window.dataManager.getDailySalesStats(date);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Estadísticas del ${new Date(date).toLocaleDateString('es-ES')}:`, 20, y);
        y += 15;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        doc.text(`Número de ventas: ${stats.totalSales}`, 20, y);
        doc.text(`Productos vendidos: ${stats.productsSold}`, 100, y);
        y += 8;
        
        doc.text(`Efectivo: $${stats.cashAmount.toFixed(2)}`, 20, y);
        doc.text(`Digital: $${stats.digitalAmount.toFixed(2)}`, 100, y);
        y += 8;
        
        doc.text(`Total del día: $${stats.totalAmount.toFixed(2)}`, 20, y);
        doc.text(`Ticket promedio: $${stats.averageTicket.toFixed(2)}`, 100, y);
        y += 20;
        
        // Agregar tabla de ventas
        this.addSalesTable(doc, sales);
    }

    // ================================
    // UTILIDADES
    // ================================
    
    downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
    }
    
    formatDateForFile(date) {
        return date.toISOString().split('T')[0].replace(/-/g, '_');
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
    
    calculateCashSales(closure) {
        // Calcular ventas en efectivo del día
        const openDate = new Date(closure.openedAt).toISOString().split('T')[0];
        const sales = window.dataManager.getSalesByDate(openDate);
        
        return sales
            .filter(sale => sale.paymentMethod === 'cash')
            .reduce((sum, sale) => sum + sale.total, 0);
    }
    
    // Método público para generar reporte de producto específico
    generateProductReport(productId) {
        const product = window.dataManager.getProduct(productId);
        if (!product) {
            window.uiManager.showNotification('Producto no encontrado', 'error');
            return;
        }
        
        const sales = window.dataManager.getSales();
        const productSales = sales.filter(sale => 
            sale.items.some(item => item.productId === productId)
        );
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            this.addPDFHeader(doc, `Reporte de Producto: ${product.name}`);
            this.addProductSalesDetails(doc, product, productSales);
            this.addPDFFooter(doc);
            
            const fileName = `reporte_producto_${product.name.replace(/\s+/g, '_')}_${this.formatDateForFile(new Date())}.pdf`;
            doc.save(fileName);
            
            window.uiManager.showNotification(`Reporte de producto descargado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error generating product report:', error);
            window.uiManager.showNotification('Error al generar reporte de producto', 'error');
        }
    }
    
    addProductSalesDetails(doc, product, sales) {
        let y = 60;
        
        // Información del producto
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Información del Producto:', 20, y);
        y += 15;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        doc.text(`Nombre: ${product.emoji || ''} ${product.name}`, 20, y);
        y += 8;
        doc.text(`Precio actual: $${product.price.toFixed(2)}`, 20, y);
        y += 8;
        doc.text(`Stock actual: ${product.stock} unidades`, 20, y);
        y += 8;
        doc.text(`Categoría: ${product.category || 'Sin categoría'}`, 20, y);
        y += 15;
        
        // Estadísticas de ventas
        if (sales.length > 0) {
            const totalSold = sales.reduce((sum, sale) => {
                const item = sale.items.find(item => item.productId === product.id);
                return sum + (item ? item.quantity : 0);
            }, 0);
            
            const totalRevenue = sales.reduce((sum, sale) => {
                const item = sale.items.find(item => item.productId === product.id);
                return sum + (item ? item.total : 0);
            }, 0);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Estadísticas de Ventas:', 20, y);
            y += 15;
            
            doc.setFont('helvetica', 'normal');
            doc.text(`Total vendido: ${totalSold} unidades`, 20, y);
            y += 8;
            doc.text(`Ingresos generados: $${totalRevenue.toFixed(2)}`, 20, y);
            y += 8;
            doc.text(`Número de ventas: ${sales.length}`, 20, y);
            y += 15;
            
            // Lista de ventas recientes
            doc.setFont('helvetica', 'bold');
            doc.text('Ventas Recientes:', 20, y);
            y += 10;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            
            const recentSales = sales.slice(-15); // Últimas 15 ventas
            recentSales.forEach(sale => {
                const saleDate = new Date(sale.timestamp).toLocaleDateString('es-ES');
                const saleTime = new Date(sale.timestamp).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
                const item = sale.items.find(item => item.productId === product.id);
                
                if (item) {
                    doc.text(`${saleDate} ${saleTime} - ${item.quantity} unidades - $${item.total.toFixed(2)} - ${sale.operatorName}`, 20, y);
                    y += 5;
                }
                
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });
        } else {
            doc.setFont('helvetica', 'normal');
            doc.text('No se han registrado ventas para este producto.', 20, y);
        }
    }

    // ================================
    // TICKET INDIVIDUAL
    // ================================
    
    generateSaleTicket(sale) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurar ticket más pequeño (tamaño recibo)
            let y = 20;
            
            // Header del ticket
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(this.config.storeName, 20, y, { align: 'left' });
            y += 10;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(this.config.storeAddress || 'Dirección no configurada', 20, y);
            y += 6;
            doc.text(this.config.storePhone || 'Teléfono no configurado', 20, y);
            y += 15;
            
            // Línea separadora
            doc.setLineWidth(0.5);
            doc.line(20, y, 190, y);
            y += 10;
            
            // Información de la venta
            doc.setFont('helvetica', 'bold');
            doc.text(`TICKET DE VENTA #${sale.id.slice(-8).toUpperCase()}`, 20, y);
            y += 10;
            
            doc.setFont('helvetica', 'normal');
            const saleDate = new Date(sale.timestamp);
            doc.text(`Fecha: ${saleDate.toLocaleDateString('es-ES')}`, 20, y);
            doc.text(`Hora: ${saleDate.toLocaleTimeString('es-ES')}`, 120, y);
            y += 8;
            
            doc.text(`Operario: ${sale.operatorName}`, 20, y);
            doc.text(`Método: ${this.getPaymentMethodName(sale.paymentMethod)}`, 120, y);
            y += 15;
            
            // Productos
            doc.setFont('helvetica', 'bold');
            doc.text('PRODUCTOS:', 20, y);
            y += 8;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            
            sale.items.forEach(item => {
                // Línea del producto
                doc.text(`${item.emoji || '•'} ${item.description}`, 20, y);
                y += 6;
                
                // Cantidad y precio
                const quantityText = `${item.quantity} × $${item.price.toFixed(2)}`;
                const totalText = `$${item.total.toFixed(2)}`;
                doc.text(quantityText, 30, y);
                doc.text(totalText, 150, y, { align: 'right' });
                y += 8;
            });
            
            // Línea separadora
            y += 5;
            doc.setLineWidth(0.3);
            doc.line(20, y, 190, y);
            y += 10;
            
            // Total
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL:', 20, y);
            doc.text(`$${sale.total.toFixed(2)}`, 150, y, { align: 'right' });
            y += 15;
            
            // Información de pago
            if (sale.paymentMethod === 'cash' && sale.cashReceived > 0) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Efectivo recibido: $${sale.cashReceived.toFixed(2)}`, 20, y);
                y += 6;
                doc.text(`Cambio: $${(sale.change || 0).toFixed(2)}`, 20, y);
                y += 10;
            }
            
            if (sale.reference) {
                doc.text(`Referencia: ${sale.reference}`, 20, y);
                y += 10;
            }
            
            // Footer
            y += 10;
            doc.setLineWidth(0.3);
            doc.line(20, y, 190, y);
            y += 8;
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('¡Gracias por su compra!', 105, y, { align: 'center' });
            y += 6;
            doc.text(`Ticket generado el ${new Date().toLocaleString('es-ES')}`, 105, y, { align: 'center' });
            
            // Guardar el ticket
            const fileName = `ticket_${sale.id.slice(-8)}_${this.formatDateForFile(new Date())}.pdf`;
            doc.save(fileName);
            
            window.ui.showNotification(`Ticket descargado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error generating sale ticket:', error);
            window.ui.showNotification('Error al generar ticket', 'error');
        }
    }
}

// Crear instancia global
window.reportsManager = new ReportsManager(); 