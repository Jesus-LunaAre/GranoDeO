// Variables globales
let salesData = [];
let filteredData = [];
let uploadedFiles = [];
let charts = {};
let exportHistory = [];

// Elementos del DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadedFilesSection = document.getElementById('uploadedFiles');
const filesList = document.getElementById('filesList');
const totalFiles = document.getElementById('totalFiles');
const totalRecords = document.getElementById('totalRecords');
const activeStores = document.getElementById('activeStores');
const processingSection = document.getElementById('processingSection');
const progressFill = document.getElementById('progressFill');
const processingText = document.getElementById('processingText');

// Elementos de análisis
const analyticsDateFrom = document.getElementById('analyticsDateFrom');
const analyticsDateTo = document.getElementById('analyticsDateTo');
const analyticsStore = document.getElementById('analyticsStore');
const analyticsProduct = document.getElementById('analyticsProduct');
const applyAnalyticsFilters = document.getElementById('applyAnalyticsFilters');
const resetAnalyticsFilters = document.getElementById('resetAnalyticsFilters');
const analyticsTableBody = document.getElementById('analyticsTableBody');
const analyticsSearch = document.getElementById('analyticsSearch');
const analyticsSortBy = document.getElementById('analyticsSortBy');
const exportAnalytics = document.getElementById('exportAnalytics');

// Elementos de exportación
const exportExcel = document.getElementById('exportExcel');
const exportPDF = document.getElementById('exportPDF');
const createCustomReport = document.getElementById('createCustomReport');
const applyExportConfig = document.getElementById('applyExportConfig');
const resetExportConfig = document.getElementById('resetExportConfig');
const exportHistoryBody = document.getElementById('exportHistoryBody');
const exportPreview = document.getElementById('exportPreview');
const previewContent = document.getElementById('previewContent');

// Inicialización de la aplicación
function initializeApp() {
    setupNavigation();
    setupFileUpload();
    setupAnalytics();
    setupExport();
    loadData();
    setupReportsFilters();
    updateUI();
    initializeCharts();
}

// Configuración de navegación
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Navegación entre secciones
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos los links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al link clickeado
            link.classList.add('active');
            
            // Ocultar todas las secciones
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.classList.remove('active'));
            
            // Mostrar la sección correspondiente
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Actualizar UI según la sección activa
                if (targetId === 'dashboard') {
                    updateDashboardUI();
                } else if (targetId === 'analytics') {
                    updateAnalyticsUI();
                } else if (targetId === 'reports') {
                    updateReportsTable();
                }
            }
        });
    });
    
    // Toggle para navegación móvil
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Función para mostrar modales
function showModal(type, title, message) {
    let modalId = '';
    let messageId = '';
    
    switch (type) {
        case 'success':
            modalId = 'successModal';
            messageId = 'successMessage';
            break;
        case 'error':
            modalId = 'errorModal';
            messageId = 'errorMessage';
            break;
        case 'info':
            modalId = 'successModal'; // Usar success modal para info
            messageId = 'successMessage';
            break;
        default:
            modalId = 'successModal';
            messageId = 'successMessage';
    }
    
    const modal = document.getElementById(modalId);
    const messageElement = document.getElementById(messageId);
    
    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.style.display = 'flex';
    }
}

// Función para obtener número de semana
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Función para formatear fecha
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Función para cerrar modales
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para actualizar UI del dashboard
function updateDashboardUI() {
    updateKPIs();
    updateStoreFilter();
    if (salesData.length > 0) {
        initializeCharts();
    }
}

// Función para actualizar KPIs
function updateKPIs() {
    const totalSales = document.getElementById('totalSales');
    const totalProducts = document.getElementById('totalProducts');
    const activeStores = document.getElementById('activeStores');
    const growth = document.getElementById('growth');
    
    if (!totalSales || !totalProducts || !activeStores || !growth) return;
    
    const totalSalesAmount = salesData.reduce((sum, item) => sum + item.total, 0);
    const uniqueProducts = new Set(salesData.map(item => item.product));
    const uniqueStores = new Set(salesData.map(item => item.store));
    
    totalSales.textContent = `$${totalSalesAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    totalProducts.textContent = uniqueProducts.size;
    activeStores.textContent = uniqueStores.size;
    
    // Calcular crecimiento (simulado)
    const growthPercentage = Math.floor(Math.random() * 20) + 5;
    growth.textContent = `+${growthPercentage}%`;
}



// Función para actualizar filtro de tiendas
function updateStoreFilter() {
    const storeFilter = document.getElementById('storeFilter');
    const analyticsStore = document.getElementById('analyticsStore');
    
    const stores = [...new Set(salesData.map(item => item.store))];
    
    // Actualizar filtro de reportes
    if (storeFilter) {
        storeFilter.innerHTML = '<option value="">Todas las tiendas</option>';
        stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store;
            option.textContent = store;
            storeFilter.appendChild(option);
        });
    }
    
    // Actualizar filtro de analytics
    if (analyticsStore) {
        analyticsStore.innerHTML = '<option value="">Todas las tiendas</option>';
        stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store;
            option.textContent = store;
            analyticsStore.appendChild(option);
        });
    }
}

// Función para actualizar toda la UI
function updateUI() {
    updateDashboardUI();
    updateAnalyticsUI();
    updateFilesSummary();
    
    // Solo actualizar la tabla de reportes si la sección está activa
    const reportsSection = document.getElementById('reports');
    if (reportsSection && reportsSection.classList.contains('active')) {
        updateReportsTable();
    }
}

// Función para actualizar gráficos de análisis
function updateAnalyticsCharts() {
    // Esta función se implementará cuando se agreguen los gráficos de análisis
    console.log('Actualizando gráficos de análisis...');
}

// Inicializar gráficos
function initializeCharts() {
    if (salesData.length === 0) return;
    
    // Gráficos del Dashboard
    createStoreChart();
    createProductChart();
    createTrendChart();
    
    // Gráficos de Análisis
    createCategoryChart();
    createMonthlyChart();
    createComparisonChart();
    createProjectionChart();
}

// Crear gráfico de distribución por categoría
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) {
        console.log('Canvas categoryChart no encontrado');
        return;
    }
    
    // Agrupar productos por categoría (usando el nombre del producto como categoría por ahora)
    const categoryData = {};
    salesData.forEach(item => {
        // Extraer categoría del nombre del producto (asumiendo formato: "Categoría - Producto")
        let category = item.product;
        if (item.product.includes(' - ')) {
            category = item.product.split(' - ')[0];
        }
        
        categoryData[category] = (categoryData[category] || 0) + item.total;
    });
    
    if (charts.categoryChart) {
        charts.categoryChart.destroy();
    }
    
    console.log('Datos para gráfico de categorías:', categoryData);
    
    charts.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: [
                    '#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fef3c7',
                    '#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fef3c7'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: $${context.parsed.toLocaleString('es-MX')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Crear gráfico de ventas mensuales
function createMonthlyChart() {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) {
        console.log('Canvas monthlyChart no encontrado');
        return;
    }
    
    // Agrupar ventas por mes
    const monthlyData = {};
    salesData.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                label: monthLabel,
                total: 0,
                quantity: 0
            };
        }
        
        monthlyData[monthKey].total += item.total;
        monthlyData[monthKey].quantity += item.quantity;
    });
    
    // Ordenar por fecha
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(key => monthlyData[key].label);
    const totals = sortedMonths.map(key => monthlyData[key].total);
    const quantities = sortedMonths.map(key => monthlyData[key].quantity);
    
    if (charts.monthlyChart) {
        charts.monthlyChart.destroy();
    }
    
    console.log('Datos para gráfico mensual:', monthlyData);
    
    charts.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: totals,
                backgroundColor: '#fbbf24',
                borderRadius: 8,
                borderSkipped: false,
                yAxisID: 'y'
            }, {
                label: 'Cantidad',
                data: quantities,
                backgroundColor: '#f59e0b',
                borderRadius: 8,
                borderSkipped: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Ventas ($)'
                    },
                    grid: {
                        color: '#e2e8f0'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Cantidad'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Crear gráfico de comparativa entre tiendas
function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) {
        console.log('Canvas comparisonChart no encontrado');
        return;
    }
    
    // Agrupar datos por tienda
    const storeData = {};
    salesData.forEach(item => {
        if (!storeData[item.store]) {
            storeData[item.store] = {
                total: 0,
                quantity: 0,
                transactions: 0
            };
        }
        
        storeData[item.store].total += item.total;
        storeData[item.store].quantity += item.quantity;
        storeData[item.store].transactions += 1;
    });
    
    // Ordenar por total de ventas
    const sortedStores = Object.entries(storeData)
        .sort(([,a], [,b]) => b.total - a.total)
        .slice(0, 10); // Top 10 tiendas
    
    const labels = sortedStores.map(([store]) => store);
    const totals = sortedStores.map(([,data]) => data.total);
    const quantities = sortedStores.map(([,data]) => data.quantity);
    
    if (charts.comparisonChart) {
        charts.comparisonChart.destroy();
    }
    
    console.log('Datos para gráfico de comparación:', storeData);
    
    charts.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: totals,
                backgroundColor: '#f59e0b',
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const storeIndex = context[0].dataIndex;
                            const store = labels[storeIndex];
                            const data = storeData[store];
                            return [
                                `Cantidad: ${data.quantity.toLocaleString()}`,
                                `Transacciones: ${data.transactions}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: '#e2e8f0'
                    },
                    title: {
                        display: true,
                        text: 'Ventas ($)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Crear gráfico de proyección de ventas
function createProjectionChart() {
    const ctx = document.getElementById('projectionChart');
    if (!ctx) {
        console.log('Canvas projectionChart no encontrado');
        return;
    }
    
    // Agrupar ventas por fecha y calcular tendencia
    const dateData = {};
    salesData.forEach(item => {
        const date = item.date;
        dateData[date] = (dateData[date] || 0) + item.total;
    });
    
    // Ordenar fechas y tomar los últimos 30 días
    const sortedDates = Object.keys(dateData).sort().slice(-30);
    const sales = sortedDates.map(date => dateData[date]);
    
    // Calcular proyección simple (promedio móvil)
    const projectionDays = 7;
    const recentAverage = sales.slice(-7).reduce((a, b) => a + b, 0) / 7;
    
    // Generar fechas futuras para proyección
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    const futureDates = [];
    const projectedSales = [];
    
    for (let i = 1; i <= projectionDays; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setDate(lastDate.getDate() + i);
        futureDates.push(futureDate.toISOString().split('T')[0]);
        projectedSales.push(recentAverage);
    }
    
    // Combinar datos históricos y proyección
    const allDates = [...sortedDates, ...futureDates];
    const allSales = [...sales, ...projectedSales];
    
    if (charts.projectionChart) {
        charts.projectionChart.destroy();
    }
    
    console.log('Datos para gráfico de proyección:', { historical: sales.length, projection: projectionDays });
    
    charts.projectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allDates,
            datasets: [{
                label: 'Ventas Históricas',
                data: sales,
                borderColor: '#fbbf24',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#fbbf24',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }, {
                label: 'Proyección',
                data: [...Array(sales.length).fill(null), ...projectedSales],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e2e8f0'
                    },
                    title: {
                        display: true,
                        text: 'Ventas ($)'
                    }
                },
                x: {
                    grid: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
}

// ===== GRÁFICOS DEL DASHBOARD =====

// Crear gráfico de ventas por tienda
function createStoreChart() {
    const ctx = document.getElementById('storeChart');
    if (!ctx) {
        console.log('Canvas storeChart no encontrado');
        return;
    }
    
    // Agrupar ventas por tienda
    const storeData = {};
    salesData.forEach(item => {
        storeData[item.store] = (storeData[item.store] || 0) + item.total;
    });
    
    if (charts.storeChart) {
        charts.storeChart.destroy();
    }
    
    charts.storeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(storeData),
            datasets: [{
                data: Object.values(storeData),
                backgroundColor: [
                    '#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fef3c7',
                    '#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fef3c7'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toLocaleString('es-MX')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Crear gráfico de ventas por producto
function createProductChart() {
    const ctx = document.getElementById('productChart');
    if (!ctx) {
        console.log('Canvas productChart no encontrado');
        return;
    }
    
    // Agrupar ventas por producto (top 10)
    const productData = {};
    salesData.forEach(item => {
        productData[item.product] = (productData[item.product] || 0) + item.total;
    });
    
    // Ordenar por ventas y tomar top 10
    const sortedProducts = Object.entries(productData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    if (charts.productChart) {
        charts.productChart.destroy();
    }
    
    charts.productChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedProducts.map(([product]) => product),
            datasets: [{
                label: 'Ventas ($)',
                data: sortedProducts.map(([, total]) => total),
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toLocaleString('es-MX')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e2e8f0'
                    },
                    title: {
                        display: true,
                        text: 'Ventas ($)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Crear gráfico de tendencia de ventas
function createTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) {
        console.log('Canvas trendChart no encontrado');
        return;
    }
    
    // Agrupar ventas por fecha
    const dateData = {};
    salesData.forEach(item => {
        const date = new Date(item.date).toISOString().split('T')[0];
        dateData[date] = (dateData[date] || 0) + item.total;
    });
    
    // Ordenar fechas
    const sortedDates = Object.keys(dateData).sort();
    
    if (charts.trendChart) {
        charts.trendChart.destroy();
    }
    
    charts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Ventas Diarias',
                data: sortedDates.map(date => dateData[date]),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toLocaleString('es-MX')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e2e8f0'
                    },
                    title: {
                        display: true,
                        text: 'Ventas ($)'
                    }
                },
                x: {
                    grid: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
}

// Función para actualizar UI de analytics
function updateAnalyticsUI() {
    if (salesData.length === 0) return;
    
    // Actualizar métricas
    updateAnalyticsMetrics();
    
    // Actualizar gráficos
    initializeCharts();
    
    // Actualizar tabla
    updateAnalyticsTable();
    
    // Cargar opciones de filtros
    loadAnalyticsFilterOptions();
}

// Función para actualizar métricas de análisis
function updateAnalyticsMetrics() {
    // Calcular métricas básicas
    const totalSales = salesData.reduce((sum, item) => sum + item.total, 0);
    const totalTransactions = salesData.length;
    const activeStores = new Set(salesData.map(item => item.store)).size;
    const totalProducts = salesData.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calcular cambios (comparar con período anterior)
    const currentPeriod = salesData.slice(-Math.floor(salesData.length * 0.3)); // Último 30%
    const previousPeriod = salesData.slice(-Math.floor(salesData.length * 0.6), -Math.floor(salesData.length * 0.3)); // 30% anterior
    
    const currentSales = currentPeriod.reduce((sum, item) => sum + item.total, 0);
    const previousSales = previousPeriod.reduce((sum, item) => sum + item.total, 0);
    const salesChange = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;
    
    const currentTransactions = currentPeriod.length;
    const previousTransactions = previousPeriod.length;
    const transactionsChange = previousTransactions > 0 ? ((currentTransactions - previousTransactions) / previousTransactions) * 100 : 0;
    
    const currentStores = new Set(currentPeriod.map(item => item.store)).size;
    const previousStores = new Set(previousPeriod.map(item => item.store)).size;
    const storesChange = previousStores > 0 ? ((currentStores - previousStores) / previousStores) * 100 : 0;
    
    const currentProducts = currentPeriod.reduce((sum, item) => sum + item.quantity, 0);
    const previousProducts = previousPeriod.reduce((sum, item) => sum + item.quantity, 0);
    const productsChange = previousProducts > 0 ? ((currentProducts - previousProducts) / previousProducts) * 100 : 0;
    
    // Actualizar elementos del DOM
    const totalSalesEl = document.getElementById('analyticsTotalSales');
    const salesChangeEl = document.getElementById('analyticsSalesChange');
    const transactionsEl = document.getElementById('analyticsTransactions');
    const transactionsChangeEl = document.getElementById('analyticsTransactionsChange');
    const activeStoresEl = document.getElementById('analyticsActiveStores');
    const storesChangeEl = document.getElementById('analyticsStoresChange');
    const productsSoldEl = document.getElementById('analyticsProductsSold');
    const productsChangeEl = document.getElementById('analyticsProductsChange');
    
    if (totalSalesEl) totalSalesEl.textContent = `$${totalSales.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    if (transactionsEl) transactionsEl.textContent = totalTransactions.toLocaleString();
    if (activeStoresEl) activeStoresEl.textContent = activeStores;
    if (productsSoldEl) productsSoldEl.textContent = totalProducts.toLocaleString();
    
    // Actualizar cambios con colores apropiados
    if (salesChangeEl) {
        salesChangeEl.textContent = `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`;
        salesChangeEl.className = `metric-change ${salesChange >= 0 ? 'positive' : 'negative'}`;
    }
    
    if (transactionsChangeEl) {
        transactionsChangeEl.textContent = `${transactionsChange >= 0 ? '+' : ''}${transactionsChange.toFixed(1)}%`;
        transactionsChangeEl.className = `metric-change ${transactionsChange >= 0 ? 'positive' : 'negative'}`;
    }
    
    if (storesChangeEl) {
        storesChangeEl.textContent = `${storesChange >= 0 ? '+' : ''}${storesChange.toFixed(1)}%`;
        storesChangeEl.className = `metric-change ${storesChange >= 0 ? 'positive' : 'negative'}`;
    }
    
    if (productsChangeEl) {
        productsChangeEl.textContent = `${productsChange >= 0 ? '+' : ''}${productsChange.toFixed(1)}%`;
        productsChangeEl.className = `metric-change ${productsChange >= 0 ? 'positive' : 'negative'}`;
    }
}

// Función para cargar opciones de filtros de análisis
function loadAnalyticsFilterOptions() {
    // Cargar tiendas
    const stores = [...new Set(salesData.map(item => item.store))];
    const analyticsStore = document.getElementById('analyticsStore');
    if (analyticsStore) {
        analyticsStore.innerHTML = '<option value="">Todas las tiendas</option>';
        stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store;
            option.textContent = store;
            analyticsStore.appendChild(option);
        });
    }
    
    // Cargar productos
    const products = [...new Set(salesData.map(item => item.product))];
    const analyticsProduct = document.getElementById('analyticsProduct');
    if (analyticsProduct) {
        analyticsProduct.innerHTML = '<option value="">Todos los productos</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = product;
            analyticsProduct.appendChild(option);
        });
    }
    
    // Configurar fechas por defecto (últimos 30 días)
    const analyticsDateFrom = document.getElementById('analyticsDateFrom');
    const analyticsDateTo = document.getElementById('analyticsDateTo');
    
    if (analyticsDateFrom && analyticsDateTo) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        analyticsDateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
        analyticsDateTo.value = today.toISOString().split('T')[0];
    }
}

// Función para actualizar tabla de análisis
function updateAnalyticsTable() {
    const analyticsTableBody = document.getElementById('analyticsTableBody');
    if (!analyticsTableBody) return;
    
    // Limpiar tabla
    analyticsTableBody.innerHTML = '';
    
    // Usar datos filtrados si están disponibles, sino usar todos los datos
    const dataToShow = filteredData.length > 0 ? filteredData : salesData;
    
    if (dataToShow.length === 0) {
        analyticsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <div class="no-data-content">
                        <i class="fas fa-chart-line"></i>
                        <p>No hay datos para mostrar</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Calcular total general para porcentajes
    const totalGeneral = dataToShow.reduce((sum, item) => sum + item.total, 0);
    
    // Mostrar datos (limitado a 100 registros para rendimiento)
    const displayData = dataToShow.slice(0, 100);
    
    displayData.forEach(item => {
        const row = document.createElement('tr');
        const percentage = ((item.total / totalGeneral) * 100).toFixed(2);
        
        row.innerHTML = `
            <td>${item.date}</td>
            <td><strong>${item.store}</strong></td>
            <td>${item.product}</td>
            <td>${item.quantity.toLocaleString()}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td><strong>$${item.total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</strong></td>
            <td><span class="percentage-badge">${percentage}%</span></td>
        `;
        
        analyticsTableBody.appendChild(row);
    });
    
    // Agregar fila de totales
    if (displayData.length > 0) {
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        const totalQuantity = displayData.reduce((sum, item) => sum + item.quantity, 0);
        const totalSales = displayData.reduce((sum, item) => sum + item.total, 0);
        const totalPercentage = ((totalSales / totalGeneral) * 100).toFixed(2);
        
        totalRow.innerHTML = `
            <td colspan="3"><strong>TOTALES (${displayData.length} registros)</strong></td>
            <td><strong>${totalQuantity.toLocaleString()}</strong></td>
            <td></td>
            <td><strong>$${totalSales.toLocaleString('es-MX', {minimumFractionDigits: 2})}</strong></td>
            <td><strong>${totalPercentage}%</strong></td>
        `;
        analyticsTableBody.appendChild(totalRow);
    }
    
    // Mostrar mensaje si hay más datos disponibles
    if (dataToShow.length > 100) {
        const infoRow = document.createElement('tr');
        infoRow.className = 'info-row';
        infoRow.innerHTML = `
            <td colspan="7" style="text-align: center; color: #6b7280; font-style: italic; padding: 1rem;">
                Mostrando 100 de ${dataToShow.length} registros. Usa los filtros para ver datos específicos.
            </td>
        `;
        analyticsTableBody.appendChild(infoRow);
    }
}

// Cargar datos iniciales
function loadData() {
    // Cargar datos guardados en localStorage si existen
    const savedData = localStorage.getItem('salesData');
    if (savedData) {
        try {
            salesData = JSON.parse(savedData);
            filteredData = [...salesData];
        } catch (error) {
            console.error('Error cargando datos guardados:', error);
            salesData = [];
            filteredData = [];
        }
    } else {
        // Generar datos de muestra si no hay datos guardados
        generateSampleData();
    }
    
    // Cargar historial de exportación
    const savedHistory = localStorage.getItem('exportHistory');
    if (savedHistory) {
        try {
            exportHistory = JSON.parse(savedHistory);
        } catch (error) {
            console.error('Error cargando historial:', error);
            exportHistory = [];
        }
    }
    
    console.log('Datos cargados:', salesData.length, 'registros');
    
    // Actualizar opciones de exportación después de cargar los datos
    updateExportOptions();
}

// Generar datos de muestra para tiendas de abarrotes
function generateSampleData() {
    const products = [
        'Arroz 1kg', 'Leche 1L', 'Huevos 30pz', 'Coca Cola 2L', 'Detergente 1kg',
        'Pan de caja', 'Aceite 1L', 'Azúcar 1kg', 'Harina 1kg', 'Frijoles 1kg',
        'Sopa instantánea', 'Galletas', 'Refresco 600ml', 'Papel higiénico 4r',
        'Shampoo 400ml', 'Jabón de baño', 'Cepillo dental', 'Pasta dental',
        'Toallas sanitarias', 'Pañales'
    ];
    
    const stores = ['Tienda Centro', 'Tienda Norte', 'Tienda Sur', 'Tienda Este'];
    
    salesData = [];
    const today = new Date();
    
    // Generar datos para los últimos 30 días
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Generar 15-25 tickets por día
        const ticketsPerDay = Math.floor(Math.random() * 11) + 15;
        
        for (let j = 0; j < ticketsPerDay; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const store = stores[Math.floor(Math.random() * stores.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;
            
            let unitPrice = 0;
            switch (product) {
                case 'Arroz 1kg': unitPrice = 25; break;
                case 'Leche 1L': unitPrice = 35; break;
                case 'Huevos 30pz': unitPrice = 85; break;
                case 'Coca Cola 2L': unitPrice = 45; break;
                case 'Detergente 1kg': unitPrice = 120; break;
                case 'Pan de caja': unitPrice = 45; break;
                case 'Aceite 1L': unitPrice = 65; break;
                case 'Azúcar 1kg': unitPrice = 30; break;
                case 'Harina 1kg': unitPrice = 28; break;
                case 'Frijoles 1kg': unitPrice = 40; break;
                case 'Sopa instantánea': unitPrice = 15; break;
                case 'Galletas': unitPrice = 25; break;
                case 'Refresco 600ml': unitPrice = 18; break;
                case 'Papel higiénico 4r': unitPrice = 55; break;
                case 'Shampoo 400ml': unitPrice = 95; break;
                case 'Jabón de baño': unitPrice = 35; break;
                case 'Cepillo dental': unitPrice = 45; break;
                case 'Pasta dental': unitPrice = 65; break;
                case 'Toallas sanitarias': unitPrice = 75; break;
                case 'Pañales': unitPrice = 180; break;
                default: unitPrice = 50;
            }
            
            const total = quantity * unitPrice;
            const week = Math.ceil((29 - i + 1) / 7);
            
            salesData.push({
                store,
                product,
                date: dateStr,
                quantity,
                unitPrice,
                total,
                week
            });
        }
    }
    
    filteredData = [...salesData];
    
    // Guardar en localStorage
    localStorage.setItem('salesData', JSON.stringify(salesData));
}

// Configuración de carga de archivos
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) return;
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Click para seleccionar archivos
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea) {
            fileInput.click();
        }
    });
    fileInput.addEventListener('change', handleFileSelect);
}

// Manejo de drag and drop
function handleDragOver(e) {
    e.preventDefault();
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

// Manejo de selección de archivos
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

// Procesamiento de archivos
function processFiles(files) {
    const validFiles = files.filter(file => {
        const isValidType = file.type === 'text/csv' || 
                           file.name.endsWith('.xlsx') || 
                           file.name.endsWith('.xls');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        
        if (!isValidType) {
            showModal('error', 'Tipo de archivo no válido', `${file.name} no es un archivo CSV o Excel válido.`);
        }
        if (!isValidSize) {
            showModal('error', 'Archivo demasiado grande', `${file.name} excede el límite de 10MB.`);
        }
        
        return isValidType && isValidSize;
    });
    
    if (validFiles.length > 0) {
        addFilesToList(validFiles);
        processAllFiles(validFiles);
    }
}

// Agregar archivos a la lista
function addFilesToList(files) {
    const uploadedFilesSection = document.getElementById('uploadedFiles');
    const filesList = document.getElementById('filesList');
    
    if (!uploadedFilesSection || !filesList) return;
    
    files.forEach(file => {
        const fileData = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date(),
            status: 'pending'
        };
        
        uploadedFiles.push(fileData);
        displayFileItem(fileData);
    });
    
    updateFilesSummary();
    uploadedFilesSection.style.display = 'block';
}

// Mostrar archivo en la lista
function displayFileItem(fileData) {
    const filesList = document.getElementById('filesList');
    if (!filesList) return;
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.id = `file-${fileData.id}`;
    
    const fileIcon = fileData.type === 'text/csv' ? 'fa-file-csv' : 'fa-file-excel';
    
    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-icon">
                <i class="fas ${fileIcon}"></i>
            </div>
            <div class="file-details">
                <h4>${fileData.name}</h4>
                <p>${formatFileSize(fileData.size)} • ${fileData.uploadDate.toLocaleDateString()}</p>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-remove" onclick="removeFile('${fileData.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    filesList.appendChild(fileItem);
}

// Remover archivo
function removeFile(fileId) {
    const index = uploadedFiles.findIndex(f => f.id === fileId);
    if (index > -1) {
        uploadedFiles.splice(index, 1);
        const fileElement = document.getElementById(`file-${fileId}`);
        if (fileElement) fileElement.remove();
        updateFilesSummary();
        
        const uploadedFilesSection = document.getElementById('uploadedFiles');
        if (uploadedFilesSection && uploadedFiles.length === 0) {
            uploadedFilesSection.style.display = 'none';
        }
    }
}

// Actualizar resumen de archivos
function updateFilesSummary() {
    const totalFiles = document.getElementById('totalFiles');
    const totalRecords = document.getElementById('totalRecords');
    const activeStores = document.getElementById('activeStores');
    
    if (!totalFiles || !totalRecords || !activeStores) return;
    
    totalFiles.textContent = uploadedFiles.length;
    
    const totalRecordsCount = uploadedFiles.reduce((sum, file) => {
        return sum + (file.records || 0);
    }, 0);
    totalRecords.textContent = totalRecordsCount.toLocaleString();
    
    const uniqueStores = new Set();
    salesData.forEach(item => uniqueStores.add(item.store));
    activeStores.textContent = uniqueStores.size;
}

// Procesar todos los archivos
async function processAllFiles(files) {
    const processingSection = document.getElementById('processingSection');
    const progressFill = document.getElementById('progressFill');
    const processingText = document.getElementById('processingText');
    
    if (!processingSection || !progressFill || !processingText) return;
    
    processingSection.style.display = 'block';
    let processedCount = 0;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileData = uploadedFiles.find(f => f.file === file);
        
        if (fileData) {
            fileData.status = 'processing';
            updateFileStatus(fileData.id, 'Procesando...');
            
            try {
                const data = await readFileData(file);
                if (data && data.length > 0) {
                    fileData.records = data.length;
                    fileData.status = 'completed';
                    updateFileStatus(fileData.id, `${data.length} registros procesados`);
                    
                    // Agregar datos al conjunto principal
                    salesData = salesData.concat(data);
                    filteredData = [...salesData];
                } else {
                    fileData.status = 'error';
                    updateFileStatus(fileData.id, 'No se encontraron datos válidos');
                    console.warn('Archivo procesado pero sin datos válidos');
                }
            } catch (error) {
                fileData.status = 'error';
                const errorMessage = error.message || 'Error desconocido';
                updateFileStatus(fileData.id, `Error: ${errorMessage}`);
                console.error('Error procesando archivo:', error);
                
                // Mostrar modal de error con detalles
                showModal('error', 'Error al procesar archivo', `Error procesando ${file.name}: ${errorMessage}`);
            }
            
            processedCount++;
            const progress = (processedCount / files.length) * 100;
            progressFill.style.width = `${progress}%`;
            processingText.textContent = `Procesando archivo ${processedCount} de ${files.length}...`;
        }
    }
    
    // Finalizar procesamiento
    setTimeout(() => {
        processingSection.style.display = 'none';
        progressFill.style.width = '0%';
        updateUI();
        updateFilesSummary();
        showModal('success', 'Procesamiento Completado', `Se procesaron ${files.length} archivos exitosamente.`);
    }, 1000);
}

// Leer datos del archivo
function readFileData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                let data = [];
                
                if (file.type === 'text/csv') {
                    data = parseCSV(e.target.result);
                } else {
                    // Para archivos Excel, asumimos que ya están en formato CSV
                    data = parseCSV(e.target.result);
                }
                
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = reject;
        
        if (file.type === 'text/csv') {
            reader.readAsText(file);
        } else {
            reader.readAsText(file);
        }
    });
}

// Parsear CSV
function parseCSV(csvText) {
    try {
        console.log('Iniciando parseo CSV...');
        console.log('Texto CSV recibido (primeras 200 caracteres):', csvText.substring(0, 200));
        
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        console.log('Número total de líneas:', lines.length);
        
        if (lines.length < 2) {
            throw new Error('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos');
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        console.log('Headers encontrados:', headers);
        
        // Verificar que los campos requeridos estén presentes
        const requiredFields = ['Tienda', 'Producto', 'Fecha', 'Cantidad', 'Precio_Unitario'];
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
            throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}. Campos encontrados: ${headers.join(', ')}`);
        }
        
        const data = [];
        let processedRows = 0;
        let skippedRows = 0;
        
        for (let i = 1; i < lines.length; i++) {
            try {
                if (lines[i].trim()) {
                    const values = lines[i].split(',').map(v => v.trim());
                    const row = {};
                    
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    
                    console.log(`Procesando fila ${i + 1}:`, row);
                    
                    // Validar que tenga los campos requeridos con valores
                    if (row.Tienda && row.Producto && row.Fecha && row.Cantidad && row.Precio_Unitario) {
                        const quantity = parseInt(row.Cantidad);
                        const unitPrice = parseFloat(row.Precio_Unitario);
                        
                        if (isNaN(quantity) || isNaN(unitPrice)) {
                            console.warn(`Fila ${i + 1}: Valores numéricos inválidos - Cantidad: ${row.Cantidad}, Precio: ${row.Precio_Unitario}`);
                            skippedRows++;
                            continue;
                        }
                        
                        const total = parseFloat(row.Total) || (quantity * unitPrice);
                        
                        const dataRow = {
                            store: row.Tienda,
                            product: row.Producto,
                            date: row.Fecha,
                            quantity: quantity,
                            unitPrice: unitPrice,
                            total: total,
                            week: getWeekNumber(new Date(row.Fecha))
                        };
                        
                        data.push(dataRow);
                        processedRows++;
                        console.log(`Fila ${i + 1} procesada exitosamente:`, dataRow);
                    } else {
                        console.warn(`Fila ${i + 1}: Campos requeridos vacíos - Tienda: "${row.Tienda}", Producto: "${row.Producto}", Fecha: "${row.Fecha}", Cantidad: "${row.Cantidad}", Precio: "${row.Precio_Unitario}"`);
                        skippedRows++;
                    }
                }
            } catch (rowError) {
                console.warn(`Error procesando fila ${i + 1}:`, rowError);
                skippedRows++;
                continue;
            }
        }
        
        console.log(`CSV procesado exitosamente. ${data.length} registros válidos de ${lines.length - 1} filas totales. Filas omitidas: ${skippedRows}`);
        
        if (data.length === 0) {
            throw new Error('No se encontraron registros válidos en el archivo CSV');
        }
        
        return data;
        
    } catch (error) {
        console.error('Error parseando CSV:', error);
        throw new Error(`Error al procesar el archivo CSV: ${error.message}`);
    }
}

// Actualizar estado del archivo
function updateFileStatus(fileId, status) {
    const fileItem = document.getElementById(`file-${fileId}`);
    if (fileItem) {
        const statusElement = fileItem.querySelector('.file-details p');
        if (statusElement) {
            const originalText = statusElement.textContent.split(' • ')[0];
            statusElement.textContent = `${originalText} • ${status}`;
        }
    }
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Configuración de análisis
function setupAnalytics() {
    // Configurar fechas por defecto
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const analyticsDateFrom = document.getElementById('analyticsDateFrom');
    const analyticsDateTo = document.getElementById('analyticsDateTo');
    
    if (analyticsDateFrom && analyticsDateTo) {
        analyticsDateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
        analyticsDateTo.value = today.toISOString().split('T')[0];
    }
    
    // Event listeners
    const applyAnalyticsFilters = document.getElementById('applyAnalyticsFilters');
    const resetAnalyticsFilters = document.getElementById('resetAnalyticsFilters');
    const analyticsSearch = document.getElementById('analyticsSearch');
    const analyticsSortBy = document.getElementById('analyticsSortBy');
    const exportAnalytics = document.getElementById('exportAnalytics');
    
    if (applyAnalyticsFilters) {
        applyAnalyticsFilters.addEventListener('click', applyAnalyticsFiltersHandler);
    }
    if (resetAnalyticsFilters) {
        resetAnalyticsFilters.addEventListener('click', resetAnalyticsFiltersHandler);
    }
    if (analyticsSearch) {
        analyticsSearch.addEventListener('input', handleAnalyticsSearch);
    }
    if (analyticsSortBy) {
        analyticsSortBy.addEventListener('change', handleAnalyticsSort);
    }
    if (exportAnalytics) {
        exportAnalytics.addEventListener('click', exportAnalyticsData);
    }
    
    // Cargar opciones de filtros
    loadAnalyticsFilterOptions();
}

// Aplicar filtros de análisis
function applyAnalyticsFiltersHandler() {
    const analyticsDateFrom = document.getElementById('analyticsDateFrom');
    const analyticsDateTo = document.getElementById('analyticsDateTo');
    const analyticsStore = document.getElementById('analyticsStore');
    const analyticsProduct = document.getElementById('analyticsProduct');
    
    if (!analyticsDateFrom || !analyticsDateTo) return;
    
    const dateFrom = analyticsDateFrom.value;
    const dateTo = analyticsDateTo.value;
    const store = analyticsStore ? analyticsStore.value : '';
    const product = analyticsProduct ? analyticsProduct.value : '';
    
    let filtered = [...salesData];
    
    // Filtro por fecha
    if (dateFrom && dateTo) {
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            return itemDate >= fromDate && itemDate <= toDate;
        });
    }
    
    // Filtro por tienda
    if (store) {
        filtered = filtered.filter(item => item.store === store);
    }
    
    // Filtro por producto
    if (product) {
        filtered = filtered.filter(item => item.product === product);
    }
    
    filteredData = filtered;
    updateAnalyticsUI();
    updateAnalyticsTable();
}

// Restablecer filtros de análisis
function resetAnalyticsFiltersHandler() {
    const analyticsDateFrom = document.getElementById('analyticsDateFrom');
    const analyticsDateTo = document.getElementById('analyticsDateTo');
    const analyticsStore = document.getElementById('analyticsStore');
    const analyticsProduct = document.getElementById('analyticsProduct');
    
    if (analyticsDateFrom) analyticsDateFrom.value = '';
    if (analyticsDateTo) analyticsDateTo.value = '';
    if (analyticsStore) analyticsStore.value = '';
    if (analyticsProduct) analyticsProduct.value = '';
    
    filteredData = [...salesData];
    updateAnalyticsUI();
    updateAnalyticsTable();
}

// Manejar búsqueda en análisis
function handleAnalyticsSearch() {
    const searchTerm = document.getElementById('analyticsSearch').value.toLowerCase();
    
    if (!searchTerm) {
        updateAnalyticsTable();
        return;
    }
    
    const filtered = salesData.filter(item => 
        item.store.toLowerCase().includes(searchTerm) ||
        item.product.toLowerCase().includes(searchTerm) ||
        item.date.includes(searchTerm)
    );
    
    filteredData = filtered;
    updateAnalyticsTable();
}

// Manejar ordenamiento en análisis
function handleAnalyticsSort() {
    const sortBy = document.getElementById('analyticsSortBy').value;
    
    if (!sortBy) return;
    
    const sorted = [...filteredData].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(a.date) - new Date(b.date);
            case 'store':
                return a.store.localeCompare(b.store);
            case 'product':
                return a.product.localeCompare(b.product);
            case 'total':
                return b.total - a.total;
            default:
                return 0;
        }
    });
    
    filteredData = sorted;
    updateAnalyticsTable();
}

// Exportar datos de análisis
function exportAnalyticsData() {
    if (filteredData.length === 0) {
        showModal('error', 'Sin datos', 'No hay datos para exportar. Aplica filtros primero.');
        return;
    }
    
    // Generar nombre del archivo
    const today = new Date().toISOString().split('T')[0];
    const filename = `analisis_ventas_${today}.csv`;
    
    // Generar CSV con datos filtrados
    const csvContent = generateCSV(filteredData);
    downloadCSV(csvContent, filename);
    
    // Agregar al historial de exportación
    addToExportHistory('Análisis de Ventas', 'CSV', `Análisis con ${filteredData.length} registros`, filteredData.length);
    
    // Mostrar confirmación
    showModal('success', 'Exportación Exitosa', `Se exportó el análisis con ${filteredData.length.toLocaleString()} registros.`);
}

// Configuración de exportación
function setupExport() {
    // Event listeners
    if (exportExcel) {
        exportExcel.addEventListener('click', () => exportToExcel());
    }
    if (exportPDF) {
        exportPDF.addEventListener('click', () => exportToPDF());
    }
    if (createCustomReport) {
        createCustomReport.addEventListener('click', () => createCustomReportHandler());
    }
    if (applyExportConfig) {
        applyExportConfig.addEventListener('click', applyExportConfigHandler);
    }
    if (resetExportConfig) {
        resetExportConfig.addEventListener('click', resetExportConfigHandler);
    }
    
    // Configurar fechas por defecto para exportación
    setupDefaultExportDates();
    
    // Cargar historial
    loadExportHistory();
}

// Configurar fechas por defecto para exportación
function setupDefaultExportDates() {
    const exportDateFrom = document.getElementById('exportDateFrom');
    const exportDateTo = document.getElementById('exportDateTo');
    
    if (exportDateFrom && exportDateTo) {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        
        exportDateFrom.value = lastMonth.toISOString().split('T')[0];
        exportDateTo.value = today.toISOString().split('T')[0];
    }
}

// Exportar a Excel
function exportToExcel() {
    const excelFormat = document.getElementById('excelFormat');
    if (!excelFormat) return;
    
    const format = excelFormat.value;
    let dataToExport = [];
    let description = '';
    
    switch (format) {
        case 'all':
            dataToExport = salesData;
            description = 'Todos los datos de ventas';
            break;
        case 'filtered':
            dataToExport = filteredData.length > 0 ? filteredData : salesData;
            description = 'Datos filtrados actuales';
            break;
        case 'summary':
            dataToExport = generateStoreSummary();
            description = 'Resumen por tienda';
            break;
        case 'daily':
            dataToExport = generateDailySummary();
            description = 'Ventas diarias';
            break;
        default:
            dataToExport = salesData;
            description = 'Todos los datos';
    }
    
    if (dataToExport.length === 0) {
        showModal('error', 'Sin datos', 'No hay datos para exportar.');
        return;
    }
    
    const csvContent = generateCSV(dataToExport);
    const filename = `reporte_${format}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
    
    addToExportHistory('Excel', 'CSV', description, dataToExport.length);
    
    showModal('success', 'Exportación Exitosa', `Se exportaron ${dataToExport.length.toLocaleString()} registros a Excel.`);
}

// Exportar a PDF
function exportToPDF() {
    const pdfFormat = document.getElementById('pdfFormat');
    if (!pdfFormat) return;
    
    const format = pdfFormat.value;
    
    // Verificar si jsPDF está disponible
    if (typeof jsPDF === 'undefined' && typeof window.jsPDF === 'undefined') {
        showModal('error', 'Error PDF', 'La librería PDF no está disponible. Descargando como CSV en su lugar.');
        // Fallback a CSV
        exportToExcel();
        return;
    }
    
    // Obtener la instancia de jsPDF (compatible con UMD)
    const jsPDFClass = window.jsPDF || jsPDF;
    
    try {
        const doc = new jsPDFClass();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        let yPosition = 20;
        
        // Título del reporte
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Ventas', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;
        
        // Información del reporte
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tipo: ${getPDFFormatLabel(format)}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Total de registros: ${filteredData.length.toLocaleString()}`, 20, yPosition);
        yPosition += 20;
        
        // Datos del reporte según el formato
        switch (format) {
            case 'summary':
                generateSummaryPDF(doc, yPosition);
                break;
            case 'detailed':
                generateDetailedPDF(doc, yPosition);
                break;
            case 'charts':
                generateChartsPDF(doc, yPosition);
                break;
            case 'comparative':
                generateComparativePDF(doc, yPosition);
                break;
            default:
                generateSummaryPDF(doc, yPosition);
        }
        
        // Guardar PDF
        const filename = `reporte_${format}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        addToExportHistory('PDF', 'PDF', `Reporte ${getPDFFormatLabel(format)}`, filteredData.length);
        showModal('success', 'PDF Generado', `Se generó el reporte PDF: ${filename}`);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        showModal('error', 'Error PDF', 'Error al generar el PDF. Descargando como CSV en su lugar.');
        exportToExcel();
    }
}

// Obtener etiqueta del formato PDF
function getPDFFormatLabel(format) {
    const labels = {
        'summary': 'Resumen Ejecutivo',
        'detailed': 'Reporte Detallado',
        'charts': 'Reporte con Gráficos',
        'comparative': 'Reporte Comparativo'
    };
    return labels[format] || format;
}

// Generar PDF de resumen
function generateSummaryPDF(doc, startY) {
    let y = startY;
    const pageWidth = doc.internal.pageSize.width;
    
    // KPIs principales
    const totalSales = filteredData.reduce((sum, item) => sum + item.total, 0);
    const totalTransactions = filteredData.length;
    const uniqueStores = new Set(filteredData.map(item => item.store));
    const uniqueProducts = new Set(filteredData.map(item => item.product));
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Ejecutivo', 20, y);
    y += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ventas Totales: $${totalSales.toLocaleString('es-MX', {minimumFractionDigits: 2})}`, 20, y);
    y += 8;
    doc.text(`Total de Transacciones: ${totalTransactions.toLocaleString()}`, 20, y);
    y += 8;
    doc.text(`Tiendas Activas: ${uniqueStores.size}`, 20, y);
    y += 8;
    doc.text(`Productos Vendidos: ${uniqueProducts.size}`, 20, y);
    y += 15;
    
    // Top 5 tiendas por ventas
    const storeSales = {};
    filteredData.forEach(item => {
        if (!storeSales[item.store]) storeSales[item.store] = 0;
        storeSales[item.store] += item.total;
    });
    
    const topStores = Object.entries(storeSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 5 Tiendas por Ventas:', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    topStores.forEach(([store, sales], index) => {
        doc.text(`${index + 1}. ${store}: $${sales.toLocaleString('es-MX', {minimumFractionDigits: 2})}`, 25, y);
        y += 6;
    });
}

// Generar PDF detallado
function generateDetailedPDF(doc, startY) {
    let y = startY;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte Detallado', 20, y);
    y += 15;
    
    // Tabla de datos (primeros 20 registros)
    const dataToShow = filteredData.slice(0, 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    // Encabezados de tabla
    const headers = ['Fecha', 'Tienda', 'Producto', 'Cantidad', 'Precio', 'Total'];
    const colWidths = [25, 40, 50, 20, 25, 30];
    let x = 20;
    
    headers.forEach((header, index) => {
        doc.text(header, x, y);
        x += colWidths[index];
    });
    y += 8;
    
    // Datos de la tabla
    doc.setFont('helvetica', 'normal');
    dataToShow.forEach(item => {
        x = 20;
        doc.text(new Date(item.date).toLocaleDateString('es-MX'), x, y);
        x += colWidths[0];
        doc.text(item.store.substring(0, 15), x, y);
        x += colWidths[1];
        doc.text(item.product.substring(0, 20), x, y);
        x += colWidths[2];
        doc.text(item.quantity.toString(), x, y);
        x += colWidths[3];
        doc.text(`$${item.unitPrice.toFixed(2)}`, x, y);
        x += colWidths[4];
        doc.text(`$${item.total.toFixed(2)}`, x, y);
        y += 6;
        
        // Nueva página si es necesario
        if (y > doc.internal.pageSize.height - 30) {
            doc.addPage();
            y = 20;
        }
    });
}

// Generar PDF con gráficos
function generateChartsPDF(doc, startY) {
    let y = startY;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte con Gráficos', 20, y);
    y += 15;
    
    // Información de gráficos (texto descriptivo)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Este reporte incluiría gráficos de:', 20, y);
    y += 10;
    doc.text('• Distribución de ventas por tienda', 25, y);
    y += 6;
    doc.text('• Tendencia de ventas en el tiempo', 25, y);
    y += 6;
    doc.text('• Comparativa entre productos', 25, y);
    y += 6;
    doc.text('• Análisis de rendimiento por categoría', 25, y);
    y += 15;
    
    // Datos numéricos para gráficos
    const totalSales = filteredData.reduce((sum, item) => sum + item.total, 0);
    const storeSales = {};
    filteredData.forEach(item => {
        if (!storeSales[item.store]) storeSales[item.store] = 0;
        storeSales[item.store] += item.total;
    });
    
    doc.text('Datos para Gráficos:', 20, y);
    y += 10;
    
    Object.entries(storeSales).forEach(([store, sales]) => {
        const percentage = ((sales / totalSales) * 100).toFixed(1);
        doc.text(`${store}: $${sales.toLocaleString('es-MX', {minimumFractionDigits: 2})} (${percentage}%)`, 25, y);
        y += 6;
    });
}

// Generar PDF comparativo
function generateComparativePDF(doc, startY) {
    let y = startY;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte Comparativo', 20, y);
    y += 15;
    
    // Comparación entre tiendas
    const storeStats = {};
    filteredData.forEach(item => {
        if (!storeStats[item.store]) {
            storeStats[item.store] = {
                sales: 0,
                transactions: 0,
                products: new Set()
            };
        }
        storeStats[item.store].sales += item.total;
        storeStats[item.store].transactions += 1;
        storeStats[item.store].products.add(item.product);
    });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Comparativa entre Tiendas:', 20, y);
    y += 12;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    Object.entries(storeStats).forEach(([store, stats]) => {
        doc.text(`${store}:`, 20, y);
        y += 6;
        doc.text(`  Ventas: $${stats.sales.toLocaleString('es-MX', {minimumFractionDigits: 2})}`, 25, y);
        y += 5;
        doc.text(`  Transacciones: ${stats.transactions}`, 25, y);
        y += 5;
        doc.text(`  Productos únicos: ${stats.products.size}`, 25, y);
        y += 8;
    });
}

// Crear reporte personalizado
function createCustomReportHandler() {
    const exportDateFrom = document.getElementById('exportDateFrom');
    const exportDateTo = document.getElementById('exportDateTo');
    const exportStores = document.getElementById('exportStores');
    const exportProducts = document.getElementById('exportProducts');
    const exportFormat = document.getElementById('exportFormat');
    
    if (!exportDateFrom || !exportDateTo || !exportStores || !exportProducts || !exportFormat) return;
    
    const dateFrom = exportDateFrom.value;
    const dateTo = exportDateTo.value;
    const stores = Array.from(exportStores.selectedOptions).map(opt => opt.value).filter(v => v !== '');
    const products = Array.from(exportProducts.selectedOptions).map(opt => opt.value).filter(v => v !== '');
    const format = exportFormat.value;
    
    if (!dateFrom || !dateTo) {
        showModal('error', 'Fechas Requeridas', 'Por favor selecciona un rango de fechas.');
        return;
    }
    
    let customData = [...salesData];
    
    // Aplicar filtros personalizados
    if (dateFrom && dateTo) {
        customData = customData.filter(item => {
            const itemDate = new Date(item.date);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            return itemDate >= fromDate && itemDate <= toDate;
        });
    }
    
    if (stores.length > 0) {
        customData = customData.filter(item => stores.includes(item.store));
    }
    
    if (products.length > 0) {
        customData = customData.filter(item => products.includes(item.product));
    }
    
    if (customData.length === 0) {
        showModal('error', 'Sin datos', 'No hay datos que coincidan con los filtros seleccionados.');
        return;
    }
    
    // Mostrar vista previa
    showExportPreview(customData, format);
}

// Aplicar configuración de exportación
function applyExportConfigHandler() {
    const exportDateFrom = document.getElementById('exportDateFrom');
    const exportDateTo = document.getElementById('exportDateTo');
    const exportStores = document.getElementById('exportStores');
    const exportProducts = document.getElementById('exportProducts');
    const exportFormat = document.getElementById('exportFormat');
    
    if (!exportDateFrom || !exportDateTo) {
        showModal('error', 'Configuración Incompleta', 'Por favor selecciona un rango de fechas.');
        return;
    }
    
    // Validar que las fechas sean lógicas
    const fromDate = new Date(exportDateFrom.value);
    const toDate = new Date(exportDateTo.value);
    
    if (fromDate > toDate) {
        showModal('error', 'Fechas Inválidas', 'La fecha de inicio no puede ser posterior a la fecha final.');
        return;
    }
    
    // Aplicar la configuración a los filtros de reportes
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const storeFilter = document.getElementById('storeFilter');
    
    if (startDate && endDate) {
        startDate.value = exportDateFrom.value;
        endDate.value = exportDateTo.value;
    }
    
    if (storeFilter) {
        const selectedStores = Array.from(exportStores.selectedOptions).map(opt => opt.value).filter(v => v !== '');
        if (selectedStores.length > 0) {
            storeFilter.value = selectedStores[0]; // Solo la primera tienda para el filtro principal
        }
    }
    
    // Aplicar filtros automáticamente
    if (typeof applyFilters === 'function') {
        applyFilters();
    }
    
    // Mostrar información de la configuración aplicada
    let configInfo = `Fechas: ${exportDateFrom.value} a ${exportDateTo.value}`;
    
    const selectedStores = Array.from(exportStores.selectedOptions).map(opt => opt.value).filter(v => v !== '');
    if (selectedStores.length > 0) {
        configInfo += ` | Tiendas: ${selectedStores.join(', ')}`;
    }
    
    const selectedProducts = Array.from(exportProducts.selectedOptions).map(opt => opt.value).filter(v => v !== '');
    if (selectedProducts.length > 0) {
        configInfo += ` | Productos: ${selectedProducts.join(', ')}`;
    }
    
    showModal('success', 'Configuración Aplicada', `La configuración de exportación se ha aplicado a los filtros de reportes.\n\n${configInfo}`);
}

// Restablecer configuración de exportación
function resetExportConfigHandler() {
    const exportDateFrom = document.getElementById('exportDateFrom');
    const exportDateTo = document.getElementById('exportDateTo');
    const exportStores = document.getElementById('exportStores');
    const exportProducts = document.getElementById('exportProducts');
    const exportFormat = document.getElementById('exportFormat');
    
    if (exportDateFrom) exportDateFrom.value = '';
    if (exportDateTo) exportDateTo.value = '';
    if (exportStores) exportStores.selectedIndex = -1;
    if (exportProducts) exportProducts.selectedIndex = 0;
    if (exportFormat) exportFormat.value = 'csv';
    
    // Restaurar fechas por defecto
    setupDefaultExportDates();
    
    showModal('info', 'Configuración Restablecida', 'La configuración de exportación se ha restablecido.');
}



// Mostrar vista previa de exportación
function showExportPreview(data, format = 'csv') {
    const exportPreview = document.getElementById('exportPreview');
    const previewContent = document.getElementById('previewContent');
    
    if (!exportPreview || !previewContent) return;
    
    const preview = exportPreview;
    const content = previewContent;
    
    // Generar contenido de vista previa
    let previewHTML = `
        <h4>Vista Previa del Reporte Personalizado</h4>
        <p><strong>Total de registros:</strong> ${data.length}</p>
        <p><strong>Rango de fechas:</strong> ${data.length > 0 ? new Date(data[0].date).toLocaleDateString('es-MX') : 'N/A'} - ${data.length > 0 ? new Date(data[data.length - 1].date).toLocaleDateString('es-MX') : 'N/A'}</p>
        <p><strong>Tiendas incluidas:</strong> ${[...new Set(data.map(item => item.store))].join(', ')}</p>
        <p><strong>Total de ventas:</strong> $${data.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
        <p><strong>Formato seleccionado:</strong> ${format.toUpperCase()}</p>
    `;
    
    if (data.length > 0) {
        previewHTML += `
            <h5>Primeros 5 registros:</h5>
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="padding: 0.5rem; border: 1px solid #e2e8f0;">Fecha</th>
                        <th style="padding: 0.5rem; border: 1px solid #e2e8f0;">Tienda</th>
                        <th style="padding: 0.5rem; border: 1px solid #e2e8f0;">Producto</th>
                        <th style="padding: 0.5rem; border: 1px solid #e2e8f0;">Total</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.slice(0, 5).forEach(item => {
            previewHTML += `
                <tr>
                    <td style="padding: 0.5rem; border: 1px solid #e2e8f0;">${new Date(item.date).toLocaleDateString('es-MX')}</td>
                    <td style="padding: 0.5rem; border: 1px solid #e2e8f0;">${item.store}</td>
                    <td style="padding: 0.5rem; border: 1px solid #e2e8f0;">${item.product}</td>
                    <td style="padding: 0.5rem; border: 1px solid #e2e8f0;">$${item.total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        previewHTML += '</tbody></table>';
    }
    
    content.innerHTML = previewHTML;
    preview.style.display = 'block';
    
    // Configurar botones de vista previa
    const downloadPreview = document.getElementById('downloadPreview');
    const closePreview = document.getElementById('closePreview');
    
    if (downloadPreview) {
        downloadPreview.onclick = () => {
            if (format === 'pdf') {
                // Generar PDF personalizado
                try {
                    const jsPDFClass = window.jsPDF || jsPDF;
                    const doc = new jsPDFClass();
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Reporte Personalizado', 20, 20);
                    
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Total de registros: ${data.length}`, 20, 35);
                    doc.text(`Total de ventas: $${data.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}`, 20, 45);
                    
                    const filename = `reporte_personalizado_${new Date().toISOString().split('T')[0]}.pdf`;
                    doc.save(filename);
                    addToExportHistory('Personalizado', 'PDF', 'Reporte personalizado', data.length);
                    showModal('success', 'PDF Generado', `Se generó el reporte PDF: ${filename}`);
                } catch (error) {
                    showModal('error', 'Error PDF', 'Error al generar PDF. Descargando como CSV.');
                    downloadAsCSV();
                }
            } else {
                downloadAsCSV();
            }
            preview.style.display = 'none';
        };
    }
    
    if (closePreview) {
        closePreview.onclick = () => {
            preview.style.display = 'none';
        };
    }
    
    function downloadAsCSV() {
        const csvContent = generateCSV(data);
        const filename = `reporte_personalizado_${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(csvContent, filename);
        addToExportHistory('Personalizado', 'CSV', 'Reporte personalizado', data.length);
        showModal('success', 'CSV Descargado', `Se descargó el reporte CSV: ${filename}`);
    }
}

// Agregar al historial de exportación
function addToExportHistory(type, format, description, records) {
    const exportRecord = {
        id: Date.now(),
        date: new Date(),
        type: type,
        format: format,
        description: description,
        records: records
    };
    
    exportHistory.unshift(exportRecord);
    if (exportHistory.length > 50) {
        exportHistory = exportHistory.slice(0, 50);
    }
    
    updateExportHistoryTable();
    saveExportHistory();
}

// Actualizar tabla de historial de exportación
function updateExportHistoryTable() {
    if (!exportHistoryBody) return;
    
    const tbody = exportHistoryBody;
    tbody.innerHTML = '';
    
    exportHistory.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date.toLocaleDateString('es-MX')} ${record.date.toLocaleTimeString('es-MX')}</td>
            <td>${record.type}</td>
            <td>${record.format}</td>
            <td>${record.description}</td>
            <td>${record.records.toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="downloadExportHistory('${record.id}')">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Cargar historial de exportación
function loadExportHistory() {
    const saved = localStorage.getItem('exportHistory');
    if (saved) {
        try {
            exportHistory = JSON.parse(saved);
            exportHistory.forEach(record => {
                record.date = new Date(record.date);
            });
            updateExportHistoryTable();
        } catch (e) {
            console.error('Error cargando historial:', e);
        }
    }
}

// Descargar historial de exportación
function downloadExportHistory(recordId) {
    const record = exportHistory.find(r => r.id.toString() === recordId);
    if (record) {
        // Simular descarga del historial
        showModal('info', 'Descarga', `Descargando historial de ${record.type}...`);
    }
}

// Guardar historial de exportación
function saveExportHistory() {
    try {
        localStorage.setItem('exportHistory', JSON.stringify(exportHistory));
    } catch (e) {
        console.error('Error guardando historial:', e);
    }
}

// Funciones auxiliares
function generateStoreSummary() {
    const summary = {};
    
    salesData.forEach(item => {
        if (!summary[item.store]) {
            summary[item.store] = {
                store: item.store,
                totalSales: 0,
                transactions: 0,
                products: new Set()
            };
        }
        
        summary[item.store].totalSales += item.total;
        summary[item.store].transactions += 1;
        summary[item.store].products.add(item.product);
    });
    
    return Object.values(summary).map(store => ({
        Tienda: store.store,
        'Ventas Totales': store.totalSales.toFixed(2),
        'Transacciones': store.transactions,
        'Productos Únicos': store.products.size
    }));
}

function generateDailySummary() {
    const summary = {};
    
    salesData.forEach(item => {
        const date = item.date;
        if (!summary[date]) {
            summary[date] = {
                date: date,
                totalSales: 0,
                transactions: 0,
                stores: new Set()
            };
        }
        
        summary[date].totalSales += item.total;
        summary[date].transactions += 1;
        summary[date].stores.add(item.store);
    });
    
    return Object.values(summary).map(day => ({
        Fecha: day.date,
        'Ventas Totales': day.totalSales.toFixed(2),
        'Transacciones': day.transactions,
        'Tiendas Activas': day.stores.size
    }));
}

// Función para generar CSV
function generateCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

// Función para descargar CSV
function downloadCSV(content, filename) {
    downloadFile(content, filename, 'text/csv;charset=utf-8;');
}

// Función para descargar archivo
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función global para cerrar modales (usada en HTML)
window.closeModal = closeModal;

// Agregar event listeners adicionales
function setupAdditionalEventListeners() {
    // Event listener para el botón de filtros en la sección de reportes
    const btnFilter = document.getElementById('btnFilter');
    if (btnFilter) {
        btnFilter.addEventListener('click', applyFilters);
    }
    
    // Event listener para el cambio de tipo de fecha
    const dateType = document.getElementById('dateType');
    if (dateType) {
        dateType.addEventListener('change', handleDateTypeChange);
    }
    
    // Event listener para el botón de crear reporte personalizado
    const createCustomReportBtn = document.getElementById('createCustomReport');
    if (createCustomReportBtn) {
        createCustomReportBtn.addEventListener('click', createCustomReport);
    }
    
    // Event listener para cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Manejar tecla Escape para cerrar modales
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
        }
    });
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupAdditionalEventListeners();
});

// Función para actualizar tabla de reportes
function updateReportsTable() {
    const reportsTableBody = document.getElementById('reportsTableBody');
    if (!reportsTableBody) return;
    
    reportsTableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        reportsTableBody.innerHTML = `
            <tr class="no-data">
                <td colspan="6">
                    <div class="no-data-content">
                        <i class="fas fa-inbox"></i>
                        <p>No hay datos disponibles para los filtros aplicados.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Agrupar datos según el tipo de reporte seleccionado
    const dateType = document.getElementById('dateType');
    const reportType = dateType ? dateType.value : 'weekly';
    
    let groupedData = [];
    
    switch (reportType) {
        case 'weekly':
            groupedData = groupDataByWeek(filteredData);
            break;
        case 'monthly':
            groupedData = groupDataByMonth(filteredData);
            break;
        case 'yearly':
            groupedData = groupDataByYear(filteredData);
            break;
        default:
            groupedData = filteredData;
    }
    
    // Ordenar datos por total de ventas (descendente)
    groupedData.sort((a, b) => b.total - a.total);
    
    // Mostrar datos agrupados
    groupedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.store}</strong></td>
            <td>${item.product}</td>
            <td><span class="period-badge">${item.period}</span></td>
            <td>${item.quantity.toLocaleString()}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td><strong>$${item.total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</strong></td>
        `;
        reportsTableBody.appendChild(row);
    });
    
    // Agregar fila de totales
    if (groupedData.length > 0) {
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        const totalQuantity = groupedData.reduce((sum, item) => sum + item.quantity, 0);
        const totalSales = groupedData.reduce((sum, item) => sum + item.total, 0);
        
        totalRow.innerHTML = `
            <td colspan="3"><strong>TOTALES</strong></td>
            <td><strong>${totalQuantity.toLocaleString()}</strong></td>
            <td></td>
            <td><strong>$${totalSales.toLocaleString('es-MX', {minimumFractionDigits: 2})}</strong></td>
        `;
        reportsTableBody.appendChild(totalRow);
    }
}

// Función para agrupar datos por semana
function groupDataByWeek(data) {
    const grouped = {};
    
    data.forEach(item => {
        const weekKey = `Semana ${item.week}`;
        if (!grouped[weekKey]) {
            grouped[weekKey] = {
                store: item.store,
                product: item.product,
                period: weekKey,
                quantity: 0,
                unitPrice: 0,
                total: 0,
                count: 0
            };
        }
        
        grouped[weekKey].quantity += item.quantity;
        grouped[weekKey].unitPrice = (grouped[weekKey].unitPrice + item.unitPrice) / 2;
        grouped[weekKey].total += item.total;
        grouped[weekKey].count += 1;
    });
    
    return Object.values(grouped);
}

// Función para agrupar datos por mes
function groupDataByMonth(data) {
    const grouped = {};
    
    data.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        
        if (!grouped[monthKey]) {
            grouped[monthKey] = {
                store: item.store,
                product: item.product,
                period: monthName,
                quantity: 0,
                unitPrice: 0,
                total: 0,
                count: 0
            };
        }
        
        grouped[monthKey].quantity += item.quantity;
        grouped[monthKey].unitPrice = (grouped[monthKey].unitPrice + item.unitPrice) / 2;
        grouped[monthKey].total += item.total;
        grouped[monthKey].count += 1;
    });
    
    return Object.values(grouped);
}

// Función para agrupar datos por año
function groupDataByYear(data) {
    const grouped = {};
    
    data.forEach(item => {
        const date = new Date(item.date);
        const yearKey = date.getFullYear().toString();
        
        if (!grouped[yearKey]) {
            grouped[yearKey] = {
                store: item.store,
                product: item.product,
                period: yearKey,
                quantity: 0,
                unitPrice: 0,
                total: 0,
                count: 0
            };
        }
        
        grouped[yearKey].quantity += item.quantity;
        grouped[yearKey].unitPrice = (grouped[yearKey].unitPrice + item.unitPrice) / 2;
        grouped[yearKey].total += item.total;
        grouped[yearKey].count += 1;
    });
    
    return Object.values(grouped);
}

// Función para aplicar filtros de reportes
function applyFilters() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const storeFilter = document.getElementById('storeFilter');
    const dateType = document.getElementById('dateType');
    
    if (!startDate || !endDate || !storeFilter || !dateType) return;
    
    let filtered = [...salesData];
    
    // Filtro por fecha
    if (startDate.value && endDate.value) {
        const fromDate = new Date(startDate.value);
        const toDate = new Date(endDate.value);
        
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= fromDate && itemDate <= toDate;
        });
    }
    
    // Filtro por tienda
    if (storeFilter.value) {
        filtered = filtered.filter(item => item.store === storeFilter.value);
    }
    
    // Actualizar datos filtrados
    filteredData = filtered;
    
    // Actualizar tabla de reportes
    updateReportsTable();
    
    // Mostrar resumen de filtros aplicados
    showFilterSummary(filtered.length);
    
    // Actualizar KPIs si están disponibles
    updateReportsKPIs(filtered);
}

// Función para mostrar resumen de filtros aplicados
function showFilterSummary(recordCount) {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const storeFilter = document.getElementById('storeFilter');
    const dateType = document.getElementById('dateType');
    
    let summary = `Filtros aplicados: `;
    let filters = [];
    
    if (startDate.value && endDate.value) {
        filters.push(`Fecha: ${startDate.value} a ${endDate.value}`);
    }
    
    if (storeFilter.value) {
        filters.push(`Tienda: ${storeFilter.value}`);
    }
    
    if (dateType.value) {
        const typeLabels = {
            'weekly': 'Semanal',
            'monthly': 'Mensual',
            'yearly': 'Anual'
        };
        filters.push(`Tipo: ${typeLabels[dateType.value]}`);
    }
    
    summary += filters.join(', ');
    summary += ` | Registros encontrados: ${recordCount.toLocaleString()}`;
    
    // Mostrar resumen en la UI
    const filterSummary = document.getElementById('filterSummary');
    if (filterSummary) {
        filterSummary.textContent = summary;
        filterSummary.style.display = 'block';
    } else {
        // Crear elemento de resumen si no existe
        createFilterSummaryElement(summary);
    }
}

// Función para crear elemento de resumen de filtros
function createFilterSummaryElement(summary) {
    const reportsSection = document.querySelector('#reports .container');
    if (!reportsSection) return;
    
    // Buscar si ya existe un resumen
    let existingSummary = document.getElementById('filterSummary');
    if (existingSummary) {
        existingSummary.remove();
    }
    
    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'filterSummary';
    summaryDiv.className = 'filter-summary';
    summaryDiv.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i>
            <span>${summary}</span>
            <button type="button" class="btn-close" onclick="clearFilters()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Insertar después de los filtros
    const filterCard = reportsSection.querySelector('.filter-card');
    if (filterCard) {
        filterCard.insertAdjacentElement('afterend', summaryDiv);
    }
}

// Función para limpiar filtros
function clearFilters() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const storeFilter = document.getElementById('storeFilter');
    const dateType = document.getElementById('dateType');
    
    if (startDate) startDate.value = '';
    if (endDate) endDate.value = '';
    if (storeFilter) storeFilter.value = '';
    if (dateType) dateType.value = 'weekly';
    
    // Restaurar datos originales
    filteredData = [...salesData];
    
    // Actualizar tabla
    updateReportsTable();
    
    // Ocultar resumen
    const filterSummary = document.getElementById('filterSummary');
    if (filterSummary) {
        filterSummary.style.display = 'none';
    }
    
    // Actualizar KPIs
    updateReportsKPIs(filteredData);
}

// Función para manejar cambio de tipo de fecha
function handleDateTypeChange() {
    const dateType = document.getElementById('dateType');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (!dateType || !startDate || !endDate) return;
    
    const today = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (dateType.value) {
        case 'weekly':
            // Última semana
            start.setDate(today.getDate() - 7);
            break;
        case 'monthly':
            // Último mes
            start.setMonth(today.getMonth() - 1);
            break;
        case 'yearly':
            // Último año
            start.setFullYear(today.getFullYear() - 1);
            break;
    }
    
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = today.toISOString().split('T')[0];
    
    // Aplicar filtros automáticamente
    applyFilters();
}

// Función para actualizar KPIs de reportes
function updateReportsKPIs(data) {
    const totalSales = data.reduce((sum, item) => sum + item.total, 0);
    const totalTransactions = data.length;
    const uniqueStores = new Set(data.map(item => item.store));
    const uniqueProducts = new Set(data.map(item => item.product));
    
    // Buscar elementos de KPIs en la sección de reportes
    const reportsKPIs = document.querySelectorAll('#reports .kpi-card .kpi-value');
    if (reportsKPIs.length >= 4) {
        reportsKPIs[0].textContent = `$${totalSales.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
        reportsKPIs[1].textContent = totalTransactions.toLocaleString();
        reportsKPIs[2].textContent = uniqueStores.size;
        reportsKPIs[3].textContent = uniqueProducts.size;
    }
}

// Función para configurar filtros de reportes
function setupReportsFilters() {
    
    // Configurar fechas por defecto
    const today = new Date();
    const lastWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate && endDate) {
        startDate.value = lastWeek.toISOString().split('T')[0];
        endDate.value = today.toISOString().split('T')[0];
    }
    
    // Event listeners para filtros
    const btnFilter = document.getElementById('btnFilter');
    const dateType = document.getElementById('dateType');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const storeFilterSelect = document.getElementById('storeFilter');
    
    if (btnFilter) {
        btnFilter.addEventListener('click', applyFilters);
    }
    
    if (dateType) {
        dateType.addEventListener('change', handleDateTypeChange);
    }
    
    if (startDateInput) {
        startDateInput.addEventListener('change', applyFilters);
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', applyFilters);
    }
    
    if (storeFilterSelect) {
        storeFilterSelect.addEventListener('change', applyFilters);
    }
    
    // Botón para limpiar filtros
    const btnClearFilters = document.getElementById('btnClearFilters');
    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', clearFilters);
    }
    
    // Botón para exportar reporte
    const btnExportReport = document.getElementById('btnExportReport');
    if (btnExportReport) {
        btnExportReport.addEventListener('click', exportFilteredReport);
    }
    
    // Aplicar filtros iniciales
    setTimeout(() => {
        applyFilters();
    }, 100);
}

// Función para exportar reporte filtrado
function exportFilteredReport() {
    if (filteredData.length === 0) {
        showModal('error', 'Sin datos', 'No hay datos para exportar. Aplica filtros primero.');
        return;
    }
    
    const dateType = document.getElementById('dateType');
    const reportType = dateType ? dateType.value : 'weekly';
    
    // Generar nombre del archivo
    const today = new Date().toISOString().split('T')[0];
    const typeLabels = {
        'weekly': 'Semanal',
        'monthly': 'Mensual',
        'yearly': 'Anual'
    };
    
    const filename = `reporte_${typeLabels[reportType]}_${today}.csv`;
    
    // Generar CSV con datos filtrados
    const csvContent = generateCSV(filteredData);
    downloadCSV(csvContent, filename);
    
    // Agregar al historial de exportación
    addToExportHistory('Reporte Filtrado', 'CSV', `Reporte ${typeLabels[reportType]} filtrado`, filteredData.length);
    
    // Mostrar confirmación
    showModal('success', 'Exportación Exitosa', `Se exportó el reporte ${typeLabels[reportType]} con ${filteredData.length.toLocaleString()} registros.`);
}

// Función para actualizar las opciones de exportación cuando los datos cambien
function updateExportOptions() {
    const stores = [...new Set(salesData.map(item => item.store))];
    const products = [...new Set(salesData.map(item => item.product))];
    
    console.log('Actualizando opciones de exportación:', { stores, products });
    
    // Llenar selector de tiendas
    const exportStores = document.getElementById('exportStores');
    if (exportStores) {
        exportStores.innerHTML = '<option value="">Seleccionar tiendas</option>';
        stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store;
            option.textContent = store;
            exportStores.appendChild(option);
        });
        console.log('Tiendas cargadas:', exportStores.options.length - 1);
    }
    
    // Llenar selector de productos
    const exportProducts = document.getElementById('exportProducts');
    if (exportProducts) {
        exportProducts.innerHTML = '<option value="">Seleccionar productos</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = product;
            exportProducts.appendChild(option);
        });
        console.log('Productos cargados:', exportProducts.options.length - 1);
    }
}