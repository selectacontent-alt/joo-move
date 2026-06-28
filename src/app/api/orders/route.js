import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import * as whatsappService from '@/lib/whatsappService';
import {
  DEFAULT_BOOKING_CONFIRMATION_TEMPLATE,
  LEGACY_ORDER_CONFIRMATION_TEMPLATE
} from '@/lib/whatsappTemplates';
import { repairArabicMojibake } from '@/lib/textEncoding';
import { cleanCustomerProfile, decodeCustomerToken, toPublicCustomer } from '@/lib/customerAuthToken';

export const dynamic = 'force-dynamic';

function splitCustomerInfo(customerName) {
  const infoParts = String(customerName || '').split('|').map(part => part.trim()).filter(Boolean);
  const fullName = infoParts[0] || '';
  const phonePart = infoParts[1] || '';
  const addressPart = infoParts.slice(2).join(' | ');
  const addressParts = addressPart.split(' - ').map(part => part.trim()).filter(Boolean);
  const governorate = addressParts[0] || '';
  const address = addressParts.length > 1 ? addressParts.slice(1).join(' - ') : addressPart;

  return { fullName, phonePart, governorate, address };
}

function getFirstName(fullName) {
  return String(fullName || '').trim().split(/\s+/)[0] || '';
}

function getPhoneNumbers(customerPhone, phonePart) {
  const phones = new Set();
  const addPhone = (value) => {
    const normalized = String(value || '').replace(/[^\d+]/g, '');
    if (normalized) phones.add(normalized);
  };

  addPhone(customerPhone);
  String(phonePart || '').match(/01[0125]\d{8}/g)?.forEach(addPhone);

  return Array.from(phones).join(' , ');
}

function splitVariant(product) {
  const variant = String(product?.variantLabel || product?.variantName || '').trim();
  if (!variant) return { color: '-', size: '-' };

  const parts = variant.split(/\s+-\s+/).map(part => part.trim()).filter(Boolean);
  return {
    color: parts[0] || '-',
    size: parts.slice(1).join(' - ') || '-'
  };
}

function getProductsSubtotal(products = []) {
  return products.reduce((sum, product) => {
    const quantity = Number(product?.quantity) || 0;
    const price = Number(product?.price) || 0;
    return sum + (quantity * price);
  }, 0);
}

function formatMoney(value) {
  const numericValue = Number(value) || 0;
  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2);
}

function formatArabicNumber(value) {
  return Number(value || 0).toLocaleString('ar-EG');
}

function applyTemplate(template, variables) {
  return String(template || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : match
  ));
}

function buildOrderConfirmationMessage({ orderNumber, customerName, customerPhone, total, products, template }) {
  const safeProducts = Array.isArray(products) ? products : [];
  const bookingPayload = !Array.isArray(products) && products && typeof products === 'object' && products.type === 'booking'
    ? products
    : null;
  const { fullName, phonePart, governorate, address } = splitCustomerInfo(customerName);
  const subtotal = getProductsSubtotal(safeProducts);
  const shipping = Math.max(0, (Number(total) || 0) - subtotal);
  const dateTime = new Date().toLocaleString('ar-EG', {
    dateStyle: 'short',
    timeStyle: 'medium',
    hour12: true
  });

  let totalQirat = Number(bookingPayload?.totalQirat) || 0;
  let totalTrays = Number(bookingPayload?.totalTrays) || 0;
  const bookingPricePerTray = bookingPayload?.pricePerTray
    || (bookingPayload?.pricePerQirat && bookingPayload?.traysPerQirat
      ? Number(bookingPayload.pricePerQirat) / Number(bookingPayload.traysPerQirat)
      : '');

  const productsLines = bookingPayload
    ? [
      `تجهيز شتلات بونيكام`,
      `الوحدة: ${bookingPayload.unit_type === 'feddan' ? 'فدان' : 'قيراط'}`,
      `الكمية المطلوبة: ${formatArabicNumber(bookingPayload.quantity)}`,
      `إجمالي القراريط: ${formatArabicNumber(totalQirat)}`,
      `إجمالي الصواني: ${formatArabicNumber(totalTrays)}`
    ].join('\n')
    : safeProducts.length
    ? safeProducts.map(product => {
      const qirat = product.quantity || 1;
      const trays = product.trays_per_qirat ? (product.trays_per_qirat * qirat) : (qirat * 6);
      totalQirat += qirat;
      totalTrays += trays;
      return `تجهيز مساحة ${qirat} قيراط - (${trays} صواني) - السعر ${formatMoney(product.price)}`;
    }).join('\n')
    : 'لا توجد منتجات';

  return applyTemplate(String(template || '').trim() || DEFAULT_BOOKING_CONFIRMATION_TEMPLATE, {
    order_id: orderNumber,
    order_number: orderNumber,
    date_time: dateTime,
    customer_first_name: getFirstName(fullName) || fullName || 'عميلنا',
    customer_full_name: fullName || '-',
    name: fullName || '-',
    governorate: governorate || '-',
    address: address || '-',
    phones: getPhoneNumbers(customerPhone, phonePart) || '-',
    products: productsLines,
    items: productsLines,
    qirat: totalQirat,
    trays: totalTrays,
    unit: bookingPayload?.unit_type === 'feddan' ? 'فدان' : 'قيراط',
    quantity: bookingPayload ? formatArabicNumber(bookingPayload.quantity) : '',
    total_qirat: formatArabicNumber(totalQirat),
    total_trays: formatArabicNumber(totalTrays),
    price_per_tray: bookingPricePerTray ? formatArabicNumber(bookingPricePerTray) : '',
    notes_line: '',
    subtotal: formatMoney(subtotal),
    shipping: formatMoney(shipping),
    total: formatMoney(total)
  });

}

function buildCustomerServiceBookingMessage({ orderNumber, customerName, customerPhone, total, bookingPayload }) {
  const { fullName, phonePart, governorate, address } = splitCustomerInfo(customerName);
  const unitLabel = bookingPayload.unit_type === 'feddan' ? 'فدان' : 'قيراط';
  const pricePerTray = bookingPayload.pricePerTray
    || (bookingPayload.pricePerQirat && bookingPayload.traysPerQirat
      ? Number(bookingPayload.pricePerQirat) / Number(bookingPayload.traysPerQirat)
      : '');
  const dateTime = new Date().toLocaleString('ar-EG', {
    dateStyle: 'short',
    timeStyle: 'medium',
    hour12: true
  });

  return [
    '*طلب تجهيز زراعي جديد*',
    '━━━━━━━━━━━━━━━━',
    'نوع الطلب: تجهيز شتلات بونيكام',
    `رقم الطلب: *#${orderNumber}*`,
    `وقت الطلب: ${dateTime}`,
    '',
    '*بيانات العميل*',
    `الاسم: ${fullName || customerName || '-'}`,
    `الهاتف الأساسي: ${customerPhone || phonePart || 'غير متوفر'}`,
    governorate ? `المحافظة: ${governorate}` : '',
    address ? `العنوان: ${address}` : '',
    '',
    '*تفاصيل التجهيز*',
    `نوع الوحدة: ${unitLabel}`,
    `الكمية المطلوبة: ${formatArabicNumber(bookingPayload.quantity)} ${unitLabel}`,
    `إجمالي القراريط: ${formatArabicNumber(bookingPayload.totalQirat)} قيراط`,
    `إجمالي الصواني: ${formatArabicNumber(bookingPayload.totalTrays)} صينية`,
    pricePerTray ? `سعر الصينية: ${formatArabicNumber(pricePerTray)} ج.م` : '',
    `الإجمالي: *${formatArabicNumber(total)} ج.م*`
  ].filter(Boolean).join('\n');
}

function buildCustomerServiceProductOrderMessage({ orderNumber, customerName, customerPhone, total, products }) {
  const productsList = products.length
    ? products.map(p => `- ${p.title || 'منتج'} (${p.quantity} قطع) ${p.variantName ? `[${p.variantLabel || p.variantName}]` : ''}`).join('\n')
    : 'لا توجد منتجات';

  return [
    `طلب جديد رقم #${orderNumber}`,
    `العميل: ${customerName}`,
    `الإجمالي: ${total} ج.م`,
    `رقم الهاتف: ${customerPhone || 'غير متوفر'}`,
    '',
    'المنتجات:',
    productsList
  ].join('\n');
}

export async function GET() {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { customer_name, customer_phone, total, products, coupon_id, coupon_code, customer_profile } = await request.json();
    const pool = await getPool();
    const decodedCustomer = decodeCustomerToken(request.headers.get('authorization'));
    let customerId = null;
    let updatedCustomer = null;

    if (decodedCustomer) {
      const [customerRows] = await pool.query(
        'SELECT id, email FROM customers WHERE id = ? AND email = ? LIMIT 1',
        [decodedCustomer.id, decodedCustomer.email]
      );
      if (customerRows.length > 0) {
        customerId = customerRows[0].id;
      }
    }

    // Keep checkout creation independent from WhatsApp; queued sends resolve the number later.
    const shouldValidateWhatsappNumberBeforeInsert = false;
    if (shouldValidateWhatsappNumberBeforeInsert && customer_phone) {
      const isWaConnected = whatsappService.getCachedStatus().status === 'CONNECTED';
      if (isWaConnected) {
        const registered = await whatsappService.isRegistered(customer_phone);
        if (registered === false) {
          return NextResponse.json(
            { error: 'الرقم المدخل غير مسجل على واتساب. يرجى إدخال رقم واتساب صحيح لإتمام الطلب.' },
            { status: 400 }
          );
        }
      }
    }

    const productsJson = products ? JSON.stringify(products) : null;

    let orderNumber;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      orderNumber = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8-digit number
      const [existing] = await pool.query('SELECT id FROM orders WHERE order_number = ?', [orderNumber]);
      if (existing.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate a unique order number');
    }

    const [result] = await pool.query(
      'INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, total, products, coupon_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orderNumber, customerId, customer_name, customer_phone || null, total, productsJson, coupon_code || null]
    );

    const orderId = result.insertId;

    if (coupon_id) {
      await pool.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon_id]);
    }

    if (customerId && customer_profile) {
      const profile = cleanCustomerProfile(customer_profile);
      await pool.query(
        `UPDATE customers
         SET name = COALESCE(NULLIF(?, ''), name),
             phone = NULLIF(?, ''),
             alt_phone = NULLIF(?, ''),
             governorate = NULLIF(?, ''),
             city = NULLIF(?, ''),
             address = NULLIF(?, ''),
             apartment = NULLIF(?, ''),
             landmark = NULLIF(?, '')
         WHERE id = ?`,
        [
          profile.name,
          profile.phone,
          profile.alt_phone,
          profile.governorate,
          profile.city,
          profile.address,
          profile.apartment,
          profile.landmark,
          customerId
        ]
      );
      const [updatedRows] = await pool.query(
        `SELECT id, name, email, phone, alt_phone, governorate, city, address, apartment, landmark, created_at, updated_at
         FROM customers
         WHERE id = ?
         LIMIT 1`,
        [customerId]
      );
      updatedCustomer = toPublicCustomer(updatedRows[0]);
    }

    if (products && Array.isArray(products)) {
      for (const p of products) {
        if (p.id && p.quantity) {
          const [prodRows] = await pool.query('SELECT options, stock FROM products WHERE id = ?', [p.id]);
          if (prodRows.length > 0) {
            const prod = prodRows[0];
            let optionsObj = {};
            try { optionsObj = typeof prod.options === 'string' ? JSON.parse(prod.options) : (prod.options || {}); } catch (e) { }

            if (optionsObj.variantStock && p.variantName && optionsObj.variantStock[p.variantName] !== undefined && optionsObj.variantStock[p.variantName] !== '') {
              optionsObj.variantStock[p.variantName] = Math.max(0, Number(optionsObj.variantStock[p.variantName]) - p.quantity);

              let newTotalStock = 0;
              Object.values(optionsObj.variantStock).forEach(val => {
                if (val !== undefined && val !== '') newTotalStock += Number(val);
              });

              await pool.query('UPDATE products SET sales = COALESCE(sales, 0) + ?, options = ?, stock = ? WHERE id = ?', [p.quantity, JSON.stringify(optionsObj), newTotalStock, p.id]);
            } else {
              await pool.query('UPDATE products SET sales = COALESCE(sales, 0) + ?, stock = GREATEST(0, COALESCE(stock, 100) - ?) WHERE id = ?', [p.quantity, p.quantity, p.id]);
            }
          }
        }
      }
    }

    // Trigger WhatsApp notification in the background
    (async () => {
      try {
        console.log('[Background] Starting new order notification for order ID:', orderId);
        const [settingsRows] = await pool.query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('admin_whatsapp', 'wa_template_booking_order')");
        let adminPhone = '';
        let customerTemplate = DEFAULT_BOOKING_CONFIRMATION_TEMPLATE;
        settingsRows.forEach(row => {
          if (row.setting_key === 'admin_whatsapp') adminPhone = row.setting_value;
          if (row.setting_key === 'wa_template_booking_order' && row.setting_value) customerTemplate = repairArabicMojibake(row.setting_value);
        });
        if (!String(customerTemplate || '').trim() || customerTemplate === LEGACY_ORDER_CONFIRMATION_TEMPLATE) {
          customerTemplate = DEFAULT_BOOKING_CONFIRMATION_TEMPLATE;
        }

        const waStatus = whatsappService.getCachedStatus();
        console.log('[Background] WhatsApp Status:', waStatus.status);

        if (waStatus.status !== 'DISABLED') {
          console.log('[Background] WhatsApp notification is queueable. Storing tasks without starting WhatsApp.');
          const infoParts = (customer_name || '').split('|').map(p => p.trim());
          const cName = infoParts[0] || customer_name;
          const safeProducts = Array.isArray(products) ? products : [];
          const bookingPayload = !Array.isArray(products) && products && typeof products === 'object' && products.type === 'booking'
            ? products
            : null;
          let notes = '';
          if ((customer_name || '').includes(' | الملاحظات: ')) {
            notes = (customer_name || '').split(' | الملاحظات: ')[1].trim();
          } else {
            const notesPart = infoParts.find(p => p.includes('الملاحظات:'));
            notes = notesPart ? notesPart.replace('الملاحظات:', '').trim() : '';
          }
          const cAddress = infoParts[2] || '';

          if (customer_phone) {
            console.log('[Background] Queuing order confirmation to customer:', customer_phone);
            const message = buildOrderConfirmationMessage({
              orderNumber,
              customerName: customer_name,
              customerPhone: customer_phone,
              total,
              products,
              template: customerTemplate
            });

            await whatsappService.queueMessage(customer_phone, message);
          }

          if (adminPhone) {
            console.log('[Background] Queuing message to admin:', adminPhone);
            const adminMessage = bookingPayload
              ? buildCustomerServiceBookingMessage({
                orderNumber,
                customerName: customer_name,
                customerPhone: customer_phone,
                total,
                bookingPayload
              })
              : buildCustomerServiceProductOrderMessage({
                orderNumber,
                customerName: customer_name,
                customerPhone: customer_phone,
                total,
                products: safeProducts
              });
            await whatsappService.queueMessage(adminPhone, adminMessage);
          }
          console.log('[Background] All WhatsApp messages queued successfully!');
        } else {
          console.log('[Background] Cannot queue message because WhatsApp status is:', waStatus.status);
        }
      } catch (waErr) {
        console.error('[Background] Error in order WhatsApp notification:', waErr);
      }
    })();

    // Trigger Server-Side Conversions APIs in the background
    (async () => {
      try {
        const [settingsRows] = await pool.query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('meta_pixel_enabled', 'meta_pixel_id', 'meta_access_token', 'meta_test_event_code', 'google_ads_enabled', 'google_tag_id')");

        let config = {
          metaEnabled: false, metaPixelId: '', metaAccessToken: '', metaTestEventCode: '',
          googleEnabled: false, googleTagId: ''
        };

        settingsRows.forEach(row => {
          if (row.setting_key === 'meta_pixel_enabled') config.metaEnabled = row.setting_value === 'true';
          if (row.setting_key === 'meta_pixel_id') config.metaPixelId = row.setting_value;
          if (row.setting_key === 'meta_access_token') config.metaAccessToken = row.setting_value;
          if (row.setting_key === 'meta_test_event_code') config.metaTestEventCode = row.setting_value;
          if (row.setting_key === 'google_ads_enabled') config.googleEnabled = row.setting_value === 'true';
          if (row.setting_key === 'google_tag_id') config.googleTagId = row.setting_value;
        });

        const crypto = require('crypto');
        const hashData = (val) => val ? crypto.createHash('sha256').update(val.toString().trim().toLowerCase()).digest('hex') : undefined;

        let emailStr = '';
        const infoParts = (customer_name || '').split('|').map(p => p.trim());
        const emailPart = infoParts.find(p => p.includes('الايميل:'));
        if (emailPart) emailStr = emailPart.replace('الايميل:', '').trim();

        // 1. Meta Conversions API (CAPI)
        if (config.metaEnabled && config.metaPixelId && config.metaAccessToken) {
          console.log('[Background] Sending Purchase Event to Meta CAPI for Order ID:', orderId);

          let phHash = hashData(customer_phone);
          if (customer_phone && customer_phone.startsWith('01')) {
            phHash = hashData('2' + customer_phone);
          }

          const metaEventData = {
            data: [
              {
                event_name: 'Purchase',
                event_time: Math.floor(Date.now() / 1000),
                event_id: orderId.toString(),
                action_source: 'website',
                user_data: {
                  client_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0',
                  client_user_agent: request.headers.get('user-agent') || '',
                  em: hashData(emailStr),
                  ph: phHash
                },
                custom_data: {
                  currency: 'EGP',
                  value: parseFloat(total),
                  content_ids: Array.isArray(products) ? products.map(p => p.id.toString()) : [],
                  content_type: 'product',
                  order_id: orderId.toString()
                }
              }
            ]
          };

          if (config.metaTestEventCode) metaEventData.test_event_code = config.metaTestEventCode;

          const capiResponse = await fetch(`https://graph.facebook.com/v19.0/${config.metaPixelId}/events?access_token=${config.metaAccessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metaEventData)
          });

          const capiResult = await capiResponse.json();
          console.log('[Background] Meta CAPI Response:', capiResult);
        }

        // 2. Google Ads Server-Side
        if (config.googleEnabled && config.googleTagId) {
          console.log('[Background] Google Ads is enabled. Server-side tracking skipped (Requires Client-ID/GCLID). Client-side Tag will handle it.');
        }

      } catch (trackingErr) {
        console.error('[Background] Error in Server-Side Tracking API:', trackingErr);
      }
    })();

    return NextResponse.json({ id: orderNumber, database_id: orderId, customer: updatedCustomer, message: 'Order created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
