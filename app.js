// ===== STATE =====
let dashboardCharts = {};
let state = {
  products: [],
  invoices: [],
  customers: [],
  users: [],
  suppliers: [],
  purchases: [],
  payments: [],
  cart: [],
  paymentMethod: 'cash',
  currentPage: 'dashboard',
  isLoggedIn: false,
  categories: [],
  quotations: [],
  expenses: [],
  settings: {
    shopName: 'BEE TECHNOLOGIES',
    shopAddress: 'No. 456, Highlevel Road, Maharagama',
    shopPhone: '011-2345678',
    shopEmail: 'info@beetechnologies.com',
    currency: 'Rs.',
    invoiceFooter: 'Thank you for your business! Please come again.',
    lowStockThreshold: 5
  }
};

// ===== INIT =====
function init() {
  checkAuth();
  loadData();
  setupDatetime();
  renderPOSProducts();
  renderProducts();
  renderInventory();
  renderInvoices();
  renderCustomers();
  renderUsers();
  renderSuppliers();
  renderPurchases();
  renderAccounts();
  updateDashboard();
  renderCategoryDropdowns();
  applySettingsToUI();
}

// ===== AUTHENTICATION =====
function checkAuth() {
  const loggedIn = localStorage.getItem('tm_logged_in') === 'true';
  state.isLoggedIn = loggedIn;

  const loginScreen = document.getElementById('loginScreen');
  if (loggedIn) {
    loginScreen.style.display = 'none';
    document.body.style.overflow = 'auto';
  } else {
    loginScreen.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('loginUsername').value;
  const pass = document.getElementById('loginPassword').value;

  const foundUser = state.users.find(u => u.username === user && u.password === pass);

  if (foundUser) {
    localStorage.setItem('tm_logged_in', 'true');
    localStorage.setItem('tm_current_user', JSON.stringify(foundUser));
    checkAuth();
    showToast(`Login successful! Welcome ${foundUser.name}.`, 'success');
  } else {
    showToast('Invalid username or password', 'error');
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('tm_logged_in');
    checkAuth();
    showToast('You have been logged out', 'info');
  }
}

// ===== LOCAL STORAGE =====
function loadData() {
  try {
    state.products = JSON.parse(localStorage.getItem('tm_products') || '[]');
    state.invoices = JSON.parse(localStorage.getItem('tm_invoices') || '[]');
    state.customers = JSON.parse(localStorage.getItem('tm_customers') || '[]');
    state.users = JSON.parse(localStorage.getItem('tm_users') || '[]');
    state.suppliers = JSON.parse(localStorage.getItem('tm_suppliers') || '[]');
    state.purchases = JSON.parse(localStorage.getItem('tm_purchases') || '[]');
    state.payments = JSON.parse(localStorage.getItem('tm_payments') || '[]');
    state.categories = JSON.parse(localStorage.getItem('tm_categories') || '[]');
    state.quotations = JSON.parse(localStorage.getItem('tm_quotations') || '[]');

    // Default categories for computer shop
    const defaultCats = [
      'Processors', 'Motherboards', 'RAM', 'Graphic Cards', 'Storage (SSD/HDD)',
      'Power Supplies (PSU)', 'Cooling Solutions', 'Casing', 'Monitors',
      'Keyboards', 'Mice', 'Headsets / Speakers', 'Laptops', 'Networking',
      'Printers / Scanners', 'UPS / Power', 'Accessories', 'Software', 'Mobile Phone Accessories', 'CCTV Systems', 'Other'
    ];

    if (!state.categories.length) {
      state.categories = defaultCats.sort();
    } else {
      // Merge defaults if they don't exist
      defaultCats.forEach(c => {
        if (!state.categories.includes(c)) state.categories.push(c);
      });
      state.categories.sort();
    }
    const savedSettings = localStorage.getItem('tm_settings');
    if (savedSettings) {
      state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
    }

    if (!state.products.length) seedSampleData();
    if (!state.users.length) {
      state.users = [{ id: uid(), name: 'Administrator', username: 'admin', password: '1234', role: 'admin' }];
      saveData();
    }
  } catch (e) {
    state.products = [];
    state.invoices = [];
    state.customers = [];
    state.users = [];
  }
}

function saveData() {
  localStorage.setItem('tm_products', JSON.stringify(state.products));
  localStorage.setItem('tm_invoices', JSON.stringify(state.invoices));
  localStorage.setItem('tm_customers', JSON.stringify(state.customers));
  localStorage.setItem('tm_users', JSON.stringify(state.users));
  localStorage.setItem('tm_suppliers', JSON.stringify(state.suppliers));
  localStorage.setItem('tm_purchases', JSON.stringify(state.purchases));
  localStorage.setItem('tm_payments', JSON.stringify(state.payments));
  localStorage.setItem('tm_settings', JSON.stringify(state.settings));
  localStorage.setItem('tm_categories', JSON.stringify(state.categories));
  localStorage.setItem('tm_quotations', JSON.stringify(state.quotations));
}

function seedSampleData() {
  state.products = [
    { id: uid(), name: 'Intel Core i5-12400F', category: 'Processors', barcode: 'BX80715124400F', brand: 'Intel', buyPrice: 28000, sellPrice: 35000, stock: 12, lowStock: 3, description: '12th Gen 6-core processor' },
    { id: uid(), name: 'Kingston 16GB DDR4 3200', category: 'RAM', barcode: 'KVR32N22S8/16', brand: 'Kingston', buyPrice: 9500, sellPrice: 12500, stock: 20, lowStock: 5, description: '16GB DDR4 3200MHz' },
    { id: uid(), name: 'Samsung 1TB SSD 870 EVO', category: 'Storage', barcode: 'MZ-77E1T0B', brand: 'Samsung', buyPrice: 18000, sellPrice: 23500, stock: 8, lowStock: 3, description: 'SATA 2.5" SSD' },
    { id: uid(), name: 'MSI B550M Pro-VDH', category: 'Motherboards', barcode: 'MSI-B550MPRO', brand: 'MSI', buyPrice: 23000, sellPrice: 29000, stock: 5, lowStock: 2, description: 'mATX AMD B550 Motherboard' },
    { id: uid(), name: 'Logitech G102 Mouse', category: 'Mice', barcode: 'LOG-G102-BLK', brand: 'Logitech', buyPrice: 2800, sellPrice: 3800, stock: 25, lowStock: 5, description: 'Gaming mouse RGB' },
    { id: uid(), name: 'Corsair 650W PSU', category: 'Power Supply', barcode: 'COR-CV650', brand: 'Corsair', buyPrice: 13000, sellPrice: 17000, stock: 7, lowStock: 2, description: '650W 80+ Bronze PSU' },
    { id: uid(), name: 'Redragon K552 Keyboard', category: 'Keyboards', barcode: 'RDR-K552-RED', brand: 'Redragon', buyPrice: 4500, sellPrice: 6200, stock: 2, lowStock: 3, description: 'Mechanical gaming keyboard' },
    { id: uid(), name: 'TP-Link Wi-Fi Adapter', category: 'Networking', barcode: 'TP-AC600N', brand: 'TP-Link', buyPrice: 1800, sellPrice: 2500, stock: 18, lowStock: 4, description: 'USB Wi-Fi 600Mbps' },
  ];
  state.categories = [
    'Processors', 'Motherboards', 'RAM', 'Graphic Cards', 'Storage (SSD/HDD)',
    'Power Supplies (PSU)', 'Cooling Solutions', 'Casing', 'Monitors',
    'Keyboards', 'Mice', 'Headsets / Speakers', 'Laptops', 'Networking',
    'Printers / Scanners', 'UPS / Power', 'Accessories', 'Software', 'Other'
  ].sort();
  saveData();
}

// ===== UTILS =====
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
function formatCurrency(n) {
  const symbol = (state.settings && state.settings.currency) ? state.settings.currency : 'Rs.';
  return symbol + ' ' + Number(n).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(iso) { return new Date(iso).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' }); }
function formatDateTime(iso) { return new Date(iso).toLocaleString('en-LK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function getCategoryIcon(cat) {
  const icons = {
    'Processors': 'fa-microchip', 'Motherboards': 'fa-server', 'RAM': 'fa-memory',
    'Storage': 'fa-hard-drive', 'Graphics Cards': 'fa-display', 'Power Supply': 'fa-plug',
    'Cooling': 'fa-fan', 'Cases': 'fa-box', 'Monitors': 'fa-desktop',
    'Keyboards': 'fa-keyboard', 'Mice': 'fa-computer-mouse', 'Headsets': 'fa-headphones',
    'Laptops': 'fa-laptop', 'Networking': 'fa-wifi', 'Accessories': 'fa-screwdriver-wrench',
    'Software': 'fa-compact-disc', 'Other': 'fa-cube'
  };
  return icons[cat] || 'fa-box';
}

// ===== DATETIME =====
function setupDatetime() {
  function update() {
    const now = new Date();
    document.getElementById('datetime').innerHTML =
      `<strong>${now.toLocaleDateString('en-LK', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</strong><br>
       ${now.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  }
  update();
  setInterval(update, 1000);
}

// ===== NAVIGATION =====
function switchPage(page, fromEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('nav-' + page).classList.add('active');
  state.currentPage = page;

  const titles = {
    dashboard: ['Dashboard', 'Welcome back! Here\'s what\'s happening today.'],
    pos: ['New Sale', 'Select products and complete transactions.'],
    quotations: ['Quotations', 'Manage and print product quotations for customers.'],
    cctv: ['CCTV Systems', 'Manage CCTV cameras, DVRs, and security equipment.'],
    products: ['Products', 'Manage your product catalog.'],
    inventory: ['Inventory', 'Track stock levels and manage restocking.'],
    categories: ['Product Categories', 'Manage your product classification categories.'],
    invoices: ['Invoice List', 'View and print all sales invoices.'],
    customers: ['Customers', 'Manage your customer list and view purchase history.'],
    accounts: ['Accounts & Finance', 'Track customer credit, supplier dues and balances.'],
    reports: ['Reports', 'Sales, stock and profit analytics with Excel export.'],
    users: ['User Management', 'Manage system users and their access levels.'],
    suppliers: ['Suppliers', 'Manage your product suppliers.'],
    purchases: ['Stock In History', 'Review your stock addition (purchase) history.'],
    expenses: ['Shop Expenses', 'Track and manage your daily shop operational costs.'],
    settings: ['Settings', 'Configure shop information and system preferences.'],
  };
  document.getElementById('pageTitle').textContent = titles[page][0];
  document.getElementById('pageSubtitle').textContent = titles[page][1];

  if (page === 'dashboard') { updateDashboard(); document.getElementById('quickSaleBtn').style.display = 'none'; }
  else document.getElementById('quickSaleBtn').style.display = page === 'pos' ? 'none' : 'flex';

  if (page === 'products') renderProducts();
  if (page === 'inventory') renderInventory();
  if (page === 'categories') renderCategories();
  if (page === 'invoices') renderInvoices();
  if (page === 'quotations') renderQuotations();
  if (page === 'cctv') renderCCTV();
  if (page === 'pos') renderPOSProducts();
  if (page === 'customers') renderCustomers();
  if (page === 'reports') renderReports();
  if (page === 'accounts') renderAccounts();
  if (page === 'users') renderUsers();
  if (page === 'suppliers') renderSuppliers();
  if (page === 'purchases') renderPurchases();
  if (page === 'expenses') renderExpenses();
  if (page === 'settings') renderSettings();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    switchPage(item.dataset.page, item);
  });
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('mainContent').classList.toggle('expanded');
});

// ===== DASHBOARD =====
function updateDashboard() {
  const now = new Date();
  const todayStr = now.toDateString();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const todayInvoices = state.invoices.filter(inv => new Date(inv.date).toDateString() === todayStr);
  const monthlyInvoices = state.invoices.filter(inv => {
    const d = new Date(inv.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const calculateProfit = (invoices) => {
    let revenue = 0;
    let cost = 0;
    invoices.forEach(inv => {
      revenue += inv.total;
      inv.items.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        const buyPrice = product ? product.buyPrice : 0;
        cost += buyPrice * item.qty;
      });
      // Adjust cost for discount (proportional reduction of profit)
      // Actually, profit = total_revenue - total_cost.
      // total_revenue is already after discount.
    });
    return revenue - cost;
  };

  const todaySales = todayInvoices.reduce((s, inv) => s + inv.total, 0);
  const todayProfit = calculateProfit(todayInvoices);
  const monthlySales = monthlyInvoices.reduce((s, inv) => s + inv.total, 0);
  const monthlyProfit = calculateProfit(monthlyInvoices);

  const lowStockItems = state.products.filter(p => p.stock <= p.lowStock);

  document.getElementById('stat-today-sales').textContent = formatCurrency(todaySales);
  document.getElementById('stat-today-profit').textContent = formatCurrency(todayProfit);
  document.getElementById('stat-monthly-sales').textContent = formatCurrency(monthlySales);
  document.getElementById('stat-monthly-profit').textContent = formatCurrency(monthlyProfit);
  document.getElementById('stat-invoices-today').textContent = todayInvoices.length;
  document.getElementById('stat-low-stock').textContent = lowStockItems.length;

  // Recent invoices
  const tbody = document.getElementById('dashboard-invoices-body');
  const recent = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  if (recent.length) {
    tbody.innerHTML = recent.map(inv => `
      <tr>
        <td><strong>#${inv.invoiceNo}</strong></td>
        <td>${inv.customerName || 'Walk-in'}</td>
        <td style="color:var(--green);font-weight:700">${formatCurrency(inv.total)}</td>
        <td style="color:var(--text-secondary)">${formatDate(inv.date)}</td>
      </tr>`).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-row">No invoices yet</td></tr>';
  }

  // Low stock
  const lowStockEl = document.getElementById('low-stock-list');
  if (lowStockEl) {
    if (lowStockItems.length) {
      lowStockEl.innerHTML = lowStockItems.map(p => `
        <div class="low-stock-item">
          <span class="low-stock-name">${p.name}</span>
          <span class="low-stock-qty">${p.stock <= 0 ? 'OUT' : p.stock + ' left'}</span>
        </div>`).join('');
    } else {
      lowStockEl.innerHTML = '<p class="empty-text"><i class="fas fa-check-circle" style="color:var(--green)"></i> All items well stocked</p>';
    }
  }

  // Best Sellings
  const bestSellingEl = document.getElementById('best-selling-list');
  if (bestSellingEl) {
    const productSales = {}; // productId -> { name, qty }
    state.invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (!productSales[item.productId]) productSales[item.productId] = { name: item.name, qty: 0 };
        productSales[item.productId].qty += item.qty;
      });
    });

    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);
    if (topProducts.length) {
      bestSellingEl.innerHTML = topProducts.map((p, i) => `
        <div class="low-stock-item">
          <span class="low-stock-name"><span style="color:var(--yellow);margin-right:8px">#${i + 1}</span> ${p.name}</span>
          <span class="badge badge-green">${p.qty} sold</span>
        </div>`).join('');
    } else {
      bestSellingEl.innerHTML = '<p class="empty-text">No sales data yet</p>';
    }
  }

  // Update Low Stock Bell
  const bellCount = document.getElementById('bell-count');
  if (bellCount) {
    bellCount.textContent = lowStockItems.length;
    bellCount.style.display = lowStockItems.length > 0 ? 'flex' : 'none';
  }

  // Update shop name in sidebar footer
  const sidebarShopName = document.querySelector('.sidebar-footer .shop-info span');
  if (sidebarShopName) sidebarShopName.textContent = state.settings.shopName;

  // Render Charts
  renderDashboardCharts();
}

function renderDashboardCharts() {
  if (state.currentPage !== 'dashboard') return;

  const salesCtx = document.getElementById('salesChart')?.getContext('2d');
  const catCtx = document.getElementById('categoryChart')?.getContext('2d');

  if (!salesCtx || !catCtx) return;

  // --- 1. Last 7 Days Sales Chart ---
  const last7Days = [];
  const salesData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    last7Days.push(d.toLocaleDateString('en-LK', { weekday: 'short', day: '2-digit' }));

    const daySales = state.invoices
      .filter(inv => new Date(inv.date).toDateString() === dateStr)
      .reduce((s, inv) => s + inv.total, 0);
    salesData.push(daySales);
  }

  if (dashboardCharts.sales) dashboardCharts.sales.destroy();
  dashboardCharts.sales = new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: last7Days,
      datasets: [{
        label: 'Daily Sales',
        data: salesData,
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fbbf24',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
        x: { grid: { display: false }, ticks: { color: '#888' } }
      }
    }
  });

  // --- 2. Category-wise Sales Chart ---
  const catSales = {};
  state.invoices.forEach(inv => {
    inv.items.forEach(item => {
      const cat = item.category || 'Other';
      catSales[cat] = (catSales[cat] || 0) + (item.price * item.qty);
    });
  });

  const catLabels = Object.keys(catSales);
  const catData = Object.values(catSales);

  if (dashboardCharts.category) dashboardCharts.category.destroy();
  dashboardCharts.category = new Chart(catCtx, {
    type: 'bar',
    data: {
      labels: catLabels,
      datasets: [{
        label: 'Sales Amount',
        data: catData,
        backgroundColor: [
          '#6366f1', '#fbbf24', '#22c55e', '#ef4444', '#a855f7', '#06b6d4', '#f97316'
        ],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
        x: { grid: { display: false }, ticks: { color: '#888' } }
      }
    }
  });
}

// ===== SETTINGS =====
function renderSettings() {
  const s = state.settings;
  document.getElementById('setShopName').value = s.shopName;
  document.getElementById('setShopPhone').value = s.shopPhone;
  document.getElementById('setShopEmail').value = s.shopEmail;
  document.getElementById('setCurrency').value = s.currency;
  document.getElementById('setShopAddress').value = s.shopAddress;
  document.getElementById('setLowStock').value = s.lowStockThreshold;
  document.getElementById('setInvoiceFooter').value = s.invoiceFooter;
  document.getElementById('setInvoiceStart').value = state.invoices.length + 1001;
}

function saveSettings() {
  state.settings = {
    shopName: document.getElementById('setShopName').value.trim() || 'POS System',
    shopPhone: document.getElementById('setShopPhone').value.trim(),
    shopEmail: document.getElementById('setShopEmail').value.trim(),
    currency: document.getElementById('setCurrency').value.trim() || 'Rs.',
    shopAddress: document.getElementById('setShopAddress').value.trim(),
    lowStockThreshold: parseInt(document.getElementById('setLowStock').value) || 5,
    invoiceFooter: document.getElementById('setInvoiceFooter').value.trim()
  };

  saveData();
  showToast('Settings saved successfully!', 'success');

  // Update UI parts that depend on settings
  updateDashboard();
  renderPOSProducts();
  applySettingsToUI();
}

function applySettingsToUI() {
  const s = state.settings;
  const loginName = document.getElementById('loginShopName');
  if (loginName) loginName.textContent = s.shopName;

  const sidebarLogo = document.getElementById('sidebarLogoText');
  if (sidebarLogo) sidebarLogo.textContent = s.shopName;

  const sidebarShop = document.querySelector('.sidebar-footer .shop-info span');
  if (sidebarShop) sidebarShop.textContent = s.shopName;
}

// ===== POS CUSTOMER SEARCH =====
function searchPOSCustomer(query) {
  const suggestionsEl = document.getElementById('posCustSuggestions');
  if (!query || query.length < 2) {
    suggestionsEl.style.display = 'none';
    return;
  }

  const results = state.customers.filter(c =>
    (c.phone || '').includes(query) ||
    (c.name || '').toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  if (!results.length) {
    suggestionsEl.style.display = 'none';
    return;
  }

  suggestionsEl.innerHTML = results.map(c => `
    <div class="pos-cust-suggestion-item" onclick="selectPOSCustomer('${c.id}')">
      <strong>${c.name}</strong>
      <small>${c.phone || 'No phone'}</small>
    </div>
  `).join('');
  suggestionsEl.style.display = 'block';
}

function selectPOSCustomer(id) {
  const customer = state.customers.find(c => c.id === id);
  if (!customer) return;

  document.getElementById('customerPhone').value = customer.phone || '';
  document.getElementById('customerName').value = customer.name || '';
  document.getElementById('posCustSuggestions').style.display = 'none';
  showToast(`Customer ${customer.name} selected`, 'info');
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.pos-cust-search-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const suggestionsEl = document.getElementById('posCustSuggestions');
    if (suggestionsEl) suggestionsEl.style.display = 'none';
  }
});

// ===== POS =====
function renderPOSProducts() {
  const search = (document.getElementById('posSearch')?.value || '').toLowerCase();
  const cat = document.getElementById('posCategoryFilter')?.value || '';
  const grid = document.getElementById('posProductGrid');
  if (!grid) return;

  let products = state.products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search) || (p.barcode || '').toLowerCase().includes(search);
    const matchCat = !cat || p.category === cat;
    return matchSearch && matchCat;
  });

  if (!products.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)"><i class="fas fa-box-open" style="font-size:2rem;margin-bottom:10px;display:block;opacity:0.3"></i>No products found</div>';
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="pos-product-card ${p.stock <= 0 ? 'out-of-stock' : ''}" onclick="${p.stock > 0 ? `addToCart('${p.id}')` : ''}">
      <div class="pos-product-icon"><i class="fas ${getCategoryIcon(p.category)}"></i></div>
      <div class="pos-product-name">${p.name}</div>
      <div class="pos-product-price">${formatCurrency(p.sellPrice)}</div>
      <div class="pos-product-stock ${p.stock <= 0 ? 'badge-red' : p.stock <= p.lowStock ? 'badge-orange' : ''}">
        ${p.stock <= 0 ? '❌ Out of Stock' : `📦 ${p.stock} in stock`}
      </div>
    </div>`).join('');
}

function filterPOSProducts() { renderPOSProducts(); }

function renderCategoryDropdowns() {
  const cats = state.categories.length ? state.categories : [...new Set(state.products.map(p => p.category))].sort();
  state.categories = cats;

  // POS Filter
  const posFilter = document.getElementById('posCategoryFilter');
  if (posFilter) {
    posFilter.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option>${c}</option>`).join('');
  }

  // Product Modal Dropdown
  const prodCat = document.getElementById('prodCategory');
  if (prodCat) {
    prodCat.innerHTML = '<option value="">Select Category</option>' + cats.map(c => `<option>${c}</option>`).join('');
  }
}

function openCategoryModal() {
  document.getElementById('newCategoryName').value = '';
  document.getElementById('categoryModal').classList.add('open');
}

function saveCategory() {
  const name = document.getElementById('newCategoryName').value.trim();
  if (!name) { showToast('Category name is required', 'error'); return; }

  if (state.categories.includes(name)) {
    showToast('Category already exists', 'error');
    return;
  }

  state.categories.push(name);
  state.categories.sort();
  saveData();
  renderCategoryDropdowns();
  renderCategories();
  closeModal('categoryModal');
  showToast(`Category "${name}" added!`, 'success');
}

function renderCategories() {
  const search = (document.getElementById('categorySearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;

  const filtered = state.categories.filter(c => c.toLowerCase().includes(search));

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-row">No categories found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${c}</strong></td>
      <td>
        <div class="inv-action-btns">
          <button class="btn-icon delete" onclick="deleteCategory('${c}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function deleteCategory(name) {
  // Check if any product uses this category
  const inUse = state.products.some(p => p.category === name);
  if (inUse) {
    showToast(`Cannot delete category "${name}" as it is currently assigned to products.`, 'error');
    return;
  }

  if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;

  state.categories = state.categories.filter(c => c !== name);
  saveData();
  renderCategories();
  renderCategoryDropdowns();
  showToast(`Category "${name}" deleted.`, 'info');
}

// ===== QUOTATIONS =====
function renderQuotations() {
  const search = (document.getElementById('quotationSearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('quotationsTableBody');
  if (!tbody) return;

  let filtered = [...state.quotations].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (search) {
    filtered = filtered.filter(q =>
      q.quotationNo.includes(search) ||
      (q.customerName || '').toLowerCase().includes(search) ||
      (q.customerPhone || '').includes(search)
    );
  }

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No quotations found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(q => `
    <tr>
      <td><strong style="color:var(--yellow)">#${q.quotationNo}</strong></td>
      <td>
        ${q.customerName || '<span style="color:var(--text-muted)">Unknown</span>'}
        ${q.customerPhone ? `<br><small style="color:var(--text-muted)">${q.customerPhone}</small>` : ''}
      </td>
      <td>${q.items.length} item${q.items.length !== 1 ? 's' : ''}</td>
      <td style="color:var(--green);font-weight:700">${formatCurrency(q.total)}</td>
      <td>${formatDate(q.validUntil)}</td>
      <td style="color:var(--text-secondary);font-size:0.82rem">${formatDateTime(q.date)}</td>
      <td>
        <div class="inv-action-btns">
          <button class="btn-icon view" onclick="showQuotationPrint('${q.id}')" title="Print/View"><i class="fas fa-print"></i></button>
          <button class="btn-icon delete" onclick="deleteQuotation('${q.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function createQuotation() {
  if (!state.cart.length) { showToast('Cart is empty!', 'error'); return; }

  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discVal = parseFloat(document.getElementById('discountValue').value || 0) || 0;
  const discType = document.getElementById('discountType').value;
  const discount = discType === 'percent' ? subtotal * discVal / 100 : Math.min(discVal, subtotal);
  const total = Math.max(subtotal - discount, 0);

  const quotationNo = 'Q' + String(state.quotations.length + 101).padStart(3, '0');
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days

  const quotation = {
    id: uid(),
    quotationNo,
    customerName: document.getElementById('customerName').value.trim() || 'Valued Customer',
    customerPhone: document.getElementById('customerPhone').value.trim(),
    items: [...state.cart.map(i => ({ ...i }))],
    subtotal,
    discount,
    discountValue: discVal,
    discountType: discType,
    total,
    date: new Date().toISOString(),
    validUntil: validUntil.toISOString()
  };

  state.quotations.push(quotation);
  saveData();
  clearCart();
  renderQuotations();
  showToast(`Quotation #${quotationNo} created!`, 'success');
  showQuotationPrint(quotation.id);
}

function showQuotationPrint(id) {
  const quotation = state.quotations.find(q => q.id === id);
  if (!quotation) return;

  const s = state.settings;
  const content = document.getElementById('quotationPrintContent');

  content.innerHTML = `
    <div class="invoice-print" id="printable-quotation">
      <div class="invoice-top">
        <div style="display:flex;align-items:center;gap:15px">
          <img src="WhatsApp Image 2026-02-22 at 12.51.24.jpeg" style="width:50px;height:50px;object-fit:contain;border-radius:6px" />
          <div>
            <div class="invoice-shop-name">${s.shopName}</div>
            <div class="invoice-shop-info">
              Computer Shop & IT Solutions<br>
              📞 ${s.shopPhone}<br>
              📧 ${s.shopEmail}<br>
              🏠 ${s.shopAddress}
            </div>
          </div>
        </div>
        <div style="text-align:right">
          <div class="invoice-badge" style="background:var(--yellow);color:#000">QUOTATION</div>
          <div class="invoice-no"><strong>#${quotation.quotationNo}</strong></div>
          <div style="font-size:0.8rem;color:#555;margin-top:6px">${formatDateTime(quotation.date)}</div>
          <div style="font-size:0.8rem;color:var(--red);margin-top:4px;font-weight:700">Valid Until: ${formatDate(quotation.validUntil)}</div>
        </div>
      </div>
      <hr class="invoice-divider"/>
      <div class="invoice-meta">
        <div>
          <div style="font-size:0.75rem;color:#888;margin-bottom:4px">QUOTATION FOR</div>
          <div style="font-size:0.95rem;font-weight:700;color:#1a1a1a">${quotation.customerName}</div>
          ${quotation.customerPhone ? `<div style="font-size:0.82rem;color:#555">${quotation.customerPhone}</div>` : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:0.75rem;color:#888;margin-bottom:4px">SUMMARY</div>
          <div style="color:#555;font-size:0.82rem">Items: ${quotation.items.length}</div>
        </div>
      </div>
      <table class="invoice-table">
        <thead>
          <tr>
            <th>#</th><th>Product</th><th style="text-align:center">Qty</th>
            <th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${quotation.items.map((item, i) => `
            <tr>
              <td style="color:#888">${i + 1}</td>
              <td><strong>${item.name}</strong></td>
              <td style="text-align:center">${item.qty}</td>
              <td style="text-align:right">${s.currency} ${Number(item.price).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
              <td style="text-align:right;font-weight:700">${s.currency} ${Number(item.price * item.qty).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="invoice-totals">
        <div class="inv-total-row"><span>Subtotal</span><span>${s.currency} ${Number(quotation.subtotal).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span></div>
        ${quotation.discount > 0 ? `<div class="inv-total-row"><span>Discount (${quotation.discountValue}${quotation.discountType === 'percent' ? '%' : s.currency})</span><span style="color:#dc2626">-${s.currency} ${Number(quotation.discount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span></div>` : ''}
        <div class="inv-grand-total"><span>GRAND TOTAL</span><span>${s.currency} ${Number(quotation.total).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span></div>
      </div>
      <div class="invoice-footer">
        <p>⭐ This is a price quotation valid for 7 days from the date above.</p>
        <p>Support & inquiries: ${s.shopEmail} | ${s.shopPhone}</p>
        <p style="margin-top:4px;color:#aaa">Thank you for choosing ${s.shopName}!</p>
      </div>
    </div>`;

  document.getElementById('quotationPrintModal').classList.add('open');
}

function deleteQuotation(id) {
  if (!confirm('Delete this quotation?')) return;
  state.quotations = state.quotations.filter(q => q.id !== id);
  saveData();
  renderQuotations();
  showToast('Quotation deleted', 'info');
}

// ===== CCTV SYSTEMS SECTION =====
function renderCCTV() {
  const search = (document.getElementById('cctvSearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('cctvTableBody');
  if (!tbody) return;

  const products = state.products.filter(p =>
    p.category === 'CCTV Systems' &&
    (!search || p.name.toLowerCase().includes(search) || (p.barcode || '').toLowerCase().includes(search))
  );

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-row"><i class="fas fa-video"></i> No CCTV products found. Please add products with category "CCTV Systems".</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.brand || '—'}</td>
      <td>${p.barcode || '—'}</td>
      <td style="color:var(--green);font-weight:700">${formatCurrency(p.sellPrice)}</td>
      <td>
        <span class="badge ${p.stock <= 0 ? 'badge-red' : p.stock <= p.lowStock ? 'badge-orange' : 'badge-green'}">
          ${p.stock} in stock
        </span>
      </td>
      <td>
        <div class="inv-action-btns">
          <button class="btn-icon edit" onclick="openProductModal('${p.id}')"><i class="fas fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

// ===== CART =====
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product || product.stock <= 0) return;

  const existing = state.cart.find(item => item.productId === productId);
  if (existing) {
    if (existing.qty >= product.stock) { showToast('Not enough stock!', 'error'); return; }
    existing.qty++;
  } else {
    state.cart.push({ productId, name: product.name, price: product.sellPrice, qty: 1 });
  }
  renderCart();
  showToast(`${product.name} added`, 'success');
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.productId !== productId);
  renderCart();
}

function changeQty(productId, delta) {
  const item = state.cart.find(i => i.productId === productId);
  if (!item) return;
  const product = state.products.find(p => p.id === productId);
  const newQty = item.qty + delta;
  if (newQty <= 0) { removeFromCart(productId); return; }
  if (newQty > product.stock) { showToast('Not enough stock!', 'error'); return; }
  item.qty = newQty;
  renderCart();
}

function clearCart() {
  state.cart = [];
  document.getElementById('customerName').value = '';
  document.getElementById('customerPhone').value = '';
  document.getElementById('discountValue').value = '0';
  document.getElementById('cashTendered').value = '';
  document.getElementById('changeAmount').textContent = 'Rs. 0.00';
  renderCart();
}

function renderCart() {
  const cartEl = document.getElementById('cartItems');
  if (!state.cart.length) {
    cartEl.innerHTML = '<div class="cart-empty"><i class="fas fa-cart-shopping"></i><p>Cart is empty</p></div>';
    updateCartTotals();
    return;
  }
  cartEl.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price-wrap">
          <span class="cart-price-label">Rs.</span>
          <input
            type="number"
            class="cart-price-input"
            id="cartPrice_${idx}"
            value="${item.price}"
            min="0"
            step="0.01"
            title="Edit price"
            oninput="changeCartItemPrice('${item.productId}', this.value)"
          />
          <span class="cart-price-each">each</span>
        </div>
        <div class="cart-item-meta">
          <input type="text" class="cart-meta-input" placeholder="Serial Number / S.N." value="${item.serial || ''}" oninput="updateItemMeta('${item.productId}', 'serial', this.value)" />
          <select class="cart-meta-select" onchange="updateItemMeta('${item.productId}', 'warranty', this.value)">
            <option value="">No Warranty</option>
            <option value="3 Months" ${item.warranty === '3 Months' ? 'selected' : ''}>3M Warranty</option>
            <option value="6 Months" ${item.warranty === '6 Months' ? 'selected' : ''}>6M Warranty</option>
            <option value="1 Year" ${item.warranty === '1 Year' ? 'selected' : ''}>1 Year Warranty</option>
            <option value="2 Years" ${item.warranty === '2 Years' ? 'selected' : ''}>2 Years Warranty</option>
            <option value="3 Years" ${item.warranty === '3 Years' ? 'selected' : ''}>3 Years Warranty</option>
          </select>
        </div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty('${item.productId}', -1)">−</button>
        <span class="qty-display">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.productId}', 1)">+</button>
      </div>
      <span class="cart-item-total" id="cartTotal_${idx}">${formatCurrency(item.price * item.qty)}</span>
      <button class="cart-item-remove" onclick="removeFromCart('${item.productId}')"><i class="fas fa-times"></i></button>
    </div>`).join('');
  updateCartTotals();
}

function updateItemMeta(productId, key, value) {
  const item = state.cart.find(i => i.productId === productId);
  if (item) item[key] = value;
}

// Change price of a cart item live — updates state + row total + grand total
function changeCartItemPrice(productId, rawValue) {
  const newPrice = parseFloat(rawValue) || 0;
  const item = state.cart.find(i => i.productId === productId);
  if (!item) return;
  item.price = newPrice;

  // Update just this row's total span without re-rendering the whole cart
  const idx = state.cart.indexOf(item);
  const rowTotal = document.getElementById(`cartTotal_${idx}`);
  if (rowTotal) rowTotal.textContent = formatCurrency(newPrice * item.qty);

  updateCartTotals();
}


function updateCartTotals() {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discVal = parseFloat(document.getElementById('discountValue')?.value || 0) || 0;
  const discType = document.getElementById('discountType')?.value || 'percent';
  const discount = discType === 'percent' ? subtotal * discVal / 100 : Math.min(discVal, subtotal);
  const total = Math.max(subtotal - discount, 0);

  document.getElementById('cartSubtotal').textContent = formatCurrency(subtotal);
  document.getElementById('cartTotal').textContent = formatCurrency(total);
  calcChange();
}

function calcChange() {
  const total = parseFloat(document.getElementById('cartTotal').textContent.replace('Rs. ', '').replace(/,/g, '')) || 0;
  const tendered = parseFloat(document.getElementById('cashTendered')?.value || 0) || 0;
  const change = Math.max(tendered - total, 0);
  document.getElementById('changeAmount').textContent = formatCurrency(change);
}

function selectPayment(btn, method) {
  document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.paymentMethod = method;
  document.getElementById('cashTenderSection').style.display = method === 'cash' ? 'block' : 'none';
}

// ===== COMPLETE SALE =====
function completeSale() {
  if (!state.cart.length) { showToast('Cart is empty!', 'error'); return; }

  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discVal = parseFloat(document.getElementById('discountValue').value || 0) || 0;
  const discType = document.getElementById('discountType').value;
  const discount = discType === 'percent' ? subtotal * discVal / 100 : Math.min(discVal, subtotal);
  const total = Math.max(subtotal - discount, 0);

  const cashTendered = parseFloat(document.getElementById('cashTendered').value || 0) || 0;
  if (state.paymentMethod === 'cash' && cashTendered < total) {
    showToast('Insufficient cash tendered!', 'error'); return;
  }

  // Deduct stock
  state.cart.forEach(cartItem => {
    const product = state.products.find(p => p.id === cartItem.productId);
    if (product) product.stock -= cartItem.qty;
  });

  const invoiceNo = String(state.invoices.length + 1001).padStart(4, '0');
  const invoice = {
    id: uid(),
    invoiceNo,
    customerName: document.getElementById('customerName').value.trim(),
    customerPhone: document.getElementById('customerPhone').value.trim(),
    items: [...state.cart.map(i => ({ ...i }))],
    subtotal,
    discount,
    discountValue: discVal,
    discountType: discType,
    total,
    paidAmount: cashTendered, // Store actual amount paid
    paymentMethod: state.paymentMethod,
    cashTendered: state.paymentMethod === 'cash' ? cashTendered : total,
    change: state.paymentMethod === 'cash' ? Math.max(cashTendered - total, 0) : 0,
    date: new Date().toISOString()
  };

  state.invoices.push(invoice);

  // Auto-link or create customer record by phone
  const custPhone = document.getElementById('customerPhone').value.trim();
  const custName = document.getElementById('customerName').value.trim();
  if (custPhone) {
    let existing = state.customers.find(c => c.phone === custPhone);
    if (existing) {
      if (custName && !existing.name) existing.name = custName;
    } else if (custName || custPhone) {
      state.customers.push({
        id: uid(),
        name: custName || 'Unknown',
        phone: custPhone,
        email: '', nic: '', address: '', notes: '',
        createdAt: new Date().toISOString()
      });
    }
  }

  saveData();

  clearCart();
  renderPOSProducts();
  updateDashboard();
  renderInventory();
  renderInvoices();
  renderCustomers();

  showToast(`Sale #${invoiceNo} completed! ${formatCurrency(total)}`, 'success');
  showInvoicePrint(invoice);
}

// ===== PRODUCTS =====
function renderProducts() {
  const search = (document.getElementById('productSearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('productsTableBody');
  const products = state.products.filter(p =>
    !search || p.name.toLowerCase().includes(search) || (p.barcode || '').toLowerCase().includes(search) || (p.brand || '').toLowerCase().includes(search)
  );

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row"><i class="fas fa-box-open"></i> No products found</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <strong>${p.name}</strong>
        ${p.brand ? `<br><small style="color:var(--text-muted)">${p.brand}</small>` : ''}
      </td>
      <td><span class="badge badge-blue">${p.category}</span></td>
      <td style="font-family:monospace;font-size:0.8rem;color:var(--text-secondary)">${p.barcode || '-'}</td>
      <td>${formatCurrency(p.buyPrice)}</td>
      <td style="color:var(--green);font-weight:700">${formatCurrency(p.sellPrice)}</td>
      <td>
        <span class="badge ${p.stock <= 0 ? 'badge-red' : p.stock <= p.lowStock ? 'badge-orange' : 'badge-green'}">
          ${p.stock}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-icon edit" onclick="openProductModal('${p.id}')" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteProduct('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function openProductModal(editId) {
  const modal = document.getElementById('productModal');
  const isEdit = !!editId;
  document.getElementById('productModalTitle').textContent = isEdit ? 'Edit Product' : 'Add Product';
  document.getElementById('editProductId').value = editId || '';

  if (isEdit) {
    const p = state.products.find(p => p.id === editId);
    if (!p) return;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodBarcode').value = p.barcode || '';
    document.getElementById('prodBrand').value = p.brand || '';
    document.getElementById('prodBuyPrice').value = p.buyPrice;
    document.getElementById('prodSellPrice').value = p.sellPrice;
    document.getElementById('prodStock').value = p.stock;
    document.getElementById('prodLowStock').value = p.lowStock || 5;
    document.getElementById('prodDescription').value = p.description || '';
  } else {
    ['prodName', 'prodBarcode', 'prodBrand', 'prodBuyPrice', 'prodSellPrice', 'prodDescription'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('prodCategory').value = '';
    document.getElementById('prodStock').value = '0';
    document.getElementById('prodLowStock').value = '5';
  }
  modal.classList.add('open');
}

function saveProduct() {
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value;
  const buyPrice = parseFloat(document.getElementById('prodBuyPrice').value);
  const sellPrice = parseFloat(document.getElementById('prodSellPrice').value);

  if (!name) { showToast('Product name is required', 'error'); return; }
  if (!category) { showToast('Category is required', 'error'); return; }
  if (isNaN(buyPrice) || buyPrice < 0) { showToast('Enter a valid buying price', 'error'); return; }
  if (isNaN(sellPrice) || sellPrice < 0) { showToast('Enter a valid selling price', 'error'); return; }

  const editId = document.getElementById('editProductId').value;
  const productData = {
    name,
    category,
    barcode: document.getElementById('prodBarcode').value.trim(),
    brand: document.getElementById('prodBrand').value.trim(),
    buyPrice,
    sellPrice,
    stock: parseInt(document.getElementById('prodStock').value) || 0,
    lowStock: parseInt(document.getElementById('prodLowStock').value) || 5,
    description: document.getElementById('prodDescription').value.trim()
  };

  if (editId) {
    const idx = state.products.findIndex(p => p.id === editId);
    if (idx !== -1) state.products[idx] = { ...state.products[idx], ...productData };
    showToast('Product updated!', 'success');
  } else {
    state.products.push({ id: uid(), ...productData });
    showToast('Product added!', 'success');
  }

  saveData();
  closeModal('productModal');
  renderProducts();
  renderPOSProducts();
  updateDashboard();
  renderCategoryDropdowns();
  renderInventory();
}

function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  state.products = state.products.filter(p => p.id !== id);
  saveData();
  renderProducts();
  renderPOSProducts();
  updateDashboard();
  renderInventory();
  renderCategoryDropdowns();
  showToast('Product deleted', 'info');
}

// ===== INVENTORY =====
function renderInventory() {
  const search = (document.getElementById('inventorySearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('inventoryTableBody');
  const products = state.products.filter(p =>
    !search || p.name.toLowerCase().includes(search) || (p.category || '').toLowerCase().includes(search)
  );

  const totalValue = state.products.reduce((s, p) => s + p.buyPrice * p.stock, 0);
  const outOfStock = state.products.filter(p => p.stock <= 0).length;
  document.getElementById('inv-total-value').textContent = formatCurrency(totalValue);
  document.getElementById('inv-out-stock').textContent = outOfStock;

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No products in inventory</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => {
    let status, badge;
    if (p.stock <= 0) { status = 'Out of Stock'; badge = 'badge-red'; }
    else if (p.stock <= p.lowStock) { status = 'Low Stock'; badge = 'badge-orange'; }
    else { status = 'In Stock'; badge = 'badge-green'; }
    return `
      <tr>
        <td>
          <strong>${p.name}</strong>
          ${p.brand ? `<br><small style="color:var(--text-muted)">${p.brand}</small>` : ''}
        </td>
        <td><span class="badge badge-blue">${p.category}</span></td>
        <td style="font-size:1.1rem;font-weight:700">${p.stock}</td>
        <td>${formatCurrency(p.buyPrice)}</td>
        <td style="color:var(--green);font-weight:700">${formatCurrency(p.buyPrice * p.stock)}</td>
        <td><span class="badge ${badge}">${status}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="openStockModal('${p.id}')">
            <i class="fas fa-plus"></i> Add Stock
          </button>
        </td>
      </tr>`;
  }).join('');
}

function openStockModal(productId) {
  const sel = document.getElementById('stockProductId');
  sel.innerHTML = state.products.map(p => `<option value="${p.id}" ${p.id === productId ? 'selected' : ''}>${p.name} (Stock: ${p.stock})</option>`).join('');
  document.getElementById('stockQty').value = '';
  document.getElementById('stockNote').value = '';
  document.getElementById('stockModal').classList.add('open');
}

function addStock() {
  const productId = document.getElementById('stockProductId').value;
  const qty = parseInt(document.getElementById('stockQty').value);
  if (!productId) { showToast('Select a product', 'error'); return; }
  if (!qty || qty <= 0) { showToast('Enter a valid quantity', 'error'); return; }

  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  product.stock += qty;
  saveData();
  closeModal('stockModal');
  renderInventory();
  renderPOSProducts();
  updateDashboard();
  showToast(`Added ${qty} units to ${product.name}`, 'success');
}

// ===== INVOICES =====
function renderInvoices() {
  const search = (document.getElementById('invoiceSearch')?.value || '').toLowerCase();
  const dateFrom = document.getElementById('invoiceDateFrom')?.value;
  const dateTo = document.getElementById('invoiceDateTo')?.value;
  const tbody = document.getElementById('invoicesTableBody');

  let invoices = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (search) invoices = invoices.filter(inv =>
    inv.invoiceNo.includes(search) ||
    (inv.customerName || '').toLowerCase().includes(search) ||
    (inv.customerPhone || '').includes(search)
  );
  if (dateFrom) invoices = invoices.filter(inv => new Date(inv.date) >= new Date(dateFrom));
  if (dateTo) invoices = invoices.filter(inv => new Date(inv.date) <= new Date(dateTo + 'T23:59:59'));

  if (!invoices.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row"><i class="fas fa-file-invoice"></i> No invoices found</td></tr>';
    return;
  }

  const payIcons = { cash: '💵', card: '💳', transfer: '📱' };
  tbody.innerHTML = invoices.map(inv => `
    <tr>
      <td><strong style="color:var(--blue)">#${inv.invoiceNo}</strong></td>
      <td>
        ${inv.customerName || '<span style="color:var(--text-muted)">Walk-in</span>'}
        ${inv.customerPhone ? `<br><small style="color:var(--text-muted)">${inv.customerPhone}</small>` : ''}
      </td>
      <td>${inv.items.length} item${inv.items.length !== 1 ? 's' : ''}</td>
      <td style="color:var(--green);font-weight:700">${formatCurrency(inv.total)}</td>
      <td>${payIcons[inv.paymentMethod] || ''} ${inv.paymentMethod}</td>
      <td style="color:var(--text-secondary);font-size:0.82rem">${formatDateTime(inv.date)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="showInvoicePrint(state.invoices.find(i=>i.id==='${inv.id}'))">
          <i class="fas fa-print"></i> Print
        </button>
      </td>
    </tr>`).join('');
}

// ===== INVOICE PRINT =====
function showInvoicePrint(invoice) {
  if (!invoice) return;
  const s = state.settings;
  const content = document.getElementById('invoicePrintContent');
  const subtotal = invoice.subtotal || invoice.items.reduce((s, i) => s + i.price * i.qty, 0);

  content.innerHTML = `
    <div class="invoice-print" id="printable-invoice">
      <div class="invoice-top">
        <div style="display:flex;align-items:center;gap:18px">
          <img src="WhatsApp Image 2026-02-22 at 12.51.24.jpeg" style="width:65px;height:65px;object-fit:contain;border-radius:8px" />
          <div>
            <div class="invoice-shop-name">${s.shopName}</div>
            <div class="invoice-shop-info">
              IT Solutions & Computer Superstore<br>
              ${s.shopAddress}<br>
              📞 ${s.shopPhone} | 📧 ${s.shopEmail}
            </div>
          </div>
        </div>
        <div class="invoice-header-right">
          <div class="invoice-badge">INVOICE</div>
          <div class="invoice-no">#${invoice.invoiceNo}</div>
          <div class="invoice-date-pay">
            Date: ${formatDateTime(invoice.date)}<br>
            Method: <strong>${invoice.paymentMethod.toUpperCase()}</strong>
          </div>
        </div>
      </div>
      
      <hr class="invoice-divider"/>
      
      <div class="invoice-meta">
        <div>
          <div class="invoice-bill-to-label">Bill To</div>
          <div class="invoice-customer-name">${invoice.customerName || 'Walk-in Customer'}</div>
          <div class="invoice-customer-info">
            ${invoice.customerPhone || 'N/A'}<br>
            ${invoice.customerEmail || ''}
          </div>
        </div>
        <div style="text-align:right">
          <div class="invoice-bill-to-label">Status</div>
          <div style="font-size:1.1rem; font-weight:800; color:#16a34a">PAID</div>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th>Description</th>
            <th style="text-align:center;width:80px">Qty</th>
            <th style="text-align:right;width:120px">Unit Price</th>
            <th style="text-align:right;width:120px">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item, i) => `
            <tr>
              <td style="color:#999">${i + 1}</td>
              <td><strong style="color:#000">${item.name}</strong></td>
              <td style="text-align:center">${item.qty}</td>
              <td style="text-align:right">${formatCurrency(item.price)}</td>
              <td style="text-align:right;font-weight:700;color:#000">${formatCurrency(item.price * item.qty)}</td>
            </tr>`).join('')}
        </tbody>
      </table>

      <div class="invoice-totals">
        <div class="inv-total-row">
          <span>Subtotal</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        ${invoice.discount > 0 ? `
        <div class="inv-total-row">
          <span>Discount (${invoice.discountValue}${invoice.discountType === 'percent' ? '%' : s.currency})</span>
          <span style="color:#dc2626">-${formatCurrency(invoice.discount)}</span>
        </div>` : ''}
        <div class="inv-grand-total">
          <span>Total Balance</span>
          <span>${formatCurrency(invoice.total)}</span>
        </div>
        ${invoice.paymentMethod === 'cash' && invoice.cashTendered ? `
          <div class="inv-total-row" style="margin-top:10px; padding-top:10px; border-top:1px dashed #eee">
            <span>Cash Tendered</span>
            <span>${formatCurrency(invoice.cashTendered)}</span>
          </div>
          <div class="inv-total-row">
            <span>Change Due</span>
            <span style="color:#16a34a;font-weight:700">${formatCurrency(invoice.change || 0)}</span>
          </div>
        ` : ''}
      </div>

      <div class="invoice-footer">
        <p style="font-weight:700; color:#000; margin-bottom:5px">Thank you for your business!</p>
        <p>${s.invoiceFooter}</p>
        <p style="margin-top:10px; font-size:0.75rem; color:#bbb">This is a system-generated invoice. No signature required.</p>
      </div>
    </div>`;

  document.getElementById('invoicePrintModal').classList.add('open');
}

function printInvoice() {
  window.print();
}

// ===== MODALS =====
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});

// ===== TOAST =====
function showToast(message, type = 'info') {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
  document.getElementById('toastContainer').prepend(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== START =====
window.addEventListener('DOMContentLoaded', init);

// ===== CUSTOMERS =====
function getCustomerInvoices(customer) {
  return state.invoices.filter(inv =>
    (customer.phone && inv.customerPhone === customer.phone) ||
    (customer.name && inv.customerName === customer.name && !inv.customerPhone)
  );
}

function renderCustomers() {
  const search = (document.getElementById('customerSearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('customersTableBody');
  if (!tbody) return;

  let customers = state.customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search) ||
    (c.phone || '').includes(search) ||
    (c.email || '').toLowerCase().includes(search)
  );

  // Stats
  const allSpends = state.customers.map(c => getCustomerInvoices(c).reduce((s, i) => s + i.total, 0));
  const topSpend = allSpends.length ? Math.max(...allSpends) : 0;
  const totalRevenue = state.invoices.filter(inv => inv.customerPhone || inv.customerName).reduce((s, i) => s + i.total, 0);
  const totalEl = document.getElementById('cust-total');
  const topEl = document.getElementById('cust-top-spend');
  const revEl = document.getElementById('cust-total-revenue');
  if (totalEl) totalEl.textContent = state.customers.length;
  if (topEl) topEl.textContent = formatCurrency(topSpend);
  if (revEl) revEl.textContent = formatCurrency(totalRevenue);

  if (!customers.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-row"><i class="fas fa-users"></i> No customers found. Customers are added automatically when you complete a sale with a phone number.</td></tr>';
    return;
  }

  tbody.innerHTML = customers.map((c, idx) => {
    const invs = getCustomerInvoices(c);
    const totalSpent = invs.reduce((s, i) => s + i.total, 0);
    return `
      <tr>
        <td style="color:var(--text-muted);font-size:0.82rem">${idx + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="cust-avatar">${(c.name || '?')[0].toUpperCase()}</div>
            <div>
              <strong>${c.name}</strong>
              ${c.nic ? `<br><small style="color:var(--text-muted)">NIC: ${c.nic}</small>` : ''}
            </div>
          </div>
        </td>
        <td>${c.phone || '<span style="color:var(--text-muted)">-</span>'}</td>
        <td>${c.email || '<span style="color:var(--text-muted)">-</span>'}</td>
        <td style="font-size:0.82rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.address || '<span style="color:var(--text-muted)">-</span>'}</td>
        <td><span class="badge badge-blue">${invs.length}</span></td>
        <td style="color:var(--green);font-weight:700">${formatCurrency(totalSpent)}</td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-sm btn-primary" onclick="showCustomerHistory('${c.id}')" title="View History">
              <i class="fas fa-history"></i>
            </button>
            <button class="btn-icon edit" onclick="openCustomerModal('${c.id}')" title="Edit"><i class="fas fa-pen"></i></button>
            <button class="btn-icon delete" onclick="deleteCustomer('${c.id}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function openCustomerModal(editId) {
  document.getElementById('customerModalTitle').textContent = editId ? 'Edit Customer' : 'Add Customer';
  document.getElementById('editCustomerId').value = editId || '';

  if (editId) {
    const c = state.customers.find(c => c.id === editId);
    if (!c) return;
    document.getElementById('custName').value = c.name || '';
    document.getElementById('custPhone').value = c.phone || '';
    document.getElementById('custEmail').value = c.email || '';
    document.getElementById('custNic').value = c.nic || '';
    document.getElementById('custAddress').value = c.address || '';
    document.getElementById('custNotes').value = c.notes || '';
  } else {
    ['custName', 'custPhone', 'custEmail', 'custNic', 'custAddress', 'custNotes'].forEach(id => document.getElementById(id).value = '');
  }
  document.getElementById('customerModal').classList.add('open');
}

function saveCustomer() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  if (!name) { showToast('Customer name is required', 'error'); return; }
  if (!phone) { showToast('Phone number is required', 'error'); return; }

  const editId = document.getElementById('editCustomerId').value;
  const data = {
    name,
    phone,
    email: document.getElementById('custEmail').value.trim(),
    nic: document.getElementById('custNic').value.trim(),
    address: document.getElementById('custAddress').value.trim(),
    notes: document.getElementById('custNotes').value.trim(),
  };

  if (editId) {
    const idx = state.customers.findIndex(c => c.id === editId);
    if (idx !== -1) state.customers[idx] = { ...state.customers[idx], ...data };
    showToast('Customer updated!', 'success');
  } else {
    // Check duplicate phone
    if (state.customers.find(c => c.phone === phone)) {
      showToast('A customer with this phone already exists!', 'error'); return;
    }
    state.customers.push({ id: uid(), ...data, createdAt: new Date().toISOString() });
    showToast('Customer added!', 'success');
  }

  saveData();
  closeModal('customerModal');
  renderCustomers();
}

function deleteCustomer(id) {
  if (!confirm('Delete this customer? This cannot be undone.')) return;
  state.customers = state.customers.filter(c => c.id !== id);
  saveData();
  renderCustomers();
  showToast('Customer deleted', 'info');
}

function showCustomerHistory(customerId) {
  const c = state.customers.find(c => c.id === customerId);
  if (!c) return;
  const invs = getCustomerInvoices(c).sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalSpent = invs.reduce((s, i) => s + i.total, 0);
  const avgOrder = invs.length ? totalSpent / invs.length : 0;

  document.getElementById('custHistoryName').textContent = c.name;
  document.getElementById('custHistoryPhone').textContent = `📞 ${c.phone || ''}${c.email ? '  •  ✉ ' + c.email : ''}`;

  document.getElementById('custHistoryStats').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:4px">
      <div class="cust-stat-box">
        <span class="cust-stat-label">Total Purchases</span>
        <span class="cust-stat-val">${invs.length}</span>
      </div>
      <div class="cust-stat-box">
        <span class="cust-stat-label">Total Spent</span>
        <span class="cust-stat-val" style="color:var(--green)">${formatCurrency(totalSpent)}</span>
      </div>
      <div class="cust-stat-box">
        <span class="cust-stat-label">Avg. Order</span>
        <span class="cust-stat-val" style="color:var(--blue)">${formatCurrency(avgOrder)}</span>
      </div>
    </div>`;

  const payIcons = { cash: '💵', card: '💳', transfer: '📱' };
  document.getElementById('custHistoryBody').innerHTML = invs.length
    ? invs.map(inv => `
        <tr>
          <td><strong style="color:var(--blue)">#${inv.invoiceNo}</strong></td>
          <td>${inv.items.length} item${inv.items.length !== 1 ? 's' : ''}</td>
          <td style="color:var(--green);font-weight:700">${formatCurrency(inv.total)}</td>
          <td>${payIcons[inv.paymentMethod] || ''} ${inv.paymentMethod}</td>
          <td style="color:var(--text-secondary);font-size:0.82rem">${formatDateTime(inv.date)}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="showInvoicePrint(state.invoices.find(i=>i.id==='${inv.id}'))">
              <i class="fas fa-print"></i>
            </button>
          </td>
        </tr>`).join('')
    : '<tr><td colspan="6" class="empty-row">No purchases recorded yet</td></tr>';

  document.getElementById('customerHistoryModal').classList.add('open');
}

// ===== USER MANAGEMENT =====
function renderUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.users.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <div style="font-weight:600">${u.name}</div>
        <div style="font-size:0.75rem;color:var(--text-secondary)">@${u.username}</div>
      </td>
      <td><span class="badge ${u.role === 'admin' ? 'badge-blue' : 'badge-green'}">${u.role.toUpperCase()}</span></td>
      <td>
        <div class="inv-action-btns">
          <button class="btn-icon edit" onclick="openUserModal('${u.id}')"><i class="fas fa-pen"></i></button>
          ${u.username !== 'admin' ? `<button class="btn-icon delete" onclick="deleteUser('${u.id}')"><i class="fas fa-trash"></i></button>` : ''}
        </div>
      </td>
    </tr>`).join('');
}

function openUserModal(id = null) {
  const modal = document.getElementById('userModal');
  const title = document.getElementById('userModalTitle');

  if (id) {
    const u = state.users.find(u => u.id === id);
    if (!u) return;
    document.getElementById('editUserId').value = u.id;
    document.getElementById('userName').value = u.name;
    document.getElementById('userUsername').value = u.username;
    document.getElementById('userPassword').value = u.password;
    document.getElementById('userRole').value = u.role;
    title.textContent = 'Edit User';
  } else {
    document.getElementById('userForm').reset();
    document.getElementById('editUserId').value = '';
    title.textContent = 'Add New User';
  }

  modal.classList.add('open');
}

function saveUser() {
  const id = document.getElementById('editUserId').value;
  const name = document.getElementById('userName').value.trim();
  const username = document.getElementById('userUsername').value.trim();
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;

  if (!name || !username || !password) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  // Check if username taken (only if new user or changing username)
  const existingUser = state.users.find(u => u.username === username && u.id !== id);
  if (existingUser) {
    showToast('Username already taken', 'error');
    return;
  }

  if (id) {
    const idx = state.users.findIndex(u => u.id === id);
    state.users[idx] = { ...state.users[idx], name, username, password, role };
    showToast('User updated', 'success');
  } else {
    state.users.push({ id: uid(), name, username, password, role });
    showToast('User added', 'success');
  }

  saveData();
  closeModal('userModal');
  renderUsers();
}

function deleteUser(id) {
  const user = state.users.find(u => u.id === id);
  if (user && user.username === 'admin') {
    showToast('Cannot delete default admin', 'error');
    return;
  }

  if (!confirm('Delete this user?')) return;

  state.users = state.users.filter(u => u.id !== id);
  saveData();
  renderUsers();
  showToast('User deleted', 'info');
}

// ===== SUPPLIER MANAGEMENT =====
function renderSuppliers() {
  const search = (document.getElementById('supplierSearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('suppliersTableBody');
  if (!tbody) return;

  const suppliers = state.suppliers.filter(s =>
    !search || s.name.toLowerCase().includes(search) || (s.phone || '').includes(search)
  );

  if (!suppliers.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-row"><i class="fas fa-truck"></i> No suppliers found</td></tr>';
    return;
  }

  tbody.innerHTML = suppliers.map((s, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.contact || '—'}</td>
            <td>${s.phone || '—'}</td>
            <td>${s.email || '—'}</td>
            <td>
                <div class="inv-action-btns">
                    <button class="btn-icon edit" onclick="openSupplierModal('${s.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="deleteSupplier('${s.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

function openSupplierModal(id = null) {
  const modal = document.getElementById('supplierModal');
  const title = document.getElementById('supplierModalTitle');

  if (id) {
    const s = state.suppliers.find(s => s.id === id);
    if (!s) return;
    document.getElementById('editSupplierId').value = s.id;
    document.getElementById('supplierName').value = s.name;
    document.getElementById('supplierContact').value = s.contact || '';
    document.getElementById('supplierPhone').value = s.phone || '';
    document.getElementById('supplierEmail').value = s.email || '';
    title.textContent = 'Edit Supplier';
  } else {
    document.getElementById('supplierForm').reset();
    document.getElementById('editSupplierId').value = '';
    title.textContent = 'Add Supplier';
  }
  modal.classList.add('open');
}

function saveSupplier() {
  const id = document.getElementById('editSupplierId').value;
  const name = document.getElementById('supplierName').value.trim();
  const contact = document.getElementById('supplierContact').value.trim();
  const phone = document.getElementById('supplierPhone').value.trim();
  const email = document.getElementById('supplierEmail').value.trim();

  if (!name || !phone) {
    showToast('Please fill required fields (Name & Phone)', 'error');
    return;
  }

  if (id) {
    const idx = state.suppliers.findIndex(s => s.id === id);
    state.suppliers[idx] = { ...state.suppliers[idx], name, contact, phone, email };
    showToast('Supplier updated', 'success');
  } else {
    state.suppliers.push({ id: uid(), name, contact, phone, email });
    showToast('Supplier added', 'success');
  }

  saveData();
  closeModal('supplierModal');
  renderSuppliers();
}

function deleteSupplier(id) {
  if (!confirm('Delete this supplier?')) return;
  state.suppliers = state.suppliers.filter(s => s.id !== id);
  saveData();
  renderSuppliers();
  showToast('Supplier deleted', 'info');
}

// ===== PURCHASES (STOCK IN) =====
function renderPurchases() {
  const search = (document.getElementById('purchaseSearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('purchasesTableBody');
  if (!tbody) return;

  let purchases = [...state.purchases].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (search) {
    purchases = purchases.filter(p =>
      p.supplierName.toLowerCase().includes(search) || p.productName.toLowerCase().includes(search)
    );
  }

  if (!purchases.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row"><i class="fas fa-history"></i> No stock-in records found</td></tr>';
    return;
  }

  tbody.innerHTML = purchases.map(p => `
        <tr>
            <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDateTime(p.date)}</td>
            <td><strong>${p.supplierName}</strong></td>
            <td>${p.productName}</td>
            <td style="font-weight:700;color:var(--blue)">+ ${p.qty}</td>
            <td>${formatCurrency(p.unitCost)}</td>
            <td style="font-weight:700;color:var(--green)">${formatCurrency(p.totalCost)}</td>
            <td>
                <button class="btn-icon delete" onclick="deletePurchase('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

function openPurchaseModal() {
  const supplierSel = document.getElementById('purchaseSupplier');
  const productSel = document.getElementById('purchaseProduct');

  // Populate suppliers
  supplierSel.innerHTML = '<option value="">Select a Supplier</option>' +
    state.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

  // Populate products
  productSel.innerHTML = '<option value="">Select a Product</option>' +
    state.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  document.getElementById('purchaseForm').reset();
  updatePurchaseTotal();
  document.getElementById('purchaseModal').classList.add('open');
}

function updatePurchaseCost() {
  const productId = document.getElementById('purchaseProduct').value;
  const product = state.products.find(p => p.id === productId);
  if (product) {
    document.getElementById('purchaseUnitCost').value = product.buyPrice;
    updatePurchaseTotal();
  }
}

function updatePurchaseTotal() {
  const qty = parseFloat(document.getElementById('purchaseQty').value) || 0;
  const cost = parseFloat(document.getElementById('purchaseUnitCost').value) || 0;
  document.getElementById('purchaseTotalCost').textContent = formatCurrency(qty * cost);
}

function savePurchase() {
  const supplierId = document.getElementById('purchaseSupplier').value;
  const productId = document.getElementById('purchaseProduct').value;
  const qty = parseFloat(document.getElementById('purchaseQty').value);
  const unitCost = parseFloat(document.getElementById('purchaseUnitCost').value);

  if (!supplierId || !productId || !qty || qty <= 0) {
    showToast('Please select supplier, product and valid quantity', 'error');
    return;
  }

  const supplier = state.suppliers.find(s => s.id === supplierId);
  const product = state.products.find(p => p.id === productId);

  const purchase = {
    id: uid(),
    date: new Date().toISOString(),
    supplierId,
    supplierName: supplier.name,
    productId,
    productName: product.name,
    qty,
    unitCost,
    totalCost: qty * unitCost,
    paidAmount: parseFloat(document.getElementById('purchasePaid').value) || 0
  };

  // ADD TO STATE
  state.purchases.push(purchase);

  // UPDATE MAIN STOCK
  product.stock += qty;
  // Optionally update buyPrice if it changed
  product.buyPrice = unitCost;

  saveData();
  closeModal('purchaseModal');
  renderPurchases();
  renderInventory();
  renderProducts();
  updateDashboard();
  showToast(`${qty} ${product.name} added to stock!`, 'success');
}

function deletePurchase(id) {
  if (!confirm('Delete this record? Note: This will NOT revert the stock level.')) return;
  state.purchases = state.purchases.filter(p => p.id !== id);
  saveData();
  renderPurchases();
  showToast('Record removed from history', 'info');
}


// ===== ACCOUNTS & FINANCE =====
function switchAccountTab(name, btn) {
  document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.account-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('account-' + name).classList.add('active');
}

function renderAccounts() {
  renderReceivables();
  renderPayables();
}

function renderReceivables() {
  const tbody = document.getElementById('receivablesTableBody');
  if (!tbody) return;

  // Group dues by customer
  const dues = {}; // phone -> { name, total, paid }
  state.invoices.forEach(inv => {
    const key = inv.customerPhone || 'walk-in';
    if (!dues[key]) dues[key] = { name: inv.customerName || 'Walk-in', phone: inv.customerPhone, total: 0, paid: 0 };
    dues[key].total += inv.total;
    dues[key].paid += (inv.paidAmount || inv.total);
  });

  // Add payments from state.payments
  state.payments.filter(p => p.type === 'customer').forEach(p => {
    if (dues[p.entityId]) dues[p.entityId].paid += p.amount;
  });

  const rows = Object.values(dues).filter(d => d.total - d.paid > 0.5); // only show significant dues

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No pending credit balances</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(r => `
        <tr>
            <td><strong>${r.name}</strong><br><small>${r.phone || ''}</small></td>
            <td>${formatCurrency(r.total)}</td>
            <td style="color:var(--green)">${formatCurrency(r.paid)}</td>
            <td style="color:var(--red); font-weight:700">${formatCurrency(r.total - r.paid)}</td>
            <td>
                <div class="inv-action-btns">
                    <button class="btn btn-sm btn-success" onclick="openAccountPaymentModal('customer', '${r.phone}', '${r.name}')">Pay Now</button>
                    <button class="btn btn-sm btn-ghost" title="View History" onclick="openPaymentHistoryModal('customer', '${r.phone}', '${r.name}')"><i class="fas fa-history"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

function renderPayables() {
  const tbody = document.getElementById('payablesTableBody');
  if (!tbody) return;

  // Group dues by supplier
  const dues = {}; // supplierId -> { name, total, paid }
  state.purchases.forEach(p => {
    if (!dues[p.supplierId]) dues[p.supplierId] = { name: p.supplierName, total: 0, paid: 0 };
    dues[p.supplierId].total += p.totalCost;
    dues[p.supplierId].paid += (p.paidAmount || p.totalCost);
  });

  // Add payments from state.payments
  state.payments.filter(p => p.type === 'supplier').forEach(p => {
    if (dues[p.entityId]) dues[p.entityId].paid += p.amount;
  });

  const rows = Object.values(dues).filter(d => d.total - d.paid > 0.5);

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No pending supplier payments</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(r => `
        <tr>
            <td><strong>${r.name}</strong></td>
            <td>${formatCurrency(r.total)}</td>
            <td style="color:var(--green)">${formatCurrency(r.paid)}</td>
            <td style="color:var(--red); font-weight:700">${formatCurrency(r.total - r.paid)}</td>
            <td>
                <div class="inv-action-btns">
                    <button class="btn btn-sm btn-success" onclick="openAccountPaymentModal('supplier', '${Object.keys(dues).find(k => dues[k].name === r.name)}', '${r.name}')">Pay Now</button>
                    <button class="btn btn-sm btn-ghost" title="View History" onclick="openPaymentHistoryModal('supplier', '${Object.keys(dues).find(k => dues[k].name === r.name)}', '${r.name}')"><i class="fas fa-history"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

function openAccountPaymentModal(type, entityId, entityName) {
  document.getElementById('accPaymentType').value = type;
  document.getElementById('accPaymentEntityId').value = entityId;
  document.getElementById('accPaymentEntityName').value = entityName;
  document.getElementById('accPaymentAmount').value = '';
  document.getElementById('accPaymentNote').value = '';
  document.getElementById('accPaymentTitle').textContent = type === 'supplier' ? 'Pay to Supplier' : 'Receive from Customer';
  document.getElementById('accountPaymentModal').classList.add('open');
}

function saveAccountPayment() {
  const type = document.getElementById('accPaymentType').value;
  const entityId = document.getElementById('accPaymentEntityId').value;
  const amount = parseFloat(document.getElementById('accPaymentAmount').value);
  const note = document.getElementById('accPaymentNote').value;

  if (!amount || amount <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }

  const payment = {
    id: uid(),
    type,
    entityId,
    amount,
    note,
    date: new Date().toISOString()
  };

  state.payments.push(payment);
  saveData();
  closeModal('accountPaymentModal');
  renderAccounts();
  showToast('Payment recorded successfully', 'success');
}

// ===== PAYMENT HISTORY =====
function openPaymentHistoryModal(type, entityId, entityName) {
  const tbody = document.getElementById('paymentHistoryTableBody');
  const title = document.getElementById('historyModalTitle');
  title.textContent = `Payment History: ${entityName}`;

  const payments = state.payments.filter(p => p.type === type && p.entityId === entityId);

  // Also include initial payments recorded during Stock In / POS
  let initialPayments = [];
  if (type === 'supplier') {
    initialPayments = state.purchases.filter(p => p.supplierId === entityId && p.paidAmount > 0).map(p => ({
      date: p.date,
      amount: p.paidAmount,
      note: 'Initial Payment (Stock In)',
      id: 'initial-' + p.id
    }));
  } else {
    initialPayments = state.invoices.filter(inv => (inv.customerPhone || 'walk-in') === entityId && inv.paidAmount > 0).map(inv => ({
      date: inv.date,
      amount: inv.paidAmount,
      note: `Initial Payment (Inv #${inv.invoiceNo})`,
      id: 'initial-' + inv.id
    }));
  }

  const allPayments = [...initialPayments, ...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!allPayments.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-row">No payment history found</td></tr>';
  } else {
    tbody.innerHTML = allPayments.map(p => `
            <tr>
                <td>${formatDateTime(p.date)}</td>
                <td style="color:var(--green); font-weight:700">${formatCurrency(p.amount)}</td>
                <td style="color:var(--text-secondary); font-size:0.82rem">${p.note || '—'}</td>
                <td>
                    ${p.id.toString().startsWith('initial-') ? '' : `<button class="btn-icon delete" onclick="deletePayment('${p.id}', '${type}', '${entityId}', '${entityName.replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i></button>`}
                </td>
            </tr>`).join('');
  }

  document.getElementById('paymentHistoryModal').classList.add('open');
}

function deletePayment(id, type, entityId, entityName) {
  if (!confirm('Are you sure you want to delete this payment record? This will increase the outstanding balance.')) return;
  state.payments = state.payments.filter(p => p.id !== id);
  saveData();
  renderAccounts();
  // Refresh history modal
  openPaymentHistoryModal(type, entityId, entityName);
  showToast('Payment record deleted', 'info');
}

// ===== EXPENSES MANAGEMENT =====
function renderExpenses() {
  const search = (document.getElementById('expenseSearch')?.value || '').toLowerCase();
  const tbody = document.getElementById('expensesTableBody');
  if (!tbody) return;

  let expenses = [...(state.expenses || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (search) {
    expenses = expenses.filter(e =>
      e.category.toLowerCase().includes(search) ||
      e.description.toLowerCase().includes(search)
    );
  }

  // Stats
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const todayExp = state.expenses.filter(e => new Date(e.date).toDateString() === today)
    .reduce((s, e) => s + e.amount, 0);
  const monthExp = state.expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).reduce((s, e) => s + e.amount, 0);

  document.getElementById('exp-today').textContent = formatCurrency(todayExp);
  document.getElementById('exp-month').textContent = formatCurrency(monthExp);

  if (!expenses.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-row"><i class="fas fa-wallet"></i> No expenses found</td></tr>';
    return;
  }

  tbody.innerHTML = expenses.map(e => `
        <tr>
            <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(e.date)}</td>
            <td><span class="badge badge-orange">${e.category}</span></td>
            <td>${e.description || '—'}</td>
            <td style="font-weight:700;color:var(--red)">${formatCurrency(e.amount)}</td>
            <td>
                <button class="btn-icon delete" onclick="deleteExpense('${e.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

function openExpenseModal() {
  document.getElementById('expAmount').value = '';
  document.getElementById('expDesc').value = '';
  document.getElementById('expDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('expenseModal').classList.add('open');
}

function saveExpense() {
  const amount = parseFloat(document.getElementById('expAmount').value);
  const category = document.getElementById('expCategory').value;
  const description = document.getElementById('expDesc').value.trim();
  const date = document.getElementById('expDate').value || new Date().toISOString();

  if (!amount || amount <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }

  const expense = {
    id: uid(),
    category,
    amount,
    description,
    date: new Date(date).toISOString()
  };

  if (!state.expenses) state.expenses = [];
  state.expenses.push(expense);
  saveData();
  closeModal('expenseModal');
  renderExpenses();
  updateDashboard();
  showToast('Expense recorded successfully', 'success');
}

function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense record?')) return;
  state.expenses = state.expenses.filter(e => e.id !== id);
  saveData();
  renderExpenses();
  updateDashboard();
  showToast('Expense record deleted', 'info');
}

// ===== DATA BACKUP & RESTORE =====
function exportData() {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Beetech_POS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup file downloaded successfully!', 'success');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!confirm('This will OVERWRITE your current data with the backup. Are you sure?')) {
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedState = JSON.parse(e.target.result);
      // Basic validation
      if (importedState.products && importedState.invoices) {
        state = importedState;
        saveData();
        location.reload(); // Reload to apply all data
      } else {
        showToast('Invalid backup file format!', 'error');
      }
    } catch (err) {
      showToast('Error reading backup file!', 'error');
    }
  };
  reader.readAsText(file);
}

// ===== KEYBOARD SHORTCUTS =====
function initShortcutKeys() {
  document.addEventListener('keydown', e => {
    // Only trigger if not in an input field (unless it's the POS search)
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    if (isInput && document.activeElement.id !== 'posSearch') return;

    // F1: Complete Sale (if in POS)
    if (e.key === 'F1') {
      e.preventDefault();
      if (state.currentPage === 'pos') completeSale();
      else switchPage('pos');
    }
    // F2: Focus Search in POS
    if (e.key === 'F2') {
      e.preventDefault();
      switchPage('pos');
      document.getElementById('posSearch')?.focus();
    }
    // F3: Clear Cart
    if (e.key === 'F3') {
      e.preventDefault();
      if (state.currentPage === 'pos') clearCart();
    }
    // F4: Dashboard
    if (e.key === 'F4') {
      e.preventDefault();
      switchPage('dashboard');
    }
  });
}

// Start the app
window.onload = () => {
  init();
  initShortcutKeys();
};
