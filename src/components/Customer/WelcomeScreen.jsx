import React from 'react';
import { useApp } from '../../context/AppContext';
import { QrCode, ArrowRight, Clock, Sparkles, ShoppingBag } from 'lucide-react';
import { RestaurantLogo } from '../Common/RestaurantLogo';

export const WelcomeScreen = ({ onStartOrdering }) => {
  const { selectedTable, changeTable, branding, language, t } = useApp();

  return (
    <div className="welcome-card">
      {selectedTable ? (
        <div className="table-pill-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <QrCode size={16} />
          <span>{t('welcomeSubtitle')} {t('table')} {selectedTable.replace('TB-', '')}</span>
          <button
            onClick={() => changeTable(null)}
            style={{
              background: 'rgba(234, 88, 12, 0.1)',
              border: 'none',
              borderRadius: 12,
              padding: '2px 8px',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 700
            }}
            title="Ka dhig Takeaway"
          >
            ✕ Ka saar
          </button>
        </div>
      ) : (
        <div className="table-pill-badge" style={{ background: 'rgba(217, 83, 30, 0.08)', color: 'var(--primary)', borderColor: 'rgba(217, 83, 30, 0.2)' }}>
          <ShoppingBag size={15} />
          <span>{language === 'so' ? 'Dalabka Dhoofka (Takeaway)' : 'Takeaway / Direct Order'}</span>
        </div>
      )}

      <div style={{ margin: '16px 0 24px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <RestaurantLogo branding={branding} size={32} containerSize={56} showBorder={true} />
        </div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: 4, fontWeight: 800 }}>
          {language === 'so'
            ? `Kusoo Dhawoow ${branding?.restaurantName || 'Le Bistro'}`
            : `Welcome to ${branding?.restaurantName || 'Le Bistro'}`}
        </h1>
        {branding?.tagline && (
          <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', margin: '0 0 6px 0' }}>
            {branding.tagline}
          </p>
        )}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          {t('scanNotice')}
        </p>
      </div>

      <div className="hero-banner">
        <img src="/images/smash_burger.jpg" alt="Chef's Signature Smash Burger" />
        <div className="hero-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="hero-tag">{t('popular')}</span>
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>$14.50</span>
          </div>
          <h3 style={{ fontSize: '1.15rem', marginTop: 4 }}>Double Truffle Smash Burger</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>
            <Clock size={14} />
            <span>{t('freshFood')} | 12-15 {t('minutes')}</span>
          </div>
        </div>
      </div>

      <button className="btn-primary-lg" onClick={onStartOrdering}>
        <span>{t('startOrdering')}</span>
        <ArrowRight size={20} />
      </button>

      {/* 3 Simple Steps */}
      <div style={{ marginTop: 32, textAlign: 'left', background: '#FFFFFF', padding: 18, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          <span>{branding?.restaurantName || 'Le Bistro'} Quick Dining</span>
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-cream)', padding: 10, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>1</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>{t('customize')}</div>
          </div>
          <div style={{ background: 'var(--bg-cream)', padding: 10, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>2</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>{t('selectPaymentMethod')}</div>
          </div>
          <div style={{ background: 'var(--bg-cream)', padding: 10, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>3</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>{t('trackLive')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
