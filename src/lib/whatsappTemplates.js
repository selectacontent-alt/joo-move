export const LEGACY_ORDER_CONFIRMATION_TEMPLATE =
  'مرحباً، تم استلام طلبك بنجاح. رقم الطلب: {order_id} والإجمالي: {total} ج.م';

export const DEFAULT_ORDER_CONFIRMATION_TEMPLATE = [
  '🚚 *Joo Move | نقل وشحن الأثاث*',
  '━━━━━━━━━━━━━━━━',
  '✅ تم استلام طلبك رقم *{order_id}* بنجاح.',
  '🕒 {date_time}',
  '',
  'أهلًا أ/ *{customer_full_name}*',
  '📞 التواصل: {phones}',
  '📍 العنوان: {governorate} - {address}',
  '',
  '📦 *تفاصيل الأثاث والخدمات*',
  '{products}',
  '',
  '💰 قيمة الخدمات: {subtotal}',
  '🚛 تكلفة النقل: {shipping}',
  '💵 الإجمالي: *{total}*',
  '',
  'سيتواصل معك فريق Joo Move لمراجعة تفاصيل الأثاث والمداخل وتأكيد السعر والموعد.'
].join('\n');

export const DEFAULT_BOOKING_CONFIRMATION_TEMPLATE = [
  '🚚 *Joo Move | حجز نقل أثاث*',
  '━━━━━━━━━━━━━━━━',
  '✅ *تم استلام طلب الحجز بنجاح*',
  '',
  'أهلًا أ/ *{customer_name}* 👋',
  'رقم الطلب: *#{order_id}*',
  'التاريخ: {date_time}',
  '',
  '📞 الهاتف: {phone}',
  '📍 عنوان المعاينة أو النقل: {address}',
  '{notes_line}',
  '',
  'فريقنا سيراجع حجم الأثاث والخدمات المطلوبة ويتواصل معك لتأكيد المعاينة والسعر وموعد التنفيذ.',
  'شكرًا لثقتك في *Joo Move*.'
].join('\n');

export const DEFAULT_FURNITURE_SHIPPED_TEMPLATE = [
  '🚛 *Joo Move*',
  'أهلًا أ/ {customer_first_name}،',
  'فريق نقل الأثاث الخاص بطلبك *{order_id}* تحرك وهو في الطريق إليك.',
  'يرجى التأكد من إتاحة المدخل والمصعد أو السلم لاستقبال الفريق.'
].join('\n');

export const DEFAULT_FURNITURE_DELIVERED_TEMPLATE = [
  '✅ *Joo Move*',
  'تم تسليم الأثاث الخاص بطلبك *{order_id}* في الوجهة المحددة.',
  'نتمنى أن تكون تجربة النقل والتغليف والتركيب تمت بالشكل الذي يرضيك. شكرًا لثقتك فينا.'
].join('\n');

export const DEFAULT_MOVE_REQUEST_CUSTOMER_TEMPLATE = [
  '🚚 *Joo Move | تأكيد طلب نقل أثاث*',
  '━━━━━━━━━━━━━━━━',
  'أهلًا أ/ *{customer_name}* 👋',
  'استلمنا طلبك رقم *{request_number}* بنجاح.',
  '🕒 تاريخ التسجيل: {created_at}',
  '',
  '👤 *بيانات التواصل*',
  '• الهاتف: {phone}',
  '• واتساب: {whatsapp}',
  '• هاتف بديل: {alternate_phone}',
  '• نوع النقلة: {move_type}',
  '',
  '📍 *خط النقل*',
  '• من: {origin_governorate} - {origin_area}',
  '• عنوان الاستلام: {origin_address}',
  '• الدور: {origin_floor} | الأسانسير: {origin_elevator}',
  '• إلى: {destination_governorate} - {destination_area}',
  '• عنوان التسليم: {destination_address}',
  '• الدور: {destination_floor} | الأسانسير: {destination_elevator}',
  '• عرض السلم: {stair_width}',
  '• وقوف سيارة النقل: {parking_distance}',
  '',
  '📦 *محتوى النقلة والخدمات*',
  '• عدد الغرف التقريبي: {rooms}',
  '• الأجهزة الكبيرة: {appliances}',
  '• القطع الكبيرة أو الحساسة: {large_items}',
  '• الخدمات المطلوبة: {services}',
  '',
  '📅 *الموعد*',
  '• التاريخ المفضل: {preferred_date}',
  '• الفترة: {preferred_period}',
  '• مرونة الموعد: {flexible_date}',
  '• الصور والفيديوهات: {media_count} ملف',
  '• ملاحظاتك: {notes}',
  '',
  'سيقوم فريقنا بمراجعة التفاصيل والتواصل معك لتأكيد المعاينة والسعر والموعد. إرسال الطلب لا يُعد تأكيدًا نهائيًا للسعر أو التنفيذ.'
].join('\n');

export const DEFAULT_MOVE_REQUEST_ADMIN_TEMPLATE = [
  '🔔 *طلب نقل أثاث جديد | Joo Move*',
  '━━━━━━━━━━━━━━━━',
  'رقم الطلب: *{request_number}*',
  'تاريخ التسجيل: {created_at}',
  '',
  '👤 العميل: *{customer_name}*',
  '• الهاتف: {phone}',
  '• واتساب: {whatsapp}',
  '• هاتف بديل: {alternate_phone}',
  '• نوع النقلة: {move_type}',
  '',
  '📍 *من* {origin_governorate} - {origin_area}',
  'العنوان: {origin_address}',
  'الدور: {origin_floor} | أسانسير: {origin_elevator}',
  '',
  '📍 *إلى* {destination_governorate} - {destination_area}',
  'العنوان: {destination_address}',
  'الدور: {destination_floor} | أسانسير: {destination_elevator}',
  '',
  '🏢 السلم: {stair_width} | وقوف العربية: {parking_distance}',
  '🛏 الغرف: {rooms}',
  '🔌 الأجهزة: {appliances}',
  '🪑 قطع كبيرة أو حساسة: {large_items}',
  '🧰 الخدمات: {services}',
  '',
  '📅 الموعد: {preferred_date} - {preferred_period}',
  'مرن: {flexible_date}',
  '📝 ملاحظات العميل: {notes}',
  '📎 المرفقات: {media_count} ملف',
  '{media_links}'
].join('\n');

export const DEFAULT_MOVE_STATUS_TEMPLATES = {
  received: '✅ أهلًا أ/ {customer_name}، تم استلام طلب نقل الأثاث رقم *{request_number}* وسيقوم فريق Joo Move بمراجعته والتواصل معك.',
  contacting: '📞 أهلًا أ/ {customer_name}، بدأ مسؤول المتابعة مراجعة طلبك *{request_number}* وسنتواصل معك لاستكمال تفاصيل نقل الأثاث.',
  inspection_scheduled: '📅 تم تحديد معاينة طلبك *{request_number}* يوم *{preferred_date}* خلال فترة *{preferred_period}*. يرجى تجهيز تفاصيل الأثاث والمداخل للفريق.',
  quote_sent: '💰 تم تجهيز عرض سعر طلب نقل الأثاث *{request_number}* بقيمة *{quoted_price} ج.م*. السعر والموعد يصبحان مؤكدين بعد موافقتك النهائية.',
  confirmed: '✅ تم تأكيد طلب نقل الأثاث *{request_number}* ليوم *{preferred_date}* خلال فترة *{preferred_period}*. سنرسل لك بيانات الفريق قبل التحرك.',
  team_assigned: '👷 تم تعيين فريق التنفيذ لطلبك *{request_number}*. الفريق: *{assigned_team}*، مسؤول المتابعة: *{assigned_employee}*.',
  on_the_way: '🚛 فريق Joo Move الخاص بطلب *{request_number}* تحرك وهو في الطريق إلى عنوان الاستلام. يرجى إتاحة المدخل والمصعد أو السلم.',
  moving: '📦 بدأ فريقنا تغليف وتحميل ونقل الأثاث الخاص بطلب *{request_number}*. مسؤول المتابعة معك حتى التسليم والتركيب.',
  delivered: '🏠 تم توصيل الأثاث الخاص بطلب *{request_number}* إلى عنوان الوجهة. يرجى مراجعة القطع مع مسؤول الفريق قبل مغادرته.',
  completed: '🎉 تم إتمام طلب نقل الأثاث *{request_number}* بنجاح. شكرًا لاختيارك Joo Move، ونتمنى أن تكون التجربة على توقعاتك.',
  cancelled: 'ℹ️ تم إلغاء طلب نقل الأثاث *{request_number}*. إذا كنت ترغب في تحديد موعد جديد، تواصل مع فريق Joo Move في أي وقت.'
};

const MOVE_TYPE_LABELS = { home: 'نقل منزل', office: 'نقل مكتب أو شركة' };
const STAIR_LABELS = { wide: 'واسع', normal: 'متوسط', narrow: 'ضيق' };
const PARKING_LABELS = { near: 'أمام المدخل', medium: 'على مسافة قصيرة', far: 'بعيد عن المدخل' };
const PERIOD_LABELS = { morning: 'صباحًا', afternoon: 'ظهرًا', evening: 'مساءً' };
const APPLIANCE_LABELS = { fridge: 'ثلاجة', washer: 'غسالة', oven: 'بوتاجاز', ac: 'تكييف', tv: 'شاشة' };
const SERVICE_LABELS = {
  'furniture-moving': 'نقل الأثاث',
  'professional-packing': 'التغليف الاحترافي',
  assembly: 'فك وتركيب الأثاث',
  loading: 'الرفع والتنزيل',
  'home-office': 'نقل المنازل والمكاتب'
};

const parseArray = (value) => {
  if (Array.isArray(value)) return value;
  try { return value ? JSON.parse(value) : []; } catch { return []; }
};

const show = (value, fallback = 'غير مذكور') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

const formatDateTime = (value) => {
  if (!value) return 'غير محدد';
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return show(value, 'غير محدد');
  }
};

const formatDate = (value) => {
  if (!value) return 'غير محدد';
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: 'Africa/Cairo', year: 'numeric', month: 'long', day: 'numeric'
    }).format(new Date(value));
  } catch {
    return show(value, 'غير محدد');
  }
};

export function applyWhatsAppTemplate(template, values) {
  return String(template || '').replace(/\{([a-z0-9_]+)\}/gi, (_, key) => show(values[key], 'غير مذكور'));
}

export function buildMoveRequestTemplateValues(request, options = {}) {
  const appliances = parseArray(request.appliances);
  const services = parseArray(request.services);
  const serviceNames = options.serviceNames || {};
  const mediaUrls = options.mediaUrls || parseArray(request.media).map((item) => item?.url || item?.media_url).filter(Boolean);
  const mediaLinks = mediaUrls.length
    ? mediaUrls.map((url, index) => `${index + 1}. ${url}`).join('\n')
    : 'لا توجد مرفقات';

  return {
    request_number: show(request.request_number || request.requestNumber),
    order_id: show(request.request_number || request.requestNumber),
    customer_name: show(request.customer_name),
    customer_first_name: show(request.customer_name).split(/\s+/)[0],
    phone: show(request.phone),
    whatsapp: show(request.whatsapp || request.phone),
    alternate_phone: show(request.alternate_phone),
    move_type: MOVE_TYPE_LABELS[request.move_type] || show(request.move_type),
    origin_governorate: show(request.origin_governorate),
    origin_area: show(request.origin_area),
    origin_address: show(request.origin_address),
    origin_floor: show(request.origin_floor, 'أرضي أو غير محدد'),
    origin_elevator: request.origin_elevator ? 'موجود' : 'غير موجود',
    destination_governorate: show(request.destination_governorate),
    destination_area: show(request.destination_area),
    destination_address: show(request.destination_address),
    destination_floor: show(request.destination_floor, 'أرضي أو غير محدد'),
    destination_elevator: request.destination_elevator ? 'موجود' : 'غير موجود',
    stair_width: STAIR_LABELS[request.stair_width] || show(request.stair_width),
    parking_distance: PARKING_LABELS[request.parking_distance] || show(request.parking_distance),
    rooms: show(request.rooms),
    appliances: appliances.length ? appliances.map((item) => APPLIANCE_LABELS[item] || item).join('، ') : 'لا توجد أجهزة محددة',
    large_items: show(request.large_items, 'لا توجد قطع مذكورة'),
    services: services.length ? services.map((item) => serviceNames[item] || SERVICE_LABELS[item] || item).join('، ') : 'غير محددة',
    preferred_date: formatDate(request.preferred_date),
    preferred_period: PERIOD_LABELS[request.preferred_period] || show(request.preferred_period),
    flexible_date: request.flexible_date ? 'نعم، الموعد مرن' : 'لا',
    notes: show(request.notes, 'لا توجد ملاحظات'),
    created_at: formatDateTime(request.created_at || request.createdAt || new Date()),
    media_count: String(mediaUrls.length),
    media_links: mediaLinks,
    quoted_price: show(request.quoted_price, 'لم يحدد بعد'),
    assigned_employee: show(request.assigned_employee, 'لم يحدد بعد'),
    assigned_team: show(request.assigned_team, 'لم يحدد بعد'),
    status_note: show(options.statusNote, 'لا توجد ملاحظة إضافية')
  };
}
