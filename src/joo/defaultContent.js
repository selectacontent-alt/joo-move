export const BRAND = {
  name: 'Joo Move',
  phone: '0100 000 0000',
  whatsapp: '201000000000',
  hoursAr: 'يوميًا من 9 صباحًا إلى 11 مساءً',
  hoursEn: 'Daily, 9 AM–11 PM',
  areaAr: 'القاهرة والجيزة والمناطق المحيطة',
  areaEn: 'Cairo, Giza and nearby areas',
};

export const MOVE_STATUSES = [
  { value: 'received', ar: 'تم استلام الطلب', en: 'Request received' },
  { value: 'contacting', ar: 'جارٍ التواصل', en: 'Contacting customer' },
  { value: 'inspection_scheduled', ar: 'تم تحديد المعاينة', en: 'Inspection scheduled' },
  { value: 'quote_sent', ar: 'تم إرسال العرض', en: 'Quote sent' },
  { value: 'confirmed', ar: 'تم التأكيد', en: 'Confirmed' },
  { value: 'team_assigned', ar: 'تم تعيين الفريق', en: 'Team assigned' },
  { value: 'on_the_way', ar: 'الفريق في الطريق', en: 'Team on the way' },
  { value: 'moving', ar: 'جارٍ التغليف والنقل', en: 'Packing and moving' },
  { value: 'delivered', ar: 'تم التسليم', en: 'Delivered' },
  { value: 'completed', ar: 'مكتمل', en: 'Completed' },
  { value: 'cancelled', ar: 'ملغي', en: 'Cancelled' },
];

export const DEFAULT_SERVICES = [
  {
    slug: 'furniture-moving', icon: 'Truck', category: 'home', sort_order: 1,
    title_ar: 'نقل الاثاث بدون تغليف', title_en: 'Furniture Moving Without Packing',
    short_ar: 'تحميل ونقل وتنزيل الأثاث بدون خدمة التغليف الكامل.',
    short_en: 'Furniture loading, transport and unloading without full packing.',
    body_ar: 'نستلم تفاصيل النقل، نخطط للتحميل والترتيب داخل السيارة، ونوصل كل قطعة للمكان المحدد بأمان ومتابعة مستمرة بدون إضافة خدمة التغليف الكامل.',
    body_en: 'We plan loading, secure every item inside the truck and deliver it safely without adding full packing service.',
    bullets_ar: ['فريق تحميل مدرّب', 'تثبيت آمن داخل السيارة', 'متابعة حتى التسليم'],
    bullets_en: ['Trained moving crew', 'Secure truck loading', 'Updates until delivery'],
  },
  {
    slug: 'professional-packing', icon: 'PackageCheck', category: 'packing', sort_order: 2,
    title_ar: 'التغليف الكامل', title_en: 'Full Packing',
    short_ar: 'خامات تغليف مناسبة لكل قطعة من الزجاج حتى الأثاث الكبير.',
    short_en: 'The right protection for every item, from glassware to large furniture.',
    body_ar: 'نستخدم استرتش، بابلز، كرتون وزوايا حماية مع ترقيم واضح يسهل الفك والترتيب في المكان الجديد.',
    body_en: 'We use stretch wrap, bubble wrap, cartons and corner protection with clear labeling for effortless unpacking.',
    bullets_ar: ['خامات متعددة الطبقات', 'ترقيم وتصنيف الكراتين', 'عناية خاصة بالزجاج'],
    bullets_en: ['Multi-layer materials', 'Labeled cartons', 'Special glass protection'],
  },
  {
    slug: 'assembly', icon: 'Wrench', category: 'assembly', sort_order: 4,
    title_ar: 'فك وتركيب الاثاث', title_en: 'Furniture Disassembly & Assembly',
    short_ar: 'نجارين وفنيين يفكّوا ويركبوا الأثاث والأجهزة بدقة.',
    short_en: 'Skilled technicians disassemble and reinstall furniture and appliances.',
    body_ar: 'الفك يتم بالترقيم وحفظ المسامير والملحقات، ثم إعادة التركيب والضبط في المكان الجديد.',
    body_en: 'Every part and fitting is labeled and protected, then carefully reassembled and adjusted at the destination.',
    bullets_ar: ['حفظ جميع الملحقات', 'تركيب وضبط نهائي', 'تعامل مع القطع المعقدة'],
    bullets_en: ['Protected fittings', 'Final adjustment', 'Complex item handling'],
  },
  {
    slug: 'loading', icon: 'Boxes', category: 'loading', sort_order: 3,
    title_ar: 'خدمة الونش', title_en: 'Hoist Service',
    short_ar: 'ونش رفع للأدوار والمداخل الصعبة حسب معاينة المكان.',
    short_en: 'Furniture hoist support for difficult floors and tight entrances.',
    body_ar: 'نراجع المداخل والأدوار وإمكانية استخدام الونش قبل التنفيذ ونحدد العدد والأدوات المناسبة للنقلة.',
    body_en: 'We review floors, entrances and hoist access before assigning the right crew and equipment.',
    bullets_ar: ['مراجعة مكان الونش', 'تنظيم القطع حسب الأولوية', 'معدات رفع مناسبة'],
    bullets_en: ['Hoist access review', 'Priority loading order', 'Proper lifting tools'],
  },
  {
    slug: 'electrical', icon: 'Wrench', category: 'assembly', sort_order: 5,
    title_ar: 'خدمات كهربائية', title_en: 'Electrical Services',
    short_ar: 'مساعدة فنية للأجهزة والتوصيلات البسيطة المرتبطة بالنقلة.',
    short_en: 'Technical help for appliances and simple move-related electrical work.',
    body_ar: 'نوفر فنيين للمساعدة في فصل وتركيب الأجهزة والتوصيلات البسيطة حسب احتياج النقلة ومعاينة التفاصيل.',
    body_en: 'Our technicians help disconnect and reconnect appliances and simple electrical items based on the move details.',
    bullets_ar: ['فصل وتركيب أجهزة', 'توصيلات بسيطة', 'تنسيق قبل التنفيذ'],
    bullets_en: ['Appliance disconnection', 'Simple connections', 'Pre-move coordination'],
  },
];

export const DEFAULT_PAGE_CONTENT = {
  home: {
    seo: {
      title_ar: 'Joo Move | نقل وتغليف الأثاث باحتراف',
      title_en: 'Joo Move | Professional Furniture Moving',
      description_ar: 'نقل وتغليف وفك وتركيب الأثاث للمنازل والمكاتب بفريق مدرب وعربيات مجهزة.',
      description_en: 'Professional furniture moving, packing and assembly for homes and offices.',
    },
    sections: [
      { key: 'hero', type: 'hero', sort_order: 1, is_visible: true, content_ar: { eyebrow: 'نقل منظم. تغليف آمن. بال مرتاح.', title: 'ننقل عفشك كأنه بتاعنا', description: 'من أول قطعة تتغلف لحد آخر قطعة تتركب، فريق Joo Move معاك بخطة واضحة واهتمام حقيقي بكل تفصيلة.' }, content_en: { eyebrow: 'Organized move. Safe packing. Total peace of mind.', title: 'We move it like it is our own', description: 'From the first wrapped item to the final installation, Joo Move handles every detail with care.' } },
      { key: 'trust', type: 'trust', sort_order: 2, is_visible: true, content_ar: { title: 'ثقة مبنية على شغل حقيقي' }, content_en: { title: 'Trust built on real work' } },
      { key: 'services', type: 'services', sort_order: 3, is_visible: true, content_ar: { eyebrow: 'كل احتياجات النقل', title: 'خدمة كاملة بدون أطراف ناقصة', description: 'فريق واحد مسؤول عن التغليف والفك والتحميل والنقل والتركيب.' }, content_en: { eyebrow: 'Everything your move needs', title: 'One complete moving service', description: 'One accountable team for packing, loading, moving and assembly.' } },
      { key: 'process', type: 'process', sort_order: 4, is_visible: true, content_ar: { eyebrow: 'العملية ببساطة', title: 'نقلتك في أربع خطوات واضحة' }, content_en: { eyebrow: 'A simple process', title: 'Your move in four clear steps' } },
      { key: 'proof', type: 'proof', sort_order: 5, is_visible: true, content_ar: { eyebrow: 'كل قطعة لها طريقة', title: 'نحمي التفاصيل قبل ما نحركها', description: 'خامات مناسبة، ترقيم واضح، وتحميل مدروس يقلل المخاطر ويوفر وقت التركيب.' }, content_en: { eyebrow: 'Every item needs a method', title: 'We protect before we move', description: 'Proper materials, clear labeling and planned loading protect your items and save setup time.' } },
      { key: 'work', type: 'work', sort_order: 6, is_visible: true, content_ar: { eyebrow: 'من أرض الواقع', title: 'شغلنا هو أحسن تعريف بينا' }, content_en: { eyebrow: 'Real work', title: 'Our work speaks for us' } },
      { key: 'testimonials', type: 'testimonials', sort_order: 7, is_visible: true, content_ar: { eyebrow: 'قالوا عن Joo Move', title: 'راحة العميل جزء من الخدمة' }, content_en: { eyebrow: 'What customers say', title: 'Peace of mind is part of the service' } },
      { key: 'faq', type: 'faq', sort_order: 8, is_visible: true, content_ar: { eyebrow: 'قبل ما تحجز', title: 'إجابات سريعة على أهم الأسئلة' }, content_en: { eyebrow: 'Before you book', title: 'Quick answers to common questions' } },
      { key: 'cta', type: 'cta', sort_order: 9, is_visible: true, content_ar: { title: 'جاهز تنقل من غير توتر؟', description: 'ابعث تفاصيل نقلتك، وفريقنا يتواصل معاك لتحديد المعاينة والخطة المناسبة.' }, content_en: { title: 'Ready for a stress-free move?', description: 'Send your move details and our team will arrange the right inspection and plan.' } },
    ],
  },
};

export const DEFAULT_FAQS = [
  { question_ar: 'هل لازم معاينة قبل تحديد السعر؟', answer_ar: 'السعر النهائي يتحدد بعد مراجعة حجم العفش، الأدوار، المسافات والخدمات المطلوبة. بعض النقلات البسيطة يمكن تسعيرها من الصور والفيديو.', question_en: 'Is an inspection required before pricing?', answer_en: 'Final pricing depends on the move size, access, distance and services. Simple moves can sometimes be quoted from photos or video.' },
  { question_ar: 'هل توفرون خامات التغليف؟', answer_ar: 'نعم، نوفر الخامات المناسبة حسب نوع كل قطعة، مثل الكرتون والاسترتش والبابلز وزوايا الحماية.', question_en: 'Do you provide packing materials?', answer_en: 'Yes. We provide suitable cartons, stretch wrap, bubble wrap and corner protection for each item.' },
  { question_ar: 'هل يمكن تغيير الموعد بعد التأكيد؟', answer_ar: 'يمكن طلب تغيير الموعد مبكرًا، ويعاد التأكيد حسب توافر الفرق وجدول النقلات.', question_en: 'Can I change the confirmed date?', answer_en: 'You can request an early reschedule, subject to crew availability.' },
  { question_ar: 'هل تقومون بفك وتركيب الأثاث؟', answer_ar: 'نعم، الخدمة تشمل فنيين للفك والتركيب مع حفظ وترقيم جميع المسامير والملحقات.', question_en: 'Do you disassemble and assemble furniture?', answer_en: 'Yes. Our technicians label and protect every fitting, then reassemble your furniture at the destination.' },
];

export const DEFAULT_AREAS = [
  { name_ar: 'القاهرة الجديدة', name_en: 'New Cairo' },
  { name_ar: 'مدينة نصر ومصر الجديدة', name_en: 'Nasr City & Heliopolis' },
  { name_ar: 'الشيخ زايد و6 أكتوبر', name_en: 'Sheikh Zayed & 6 October' },
  { name_ar: 'المعادي والمقطم', name_en: 'Maadi & Mokattam' },
  { name_ar: 'الجيزة والمناطق المحيطة', name_en: 'Giza & nearby areas' },
];

export const DEFAULT_TESTIMONIALS = [
  { name_ar: 'أحمد محمود', name_en: 'Ahmed Mahmoud', text_ar: 'الفريق وصل في الموعد والتغليف كان منظم جدًا. كل قطعة وصلت واتركبت بدون دوشة.', text_en: 'The team arrived on time and the packing was excellent. Everything arrived and was installed smoothly.', rating: 5 },
  { name_ar: 'مريم خالد', name_en: 'Mariam Khaled', text_ar: 'أكتر حاجة فرقت معايا إن في شخص كان متابع النقل من البداية للنهاية.', text_en: 'What made the difference was having one person coordinating the entire move.', rating: 5 },
  { name_ar: 'شركة نقطة', name_en: 'Noqta Office', text_ar: 'نقل المكتب تم على مراحل واشتغلنا تاني يوم من غير تعطيل.', text_en: 'The office move was phased perfectly, and we were operational the next day.', rating: 5 },
];

export const PROCESS_STEPS = [
  { n: '01', ar: 'ابعت التفاصيل', en: 'Send details', descAr: 'املأ الطلب في دقايق وارفع صور العفش.', descEn: 'Complete the request and add photos in minutes.' },
  { n: '02', ar: 'نراجع وننسق', en: 'We review', descAr: 'نتواصل معاك ونحدد المعاينة لو مطلوبة.', descEn: 'We call and arrange an inspection if needed.' },
  { n: '03', ar: 'نحدد الفريق', en: 'Crew assigned', descAr: 'نثبت الموعد والعربية والعمالة المناسبة.', descEn: 'We confirm the date, truck and right crew.' },
  { n: '04', ar: 'تتم النقلة', en: 'Move complete', descAr: 'تغليف ونقل وتركيب ومتابعة حتى التسليم.', descEn: 'Packing, moving, assembly and final delivery.' },
];
