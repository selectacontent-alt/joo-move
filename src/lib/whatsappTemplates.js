export const LEGACY_ORDER_CONFIRMATION_TEMPLATE =
  'مرحباً، تم استلام طلبك بنجاح. رقم الطلب: {order_id} والإجمالي: {total} ج.م';

export const DEFAULT_ORDER_CONFIRMATION_TEMPLATE = [
  'مرحباً، ا/ {customer_first_name}',
  'تم استلام طلبك رقم {order_id} بنجاح.',
  '🕒 {date_time}',
  '',
  'الإسم: {customer_full_name}',
  'المحافظة: {governorate}',
  'العنوان: {address}',
  'التليفون: {phones}',
  '',
  'تفاصيل المنتج:',
  '{products}',
  '',
  'السعر: {subtotal}',
  'الشحن: {shipping}',
  'الاجمالي: {total}'
].join('\n');

export const DEFAULT_BOOKING_CONFIRMATION_TEMPLATE = [
  '🌿 *الرحاب للتوريدات الزراعية*',
  '━━━━━━━━━━━━━━━━',
  '✅ *تم استلام طلب تجهيزك بنجاح*',
  '',
  'أهلاً أ/ *{customer_name}* 👋',
  'رقم الطلب: *#{order_id}*',
  'التاريخ: {date_time}',
  '',
  '📋 *تفاصيل الطلب*',
  '• الوحدة: {unit}',
  '• الكمية المطلوبة: {quantity} {unit}',
  '• إجمالي القراريط: {total_qirat} قيراط',
  '• إجمالي الصواني: {total_trays} صينية',
  '• سعر الصينية: {price_per_tray} ج.م',
  '',
  '💰 *إجمالي الطلب: {total} ج.م*',
  '🚚 الشحن: *مجاني*',
  '',
  '📍 *بيانات التواصل*',
  '• الهاتف: {phone}',
  '• العنوان: {address}',
  '{notes_line}',
  '',
  'سيتم التواصل معك قريباً لتأكيد موعد التجهيز والتسليم.',
  'شكرًا لثقتك في *الرحاب* 💚'
].join('\n');
