// ===== INVOICE ACTIONS (Override renderInvoices + Add CRUD) =====

// Override the original renderInvoices to add all 4 action buttons
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

  const payLabels = { cash: 'Cash', card: 'Card', transfer: 'Transfer' };
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
      <td>${payIcons[inv.paymentMethod] || ''} ${payLabels[inv.paymentMethod] || inv.paymentMethod}</td>
      <td style="color:var(--text-secondary);font-size:0.82rem">${formatDateTime(inv.date)}</td>
      <td>
        <div class="inv-action-btns">
          <button class="btn-icon view"      onclick="viewInvoiceDetail('${inv.id}')"                                      title="View Details"><i class="fas fa-eye"></i></button>
          <button class="btn-icon print-btn" onclick="showInvoicePrint(state.invoices.find(i=>i.id==='${inv.id}'))"       title="Print"><i class="fas fa-print"></i></button>
          <button class="btn-icon edit"      onclick="openEditInvoiceModal('${inv.id}')"                                   title="Edit Invoice"><i class="fas fa-pen"></i></button>
          <button class="btn-icon delete"    onclick="deleteInvoice('${inv.id}')"                                          title="Delete Invoice"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

// ===== VIEW INVOICE DETAIL (read-only popup) =====
function viewInvoiceDetail(invoiceId) {
  const inv = state.invoices.find(i => i.id === invoiceId);
  if (!inv) return;
  showInvoicePrint(inv);
}

// ===== EDIT INVOICE MODAL =====
function openEditInvoiceModal(invoiceId) {
  const inv = state.invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  document.getElementById('editInvId').value = inv.id;
  document.getElementById('editInvNo').textContent = '#' + inv.invoiceNo;
  document.getElementById('editInvCustomerName').value = inv.customerName || '';
  document.getElementById('editInvCustomerPhone').value = inv.customerPhone || '';
  document.getElementById('editInvDiscountValue').value = inv.discountValue || 0;
  document.getElementById('editInvDiscountType').value = inv.discountType || 'percent';
  document.getElementById('editInvPayment').value = inv.paymentMethod || 'cash';
  document.getElementById('editInvNote').value = inv.note || '';

  // Render items with EDITABLE qty and price inputs
  renderEditInvItems(inv.items);

  recalcEditInvTotal();
  document.getElementById('editInvoiceModal').classList.add('open');
}

// Build the editable items table rows and wire up live recalc
function renderEditInvItems(items) {
  document.getElementById('editInvItemsTable').innerHTML = items.map((item, idx) => `
    <tr id="editInvRow_${idx}">
      <td><strong>${item.name}</strong></td>
      <td style="text-align:center">
        <input
          type="number"
          class="edit-inv-qty-input"
          id="editInvQty_${idx}"
          value="${item.qty}"
          min="1"
          step="1"
          oninput="recalcEditInvRowTotal(${idx})"
          title="Edit quantity"
        />
      </td>
      <td style="text-align:right">
        <input
          type="number"
          class="edit-inv-price-input"
          id="editInvPrice_${idx}"
          value="${item.price}"
          min="0"
          step="0.01"
          oninput="recalcEditInvRowTotal(${idx})"
          title="Edit unit price"
        />
      </td>
      <td style="text-align:right;font-weight:700;color:var(--green)" id="editInvRowTotal_${idx}">
        ${formatCurrency(item.price * item.qty)}
      </td>
    </tr>`).join('');

  recalcEditInvSubtotal();
}

// Live update a single row's total cell
function recalcEditInvRowTotal(idx) {
  const qty = parseFloat(document.getElementById(`editInvQty_${idx}`)?.value) || 0;
  const price = parseFloat(document.getElementById(`editInvPrice_${idx}`)?.value) || 0;
  const cell = document.getElementById(`editInvRowTotal_${idx}`);
  if (cell) cell.textContent = formatCurrency(qty * price);
  recalcEditInvSubtotal();
}

// Recompute subtotal from all editable rows, then update grand total
function recalcEditInvSubtotal() {
  let subtotal = 0;
  let idx = 0;
  while (document.getElementById(`editInvRow_${idx}`)) {
    const qty = parseFloat(document.getElementById(`editInvQty_${idx}`)?.value) || 0;
    const price = parseFloat(document.getElementById(`editInvPrice_${idx}`)?.value) || 0;
    subtotal += qty * price;
    idx++;
  }
  const subtotalEl = document.getElementById('editInvSubtotal');
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  recalcEditInvTotal();
}

// Recompute grand total after discount
function recalcEditInvTotal() {
  const subtotalText = document.getElementById('editInvSubtotal')?.textContent || '0';
  const subtotal = parseFloat(subtotalText.replace('Rs. ', '').replace(/,/g, '')) || 0;
  const discVal = parseFloat(document.getElementById('editInvDiscountValue')?.value) || 0;
  const discType = document.getElementById('editInvDiscountType')?.value || 'percent';
  const discount = discType === 'percent' ? subtotal * discVal / 100 : Math.min(discVal, subtotal);
  const total = Math.max(subtotal - discount, 0);
  const totalEl = document.getElementById('editInvTotal');
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

// Save all edits (items + customer + discount + payment)
function saveInvoiceEdit() {
  const id = document.getElementById('editInvId').value;
  const idx = state.invoices.findIndex(i => i.id === id);
  if (idx === -1) return;

  const inv = state.invoices[idx];

  // Read edited items back from the DOM
  const updatedItems = [];
  let rowIdx = 0;
  while (document.getElementById(`editInvRow_${rowIdx}`)) {
    const originalItem = inv.items[rowIdx];
    const qty = parseFloat(document.getElementById(`editInvQty_${rowIdx}`)?.value) || 0;
    const price = parseFloat(document.getElementById(`editInvPrice_${rowIdx}`)?.value) || 0;
    if (qty > 0) {
      updatedItems.push({ ...originalItem, qty, price });
    }
    rowIdx++;
  }

  if (!updatedItems.length) {
    showToast('Invoice must have at least one item', 'error');
    return;
  }

  // Recalculate financials from updated items
  const subtotal = updatedItems.reduce((s, item) => s + item.price * item.qty, 0);
  const discVal = parseFloat(document.getElementById('editInvDiscountValue').value) || 0;
  const discType = document.getElementById('editInvDiscountType').value;
  const discount = discType === 'percent' ? subtotal * discVal / 100 : Math.min(discVal, subtotal);
  const total = Math.max(subtotal - discount, 0);

  state.invoices[idx] = {
    ...inv,
    items: updatedItems,
    subtotal,
    discount,
    discountValue: discVal,
    discountType: discType,
    total,
    customerName: document.getElementById('editInvCustomerName').value.trim(),
    customerPhone: document.getElementById('editInvCustomerPhone').value.trim(),
    paymentMethod: document.getElementById('editInvPayment').value,
    note: document.getElementById('editInvNote').value.trim(),
  };

  saveData();
  closeModal('editInvoiceModal');
  renderInvoices();
  updateDashboard();
  renderCustomers();
  showToast('Invoice #' + inv.invoiceNo + ' updated!', 'success');
}

// ===== DELETE INVOICE =====
function deleteInvoice(invoiceId) {
  const inv = state.invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  if (!confirm(`Delete Invoice #${inv.invoiceNo}?\n\nThis will RESTORE the stock for ${inv.items.length} item(s). This action cannot be undone.`)) return;

  // Restore stock
  inv.items.forEach(cartItem => {
    const product = state.products.find(p => p.id === cartItem.productId);
    if (product) product.stock += cartItem.qty;
  });

  state.invoices = state.invoices.filter(i => i.id !== invoiceId);
  saveData();
  renderInvoices();
  renderPOSProducts();
  renderInventory();
  updateDashboard();
  renderCustomers();
  showToast(`Invoice #${inv.invoiceNo} deleted & stock restored`, 'info');
}
