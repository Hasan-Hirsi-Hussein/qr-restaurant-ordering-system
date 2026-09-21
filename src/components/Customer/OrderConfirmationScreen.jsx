import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Clock, Utensils, ArrowRight, PlusCircle, Printer, CreditCard } from 'lucide-react';
import { ThermalReceipt } from '../Common/ThermalReceipt';

export const OrderConfirmationScreen = ({ order, onTrackLive, onOrderMore }) => {
  const { t } = useApp();
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  if (!order) return null;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <div style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'var(--sage-light)',
          color: 'var(--sage-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <CheckCircle2 size={42} />
        </div>
        <span className="hero-tag" style={{ background: 'var(--sage-green)' }}>{t('statusReceived')}</span>
        <h1 style={{ fontSize: '1.6rem', marginTop: 6, marginBottom: 4 }}>{t('orderConfirmed')}</h1>
      </div>

      {/* Reference Card */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('orderNumber')}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
              #{order.order_number}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="table-tag">{order.table_number}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.85rem' }}>
          <div style={{ background: 'var(--bg-cream)', padding: 10, borderRadius: 'var(--radius-md)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('queuePosition')}</div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
              #{order.queuePosition || 1}
            </div>
          </div>
          <div style={{ background: 'var(--bg-cream)', padding: 10, borderRadius: 'var(--radius-md)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('estimatedTime')}</div>
            <div style={{ fontWeight: 800, color: 'var(--warm-amber)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} />
              <span>{order.est_prep_time || 15} {t('minutes')}</span>
            </div>
          </div>
        </div>

        {/* Payment Status Badge */}
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
            <CreditCard size={15} />
            <span>{t('paymentStatusLabel')}:</span>
          </div>
          <span style={{
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            background: order.payment_status === 'Paid' ? '#DCFCE7' : '#FEF3C7',
            color: order.payment_status === 'Paid' ? '#15803D' : '#B45309'
          }}>
            {order.payment_method || 'Cash'} - {order.payment_status === 'Paid' ? t('paid') : t('pendingCash')}
          </span>
        </div>
      </div>

      {/* Ticket Items Summary */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Utensils size={16} style={{ color: 'var(--primary)' }} />
          <span>Kitchen Ticket ({order.items ? order.items.length : 0} items)</span>
        </h4>
        {order.items && order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--bg-cream)' }}>
            <div>
              <span style={{ fontWeight: 700 }}>{item.quantity}x </span>
              <span>{item.product_name}</span>
            </div>
            <span style={{ fontWeight: 700 }}>${item.item_total ? item.item_total.toFixed(2) : (item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', marginTop: 10, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
          <span>{t('total')}</span>
          <span style={{ color: 'var(--primary)' }}>${order.total_amount ? order.total_amount.toFixed(2) : 0}</span>
        </div>
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

      {/* Action Buttons */}
      <button className="btn-primary-lg" onClick={onTrackLive} style={{ marginBottom: 12 }}>
        <span>{t('trackLive')}</span>
        <ArrowRight size={20} />
      </button>

      <button
        onClick={onOrderMore}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-full)',
          background: '#FFFFFF',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
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
    </div>
  );
};
