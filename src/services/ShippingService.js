import { getPool } from '../lib/db';
import { getBostaCityCode } from '../utils/egyptCityMapping';

class ShippingService {
  async dispatchOrderToCourier(orderId, provider = 'Bosta') {
    const pool = await getPool();
    
    const [settingsRows] = await pool.query("SELECT * FROM settings WHERE setting_key IN ('bosta_enabled', 'bosta_api_key', 'aramex_enabled', 'aramex_api_key', 'aramex_account_pin')");
    let isBostaEnabled = false;
    let bostaApiKey = process.env.BOSTA_API_KEY || '';
    let isAramexEnabled = false;
    let aramexApiKey = process.env.ARAMEX_API_KEY || '';
    let aramexAccountPin = '';
    
    settingsRows.forEach(row => {
      if (row.setting_key === 'bosta_enabled') isBostaEnabled = row.setting_value === 'true';
      if (row.setting_key === 'bosta_api_key' && row.setting_value) bostaApiKey = row.setting_value;
      if (row.setting_key === 'aramex_enabled') isAramexEnabled = row.setting_value === 'true';
      if (row.setting_key === 'aramex_api_key' && row.setting_value) aramexApiKey = row.setting_value;
      if (row.setting_key === 'aramex_account_pin' && row.setting_value) aramexAccountPin = row.setting_value;
    });

    if (provider === 'Bosta') {
      if (!isBostaEnabled) throw new Error('shippingDisabledMsg');
      if (!bostaApiKey) throw new Error('مفتاح بوسطة (API Key) مفقود. يرجى إضافته في إعدادات (Select Market).');
    } else if (provider === 'Aramex') {
      if (!isAramexEnabled) throw new Error('shippingDisabledMsg');
      if (!aramexApiKey) throw new Error('مفتاح أرامكس (API Key) مفقود. يرجى إضافته في إعدادات (Select Market).');
    } else {
      throw new Error('شركة الشحن غير مدعومة.');
    }

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) throw new Error('Order not found');
    const order = orders[0];

    if (order.tracking_number) {
      throw new Error(`Order is already dispatched. AWB: ${order.tracking_number}`);
    }

    const customerName = order.customer_name || 'Unknown Customer';
    const customerPhone = order.customer_phone || '01000000000';
    let addressString = 'Cairo, Egypt';
    let governorate = 'القاهرة';

    try {
        let products = JSON.parse(order.products);
        let shippingItem = products.find(p => p.id === 'shipping');
        if (shippingItem) {
            governorate = shippingItem.title.replace('شحن - ', '').trim();
            addressString = governorate + ', Egypt';
        }
    } catch(e){}

    let trackingNumber = '';
    let labelUrl = '';

    if (provider === 'Bosta') {
      const cityCode = getBostaCityCode(governorate);
      // Mock Bosta API call
      trackingNumber = 'BST-' + Math.floor(Math.random() * 1000000000);
      const _id = 'bosta_' + trackingNumber;
      labelUrl = `https://app.bosta.co/api/v0/deliveries/awb/${_id}`;
    } else if (provider === 'Aramex') {
      // Mock Aramex API call
      trackingNumber = 'ARX-' + Math.floor(Math.random() * 1000000000);
      labelUrl = `https://www.aramex.com/express/track-results?ShipmentNumber=${trackingNumber}`;
    }

    // Update Database
    await pool.query(
      `UPDATE orders 
       SET shipping_provider = ?, tracking_number = ?, shipping_label_url = ?, shipping_status = ? 
       WHERE id = ?`,
      [provider, trackingNumber, labelUrl, 'Dispatched', orderId]
    );

    return {
      success: true,
      trackingNumber,
      labelUrl,
      provider
    };
  }
}

export default new ShippingService();
