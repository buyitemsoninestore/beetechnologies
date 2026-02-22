// ===== REPORTS MODULE =====
// Sales Report, Stock Report, Profit Report + Excel Export

// ── Entry point called by switchPage('reports') ──
function renderReports() {
    // Render whichever panel is active
    const activePanel = document.querySelector('.report-panel.active');
    if (!activePanel) return;
    const panelId = activePanel.id.replace('report-', '');
    if (panelId === 'sales') renderSalesReport();
    if (panelId === 'stock') renderStockReport();
    if (panelId === 'profit') renderProfitReport();
}

// ── Tab switching ──
function switchReportTab(name, btn) {
    document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.report-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('report-' + name).classList.add('active');
    if (name === 'sales') renderSalesReport();
    if (name === 'stock') renderStockReport();
    if (name === 'profit') renderProfitReport();
}

// ── Date helpers ──
function getReportDateRange(prefix) {
    const from = document.getElementById(prefix + 'From')?.value;
    const to = document.getElementById(prefix + 'To')?.value;
    return { from, to };
}

function resetReportDates(prefix) {
    const fromEl = document.getElementById(prefix + 'From');
    const toEl = document.getElementById(prefix + 'To');
    if (fromEl) fromEl.value = '';
    if (toEl) toEl.value = '';
    if (prefix === 'salesRpt') renderSalesReport();
    if (prefix === 'profitRpt') renderProfitReport();
}

function filterByDate(arr, dateField, from, to) {
    return arr.filter(item => {
        const d = new Date(item[dateField]);
        if (from && d < new Date(from)) return false;
        if (to && d > new Date(to + 'T23:59:59')) return false;
        return true;
    });
}

// ════════════════════════════════════════
//  SALES REPORT
// ════════════════════════════════════════
function renderSalesReport() {
    const { from, to } = getReportDateRange('salesRpt');
    let invoices = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (from || to) invoices = filterByDate(invoices, 'date', from, to);

    const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
    const totalDiscount = invoices.reduce((s, i) => s + (i.discount || 0), 0);
    const avgOrder = invoices.length ? totalRevenue / invoices.length : 0;

    document.getElementById('rpt-sales-count').textContent = invoices.length;
    document.getElementById('rpt-sales-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('rpt-sales-discount').textContent = formatCurrency(totalDiscount);
    document.getElementById('rpt-sales-avg').textContent = formatCurrency(avgOrder);

    const payIcons = { cash: '💵', card: '💳', transfer: '📱' };
    const tbody = document.getElementById('salesRptBody');

    if (!invoices.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-row"><i class="fas fa-chart-line"></i> No sales data for the selected period</td></tr>';
        return;
    }

    tbody.innerHTML = invoices.map((inv, idx) => `
    <tr>
      <td style="color:var(--text-muted)">${idx + 1}</td>
      <td><strong style="color:var(--blue)">#${inv.invoiceNo}</strong></td>
      <td>${inv.customerName || '<span style="color:var(--text-muted)">Walk-in</span>'}
          ${inv.customerPhone ? `<br><small style="color:var(--text-muted)">${inv.customerPhone}</small>` : ''}
      </td>
      <td>${inv.items.length}</td>
      <td>${formatCurrency(inv.subtotal || inv.items.reduce((s, i) => s + i.price * i.qty, 0))}</td>
      <td style="color:var(--red)">${inv.discount > 0 ? '-' + formatCurrency(inv.discount) : '—'}</td>
      <td style="color:var(--green);font-weight:700">${formatCurrency(inv.total)}</td>
      <td>${payIcons[inv.paymentMethod] || ''} ${inv.paymentMethod}</td>
      <td style="color:var(--text-secondary);font-size:0.8rem">${formatDateTime(inv.date)}</td>
    </tr>`).join('');
}

// ════════════════════════════════════════
//  STOCK REPORT
// ════════════════════════════════════════
function renderStockReport() {
    const products = state.products;
    const totalValue = products.reduce((s, p) => s + p.buyPrice * p.stock, 0);
    const outOfStock = products.filter(p => p.stock <= 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.lowStock).length;

    document.getElementById('rpt-stock-products').textContent = products.length;
    document.getElementById('rpt-stock-value').textContent = formatCurrency(totalValue);
    document.getElementById('rpt-stock-out').textContent = outOfStock;
    document.getElementById('rpt-stock-low').textContent = lowStock;

    const tbody = document.getElementById('stockRptBody');
    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-row"><i class="fas fa-boxes"></i> No products found</td></tr>';
        return;
    }

    const sorted = [...products].sort((a, b) => a.stock - b.stock); // lowest stock first
    tbody.innerHTML = sorted.map((p, idx) => {
        let status, badge;
        if (p.stock <= 0) { status = 'Out of Stock'; badge = 'badge-red'; }
        else if (p.stock <= p.lowStock) { status = 'Low Stock'; badge = 'badge-orange'; }
        else { status = 'In Stock'; badge = 'badge-green'; }
        return `
      <tr>
        <td style="color:var(--text-muted)">${idx + 1}</td>
        <td><strong>${p.name}</strong></td>
        <td><span class="badge badge-blue">${p.category}</span></td>
        <td style="color:var(--text-secondary)">${p.brand || '—'}</td>
        <td style="font-family:monospace;font-size:0.78rem;color:var(--text-muted)">${p.barcode || '—'}</td>
        <td style="font-size:1.05rem;font-weight:700">${p.stock}</td>
        <td style="color:var(--text-secondary)">${p.lowStock || 5}</td>
        <td>${formatCurrency(p.buyPrice)}</td>
        <td style="color:var(--green);font-weight:700">${formatCurrency(p.buyPrice * p.stock)}</td>
        <td><span class="badge ${badge}">${status}</span></td>
      </tr>`;
    }).join('');
}

// ════════════════════════════════════════
//  PROFIT REPORT
// ════════════════════════════════════════
function renderProfitReport() {
    const { from, to } = getReportDateRange('profitRpt');
    let invoices = [...state.invoices];
    if (from || to) invoices = filterByDate(invoices, 'date', from, to);

    // Build per-product profit map
    const productMap = {}; // productId → { name, category, sellPrice, buyPrice, unitsSold, revenue, cost }

    invoices.forEach(inv => {
        inv.items.forEach(item => {
            const product = state.products.find(p => p.id === item.productId);
            const buyPrice = product ? product.buyPrice : 0;

            if (!productMap[item.productId]) {
                productMap[item.productId] = {
                    name: item.name,
                    category: product ? product.category : '—',
                    sellPrice: item.price,
                    buyPrice,
                    unitsSold: 0,
                    revenue: 0,
                    cost: 0,
                };
            }
            productMap[item.productId].unitsSold += item.qty;
            productMap[item.productId].revenue += item.price * item.qty;
            productMap[item.productId].cost += buyPrice * item.qty;
            // Update sell price to latest
            productMap[item.productId].sellPrice = item.price;
        });
    });

    const rows = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
    const totRev = rows.reduce((s, r) => s + r.revenue, 0);
    const totCost = rows.reduce((s, r) => s + r.cost, 0);
    const grossProfit = totRev - totCost;

    // Filter expenses by date
    let filteredExpenses = [...(state.expenses || [])];
    if (from || to) filteredExpenses = filterByDate(filteredExpenses, 'date', from, to);
    const totExp = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = grossProfit - totExp;
    const margin = totRev > 0 ? ((netProfit / totRev) * 100).toFixed(1) : '0.0';

    document.getElementById('rpt-profit-revenue').textContent = formatCurrency(totRev);
    document.getElementById('rpt-profit-cost').textContent = formatCurrency(totCost);
    document.getElementById('rpt-profit-gross').textContent = formatCurrency(grossProfit);
    document.getElementById('rpt-profit-expenses').textContent = formatCurrency(totExp);
    document.getElementById('rpt-profit-net').textContent = formatCurrency(netProfit);
    document.getElementById('rpt-profit-margin').textContent = margin + '%';

    const tbody = document.getElementById('profitRptBody');
    if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-row"><i class="fas fa-coins"></i> No sales data for the selected period</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map((r, idx) => {
        const profit = r.revenue - r.cost;
        const pct = r.revenue > 0 ? ((profit / r.revenue) * 100).toFixed(1) : '0.0';
        const profitColor = profit >= 0 ? 'var(--green)' : 'var(--red)';
        return `
      <tr>
        <td style="color:var(--text-muted)">${idx + 1}</td>
        <td><strong>${r.name}</strong></td>
        <td><span class="badge badge-blue">${r.category}</span></td>
        <td style="font-weight:700">${r.unitsSold}</td>
        <td>${formatCurrency(r.sellPrice)}</td>
        <td style="color:var(--text-secondary)">${formatCurrency(r.buyPrice)}</td>
        <td style="color:var(--green);font-weight:700">${formatCurrency(r.revenue)}</td>
        <td style="color:var(--text-secondary)">${formatCurrency(r.cost)}</td>
        <td style="color:${profitColor};font-weight:700">${formatCurrency(profit)}</td>
        <td>
          <span class="rpt-margin-pill ${profit >= 0 ? 'margin-pos' : 'margin-neg'}">${pct}%</span>
        </td>
      </tr>`;
    }).join('');
}

// ════════════════════════════════════════
//  EXCEL EXPORT (CSV → .xlsx compatible)
// ════════════════════════════════════════
function exportExcel(type) {
    let rows = [], filename = '';
    const now = new Date().toISOString().slice(0, 10);

    if (type === 'sales') {
        const { from, to } = getReportDateRange('salesRpt');
        let invoices = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date));
        if (from || to) invoices = filterByDate(invoices, 'date', from, to);

        filename = `Beetech_Sales_Report_${now}.csv`;
        rows.push(['#', 'Invoice No', 'Customer Name', 'Customer Phone', 'Items Count',
            'Subtotal (Rs.)', 'Discount (Rs.)', 'Total (Rs.)', 'Payment Method', 'Date']);
        invoices.forEach((inv, i) => {
            const subtotal = inv.subtotal || inv.items.reduce((s, it) => s + it.price * it.qty, 0);
            rows.push([
                i + 1,
                '#' + inv.invoiceNo,
                inv.customerName || 'Walk-in',
                inv.customerPhone || '',
                inv.items.length,
                subtotal.toFixed(2),
                (inv.discount || 0).toFixed(2),
                inv.total.toFixed(2),
                inv.paymentMethod,
                new Date(inv.date).toLocaleString('en-LK'),
            ]);
        });
        // Summary footer
        const totalRev = invoices.reduce((s, i) => s + i.total, 0);
        const totalDisc = invoices.reduce((s, i) => s + (i.discount || 0), 0);
        rows.push([]);
        rows.push(['', '', '', '', 'TOTAL', '', totalDisc.toFixed(2), totalRev.toFixed(2), '', '']);
    }

    else if (type === 'stock') {
        filename = `Beetech_Stock_Report_${now}.csv`;
        const products = [...state.products].sort((a, b) => a.stock - b.stock);
        rows.push(['#', 'Product Name', 'Category', 'Brand', 'Barcode',
            'In Stock', 'Low Stock Alert', 'Buy Price (Rs.)', 'Stock Value (Rs.)', 'Status']);
        products.forEach((p, i) => {
            let status = p.stock <= 0 ? 'Out of Stock' : p.stock <= p.lowStock ? 'Low Stock' : 'In Stock';
            rows.push([
                i + 1,
                p.name,
                p.category,
                p.brand || '',
                p.barcode || '',
                p.stock,
                p.lowStock || 5,
                p.buyPrice.toFixed(2),
                (p.buyPrice * p.stock).toFixed(2),
                status,
            ]);
        });
        const totalVal = state.products.reduce((s, p) => s + p.buyPrice * p.stock, 0);
        rows.push([]);
        rows.push(['', '', '', '', '', '', '', 'TOTAL VALUE', totalVal.toFixed(2), '']);
    }

    else if (type === 'profit') {
        const { from, to } = getReportDateRange('profitRpt');
        let invoices = [...state.invoices];
        if (from || to) invoices = filterByDate(invoices, 'date', from, to);

        const productMap = {};
        invoices.forEach(inv => {
            inv.items.forEach(item => {
                const product = state.products.find(p => p.id === item.productId);
                const buyPrice = product ? product.buyPrice : 0;
                if (!productMap[item.productId]) {
                    productMap[item.productId] = {
                        name: item.name, category: product ? product.category : '',
                        sellPrice: item.price, buyPrice, unitsSold: 0, revenue: 0, cost: 0,
                    };
                }
                productMap[item.productId].unitsSold += item.qty;
                productMap[item.productId].revenue += item.price * item.qty;
                productMap[item.productId].cost += buyPrice * item.qty;
            });
        });

        filename = `Beetech_Profit_Report_${now}.csv`;
        rows.push(['#', 'Product', 'Category', 'Units Sold', 'Sell Price (Rs.)', 'Buy Price (Rs.)',
            'Revenue (Rs.)', 'Cost (Rs.)', 'Profit (Rs.)', 'Margin (%)']);
        const rrows = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
        rrows.forEach((r, i) => {
            const profit = r.revenue - r.cost;
            const pct = r.revenue > 0 ? ((profit / r.revenue) * 100).toFixed(1) : '0.0';
            rows.push([
                i + 1, r.name, r.category, r.unitsSold,
                r.sellPrice.toFixed(2), r.buyPrice.toFixed(2),
                r.revenue.toFixed(2), r.cost.toFixed(2), profit.toFixed(2), pct,
            ]);
        });
        const totRev = rrows.reduce((s, r) => s + r.revenue, 0);
        const totCost = rrows.reduce((s, r) => s + r.cost, 0);
        const totP = totRev - totCost;
        const totPct = totRev > 0 ? ((totP / totRev) * 100).toFixed(1) : '0.0';
        rows.push([]);
        rows.push(['', 'TOTAL', '', '', '', '', totRev.toFixed(2), totCost.toFixed(2), totP.toFixed(2), totPct]);
    }

    // Convert rows → CSV string
    const csv = rows.map(row =>
        row.map(cell => {
            const s = String(cell ?? '');
            // Wrap in quotes if contains comma, quote, or newline
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? '"' + s.replace(/"/g, '""') + '"'
                : s;
        }).join(',')
    ).join('\r\n');

    // BOM for Excel UTF-8 recognition
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`${filename} downloaded!`, 'success');
}
