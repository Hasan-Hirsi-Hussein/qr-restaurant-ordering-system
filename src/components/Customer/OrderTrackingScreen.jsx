import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Check, ChefHat, Bell, PlusCircle, Printer, CreditCard, Smartphone, Banknote, X, CheckCircle, Loader2, Star } from 'lucide-react';
import { ThermalReceipt } from '../Common/ThermalReceipt';
import { CallWaiterModal } from './CallWaiterModal';

const PAYMENT_OPTIONS = [
  { id: 'EVC Plus', label: 'EVC Plus', sub: 'Hormuud Mobile Money', badge: 'EVC', color: '#059669', bg: '#D1FAE5' },
  { id: 'ZAAD Service', label: 'ZAAD Service', sub: 'Telesom Mobile Money', badge: 'ZAAD', color: '#2563EB', bg: '#DBEAFE' },
  { id: 'Sahal Service', label: 'Sahal Service', sub: 'Golis Mobile Money', badge: 'SAHAL', color: '#EA580C', bg: '#FFEDD5' },
  { id: 'Credit / Debit Card', label: 'Credit / Debit Card', sub: 'Visa / Mastercard', badge: 'CARD', color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'Pay Cash at Table', label: 'Pay Cash at Table', sub: 'Pay cash to staff upon delivery', badge: 'CASH', color: '#D97706', bg: '#FEF3C7' },
];

export const OrderTrackingScreen = ({ onOrderMore }) => {
  const { currentOrder, selectedTable, t, updateOrderPaymentStatus, ordersList, submitReview } = useApp();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState(null);
  const [isUpdatingPay, setIsUpdatingPay] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState(false);

  // Food rating state
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedDishToRate, setSelectedDishToRate] = useState('All');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const order = currentOrder ||
    (ordersList && ordersList.find(o => o.table_number === selectedTable && o.status !== 'Completed')) ||
    (ordersList && ordersList.find(o => o.table_number === selectedTable)) ||
    (ordersList && ordersList[0]);

  if (!order) {
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
          <Clock size={32} />
        </div>
        <h3>No Active Order Found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6 }}>
          Place an order from the menu to start live tracking!
        </p>
      </div>
    );
  }

  const statusList = ['New', 'Preparing', 'Ready', 'Completed'];

  const getStatusIndex = (st) => {
    if (st === 'Accepted') return 1;
    const idx = statusList.indexOf(st);
    return idx >= 0 ? idx : 0;
  };

  const currentIndex = getStatusIndex(order.status);

  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
            {t('trackLive')}
          </span>
          <h2 style={{ fontSize: '1.4rem' }}>{t('orderNumber')} #{order.order_number}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowWaiterModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: '#FFF7ED',
              border: '1px solid #FDBA74',
              color: '#EA580C',
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(234, 88, 12, 0.15)'
            }}
          >
            <Bell size={13} />
            <span>Wac Kabeeleyga 🛎️</span>
          </button>
          <span className="table-tag">{order.table_number || selectedTable}</span>
        </div>
      </div>

      {/* Central Circular Progress Countdown */}
      <div className="tracking-card">
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
          {order.status === 'Completed' ? t('statusDelivered') : order.status === 'Ready' ? t('statusReady') : t('statusPreparing')}
        </div>

        <div className="progress-circle-container">
          <ChefHat size={28} style={{ color: 'var(--primary)', marginBottom: 4 }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            {order.status === 'Completed' ? '0 MIN' : `${order.est_prep_time || 12} MINS`}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            {order.status === 'Completed' ? 'COMPLETED' : 'ESTIMATED'}
          </div>
        </div>

        {/* Payment Status Info inside Tracking Card */}
        {(() => {
          const currentMethodConfig = PAYMENT_OPTIONS.find(p => p.id === order.payment_method) ||
            PAYMENT_OPTIONS.find(p => (order.payment_method || '').toLowerCase().includes(p.badge.toLowerCase())) ||
            PAYMENT_OPTIONS[4];
          const isPaid = order.payment_status === 'Paid';
          return (
            <div style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.82rem',
              background: isPaid ? '#ECFDF5' : '#FFFBEB',
              border: `1px solid ${isPaid ? '#10B981' : '#F59E0B'}`,
              color: isPaid ? '#065F46' : '#92400E',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              <span style={{
                background: currentMethodConfig.color,
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '6px'
              }}>
                {currentMethodConfig.badge}
              </span>
              <span>{order.payment_method || 'Pay Cash at Table'}:</span>
              <strong style={{ color: isPaid ? '#059669' : '#D97706' }}>
                {isPaid ? `✓ ${t('paid')}` : `⏳ ${t('pendingCash')}`}
              </strong>
            </div>
          );
        })()}
      </div>

      {/* Payment Banner (Always Visible) */}
      {order.payment_status !== 'Paid' ? (
        <div style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '1.5px solid #F59E0B',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                <CreditCard size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#92400E' }}>Lacag Bixintu Waa Pending</div>
                <div style={{ fontSize: '0.8rem', color: '#B45309' }}>Wadarta: <strong>${(order.total_amount || 0).toFixed(2)}</strong></div>
              </div>
            </div>
            <button
              onClick={() => { setSelectedPayMethod(order.payment_method || 'EVC Plus'); setShowPayModal(true); }}
              style={{
                background: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '9px 18px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(5,150,105,0.35)'
              }}
            >
              <Smartphone size={15} />
              <span>Bixi Hadda / Pay Now</span>
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#B45309', lineHeight: 1.4 }}>
            Dooro <strong>EVC Plus, ZAAD, Sahal, Card</strong> ama lacagta caddaanka ah miiska ku bixi marka cuntadu timaado.
          </p>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '1.5px solid #10B981',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={20} style={{ color: '#059669' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#065F46' }}>Lacagta waa la bixiyay (Paid)</div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>Habka: <strong>{order.payment_method}</strong></div>
            </div>
          </div>
          <button
            onClick={() => { setSelectedPayMethod(order.payment_method || 'EVC Plus'); setShowPayModal(true); }}
            style={{
              background: 'transparent',
              color: '#059669',
              border: '1px solid #059669',
              borderRadius: '20px',
              padding: '5px 12px',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Beddel / Change
          </button>
        </div>
      )}

      {/* 4-Step Timeline */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: 16 }}>{t('orderStatus')}</h4>
        <div className="timeline">
          {/* Step 1: Order Received */}
          <div className={`timeline-step ${currentIndex >= 0 ? (currentIndex > 0 ? 'completed' : 'active') : ''}`}>
            <div className="timeline-dot">
              {currentIndex > 0 ? <Check size={12} /> : 1}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('statusReceived')}</div>
          </div>

          {/* Step 2: Preparing */}
          <div className={`timeline-step ${currentIndex >= 1 ? (currentIndex > 1 ? 'completed' : 'active') : ''}`}>
            <div className="timeline-dot">
              {currentIndex > 1 ? <Check size={12} /> : 2}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('statusPreparing')}</div>
          </div>

          {/* Step 3: Ready */}
          <div className={`timeline-step ${currentIndex >= 2 ? (currentIndex > 2 ? 'completed' : 'active') : ''}`}>
            <div className="timeline-dot">
              {currentIndex > 2 ? <Check size={12} /> : 3}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('statusReady')}</div>
          </div>

          {/* Step 4: Served / Completed */}
          <div className={`timeline-step ${currentIndex >= 3 ? 'completed' : ''}`}>
            <div className="timeline-dot">
              {currentIndex >= 3 ? <Check size={12} /> : 4}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('statusDelivered')}</div>
          </div>
        </div>
      </div>

      {/* Ordered Items List */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Ordered Items ({order.items ? order.items.length : 0})</h4>
        {order.items && order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8, paddingBottom: 8, borderBottom: '1px dashed var(--bg-cream)' }}>
            <div>
              <span style={{ fontWeight: 700 }}>{item.quantity}x </span>
              <span>{item.product_name}</span>
            </div>
            <span style={{ fontWeight: 700 }}>${item.item_total ? item.item_total.toFixed(2) : (item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* ─── FOOD RATING & REVIEWS ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 16,
        border: '1.5px solid #FDE68A'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Star size={18} fill="#D97706" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1F2937' }}>Qiimee Cuntada (Rate Your Food)</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>Sideed u aragtaa tayada cuntada aad dalbatay?</p>
          </div>
        </div>

        {reviewSubmitted ? (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #10B981',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            textAlign: 'center',
            marginTop: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#059669', fontWeight: 800, fontSize: '0.95rem' }}>
              <CheckCircle size={18} />
              <span>Mahadsanid! Qiimeyntaadii waa la diiwaangeliyay.</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#047857' }}>
              Xiddigaha aad bixisay waxay toos u cusbooneysiiyeen qiimeynta guud ee cuntada!
            </p>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            {/* Interactive Star Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '3px',
                    transition: 'transform 0.15s ease'
                  }}
                  title={`${star} Star`}
                >
                  <Star
                    size={30}
                    fill={star <= selectedRating ? '#F59E0B' : '#E5E7EB'}
                    color={star <= selectedRating ? '#F59E0B' : '#D1D5DB'}
                  />
                </button>
              ))}
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D97706', marginLeft: 6 }}>
                {selectedRating === 5 && '⭐⭐⭐⭐⭐ Aad u Macaan!'}
                {selectedRating === 4 && '⭐⭐⭐⭐ Aad u Wanaagsan'}
                {selectedRating === 3 && '⭐⭐⭐ Wanaagsan'}
                {selectedRating === 2 && '⭐⭐ Dhexdhexaad'}
                {selectedRating === 1 && '⭐ Liidata'}
              </span>
            </div>

            {/* Select Dish dropdown if order has items */}
            {order.items && order.items.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Cuntada aad qiimeynayso:
                </label>
                <select
                  value={selectedDishToRate}
                  onChange={(e) => setSelectedDishToRate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    background: '#F8FAFC'
                  }}
                >
                  <option value="All">Dhamaan Cuntooyinka (Guud)</option>
                  {order.items.map((it, idx) => (
                    <option key={idx} value={it.product_name}>
                      {it.product_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Feedback textarea */}
            <div style={{ marginBottom: 12 }}>
              <textarea
                rows={2}
                placeholder="Qor faallo kooban (tusaale: Cuntadu aad bay u macaaneyd, suugo fiican)..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Submit rating button */}
            <button
              onClick={async () => {
                setIsSubmittingReview(true);
                const chosenItem = order.items?.find(it => it.product_name === selectedDishToRate);
                await submitReview({
                  orderId: order.id,
                  productId: chosenItem ? chosenItem.product_id : (order.items?.[0]?.product_id || 1),
                  productName: selectedDishToRate === 'All' ? (order.items?.[0]?.product_name || 'General Order') : selectedDishToRate,
                  customerName: order.customer_name || 'Guest',
                  rating: selectedRating,
                  comment: reviewComment
                });
                setIsSubmittingReview(false);
                setReviewSubmitted(true);
              }}
              disabled={isSubmittingReview}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-full)',
                background: '#D97706',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: isSubmittingReview ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(217,119,6,0.3)'
              }}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Waa la dirayaa database-ka...</span>
                </>
              ) : (
                <>
                  <Star size={16} fill="#fff" />
                  <span>Dir Qiimeynta Cuntada ({selectedRating} ⭐)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Print Thermal Receipt Button */}
      <button
        onClick={() => setShowReceiptModal(true)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 'var(--radius-full)',
          background: '#F1F5F9',
          color: '#1E293B',
          border: '1px solid #CBD5E1',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: '0.9rem',
          marginBottom: 12
        }}
      >
        <Printer size={18} />
        <span>{t('printReceipt')}</span>
      </button>

      {/* Assistance Call Button */}
      <button
        onClick={() => alert(`Server alerted for Table ${selectedTable}!`)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--amber-light)',
          color: '#92400E',
          border: '1px solid var(--warm-amber)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 12,
          fontSize: '0.85rem'
        }}
      >
        <Bell size={16} />
        <span>Call Server / Staff</span>
      </button>

      <button
        onClick={onOrderMore}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--primary)',
          color: '#FFFFFF',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: '0.95rem'
        }}
      >
        <PlusCircle size={18} />
        <span>{t('orderMore')}</span>
      </button>

      {/* Thermal Receipt Modal */}
      {showReceiptModal && (
        <ThermalReceipt order={order} onClose={() => setShowReceiptModal(false)} />
      )}

      {/* Pay Now Modal for Table Order */}
      {showPayModal && (
        <div className="modal-backdrop">
          <div className="modal-content payment-modal" style={{ maxWidth: 440 }}>
            <div className="payment-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Bixi Dalabka #{order.order_number}</h3>
                <span style={{ fontSize: '0.83rem', color: '#A09790' }}>
                  Wadarta: <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>${(order.total_amount || 0).toFixed(2)}</strong>
                </span>
              </div>
              <button className="icon-btn-ghost" onClick={() => setShowPayModal(false)} disabled={isUpdatingPay}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {paySuccessMsg ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={36} />
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#065F46' }}>Lacag-bixinta waa la xaqiijiyay!</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857' }}>
                    Database-ka waxa lagu kaydiyay: <strong>{selectedPayMethod}</strong> (Paid)
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10, letterSpacing: 0.5 }}>
                    📱 Mobile Money (Soomaaliya)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {PAYMENT_OPTIONS.slice(0, 3).map(opt => (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedPayMethod(opt.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: selectedPayMethod === opt.id ? `2px solid ${opt.color}` : '1.5px solid #E5E7EB',
                          background: selectedPayMethod === opt.id ? opt.bg : '#FAFAFA',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Smartphone size={18} style={{ color: opt.color }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937' }}>{opt.label}</div>
                            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{opt.sub}</div>
                          </div>
                        </div>
                        <span style={{ background: opt.color, color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>
                          {opt.badge}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10, letterSpacing: 0.5 }}>
                    💳 Kaararka Bangiga
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    {(() => {
                      const opt = PAYMENT_OPTIONS[3];
                      return (
                        <div
                          onClick={() => setSelectedPayMethod(opt.id)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: selectedPayMethod === opt.id ? `2px solid ${opt.color}` : '1.5px solid #E5E7EB',
                            background: selectedPayMethod === opt.id ? opt.bg : '#FAFAFA',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CreditCard size={18} style={{ color: opt.color }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937' }}>{opt.label}</div>
                              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{opt.sub}</div>
                            </div>
                          </div>
                          <span style={{ background: opt.color, color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>
                            {opt.badge}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10, letterSpacing: 0.5 }}>
                    💵 Lacag Cadaan Ah
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    {(() => {
                      const opt = PAYMENT_OPTIONS[4];
                      return (
                        <div
                          onClick={() => setSelectedPayMethod(opt.id)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: selectedPayMethod === opt.id ? `2px solid ${opt.color}` : '1.5px solid #E5E7EB',
                            background: selectedPayMethod === opt.id ? opt.bg : '#FAFAFA',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Banknote size={18} style={{ color: opt.color }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937' }}>{opt.label}</div>
                              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{opt.sub}</div>
                            </div>
                          </div>
                          <span style={{ background: opt.color, color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>
                            {opt.badge}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    onClick={async () => {
                      if (!selectedPayMethod) return;
                      setIsUpdatingPay(true);
                      const isCash = selectedPayMethod === 'Pay Cash at Table';
                      const newStatus = isCash ? 'Pending' : 'Paid';
                      await updateOrderPaymentStatus(order.id, newStatus, selectedPayMethod);
                      setIsUpdatingPay(false);
                      setPaySuccessMsg(true);
                      setTimeout(() => {
                        setPaySuccessMsg(false);
                        setShowPayModal(false);
                      }, 1200);
                    }}
                    disabled={!selectedPayMethod || isUpdatingPay}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 'var(--radius-full)',
                      background: selectedPayMethod ? 'var(--primary)' : '#D1D5DB',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: selectedPayMethod && !isUpdatingPay ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {isUpdatingPay ? (
                      <>
                        <Loader2 size={18} className="spin" />
                        <span>Waa la kaydinayaa database-ka...</span>
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>Xaqiiji Lacag Bixinta (${(order.total_amount || 0).toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call Waiter Modal */}
      <CallWaiterModal
        isOpen={showWaiterModal}
        onClose={() => setShowWaiterModal(false)}
      />
    </div>
  );
};
