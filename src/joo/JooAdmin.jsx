"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3, Bell, Boxes, CalendarDays, Check, ChevronLeft, CircleGauge, Clock3,
  FileText, GalleryHorizontal, Globe2, GripVertical, Headphones, ImagePlus, LayoutGrid,
  LogOut, MapPin, Menu, MessageCircle, PackageCheck, Pencil, Phone, Plus, RefreshCw,
  Save, Search, Settings, ShieldCheck, Star, Trash2, Truck, UploadCloud, UserRound,
  UsersRound, Wrench, X, Lock
} from 'lucide-react';
import { DEFAULT_PAGE_CONTENT, MOVE_STATUSES } from './defaultContent';
import {
  DEFAULT_MOVE_REQUEST_ADMIN_TEMPLATE,
  DEFAULT_MOVE_REQUEST_CUSTOMER_TEMPLATE,
  DEFAULT_MOVE_STATUS_TEMPLATES
} from '../lib/whatsappTemplates';

const STATUS_COLOR = {
  received: '#0087b4', contacting: '#7c3aed', inspection_scheduled: '#b7791f', quote_sent: '#c2410c',
  confirmed: '#0f766e', team_assigned: '#0369a1', on_the_way: '#2563eb', moving: '#d92335',
  delivered: '#15803d', completed: '#147252', cancelled: '#64748b'
};

const parseDate = (value) => value ? new Date(value).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'غير محدد';

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' }); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try { const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.error || 'بيانات الدخول غير صحيحة'); localStorage.setItem('joo_admin_auth', JSON.stringify(result.user)); onLogin(result.user); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return <main className="jma-login-sc"><div className="jma-login-glow-1" /><div className="jma-login-glow-2" /><section className="jma-login-card animate-up"><div className="jma-login-logo"><img src="/s-logo.png" alt="Joo Move" /><h2>تسجيل الدخول</h2><p>أدخل بيانات الاعتماد الخاصة بك للوصول</p></div><form onSubmit={submit}>{error && <div className="jma-error-glass"><ShieldCheck size={20} />{error}</div>}<div className="jma-input-glass"><UserRound size={22} /><input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="اسم المستخدم" /></div><div className="jma-input-glass"><Lock size={22} /><input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="كلمة المرور" /></div><button disabled={loading} className="jma-submit-glass">{loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</button></form></section></main>;
}

const TABS = [
  ['dashboard', CircleGauge, 'نظرة عامة'], ['requests', Truck, 'طلبات النقل'], ['schedule', CalendarDays, 'جدول التشغيل'],
  ['services', PackageCheck, 'الخدمات'], ['areas', MapPin, 'مناطق الخدمة'], ['customers', UsersRound, 'العملاء'],
  ['work', GalleryHorizontal, 'معرض الأعمال'], ['reviews', Star, 'آراء العملاء'], ['messages', MessageCircle, 'الرسائل'],
  ['content', LayoutGrid, 'محتوى الموقع'], ['whatsapp', Phone, 'واتساب والقوالب'], ['about_agency', Headphones, 'حول S C Marketing'], ['settings', Settings, 'الإعدادات والتكاملات']
];

function StatCard({ icon: Icon, label, value, hint, color }) {
  return <article className="jma-stat"><span style={{ background: `${color}18`, color }}><Icon /></span><div><small>{label}</small><b>{value}</b><p>{hint}</p></div></article>;
}

function Dashboard({ requests, setActive }) {
  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    today: requests.filter((request) => String(request.created_at || '').slice(0, 10) === today).length,
    waiting: requests.filter((request) => ['received', 'contacting'].includes(request.status)).length,
    confirmed: requests.filter((request) => ['confirmed', 'team_assigned', 'on_the_way', 'moving'].includes(request.status)).length,
    completed: requests.filter((request) => request.status === 'completed').length,
  };
  const conversion = requests.length ? Math.round((requests.filter((r) => ['confirmed','team_assigned','on_the_way','moving','delivered','completed'].includes(r.status)).length / requests.length) * 100) : 0;
  return <div className="jma-stack"><div className="jma-welcome"><div><span>JOO MOVE OPERATIONS</span><h2>صباح الشغل المنظم 👋</h2><p>دي صورة سريعة للطلبات والتشغيل. كل رقم هنا مرتبط ببيانات حقيقية.</p></div><button onClick={() => setActive('requests')}><Plus />فتح طلبات النقل</button></div><div className="jma-stats"><StatCard icon={Bell} label="طلبات اليوم" value={stats.today} hint="وصلت من الموقع" color="#0087b4" /><StatCard icon={Clock3} label="تنتظر التواصل" value={stats.waiting} hint="تحتاج إجراء" color="#d92335" /><StatCard icon={Truck} label="نقلات مؤكدة" value={stats.confirmed} hint="داخل التشغيل" color="#7c3aed" /><StatCard icon={BarChart3} label="معدل التحويل" value={`${conversion}%`} hint={`${stats.completed} مكتملة`} color="#14805f" /></div><div className="jma-grid-2"><section className="jma-panel"><div className="jma-panel-head"><div><h3>أحدث الطلبات</h3><p>آخر طلبات وصلت من الموقع</p></div><button className="jma-link" onClick={() => setActive('requests')}>عرض الكل<ChevronLeft /></button></div><div className="jma-mini-requests">{requests.slice(0, 6).map((request) => <article key={request.id}><span className="jma-avatar">{request.customer_name?.charAt(0)}</span><div><b>{request.customer_name}</b><small>{request.request_number} • {request.origin_area} ← {request.destination_area}</small></div><em style={{ color: STATUS_COLOR[request.status] }}>{MOVE_STATUSES.find((s) => s.value === request.status)?.ar || request.status}</em></article>)}{!requests.length && <div className="jma-empty"><Truck /><p>أول طلب نقل هيظهر هنا.</p></div>}</div></section><section className="jma-panel"><div className="jma-panel-head"><div><h3>توزيع الطلبات</h3><p>حسب مرحلة التشغيل</p></div></div><div className="jma-status-bars">{MOVE_STATUSES.slice(0, 8).map((status) => { const count = requests.filter((r) => r.status === status.value).length; const percent = requests.length ? Math.max(4, (count / requests.length) * 100) : 0; return <div key={status.value}><span><b>{status.ar}</b><em>{count}</em></span><i><u style={{ width: `${percent}%`, background: STATUS_COLOR[status.value] }} /></i></div>; })}</div></section></div></div>;
}

function RequestDrawer({ request, onClose, onSaved }) {
  const [form, setForm] = useState({ status: request.status, assigned_employee: request.assigned_employee || '', assigned_team: request.assigned_team || '', quoted_price: request.quoted_price || '', internal_notes: request.internal_notes || '', preferred_date: request.preferred_date ? String(request.preferred_date).slice(0,10) : '', preferred_period: request.preferred_period || 'morning' });
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { const response = await fetch(`/api/move-requests/${request.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (!response.ok) throw new Error(); onSaved(); onClose(); } finally { setSaving(false); } };
  return <div className="jma-drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside className="jma-drawer"><div className="jma-drawer-head"><div><span>{request.request_number}</span><h2>{request.customer_name}</h2><p><Phone /> <bdi>{request.phone}</bdi></p></div><button onClick={onClose}><X /></button></div><div className="jma-drawer-body"><section className="jma-route-card"><div><span>من</span><b>{request.origin_area}</b><small>{request.origin_address || 'العنوان غير مضاف'}</small></div><Truck /><div><span>إلى</span><b>{request.destination_area}</b><small>{request.destination_address || 'العنوان غير مضاف'}</small></div></section><div className="jma-detail-grid"><article><span>نوع النقلة</span><b>{request.move_type === 'office' ? 'مكتب' : 'منزل'}</b></article><article><span>عدد الغرف</span><b>{request.rooms}</b></article><article><span>الموعد</span><b>{parseDate(request.preferred_date)}</b></article><article><span>الخدمات</span><b>{request.services?.length || 0}</b></article></div>{request.media?.length > 0 && <section><h3>صور وفيديو النقلة</h3><div className="jma-media-strip">{request.media.map((item) => item.type === 'video' ? <video key={item.id} src={item.url} controls /> : <img key={item.id} src={item.url} alt="Move" />)}</div></section>}<section><h3>إدارة الطلب</h3><div className="jma-form-grid"><label><span>الحالة</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{MOVE_STATUSES.map((status) => <option value={status.value} key={status.value}>{status.ar}</option>)}</select></label><label><span>السعر المقترح</span><input type="number" value={form.quoted_price} onChange={(e) => setForm({ ...form, quoted_price: e.target.value })} placeholder="يترك فارغًا قبل التسعير" /></label><label><span>موظف المتابعة</span><input value={form.assigned_employee} onChange={(e) => setForm({ ...form, assigned_employee: e.target.value })} /></label><label><span>الفريق</span><input value={form.assigned_team} onChange={(e) => setForm({ ...form, assigned_team: e.target.value })} /></label><label><span>موعد التنفيذ</span><input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} /></label><label><span>الفترة</span><select value={form.preferred_period} onChange={(e) => setForm({ ...form, preferred_period: e.target.value })}><option value="morning">صباحًا</option><option value="afternoon">ظهرًا</option><option value="evening">مساءً</option></select></label><label className="wide"><span>ملاحظات داخلية</span><textarea value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} /></label></div></section></div><div className="jma-drawer-footer"><button className="jma-btn ghost" onClick={onClose}>إلغاء</button><button className="jma-btn primary" disabled={saving} onClick={save}><Save />{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</button></div></aside></div>;
}

function Requests({ requests, reload }) {
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('all'); const [selected, setSelected] = useState(null); const [view, setView] = useState('table');
  const filtered = requests.filter((request) => (status === 'all' || request.status === status) && (!query || `${request.request_number} ${request.customer_name} ${request.phone}`.toLowerCase().includes(query.toLowerCase())));
  const columns = ['received', 'contacting', 'confirmed', 'team_assigned', 'moving', 'completed'];
  return <div className="jma-stack"><div className="jma-page-title"><div><span>MOVE REQUESTS</span><h2>طلبات النقل</h2><p>تابع كل طلب من أول رسالة لحد إتمام النقلة.</p></div><div className="jma-view-toggle"><button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}><Menu /></button><button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><LayoutGrid /></button></div></div><div className="jma-toolbar"><label><Search /><input placeholder="ابحث بالاسم أو الهاتف أو رقم الطلب" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">كل الحالات</option>{MOVE_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.ar}</option>)}</select><button onClick={reload}><RefreshCw />تحديث</button></div>{view === 'table' ? <div className="jma-table-wrap"><table><thead><tr><th>الطلب</th><th>العميل</th><th>خط النقل</th><th>الموعد</th><th>الحالة</th><th /></tr></thead><tbody>{filtered.map((request) => <tr key={request.id}><td><b className="jma-code">{request.request_number}</b><small>{parseDate(request.created_at)}</small></td><td><b>{request.customer_name}</b><small><bdi>{request.phone}</bdi></small></td><td><b>{request.origin_area}</b><small>إلى {request.destination_area}</small></td><td><b>{parseDate(request.preferred_date)}</b><small>{request.preferred_period || '—'}</small></td><td><span className="jma-badge" style={{ color: STATUS_COLOR[request.status], background: `${STATUS_COLOR[request.status]}14` }}>{MOVE_STATUSES.find((item) => item.value === request.status)?.ar}</span></td><td><button className="jma-icon-btn" onClick={() => setSelected(request)}><ChevronLeft /></button></td></tr>)}</tbody></table>{!filtered.length && <div className="jma-empty"><Search /><p>لا توجد طلبات مطابقة.</p></div>}</div> : <div className="jma-kanban">{columns.map((column) => <section key={column}><header><span style={{ background: STATUS_COLOR[column] }} /><b>{MOVE_STATUSES.find((s) => s.value === column)?.ar}</b><em>{filtered.filter((r) => r.status === column).length}</em></header><div>{filtered.filter((r) => r.status === column).map((request) => <button onClick={() => setSelected(request)} key={request.id}><span>{request.request_number}</span><h4>{request.customer_name}</h4><p>{request.origin_area} ← {request.destination_area}</p><small><CalendarDays />{parseDate(request.preferred_date)}</small></button>)}</div></section>)}</div>}{selected && <RequestDrawer request={selected} onClose={() => setSelected(null)} onSaved={reload} />}</div>;
}

function Schedule({ requests }) {
  const scheduled = requests.filter((request) => request.preferred_date && !['cancelled', 'completed'].includes(request.status)).sort((a,b) => new Date(a.preferred_date) - new Date(b.preferred_date));
  const groups = scheduled.reduce((acc, request) => { const key = String(request.preferred_date).slice(0,10); (acc[key] ||= []).push(request); return acc; }, {});
  return <div className="jma-stack"><div className="jma-page-title"><div><span>OPERATIONS CALENDAR</span><h2>جدول التشغيل</h2><p>النقلات المؤكدة والقادمة مجمعة حسب اليوم والفترة.</p></div></div><div className="jma-schedule">{Object.entries(groups).map(([date, items]) => <section key={date}><header><CalendarDays /><div><b>{new Date(date).toLocaleDateString('ar-EG', { weekday: 'long' })}</b><span>{new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div><em>{items.length} نقلة</em></header><div>{items.map((request) => <article key={request.id}><span className="jma-time">{request.preferred_period === 'evening' ? 'مساءً' : request.preferred_period === 'afternoon' ? 'ظهرًا' : 'صباحًا'}</span><div><h3>{request.customer_name}</h3><p>{request.origin_area} ← {request.destination_area}</p></div><div><small>الفريق</small><b>{request.assigned_team || 'لم يحدد'}</b></div><span className="jma-badge" style={{ color: STATUS_COLOR[request.status], background: `${STATUS_COLOR[request.status]}14` }}>{MOVE_STATUSES.find((s) => s.value === request.status)?.ar}</span></article>)}</div></section>)}{!scheduled.length && <div className="jma-panel jma-empty"><CalendarDays /><p>لا توجد نقلات مجدولة بعد.</p></div>}</div></div>;
}

function ServicesAdmin({ services, reload }) {
  const [editing, setEditing] = useState(null); const [saving, setSaving] = useState(false);
  const blank = { slug: '', icon: 'Truck', category: 'home', title_ar: '', title_en: '', short_ar: '', short_en: '', body_ar: '', body_en: '', is_active: true, sort_order: services.length + 1 };
  const save = async () => { setSaving(true); try { const method = editing.id ? 'PUT' : 'POST'; const url = editing.id ? `/api/services/${editing.slug}` : '/api/services'; const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) }); if (!response.ok) throw new Error((await response.json()).error); setEditing(null); reload(); } catch (err) { alert(err.message); } finally { setSaving(false); } };
  return <div className="jma-stack"><div className="jma-page-title"><div><span>SERVICE CATALOG</span><h2>الخدمات</h2><p>كل خدمة تظهر في الموقع بالعربي والإنجليزي.</p></div><button className="jma-btn primary" onClick={() => setEditing(blank)}><Plus />إضافة خدمة</button></div><div className="jma-service-admin-grid">{services.map((service, index) => <article key={service.id}><span className="jma-service-index">0{index + 1}</span><PackageCheck /><h3>{service.title_ar}</h3><p>{service.short_ar}</p><div><span className={service.is_active ? 'on' : 'off'}>{service.is_active ? 'ظاهرة' : 'مخفية'}</span><button onClick={() => setEditing({ ...service })}><Pencil />تعديل</button></div></article>)}</div>{editing && <div className="jma-modal"><section><header><div><span>SERVICE EDITOR</span><h2>{editing.id ? 'تعديل الخدمة' : 'خدمة جديدة'}</h2></div><button onClick={() => setEditing(null)}><X /></button></header><div className="jma-form-grid"><label><span>الرابط المختصر</span><input disabled={Boolean(editing.id)} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.replace(/[^a-z0-9-]/g, '') })} /></label><label><span>التصنيف</span><select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}><option value="home">نقل</option><option value="packing">تغليف</option><option value="assembly">فك وتركيب</option><option value="loading">رفع وتنزيل</option><option value="office">مكاتب</option></select></label><label><span>العنوان العربي</span><input value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></label><label><span>English title</span><input dir="ltr" value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} /></label><label><span>الوصف المختصر</span><textarea value={editing.short_ar} onChange={(e) => setEditing({ ...editing, short_ar: e.target.value })} /></label><label><span>Short description</span><textarea dir="ltr" value={editing.short_en} onChange={(e) => setEditing({ ...editing, short_en: e.target.value })} /></label><label className="wide"><span>وصف الخدمة</span><textarea value={editing.body_ar} onChange={(e) => setEditing({ ...editing, body_ar: e.target.value })} /></label><label className="wide"><span>English body</span><textarea dir="ltr" value={editing.body_en} onChange={(e) => setEditing({ ...editing, body_en: e.target.value })} /></label><label><span>الترتيب</span><input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></label><label className="jma-check"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />إظهار الخدمة في الموقع</label></div><footer><button className="jma-btn ghost" onClick={() => setEditing(null)}>إلغاء</button><button className="jma-btn primary" disabled={saving} onClick={save}><Save />حفظ الخدمة</button></footer></section></div>}</div>;
}

function AreasAdmin({ areas, reload }) {
  const [form, setForm] = useState({ name_ar: '', name_en: '', sort_order: areas.length + 1 }); const [saving, setSaving] = useState(false);
  const add = async (event) => { event.preventDefault(); setSaving(true); try { const response = await fetch('/api/service-areas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (!response.ok) throw new Error(); setForm({ name_ar: '', name_en: '', sort_order: areas.length + 2 }); reload(); } finally { setSaving(false); } };
  return <div className="jma-stack"><div className="jma-page-title"><div><span>SERVICE COVERAGE</span><h2>مناطق الخدمة</h2><p>المناطق التي تظهر للعميل في الموقع.</p></div></div><div className="jma-grid-2"><section className="jma-panel"><h3>إضافة منطقة</h3><form className="jma-form-grid" onSubmit={add}><label><span>الاسم العربي</span><input required value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></label><label><span>English name</span><input dir="ltr" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></label><button className="jma-btn primary wide" disabled={saving}><Plus />إضافة المنطقة</button></form></section><section className="jma-panel"><h3>المناطق الحالية</h3><div className="jma-area-list">{areas.map((area, index) => <article key={area.id || index}><span><MapPin /></span><div><b>{area.name_ar}</b><small>{area.name_en}</small></div><em>{String(index + 1).padStart(2, '0')}</em></article>)}</div></section></div></div>;
}

function WorkAdmin({ media, reload }) {
  const [form, setForm] = useState({ title: '', description: 'home', image_url: '' }); const [uploading, setUploading] = useState(false);
  const upload = async (file) => { if (!file) return; setUploading(true); try { const body = new FormData(); body.append('image', file); const response = await fetch('/api/upload', { method: 'POST', body }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setForm({ ...form, image_url: data.url }); } finally { setUploading(false); } };
  const add = async (event) => { event.preventDefault(); const response = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (response.ok) { setForm({ title: '', description: 'home', image_url: '' }); reload(); } };
  const remove = async (id) => { if (!confirm('حذف هذا العمل من المعرض؟')) return; await fetch(`/api/media/${id}`, { method: 'DELETE' }); reload(); };
  return <div className="jma-stack"><div className="jma-page-title"><div><span>REAL PROJECTS</span><h2>معرض الأعمال</h2><p>ارفع صور وفيديوهات النقلات وصنفها للعرض.</p></div></div><section className="jma-panel"><form className="jma-media-form" onSubmit={add}><label className="jma-upload-box">{form.image_url ? <img src={form.image_url} alt="Preview" /> : <><UploadCloud /><b>{uploading ? 'جارٍ الرفع...' : 'صورة أو فيديو'}</b><small>JPG, PNG, WEBP, MP4</small></>}<input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => upload(e.target.files[0])} /></label><div className="jma-form-grid"><label><span>عنوان العمل</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label><span>التصنيف</span><select value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}><option value="home">منازل</option><option value="office">مكاتب</option><option value="packing">تغليف</option><option value="assembly">فك وتركيب</option></select></label><button className="jma-btn primary wide" disabled={!form.image_url}><Plus />إضافة للمعرض</button></div></form></section><div className="jma-media-admin-grid">{media.map((item) => <article key={item.id}>{String(item.image_url).match(/\.(mp4|webm)$/i) ? <video src={item.image_url} /> : <img src={item.image_url} alt={item.title} />}<div><b>{item.title || 'بدون عنوان'}</b><small>{item.description}</small></div><button onClick={() => remove(item.id)}><Trash2 /></button></article>)}</div></div>;
}

function ReviewsAdmin({ reviews, reload }) {
  const [form, setForm] = useState({ name_ar: '', name_en: '', text_ar: '', text_en: '', rating: 5 });
  const add = async (event) => { event.preventDefault(); const response = await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (response.ok) { setForm({ name_ar: '', name_en: '', text_ar: '', text_en: '', rating: 5 }); reload(); } };
  const remove = async (id) => { if (!confirm('حذف الرأي؟')) return; await fetch(`/api/testimonials/${id}`, { method: 'DELETE' }); reload(); };
  return <div className="jma-stack"><div className="jma-page-title"><div><span>CUSTOMER VOICE</span><h2>آراء العملاء</h2><p>أضف التقييم بالعربي والإنجليزي.</p></div></div><div className="jma-grid-2"><section className="jma-panel"><h3>رأي جديد</h3><form className="jma-form-grid" onSubmit={add}><label><span>اسم العميل</span><input required value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></label><label><span>English name</span><input dir="ltr" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></label><label className="wide"><span>الرأي</span><textarea required value={form.text_ar} onChange={(e) => setForm({ ...form, text_ar: e.target.value })} /></label><label className="wide"><span>English review</span><textarea dir="ltr" value={form.text_en} onChange={(e) => setForm({ ...form, text_en: e.target.value })} /></label><label><span>التقييم</span><select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>{[5,4,3].map((n) => <option key={n} value={n}>{n} نجوم</option>)}</select></label><button className="jma-btn primary wide"><Plus />إضافة الرأي</button></form></section><section className="jma-review-admin-list">{reviews.map((review, index) => <article key={review.id || index}><div className="jma-stars">{'★'.repeat(review.rating || 5)}</div><p>“{review.text_ar || 'صورة تقييم عميل'}”</p><footer><b>{review.name_ar || 'عميل Joo Move'}</b>{review.id && <button onClick={() => remove(review.id)}><Trash2 /></button>}</footer></article>)}</section></div></div>;
}

function MessagesAdmin({ messages, reload }) {
  const remove = async (id) => { if (!confirm('حذف الرسالة؟')) return; await fetch(`/api/contact/${id}`, { method: 'DELETE' }); reload(); };
  return <div className="jma-stack"><div className="jma-page-title"><div><span>INBOX</span><h2>رسائل العملاء</h2><p>استفسارات نموذج التواصل.</p></div></div><div className="jma-message-list">{messages.map((message) => <article key={message.id}><span className="jma-avatar">{message.first_name?.charAt(0)}</span><div><header><h3>{message.first_name} {message.last_name}</h3><small>{parseDate(message.created_at)}</small></header><p>{message.message}</p><footer><a href={`tel:${message.phone}`}><Phone />{message.phone}</a><a href={`mailto:${message.email}`}><MessageCircle />{message.email}</a></footer></div><button onClick={() => remove(message.id)}><Trash2 /></button></article>)}{!messages.length && <div className="jma-panel jma-empty"><MessageCircle /><p>لا توجد رسائل جديدة.</p></div>}</div></div>;
}

function ContentAdmin() {
  const [page, setPage] = useState(DEFAULT_PAGE_CONTENT.home); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [preview, setPreview] = useState('desktop');
  useEffect(() => { fetch('/api/site-content/home').then((r) => r.json()).then(setPage).finally(() => setLoading(false)); }, []);
  const updateSection = (index, language, key, value) => setPage((current) => ({ ...current, sections: current.sections.map((section, i) => i === index ? { ...section, [`content_${language}`]: { ...section[`content_${language}`], [key]: value } } : section) }));
  const toggle = (index) => setPage((current) => ({ ...current, sections: current.sections.map((section, i) => i === index ? { ...section, is_visible: !section.is_visible } : section) }));
  const move = (index, direction) => setPage((current) => { const sections = [...current.sections]; const target = index + direction; if (target < 0 || target >= sections.length) return current; [sections[index], sections[target]] = [sections[target], sections[index]]; return { ...current, sections: sections.map((section, i) => ({ ...section, sort_order: i + 1 })) }; });
  const save = async () => { setSaving(true); try { const response = await fetch('/api/site-content/home', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(page) }); if (!response.ok) throw new Error(); alert('تم حفظ محتوى الموقع'); } catch { alert('تعذر حفظ المحتوى'); } finally { setSaving(false); } };
  if (loading) return <div className="jma-loading"><RefreshCw />جارٍ تحميل المحتوى...</div>;
  return <div className="jma-stack"><div className="jma-page-title"><div><span>SAFE PAGE BUILDER</span><h2>محتوى الموقع</h2><p>عدّل النصوص والترتيب والظهور مع الحفاظ على التصميم.</p></div><button className="jma-btn primary" onClick={save} disabled={saving}><Save />{saving ? 'جارٍ الحفظ...' : 'حفظ ونشر'}</button></div><section className="jma-panel"><div className="jma-panel-head"><div><h3>SEO الصفحة الرئيسية</h3><p>عنوان ووصف نتائج البحث والمشاركة.</p></div></div><div className="jma-form-grid"><label><span>عنوان عربي</span><input value={page.seo?.title_ar || ''} onChange={(e) => setPage({ ...page, seo: { ...page.seo, title_ar: e.target.value } })} /></label><label><span>English title</span><input dir="ltr" value={page.seo?.title_en || ''} onChange={(e) => setPage({ ...page, seo: { ...page.seo, title_en: e.target.value } })} /></label><label><span>وصف عربي</span><textarea value={page.seo?.description_ar || ''} onChange={(e) => setPage({ ...page, seo: { ...page.seo, description_ar: e.target.value } })} /></label><label><span>English description</span><textarea dir="ltr" value={page.seo?.description_en || ''} onChange={(e) => setPage({ ...page, seo: { ...page.seo, description_en: e.target.value } })} /></label></div></section><div className="jma-content-list">{page.sections.map((section, index) => <article key={section.key} className={!section.is_visible ? 'hidden-section' : ''}><header><GripVertical /><div><small>{section.type.toUpperCase()}</small><h3>{section.content_ar?.title || section.content_ar?.eyebrow || section.key}</h3></div><div><button onClick={() => move(index, -1)} disabled={index === 0}>↑</button><button onClick={() => move(index, 1)} disabled={index === page.sections.length - 1}>↓</button><label><input type="checkbox" checked={section.is_visible} onChange={() => toggle(index)} /><span /></label></div></header><div className="jma-form-grid"><label><span>النص الصغير — عربي</span><input value={section.content_ar?.eyebrow || ''} onChange={(e) => updateSection(index, 'ar', 'eyebrow', e.target.value)} /></label><label><span>Eyebrow — English</span><input dir="ltr" value={section.content_en?.eyebrow || ''} onChange={(e) => updateSection(index, 'en', 'eyebrow', e.target.value)} /></label><label><span>العنوان العربي</span><input value={section.content_ar?.title || ''} onChange={(e) => updateSection(index, 'ar', 'title', e.target.value)} /></label><label><span>English title</span><input dir="ltr" value={section.content_en?.title || ''} onChange={(e) => updateSection(index, 'en', 'title', e.target.value)} /></label><label><span>الوصف العربي</span><textarea value={section.content_ar?.description || ''} onChange={(e) => updateSection(index, 'ar', 'description', e.target.value)} /></label><label><span>English description</span><textarea dir="ltr" value={section.content_en?.description || ''} onChange={(e) => updateSection(index, 'en', 'description', e.target.value)} /></label></div></article>)}</div></div>;
}

function SettingsAdmin({ settings, reload }) {
  const [form, setForm] = useState(settings); const [saving, setSaving] = useState(false);
  useEffect(() => setForm(settings), [settings]);
  const save = async (event) => { event.preventDefault(); setSaving(true); try { const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (!response.ok) throw new Error(); reload(); alert('تم حفظ الإعدادات'); } catch { alert('تعذر حفظ الإعدادات'); } finally { setSaving(false); } };
  return <div className="jma-stack"><div className="jma-page-title"><div><span>GLOBAL SETTINGS</span><h2>الإعدادات والتكاملات</h2><p>بيانات التواصل والروابط وإعدادات القياس.</p></div></div><form className="jma-panel jma-form-grid" onSubmit={save}><label><span>اسم الشركة</span><input value={form.store_name || 'Joo Move'} onChange={(e) => setForm({ ...form, store_name: e.target.value })} /></label><label><span>لغة الموقع الافتراضية</span><select value={form.default_language || 'ar'} onChange={(e) => setForm({ ...form, default_language: e.target.value })}><option value="ar">العربية</option><option value="en">English</option></select></label><label><span>رقم واتساب والدعم</span><input dir="ltr" value={form.support_whatsapp || ''} onChange={(e) => setForm({ ...form, support_whatsapp: e.target.value })} /></label><label><span>رقم واتساب الإدارة</span><input dir="ltr" value={form.admin_whatsapp || ''} onChange={(e) => setForm({ ...form, admin_whatsapp: e.target.value })} /></label><label><span>ساعات العمل — عربي</span><input value={form.joo_hours_ar || ''} onChange={(e) => setForm({ ...form, joo_hours_ar: e.target.value })} /></label><label><span>Working hours — English</span><input dir="ltr" value={form.joo_hours_en || ''} onChange={(e) => setForm({ ...form, joo_hours_en: e.target.value })} /></label><label><span>نطاق الخدمة — عربي</span><input value={form.joo_area_ar || ''} onChange={(e) => setForm({ ...form, joo_area_ar: e.target.value })} /></label><label><span>Service area — English</span><input dir="ltr" value={form.joo_area_en || ''} onChange={(e) => setForm({ ...form, joo_area_en: e.target.value })} /></label><label><span>رابط Facebook</span><input dir="ltr" value={form.facebook_link || ''} onChange={(e) => setForm({ ...form, facebook_link: e.target.value })} /></label><label><span>رابط Instagram</span><input dir="ltr" value={form.instagram_link || ''} onChange={(e) => setForm({ ...form, instagram_link: e.target.value })} /></label><label><span>Meta Pixel ID</span><input dir="ltr" value={form.meta_pixel_id || ''} onChange={(e) => setForm({ ...form, meta_pixel_id: e.target.value })} /></label><label><span>Google Tag ID</span><input dir="ltr" value={form.google_tag_id || ''} onChange={(e) => setForm({ ...form, google_tag_id: e.target.value })} /></label><button className="jma-btn primary wide" disabled={saving}><Save />حفظ الإعدادات</button></form></div>;
}

function WhatsAppAdmin({ settings, reload }) {
  const [status, setStatus] = useState(null); const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({}); const [saving, setSaving] = useState(false);
  const [pairingPhone, setPairingPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [pairingError, setPairingError] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);

  const refreshStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'تعذر فحص واتساب');
      setStatus(result);
      if (['CONNECTED', 'AUTHENTICATED'].includes(result.status)) {
        setPairingCode('');
        setPairingError('');
      }
    } catch (error) {
      setStatus({ status: 'ERROR', lastInitError: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    const timer = window.setInterval(refreshStatus, 3000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!pairingPhone) setPairingPhone(settings.admin_whatsapp || settings.support_whatsapp || '');
  }, [settings, pairingPhone]);
  useEffect(() => {
    const next = {
      wa_template_move_request_customer: settings.wa_template_move_request_customer || DEFAULT_MOVE_REQUEST_CUSTOMER_TEMPLATE,
      wa_template_move_request_admin: settings.wa_template_move_request_admin || DEFAULT_MOVE_REQUEST_ADMIN_TEMPLATE
    };
    for (const item of MOVE_STATUSES) {
      next[`wa_template_move_status_${item.value}`] = settings[`wa_template_move_status_${item.value}`] || DEFAULT_MOVE_STATUS_TEMPLATES[item.value] || '';
    }
    setForm(next);
  }, [settings]);
  const saveTemplates = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error();
      await reload();
      alert('تم حفظ رسائل واتساب');
    } catch {
      alert('تعذر حفظ رسائل واتساب');
    } finally {
      setSaving(false);
    }
  };

  const requestPairingCode = async (event) => {
    event.preventDefault();
    setPairingLoading(true); setPairingError(''); setPairingCode('');
    try {
      const response = await fetch('/api/whatsapp/pairing-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: pairingPhone })
      });
      const result = await response.json();
      if (!response.ok || !result.code) throw new Error(result.error || 'تعذر إنشاء كود الربط');
      setPairingCode(result.code);
      await refreshStatus();
    } catch (error) {
      setPairingError(error.message);
    } finally {
      setPairingLoading(false);
    }
  };

  const restartConnection = async () => {
    setPairingLoading(true); setPairingError(''); setPairingCode('');
    try {
      const response = await fetch('/api/whatsapp/restart', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'تعذر إعادة تشغيل الاتصال');
      setStatus(result);
      window.setTimeout(refreshStatus, 1500);
    } catch (error) {
      setPairingError(error.message);
    } finally {
      setPairingLoading(false);
    }
  };

  const logoutConnection = async () => {
    if (!window.confirm('هل تريد فصل واتساب من Joo Move؟')) return;
    setPairingLoading(true); setPairingError(''); setPairingCode('');
    try {
      const response = await fetch('/api/whatsapp/logout', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'تعذر فصل واتساب');
      await refreshStatus();
    } catch (error) {
      setPairingError(error.message);
    } finally {
      setPairingLoading(false);
    }
  };

  const statusCode = status?.status || 'DISCONNECTED';
  const connected = ['CONNECTED', 'AUTHENTICATED'].includes(statusCode);
  const statusTitle = loading ? 'جارٍ فحص الاتصال...' : connected ? 'واتساب متصل والإشعارات تعمل' : statusCode === 'INITIALIZING' ? 'جارٍ تشغيل واتساب...' : 'واتساب غير متصل';

  return <div className="jma-stack">
    <div className="jma-page-title"><div><span>WHATSAPP OPERATIONS</span><h2>واتساب ورسائل نقل الأثاث</h2><p>اربط الرقم مرة واحدة، وبعدها تُرسل الطلبات وتحديثات الحالات من قائمة الانتظار تلقائيًا.</p></div><button className="jma-btn primary" onClick={saveTemplates} disabled={saving}><Save />{saving ? 'جارٍ الحفظ...' : 'حفظ كل الرسائل'}</button></div>
    <div className="jma-grid-2">
      <section className="jma-panel jma-wa-status">
        <span className={connected ? 'ready' : ''}><Phone /></span>
        <h3>{statusTitle}</h3>
        <p>{connected ? 'طلبات نقل الأثاث وتحديثات الحالات تُرسل تلقائيًا.' : 'أدخل رقم واتساب الذي سيُرسل الإشعارات ثم اربطه بكود الهاتف.'}</p>
        <div className="jma-wa-metrics"><b>{Number(status?.queuedMessages || 0)}</b><small>رسالة في الانتظار</small></div>
        {connected ? <div className="jma-wa-actions"><button className="jma-btn ghost" onClick={restartConnection} disabled={pairingLoading}><RefreshCw />إعادة التشغيل</button><button className="jma-btn danger" onClick={logoutConnection} disabled={pairingLoading}><LogOut />فصل واتساب</button></div> : <form className="jma-wa-pairing" onSubmit={requestPairingCode}><label><span>رقم واتساب بمفتاح الدولة</span><input dir="ltr" inputMode="tel" value={pairingPhone} onChange={(e) => setPairingPhone(e.target.value)} placeholder="201012345678" /></label><button className="jma-btn primary" disabled={pairingLoading || !pairingPhone.trim()}>{pairingLoading ? 'جارٍ إنشاء الكود...' : 'إنشاء كود الربط'}</button>{pairingCode && <div className="jma-pairing-code"><small>من الهاتف: واتساب ← الأجهزة المرتبطة ← ربط جهاز ← الربط برقم الهاتف</small><b dir="ltr">{pairingCode}</b><em>أدخل هذا الكود داخل واتساب</em></div>}{pairingError && <div className="jma-wa-error">{pairingError}</div>}<button type="button" className="jma-link" onClick={restartConnection} disabled={pairingLoading}><RefreshCw />إعادة تهيئة جلسة الربط</button></form>}
      </section>
      <section className="jma-panel"><h3>بيانات الإرسال</h3><div className="jma-info-list"><div><span>حالة الخدمة</span><b>{statusCode}</b></div><div><span>رقم خدمة العملاء</span><bdi>{settings.support_whatsapp || 'غير محدد'}</bdi></div><div><span>رقم الإدارة</span><bdi>{settings.admin_whatsapp || 'غير محدد'}</bdi></div><div><span>رسالة العميل الجديدة</span><b>تشمل بيانات النموذج كاملة</b></div><div><span>رسالة الإدارة</span><b>تشمل روابط الصور والفيديو</b></div>{status?.lastInitError && <div><span>آخر خطأ</span><b>{status.lastInitError}</b></div>}</div></section>
    </div>
    <section className="jma-panel"><div className="jma-panel-head"><div><h3>رسالة الطلب الجديد</h3><p>يمكن استخدام حقول مثل {'{request_number}'} و{'{customer_name}'} و{'{services}'} و{'{media_links}'}.</p></div></div><div className="jma-form-grid"><label className="wide"><span>الرسالة التي تصل للعميل</span><textarea rows="18" value={form.wa_template_move_request_customer || ''} onChange={(e) => setForm({ ...form, wa_template_move_request_customer: e.target.value })} /></label><label className="wide"><span>الرسالة التي تصل للإدارة</span><textarea rows="18" value={form.wa_template_move_request_admin || ''} onChange={(e) => setForm({ ...form, wa_template_move_request_admin: e.target.value })} /></label></div></section>
    <section className="jma-panel"><div className="jma-panel-head"><div><h3>رسائل مراحل نقل الأثاث</h3><p>تُرسل تلقائيًا للعميل عند تغيير حالة الطلب من لوحة الإدارة.</p></div></div><div className="jma-form-grid">{MOVE_STATUSES.map((item) => { const key = `wa_template_move_status_${item.value}`; return <label key={item.value}><span><i style={{ background: STATUS_COLOR[item.value] }} />{item.ar}</span><textarea value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>; })}</div></section>
  </div>;
}

function AboutAgency() {
  return <div className="jma-stack">
    <div className="jma-page-title"><div><span>ABOUT THE DEVELOPER</span><h2>حول S C Marketing</h2><p>الشريك الرقمي المسؤول عن تصميم وتطوير تجربة Joo Move.</p></div></div>
    <section className="jma-about-agency-hero">
      <img src="/s-logo.png" alt="S C Marketing" />
      <div><span>منذ 2018</span><h2>حلول رقمية تبني نشاطك وتكبره</h2><p>مؤسسة رقمية متكاملة متخصصة في التسويق الإلكتروني، تصميم الهويات التجارية، حلول الويب والبرمجة والاستضافة، مع تطوير مستمر يساعد الشركات على الانتشار وتحقيق أهدافها.</p></div>
    </section>
    <div className="jma-about-agency-cards">
      <article><span><Headphones /></span><h3>متابعة احترافية</h3><p>متابعة دائمة، حلول عملية واقتراحات تساعد نشاطك التجاري على التطور.</p></article>
      <article><span><BarChart3 /></span><h3>أكثر من 15,000 حملة</h3><p>خبرة في تحسين الحملات والوصول للعملاء بخطط تناسب كل نشاط.</p></article>
      <article><span><Star /></span><h3>خبرة أكثر من 9 سنوات</h3><p>فريق متخصص يجمع التخطيط والإبداع والتنفيذ والمتابعة في مكان واحد.</p></article>
    </div>
    <section className="jma-about-agency-why"><span>لماذا S C Marketing؟</span><h2>لأن الموقع القوي لازم يساعدك تحقق هدفك</h2><p>نبدأ بفهم نشاطك وأهدافك، ثم نبني خطة واضحة وننفذها بمحتوى أصلي وتصميم جذاب وحلول تقنية حديثة. المتابعة لا تنتهي عند التسليم؛ نستمر في القياس والتطوير وتنفيذ الملاحظات.</p></section>
    <section className="jma-about-agency-contact">
      <a href="tel:01013100178"><Phone /><span><small>اتصل بنا</small><bdi>01013100178</bdi></span></a>
      <a href="mailto:info@selectcustomersmarketing.com"><MessageCircle /><span><small>راسلنا</small><b>info@selectcustomersmarketing.com</b></span></a>
      <div><MapPin /><span><small>العنوان</small><b>شارع 15 مايو أمام كنتاكي، شبرا الخيمة، القاهرة</b></span></div>
    </section>
  </div>;
}

export default function JooAdmin({ navigate }) {
  const [auth, setAuth] = useState(null); const [active, setActive] = useState('dashboard'); const [sidebar, setSidebar] = useState(false);
  const [data, setData] = useState({ requests: [], services: [], areas: [], media: [], reviews: [], messages: [], settings: {} }); const [loading, setLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [seenRequestId, setSeenRequestId] = useState(0);
  const latestRequestIdRef = useRef(null);
  const notificationRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    try {
      setAuth(JSON.parse(localStorage.getItem('joo_admin_auth') || 'null'));
      setSeenRequestId(Number(localStorage.getItem('joo_admin_seen_request_id') || 0));
    } catch {}
  }, []);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') audioContextRef.current = new AudioContext();
      const context = audioContextRef.current;
      const play = () => {
        const now = context.currentTime;
        [[880, 0], [1175, 0.16]].forEach(([frequency, delay]) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = 'sine'; oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0.0001, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.22, now + delay + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.22);
          oscillator.connect(gain); gain.connect(context.destination);
          oscillator.start(now + delay); oscillator.stop(now + delay + 0.24);
        });
      };
      if (context.state === 'suspended') context.resume().then(play).catch(() => {}); else play();
    } catch (error) {
      console.warn('[Admin Notifications] Sound could not be played:', error.message);
    }
  };

  useEffect(() => {
    const unlockSound = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume().catch(() => {});
      } catch {}
    };
    document.addEventListener('pointerdown', unlockSound, { once: true });
    document.addEventListener('keydown', unlockSound, { once: true });
    return () => {
      document.removeEventListener('pointerdown', unlockSound);
      document.removeEventListener('keydown', unlockSound);
    };
  }, []);

  const load = async () => {
    if (!auth) return; setLoading(true);
    const endpoints = ['/api/move-requests', '/api/services?all=true', '/api/service-areas?all=true', '/api/media', '/api/testimonials', '/api/contact', '/api/settings'];
    const results = await Promise.all(endpoints.map((url) => fetch(url, { cache: 'no-store' }).then(async (response) => ({ response, value: response.ok ? await response.json() : [] })).catch(() => ({ response: null, value: [] }))));
    if (results[0].response?.status === 401) { localStorage.removeItem('joo_admin_auth'); setAuth(null); setLoading(false); return; }
    const requests = results[0].value || [];
    latestRequestIdRef.current = requests.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
    setData({ requests, services: results[1].value || [], areas: results[2].value || [], media: results[3].value || [], reviews: results[4].value || [], messages: results[5].value || [], settings: results[6].value || {} }); setLoading(false);
  };
  useEffect(() => { load(); }, [auth]);

  useEffect(() => {
    if (!auth) return undefined;
    let cancelled = false;
    const pollRequests = async () => {
      try {
        const response = await fetch('/api/move-requests', { cache: 'no-store' });
        if (response.status === 401) { localStorage.removeItem('joo_admin_auth'); setAuth(null); return; }
        if (!response.ok) return;
        const requests = await response.json();
        if (cancelled || !Array.isArray(requests)) return;
        const latestId = requests.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
        const previousLatestId = latestRequestIdRef.current;
        latestRequestIdRef.current = latestId;
        setData((current) => ({ ...current, requests }));
        if (previousLatestId !== null && latestId > previousLatestId) playNotificationSound();
      } catch (error) {
        console.warn('[Admin Notifications] Request polling failed:', error.message);
      }
    };
    const timer = window.setInterval(pollRequests, 10000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [auth]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [notificationsOpen]);

  if (!auth) return <AdminLogin onLogin={setAuth} />;
  const latestRequestId = data.requests.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
  const unreadCount = data.requests.filter((item) => Number(item.id) > seenRequestId).length;
  const markNotificationsRead = () => {
    setSeenRequestId(latestRequestId);
    localStorage.setItem('joo_admin_seen_request_id', String(latestRequestId));
  };
  const openRequestsFromNotifications = () => {
    markNotificationsRead(); setNotificationsOpen(false); setActive('requests');
  };
  const logout = () => { localStorage.removeItem('joo_admin_auth'); setAuth(null); };
  const render = () => {
    if (active === 'dashboard') return <Dashboard requests={data.requests} setActive={setActive} />;
    if (active === 'requests') return <Requests requests={data.requests} reload={load} />;
    if (active === 'schedule') return <Schedule requests={data.requests} />;
    if (active === 'services') return <ServicesAdmin services={data.services} reload={load} />;
    if (active === 'areas') return <AreasAdmin areas={data.areas} reload={load} />;
    if (active === 'customers') return <Requests requests={data.requests} reload={load} />;
    if (active === 'work') return <WorkAdmin media={data.media} reload={load} />;
    if (active === 'reviews') return <ReviewsAdmin reviews={data.reviews} reload={load} />;
    if (active === 'messages') return <MessagesAdmin messages={data.messages} reload={load} />;
    if (active === 'content') return <ContentAdmin />;
    if (active === 'whatsapp') return <WhatsAppAdmin settings={data.settings} reload={load} />;
    if (active === 'about_agency') return <AboutAgency />;
    if (active === 'settings') return <SettingsAdmin settings={data.settings} reload={load} />;
    return null;
  };
  return <div className="jma-app"><aside className={`jma-sidebar ${sidebar ? 'open' : ''}`}><div className="jma-sidebar-brand"><img src="/s-logo.png" alt="Joo Move" /><button onClick={() => setSidebar(false)}><X /></button></div><div className="jma-user"><span>{auth.username?.charAt(0).toUpperCase()}</span><div><b>{auth.username}</b><small>Joo Move Admin</small></div></div><nav>{TABS.map(([id, Icon, label]) => <button className={active === id ? 'active' : ''} key={id} onClick={() => { setActive(id); setSidebar(false); }}><Icon /><span>{label}</span>{id === 'requests' && data.requests.filter((r) => r.status === 'received').length > 0 && <em>{data.requests.filter((r) => r.status === 'received').length}</em>}</button>)}</nav><div className="jma-sidebar-footer"><button onClick={() => navigate('/')}><Globe2 />عرض الموقع</button><button onClick={logout}><LogOut />تسجيل الخروج</button></div></aside><main className="jma-main"><header className="jma-topbar"><button className="jma-sidebar-toggle" onClick={() => setSidebar(true)}><Menu /></button><div><span>{TABS.find(([id]) => id === active)?.[2]}</span><small>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</small></div><div><button onClick={load} className={loading ? 'spin' : ''}><RefreshCw /></button><div className="jma-notification-wrap" ref={notificationRef}><button className={`jma-notify ${unreadCount ? 'has-unread' : ''}`} onClick={() => setNotificationsOpen((open) => !open)} aria-label="إشعارات الطلبات"><Bell />{unreadCount > 0 && <em>{unreadCount > 99 ? '99+' : unreadCount}</em>}</button>{notificationsOpen && <section className="jma-notification-menu"><header><div><b>إشعارات الطلبات</b><small>{unreadCount ? `${unreadCount} طلب غير مقروء` : 'لا توجد طلبات جديدة'}</small></div>{unreadCount > 0 && <button onClick={markNotificationsRead}><Check />قراءة الكل</button>}</header><div>{data.requests.slice(0, 6).map((request) => <button className={Number(request.id) > seenRequestId ? 'unread' : ''} key={request.id} onClick={openRequestsFromNotifications}><span>{request.customer_name?.charAt(0) || <Truck />}</span><div><b>طلب نقل جديد من {request.customer_name}</b><small>{request.request_number} • {request.origin_area} ← {request.destination_area}</small><time>{new Date(request.created_at).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</time></div></button>)}{!data.requests.length && <p><Bell />أول طلب جديد هيظهر هنا.</p>}</div><footer><button onClick={openRequestsFromNotifications}>عرض كل طلبات النقل<ChevronLeft /></button></footer></section>}</div><span className="jma-top-avatar">{auth.username?.charAt(0).toUpperCase()}</span></div></header><div className="jma-content">{render()}</div></main></div>;
}
