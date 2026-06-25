const customerAddress = " - المدينة:  - الشارع:  | الملاحظات: انا تليفوني بيبقا مقفول الصبح";
const cleanedAddress = customerAddress.replace(/\|/g, '-');
const addrParts = cleanedAddress.split('-').map(p => p.trim()).filter(Boolean);
console.log(addrParts);
