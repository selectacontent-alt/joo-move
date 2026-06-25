import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, FolderTree, Globe, Package, RefreshCw, Save, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const getProductImage = (product) => {
  if (product.images) {
    try {
      const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (typeof first === 'string') return first;
        if (typeof first === 'object') return first.url || first.src || first.path || null;
      }
    } catch {}
  }
  return product.image || null;
};

const getCompletion = (item, type) => {
  const fields = [];

  if (type === 'categories') {
    fields.push([item.name, item.translation?.name]);
  } else {
    fields.push([item.title, item.translation?.title]);
    if (item.description) fields.push([item.description, item.translation?.description]);
    if (item.badge) fields.push([item.badge, item.translation?.badge]);
    (item.colors || []).forEach((source, index) => fields.push([source, item.translation?.colors?.[index]]));
    (item.sizes || []).forEach((source, index) => fields.push([source, item.translation?.sizes?.[index]]));
  }

  const required = fields.filter(([source]) => String(source || '').trim());
  if (required.length === 0) return 100;
  const completed = required.filter(([, value]) => String(value || '').trim()).length;
  return Math.round((completed / required.length) * 100);
};

const CatalogTranslationEditor = () => {
  const { language } = useLanguage();
  const text = (ar, en) => (language === 'ar' ? ar : en);

  const [catalog, setCatalog] = useState({ products: [], categories: [] });
  const [itemType, setItemType] = useState('products');
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCatalog = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/catalog/translations');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load catalog translations');
      setCatalog({
        products: Array.isArray(data.products) ? data.products : [],
        categories: Array.isArray(data.categories) ? data.categories : []
      });
      setDirty(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const items = catalog[itemType] || [];

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(item => {
      const values = itemType === 'products'
        ? [item.id, item.title, item.category, item.translation?.title]
        : [item.id, item.name, item.translation?.name];
      return values.some(value => String(value || '').toLowerCase().includes(query));
    });
  }, [itemType, items, search]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!filteredItems.some(item => Number(item.id) === Number(selectedId))) {
      setSelectedId(filteredItems[0].id);
    }
  }, [filteredItems, selectedId]);

  const selectedItem = items.find(item => Number(item.id) === Number(selectedId)) || null;

  const translatedCounts = useMemo(() => ({
    products: catalog.products.filter(item => getCompletion(item, 'products') === 100).length,
    categories: catalog.categories.filter(item => getCompletion(item, 'categories') === 100).length
  }), [catalog]);

  const updateCategory = (id, value) => {
    setCatalog(prev => ({
      ...prev,
      categories: prev.categories.map(category => (
        Number(category.id) === Number(id)
          ? { ...category, translation: { ...category.translation, name: value } }
          : category
      ))
    }));
    setDirty(true);
    setMessage('');
  };

  const updateProductField = (id, field, value) => {
    setCatalog(prev => ({
      ...prev,
      products: prev.products.map(product => (
        Number(product.id) === Number(id)
          ? { ...product, translation: { ...product.translation, [field]: value } }
          : product
      ))
    }));
    setDirty(true);
    setMessage('');
  };

  const updateProductOption = (id, field, index, value) => {
    setCatalog(prev => ({
      ...prev,
      products: prev.products.map(product => {
        if (Number(product.id) !== Number(id)) return product;
        const values = [...(product.translation?.[field] || [])];
        values[index] = value;
        return {
          ...product,
          translation: { ...product.translation, [field]: values }
        };
      })
    }));
    setDirty(true);
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/catalog/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryTranslations: catalog.categories.map(category => ({
            categoryId: category.id,
            name: category.translation?.name || ''
          })),
          productTranslations: catalog.products.map(product => ({
            productId: product.id,
            title: product.translation?.title || '',
            description: product.translation?.description || '',
            badge: product.translation?.badge || '',
            colors: product.translation?.colors || [],
            sizes: product.translation?.sizes || []
          }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save catalog translations');
      setDirty(false);
      setMessage(text('تم حفظ ترجمات الكتالوج بنجاح.', 'Catalog translations saved successfully.'));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderFieldPair = ({
    fieldKey,
    label,
    source,
    value,
    onChange,
    multiline = false,
    placeholder = ''
  }) => {
    const commonTargetProps = {
      value: value || '',
      onChange: event => onChange(event.target.value),
      className: 'admin-input',
      dir: 'ltr',
      placeholder,
      style: {
        minHeight: multiline ? '120px' : undefined,
        resize: multiline ? 'vertical' : undefined,
        textAlign: 'left',
        borderColor: String(value || '').trim() ? '#86efac' : '#e2e8f0',
        background: String(value || '').trim() ? '#f0fdf4' : '#fff'
      }
    };

    return (
      <div key={fieldKey} style={{ marginBottom: '1.5rem' }}>
        <label className="admin-label" style={{ display: 'block', marginBottom: '0.7rem' }}>{label}</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
          <div>
            <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              {text('العربية (النص الأصلي)', 'Arabic (source)')}
            </span>
            {multiline ? (
              <textarea
                readOnly
                value={source || ''}
                className="admin-input"
                dir="rtl"
                style={{ minHeight: '120px', resize: 'vertical', background: '#f8fafc', color: '#475569' }}
              />
            ) : (
              <input
                readOnly
                value={source || ''}
                className="admin-input"
                dir="rtl"
                style={{ background: '#f8fafc', color: '#475569' }}
              />
            )}
          </div>
          <div>
            <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              English
            </span>
            {multiline ? <textarea {...commonTargetProps} /> : <input type="text" {...commonTargetProps} />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-panel" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-dark)', fontSize: '1.5rem', fontWeight: '900' }}>
              <Globe size={24} color="var(--primary-color)" />
              {text('ترجمة المنتجات والتصنيفات', 'Product & Category Translations')}
            </h2>
            <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontWeight: '600' }}>
              {text('ترجم كل النصوص التي يراها العميل عند اختيار اللغة الإنجليزية.', 'Translate every customer-facing catalog text for the English language.')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={loadCatalog}
              disabled={loading || saving}
              className="btn-admin"
              style={{ background: '#fff', color: '#475569', border: '1px solid #cbd5e1' }}
            >
              <RefreshCw size={18} /> {text('تحديث', 'Refresh')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="btn-admin"
              style={{ opacity: saving || !dirty ? 0.55 : 1, cursor: saving || !dirty ? 'not-allowed' : 'pointer' }}
            >
              <Save size={18} /> {saving ? text('جاري الحفظ...', 'Saving...') : text('حفظ كل الترجمات', 'Save All Translations')}
            </button>
          </div>
        </div>

        {(message || error) && (
          <div style={{
            marginTop: '1rem',
            padding: '0.9rem 1rem',
            borderRadius: '12px',
            background: error ? '#fef2f2' : '#f0fdf4',
            color: error ? '#b91c1c' : '#15803d',
            border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}`,
            fontWeight: '800'
          }}>
            {error || message}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        <div className="admin-panel" style={{ padding: '1rem', position: 'sticky', top: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { key: 'products', icon: <Package size={18} />, label: text('المنتجات', 'Products') },
              { key: 'categories', icon: <FolderTree size={18} />, label: text('التصنيفات', 'Categories') }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setItemType(tab.key);
                  setSearch('');
                  setSelectedId(null);
                }}
                style={{
                  border: itemType === tab.key ? '1px solid var(--primary-color)' : '1px solid #e2e8f0',
                  background: itemType === tab.key ? '#fffbeb' : '#fff',
                  color: itemType === tab.key ? 'var(--primary-color)' : '#64748b',
                  borderRadius: '12px',
                  padding: '0.8rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="admin-input"
              placeholder={text('ابحث بالاسم أو الرقم...', 'Search by name or ID...')}
              style={{ paddingRight: '2.5rem' }}
            />
          </div>

          <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.8rem' }}>
            {text('مكتمل', 'Complete')}: {translatedCounts[itemType]} / {items.length}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '65vh', overflowY: 'auto', paddingLeft: '0.2rem' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontWeight: '800' }}>
                {text('جاري تحميل الكتالوج...', 'Loading catalog...')}
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontWeight: '800' }}>
                {text('لا توجد نتائج.', 'No results found.')}
              </div>
            ) : filteredItems.map(item => {
              const completion = getCompletion(item, itemType);
              const selected = Number(item.id) === Number(selectedId);
              const label = itemType === 'products' ? item.title : item.name;
              const translatedLabel = itemType === 'products' ? item.translation?.title : item.translation?.name;
              return (
                <button
                  key={`${itemType}-${item.id}`}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  style={{
                    width: '100%',
                    border: selected ? '1px solid var(--primary-color)' : '1px solid #e2e8f0',
                    background: selected ? '#fffbeb' : '#fff',
                    borderRadius: '14px',
                    padding: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem',
                    textAlign: 'right'
                  }}
                >
                  {itemType === 'products' ? (
                    <img
                      src={getProductImage(item) || 'https://via.placeholder.com/44'}
                      alt={label}
                      style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', background: '#f8fafc' }}
                    />
                  ) : (
                    <span style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FolderTree size={21} />
                    </span>
                  )}
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ display: 'block', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</strong>
                    <span dir="ltr" style={{ display: 'block', color: translatedLabel ? '#16a34a' : '#94a3b8', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                      {translatedLabel || text('لم تتم الترجمة بعد', 'Not translated yet')}
                    </span>
                  </span>
                  <span style={{ color: completion === 100 ? '#16a34a' : '#d97706', fontSize: '0.75rem', fontWeight: '900' }}>
                    {completion}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-panel" style={{ padding: '2rem' }}>
          {!selectedItem ? (
            <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
              <Globe size={52} style={{ opacity: 0.35, marginBottom: '1rem' }} />
              <h3 style={{ margin: 0, color: '#64748b' }}>{text('اختر عنصرًا لبدء الترجمة', 'Select an item to start translating')}</h3>
            </div>
          ) : itemType === 'categories' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800' }}>#{selectedItem.id}</span>
                  <h3 style={{ margin: '0.2rem 0 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '900' }}>{selectedItem.name}</h3>
                </div>
                {getCompletion(selectedItem, 'categories') === 100 && <CheckCircle size={26} color="#16a34a" />}
              </div>
              {renderFieldPair({
                label: text('اسم التصنيف', 'Category Name'),
                source: selectedItem.name,
                value: selectedItem.translation?.name,
                onChange: value => updateCategory(selectedItem.id, value),
                placeholder: 'English category name'
              })}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                  <img
                    src={getProductImage(selectedItem) || 'https://via.placeholder.com/64'}
                    alt={selectedItem.title}
                    style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover', background: '#f8fafc' }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800' }}>#{selectedItem.id} · {selectedItem.category}</span>
                    <h3 style={{ margin: '0.2rem 0 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedItem.title}</h3>
                  </div>
                </div>
                {getCompletion(selectedItem, 'products') === 100 && <CheckCircle size={26} color="#16a34a" />}
              </div>

              {renderFieldPair({
                label: text('اسم المنتج', 'Product Title'),
                source: selectedItem.title,
                value: selectedItem.translation?.title,
                onChange: value => updateProductField(selectedItem.id, 'title', value),
                placeholder: 'English product title'
              })}

              {selectedItem.description && renderFieldPair({
                label: text('وصف المنتج', 'Product Description'),
                source: selectedItem.description,
                value: selectedItem.translation?.description,
                onChange: value => updateProductField(selectedItem.id, 'description', value),
                multiline: true,
                placeholder: 'English product description'
              })}

              {selectedItem.badge && renderFieldPair({
                label: text('شارة المنتج', 'Product Badge'),
                source: selectedItem.badge,
                value: selectedItem.translation?.badge,
                onChange: value => updateProductField(selectedItem.id, 'badge', value),
                placeholder: 'English badge text'
              })}

              {(selectedItem.colors || []).length > 0 && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 1.2rem', color: '#0f172a', fontSize: '1.1rem', fontWeight: '900' }}>{text('الألوان', 'Colors')}</h4>
                  {selectedItem.colors.map((color, index) => renderFieldPair({
                    fieldKey: `color-${index}`,
                    label: `${text('لون', 'Color')} ${index + 1}`,
                    source: color,
                    value: selectedItem.translation?.colors?.[index],
                    onChange: value => updateProductOption(selectedItem.id, 'colors', index, value),
                    placeholder: 'English color name'
                  }))}
                </div>
              )}

              {(selectedItem.sizes || []).length > 0 && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 1.2rem', color: '#0f172a', fontSize: '1.1rem', fontWeight: '900' }}>{text('المقاسات', 'Sizes')}</h4>
                  {selectedItem.sizes.map((size, index) => renderFieldPair({
                    fieldKey: `size-${index}`,
                    label: `${text('مقاس', 'Size')} ${index + 1}`,
                    source: size,
                    value: selectedItem.translation?.sizes?.[index],
                    onChange: value => updateProductOption(selectedItem.id, 'sizes', index, value),
                    placeholder: 'English size name'
                  }))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogTranslationEditor;
