import { generateInvoiceImage } from './src/lib/invoiceGenerator.js';

async function run() {
  try {
    const products = [
      { name: 'منتج أ', quantity: 2, price: 100 },
      { name: 'منتج ب', quantity: 1, price: 50 }
    ];
    const customerAddress = 'القاهرة - المدينة: مدينة نصر - الشارع: مكرم عبيد';
    const notes = 'لا يوجد';
    
    console.log('Generating invoice...');
    const resultPath = await generateInvoiceImage(
      '#123456',
      'Ahmed',
      '01234567890',
      300,
      products,
      notes,
      customerAddress
    );
    console.log('Success!', resultPath);
  } catch (e) {
    console.error('Failed', e);
  } finally {
    process.exit(0);
  }
}
run();
