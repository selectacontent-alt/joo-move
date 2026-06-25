const fs = require('fs');
const file = 'src/pages/AdminPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `                    )}
                </div>
                <div style={{ width: '100%', maxWidth: '420px', padding: '1rem 1.2rem', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 900 }}>
                  الرسائل المحفوظة في الطابور: <span style={{ color: 'var(--primary-color)' }}>{waQueuedMessages}</span>
                </div>
                {waQrError && (
                  <p style={{ marginTop: '0.8rem', color: '#b45309', fontWeight: 800, fontSize: '0.9rem' }}>
                    جاري التجهيز... {waQrError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => { handleWaRestart(); setWaPairingCode(''); setWaPairingPhone(''); }}
                  className="btn-admin"
                  style={{ marginTop: '1rem', background: '#0f172a', color: '#fff', border: 'none', padding: '0.85rem 1.5rem' }}
                >
                  إعادة تهيئة التسجيل
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="admin-panel">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--text-dark)', fontWeight: '800' }}>{t('admin.waSettingsTitle')}</h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="admin-form-group">
                      <label>{t('admin.waAdminPhoneLabel')}</label>
                      <input type="text" name="admin_whatsapp" value={settings.admin_whatsapp || ''}`;

content = content.replace(/                    \)}\r?\n                      <input type="text" name="admin_whatsapp" value=\{settings\.admin_whatsapp \|\| ''\}/, replacement);

const targetTemplates = `<div className="admin-form-group">
                      <label>{t('admin.waTemplateNewOrder')}</label>
                      <textarea name="wa_template_new_order" value={settings.wa_template_new_order || ''} onChange={handleSettingsChange} className="admin-input" style={{ minHeight: '260px', resize: 'vertical', lineHeight: 1.8 }}></textarea>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>{t('admin.waTemplateHint')}</small>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem', lineHeight: 1.8 }}>
                        متغيرات إضافية: {'{date_time}'}، {'{governorate}'}، {'{address}'}، {'{phones}'}، {'{products}'}، {'{subtotal}'}، {'{shipping}'}
                      </small>
                    </div>

                    <div className="admin-form-group">
                      <label>{t('admin.waTemplateShipped')}</label>
                      <textarea name="wa_template_shipped" value={settings.wa_template_shipped || ''} onChange={handleSettingsChange} className="admin-input" style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>{t('admin.waTemplateShippedHint')}</small>
                    </div>

                    <div className="admin-form-group">
                      <label>{t('admin.waTemplateDelivered')}</label>
                      <textarea name="wa_template_delivered" value={settings.wa_template_delivered || ''} onChange={handleSettingsChange} className="admin-input" style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>{t('admin.waTemplateShippedHint')}</small>
                    </div>`;

const replaceTemplates = `<div className="admin-form-group">
                      <label>رسالة تأكيد طلب التجهيز (الحجز)</label>
                      <textarea name="wa_template_booking_order" value={settings.wa_template_booking_order || ''} onChange={handleSettingsChange} className="admin-input" style={{ minHeight: '260px', resize: 'vertical', lineHeight: 1.8 }} placeholder="مثال: أهلاً بك يا {customer_name}، تم تأكيد طلب تجهيز {total_qirat} قيراط بنجاح..."></textarea>
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem', lineHeight: 1.8 }}>
                        المتغيرات المتاحة: {'{order_id}'}، {'{customer_name}'}، {'{phone}'}، {'{address}'}، {'{date_time}'}، {'{unit}'}، {'{quantity}'}، {'{total_qirat}'}، {'{total_trays}'}، {'{price_per_qirat}'}، {'{total}'}، {'{notes_line}'}
                      </small>
                    </div>`;

content = content.replace(/<div className="admin-form-group">[\s\S]*?wa_template_new_order[\s\S]*?wa_template_delivered[\s\S]*?<\/div>/, replaceTemplates);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed successfully');
