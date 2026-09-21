import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Utensils, ShoppingBag, Clock, Bell } from 'lucide-react';
import { CallWaiterModal } from '../Customer/CallWaiterModal';

export const BottomNavbar = () => {
  const { activeTab, setActiveTab, cartCount, t } = useApp();
  const [showCallWaiter, setShowCallWaiter] = useState(false);

  return (
    <>
      <div className="mobile-navbar">
        {/* Menu Tab */}
        <button
          className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <Utensils size={20} />
          <span>Menu</span>
        </button>

        {/* Cart Tab */}
        <button
          className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
          style={{ position: 'relative' }}
        >
          <ShoppingBag size={20} />
          <span>{t('yourCart') ? t('yourCart').split(' ')[0] : 'Cart'}</span>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -2,
              right: 12,
              background: 'var(--primary)',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: 16,
              height: 16,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cartCount}
            </span>
          )}
        </button>

        {/* Order Tracking Tab */}
        <button
          className={`nav-item ${activeTab === 'track' || activeTab === 'confirmation' ? 'active' : ''}`}
          onClick={() => setActiveTab('track')}
        >
          <Clock size={20} />
          <span>{t('trackLive') || 'Dalabka'}</span>
        </button>

        {/* Call Waiter Tab (Replacing staff tabs) */}
        <button
          className="nav-item"
          onClick={() => setShowCallWaiter(true)}
          style={{ color: '#EA580C' }}
        >
          <Bell size={20} />
          <span>{t('waiterRole') ? t('waiterRole').split(' ')[0] : 'Kabalyeer'}</span>
        </button>
      </div>

      {/* Waiter Call Modal */}
      <CallWaiterModal
        isOpen={showCallWaiter}
        onClose={() => setShowCallWaiter(false)}
      />
    </>
  );
};
