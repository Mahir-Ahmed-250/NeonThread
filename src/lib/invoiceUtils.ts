import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';

export const formatOrderId = (id?: string): string => {
  if (!id) return '';
  const trimmed = String(id).trim();
  if (/^NTD-/i.test(trimmed)) {
    return trimmed.replace(/^NTD-/i, 'TCB-');
  }
  if (!/^TCB-/i.test(trimmed)) {
    return `TCB-${trimmed}`;
  }
  return trimmed.replace(/^tcb-/i, 'TCB-');
};

const loadImageAsJpegDataUrl = (src?: string): Promise<string | null> => {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 120;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(src.startsWith('data:image/') ? src : null);
      }
    };
    img.onerror = () => {
      resolve(src.startsWith('data:image/') ? src : null);
    };
    img.src = src;
  });
};

export const generateInvoicePDF = async (order: Order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const formattedOrderId = formatOrderId(order.id);

  // Preload product images as JPEG Data URLs for reliable PDF rendering
  const itemImages = await Promise.all(
    order.items.map(item => loadImageAsJpegDataUrl(item.image))
  );

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TRENDY CART BD', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('OFFICIAL ORDER VOUCHER', 14, 27);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(110, 110, 110);
  doc.text('System Generated Voucher', pageWidth - 14, 20, { align: 'right' });
  
  // Divider line
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 32, pageWidth - 14, 32);

  // Order Info
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Order ID: #${formattedOrderId}`, 14, 41);
  doc.text(`Date: ${new Date(order.date).toLocaleString()}`, 14, 47);

  // Customer Info with dynamic Y positioning to prevent address overlap
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer & Delivery Details:', 14, 59);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let currentY = 66;

  doc.text(`Name: ${order.customer.name || 'N/A'}`, 14, currentY);
  currentY += 6;

  doc.text(`Phone: ${order.customer.phone || 'N/A'}`, 14, currentY);
  currentY += 6;

  doc.text(`Email: ${order.customer.email || 'N/A'}`, 14, currentY);
  currentY += 6;

  const cleanAddress = (order.customer.address || 'N/A')
    .replace(/\r?\n+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
  const maxTextWidth = pageWidth - 28;
  const addressLines = doc.splitTextToSize(`Address: ${cleanAddress}`, maxTextWidth);
  doc.text(addressLines, 14, currentY);
  currentY += addressLines.length * 5.5 + 1;

  doc.text(`District: ${order.customer.district || 'N/A'}`, 14, currentY);
  currentY += 10;

  // Table with Image column
  const tableData = order.items.map(item => [
    '', // Image placeholder drawn in didDrawCell
    item.name,
    item.selectedSize || 'N/A',
    item.quantity,
    `TK ${item.price}`,
    `TK ${(item.price * item.quantity).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: Math.max(104, currentY),
    head: [['Image', 'Product', 'Size', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], valign: 'middle' },
    styles: { fontSize: 9, overflow: 'linebreak', valign: 'middle', minCellHeight: 16 },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 30 },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const imgData = itemImages[data.row.index];
        if (imgData) {
          try {
            const dim = 12;
            const x = data.cell.x + (data.cell.width - dim) / 2;
            const y = data.cell.y + (data.cell.height - dim) / 2;
            doc.addImage(imgData, 'JPEG', x, y, dim, dim);
          } catch {
            // Ignore image draw error if format unsupported
          }
        }
      }
    }
  });

  // Summary
  let summaryY = (doc as any).lastAutoTable.finalY + 10;
  if (summaryY > doc.internal.pageSize.height - 45) {
    doc.addPage();
    summaryY = 20;
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: TK ${order.subtotal.toFixed(2)}`, pageWidth - 14, summaryY, { align: 'right' });
  summaryY += 6;
  
  if (order.discount > 0) {
    doc.text(`Discount: - TK ${order.discount.toFixed(2)}`, pageWidth - 14, summaryY, { align: 'right' });
    summaryY += 6;
  }
  
  doc.text(`Shipping: TK ${order.shippingCharge.toFixed(2)}`, pageWidth - 14, summaryY, { align: 'right' });
  summaryY += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Payable: TK ${order.total.toFixed(2)}`, pageWidth - 14, summaryY, { align: 'right' });

  // Footer
  const footerY = doc.internal.pageSize.height - 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('System Generated Voucher', pageWidth / 2, footerY, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 140, 140);
  const footerText = 'Thank you for shopping with Trendy Cart BD. For any queries, please contact us at support@trendycartbd.com';
  doc.text(footerText, pageWidth / 2, footerY + 5, { align: 'center' });

  // Save
  doc.save(`Voucher_${formattedOrderId}.pdf`);
};

export const printOrderVoucher = (order: Order) => {
  const formattedOrderId = formatOrderId(order.id);
  const cleanAddress = (order.customer.address || 'N/A')
    .replace(/\r?\n+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  const itemsHtml = order.items.map((item) => `
    <tr>
      <td style="padding: 8px 10px; border-bottom: 1px solid #eaeaea;">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 42px; height: 42px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff;" referrerPolicy="no-referrer" />` : ''}
          <div>
            <span style="font-weight: 800; font-size: 12px; color: #111; display: block; text-transform: uppercase;">${item.name}</span>
            <span style="font-size: 10px; color: #666; font-weight: 600;">Size: ${item.selectedSize || 'N/A'}${item.code ? ` | Code: ${item.code}` : ''}</span>
          </div>
        </div>
      </td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #eaeaea; text-align: center; font-weight: 700; font-family: monospace; color: #333; font-size: 12px;">x${item.quantity}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #eaeaea; text-align: right; font-weight: 600; color: #444; font-size: 12px;">৳${item.price.toFixed(2)}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #eaeaea; text-align: right; font-weight: 800; color: #111; font-size: 12px;">৳${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Order Voucher - #${formattedOrderId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: #222; background: #fff; }
            .voucher-box { max-width: 720px; margin: 0 auto; padding: 24px; border: 1.5px solid #111; border-radius: 14px; box-sizing: border-box; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 14px; margin-bottom: 16px; }
            .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; margin: 0; color: #000; }
            .voucher-badge { display: inline-block; margin-top: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #555; background: #f3f4f6; padding: 3px 8px; border-radius: 4px; }
            .meta-right { text-align: right; font-size: 11px; color: #444; }
            .grid-info { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
            .customer-card { flex: 1; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; word-break: break-word; overflow-wrap: anywhere; }
            .customer-card h3 { margin: 0 0 6px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
            .customer-card p { margin: 3px 0; font-size: 11.5px; color: #1f2937; line-height: 1.45; word-break: break-word; overflow-wrap: anywhere; }
            table.items { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
            table.items th { padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; text-align: left; background: #111; color: #fff; font-weight: 800; }
            .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 20px; }
            .totals { width: 250px; background: #f9fafb; padding: 12px 14px; border-radius: 10px; border: 1px solid #e5e7eb; font-size: 12px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; color: #4b5563; }
            .grand-total { border-top: 1.5px solid #111; padding-top: 8px; margin-top: 6px; font-size: 14px; font-weight: 900; color: #000; margin-bottom: 0; }
            .footer { text-align: center; border-top: 1px dashed #d1d5db; padding-top: 12px; margin-top: 8px; }
            .sys-badge { display: inline-block; font-size: 11px; font-weight: 800; color: #111; background: #f3f4f6; border: 1px solid #e5e7eb; padding: 4px 12px; border-radius: 999px; margin-bottom: 6px; }
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="voucher-box">
            <div class="header">
              <div>
                <h1 class="brand">TRENDY CART BD</h1>
                <span class="voucher-badge">Order Voucher / ক্যাশ মেমো</span>
              </div>
              <div class="meta-right">
                <p style="margin: 2px 0; font-size: 13px; font-weight: 900; color: #000;">Order ID: #${formattedOrderId}</p>
                <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p style="margin: 2px 0; font-weight: 700; color: #16a34a;">Payment: Cash on Delivery</p>
              </div>
            </div>

            <div class="grid-info">
              <div class="customer-card">
                <h3>Customer & Delivery Information (ডেলিভারি ঠিকানা)</h3>
                <p><strong>Name:</strong> ${order.customer.name}</p>
                <p><strong>Phone:</strong> ${order.customer.phone}</p>
                <p><strong>Email:</strong> ${order.customer.email || 'N/A'}</p>
                <p><strong>District:</strong> ${order.customer.district || 'N/A'}</p>
                <p><strong>Address:</strong> ${cleanAddress}</p>
              </div>
            </div>

            <table class="items">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th style="text-align: center; width: 60px;">Qty</th>
                  <th style="text-align: right; width: 95px;">Unit Price</th>
                  <th style="text-align: right; width: 105px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals-wrap">
              <div class="totals">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <strong>৳${order.subtotal.toFixed(2)}</strong>
                </div>
                ${order.discount > 0 ? `
                  <div class="total-row" style="color: #16a34a;">
                    <span>Discount:</span>
                    <strong>- ৳${order.discount.toFixed(2)}</strong>
                  </div>
                ` : ''}
                <div class="total-row">
                  <span>Delivery Charge:</span>
                  <strong>৳${order.shippingCharge.toFixed(2)}</strong>
                </div>
                <div class="total-row grand-total">
                  <span>Total Payable:</span>
                  <span>৳${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <div class="sys-badge">সিস্টেম জেনারেটেড ভাউচার • System Generated Voucher</div>
              <p style="font-size: 10px; color: #6b7280; margin: 2px 0 0 0;">Thank you for shopping with Trendy Cart BD! No signature is required.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  if (window.frameElement && window.frameElement.parentNode) {
                    window.frameElement.parentNode.removeChild(window.frameElement);
                  }
                }, 1000);
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  }
};
