import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import * as whatsappService from '@/lib/whatsappService';
import {
    DEFAULT_FURNITURE_DELIVERED_TEMPLATE,
    DEFAULT_FURNITURE_SHIPPED_TEMPLATE
} from '@/lib/whatsappTemplates';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const pool = await getPool();
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // Fetch order to get customer phone and name and order_number
    const [orderRows] = await pool.query('SELECT order_number, customer_name, customer_phone FROM orders WHERE id = ?', [id]);
    
    if (orderRows.length > 0 && orderRows[0].customer_phone) {
        const customer_phone = orderRows[0].customer_phone;
        const customer_name = orderRows[0].customer_name || '';
        const order_number = orderRows[0].order_number || id;
        const infoParts = customer_name.split('|').map(p => p.trim());
        const cName = infoParts[0] || customer_name;
        const firstName = cName.trim().split(' ')[0] || '';

        console.log(`[StatusUpdate] Order ${id} (${order_number}) updated to ${status}. Customer Phone: ${customer_phone}`);

        const waStatus = whatsappService.getCachedStatus();
        console.log(`[StatusUpdate] WhatsApp Status is: ${waStatus.status}`);
        
        if (waStatus.status !== 'DISABLED') {
            const [settingsRows] = await pool.query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('wa_template_shipped', 'wa_template_delivered')");
            let shippedTemplate = DEFAULT_FURNITURE_SHIPPED_TEMPLATE;
            let deliveredTemplate = DEFAULT_FURNITURE_DELIVERED_TEMPLATE;
            
            settingsRows.forEach(row => {
                if (row.setting_key === 'wa_template_shipped') shippedTemplate = row.setting_value;
                if (row.setting_key === 'wa_template_delivered') deliveredTemplate = row.setting_value;
            });

            let templateToUse = '';
            if (status.includes('شحن')) {
                templateToUse = shippedTemplate;
                console.log(`[StatusUpdate] Selected SHIPPED template`);
            } else if (status.includes('توصيل') || status.includes('مكتمل') || status.includes('استلام')) {
                templateToUse = deliveredTemplate;
                console.log(`[StatusUpdate] Selected DELIVERED template`);
            } else {
                console.log(`[StatusUpdate] Status '${status}' did not match any templates (شحن, توصيل, مكتمل, استلام)`);
            }

            if (templateToUse) {
                const message = templateToUse
                    .replace(/{order_id}/g, order_number)
                    .replace(/{order_number}/g, order_number)
                    .replace(/{customer_first_name}/g, firstName)
                    .replace(/{customer_full_name}/g, cName);
                
                console.log(`[StatusUpdate] Queuing message to ${customer_phone}...`);
                whatsappService.queueMessage(customer_phone, message, null, { dedupeKey: `order-status-${id}` }).catch(err => {
                  console.error('[StatusUpdate] Failed to queue status update WhatsApp message:', err);
                });
            }
        } else {
            console.log(`[StatusUpdate] Message skipped because WhatsApp auth failed.`);
        }
    } else {
        console.log(`[StatusUpdate] Order ${id} has no customer phone number. Message skipped.`);
    }

    return NextResponse.json({ message: 'Order status updated' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
