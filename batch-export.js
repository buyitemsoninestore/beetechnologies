// ===== BATCH INVOICE PDF EXPORT =====

async function batchExportPDFs() {
    const search = (document.getElementById('invoiceSearch')?.value || '').toLowerCase();
    const dateFrom = document.getElementById('invoiceDateFrom')?.value;
    const dateTo = document.getElementById('invoiceDateTo')?.value;

    let invoices = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply current UI filters
    if (search) invoices = invoices.filter(inv =>
        inv.invoiceNo.includes(search) ||
        (inv.customerName || '').toLowerCase().includes(search) ||
        (inv.customerPhone || '').includes(search)
    );
    if (dateFrom) invoices = invoices.filter(inv => new Date(inv.date) >= new Date(dateFrom));
    if (dateTo) invoices = invoices.filter(inv => new Date(inv.date) <= new Date(dateTo + 'T23:59:59'));

    if (!invoices.length) {
        showToast('No invoices to export with current filters!', 'warning');
        return;
    }

    if (!confirm(`Are you sure you want to export ${invoices.length} invoices as PDF? This might take a few moments.`)) return;

    showToast(`Generating ${invoices.length} PDFs... Please wait.`, 'info');

    const zip = new JSZip();
    const s = state.settings;

    // Create a temporary container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px'; // standard width for consistent pdf
    document.body.appendChild(tempContainer);

    // PDF options
    const opt = {
        margin: [10, 10],
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        for (const inv of invoices) {
            const dateObj = new Date(inv.date);
            const dateStr = dateObj.toISOString().split('T')[0];
            const monthStr = dateStr.slice(0, 7); // YYYY-MM

            const subtotal = inv.subtotal || inv.items.reduce((sum, item) => sum + item.price * item.qty, 0);

            // Populate temp container with invoice HTML
            tempContainer.innerHTML = `
                <div class="invoice-print" style="background:#fff; padding:20px; color:#000;">
                    <div class="invoice-top" style="display:flex; justify-content:space-between; margin-bottom:20px;">
                        <div style="display:flex; align-items:center; gap:15px">
                             <img src="WhatsApp Image 2026-02-22 at 12.51.24.jpeg" style="width:60px;height:60px;object-fit:contain;" />
                             <div>
                                <h1 style="margin:0; font-size:1.5rem; color:#ffd200;">${s.shopName}</h1>
                                <p style="margin:2px 0; font-size:0.8rem; color:#555;">
                                    ${s.shopAddress}<br>
                                    Tel: ${s.shopPhone} | Email: ${s.shopEmail}
                                </p>
                             </div>
                        </div>
                        <div style="text-align:right">
                            <h2 style="margin:0; color:#333;">INVOICE</h2>
                            <p style="margin:5px 0; font-weight:700;">#${inv.invoiceNo}</p>
                            <p style="margin:0; font-size:0.85rem; color:#666;">Date: ${formatDateTime(inv.date)}</p>
                        </div>
                    </div>
                    <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:30px;">
                        <div>
                            <p style="font-size:0.75rem; color:#888; margin-bottom:5px; text-transform:uppercase;">Customer Details</p>
                            <p style="margin:0; font-weight:700; font-size:1rem;">${inv.customerName || 'Walk-in Customer'}</p>
                            ${inv.customerPhone ? `<p style="margin:0; font-size:0.85rem; color:#555;">${inv.customerPhone}</p>` : ''}
                        </div>
                        <div style="text-align:right">
                            <p style="font-size:0.75rem; color:#888; margin-bottom:5px; text-transform:uppercase;">Payment Info</p>
                            <p style="margin:0; font-weight:700;">Method: ${inv.paymentMethod.toUpperCase()}</p>
                        </div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:30px;">
                        <thead>
                            <tr style="background:#f9f9f9;">
                                <th style="padding:12px; text-align:left; border-bottom:2px solid #eee;">#</th>
                                <th style="padding:12px; text-align:left; border-bottom:2px solid #eee;">Description</th>
                                <th style="padding:12px; text-align:center; border-bottom:2px solid #eee;">Qty</th>
                                <th style="padding:12px; text-align:right; border-bottom:2px solid #eee;">Price</th>
                                <th style="padding:12px; text-align:right; border-bottom:2px solid #eee;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inv.items.map((item, i) => `
                                <tr>
                                    <td style="padding:12px; border-bottom:1px solid #f0f0f0; color:#888;">${i + 1}</td>
                                    <td style="padding:12px; border-bottom:1px solid #f0f0f0;"><strong>${item.name}</strong></td>
                                    <td style="padding:12px; border-bottom:1px solid #f0f0f0; text-align:center;">${item.qty}</td>
                                    <td style="padding:12px; border-bottom:1px solid #f0f0f0; text-align:right;">${formatCurrency(item.price)}</td>
                                    <td style="padding:12px; border-bottom:1px solid #f0f0f0; text-align:right; font-weight:700;">${formatCurrency(item.price * item.qty)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="display:flex; justify-content:flex-end;">
                        <div style="width:250px;">
                            <div style="display:flex; justify-content:space-between; padding:5px 0;">
                                <span style="color:#666;">Subtotal:</span>
                                <span>${formatCurrency(subtotal)}</span>
                            </div>
                            ${inv.discount > 0 ? `
                            <div style="display:flex; justify-content:space-between; padding:5px 0;">
                                <span style="color:#666;">Discount:</span>
                                <span style="color:#dc2626;">-${formatCurrency(inv.discount)}</span>
                            </div>` : ''}
                            <div style="display:flex; justify-content:space-between; padding:10px 0; border-top:2px solid #ffd200; margin-top:10px; font-weight:800; font-size:1.1rem;">
                                <span>TOTAL:</span>
                                <span>${formatCurrency(inv.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Generate PDF as blob
            const pdfBlob = await html2pdf().from(tempContainer).set(opt).output('blob');

            // Add to ZIP inside folders
            // Structure: Invoices/By-Month/YYYY-MM/By-Day/YYYY-MM-DD/INV-xxx.pdf
            zip.file(`Invoices_Export/Daily/${dateStr}/INV-${inv.invoiceNo}.pdf`, pdfBlob);
        }

        // Generate final ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const fileName = `Invoices_Batch_Export_${new Date().toISOString().split('T')[0]}.zip`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = fileName;
        link.click();

        showToast(`Successfully exported ${invoices.length} invoices!`, 'success');

    } catch (error) {
        console.error(error);
        showToast('Error generating PDFs. Check console.', 'error');
    } finally {
        document.body.removeChild(tempContainer);
    }
}
