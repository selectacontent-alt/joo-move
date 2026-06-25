import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

// دالة مساعدة لتنظيف النصوص وحمايتها من أخطاء الـ XML Syntax
const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe.toString().replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export async function GET(request) {
  try {
    const pool = await getPool();
    // جلب المنتجات النشطة من قاعدة البيانات وترتيبها بالأحدث (تم تصحيح created_at إلى id)
    const [products] = await pool.query('SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC');

    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost ? forwardedHost : request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const domain = host ? `${proto}://${host}` : 'https://Al Rehab.com';
    
    // بناء ترويسة ملف الـ XML المتوافقة مع معايير Meta و Google
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>الرحاب - Al Rehab Store</title>
    <link>${domain}</link>
    <description>متجر الرحاب لأرقى ملابس الأطفال</description>`;

    // تكرار (Loop) على كل منتج لبناء الـ <item> الخاص به
    products.forEach((product) => {
      // تحويل العنوان إلى رابط صديق لمحركات البحث ومطابق لمعمارية صفحاتك
      const productSlug = product.title ? encodeURIComponent(product.title.replace(/\s+/g, '-')) : 'item';
      const link = `${domain}/product/${productSlug}`;
      
      // تحديد حالة التوفر ديناميكيًا بناءً على المخزن
      let isAvailable = true;
      let parsedOpts = {};
      if (product.options) {
        try {
          parsedOpts = typeof product.options === 'string' ? JSON.parse(product.options) : product.options;
        } catch (e) {}
      }

      if (parsedOpts?.variantStock && Object.keys(parsedOpts.variantStock).length > 0) {
        isAvailable = Object.values(parsedOpts.variantStock).some(value => Number(value) > 0);
      } else {
        isAvailable = product.stock === undefined || product.stock === null || Number(product.stock) > 0;
      }
      
      let availability = isAvailable ? 'in stock' : 'out of stock';

      // معالجة الصورة الأساسية والإضافية للمنتج (سواء كانت نص مباشر أو مصفوفة JSON)
      let primaryImage = product.image;
      let displayUrls = [];
      
      if (product.images) {
        try {
          const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          const productImagesParsed = Array.isArray(parsed) ? parsed : [];
          displayUrls = productImagesParsed.map(img => typeof img === 'object' ? (img.url || img) : img).filter(Boolean);
        } catch(e) {}
      }

      if (!primaryImage) {
        primaryImage = displayUrls.length > 0 ? displayUrls[0] : '';
      }
      
      // التأكد من أن مسار الصورة كامل (Absolute URL) لتجنب أخطاء Meta
      const formatImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/')) return `${domain}${url}`;
        return url;
      };

      primaryImage = formatImageUrl(primaryImage) || 'https://via.placeholder.com/600?text=Al Rehab';

      // تجهيز الصور الإضافية (بحد أقصى 10 صور إضافية حسب معايير ميتا)
      let additionalImagesXml = '';
      const additionalUrls = displayUrls.filter(url => formatImageUrl(url) !== primaryImage);
      
      additionalUrls.slice(0, 10).forEach(imgUrl => {
        const formattedImg = formatImageUrl(imgUrl);
        if (formattedImg) {
          additionalImagesXml += `\n      <g:additional_image_link>${escapeXml(formattedImg)}</g:additional_image_link>`;
        }
      });

      // حقن داتا المنتج داخل هيكل ميتا الرسمي
      xml += `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.title)}</g:title>
      <g:description>${escapeXml(product.description || product.title)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>${additionalImagesXml}
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>`;

      // إضافة سعر الخصم في حال وجود old_price
      if (product.old_price && Number(product.old_price) > Number(product.price)) {
          xml += `
      <g:sale_price>${Number(product.price).toFixed(2)} EGP</g:sale_price>
      <g:price>${Number(product.old_price).toFixed(2)} EGP</g:price>`;
      } else {
          xml += `
      <g:price>${Number(product.price).toFixed(2)} EGP</g:price>`;
      }

      xml += `
      <g:brand>Al Rehab</g:brand>
      <g:google_product_category>Clothing &amp; Accessories &gt; Clothing &gt; Baby &amp; Toddler Clothing</g:google_product_category>
    </item>`;
    });

    // إغلاق قنوات الـ XML
    xml += `
  </channel>
</rss>`;

    // إرسال الملف بصيغة XML صريحة مع عمل كاش مؤقت لحماية السيرفر من الضغط
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
