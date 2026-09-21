import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, CheckCircle2, Droplets, Receipt, Sparkles, Utensils, MessageSquare } from 'lucide-react';

const CALL_REASONS = [
  { id: 'water', label: 'Biyo Dheeraad ah', icon: Droplets, sub: 'Extra Water' },
  { id: 'bill', label: 'Bixi Biilka / Rasiid', icon: Receipt, sub: 'Request Bill' },
  { id: 'clean', label: 'Nadiifi Miiska', icon: Sparkles, sub: 'Clean Table' },
  { id: 'cutlery', label: 'Fargeeto & Suugo', icon: Utensils, sub: 'Extra Cutlery/Sauce' },
  { id: 'general', label: 'Caawimaad Guud', icon: Bell, sub: 'General Assistance' },
];

export const CallWaiterModal = ({ isOpen, onClose }) => {
  const { selectedTable, callWaiter } = useApp();
  const [selectedReason, setSelectedReason] = useState('Caawimaad Guud');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendCall = async () => {
    setLoading(true);
    const finalReason = customNote.trim() ? `${selectedReason} - ${customNote.trim()}` : selectedReason;
    try {
      await callWaiter({
        tableNumber: selectedTable,
        reason: finalReason
      });
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 420,
          width: '92%',
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={24} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Wac Kabeeleyga
              </h2>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: 2 }}>
                Miiskaaga: <strong style={{ background: '#FFFFFF', color: '#EA580C', padding: '1px 6px', borderRadius: 6, fontWeight: 900 }}>{selectedTable}</strong>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {sentSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
              }}>
                <CheckCircle2 size={44} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065F46', marginBottom: 6 }}>
                Kabeeleyga waa loo yeeray! 🛎️
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#047857', lineHeight: 1.5, margin: '0 auto', maxWidth: 280 }}>
                Shaqaalaha maqaayadda ayaa isla markiiba fariintaada helay, daqiiqad gudaheed ayay miiskaaga <strong>{selectedTable}</strong> kuugu imanayaan.
              </p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 10 }}>
                Maxaad u baahan tahay? (Dooro sababta)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 14 }}>
                {CALL_REASONS.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedReason === r.label;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReason(r.label)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #EA580C' : '1px solid #E2E8F0',
                        background: isSelected ? '#FFF7ED' : '#F8FAFC',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          background: isSelected ? '#EA580C' : '#E2E8F0',
                          color: isSelected ? '#FFFFFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#9A3412' : '#1E293B' }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{r.sub}</div>
                        </div>
                      </div>

                      <div style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #EA580C' : '2px solid #CBD5E1',
                        background: '#FFFFFF'
                      }} />
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Fariin dheeraad ah (ikhtiyaari)..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    background: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                onClick={handleSendCall}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                  transition: 'transform 0.15s'
                }}
              >
                <Bell size={18} />
                <span>{loading ? 'Fadlan sug...' : 'Wac Kabeeleyga Hadda 🛎️'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
