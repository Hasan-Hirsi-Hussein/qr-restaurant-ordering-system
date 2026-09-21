import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Utensils, ChefHat, ShieldCheck, QrCode, Globe, Settings, User, LogIn, Bell, Lock, LogOut } from 'lucide-react';
import { AuthModal } from '../Auth/AuthModal';
import { SettingsModal } from '../Settings/SettingsModal';
import { StaffAccessModal } from './StaffAccessModal';
import { RestaurantLogo } from '../Common/RestaurantLogo';

export const RoleHeader = () => {
  const {
    currentRole,
    setCurrentRole,
    activeTab,
    setActiveTab,
    selectedTable,
    changeTable,
    tablesList,
    language,
    toggleLanguage,
    t,
    user,
    branding,
    showAuthModal,
    setShowAuthModal,
    showSettingsModal,
    setShowSettingsModal,
    waiterCalls,
    isAdminSession,
    setAdminAuth
  } = useApp();

  const [showStaffModal, setShowStaffModal] = useState(false);

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    const url = new URL(window.location);
    url.searchParams.set('role', role);
    window.history.pushState({}, '', url);

    if (role === 'customer') {
      setActiveTab('menu');
    } else if (role === 'waiter') {
      setActiveTab('waiter');
    } else if (role === 'kitchen') {
      setActiveTab('kitchen');
    } else if (role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleSignOutAdmin = () => {
    setAdminAuth(false);
    handleRoleChange('customer');
  };

  const isCustomer = currentRole === 'customer';
  const isKitchen = currentRole === 'kitchen';
  const isWaiter = currentRole === 'waiter';

  return (
    <>
      <header className="role-header">
        {/* Brand Logo & Name */}
        <div
          className="brand-badge"
          style={{ cursor: isAdminSession ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => {
            if (isAdminSession) setShowSettingsModal(true);
          }}
          title={isAdminSession ? "Settings & Branding" : branding?.restaurantName || 'Le Bistro'}
        >
          <RestaurantLogo branding={branding} size={16} containerSize={26} />
          <span>{branding?.restaurantName || 'Le Bistro'}</span>
          {isAdminSession && (
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 4,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Owner / Admin
            </span>
          )}
        </div>

        {/* 1. MASTER ADMIN NAVIGATION (If Admin is logged in or verified with PIN 9999, they see ALL sections!) */}
        {isAdminSession ? (
          <nav className="role-nav">
            <button
              className={`role-btn ${currentRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
              title="Dashboard-ka Maamulka & POS"
            >
              <ShieldCheck size={14} />
              <span>Maamulka</span>
            </button>
            <button
              className={`role-btn ${currentRole === 'kitchen' ? 'active' : ''}`}
              onClick={() => handleRoleChange('kitchen')}
              title="Fiiri KDS-ka Jikada (Live)"
            >
              <ChefHat size={14} />
              <span>Jikada</span>
            </button>
            <button
              className={`role-btn ${currentRole === 'waiter' ? 'active' : ''}`}
              onClick={() => handleRoleChange('waiter')}
              title="Fiiri Shaashadda Waiter-ka"
              style={{ position: 'relative' }}
            >
              <Bell size={14} />
              <span>Waiter</span>
              {waiterCalls && waiterCalls.length > 0 && (
                <span style={{
                  background: '#EA580C',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  marginLeft: 3
                }}>
                  {waiterCalls.length}
                </span>
              )}
            </button>
            <button
              className={`role-btn ${currentRole === 'customer' ? 'active' : ''}`}
              onClick={() => handleRoleChange('customer')}
              title="Eeg sida uu Macmiilku u arko Menu-ga"
            >
              <Utensils size={14} />
              <span>Macmiilka</span>
            </button>
          </nav>
        ) : (
          /* 2. NON-ADMIN STAFF OR CUSTOMER */
          <>
            {/* KITCHEN ONLY: Badge only, no admin tabs */}
            {isKitchen && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(234, 88, 12, 0.15)',
                border: '1px solid rgba(234, 88, 12, 0.4)',
                padding: '5px 14px',
                borderRadius: '20px',
                color: '#FF9E66',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                <ChefHat size={16} style={{ color: '#EA580C' }} />
                <span>Jikada (KDS Mode)</span>
              </div>
            )}

            {/* WAITER ONLY: Badge only, no admin tabs */}
            {isWaiter && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                padding: '5px 14px',
                borderRadius: '20px',
                color: '#93C5FD',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                <Bell size={16} style={{ color: '#3B82F6' }} />
                <span>Adeegaha (Waiter Mode)</span>
                {waiterCalls && waiterCalls.length > 0 && (
                  <span style={{
                    background: '#EA580C',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    padding: '2px 7px',
                    fontSize: '0.7rem',
                    fontWeight: 900
                  }}>
                    {waiterCalls.length}
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* CUSTOMER MODE (Non-Admin): Read-only Table Badge */}
          {!isAdminSession && isCustomer && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(217, 83, 30, 0.18)',
                border: '1px solid rgba(217, 83, 30, 0.35)',
                padding: '4px 10px',
                borderRadius: '20px',
                color: '#FFB28A',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
              title="Miiska aad fadhido"
            >
              <QrCode size={13} style={{ color: 'var(--primary)' }} />
              <span>{selectedTable}</span>
            </div>
          )}

          {/* ADMIN SESSION: Table Selector dropdown */}
          {isAdminSession && (
            <div className="table-selector">
              <QrCode size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem', color: '#A09790' }}>{t('table')}:</span>
              <select value={selectedTable || ''} onChange={(e) => changeTable(e.target.value || null)}>
                <option value="">Takeaway / Miis La'aan</option>
                {tablesList.length > 0 ? (
                  tablesList.map((t) => (
                    <option key={t.id} value={t.table_number}>
                      {t.table_number}
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
          )}

          {/* Language Switcher */}
          <button
            className="lang-switcher-btn"
            onClick={() => toggleLanguage()}
            title="Toggle Somali / English"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '4px 10px',
              color: '#F4ECE4',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
          >
            <Globe size={14} style={{ color: 'var(--primary)' }} />
            <span>{language === 'so' ? '🇸🇴 SO' : '🇬🇧 EN'}</span>
          </button>

          {/* CUSTOMER ONLY: Staff Access Button (PIN Protected) */}
          {!isAdminSession && isCustomer && (
            <button
              onClick={() => setShowStaffModal(true)}
              title="Gelitaanka Shaqaalaha & Maamulka (Staff Only)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                padding: '4px 9px',
                color: '#A09790',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#A09790';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <Lock size={12} style={{ color: 'var(--primary)' }} />
              <span>Staff</span>
            </button>
          )}

          {/* ADMIN SESSION: Settings Gear Button */}
          {isAdminSession && (
            <button
              onClick={() => setShowSettingsModal(true)}
              title="Settings & Restaurant Configuration"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                color: '#F4ECE4',
                cursor: 'pointer'
              }}
            >
              <Settings size={16} style={{ color: 'var(--primary)' }} />
            </button>
          )}

          {/* ADMIN MASTER EXIT: Sign Out Admin */}
          {isAdminSession ? (
            <button
              onClick={handleSignOutAdmin}
              title="Ka bax Maamulka (Sign Out Admin)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '20px',
                padding: '4px 10px',
                color: '#FCA5A5',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          ) : (
            /* KITCHEN / WAITER EXIT: Ka bax to Customer */
            !isCustomer && (
              <button
                onClick={() => handleRoleChange('customer')}
                title="Ka bax / U noqo Shaashadda Macmiilka"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  color: '#FCA5A5',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <LogOut size={13} />
                <span>Ka bax</span>
              </button>
            )
          )}
        </div>
      </header>

      {/* Staff Access PIN Modal */}
      <StaffAccessModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onOpenFullAuth={() => setShowAuthModal(true)}
      />

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Settings Modal (Admin only) */}
      {showSettingsModal && isAdminSession && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}
    </>
  );
};
