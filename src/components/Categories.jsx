import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const categories = [];

const Categories = () => {
  const { t } = useLanguage();
  return (
    <section className="categories container">
      <h2 className="section-title">{t('categories.title')}</h2>
      <p className="section-subtitle">{t('categories.subtitle')}</p>
      
      <div className="cat-grid">
        {categories.length === 0 ? (
           <p style={{textAlign: 'center', gridColumn: '1 / -1', padding: '2rem'}}>{t('categories.empty')}</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="cat-card">
              <img src={cat.image} alt={cat.title} />
              <div className="cat-overlay">
                <h3 className="cat-title">{cat.title}</h3>
                <button className="btn-primary">{t('categories.shopNow')}</button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Categories;
