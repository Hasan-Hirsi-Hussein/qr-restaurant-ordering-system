import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Plus, Minus, Trash2, QrCode, Utensils, ShieldCheck } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export const CartScreen = ({ onOrderPlaced }) => {
  const { cart, cartSubtotal, updateCartQuantity, removeFromCart, selectedTable, t } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [includeCutlery, setIncludeCutlery] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const tax = Math.round(cartSubtotal * 0.08 * 100) / 100;
  const serviceCharge = 0.00;
  const totalAmountNum = cartSubtotal + tax + serviceCharge;
  const totalAmount = totalAmountNum.toFixed(2);

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (newOrder) => {
    setShowPaymentModal(false);
    if (newOrder) {
      onOrderPlaced(newOrder);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <ShoppingBag size={32} />
        </div>
        <h3>{t('emptyCartTitle')}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6 }}>
          {t('emptyCartSubtitle')}
        </p>
      </div>
    );
  }

  const combinedNotes = `${includeCutlery ? '[Cutlery Included] ' : ''}${kitchenNotes}`.trim();

  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Dine-In Order
          </span>
          <h2 style={{ fontSize: '1.4rem' }}>{t('yourCart')}</h2>
        </div>
        <div className="table-pill-badge" style={{ margin: 0 }}>
          <QrCode size={14} />
          <span>{t('table')} {selectedTable.replace('TB-', '')}</span>
        </div>
      </div>

      {/* Cart Items List */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        {cart.map((item) => (
          <div
            key={item.cartId}
            style={{
              display: 'flex',
              gap: 12,
              paddingBottom: 14,
              marginBottom: 14,
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <img
              src={item.image_url}
              alt={item.name}
              style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '0.95rem' }}>{item.name}</h4>
                <button
                  onClick={() => removeFromCart(item.cartId)}
                  style={{ background: 'transparent', color: '#EF4444', padding: 4 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {item.selectedOptions && item.selectedOptions.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {item.selectedOptions.map((opt) => opt.name || opt).join(', ')}
                </div>
              )}

              {item.notes && (
                <div style={{ fontSize: '0.75rem', color: 'var(--warm-amber)', fontStyle: 'italic', marginTop: 2 }}>
                  Note: "{item.notes}"
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                  ${item.item_total.toFixed(2)}
                </span>
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 16, textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button className="stepper-btn" onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Cutlery Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Utensils size={18} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Include cutlery & napkins</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Eco-friendly set provided</div>
            </div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={includeCutlery}
              onChange={(e) => setIncludeCutlery(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Customer Name & Instructions */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
            {t('customerName')}
          </label>
          <input
            type="text"
            placeholder={t('customerNamePlaceholder')}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
            {t('specialNotes')}
          </label>
          <input
            type="text"
            placeholder={t('specialNotesPlaceholder')}
            value={kitchenNotes}
            onChange={(e) => setKitchenNotes(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Price Summary */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: 10 }}>{t('orderSummary')}</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6, color: 'var(--text-muted)' }}>
          <span>{t('subtotal')}</span>
          <span>${cartSubtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6, color: 'var(--text-muted)' }}>
          <span>{t('tax')}</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
          <span>{t('total')}</span>
          <span style={{ color: 'var(--primary)' }}>${totalAmount}</span>
        </div>
      </div>

      {/* Security Badge */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-md)',
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        fontSize: '0.8rem',
        color: '#64748B'
      }}>
        <ShieldCheck size={18} style={{ flexShrink: 0, color: 'var(--primary)' }} />
        <span>EVC Plus, ZAAD, Sahal, Card, & Cash accepted. Instant order sync.</span>
      </div>

      {/* Proceed to Payment CTA */}
      <button
        className="btn-primary-lg"
        onClick={handleOpenPayment}
      >
        <span>{t('selectPaymentMethod')} (${totalAmount})</span>
      </button>

      {/* Payment Gateway Modal */}
      {showPaymentModal && (
        <PaymentModal
          totalAmount={totalAmountNum}
          customerName={customerName || 'Guest'}
          notes={combinedNotes}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};
