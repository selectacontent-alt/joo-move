'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Eye } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{ color: '#ffbc01', fontSize: '1.2rem', fontWeight: 'bold' }}>جاري تحميل الإحصائيات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{ color: '#ef4444', fontSize: '1.2rem' }}>خطأ: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '3rem 2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }} dir="rtl">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
            لوحة الإحصائيات <span style={{ color: '#ffbc01' }}>والأداء</span>
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>نظرة عامة على مبيعات وأداء متجر الرحاب</p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem' 
        }}>
          {/* Revenue Card */}
          <div style={{ 
            background: 'linear-gradient(145deg, #1e293b, #0f172a)', 
            padding: '2rem', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>إجمالي الإيرادات</h3>
              <div style={{ background: 'rgba(157, 2, 124, 0.2)', padding: '0.8rem', borderRadius: '16px' }}>
                <DollarSign size={24} color="#9d027c" />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              {metrics.totalRevenue.toLocaleString('en-US')}
              <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>EGP</span>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: '#9d027c' }}></div>
          </div>

          {/* Orders Card */}
          <div style={{ 
            background: 'linear-gradient(145deg, #1e293b, #0f172a)', 
            padding: '2rem', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>الطلبات المكتملة</h3>
              <div style={{ background: 'rgba(255, 188, 1, 0.2)', padding: '0.8rem', borderRadius: '16px' }}>
                <ShoppingBag size={24} color="#ffbc01" />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff' }}>
              {metrics.totalOrders.toLocaleString('en-US')}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: '#ffbc01' }}></div>
          </div>

          {/* Conversion Rate Card */}
          <div style={{ 
            background: 'linear-gradient(145deg, #1e293b, #0f172a)', 
            padding: '2rem', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>معدل التحويل (CVR)</h3>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.8rem', borderRadius: '16px' }}>
                <TrendingUp size={24} color="#10b981" />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
              {metrics.conversionRate}
              <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 'normal' }}>%</span>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: '#10b981' }}></div>
          </div>

          {/* Views Card */}
          <div style={{ 
            background: 'linear-gradient(145deg, #1e293b, #0f172a)', 
            padding: '2rem', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0, fontWeight: '600' }}>مشاهدات المنتجات</h3>
              <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '0.8rem', borderRadius: '16px' }}>
                <Eye size={24} color="#38bdf8" />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff' }}>
              {metrics.totalViews.toLocaleString('en-US')}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: '#38bdf8' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
}
