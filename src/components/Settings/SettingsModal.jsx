import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  X,
  Globe,
  Volume2,
  VolumeX,
  DollarSign,
  QrCode,
  LogOut,
  User,
  Building2,
  Sliders,
  Upload,
  Image as ImageIcon,
  Check,
  Phone,
  MapPin,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { RestaurantLogo, ICON_OPTIONS } from '../Common/RestaurantLogo';

export const SettingsModal = ({ onClose, onOpenAuth }) => {
  const {
    user,
    logout,
    language,
    toggleLanguage,
    settings,
    updateSettings,
    selectedTable,
    changeTable,
    tablesList,
    branding,
    updateBranding,
    t
  } = useApp();

  // Active Tab: 'branding' | 'preferences' | 'account'
  const [activeTab, setActiveTab] = useState('branding');

  // Local state for branding form
  const [formData, setFormData] = useState({
    restaurantName: branding.restaurantName || 'Le Bistro',
    tagline: branding.tagline || 'Fine Dining & Fresh Taste',
    logoType: branding.logoType || 'icon',
    logoIcon: branding.logoIcon || 'Utensils',
    logoUrl: branding.logoUrl || '',
    phone: branding.phone || '+252 61 500 0000',
    address: branding.address || 'Maka Al-Mukarama Street, Mogadishu',
    website: branding.website || 'www.lebistro-restaurant.com',
  });

  const [savingBranding, setSavingBranding] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle local image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Check size limit (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('Sawirku wuu ka weyn yahay 4MB. Fadlan dooro sawir ka yar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        logoType: 'image',
        logoUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save branding changes to context and backend
  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setSavingBranding(true);
    const res = await updateBranding(formData);
    setSavingBranding(false);
    if (res && res.success !== false) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content payment-modal" style={{ maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'rgba(230,81,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Settings size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{t('settingsTitle')}</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{formData.restaurantName}</p>
            </div>
          </div>
          <button className="icon-btn-ghost" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '12px 20px 0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.15)'
        }}>
          <button
            onClick={() => setActiveTab('branding')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'branding' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'branding' ? '#FFFFFF' : '#94A3B8',
              fontWeight: activeTab === 'branding' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={16} style={{ color: activeTab === 'branding' ? 'var(--primary)' : 'inherit' }} />
            <span>{t('brandingTab')}</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'preferences' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'preferences' ? '#FFFFFF' : '#94A3B8',
              fontWeight: activeTab === 'preferences' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Sliders size={16} style={{ color: activeTab === 'preferences' ? 'var(--primary)' : 'inherit' }} />
            <span>{t('preferencesTab')}</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 12px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'account' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'account' ? '#FFFFFF' : '#94A3B8',
              fontWeight: activeTab === 'account' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={16} style={{ color: activeTab === 'account' ? 'var(--primary)' : 'inherit' }} />
            <span>{t('accountTab')}</span>
          </button>
        </div>

        {/* Modal Body Container with Scroll */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>

          {/* TAB 1: RESTAURANT BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <form onSubmit={handleSaveBranding} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Description */}
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4 }}>
                {t('brandingDesc')}
              </p>

              {/* LIVE BRANDING PREVIEW CARD */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(230,81,0,0.12) 0%, rgba(26,24,23,0.9) 100%)',
                border: '1.5px dashed rgba(230,81,0,0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 12,
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Sparkles size={11} />
                  <span>{t('livePreview')}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <RestaurantLogo
                    branding={formData}
                    size={28}
                    containerSize={52}
                    showBorder={true}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 800 }}>
                      {formData.restaurantName || 'Le Bistro'}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#CBD5E1' }}>
                      {formData.tagline || 'Fine Dining & Fresh Taste'}
                    </p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: '0.7rem', color: '#94A3B8' }}>
                      <span>📞 {formData.phone}</span>
                      <span>📍 {formData.address.split(',')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Notification Alert */}
              {saveSuccess && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22C55E',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#86EFAC',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  <Check size={16} />
                  <span>{t('brandingSavedSuccess')}</span>
                </div>
              )}

              {/* Field 1: Restaurant Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                  {t('restaurantNameLabel')} *
                </label>
                <input
                  type="text"
                  className="theme-input"
                  required
                  value={formData.restaurantName}
                  placeholder={t('restaurantNamePlaceholder')}
                  onChange={(e) => handleFieldChange('restaurantName', e.target.value)}
                  style={{ width: '100%', fontSize: '0.9rem', padding: '10px 14px' }}
                />
              </div>

              {/* Field 2: Restaurant Tagline */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
                  {t('taglineLabel')}
                </label>
                <input
                  type="text"
                  className="theme-input"
                  value={formData.tagline}
                  placeholder={t('taglinePlaceholder')}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  style={{ width: '100%', fontSize: '0.9rem', padding: '10px 14px' }}
                />
              </div>

              {/* Field 3: Logo Type Selection (Icon vs Image) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 8 }}>
                  {t('logoSelectionLabel')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('logoType', 'icon')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: formData.logoType === 'icon' ? 'rgba(230,81,0,0.18)' : 'rgba(255,255,255,0.04)',
                      border: formData.logoType === 'icon' ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                      color: formData.logoType === 'icon' ? '#FFFFFF' : '#94A3B8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Sparkles size={16} style={{ color: formData.logoType === 'icon' ? 'var(--primary)' : 'inherit' }} />
                    <span>{t('iconLogo')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFieldChange('logoType', 'image')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: formData.logoType === 'image' ? 'rgba(230,81,0,0.18)' : 'rgba(255,255,255,0.04)',
                      border: formData.logoType === 'image' ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                      color: formData.logoType === 'image' ? '#FFFFFF' : '#94A3B8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ImageIcon size={16} style={{ color: formData.logoType === 'image' ? 'var(--primary)' : 'inherit' }} />
                    <span>{t('customImageLogo')}</span>
                  </button>
                </div>
              </div>

              {/* Logo Selection Options: ICON PICKER GRID */}
              {formData.logoType === 'icon' && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: 10 }}>
                    {t('selectIconNotice')}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 8
                  }}>
                    {ICON_OPTIONS.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = formData.logoIcon === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleFieldChange('logoIcon', item.id)}
                          title={item.label}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                            padding: '10px 6px',
                            background: isSelected ? 'rgba(230,81,0,0.22)' : 'rgba(255,255,255,0.05)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius-md)',
                            color: isSelected ? 'var(--primary)' : '#CBD5E1',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: isSelected ? 'scale(1.04)' : 'scale(1)'
                          }}
                        >
                          <IconComp size={22} />
                          <span style={{ fontSize: '0.62rem', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                            {item.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Logo Selection Options: CUSTOM IMAGE UPLOAD & URL */}
              {formData.logoType === 'image' && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: 6 }}>
                      {t('uploadLogoLabel')}
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px dashed rgba(255,255,255,0.25)',
                          color: '#FFFFFF',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8
                        }}
                      >
                        <Upload size={16} style={{ color: 'var(--primary)' }} />
                        <span>{t('uploadLogoLabel')}</span>
                      </button>

                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => handleFieldChange('logoUrl', '')}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid #EF4444',
                            color: '#F87171',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {t('removeLogo')}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: 6 }}>
                      {t('orEnterLogoUrl')}
                    </label>
                    <input
                      type="url"
                      className="theme-input"
                      value={formData.logoUrl.startsWith('data:') ? '[Uploaded Image File]' : formData.logoUrl}
                      placeholder={t('logoUrlPlaceholder')}
                      onChange={(e) => handleFieldChange('logoUrl', e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                    />
                  </div>
                </div>
              )}

              {/* Receipt & Contact Information Section */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} />
                  <span>{t('receiptInfo')}</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4 }}>
                    {t('receiptPhone')}
                  </label>
                  <input
                    type="text"
                    className="theme-input"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+252 61 500 0000"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4 }}>
                    {t('receiptAddress')}
                  </label>
                  <input
                    type="text"
                    className="theme-input"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    placeholder="Maka Al-Mukarama Street, Mogadishu"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4 }}>
                    {t('receiptWebsite')}
                  </label>
                  <input
                    type="text"
                    className="theme-input"
                    value={formData.website}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    placeholder="www.myrestaurant.com"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                </div>
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                disabled={savingBranding}
                className="btn-primary-lg"
                style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {savingBranding ? (
                  <>
                    <RefreshCw size={18} className="spin-animate" />
                    <span>Saving changes...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>{t('saveBrandingBtn')}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SYSTEM PREFERENCES */}
          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                {t('systemPreferences')}
              </div>

              {/* 1. Language Preference */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Globe size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Language / Luqadda</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Somali / English</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="lang-switcher-btn"
                  onClick={() => toggleLanguage()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    color: '#F4ECE4',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  {language === 'so' ? '🇸🇴 Somali' : '🇬🇧 English'}
                </button>
              </div>

              {/* 2. Audio Chime Alerts */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {settings.audioChime ? (
                    <Volume2 size={18} style={{ color: 'var(--sage-green, #22C55E)' }} />
                  ) : (
                    <VolumeX size={18} style={{ color: '#94A3B8' }} />
                  )}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('audioAlerts')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{t('audioAlertsDesc')}</div>
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.audioChime}
                    onChange={(e) => updateSettings({ audioChime: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* 3. Currency Display */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <DollarSign size={18} style={{ color: 'var(--warm-amber, #F59E0B)' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('currencyLabel')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>USD ($) / SOS (Shilling)</div>
                  </div>
                </div>
                <select
                  className="theme-input"
                  value={settings.currency}
                  onChange={(e) => updateSettings({ currency: e.target.value })}
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem', background: '#262320' }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="SOS">SOS (Shilling)</option>
                </select>
              </div>

              {/* 4. Default Dining Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <QrCode size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('table')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Active dining table</div>
                  </div>
                </div>
                <select
                  className="theme-input"
                  value={selectedTable}
                  onChange={(e) => changeTable(e.target.value)}
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem', background: '#262320' }}
                >
                  {tablesList.length > 0 ? (
                    tablesList.map((tbl) => (
                      <option key={tbl.id} value={tbl.table_number}>
                        {tbl.table_number}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="TB-01">TB-01</option>
                      <option value="TB-03">TB-03</option>
                      <option value="TB-07">TB-07</option>
                      <option value="TB-12">TB-12</option>
                    </>
                  )}
                </select>
              </div>

              <button className="btn-primary-lg" onClick={onClose} style={{ padding: '12px', marginTop: 10 }}>
                <span>{t('saveSettings')}</span>
              </button>
            </div>
          )}

          {/* TAB 3: USER ACCOUNT */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                {t('account')}
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 12
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: user ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1.4rem'
                }}>
                  {user ? user.name.charAt(0).toUpperCase() : <User size={28} />}
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#F8FAFC' }}>
                    {user ? user.name : t('guestUser')}
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
                    {user ? user.email : 'Log in for saved order history and management'}
                  </p>
                  {user && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: 8,
                      background: user.role === 'admin' ? '#DC2626' : user.role === 'kitchen' ? '#D97706' : '#16A34A',
                      color: '#FFFFFF',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {user.role}
                    </span>
                  )}
                </div>

                {user ? (
                  <button
                    onClick={() => { logout(); onClose(); }}
                    style={{
                      marginTop: 8,
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #EF4444',
                      color: '#F87171',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <LogOut size={16} />
                    <span>{t('logout')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { onClose(); onOpenAuth(); }}
                    className="btn-primary"
                    style={{ marginTop: 8, padding: '10px 24px', fontSize: '0.9rem' }}
                  >
                    <span>{t('signIn')}</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
