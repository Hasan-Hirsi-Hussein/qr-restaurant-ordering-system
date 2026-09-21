import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChefHat, Clock, CheckCircle2, Play, Plus, Minus, Printer, CreditCard, Bell, Check } from 'lucide-react';
import { ThermalReceipt } from '../Common/ThermalReceipt';

export const KitchenDashboard = () => {
  const { ordersList, updateOrderStatus, waiterCalls, attendWaiterCall, t } = useApp();
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedPrintOrder, setSelectedPrintOrder] = useState(null);

  const filteredOrders = ordersList.filter((o) => {
    if (filterStatus === 'All') return o.status !== 'Completed';
    return o.status === filterStatus;
  });

  const countNew = ordersList.filter((o) => o.status === 'New').length;
  const countPrep = ordersList.filter((o) => o.status === 'Preparing' || o.status === 'Accepted').length;
  const countReady = ordersList.filter((o) => o.status === 'Ready').length;

  return (
    <div className="kds-container">
      {/* KDS Header Banner */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ChefHat size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>{t('kitchenTitle')}</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Station: LANE &amp; GRILL • Live Order Management
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sage-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage-green)', display: 'inline-block' }}></span>
            Live Sync Active
          </span>
        </div>
      </div>

      {/* Active Waiter Calls Alert for Kitchen / Chef */}
      {waiterCalls && waiterCalls.length > 0 && (
        <div style={{
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {waiterCalls.map((call) => (
            <div
              key={call.id}
              style={{
                background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                border: '2px solid #EA580C',
                borderRadius: '16px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 6px 16px rgba(234, 88, 12, 0.2)',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#EA580C',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)'
                }}>
                  <Bell size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: '#EA580C',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {call.table_number}
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#9A3412' }}>
                      Wacitaan Miiska (Customer Needs Assistance)!
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#C2410C', fontWeight: 700, marginTop: 2 }}>
                    Sababta: <span style={{ color: '#431407', fontWeight: 800 }}>{call.call_type}</span> • {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => attendWaiterCall(call.id)}
                style={{
                  background: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
                }}
              >
                <Check size={16} />
                <span>Waan U Tagay / Attended</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          className={`cat-chip ${filterStatus === 'All' ? 'active' : ''}`}
          onClick={() => setFilterStatus('All')}
        >
          {t('activeOrders')} ({ordersList.filter(o => o.status !== 'Completed').length})
        </button>
        <button
          className={`cat-chip ${filterStatus === 'New' ? 'active' : ''}`}
          onClick={() => setFilterStatus('New')}
          style={{ position: 'relative' }}
        >
          {t('newOrders')} ({countNew})
          {countNew > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', position: 'absolute', top: 4, right: 4 }}></span>}
        </button>
        <button
          className={`cat-chip ${filterStatus === 'Preparing' ? 'active' : ''}`}
          onClick={() => setFilterStatus('Preparing')}
        >
          {t('inPreparation')} ({countPrep})
        </button>
        <button
          className={`cat-chip ${filterStatus === 'Ready' ? 'active' : ''}`}
          onClick={() => setFilterStatus('Ready')}
        >
          {t('readyToServe')} ({countReady})
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div style={{ background: '#FFFFFF', padding: 40, borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ChefHat size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
          <h3>{t('noActiveOrders')}</h3>
        </div>
      ) : (
        <div className="kds-grid">
          {filteredOrders.map((order) => (
            <div key={order.id} className={`kds-card status-${order.status}`}>
              {/* Card Top Info */}
              <div className="kds-header">
                <div>
                  <span className="table-tag">{order.table_number}</span>
                  <span style={{ marginLeft: 8, fontWeight: 800, fontSize: '1rem' }}>#{order.order_number}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setSelectedPrintOrder(order)}
                    title={t('printKitchenTicket')}
                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', color: '#334155' }}
                  >
                    <Printer size={15} />
                  </button>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} />
                    <span>{new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                <span>Customer: <strong>{order.customer_name || 'Guest'}</strong></span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: order.payment_status === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                  color: order.payment_status === 'Paid' ? '#15803D' : '#B45309'
                }}>
                  {order.payment_method || 'Cash'} ({order.payment_status === 'Paid' ? t('paid') : t('pendingCash')})
                </span>
              </div>

              {/* Items list */}
              <div style={{ marginBottom: 14 }}>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} style={{ padding: '6px 0', borderBottom: '1px dashed var(--bg-cream)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                      <span>{item.quantity}x {item.product_name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    {item.options && item.options.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', paddingLeft: 10, marginTop: 2, fontWeight: 600 }}>
                        • {item.options.map((o) => o.name || o).join(', ')}
                      </div>
                    )}
                  </div>
                ))}

                {order.notes && (
                  <div style={{
                    marginTop: 10,
                    background: 'var(--amber-light)',
                    border: '1px solid var(--warm-amber)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 8,
                    fontSize: '0.8rem',
                    color: '#92400E'
                  }}>
                    <strong>Kitchen Note:</strong> {order.notes}
                  </div>
                )}
              </div>

              {/* Est Prep Time Control */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-cream)', padding: '6px 12px', borderRadius: 'var(--radius-md)', marginBottom: 14 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('estimatedTime')}:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => updateOrderStatus(order.id, order.status, Math.max(5, (order.est_prep_time || 15) - 5))}
                    style={{ background: '#FFFFFF', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{order.est_prep_time || 15}m</span>
                  <button
                    onClick={() => updateOrderStatus(order.id, order.status, (order.est_prep_time || 15) + 5)}
                    style={{ background: '#FFFFFF', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Action Buttons based on status */}
              {order.status === 'New' && (
                <button
                  className="btn-primary-lg"
                  style={{ padding: '12px', fontSize: '0.9rem' }}
                  onClick={() => updateOrderStatus(order.id, 'Preparing', order.est_prep_time || 15)}
                >
                  <Play size={16} />
                  <span>{t('markPreparing')}</span>
                </button>
              )}

              {(order.status === 'Preparing' || order.status === 'Accepted') && (
                <button
                  className="btn-primary-lg"
                  style={{ background: 'var(--sage-green)', padding: '12px', fontSize: '0.9rem' }}
                  onClick={() => updateOrderStatus(order.id, 'Ready', order.est_prep_time || 15)}
                >
                  <CheckCircle2 size={16} />
                  <span>{t('markReady')}</span>
                </button>
              )}

              {order.status === 'Ready' && (
                <button
                  className="btn-primary-lg"
                  style={{ background: 'var(--text-main)', padding: '12px', fontSize: '0.9rem' }}
                  onClick={() => updateOrderStatus(order.id, 'Completed', order.est_prep_time || 15)}
                >
                  <CheckCircle2 size={16} />
                  <span>{t('markCompleted')}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Print Kitchen Ticket Modal */}
      {selectedPrintOrder && (
        <ThermalReceipt
          order={selectedPrintOrder}
          isKitchenTicket={true}
          onClose={() => setSelectedPrintOrder(null)}
        />
      )}
    </div>
  );
};
