const fs = require('fs');

let content = fs.readFileSync('src/contexts/translations.js', 'utf8');

const searchTarget = `  whatsapp: {
    sidebarCoupons:`;

if (content.includes(searchTarget)) {
  const replacement = `  whatsapp: {
    helpMessage: { ar: 'مرحباً، أحتاج مساعدة في متجركم', en: 'Hello, I need help with your store' },
    widgetTitle: { ar: 'قصاقيص - Kasakis', en: 'Kasakis - Kids Fashion' },
    replyTime: { ar: 'يرد عادة خلال بضع دقائق', en: 'Usually replies within minutes' },
    welcome: { ar: 'أهلاً بك في متجر قصاقيص! 🌟<br/>كيف يمكننا مساعدتك اليوم؟', en: 'Welcome to Kasakis store! 🌟<br/>How can we help you today' },
    now: { ar: 'الآن', en: 'Now' },
    placeholder: { ar: 'اكتب رسالتك هنا...', en: 'Type your message here...' },
  },
  contact: {
    titlePart1: { ar: 'تواصل', en: 'Contact ' },
    titlePart2: { ar: 'معنا', en: 'Us' },
    subtitle: { ar: 'نحن هنا لخدمتك والإجابة على جميع استفساراتك. لا تتردد في التواصل معنا في أي وقت.', en: 'We are here to serve you and answer all your inquiries. Do not hesitate to contact us at any time.' },
    phoneTitle: { ar: 'رقم الهاتف', en: 'Phone Number' },
    emailTitle: { ar: 'البريد الإلكتروني', en: 'Email Address' },
    hoursTitle: { ar: 'مواعيد العمل', en: 'Working Hours' },
    hoursValue: { ar: 'مفتوح علي مدار 24 ساعة', en: 'Open 24 Hours' },
    formTitle: { ar: 'أرسل رسالة', en: 'Send a Message' },
    successMsg: { ar: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', en: 'Your message has been sent successfully! We will contact you soon.' },
    errorMsg: { ar: 'حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.', en: 'An error occurred while sending. Please try again later.' },
    firstName: { ar: 'الاسم الأول', en: 'First Name' },
    firstNamePlaceholder: { ar: 'أحمد', en: 'Ahmed' },
    lastName: { ar: 'الاسم الأخير', en: 'Last Name' },
    lastNamePlaceholder: { ar: 'محمد', en: 'Mohamed' },
    phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
    phonePlaceholder: { ar: '01012345678', en: '01012345678' },
    email: { ar: 'البريد الإلكتروني', en: 'Email Address' },
    emailPlaceholder: { ar: 'example@kasakis.com', en: 'example@kasakis.com' },
    messageLabel: { ar: 'اكتب رسالتك', en: 'Write your message' },
    messagePlaceholder: { ar: 'كيف يمكننا مساعدتك؟', en: 'How can we help you?' },
    btnSending: { ar: 'جاري الإرسال...', en: 'Sending...' },
    btnSend: { ar: 'إرسال الرسالة', en: 'Send Message' },
  },
  admin: {
    sidebarStoreName: { ar: 'قصاقيص', en: 'Kasakis' },
    sidebarControlPanel: { ar: 'لوحة التحكم', en: 'Control Panel' },
    sidebarDashboard: { ar: 'نظرة عامة', en: 'Dashboard' },
    sidebarOrders: { ar: 'الطلبات', en: 'Orders' },
    sidebarCoupons:`;
  
  content = content.replace(searchTarget, replacement);
  fs.writeFileSync('src/contexts/translations.js', content, 'utf8');
  console.log("Success with exact match");
} else {
  const regex = /whatsapp:\s*\{\s*sidebarCoupons:/;
  if(regex.test(content)) {
     const replacement = `whatsapp: {
    helpMessage: { ar: 'مرحباً، أحتاج مساعدة في متجركم', en: 'Hello, I need help with your store' },
    widgetTitle: { ar: 'قصاقيص - Kasakis', en: 'Kasakis - Kids Fashion' },
    replyTime: { ar: 'يرد عادة خلال بضع دقائق', en: 'Usually replies within minutes' },
    welcome: { ar: 'أهلاً بك في متجر قصاقيص! 🌟<br/>كيف يمكننا مساعدتك اليوم؟', en: 'Welcome to Kasakis store! 🌟<br/>How can we help you today' },
    now: { ar: 'الآن', en: 'Now' },
    placeholder: { ar: 'اكتب رسالتك هنا...', en: 'Type your message here...' },
  },
  contact: {
    titlePart1: { ar: 'تواصل', en: 'Contact ' },
    titlePart2: { ar: 'معنا', en: 'Us' },
    subtitle: { ar: 'نحن هنا لخدمتك والإجابة على جميع استفساراتك. لا تتردد في التواصل معنا في أي وقت.', en: 'We are here to serve you and answer all your inquiries. Do not hesitate to contact us at any time.' },
    phoneTitle: { ar: 'رقم الهاتف', en: 'Phone Number' },
    emailTitle: { ar: 'البريد الإلكتروني', en: 'Email Address' },
    hoursTitle: { ar: 'مواعيد العمل', en: 'Working Hours' },
    hoursValue: { ar: 'مفتوح علي مدار 24 ساعة', en: 'Open 24 Hours' },
    formTitle: { ar: 'أرسل رسالة', en: 'Send a Message' },
    successMsg: { ar: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', en: 'Your message has been sent successfully! We will contact you soon.' },
    errorMsg: { ar: 'حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.', en: 'An error occurred while sending. Please try again later.' },
    firstName: { ar: 'الاسم الأول', en: 'First Name' },
    firstNamePlaceholder: { ar: 'أحمد', en: 'Ahmed' },
    lastName: { ar: 'الاسم الأخير', en: 'Last Name' },
    lastNamePlaceholder: { ar: 'محمد', en: 'Mohamed' },
    phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
    phonePlaceholder: { ar: '01012345678', en: '01012345678' },
    email: { ar: 'البريد الإلكتروني', en: 'Email Address' },
    emailPlaceholder: { ar: 'example@kasakis.com', en: 'example@kasakis.com' },
    messageLabel: { ar: 'اكتب رسالتك', en: 'Write your message' },
    messagePlaceholder: { ar: 'كيف يمكننا مساعدتك؟', en: 'How can we help you?' },
    btnSending: { ar: 'جاري الإرسال...', en: 'Sending...' },
    btnSend: { ar: 'إرسال الرسالة', en: 'Send Message' },
  },
  admin: {
    sidebarStoreName: { ar: 'قصاقيص', en: 'Kasakis' },
    sidebarControlPanel: { ar: 'لوحة التحكم', en: 'Control Panel' },
    sidebarDashboard: { ar: 'نظرة عامة', en: 'Dashboard' },
    sidebarOrders: { ar: 'الطلبات', en: 'Orders' },
    sidebarCoupons:`;
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/contexts/translations.js', content, 'utf8');
    console.log("Success with Regex");
  } else {
    console.log("Target not found! Check the file structure.");
  }
}
