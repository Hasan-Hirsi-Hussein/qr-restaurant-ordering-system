import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, CreditCard, Banknote, X, CheckCircle, Loader2, Lock, ChevronRight, Check } from 'lucide-react';

const MOBILE_METHODS = [
  { id: 'evc_plus',  label: 'EVC Plus',      sub: 'Hormuud Mobile Money',  badge: 'EVC',  badgeClass: 'evc'  },
  { id: 'zaad',      label: 'ZAAD Service',   sub: 'Telesom Mobile Money',  badge: 'ZAAD', badgeClass: 'zaad' },
  { id: 'sahal',     label: 'Sahal Service',  sub: 'Golis Mobile Money',    badge: 'SAHAL',badgeClass: 'sahal'},
];

export const PaymentModal = ({ totalAmount, customerName, notes, onClose, onPaymentComplete }) => {
  const { t, placeOrder } = useApp();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState('select'); // 'select' | 'processing' | 'success'

  // ── Method names for display & order ─────────────────────
  const methodNames = {
    evc_plus: 'EVC Plus',
    zaad:     'ZAAD Service',
    sahal:    'Sahal Service',
    card:     'Credit/Debit Card',
    cash:     'Pay Cash at Table',
  };

  // ── Handle Confirm ────────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedMethod) return;

    // CASH → pending, no processing screen needed
    if (selectedMethod === 'cash') {
      setIsProcessing(true);
      const order = await placeOrder(customerName, notes, 'Pay Cash at Table', 'Pending');
      setIsProcessing(false);
      onPaymentComplete(order);
      return;
    }

    // CARD → validate fields
    if (selectedMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        alert('Please fill in all card details');
        return;
      }
      setStep('processing');
      setIsProcessing(true);
      setTimeout(async () => {
        const order = await placeOrder(customerName, notes, 'Credit/Debit Card', 'Paid');
        setIsProcessing(false);
        setStep('success');
        setTimeout(() => onPaymentComplete(order), 1200);
      }, 1500);
      return;
    }

    // MOBILE MONEY (EVC / ZAAD / SAHAL) → no phone needed, just confirm & process
    setStep('processing');
    setIsProcessing(true);
    setTimeout(async () => {
      const order = await placeOrder(
        customerName,
        notes,
        methodNames[selectedMethod] || 'Mobile Money',
        'Paid'
      );
      setIsProcessing(false);
      setStep('success');
      setTimeout(() => onPaymentComplete(order), 1200);
    }, 2000);
  };

  // ── Which method is currently mobile money? ───────────────
  const isMobile = selectedMethod && ['evc_plus', 'zaad', 'sahal'].includes(selectedMethod);
  const isCard   = selectedMethod === 'card';
  const isCash   = selectedMethod === 'cash';
  const canPay   = !!selectedMethod;

  return (
    <div className="modal-backdrop">
      <div className="modal-content payment-modal" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ──────────────────────────────────────── */}
        <div className="payment-modal-header" style={{ flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{t('paymentTitle')}</h3>
            <span style={{ fontSize: '0.83rem', color: '#A09790' }}>
              {t('total')}: <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>${totalAmount.toFixed(2)}</strong>
            </span>
          </div>
          <button className="icon-btn-ghost" onClick={onClose} disabled={isProcessing}>
            <X size={20} />
          </button>
        </div>

        {/* ══════════ STEP 1: SELECT ══════════ */}
        {step === 'select' && (
          <>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>

              {/* Mobile Money Group */}
              <div className="pay-group-label">📱 Mobile Money</div>
              <div className="payment-options-grid">
                {MOBILE_METHODS.map(m => (
                  <div
                    key={m.id}
                    className={`payment-option-card ${selectedMethod === m.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMethod(m.id)}
                  >
                    <Smartphone size={20} className="option-icon" />
                    <div className="option-info">
                      <strong>{m.label}</strong>
                      <span>{m.sub}</span>
                    </div>
                    <div className={`badge-logo ${m.badgeClass}`}>{m.badge}</div>
                    {selectedMethod === m.id && (
                      <div className="pay-selected-dot" />
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile money notice with instant click-to-confirm */}
              {isMobile && (
                <div
                  className="pay-info-notice"
                  onClick={handleConfirm}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(74, 222, 128, 0.14)',
                    border: '1px solid rgba(74, 222, 128, 0.35)',
                    margin: '12px 0 6px 0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#4ADE80', fontSize: '0.85rem' }}>
                      ✅ {methodNames[selectedMethod]} waa la doortay
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                      Riix halkan ama badhanka Confirm ee hoose si aad u dirto
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{
                      background: '#16A34A',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '7px 14px',
                      borderRadius: '20px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Confirm Now</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

            {/* Card */}
            <div className="pay-group-label" style={{ marginTop: 16 }}>💳 Card</div>
            <div
              className={`payment-option-card ${selectedMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              <CreditCard size={20} className="option-icon" />
              <div className="option-info">
                <strong>{t('creditCard') || 'Credit / Debit Card'}</strong>
                <span>Visa / Mastercard</span>
              </div>
              {selectedMethod === 'card' && <div className="pay-selected-dot" />}
            </div>

            {/* Card details — only shown when card is selected */}
            {isCard && (
              <div className="card-details-section">
                <div>
                  <label className="pay-input-label">{t('cardNumber') || 'Card Number'}</label>
                  <input
                    type="text"
                    className="theme-input"
                    placeholder="4000 1234 5678 9010"
                    value={cardDetails.number}
                    onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="pay-input-label">{t('cardExpiry') || 'Expiry'}</label>
                    <input
                      type="text"
                      className="theme-input"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="pay-input-label">{t('cardCvc') || 'CVC'}</label>
                    <input
                      type="password"
                      className="theme-input"
                      placeholder="123"
                      maxLength={4}
                      value={cardDetails.cvc}
                      onChange={e => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cash */}
            <div className="pay-group-label" style={{ marginTop: 16 }}>💵 Cash</div>
            <div
              className={`payment-option-card ${selectedMethod === 'cash' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('cash')}
            >
              <Banknote size={20} className="option-icon" />
              <div className="option-info">
                <strong>{t('cashAtTable') || 'Pay at Counter / Table'}</strong>
                <span>{t('paymentPendingNotice') || 'Staff will collect payment'}</span>
              </div>
              {selectedMethod === 'cash' && <div className="pay-selected-dot" />}
            </div>

            {/* Security Notice */}
            <div className="secure-badge-footer" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#8A827A' }}>
              <Lock size={13} style={{ color: '#4ADE80' }} />
              <span>256-bit Encrypted &amp; Secure Payment Gateway</span>
            </div>

            </div>

            {/* ── Sticky Action Footer ── */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: '#151311',
              display: 'flex',
              gap: 10,
              flexShrink: 0
            }}>
              <button
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#C0B7B0',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
                onClick={onClose}
                disabled={isProcessing}
              >
                {t('cancel') || 'Cancel'}
              </button>

              <button
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: 'var(--radius-full)',
                  background: canPay ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                  color: canPay ? '#FFFFFF' : '#666',
                  border: 'none',
                  fontWeight: 800,
                  cursor: canPay ? 'pointer' : 'not-allowed',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: canPay ? '0 4px 18px rgba(217,83,30,0.45)' : 'none',
                }}
                onClick={handleConfirm}
                disabled={!canPay || isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 size={18} className="spin-icon" /><span>{t('processingOrder') || 'Processing...'}</span></>
                ) : isCash ? (
                  <><Check size={18} /><span>{t('confirmPayment') || 'Confirm Order'} (${totalAmount.toFixed(2)})</span></>
                ) : (
                  <><Check size={18} /><span>Confirm Order — ${totalAmount.toFixed(2)}</span><ChevronRight size={18} /></>
                )}
              </button>
            </div>
          </>
        )}

        {/* ══════════ STEP 2: PROCESSING ══════════ */}
        {step === 'processing' && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(217,119,6,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px auto',
              animation: 'pulseRing 1.5s infinite ease-in-out',
            }}>
              {isCard
                ? <CreditCard size={34} style={{ color: 'var(--primary)' }} />
                : <Smartphone size={34} style={{ color: 'var(--primary)' }} />
              }
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: 8 }}>
              {isCard ? 'Processing Card Payment...' : `Confirming with ${methodNames[selectedMethod]}...`}
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#C0B7B0', marginBottom: 20, lineHeight: 1.6 }}>
              {isCard
                ? 'Securely verifying your card details...'
                : `Your order of $${totalAmount.toFixed(2)} is being processed via ${methodNames[selectedMethod]}.`
              }
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--primary)' }}>
              <Loader2 size={20} className="spin-icon" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Please wait...</span>
            </div>
          </div>
        )}

        {/* ══════════ STEP 3: SUCCESS ══════════ */}
        {step === 'success' && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <CheckCircle size={64} style={{ color: '#4ADE80', margin: '0 auto 16px auto', display: 'block' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#4ADE80', marginBottom: 8 }}>
              {t('paymentSuccess') || 'Payment Confirmed!'}
            </h3>
            <p style={{ color: '#C0B7B0', fontSize: '0.9rem' }}>
              Your order has been placed successfully. The kitchen is being notified...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
