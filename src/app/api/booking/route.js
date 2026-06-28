import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import * as whatsappService from '@/lib/whatsappService';
import { DEFAULT_BOOKING_CONFIRMATION_TEMPLATE } from '@/lib/whatsappTemplates';
import { repairArabicMojibake } from '@/lib/textEncoding';

export const dynamic = 'force-dynamic';

const fillTemplate = (template, values) => Object.entries(values).reduce(
  (message, [key, value]) => message.split(`{${key}}`).join(String(value ?? '')),
  template
);

const formatArabicNumber = (value) => Number(value || 0).toLocaleString('ar-EG');

const buildCustomerServiceBookingMessage = ({
  orderNumber,
  customer_name,
  customer_phone,
  alt_phone,
  governorate,
  customer_address,
  notes,
  unitLabel,
  quantity,
  totalQirat,
  totalTrays,
  pricePerTray,
  totalPrice,
  dateTime
}) => [
  '*طلب تجهيز زراعي جديد*',
  '━━━━━━━━━━━━━━━━',
  `نوع الطلب: تجهيز شتلات بونيكام`,
  `رقم الطلب: *#${orderNumber}*`,
  `وقت الطلب: ${dateTime}`,
  '',
  '*بيانات العميل*',
  `الاسم: ${customer_name}`,
  `الهاتف الأساسي: ${customer_phone}`,
  alt_phone ? `هاتف احتياطي: ${alt_phone}` : '',
  `المحافظة: ${governorate}`,
  `المركز/المدينة: ${customer_address}`,
  `العنوان بالتفصيل: ${notes}`,
  '',
  '*تفاصيل التجهيز*',
  `نوع الوحدة: ${unitLabel}`,
  `الكمية المطلوبة: ${formatArabicNumber(quantity)} ${unitLabel}`,
  `إجمالي القراريط: ${formatArabicNumber(totalQirat)} قيراط`,
  `إجمالي الصواني: ${formatArabicNumber(totalTrays)} صينية`,
  `سعر الصينية: ${formatArabicNumber(pricePerTray)} ج.م`,
  `الإجمالي: *${formatArabicNumber(totalPrice)} ج.م*`
].filter(Boolean).join('\n');

// GET: Fetch booking settings + gallery images
export async function GET() {
  try {
    const pool = await getPool();
    
    const [settingsRows] = await pool.query(
      `SELECT setting_key, setting_value FROM settings
       WHERE setting_key IN (
        'booking_price_per_tray',
        'booking_trays_per_qirat',
        'booking_gallery_images',
        'booking_notes',
        'booking_seo_image_1',
        'booking_seo_image_2',
        'booking_seo_image_3',
        'booking_seo_image_4',
        'booking_seo_image_5'
       )`
    );
    
    const settings = {};
    settingsRows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return NextResponse.json({
      pricePerTray: Number(settings.booking_price_per_tray) || 120,
      traysPerQirat: Number(settings.booking_trays_per_qirat) || 6,
      qiratPerFeddan: 22,
      galleryImages: (() => {
        try { return JSON.parse(settings.booking_gallery_images || '[]'); } catch { return []; }
      })(),
      notes: settings.booking_notes || '',
      seoImages: {
        card1: settings.booking_seo_image_1 || '',
        card2: settings.booking_seo_image_2 || '',
        card3: settings.booking_seo_image_3 || '',
        card4: settings.booking_seo_image_4 || '',
        card5: settings.booking_seo_image_5 || ''
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new booking order
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, alt_phone, governorate, customer_address, unit_type, quantity, notes } = body;
    
    if (!customer_name || !customer_phone || !governorate || !customer_address || !notes || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'بيانات ناقصة - يرجى ملء جميع الحقول المطلوبة' }, { status: 400 });
    }

    const pool = await getPool();
    
    // Fetch current pricing
    const [settingsRows] = await pool.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('booking_price_per_tray', 'booking_trays_per_qirat', 'wa_template_booking_order', 'admin_whatsapp')"
    );
    const cfg = {};
    settingsRows.forEach(row => { cfg[row.setting_key] = row.setting_value; });
    
    const pricePerTray = Number(cfg.booking_price_per_tray) || 120;
    const traysPerQirat = Number(cfg.booking_trays_per_qirat) || 6;
    const qiratPerFeddan = 22;
    
    // Calculate
    const numericQuantity = Number(quantity) || 0;
    const totalQirat = Math.ceil(unit_type === 'feddan' ? numericQuantity * qiratPerFeddan : numericQuantity);
    const totalTrays = Math.ceil(totalQirat * traysPerQirat);
    const totalPrice = totalTrays * pricePerTray;
    
    // Generate unique order number
    let orderNumber;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      orderNumber = 'B-' + Math.floor(10000000 + Math.random() * 90000000).toString();
      const [existing] = await pool.query('SELECT id FROM orders WHERE order_number = ?', [orderNumber]);
      if (existing.length === 0) isUnique = true;
      attempts++;
    }
    if (!isUnique) throw new Error('Failed to generate a unique order number');

    // Build full customer_name field with all info
    const fullCustomerName = [
      customer_name,
      customer_phone,
      alt_phone ? `احتياطي: ${alt_phone}` : '',
      `محافظة: ${governorate}`,
      customer_address ? `المركز/المدينة: ${customer_address}` : '',
      notes ? `العنوان بالتفصيل: ${notes}` : ''
    ].filter(Boolean).join(' | ');
    
    // Build booking details JSON
    const bookingDetails = JSON.stringify({
      type: 'booking',
      unit_type,
      quantity,
      totalQirat,
      totalTrays,
      pricePerTray,
      traysPerQirat
    });

    const [result] = await pool.query(
      'INSERT INTO orders (order_number, customer_name, customer_phone, total, products) VALUES (?, ?, ?, ?, ?)',
      [orderNumber, fullCustomerName, customer_phone, totalPrice, bookingDetails]
    );

    const unitLabel = unit_type === 'feddan' ? 'فدان' : 'قيراط';
    const dateTime = new Intl.DateTimeFormat('ar-EG', {
      timeZone: 'Africa/Cairo',
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date());
    const bookingTemplate = repairArabicMojibake(cfg.wa_template_booking_order || DEFAULT_BOOKING_CONFIRMATION_TEMPLATE);
    const templateValues = {
      customer_name,
      order_id: orderNumber,
      date_time: dateTime,
      unit: unitLabel,
      quantity: Number(quantity).toLocaleString('ar-EG'),
      total_qirat: Number(totalQirat).toLocaleString('ar-EG'),
      total_trays: Number(totalTrays).toLocaleString('ar-EG'),
      price_per_tray: Number(pricePerTray).toLocaleString('ar-EG'),
      total: Number(totalPrice).toLocaleString('ar-EG'),
      phone: customer_phone,
      address: `${governorate} - ${customer_address} - ${notes}`,
      notes_line: ''
    };

    try {
      if (whatsappService.getCachedStatus().status !== 'DISABLED') {
        const customerMessage = fillTemplate(bookingTemplate, templateValues).replace(/\n{3,}/g, '\n\n').trim();
        await whatsappService.queueMessage(customer_phone, customerMessage, null, {
          dedupeKey: `booking-customer-${orderNumber}`
        });

        if (cfg.admin_whatsapp) {
          const adminMessage = buildCustomerServiceBookingMessage({
            orderNumber,
            customer_name,
            customer_phone,
            alt_phone,
            governorate,
            customer_address,
            notes,
            unitLabel,
            quantity,
            totalQirat,
            totalTrays,
            pricePerTray,
            totalPrice,
            dateTime
          });
          await whatsappService.queueMessage(cfg.admin_whatsapp, adminMessage, null, {
            dedupeKey: `booking-admin-${orderNumber}`
          });
        }
      }
    } catch (whatsappError) {
      console.error('[Booking] Failed to queue WhatsApp confirmation:', whatsappError);
    }

    return NextResponse.json({
      orderNumber,
      totalQirat,
      totalTrays,
      totalPrice,
      message: 'تم إنشاء الطلب بنجاح'
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
