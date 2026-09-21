import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserCheck, LogIn, UserPlus, Lock, Mail, Phone, User, ShieldCheck, ChefHat, Loader2 } from 'lucide-react';

export const AuthModal = ({ onClose }) => {
  const { t, login, register, setCurrentRole, setActiveTab } = useApp();
  const [activeTab, setActiveAuthTab] = useState('login'); // 'login' | 'register'
  
  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('customer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(loginEmail, loginPassword);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        setCurrentRole('admin');
        setActiveTab('admin');
      } else if (result.user.role === 'kitchen') {
        setCurrentRole('kitchen');
        setActiveTab('kitchen');
      }
      onClose();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: regRole,
    });
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        setCurrentRole('admin');
        setActiveTab('admin');
      } else if (result.user.role === 'kitchen') {
        setCurrentRole('kitchen');
        setActiveTab('kitchen');
      }
      onClose();
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const fillDemoAccount = (email, password) => {
    setActiveAuthTab('login');
    setLoginEmail(email);
    setLoginPassword(password);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content payment-modal" style={{ maxWidth: 440 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCheck size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{t('account')}</h3>
          </div>
          <button className="icon-btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher: Login / Sign Up */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <button
            onClick={() => { setActiveAuthTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'login' ? 'rgba(217,83,30,0.15)' : 'transparent',
              color: activeTab === 'login' ? 'var(--primary)' : '#94A3B8',
              border: 'none',
              borderBottom: activeTab === 'login' ? '2px solid var(--primary)' : 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <LogIn size={16} />
            <span>{t('signIn')}</span>
          </button>
          <button
            onClick={() => { setActiveAuthTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'register' ? 'rgba(217,83,30,0.15)' : 'transparent',
              color: activeTab === 'register' ? 'var(--primary)' : '#94A3B8',
              border: 'none',
              borderBottom: activeTab === 'register' ? '2px solid var(--primary)' : 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <UserPlus size={16} />
            <span>{t('signUp')}</span>
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#F87171',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: 16
            }}>
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#D0C7C0', display: 'block', marginBottom: 4 }}>
                  {t('emailLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                  <input
                    type="email"
                    className="theme-input"
                    placeholder="e.g. admin@lebistro.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#D0C7C0', display: 'block', marginBottom: 4 }}>
                  {t('passwordLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                  <input
                    type="password"
                    className="theme-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                  />
                </div>
              </div>

              <button className="btn-primary-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? <Loader2 size={18} className="spin-icon" /> : <span>{t('signIn')}</span>}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#D0C7C0', display: 'block', marginBottom: 4 }}>
                  {t('fullNameLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                  <input
                    type="text"
                    className="theme-input"
                    placeholder="e.g. Ahmed Ali"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#D0C7C0', display: 'block', marginBottom: 4 }}>
                  {t('emailLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                  <input
                    type="email"
                    className="theme-input"
                    placeholder="e.g. ahmed@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#D0C7C0', display: 'block', marginBottom: 4 }}>
                  {t('phoneLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                  <input
                    type="tel"
                    className="theme-input"
                    placeholder="e.g. 0615550000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#D0C7C0', display: 'block', marginBottom: 4 }}>
                  {t('passwordLabel')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                  <input
                    type="password"
                    className="theme-input"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#D0C7C0', display: 'block', marginBottom: 4 }}>
                  {t('roleLabel')}
                </label>
                <select
                  className="theme-input"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{ background: '#262320' }}
                >
                  <option value="customer">Customer / Macmiil</option>
                  <option value="kitchen">Kitchen Staff / Jiko</option>
                  <option value="admin">Restaurant Admin / Maamul</option>
                </select>
              </div>

              <button className="btn-primary-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? <Loader2 size={18} className="spin-icon" /> : <span>{t('signUp')}</span>}
              </button>
            </form>
          )}

          {/* Quick Demo Accounts Helper */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>
              {t('demoAccounts')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@lebistro.com', 'admin123')}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  padding: '6px 4px',
                  color: '#F8FAFC',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <ShieldCheck size={12} style={{ color: 'var(--primary)' }} />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('kitchen@lebistro.com', 'kitchen123')}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  padding: '6px 4px',
                  color: '#F8FAFC',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <ChefHat size={12} style={{ color: 'var(--warm-amber)' }} />
                <span>Kitchen</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('abdi@gmail.com', 'user123')}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  padding: '6px 4px',
                  color: '#F8FAFC',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <User size={12} style={{ color: 'var(--sage-green)' }} />
                <span>Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
