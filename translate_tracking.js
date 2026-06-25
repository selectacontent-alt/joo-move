const fs = require('fs');
let content = fs.readFileSync('c:/Users/Elmotkhasess/Desktop/select/kasakis/kasakis store/next-app/src/pages/TrackingPage.jsx', 'utf8');

content = content.replace("const { t } = useLanguage();", "const { t, language } = useLanguage();");
content = content.replace("<div style={{ paddingTop: '120px'", "<div dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: '120px'");

content = content.replace("تتبع حالة الطلب", "{t('tracking.title')}");
content = content.replace("أدخل رقم هاتفك أو رقم الطلب لمعرفة حالة طلبك الحالي وتتبع مسار الشحنة.", "{t('tracking.desc')}");
content = content.replace('placeholder="أدخل رقم الهاتف أو رقم الطلب..."', 'placeholder={t("tracking.inputPlaceholder")}');
content = content.replace(") : 'تتبع الآن'}", ") : t('tracking.btnTrack')}");

content = content.replace("لم نتمكن من العثور على أي طلبات!", "{t('tracking.notFoundTitle')}");
content = content.replace("تأكد من إدخال رقم الهاتف أو رقم الطلب بشكل صحيح والمحاولة مرة أخرى.", "{t('tracking.notFoundDesc')}");

content = content.replace("الطلبات المتعلقة: {orders.length} طلب", "{t('tracking.relatedOrders')} {orders.length}");

content = content.replace(/const orderDate = new Date\(order\.created_at\)\.toLocaleDateString\('ar-EG', \{/g, "const orderDate = new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {");

content = content.replace("طلب رقم #{order.order_number || order.id}", "{t('tracking.orderNum')}{order.order_number || order.id}");
content = content.replace("تاريخ الطلب: {orderDate}", "{t('tracking.orderDate')} {orderDate}");

content = content.replace("الإجمالي: <span", "{t('tracking.total')} <span");
content = content.replace("{order.total} ج.م</span>", "{order.total} {t('tracking.currency')}</span>");
content = content.replace("{p.price * p.quantity} ج.م</span>", "{p.price * p.quantity} {t('tracking.currency')}</span>");

content = content.replace(">قيد المراجعة</span>", ">{t('tracking.statusReview')}</span>");
content = content.replace(">قيد الشحن</span>", ">{t('tracking.statusShip')}</span>");
content = content.replace(">تم التوصيل</span>", ">{t('tracking.statusDelivered')}</span>");

content = content.replace("تم إلغاء أو رفض هذا الطلب.", "{t('tracking.statusCancelled')}");
content = content.replace("محتويات الطلب:", "{t('tracking.orderContents')}");
content = content.replace("|| 'منتج'", "|| (language === 'ar' ? 'منتج' : 'Product')");

fs.writeFileSync('c:/Users/Elmotkhasess/Desktop/select/kasakis/kasakis store/next-app/src/pages/TrackingPage.jsx', content);
console.log('done');
