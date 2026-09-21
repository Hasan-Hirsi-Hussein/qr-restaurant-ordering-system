import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, KeyRound, ChefHat, Bell, ShieldCheck, ArrowRight, AlertCircle, LogIn, ShieldAlert } from 'lucide-react';

export const StaffAccessModal = ({ isOpen, onClose, onOpenFullAuth }) => {
  const { setCurrentRole, setActiveTab, t, user, setAdminAuth } = useApp();
  const [pin, setPin] = useState('');
  const [targetRole, setTargetRole] = useState('kitchen');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Check if user is already logged in as admin
  const isAlreadyAdmin = user && user.role === 'admin';
  const isAlreadyKitchen = user && (user.role === 'kitchen' || user.role === 'admin');
  const isAlreadyWaiter = user && (user.role === 'waiter' || user.role === 'admin');

  const checkPinValidity = (enteredPin, role) => {
    const savedStaffPin = localStorage.getItem('qr_menu_staff_pin') || '1234';
    const savedAdminPin = localStorage.getItem('qr_menu_admin_pin') || '9999';

    if (role === 'admin') {
      if (isAlreadyAdmin) return true;
      return enteredPin === savedAdminPin || enteredPin === '9999';
    } else {
      if (role === 'kitchen' && isAlreadyKitchen) return true;
      if (role === 'waiter' && isAlreadyWaiter) return true;
      return enteredPin === savedStaffPin || enteredPin === '1234' || enteredPin === savedAdminPin || enteredPin === '9999';
    }
  };

  const handleVerify = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (checkPinValidity(pin, targetRole)) {
      grantAccess(targetRole);
    } else {
      if (targetRole === 'admin') {
        setError('PIN-ka Admin-ku waa gooni (Default: 9999). Shaqaalaha caadiga ah looma ogola.');
      } else {
        setError('PIN-ku waa khalad! Fadlan geli PIN-ka shaqaalaha (Default: 1234).');
      }
    }
  };

  const grantAccess = (role) => {
    if (role === 'admin') {
      setAdminAuth(true);
    } else {
      setAdminAuth(false);
    }

    setCurrentRole(role);
    setActiveTab(role);

    const url = new URL(window.location);
    url.searchParams.set('role', role);
    window.history.pushState({}, '', url);

    setPin('');
    setError('');
    onClose();
  };

  const handlePinDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        // Auto-verify when 4 digits entered
        setTimeout(() => {
          if (checkPinValidity(nextPin, targetRole)) {
            grantAccess(targetRole);
          } else {
            if (targetRole === 'admin') {
              setError('PIN-ka Admin-ku waa gooni (Default: 9999). Shaqaalaha caadiga ah looma ogola.');
            } else {
              setError('PIN-ku waa khalad! Fadlan geli PIN-ka shaqaalaha (Default: 1234).');
            }
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: 410, borderRadius: 20, overflow: 'hidden' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: targetRole === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(217, 83, 30, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: targetRole === 'admin' ? '#EF4444' : 'var(--primary)'
            }}>
              {targetRole === 'admin' ? <ShieldAlert size={18} /> : <Lock size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                {targetRole === 'admin' ? 'Gelitaanka Maamulka' : 'Albaabka Shaqaalaha'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#A09790' }}>
                {targetRole === 'admin' ? 'Xafiiska Maamulka Sare & POS' : 'Jikada & Adeegayaasha Kaliya'}
              </p>
            </div>
          </div>
          <button className="icon-btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Target Role Selector */}
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D2CBC4', marginBottom: 8, display: 'block' }}>
            Dooro Qaybta aad gelayso:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            {/* Kitchen */}
            <button
              type="button"
              onClick={() => { setTargetRole('kitchen'); setPin(''); setError(''); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                border: targetRole === 'kitchen' ? '2px solid #EA580C' : '1px solid rgba(255,255,255,0.1)',
                background: targetRole === 'kitchen' ? 'rgba(234, 88, 12, 0.18)' : 'rgba(255,255,255,0.04)',
                color: targetRole === 'kitchen' ? '#FFFFFF' : '#A09790',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ChefHat size={20} style={{ color: targetRole === 'kitchen' ? '#EA580C' : 'inherit' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Jikada</span>
              <span style={{ fontSize: '0.62rem', color: '#888' }}>PIN: 1234</span>
            </button>

            {/* Waiter */}
            <button
              type="button"
              onClick={() => { setTargetRole('waiter'); setPin(''); setError(''); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                border: targetRole === 'waiter' ? '2px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                background: targetRole === 'waiter' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.04)',
                color: targetRole === 'waiter' ? '#FFFFFF' : '#A09790',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Bell size={20} style={{ color: targetRole === 'waiter' ? '#3B82F6' : 'inherit' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Waiter</span>
              <span style={{ fontSize: '0.62rem', color: '#888' }}>PIN: 1234</span>
            </button>

            {/* Admin (Protected with distinct Admin PIN) */}
            <button
              type="button"
              onClick={() => { setTargetRole('admin'); setPin(''); setError(''); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '12px 6px',
                borderRadius: 12,
                border: targetRole === 'admin' ? '2px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                background: targetRole === 'admin' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255,255,255,0.04)',
                color: targetRole === 'admin' ? '#FFFFFF' : '#A09790',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ShieldCheck size={20} style={{ color: targetRole === 'admin' ? '#EF4444' : 'inherit' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Maamulka</span>
              <span style={{ fontSize: '0.62rem', color: '#EF4444', fontWeight: 600 }}>PIN: 9999</span>
            </button>
          </div>

          {/* PIN Input Display */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#A09790' }}>
              {targetRole === 'admin'
                ? 'Geli PIN-ka Maamulka Sare (Default: 9999)'
                : 'Geli PIN-ka Shaqaalaha (Default: 1234)'}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 8
            }}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  style={{
                    width: 44,
                    height: 50,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: pin.length === idx ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#FFFFFF'
                  }}
                >
                  {pin[idx] ? '•' : ''}
                </div>
              ))}
            </div>
            {error && (
              <div style={{
                color: '#EF4444',
                fontSize: '0.78rem',
                lineHeight: '1.3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                marginTop: 8,
                padding: '6px 10px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 8
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* PIN Keypad */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 16
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePinDigit(String(num))}
                style={{
                  height: 46,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setPin(''); setError(''); }}
              style={{
                height: 46,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#A09790',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handlePinDigit('0')}
              style={{
                height: 46,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                fontSize: '1.25rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              style={{
                height: 46,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#A09790',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ⌫
            </button>
          </div>

          {/* Full Account Login */}
          <div style={{ textAlign: 'center', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenFullAuth) onOpenFullAuth();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <LogIn size={13} />
              <span>Ku gal Email & Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
