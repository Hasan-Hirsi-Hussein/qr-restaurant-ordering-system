import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, MapPin, Phone, Clock, ExternalLink, Compass } from 'lucide-react';

export const BranchesModal = ({ isOpen, onClose }) => {
  const { branches, branding, t } = useApp();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 540,
          width: '92%',
          maxHeight: '88vh',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: '#FFFFFF',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          background: 'var(--primary)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Laamaha Maqaayadda
              </h2>
              <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: 2 }}>
                {branding?.restaurantName || 'Le Bistro'} • {branches.length} Laamood
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
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Branches Scroll List */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {branches && branches.length > 0 ? (
            branches.map((branch) => (
              <div
                key={branch.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                {/* Branch Image & Status */}
                <div style={{ position: 'relative', height: 130, width: '100%', overflow: 'hidden' }}>
                  <img
                    src={branch.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop'}
                    alt={branch.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(22, 101, 52, 0.9)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
                    Furan Hadda
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '12px 14px 6px 14px',
                    color: '#FFFFFF'
                  }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      {branch.name}
                    </h3>
                  </div>
                </div>

                {/* Branch Details */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.83rem', color: '#475569', marginBottom: 8 }}>
                    <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{branch.address}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.8rem', color: '#64748B', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={14} color="#D97706" />
                      <span style={{ fontWeight: 600 }}>{branch.opening_hours || '08:00 AM - 11:30 PM'}</span>
                    </div>
                    {branch.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Phone size={14} color="#15803D" />
                        <span style={{ fontWeight: 600 }}>{branch.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions (Call & Maps) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderTop: '1px solid #E2E8F0', paddingTop: 10 }}>
                    {branch.phone ? (
                      <a
                        href={`tel:${branch.phone}`}
                        style={{
                          textDecoration: 'none',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#065F46',
                          borderRadius: '10px',
                          padding: '8px 10px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <Phone size={14} />
                        <span>Wac Laanta</span>
                      </a>
                    ) : (
                      <div />
                    )}

                    <a
                      href={branch.maps_url || `https://maps.google.com/?q=${encodeURIComponent(branch.name + ' ' + branch.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'none',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1E40AF',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Compass size={14} />
                      <span>Khariidada (Map)</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748B' }}>
              <MapPin size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>Weli laamo laguma darin nidaamka.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              background: 'var(--primary)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Waad Mahadsantahay
          </button>
        </div>
      </div>
    </div>
  );
};
