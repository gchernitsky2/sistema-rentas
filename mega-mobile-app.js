// MEGA Property Management Mobile App - Sistema Completo
// Versión 3.0.0 - Optimizado para iPhone y dispositivos móviles

class MegaMobileApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentUser = {
            id: 'USR001',
            nombre: 'Admin',
            email: 'admin@megapro.com',
            rol: 'administrador'
        };
        
        // Base de datos completa
        this.database = {
            properties: [],
            tenants: [],
            contracts: [],
            payments: [],
            maintenance: [],
            services: {
                agua: [],
                luz: [],
                gas: [],
                internet: []
            },
            documents: [],
            reports: [],
            notifications: []
        };

        // Detectar iOS
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isStandalone = window.navigator.standalone === true;
        
        this.init();
    }

    init() {
        console.log('📱 MEGA Mobile App - Iniciando...');
        this.loadData();
        this.setupEventListeners();
        this.setupMobileFeatures();
        this.navigate('dashboard');
        
        // Registrar Service Worker para PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(e => console.log(e));
        }
    }

    setupMobileFeatures() {
        // Prevenir zoom en iOS
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        
        // Haptic feedback para iOS
        if (this.isIOS && window.Taptic) {
            document.addEventListener('click', () => {
                window.Taptic.impact({ style: 'light' });
            });
        }
        
        // Pull to refresh
        this.setupPullToRefresh();
        
        // Swipe gestures
        this.setupSwipeGestures();
    }

    setupPullToRefresh() {
        let startY = 0;
        let pulling = false;
        
        const content = document.getElementById('mobileContent');
        
        content.addEventListener('touchstart', (e) => {
            if (content.scrollTop === 0) {
                startY = e.touches[0].pageY;
                pulling = true;
            }
        });
        
        content.addEventListener('touchmove', (e) => {
            if (!pulling) return;
            
            const y = e.touches[0].pageY;
            const diff = y - startY;
            
            if (diff > 60 && content.scrollTop === 0) {
                this.refresh();
                pulling = false;
            }
        });
        
        content.addEventListener('touchend', () => {
            pulling = false;
        });
    }

    setupSwipeGestures() {
        let startX = 0;
        const sidebar = document.getElementById('mobileSidebar');
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].pageX;
            const diff = endX - startX;
            
            // Swipe right to open sidebar
            if (diff > 50 && startX < 30) {
                this.openSidebar();
            }
            
            // Swipe left to close sidebar
            if (diff < -50 && sidebar.classList.contains('active')) {
                this.closeSidebar();
            }
        });
    }

    setupEventListeners() {
        // Back button handling
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigate(e.state.page, false);
            }
        });
        
        // Offline/Online detection
        window.addEventListener('online', () => {
            this.showToast('Conexión restaurada', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showToast('Sin conexión a internet', 'warning');
        });
    }

    // ==================== NAVEGACIÓN ====================
    
    navigate(page, pushState = true) {
        // Update navigation states
        this.currentPage = page;
        
        // Update URL without reload
        if (pushState) {
            history.pushState({ page }, '', `#${page}`);
        }
        
        // Update active states
        this.updateActiveStates(page);
        
        // Render page content
        this.renderPage(page);
        
        // Close sidebar on mobile
        this.closeSidebar();
        
        // Scroll to top
        document.getElementById('mobileContent').scrollTop = 0;
    }

    updateActiveStates(page) {
        // Update sidebar nav
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNav = document.querySelector(`.mobile-nav-item[onclick*="'${page}'"]`);
        if (activeNav) activeNav.classList.add('active');
        
        // Update bottom nav
        document.querySelectorAll('.mobile-bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeBottom = document.querySelector(`.mobile-bottom-nav-item[onclick*="'${page}'"]`);
        if (activeBottom) activeBottom.classList.add('active');
    }

    renderPage(page) {
        const content = document.getElementById('mobileContent');
        
        switch(page) {
            case 'dashboard':
                content.innerHTML = this.renderDashboard();
                break;
            case 'properties':
                content.innerHTML = this.renderProperties();
                break;
            case 'tenants':
                content.innerHTML = this.renderTenants();
                break;
            case 'contracts':
                content.innerHTML = this.renderContracts();
                break;
            case 'payments':
                content.innerHTML = this.renderPayments();
                break;
            case 'maintenance':
                content.innerHTML = this.renderMaintenance();
                break;
            case 'services':
                content.innerHTML = this.renderServices();
                break;
            case 'reports':
                content.innerHTML = this.renderReports();
                break;
            case 'settings':
                content.innerHTML = this.renderSettings();
                break;
            case 'more':
                content.innerHTML = this.renderMore();
                break;
            default:
                content.innerHTML = this.renderDashboard();
        }
    }

    // ==================== DASHBOARD ====================
    
    renderDashboard() {
        const stats = this.calculateStats();
        
        return `
            <div class="mobile-page">
                <!-- Header -->
                <h1 style="font-size: 24px; margin-bottom: 20px;">
                    Hola, ${this.currentUser.nombre} 👋
                </h1>
                
                <!-- Quick Actions -->
                <div class="mobile-quick-actions">
                    <a class="mobile-quick-action" onclick="mobileApp.showModal('property')">
                        <i class="fas fa-plus"></i> Propiedad
                    </a>
                    <a class="mobile-quick-action" onclick="mobileApp.showModal('tenant')">
                        <i class="fas fa-user-plus"></i> Inquilino
                    </a>
                    <a class="mobile-quick-action" onclick="mobileApp.showModal('payment')">
                        <i class="fas fa-dollar-sign"></i> Pago
                    </a>
                    <a class="mobile-quick-action" onclick="mobileApp.showModal('maintenance')">
                        <i class="fas fa-wrench"></i> Servicio
                    </a>
                </div>
                
                <!-- Stats Grid -->
                <div class="mobile-stats-grid">
                    <div class="mobile-stat-card">
                        <div class="mobile-stat-value">${stats.properties}</div>
                        <div class="mobile-stat-label">Propiedades</div>
                    </div>
                    <div class="mobile-stat-card">
                        <div class="mobile-stat-value">${stats.tenants}</div>
                        <div class="mobile-stat-label">Inquilinos</div>
                    </div>
                    <div class="mobile-stat-card">
                        <div class="mobile-stat-value">${stats.occupied}%</div>
                        <div class="mobile-stat-label">Ocupación</div>
                    </div>
                    <div class="mobile-stat-card">
                        <div class="mobile-stat-value">${stats.revenue}</div>
                        <div class="mobile-stat-label">Ingresos/mes</div>
                    </div>
                </div>
                
                <!-- Pending Alerts -->
                ${this.renderAlerts()}
                
                <!-- Recent Activity -->
                <div class="mobile-card">
                    <div class="mobile-card-header">
                        <h3 class="mobile-card-title">Actividad Reciente</h3>
                        <a style="color: var(--primary); font-size: 14px;">Ver todo</a>
                    </div>
                    ${this.renderRecentActivity()}
                </div>
                
                <!-- Quick Stats -->
                <div class="mobile-card">
                    <div class="mobile-card-header">
                        <h3 class="mobile-card-title">Resumen del Día</h3>
                    </div>
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                            <span>Pagos recibidos hoy</span>
                            <strong style="color: var(--success);">5</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                            <span>Mantenimientos pendientes</span>
                            <strong style="color: var(--warning);">3</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span>Contratos por vencer</span>
                            <strong style="color: var(--danger);">2</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAlerts() {
        const alerts = [
            { type: 'warning', text: '3 pagos están próximos a vencer' },
            { type: 'danger', text: '1 contrato vence en 7 días' },
            { type: 'info', text: 'Mantenimiento programado mañana' }
        ];
        
        return `
            <div style="margin-bottom: 20px;">
                ${alerts.map(alert => `
                    <div style="background: ${this.getAlertColor(alert.type)}; padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-${this.getAlertIcon(alert.type)}" style="color: ${this.getAlertTextColor(alert.type)};"></i>
                        <span style="flex: 1; font-size: 14px; color: ${this.getAlertTextColor(alert.type)};">${alert.text}</span>
                        <i class="fas fa-chevron-right" style="color: ${this.getAlertTextColor(alert.type)}; opacity: 0.5;"></i>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRecentActivity() {
        const activities = [
            { icon: 'dollar-sign', title: 'Pago recibido', subtitle: 'Juan Pérez - Depto 101', time: 'Hace 2 horas' },
            { icon: 'tools', title: 'Mantenimiento completado', subtitle: 'Reparación de fuga - Casa 25', time: 'Hace 4 horas' },
            { icon: 'user-plus', title: 'Nuevo inquilino', subtitle: 'María García - Local 3', time: 'Ayer' }
        ];
        
        return `
            <div>
                ${activities.map(activity => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                        <div style="width: 40px; height: 40px; background: var(--light); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-${activity.icon}" style="color: var(--primary);"></i>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 14px;">${activity.title}</div>
                            <div style="font-size: 12px; color: var(--secondary);">${activity.subtitle}</div>
                        </div>
                        <div style="font-size: 11px; color: var(--secondary);">${activity.time}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ==================== PROPIEDADES ====================
    
    renderProperties() {
        const properties = this.database.properties;
        
        return `
            <div class="mobile-page">
                <!-- Search Bar -->
                <div class="mobile-search">
                    <i class="fas fa-search mobile-search-icon"></i>
                    <input type="text" class="mobile-search-input" placeholder="Buscar propiedades..." 
                           onkeyup="mobileApp.searchProperties(this.value)">
                </div>
                
                <!-- Filter Tabs -->
                <div class="mobile-tabs">
                    <button class="mobile-tab active" onclick="mobileApp.filterProperties('all')">Todas</button>
                    <button class="mobile-tab" onclick="mobileApp.filterProperties('available')">Disponibles</button>
                    <button class="mobile-tab" onclick="mobileApp.filterProperties('occupied')">Ocupadas</button>
                    <button class="mobile-tab" onclick="mobileApp.filterProperties('maintenance')">Mantenimiento</button>
                </div>
                
                <!-- Properties List -->
                <div class="mobile-list" id="propertiesList">
                    ${properties.length > 0 ? properties.map(property => this.renderPropertyCard(property)).join('') : 
                      this.renderEmptyState('properties')}
                </div>
                
                <!-- Add Button -->
                <div style="padding: 16px;">
                    <button class="mobile-btn mobile-btn-primary" onclick="mobileApp.showPropertyModal()">
                        <i class="fas fa-plus"></i> Agregar Propiedad
                    </button>
                </div>
            </div>
        `;
    }

    renderPropertyCard(property) {
        return `
            <div class="mobile-list-item" onclick="mobileApp.viewPropertyDetails('${property.id}')">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; margin-right: 12px;"></div>
                <div class="mobile-list-item-content">
                    <div class="mobile-list-item-title">${property.name || property.address}</div>
                    <div class="mobile-list-item-subtitle">${property.type} • ${property.bedrooms}rec ${property.bathrooms}baños</div>
                    <div style="display: flex; gap: 8px; margin-top: 4px;">
                        <span style="background: ${property.status === 'ocupada' ? 'var(--success)' : 'var(--warning)'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                            ${property.status}
                        </span>
                        <span style="font-weight: 600; color: var(--primary);">$${property.rent}/mes</span>
                    </div>
                </div>
                <i class="fas fa-chevron-right mobile-list-item-action"></i>
            </div>
        `;
    }

    // ==================== INQUILINOS ====================
    
    renderTenants() {
        const tenants = this.database.tenants;
        
        return `
            <div class="mobile-page">
                <!-- Search Bar -->
                <div class="mobile-search">
                    <i class="fas fa-search mobile-search-icon"></i>
                    <input type="text" class="mobile-search-input" placeholder="Buscar inquilinos..." 
                           onkeyup="mobileApp.searchTenants(this.value)">
                </div>
                
                <!-- Tenants List -->
                <div class="mobile-list" id="tenantsList">
                    ${tenants.length > 0 ? tenants.map(tenant => this.renderTenantCard(tenant)).join('') :
                      this.renderEmptyState('tenants')}
                </div>
                
                <!-- Add Button -->
                <div style="padding: 16px;">
                    <button class="mobile-btn mobile-btn-primary" onclick="mobileApp.showTenantModal()">
                        <i class="fas fa-user-plus"></i> Agregar Inquilino
                    </button>
                </div>
            </div>
        `;
    }

    renderTenantCard(tenant) {
        return `
            <div class="mobile-list-item" onclick="mobileApp.viewTenantDetails('${tenant.id}')">
                <div style="width: 50px; height: 50px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 12px;">
                    ${tenant.name ? tenant.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div class="mobile-list-item-content">
                    <div class="mobile-list-item-title">${tenant.name}</div>
                    <div class="mobile-list-item-subtitle">${tenant.property || 'Sin propiedad asignada'}</div>
                    <div style="font-size: 12px; color: var(--secondary); margin-top: 4px;">
                        <i class="fas fa-phone"></i> ${tenant.phone}
                    </div>
                </div>
                <i class="fas fa-chevron-right mobile-list-item-action"></i>
            </div>
        `;
    }

    // ==================== CONTRATOS COMPLETO ====================
    
    renderContracts() {
        const contracts = this.database.contracts;
        
        return `
            <div class="mobile-page">
                <!-- Stats -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
                    <div style="background: var(--success); color: white; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 20px; font-weight: 700;">${contracts.filter(c => c.status === 'active').length}</div>
                        <div style="font-size: 11px;">Activos</div>
                    </div>
                    <div style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 20px; font-weight: 700;">${contracts.filter(c => c.daysToExpire <= 30).length}</div>
                        <div style="font-size: 11px;">Por vencer</div>
                    </div>
                    <div style="background: var(--danger); color: white; padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 20px; font-weight: 700;">${contracts.filter(c => c.status === 'expired').length}</div>
                        <div style="font-size: 11px;">Vencidos</div>
                    </div>
                </div>
                
                <!-- Contracts List -->
                <div class="mobile-list">
                    ${contracts.length > 0 ? contracts.map(contract => `
                        <div class="mobile-list-item" onclick="mobileApp.viewContractDetails('${contract.id}')">
                            <div class="mobile-list-item-content">
                                <div class="mobile-list-item-title">Contrato #${contract.number}</div>
                                <div class="mobile-list-item-subtitle">${contract.tenant} • ${contract.property}</div>
                                <div style="display: flex; gap: 8px; margin-top: 4px;">
                                    <span style="font-size: 12px; color: var(--secondary);">
                                        <i class="fas fa-calendar"></i> ${contract.startDate} - ${contract.endDate}
                                    </span>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right mobile-list-item-action"></i>
                        </div>
                    `).join('') : this.renderEmptyState('contracts')}
                </div>
                
                <!-- Add Button -->
                <div style="padding: 16px;">
                    <button class="mobile-btn mobile-btn-primary" onclick="mobileApp.showContractModal()">
                        <i class="fas fa-file-contract"></i> Nuevo Contrato
                    </button>
                </div>
            </div>
        `;
    }

    // ==================== PAGOS COMPLETO ====================
    
    renderPayments() {
        const payments = this.database.payments;
        const stats = this.calculatePaymentStats();
        
        return `
            <div class="mobile-page">
                <!-- Payment Stats -->
                <div class="mobile-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <div style="font-size: 12px; opacity: 0.9;">Total cobrado este mes</div>
                    <div style="font-size: 28px; font-weight: 700; margin: 8px 0;">$${stats.totalCollected.toLocaleString()}</div>
                    <div style="display: flex; gap: 16px; font-size: 12px;">
                        <span><i class="fas fa-check-circle"></i> ${stats.paid} Pagados</span>
                        <span><i class="fas fa-clock"></i> ${stats.pending} Pendientes</span>
                        <span><i class="fas fa-exclamation-circle"></i> ${stats.overdue} Vencidos</span>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                    <button class="mobile-btn mobile-btn-success" onclick="mobileApp.registerPayment()">
                        <i class="fas fa-plus"></i> Registrar Pago
                    </button>
                    <button class="mobile-btn mobile-btn-outline" onclick="mobileApp.sendReminders()">
                        <i class="fas fa-bell"></i> Enviar Recordatorios
                    </button>
                </div>
                
                <!-- Tabs -->
                <div class="mobile-tabs">
                    <button class="mobile-tab active" onclick="mobileApp.filterPayments('all')">Todos</button>
                    <button class="mobile-tab" onclick="mobileApp.filterPayments('pending')">Pendientes</button>
                    <button class="mobile-tab" onclick="mobileApp.filterPayments('paid')">Pagados</button>
                    <button class="mobile-tab" onclick="mobileApp.filterPayments('overdue')">Vencidos</button>
                </div>
                
                <!-- Payments List -->
                <div class="mobile-list" id="paymentsList">
                    ${payments.length > 0 ? payments.map(payment => this.renderPaymentCard(payment)).join('') :
                      this.renderEmptyState('payments')}
                </div>
            </div>
        `;
    }

    renderPaymentCard(payment) {
        const statusColor = payment.status === 'paid' ? 'var(--success)' : 
                           payment.status === 'overdue' ? 'var(--danger)' : 'var(--warning)';
        
        return `
            <div class="mobile-list-item" onclick="mobileApp.viewPaymentDetails('${payment.id}')">
                <div style="width: 50px; height: 50px; background: ${statusColor}; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                    <i class="fas fa-${payment.status === 'paid' ? 'check' : 'clock'}"></i>
                </div>
                <div class="mobile-list-item-content">
                    <div class="mobile-list-item-title">${payment.tenant}</div>
                    <div class="mobile-list-item-subtitle">${payment.property} • ${payment.concept}</div>
                    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                        <span style="font-weight: 600; color: var(--dark);">$${payment.amount.toLocaleString()}</span>
                        <span style="font-size: 12px; color: var(--secondary);">${payment.dueDate}</span>
                    </div>
                </div>
                <i class="fas fa-chevron-right mobile-list-item-action"></i>
            </div>
        `;
    }

    // ==================== MANTENIMIENTO COMPLETO ====================
    
    renderMaintenance() {
        const orders = this.database.maintenance;
        
        return `
            <div class="mobile-page">
                <!-- Status Cards -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                    <div class="mobile-card" style="border-left: 4px solid var(--danger);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 24px; font-weight: 700; color: var(--danger);">
                                    ${orders.filter(o => o.priority === 'urgent').length}
                                </div>
                                <div style="font-size: 12px; color: var(--secondary);">Urgentes</div>
                            </div>
                            <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: var(--danger); opacity: 0.3;"></i>
                        </div>
                    </div>
                    <div class="mobile-card" style="border-left: 4px solid var(--warning);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 24px; font-weight: 700; color: var(--warning);">
                                    ${orders.filter(o => o.status === 'pending').length}
                                </div>
                                <div style="font-size: 12px; color: var(--secondary);">Pendientes</div>
                            </div>
                            <i class="fas fa-clock" style="font-size: 24px; color: var(--warning); opacity: 0.3;"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Add Button -->
                <button class="mobile-btn mobile-btn-warning" onclick="mobileApp.newMaintenanceOrder()" style="margin-bottom: 16px;">
                    <i class="fas fa-tools"></i> Nueva Orden de Servicio
                </button>
                
                <!-- Tabs -->
                <div class="mobile-tabs">
                    <button class="mobile-tab active" onclick="mobileApp.filterMaintenance('all')">Todas</button>
                    <button class="mobile-tab" onclick="mobileApp.filterMaintenance('urgent')">Urgentes</button>
                    <button class="mobile-tab" onclick="mobileApp.filterMaintenance('pending')">Pendientes</button>
                    <button class="mobile-tab" onclick="mobileApp.filterMaintenance('completed')">Completadas</button>
                </div>
                
                <!-- Maintenance Orders -->
                <div class="mobile-list">
                    ${orders.length > 0 ? orders.map(order => this.renderMaintenanceCard(order)).join('') :
                      this.renderEmptyState('maintenance')}
                </div>
            </div>
        `;
    }

    renderMaintenanceCard(order) {
        const priorityColor = order.priority === 'urgent' ? 'var(--danger)' :
                             order.priority === 'high' ? 'var(--warning)' : 'var(--info)';
        
        return `
            <div class="mobile-list-item" onclick="mobileApp.viewMaintenanceDetails('${order.id}')">
                <div style="width: 50px; height: 50px; background: ${priorityColor}; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                    <i class="fas fa-${order.type === 'plumbing' ? 'tint' : order.type === 'electrical' ? 'bolt' : 'tools'}"></i>
                </div>
                <div class="mobile-list-item-content">
                    <div class="mobile-list-item-title">${order.title}</div>
                    <div class="mobile-list-item-subtitle">${order.property}</div>
                    <div style="display: flex; gap: 8px; margin-top: 4px;">
                        <span style="background: ${priorityColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                            ${order.priority}
                        </span>
                        <span style="font-size: 12px; color: var(--secondary);">
                            ${order.technician || 'Sin asignar'}
                        </span>
                    </div>
                </div>
                <i class="fas fa-chevron-right mobile-list-item-action"></i>
            </div>
        `;
    }

    // ==================== SERVICIOS COMPLETO ====================
    
    renderServices() {
        return `
            <div class="mobile-page">
                <h2 style="margin-bottom: 20px;">Gestión de Servicios</h2>
                
                <!-- Service Cards -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <div class="mobile-card" onclick="mobileApp.viewService('water')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <i class="fas fa-tint" style="font-size: 24px; color: #3b82f6;"></i>
                            <div style="font-weight: 600;">Agua</div>
                        </div>
                        <div style="font-size: 12px; color: var(--secondary);">42 propiedades</div>
                        <div style="font-size: 20px; font-weight: 700; color: var(--dark); margin-top: 4px;">$12,450</div>
                        <div style="font-size: 11px; color: var(--secondary);">Total mensual</div>
                    </div>
                    
                    <div class="mobile-card" onclick="mobileApp.viewService('electricity')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <i class="fas fa-bolt" style="font-size: 24px; color: #f59e0b;"></i>
                            <div style="font-weight: 600;">Luz</div>
                        </div>
                        <div style="font-size: 12px; color: var(--secondary);">42 propiedades</div>
                        <div style="font-size: 20px; font-weight: 700; color: var(--dark); margin-top: 4px;">$28,900</div>
                        <div style="font-size: 11px; color: var(--secondary);">Total mensual</div>
                    </div>
                    
                    <div class="mobile-card" onclick="mobileApp.viewService('gas')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <i class="fas fa-fire" style="font-size: 24px; color: #ef4444;"></i>
                            <div style="font-weight: 600;">Gas</div>
                        </div>
                        <div style="font-size: 12px; color: var(--secondary);">38 propiedades</div>
                        <div style="font-size: 20px; font-weight: 700; color: var(--dark); margin-top: 4px;">$8,200</div>
                        <div style="font-size: 11px; color: var(--secondary);">Total mensual</div>
                    </div>
                    
                    <div class="mobile-card" onclick="mobileApp.viewService('internet')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <i class="fas fa-wifi" style="font-size: 24px; color: #10b981;"></i>
                            <div style="font-weight: 600;">Internet</div>
                        </div>
                        <div style="font-size: 12px; color: var(--secondary);">35 propiedades</div>
                        <div style="font-size: 20px; font-weight: 700; color: var(--dark); margin-top: 4px;">$18,500</div>
                        <div style="font-size: 11px; color: var(--secondary);">Total mensual</div>
                    </div>
                </div>
                
                <!-- Pending Payments -->
                <div class="mobile-card" style="margin-top: 16px;">
                    <div class="mobile-card-header">
                        <h3 class="mobile-card-title">Pagos de Servicios Pendientes</h3>
                    </div>
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--light); border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-tint" style="color: #3b82f6;"></i>
                                <div>
                                    <div style="font-weight: 600; font-size: 14px;">Agua - Depto 101</div>
                                    <div style="font-size: 12px; color: var(--secondary);">Vence: 15 Nov</div>
                                </div>
                            </div>
                            <button class="mobile-btn mobile-btn-primary" style="padding: 8px 16px; width: auto;" onclick="mobileApp.payService('water', '101')">
                                Pagar
                            </button>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--light); border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-bolt" style="color: #f59e0b;"></i>
                                <div>
                                    <div style="font-weight: 600; font-size: 14px;">Luz - Casa 25</div>
                                    <div style="font-size: 12px; color: var(--secondary);">Vence: 18 Nov</div>
                                </div>
                            </div>
                            <button class="mobile-btn mobile-btn-primary" style="padding: 8px 16px; width: auto;" onclick="mobileApp.payService('electricity', '25')">
                                Pagar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== REPORTES ====================
    
    renderReports() {
        return `
            <div class="mobile-page">
                <h2 style="margin-bottom: 20px;">Reportes</h2>
                
                <!-- Report Types -->
                <div style="display: grid; gap: 12px;">
                    <div class="mobile-card" onclick="mobileApp.generateReport('monthly')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 50px; height: 50px; background: var(--primary); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 600;">Reporte Mensual</div>
                                    <div style="font-size: 12px; color: var(--secondary);">Estado financiero del mes</div>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right" style="color: var(--secondary);"></i>
                        </div>
                    </div>
                    
                    <div class="mobile-card" onclick="mobileApp.generateReport('occupancy')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 50px; height: 50px; background: var(--success); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-home"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 600;">Reporte de Ocupación</div>
                                    <div style="font-size: 12px; color: var(--secondary);">Análisis de propiedades</div>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right" style="color: var(--secondary);"></i>
                        </div>
                    </div>
                    
                    <div class="mobile-card" onclick="mobileApp.generateReport('payments')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 50px; height: 50px; background: var(--warning); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-dollar-sign"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 600;">Reporte de Pagos</div>
                                    <div style="font-size: 12px; color: var(--secondary);">Historial de cobros</div>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right" style="color: var(--secondary);"></i>
                        </div>
                    </div>
                    
                    <div class="mobile-card" onclick="mobileApp.generateReport('tax')" style="cursor: pointer;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 50px; height: 50px; background: var(--danger); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-receipt"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 600;">Reporte Fiscal</div>
                                    <div style="font-size: 12px; color: var(--secondary);">Información para SAT</div>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right" style="color: var(--secondary);"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Reports -->
                <div class="mobile-card" style="margin-top: 16px;">
                    <div class="mobile-card-header">
                        <h3 class="mobile-card-title">Reportes Recientes</h3>
                    </div>
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 14px; font-weight: 600;">Reporte Octubre 2024</div>
                                <div style="font-size: 12px; color: var(--secondary);">Generado: 1 Nov 2024</div>
                            </div>
                            <button style="background: none; border: none; color: var(--primary); font-size: 20px;">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== MORE MENU ====================
    
    renderMore() {
        return `
            <div class="mobile-page">
                <h2 style="margin-bottom: 20px;">Más Opciones</h2>
                
                <div class="mobile-list">
                    <div class="mobile-list-item" onclick="mobileApp.navigate('documents')">
                        <i class="fas fa-folder" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Documentos</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                    
                    <div class="mobile-list-item" onclick="mobileApp.navigate('insurance')">
                        <i class="fas fa-shield-alt" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Seguros</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                    
                    <div class="mobile-list-item" onclick="mobileApp.navigate('taxes')">
                        <i class="fas fa-calculator" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Impuestos</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                    
                    <div class="mobile-list-item" onclick="mobileApp.navigate('calendar')">
                        <i class="fas fa-calendar" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Calendario</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                    
                    <div class="mobile-list-item" onclick="mobileApp.navigate('analytics')">
                        <i class="fas fa-chart-bar" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Analytics</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                    
                    <div class="mobile-list-item" onclick="mobileApp.navigate('backup')">
                        <i class="fas fa-database" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Respaldo</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                    
                    <div class="mobile-list-item" onclick="mobileApp.navigate('help')">
                        <i class="fas fa-question-circle" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Ayuda</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== SETTINGS ====================
    
    renderSettings() {
        return `
            <div class="mobile-page">
                <h2 style="margin-bottom: 20px;">Configuración</h2>
                
                <!-- User Profile -->
                <div class="mobile-card" style="text-align: center;">
                    <div style="width: 80px; height: 80px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px;">
                        <i class="fas fa-user"></i>
                    </div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${this.currentUser.nombre}</div>
                    <div style="font-size: 14px; color: var(--secondary);">${this.currentUser.email}</div>
                    <button class="mobile-btn mobile-btn-outline" style="margin-top: 16px;" onclick="mobileApp.editProfile()">
                        Editar Perfil
                    </button>
                </div>
                
                <!-- Settings Sections -->
                <div class="mobile-list" style="margin-top: 16px;">
                    <div class="mobile-list-item" onclick="mobileApp.showSettingSection('company')">
                        <i class="fas fa-building" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Información de la Empresa</div>
                            <div class="mobile-list-item-subtitle">Datos fiscales y comerciales</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                    
                    <div class="mobile-list-item" onclick="mobileApp.showSettingSection('notifications')">
                        <i class="fas fa-bell" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Notificaciones</div>
                            <div class="mobile-list-item-subtitle">Alertas y recordatorios</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                    
                    <div class="mobile-list-item" onclick="mobileApp.showSettingSection('security')">
                        <i class="fas fa-lock" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Seguridad</div>
                            <div class="mobile-list-item-subtitle">Contraseña y acceso</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                    
                    <div class="mobile-list-item" onclick="mobileApp.showSettingSection('preferences')">
                        <i class="fas fa-cog" style="width: 24px; margin-right: 16px; color: var(--primary);"></i>
                        <div class="mobile-list-item-content">
                            <div class="mobile-list-item-title">Preferencias</div>
                            <div class="mobile-list-item-subtitle">Moneda, idioma, formato</div>
                        </div>
                        <i class="fas fa-chevron-right mobile-list-item-action"></i>
                    </div>
                </div>
                
                <!-- Actions -->
                <div style="padding: 16px 0;">
                    <button class="mobile-btn mobile-btn-outline" onclick="mobileApp.logout()" style="color: var(--danger); border-color: var(--danger);">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </button>
                </div>
            </div>
        `;
    }

    // ==================== MODALES MÓVILES ====================
    
    showPropertyModal() {
        const modal = `
            <div class="mobile-modal active" id="propertyModal">
                <div class="mobile-modal-header">
                    <h3 class="mobile-modal-title">Nueva Propiedad</h3>
                    <button class="mobile-modal-close" onclick="mobileApp.closeModal('propertyModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mobile-modal-body">
                    <form id="propertyForm">
                        <!-- Información Básica -->
                        <h4 style="margin-bottom: 16px; color: var(--primary);">Información Básica</h4>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Código de Propiedad *</label>
                            <input type="text" class="mobile-form-control" name="codigo" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Tipo de Propiedad *</label>
                            <select class="mobile-form-control" name="tipo" required>
                                <option value="">Seleccionar...</option>
                                <option value="casa">Casa</option>
                                <option value="departamento">Departamento</option>
                                <option value="local">Local Comercial</option>
                                <option value="oficina">Oficina</option>
                                <option value="bodega">Bodega</option>
                                <option value="terreno">Terreno</option>
                            </select>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Nombre/Alias</label>
                            <input type="text" class="mobile-form-control" name="nombre" placeholder="Ej: Casa de la Colina">
                        </div>
                        
                        <!-- Dirección Completa -->
                        <h4 style="margin: 24px 0 16px; color: var(--primary);">Dirección</h4>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Calle *</label>
                            <input type="text" class="mobile-form-control" name="calle" required>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div class="mobile-form-group">
                                <label class="mobile-form-label">Núm. Ext *</label>
                                <input type="text" class="mobile-form-control" name="numExt" required>
                            </div>
                            
                            <div class="mobile-form-group">
                                <label class="mobile-form-label">Núm. Int</label>
                                <input type="text" class="mobile-form-control" name="numInt">
                            </div>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Colonia *</label>
                            <input type="text" class="mobile-form-control" name="colonia" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Código Postal *</label>
                            <input type="tel" class="mobile-form-control" name="cp" maxlength="5" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Delegación/Municipio *</label>
                            <input type="text" class="mobile-form-control" name="delegacion" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Ciudad *</label>
                            <input type="text" class="mobile-form-control" name="ciudad" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Estado *</label>
                            <input type="text" class="mobile-form-control" name="estado" required>
                        </div>
                        
                        <!-- Características -->
                        <h4 style="margin: 24px 0 16px; color: var(--primary);">Características</h4>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <div class="mobile-form-group">
                                <label class="mobile-form-label">Recámaras</label>
                                <input type="number" class="mobile-form-control" name="recamaras" min="0">
                            </div>
                            
                            <div class="mobile-form-group">
                                <label class="mobile-form-label">Baños</label>
                                <input type="number" class="mobile-form-control" name="banos" min="0" step="0.5">
                            </div>
                            
                            <div class="mobile-form-group">
                                <label class="mobile-form-label">Estacionamientos</label>
                                <input type="number" class="mobile-form-control" name="estacionamientos" min="0">
                            </div>
                            
                            <div class="mobile-form-group">
                                <label class="mobile-form-label">M² Construcción</label>
                                <input type="number" class="mobile-form-control" name="m2construccion" min="0">
                            </div>
                        </div>
                        
                        <!-- Información Financiera -->
                        <h4 style="margin: 24px 0 16px; color: var(--primary);">Información Financiera</h4>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Precio de Renta *</label>
                            <input type="number" class="mobile-form-control" name="renta" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Depósito</label>
                            <input type="number" class="mobile-form-control" name="deposito">
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Cuota de Mantenimiento</label>
                            <input type="number" class="mobile-form-control" name="mantenimiento">
                        </div>
                    </form>
                </div>
                <div class="mobile-modal-footer">
                    <button class="mobile-btn mobile-btn-outline" onclick="mobileApp.closeModal('propertyModal')">
                        Cancelar
                    </button>
                    <button class="mobile-btn mobile-btn-primary" onclick="mobileApp.saveProperty()">
                        Guardar
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }

    showTenantModal() {
        const modal = `
            <div class="mobile-modal active" id="tenantModal">
                <div class="mobile-modal-header">
                    <h3 class="mobile-modal-title">Nuevo Inquilino</h3>
                    <button class="mobile-modal-close" onclick="mobileApp.closeModal('tenantModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mobile-modal-body">
                    <form id="tenantForm">
                        <!-- Información Personal -->
                        <h4 style="margin-bottom: 16px; color: var(--primary);">Información Personal</h4>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Nombre(s) *</label>
                            <input type="text" class="mobile-form-control" name="nombre" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Apellido Paterno *</label>
                            <input type="text" class="mobile-form-control" name="apellidoPaterno" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Apellido Materno</label>
                            <input type="text" class="mobile-form-control" name="apellidoMaterno">
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Fecha de Nacimiento</label>
                            <input type="date" class="mobile-form-control" name="fechaNacimiento">
                        </div>
                        
                        <!-- Documentos -->
                        <h4 style="margin: 24px 0 16px; color: var(--primary);">Documentos</h4>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">RFC</label>
                            <input type="text" class="mobile-form-control" name="rfc" maxlength="13">
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">CURP</label>
                            <input type="text" class="mobile-form-control" name="curp" maxlength="18">
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">INE/IFE</label>
                            <input type="text" class="mobile-form-control" name="ine">
                        </div>
                        
                        <!-- Contacto -->
                        <h4 style="margin: 24px 0 16px; color: var(--primary);">Contacto</h4>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Teléfono Celular *</label>
                            <input type="tel" class="mobile-form-control" name="telefono" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Email *</label>
                            <input type="email" class="mobile-form-control" name="email" required>
                        </div>
                        
                        <!-- Información Laboral -->
                        <h4 style="margin: 24px 0 16px; color: var(--primary);">Información Laboral</h4>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Ocupación</label>
                            <input type="text" class="mobile-form-control" name="ocupacion">
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Empresa</label>
                            <input type="text" class="mobile-form-control" name="empresa">
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Ingreso Mensual</label>
                            <input type="number" class="mobile-form-control" name="ingresoMensual">
                        </div>
                        
                        <!-- Referencias -->
                        <h4 style="margin: 24px 0 16px; color: var(--primary);">Referencias</h4>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Nombre Referencia 1</label>
                            <input type="text" class="mobile-form-control" name="ref1Nombre">
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Teléfono Referencia 1</label>
                            <input type="tel" class="mobile-form-control" name="ref1Telefono">
                        </div>
                    </form>
                </div>
                <div class="mobile-modal-footer">
                    <button class="mobile-btn mobile-btn-outline" onclick="mobileApp.closeModal('tenantModal')">
                        Cancelar
                    </button>
                    <button class="mobile-btn mobile-btn-primary" onclick="mobileApp.saveTenant()">
                        Guardar
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }

    showContractModal() {
        const modal = `
            <div class="mobile-modal active" id="contractModal">
                <div class="mobile-modal-header">
                    <h3 class="mobile-modal-title">Nuevo Contrato</h3>
                    <button class="mobile-modal-close" onclick="mobileApp.closeModal('contractModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mobile-modal-body">
                    <form id="contractForm">
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Propiedad *</label>
                            <select class="mobile-form-control" name="propiedad" required>
                                <option value="">Seleccionar propiedad...</option>
                                ${this.database.properties.map(p => `
                                    <option value="${p.id}">${p.name || p.address}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Inquilino *</label>
                            <select class="mobile-form-control" name="inquilino" required>
                                <option value="">Seleccionar inquilino...</option>
                                ${this.database.tenants.map(t => `
                                    <option value="${t.id}">${t.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Fecha de Inicio *</label>
                            <input type="date" class="mobile-form-control" name="fechaInicio" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Fecha de Término *</label>
                            <input type="date" class="mobile-form-control" name="fechaTermino" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Monto de Renta *</label>
                            <input type="number" class="mobile-form-control" name="montoRenta" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Depósito *</label>
                            <input type="number" class="mobile-form-control" name="deposito" required>
                        </div>
                        
                        <div class="mobile-form-group">
                            <label class="mobile-form-label">Día de Pago</label>
                            <input type="number" class="mobile-form-control" name="diaPago" min="1" max="31" value="1">
                        </div>
                    </form>
                </div>
                <div class="mobile-modal-footer">
                    <button class="mobile-btn mobile-btn-outline" onclick="mobileApp.closeModal('contractModal')">
                        Cancelar
                    </button>
                    <button class="mobile-btn mobile-btn-primary" onclick="mobileApp.saveContract()">
                        Guardar
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }

    // ==================== FUNCIONES AUXILIARES ====================
    
    calculateStats() {
        return {
            properties: this.database.properties.length,
            tenants: this.database.tenants.length,
            occupied: this.database.properties.length > 0 ? 
                Math.round((this.database.properties.filter(p => p.status === 'occupied').length / this.database.properties.length) * 100) : 0,
            revenue: '$485K'
        };
    }

    calculatePaymentStats() {
        return {
            totalCollected: 485320,
            paid: 38,
            pending: 4,
            overdue: 2
        };
    }

    getAlertColor(type) {
        const colors = {
            warning: 'rgba(245, 158, 11, 0.1)',
            danger: 'rgba(239, 68, 68, 0.1)',
            info: 'rgba(59, 130, 246, 0.1)',
            success: 'rgba(16, 185, 129, 0.1)'
        };
        return colors[type] || colors.info;
    }

    getAlertTextColor(type) {
        const colors = {
            warning: 'var(--warning)',
            danger: 'var(--danger)',
            info: 'var(--info)',
            success: 'var(--success)'
        };
        return colors[type] || colors.info;
    }

    getAlertIcon(type) {
        const icons = {
            warning: 'exclamation-triangle',
            danger: 'exclamation-circle',
            info: 'info-circle',
            success: 'check-circle'
        };
        return icons[type] || 'info-circle';
    }

    renderEmptyState(type) {
        const messages = {
            properties: 'No hay propiedades registradas',
            tenants: 'No hay inquilinos registrados',
            contracts: 'No hay contratos activos',
            payments: 'No hay pagos registrados',
            maintenance: 'No hay órdenes de mantenimiento'
        };
        
        return `
            <div style="text-align: center; padding: 40px; color: var(--secondary);">
                <i class="fas fa-inbox" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                <p>${messages[type] || 'No hay datos'}</p>
            </div>
        `;
    }

    // ==================== SIDEBAR CONTROLS ====================
    
    toggleSidebar() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.querySelector('.mobile-sidebar-overlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    openSidebar() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.querySelector('.mobile-sidebar-overlay');
        
        sidebar.classList.add('active');
        overlay.classList.add('active');
    }

    closeSidebar() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.querySelector('.mobile-sidebar-overlay');
        
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    // ==================== MODAL CONTROLS ====================
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    showModal(type) {
        switch(type) {
            case 'property':
                this.showPropertyModal();
                break;
            case 'tenant':
                this.showTenantModal();
                break;
            case 'payment':
                this.showPaymentModal();
                break;
            case 'maintenance':
                this.showMaintenanceModal();
                break;
            case 'contract':
                this.showContractModal();
                break;
        }
    }

    // ==================== TOAST NOTIFICATIONS ====================
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('mobileToast');
        toast.textContent = message;
        toast.className = 'mobile-toast show';
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ==================== DATA OPERATIONS ====================
    
    saveProperty() {
        const form = document.getElementById('propertyForm');
        const formData = new FormData(form);
        
        const property = {};
        formData.forEach((value, key) => {
            property[key] = value;
        });
        
        property.id = 'PROP' + Date.now();
        property.status = 'available';
        property.createdAt = new Date().toISOString();
        
        this.database.properties.push(property);
        this.saveData();
        
        this.closeModal('propertyModal');
        this.showToast('Propiedad guardada exitosamente', 'success');
        this.navigate('properties');
    }

    saveTenant() {
        const form = document.getElementById('tenantForm');
        const formData = new FormData(form);
        
        const tenant = {};
        formData.forEach((value, key) => {
            tenant[key] = value;
        });
        
        tenant.id = 'TEN' + Date.now();
        tenant.name = `${tenant.nombre} ${tenant.apellidoPaterno}`;
        tenant.phone = tenant.telefono;
        tenant.createdAt = new Date().toISOString();
        
        this.database.tenants.push(tenant);
        this.saveData();
        
        this.closeModal('tenantModal');
        this.showToast('Inquilino guardado exitosamente', 'success');
        this.navigate('tenants');
    }

    saveContract() {
        const form = document.getElementById('contractForm');
        const formData = new FormData(form);
        
        const contract = {};
        formData.forEach((value, key) => {
            contract[key] = value;
        });
        
        contract.id = 'CON' + Date.now();
        contract.number = 'CON-' + Date.now().toString().slice(-6);
        contract.status = 'active';
        contract.createdAt = new Date().toISOString();
        
        // Calculate days to expire
        const endDate = new Date(contract.fechaTermino);
        const today = new Date();
        contract.daysToExpire = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
        
        // Get tenant and property names
        const tenant = this.database.tenants.find(t => t.id === contract.inquilino);
        const property = this.database.properties.find(p => p.id === contract.propiedad);
        
        contract.tenant = tenant ? tenant.name : 'Unknown';
        contract.property = property ? (property.name || property.address) : 'Unknown';
        contract.startDate = contract.fechaInicio;
        contract.endDate = contract.fechaTermino;
        
        this.database.contracts.push(contract);
        
        // Update property status
        if (property) {
            property.status = 'occupied';
        }
        
        this.saveData();
        
        this.closeModal('contractModal');
        this.showToast('Contrato creado exitosamente', 'success');
        this.navigate('contracts');
    }

    // ==================== DATA PERSISTENCE ====================
    
    saveData() {
        try {
            localStorage.setItem('megaMobileData', JSON.stringify(this.database));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showToast('Error al guardar los datos', 'error');
        }
    }

    loadData() {
        try {
            const data = localStorage.getItem('megaMobileData');
            if (data) {
                this.database = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // ==================== UTILITY FUNCTIONS ====================
    
    refresh() {
        this.showToast('Actualizando...', 'info');
        setTimeout(() => {
            this.renderPage(this.currentPage);
            this.showToast('Actualizado', 'success');
        }, 1000);
    }

    showQuickActions() {
        // Show quick actions menu
        const actions = ['property', 'tenant', 'payment', 'maintenance'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        this.showModal(action);
    }

    showNotifications() {
        this.showToast('3 nuevas notificaciones', 'info');
    }

    showProfile() {
        this.navigate('settings');
    }

    generateReport(type) {
        this.showToast(`Generando reporte ${type}...`, 'info');
        setTimeout(() => {
            this.showToast('Reporte generado exitosamente', 'success');
        }, 2000);
    }

    logout() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            this.showToast('Cerrando sesión...', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
}

// Initialize Mobile App
if (typeof window !== 'undefined') {
    window.mobileApp = new MegaMobileApp();
}