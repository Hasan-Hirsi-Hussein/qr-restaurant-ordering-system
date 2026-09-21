import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Check, Utensils, Clock, CheckCheck, RefreshCw, AlertCircle, Sparkles, MapPin, User } from 'lucide-react';

export const WaiterDashboard = () => {
  const {
    waiterCalls,
    attendWaiterCall,
    fetchWaiterCalls,
    ordersList,
    updateOrderStatus,
    tablesList,
    t
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('calls');

  // Orders that kitchen marked as 'Ready' and waiting for waiter to deliver to table
  const readyOrders = ordersList.filter((o) => o.status === 'Ready');
  const activeOrders = ordersList.filter((o) => o.status !== 'Completed');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
          }}>
            <Bell size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1E293B' }}>
              Shaashadda Kabeeleyda (Waiters &amp; Floor Service)
            </h1>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
              Live Table Assistance &amp; Food Delivery Dispatch
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={fetchWaiterCalls}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            <span>Cusboonaysii</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSubTab('calls')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: '12px',
            border: activeSubTab === 'calls' ? '2px solid #EA580C' : '1px solid #E2E8F0',
            background: activeSubTab === 'calls' ? '#FFF7ED' : '#FFFFFF',
            color: activeSubTab === 'calls' ? '#EA580C' : '#475569',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <Bell size={16} />
          <span>Wacitaanka Miisaska</span>
          {waiterCalls.length > 0 && (
            <span style={{
              background: '#EA580C',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '1px 8px',
              fontSize: '0.75rem',
              fontWeight: 900
            }}>
              {waiterCalls.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('ready')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: '12px',
            border: activeSubTab === 'ready' ? '2px solid #10B981' : '1px solid #E2E8F0',
            background: activeSubTab === 'ready' ? '#ECFDF5' : '#FFFFFF',
            color: activeSubTab === 'ready' ? '#059669' : '#475569',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <Utensils size={16} />
          <span>Cuntada Diyaarka ah (Geey Miiska)</span>
          {readyOrders.length > 0 && (
            <span style={{
              background: '#10B981',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '1px 8px',
              fontSize: '0.75rem',
              fontWeight: 900
            }}>
              {readyOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('tables')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: '12px',
            border: activeSubTab === 'tables' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
            background: activeSubTab === 'tables' ? '#EFF6FF' : '#FFFFFF',
            color: activeSubTab === 'tables' ? '#2563EB' : '#475569',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <Clock size={16} />
          <span>Dalabyada Socda ({activeOrders.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: SERVICE CALLS ─── */}
      {activeSubTab === 'calls' && (
        <div>
          {waiterCalls.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '50px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}>
                <CheckCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065F46', marginBottom: 6 }}>
                Dhammaan Miisaska Waa La Caawiyay!
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', maxWidth: 360, margin: '0 auto' }}>
                Hadda ma jiro miis wacitaan soo diray. Marka macmiilku taleefankiisa ka riixo <strong>"Wac Kabeeleyga"</strong>, isla markiiba halkan ayay kuugu soo dhacaysaa iyadoo dawan wadata.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {waiterCalls.map((call) => (
                <div
                  key={call.id}
                  style={{
                    background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
                    borderRadius: '16px',
                    border: '2px solid #EA580C',
                    padding: '18px',
                    boxShadow: '0 6px 16px rgba(234, 88, 12, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{
                        background: '#EA580C',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '1rem',
                        padding: '4px 12px',
                        borderRadius: '8px'
                      }}>
                        {call.table_number}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9A3412', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} />
                        {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#7C2D12', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Codsiga Macmiilka:
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E293B', marginTop: 3, marginBottom: 16 }}>
                      {call.call_type}
                    </div>
                  </div>

                  <button
                    onClick={() => attendWaiterCall(call.id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      background: '#059669',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 3px 8px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <Check size={18} />
                    <span>Waan U Tagay Miiska / Attended</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: READY TO SERVE ─── */}
      {activeSubTab === 'ready' && (
        <div>
          {readyOrders.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '50px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <Utensils size={40} style={{ margin: '0 auto 12px auto', opacity: 0.3, color: '#10B981' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>
                Weli cunto diyaar ah ma jirto
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
                Marka Jikadu (Chef Marco) cuntada diyaariyo oo uu 'Ready' ka dhigo, halkan ayay kuugu soo dhacaysaa si aad miiska ugu qaaddo.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {readyOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '2px solid #10B981',
                    padding: '18px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '1rem',
                        padding: '4px 12px',
                        borderRadius: '8px'
                      }}>
                        {order.table_number}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E40AF' }}>
                        #{order.order_number || order.id}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 6 }}>
                      Macmiilka: <strong style={{ color: '#1E293B' }}>{order.customer_name || 'Guest'}</strong>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', marginBottom: 14 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>
                        Cuntooyinka La Geeynayo:
                      </div>
                      {(order.items || []).map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
                          • {it.quantity}x {it.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => updateOrderStatus(order.id, 'Completed', 0)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      background: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 3px 8px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <Check size={18} />
                    <span>Miiska Ayaan Geeyay / Mark Served</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: ACTIVE ORDERS SUMMARY ─── */}
      {activeSubTab === 'tables' && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14, color: '#1E293B' }}>
            Dhammaan Dalabyada Hadda Socda ({activeOrders.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    background: '#1E293B',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {ord.table_number}
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B' }}>
                      #{ord.order_number || ord.id} • {ord.customer_name || 'Guest'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {(ord.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: ord.status === 'Ready' ? '#DCFCE7' : ord.status === 'Preparing' ? '#FEF3C7' : '#EFF6FF',
                    color: ord.status === 'Ready' ? '#15803D' : ord.status === 'Preparing' ? '#B45309' : '#1D4ED8'
                  }}>
                    {ord.status}
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                    ${(ord.total_amount || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
