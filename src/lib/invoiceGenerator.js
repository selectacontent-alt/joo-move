import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { getPuppeteerLaunchOptions } from './puppeteerConfig';

export async function generateInvoiceImage(orderId, customerName, customerPhone, total, productsArr, notes = '', customerAddress = '') {
    const previousInvoiceJob = global.invoiceGenerationChain || Promise.resolve();
    const invoiceJob = previousInvoiceJob.then(
        () => generateInvoiceImageNow(orderId, customerName, customerPhone, total, productsArr, notes, customerAddress),
        () => generateInvoiceImageNow(orderId, customerName, customerPhone, total, productsArr, notes, customerAddress)
    );
    global.invoiceGenerationChain = invoiceJob.catch(() => {});
    return invoiceJob;
}

async function generateInvoiceImageNow(orderId, customerName, customerPhone, total, productsArr, notes = '', customerAddress = '') {
    let browser;
    let isSharedBrowser = false;
    try {
        console.log(`[Invoice] Generating invoice for order ${orderId}...`);
        
        if (global.whatsappState && global.whatsappState.client && global.whatsappState.client.pupBrowser) {
            try {
                if (global.whatsappState.client.pupBrowser.isConnected()) {
                    browser = global.whatsappState.client.pupBrowser;
                    isSharedBrowser = true;
                    console.log(`[Invoice] Reusing WhatsApp browser instance to save memory...`);
                }
            } catch(e) {}
        }
        
        if (!isSharedBrowser) {
            console.log(`[Invoice] Launching new browser instance...`);
            browser = await puppeteer.launch(getPuppeteerLaunchOptions());
        }

        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 1000, deviceScaleFactor: 2 });

        let productsHtml = '';
        let productsSubtotal = 0;
        if (Array.isArray(productsArr)) {
            productsArr.forEach(p => {
                const qty = Number(p.quantity) || 0;
                const price = Number(p.price) || 0;
                productsSubtotal += qty * price;
                productsHtml += `
                <tr>
                    <td>
                        <div class="prod-title">${p.name || p.title || 'منتج'}</div>
                        ${p.variantName ? `<div class="prod-variant">${p.variantLabel || p.variantName}</div>` : ''}
                    </td>
                    <td class="qty">${qty}</td>
                    <td class="price">${price} ج.م</td>
                </tr>`;
            });
        }

        const numericTotal = Number(total) || 0;
        const shippingFees = Math.max(0, numericTotal - productsSubtotal);
        
        const formatMoney = (val) => Number.isInteger(Number(val)) ? Number(val) : Number(val).toFixed(2);

        let governorate = '';
        let city = '';
        let addressDetails = '';
        
        if (customerAddress) {
            const cleanedAddress = customerAddress.replace(/\|/g, '-');
            const addrParts = cleanedAddress.split('-').map(p => p.trim()).filter(Boolean);
            if (addrParts.length === 1) {
                addressDetails = addrParts[0];
            } else if (addrParts.length === 2) {
                governorate = addrParts[0];
                addressDetails = addrParts[1];
            } else if (addrParts.length >= 3) {
                governorate = addrParts[0];
                city = addrParts[1];
                addressDetails = addrParts.slice(2).join(' - ');
            }
        }

        let logoBase64 = '';
        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
                const logoData = fs.readFileSync(logoPath);
                logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
            }
        } catch(e) {}

        const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                body { 
                    font-family: 'Cairo', sans-serif; 
                    margin: 0; 
                    padding: 0; 
                    background: white; 
                }
                .invoice-wrapper { 
                    width: 750px; 
                    background: white; 
                    padding: 40px; 
                    box-sizing: border-box; 
                }
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start; 
                    border-bottom: 3px solid #ea580c; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px; 
                }
                .header-left {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }
                .header-logo {
                    height: 100px;
                    margin-bottom: 10px;
                }
                .header-logo img { 
                    max-height: 100%; 
                    object-fit: contain;
                    filter: brightness(0);
                }
                .header-left h1 { 
                    margin: 0; 
                    font-size: 26px; 
                    font-weight: 900; 
                    color: #0f172a; 
                }
                .header-right {
                    text-align: left;
                    direction: ltr;
                    padding-top: 10px;
                }
                .header-right h2 {
                    font-size: 28px;
                    font-weight: 900;
                    color: #cbd5e1;
                    margin: 0 0 10px 0;
                    text-transform: uppercase;
                }
                .header-right p.order-id {
                    margin: 0;
                    font-size: 20px;
                    color: #475569;
                    font-weight: 800;
                }
                .header-right p.date {
                    margin: 5px 0 0 0;
                    font-size: 16px;
                    color: #94a3b8;
                    font-weight: 600;
                }
                
                .customer-info { 
                    background: #f8fafc; 
                    padding: 25px; 
                    border-radius: 12px; 
                    margin-bottom: 30px; 
                    border: 1px solid #e2e8f0;
                }
                .customer-info-title {
                    font-size: 18px;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0 0 15px 0;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 10px;
                    display: inline-block;
                }
                .customer-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                .customer-item p.label {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0 0 5px 0;
                }
                .customer-item p.value {
                    font-weight: 800;
                    color: #0f172a;
                    font-size: 18px;
                    margin: 0;
                }
                
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 30px; 
                }
                th { 
                    padding: 15px 10px; 
                    text-align: right; 
                    border-bottom: 2px solid #0f172a; 
                    color: #0f172a; 
                    font-size: 16px; 
                    font-weight: 900;
                }
                th.center { text-align: center; }
                th.left { text-align: left; }
                
                td { 
                    padding: 15px 10px; 
                    border-bottom: 1px solid #e2e8f0; 
                }
                td .prod-title {
                    font-weight: 800;
                    color: #1e293b;
                    font-size: 17px;
                }
                td .prod-variant {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 5px;
                    font-weight: 600;
                }
                td.qty {
                    text-align: center;
                    font-weight: 800;
                    color: #334155;
                    font-size: 18px;
                }
                td.price {
                    text-align: left;
                    font-weight: 800;
                    color: #334155;
                    font-size: 18px;
                    direction: ltr;
                }
                
                .totals-box { 
                    width: 100%;
                    max-width: 350px;
                    margin-left: 0;
                    margin-right: auto;
                    background: #f8fafc;
                    padding: 25px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                .totals-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    font-size: 16px;
                    color: #475569;
                    font-weight: 700;
                }
                .totals-row.border-bottom {
                    border-bottom: 1px solid #cbd5e1;
                    padding-bottom: 15px;
                }
                .totals-row span.val {
                    direction: ltr;
                }
                .grand-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 24px;
                    font-weight: 900;
                    color: #0f172a;
                    margin-top: 10px;
                }
                .grand-total span.val {
                    color: #ea580c;
                    direction: ltr;
                }
            </style>
        </head>
        <body>
            <div class="invoice-wrapper">
                <div class="header">
                    <div class="header-left">
                        ${logoBase64 ? `
                        <div class="header-logo">
                            <img src="${logoBase64}" alt="Logo" />
                        </div>
                        ` : ''}
                        <h1>الرحاب - Al Rehab</h1>
                    </div>
                    <div class="header-right">
                        <h2>INVOICE</h2>
                        <p class="order-id">#${orderId}</p>
                        <p class="date">${new Date().toLocaleDateString('en-US')}</p>
                    </div>
                </div>
                
                <div class="customer-info">
                    <h3 class="customer-info-title">بيانات العميل</h3>
                    <div class="customer-grid">
                        <div class="customer-item">
                            <p class="label">الاسم</p>
                            <p class="value">${customerName}</p>
                        </div>
                        <div class="customer-item">
                            <p class="label">رقم الهاتف</p>
                            <p class="value" dir="ltr">${customerPhone || 'غير متوفر'}</p>
                        </div>
                        ${governorate || city ? `
                        <div class="customer-item" style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p class="label">المحافظة</p>
                            <p class="value" style="font-size: 16px;">${governorate || '-'}</p>
                        </div>
                        <div class="customer-item" style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p class="label">المدينة</p>
                            <p class="value" style="font-size: 16px;">${city || '-'}</p>
                        </div>
                        ` : ''}
                        ${addressDetails ? `
                        <div class="customer-item" style="grid-column: 1 / -1; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p class="label">العنوان بالتفصيل</p>
                            <p class="value" style="font-size: 16px; line-height: 1.5; white-space: pre-wrap;">${addressDetails}</p>
                        </div>
                        ` : ''}
                        ${notes ? `
                        <div class="customer-item" style="grid-column: 1 / -1; background: #fff; padding: 15px; border-radius: 8px; border: 2px dashed #0f172a;">
                            <p class="label" style="font-weight: bold; color: #000;">ملاحظات العميل / Notes</p>
                            <p class="value" style="font-size: 18px; line-height: 1.6; white-space: pre-wrap; color: #ea580c;">${notes}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 60%">المنتج</th>
                            <th class="center" style="width: 20%">الكمية</th>
                            <th class="left" style="width: 20%">السعر</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productsHtml}
                    </tbody>
                </table>
                
                <div class="totals-box">
                    <div class="totals-row">
                        <span>إجمالي المنتجات</span>
                        <span class="val">${formatMoney(productsSubtotal)} ج.م</span>
                    </div>
                    <div class="totals-row border-bottom">
                        <span>مصاريف الشحن</span>
                        <span class="val">${formatMoney(shippingFees)} ج.م</span>
                    </div>
                    <div class="grand-total">
                        <span>الإجمالي النهائي</span>
                        <span class="val">${formatMoney(numericTotal)} ج.م</span>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: ['load', 'networkidle0'] });
        await page.evaluateHandle('document.fonts.ready');
        await new Promise(r => setTimeout(r, 1000));
        
        const wrapperElement = await page.$('.invoice-wrapper');
        
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)){
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const fileName = `invoice_${orderId}_${Date.now()}.png`;
        const filePath = path.join(uploadsDir, fileName);
        
        try {
            if (wrapperElement) {
                await wrapperElement.screenshot({ path: filePath });
            } else {
                throw new Error("No wrapper element");
            }
        } catch (screenshotErr) {
            await page.screenshot({ path: filePath, fullPage: true });
        }
        try { await page.close(); } catch(e) {} 
        if (!isSharedBrowser) { try { await browser.close(); } catch(e) {} }
        
        console.log(`[Invoice] Invoice generated for order ${orderId}: ${filePath}`);
        return `/uploads/${fileName}`;
    } catch (err) {
        console.error('Error generating invoice image:', err);
        if (browser && !isSharedBrowser) { try { await browser.close(); } catch(e) {} }
        return null;
    }
}
