import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import QRCode from 'qrcode';
import {
  ShieldCheck, Plus, Edit2, Trash2, QrCode, DollarSign, Layers, ExternalLink,
  Download, ChefHat, Clock, CheckCircle2, Play, BarChart2, Settings,
  CreditCard, Printer, LogOut, Utensils, TrendingUp, Users, AlertCircle,
  Package, ChevronRight, Search, RefreshCw, X, CheckCheck, Timer, Sparkles, Building2, Check,
  CalendarDays, ArrowUpRight, Filter, Wallet, Star, MapPin, Bell
} from 'lucide-react';
import { ThermalReceipt } from '../Common/ThermalReceipt';
import { RestaurantLogo } from '../Common/RestaurantLogo';
import { WaiterDashboard } from '../Waiter/WaiterDashboard';

// ─── SIDEBAR NAV ITEMS ────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'billing',    label: 'Billing Desk',  icon: CreditCard   },
  { id: 'orders',     label: 'Orders',         icon: Layers       },
  { id: 'kds',        label: 'KDS (Jikada)',   icon: ChefHat      },
  { id: 'waiter',     label: 'Waiter Desk',    icon: Bell         },
  { id: 'analytics',  label: 'Analytics',      icon: BarChart2    },
  { id: 'reviews',    label: 'Reviews',        icon: Star         },
  { id: 'branches',   label: 'Branches',       icon: MapPin       },
  { id: 'menu',       label: 'Menu',           icon: Utensils     },
  { id: 'qrcodes',    label: 'QR Codes',       icon: QrCode       },
  { id: 'settings',   label: 'Settings',       icon: Settings     },
];

export const AdminDashboard = () => {
  const {
    products, categories, tablesList, ordersList,
    toggleDishAvailability, fetchMenu, fetchTables, fetchOrders,
    updateOrderStatus, updateOrderPaymentStatus, t,
    logout, user,
    branding, updateBranding, setShowSettingsModal,
    branches, fetchBranches,
    waiterCalls, attendWaiterCall
  } = useApp();

  const [activePage, setActivePage] = useState('billing');
  const [metrics, setMetrics] = useState({ activeTablesCount: 0, totalTablesCount: 0, pendingOrdersCount: 0, grossRevenue: 0 });
  const [settleOrder, setSettleOrder] = useState(null);
  const [settlingMethod, setSettlingMethod] = useState('EVC Plus');

  // Modern Table Badge Renderer (Prevents wrapping and ugly breaks)
  const renderTableBadge = (tableNum) => {
    if (!tableNum) return <span className="table-chip">Table —</span>;
    const cleanNum = tableNum.replace(/^TB-?/i, '');
    return (
      <span className="table-chip" title={`Miiska ${tableNum}`}>
        <span className="table-chip-label">TABLE</span>
        <span className="table-chip-num">{cleanNum}</span>
      </span>
    );
  };

  // Customer reviews state
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ avgRating: 4.8, totalReviews: 0 });

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data) {
        setReviewsList(data.reviews || []);
        setReviewsStats({ avgRating: data.avgRating || 4.8, totalReviews: data.totalReviews || 0 });
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Branches state & handlers
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchForm, setNewBranchForm] = useState({
    name: '', address: '', city: 'Muqdisho', phone: '', opening_hours: '08:00 AM - 11:30 PM',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
    maps_url: ''
  });
  const [branchSaving, setBranchSaving] = useState(false);

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    if (!newBranchForm.name || !newBranchForm.address) return;
    setBranchSaving(true);
    try {
      await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranchForm)
      });
      setShowAddBranchModal(false);
      setNewBranchForm({
        name: '', address: '', city: 'Muqdisho', phone: '', opening_hours: '08:00 AM - 11:30 PM',
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
        maps_url: ''
      });
      fetchBranches();
    } catch (err) {
      console.error(err);
    } finally {
      setBranchSaving(false);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirto laantan?')) return;
    try {
      await fetch(`/api/branches/${id}`, { method: 'DELETE' });
      fetchBranches();
    } catch (err) {
      console.error(err);
    }
  };

  // Menu state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(1);
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImg, setProdImg] = useState('/images/smash_burger.jpg');
  const [menuSearch, setMenuSearch] = useState('');

  // QR state
  const [qrSelectedTable, setQrSelectedTable] = useState('TB-07');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [newTableNum, setNewTableNum] = useState('');

  // Receipt state
  const [selectedPrintOrder, setSelectedPrintOrder] = useState(null);

  // KDS filter
  const [kdsFilter, setKdsFilter] = useState('All');

  // Analytics filters
  const [analyticsFilter, setAnalyticsFilter] = useState('all');
  const [dateSearch, setDateSearch] = useState('');

  // Admin Branding Settings Form State
  const [adminBrandingForm, setAdminBrandingForm] = useState({
    restaurantName: branding?.restaurantName || 'Le Bistro',
    tagline: branding?.tagline || 'Fine Dining & Fresh Taste',
    phone: branding?.phone || '+252 61 500 0000',
    address: branding?.address || 'Maka Al-Mukarama Street, Mogadishu',
    website: branding?.website || 'www.lebistro-restaurant.com',
  });
  const [adminSavingSettings, setAdminSavingSettings] = useState(false);
  const [adminSaveSuccess, setAdminSaveSuccess] = useState(false);

  useEffect(() => {
    if (branding) {
      setAdminBrandingForm({
        restaurantName: branding.restaurantName || '',
        tagline: branding.tagline || '',
        phone: branding.phone || '',
        address: branding.address || '',
        website: branding.website || '',
      });
    }
  }, [branding]);

  const handleAdminSaveBranding = async (e) => {
    e.preventDefault();
    setAdminSavingSettings(true);
    await updateBranding({
      ...branding,
      ...adminBrandingForm,
    });
    setAdminSavingSettings(false);
    setAdminSaveSuccess(true);
    setTimeout(() => setAdminSaveSuccess(false), 3000);
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (e) {}
  };

  useEffect(() => { fetchMetrics(); }, [products, ordersList]);

  useEffect(() => {
    const tableUrl = `${window.location.origin}/?table=${qrSelectedTable}`;
    QRCode.toDataURL(tableUrl, { width: 300, margin: 2, color: { dark: '#1F1A17', light: '#FAF7F2' } }, (err, url) => {
      if (!err) setQrDataUrl(url);
    });
  }, [qrSelectedTable]);

  const openAddModal = () => {
    setEditingProduct(null);
    setProdName(''); setProdDesc(''); setProdPrice('');
    setProdCategory(categories[0] ? categories[0].id : 1);
    setProdImg('/images/smash_burger.jpg');
    setShowAddModal(true);
  };
  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.name); setProdDesc(prod.description);
    setProdPrice(prod.price); setProdCategory(prod.category_id);
    setProdImg(prod.image_url);
    setShowAddModal(true);
  };
  const handleSaveProduct = async () => {
    if (!prodName || !prodPrice) return alert('Name and Price are required');
    const payload = { category_id: parseInt(prodCategory), name: prodName, description: prodDesc, price: parseFloat(prodPrice), image_url: prodImg };
    try {
      if (editingProduct) {
        await fetch(`/api/admin/products/${editingProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setShowAddModal(false); fetchMenu();
    } catch (e) {}
  };
  const handleDeleteProduct = async (id) => {
    if (confirm('Delete this dish?')) { try { await fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); fetchMenu(); } catch (e) {} }
  };
  const handleAddTable = async () => {
    if (!newTableNum) return;
    try { await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table_number: newTableNum }) }); setNewTableNum(''); fetchTables(); } catch (e) {}
  };
  const handleDeleteTable = async (id) => {
    try { await fetch(`/api/tables/${id}`, { method: 'DELETE' }); fetchTables(); } catch (e) {}
  };

  const paidOrders = ordersList.filter(o => o.payment_status === 'Paid' || o.status === 'Completed');
  const activeOrders = ordersList.filter(o => o.status !== 'Completed' && o.payment_status !== 'Paid');
  const kdsOrders = ordersList.filter(o => kdsFilter === 'All' ? o.status !== 'Completed' : o.status === kdsFilter);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(menuSearch.toLowerCase()));

  const STATUS_COLOR = { New: '#F59E0B', Accepted: '#3B82F6', Preparing: '#8B5CF6', Ready: '#10B981', Completed: '#6B7280' };

  return (
    <div className="admin-shell">
      {/* ─── SIDEBAR ─────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Utensils size={20} />
          </div>
          <div>
            <div className="sidebar-brand-name">Burger House</div>
            <div className="sidebar-brand-sub">Active Service</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar-nav-item ${activePage === id ? 'active' : ''}`}
              onClick={() => setActivePage(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {user.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">Administrator</div>
              </div>
            </div>
          )}
          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ────────────────────── */}
      <main className="admin-main">

        {/* ─── ACTIVE WAITER CALLS ALERTS ─── */}
        {waiterCalls && waiterCalls.length > 0 && (
          <div style={{
            margin: '0 0 20px 0',
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
                  padding: '12px 18px',
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
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: '#EA580C',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)'
                  }}>
                    <Bell size={22} />
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
                      <strong style={{ fontSize: '1rem', color: '#9A3412' }}>
                        Wacitaan Kabeeley! (Staff Service Call)
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#C2410C', fontWeight: 700, marginTop: 2 }}>
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

        {/* ══════════ BILLING DESK ══════════ */}
        {activePage === 'billing' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div className="admin-page-icon" style={{ background: '#FFF7ED', color: '#EA580C' }}>
                <CreditCard size={22} />
              </div>
              <div>
                <h1 className="admin-page-title">Cashier &amp; Billing Desk</h1>
                <p className="admin-page-sub">Manage active table sessions, process payments, and print thermal receipts</p>
              </div>
              <button className="admin-refresh-btn" onClick={() => { fetchOrders(); fetchMetrics(); }}>
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Active Sessions */}
            <div className="admin-section">
              <div className="admin-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} style={{ color: '#EA580C' }} />
                  <h2 className="admin-section-title">Active Table Sessions</h2>
                  <span className="admin-badge orange">{activeOrders.length} Table(s)</span>
                </div>
              </div>

              {activeOrders.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon">
                    <CheckCheck size={32} style={{ color: '#D9531E' }} />
                  </div>
                  <h3>All Checked Out!</h3>
                  <p>There are currently no active unpaid table sessions.<br />When customers scan QR codes and place orders, active sessions will render here.</p>
                </div>
              ) : (
                <div className="billing-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date &amp; Time</th>
                        <th>Order ID</th>
                        <th style={{ whiteSpace: 'nowrap', minWidth: 95 }}>Table</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Status</th>
                        <th>Total (USD)</th>
                        <th>Payment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrders.map(order => (
                        <tr key={order.id}>
                          <td>{new Date(order.created_at).toLocaleString()}</td>
                          <td><span className="order-id-badge">#{order.id}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{renderTableBadge(order.table_number)}</td>
                          <td>{order.customer_name || 'Guest'}</td>
                          <td>{order.items?.length || 0} item(s)</td>
                          <td><span className="status-pill" style={{ background: STATUS_COLOR[order.status] + '22', color: STATUS_COLOR[order.status] }}>{order.status}</span></td>
                          <td><strong>${(order.total_amount || 0).toFixed(2)}</strong></td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <span className={`pay-pill ${order.payment_status === 'Paid' ? 'paid' : 'pending'}`}>
                                {order.payment_status === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                              </span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280' }}>
                                {order.payment_method || 'Pay Cash at Table'}
                              </span>
                            </div>
                          </td>
                          <td style={{ display: 'flex', gap: 6 }}>
                            {order.payment_status !== 'Paid' && (
                              <button
                                className="admin-action-btn"
                                style={{ background: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                                onClick={() => { setSettleOrder(order); setSettlingMethod(order.payment_method || 'EVC Plus'); }}
                                title="Bixi Biilka / Settle in DB"
                              >
                                <CreditCard size={13} /> Settle Bill
                              </button>
                            )}
                            <button className="admin-action-btn" onClick={() => setSelectedPrintOrder(order)} title="Print Receipt">
                              <Printer size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Paid Orders */}
            <div className="admin-section">
              <div className="admin-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                  <h2 className="admin-section-title">Recently Paid &amp; Completed Orders</h2>
                  <span className="admin-badge green">{paidOrders.length} Paid Order(s)</span>
                </div>
              </div>
              <div className="billing-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date &amp; Time</th>
                      <th>Order ID</th>
                      <th style={{ whiteSpace: 'nowrap', minWidth: 95 }}>Table</th>
                      <th>Items Purchased</th>
                      <th>Status</th>
                      <th>Total (USD)</th>
                      <th>Total (SLSH)</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidOrders.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9CA3AF', padding: 24 }}>No completed orders yet</td></tr>
                    ) : paidOrders.map(order => (
                      <tr key={order.id}>
                        <td>{new Date(order.created_at).toLocaleString()}</td>
                        <td><span className="order-id-badge">#{order.id}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{renderTableBadge(order.table_number)}</td>
                        <td>{(order.items || []).map(i => i.name).join(', ') || '—'}</td>
                        <td><span className="status-pill" style={{ background: '#10B98122', color: '#10B981' }}>Completed</span></td>
                        <td><strong>${(order.total_amount || 0).toFixed(2)}</strong></td>
                        <td style={{ color: '#9CA3AF' }}>SL {((order.total_amount || 0) * 570).toLocaleString()}</td>
                        <td>
                          <button className="admin-action-btn" onClick={() => setSelectedPrintOrder(order)}>
                            <Printer size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ ORDERS ══════════ */}
        {activePage === 'orders' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div className="admin-page-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                <Layers size={22} />
              </div>
              <div>
                <h1 className="admin-page-title">All Orders</h1>
                <p className="admin-page-sub">Real-time order management across all tables</p>
              </div>
              <button className="admin-refresh-btn" onClick={fetchOrders}><RefreshCw size={15} /></button>
            </div>

            {/* Stats Row */}
            <div className="admin-stats-row">
              {[
                { label: 'New', count: ordersList.filter(o => o.status === 'New').length, color: '#F59E0B', bg: '#FFF7ED' },
                { label: 'Preparing', count: ordersList.filter(o => o.status === 'Preparing' || o.status === 'Accepted').length, color: '#8B5CF6', bg: '#F5F3FF' },
                { label: 'Ready', count: ordersList.filter(o => o.status === 'Ready').length, color: '#10B981', bg: '#ECFDF5' },
                { label: 'Completed', count: ordersList.filter(o => o.status === 'Completed').length, color: '#6B7280', bg: '#F9FAFB' },
              ].map(s => (
                <div key={s.label} className="admin-stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                  <div className="admin-stat-num" style={{ color: s.color }}>{s.count}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="admin-section">
              <div className="billing-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th style={{ whiteSpace: 'nowrap', minWidth: 95 }}>Table</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Notes</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign: 'center', color: '#9CA3AF', padding: 32 }}>No orders yet</td></tr>
                    ) : ordersList.map(order => (
                      <tr key={order.id}>
                        <td><span className="order-id-badge">#{order.id}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{renderTableBadge(order.table_number)}</td>
                        <td>{order.customer_name || 'Guest'}</td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(order.items || []).map(i => i.name).join(', ')}
                        </td>
                        <td style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{order.notes || '—'}</td>
                        <td>
                          <span className="status-pill" style={{ background: (STATUS_COLOR[order.status] || '#9CA3AF') + '22', color: STATUS_COLOR[order.status] || '#9CA3AF' }}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className={`pay-pill ${order.payment_status === 'Paid' ? 'paid' : 'pending'}`}>
                              {order.payment_status === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700 }}>
                              {order.payment_method || 'Pay Cash at Table'}
                            </span>
                          </div>
                        </td>
                        <td><strong>${(order.total_amount || 0).toFixed(2)}</strong></td>
                        <td style={{ display: 'flex', gap: 4 }}>
                          <button className="admin-action-btn" onClick={() => setSelectedPrintOrder(order)}><Printer size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ KDS ══════════ */}
        {activePage === 'kds' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div className="admin-page-icon" style={{ background: '#FFF7ED', color: '#EA580C' }}>
                <ChefHat size={22} />
              </div>
              <div>
                <h1 className="admin-page-title">Kitchen Display System</h1>
                <p className="admin-page-sub">Live order queue for kitchen staff</p>
              </div>
              <button className="admin-refresh-btn" onClick={fetchOrders}><RefreshCw size={15} /></button>
            </div>

            {/* Filter Chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['All', 'New', 'Accepted', 'Preparing', 'Ready'].map(f => (
                <button
                  key={f}
                  onClick={() => setKdsFilter(f)}
                  className={`kds-filter-chip ${kdsFilter === f ? 'active' : ''}`}
                >
                  {f}
                  {f !== 'All' && <span className="kds-chip-count">{ordersList.filter(o => o.status === f).length}</span>}
                </button>
              ))}
            </div>

            {kdsOrders.length === 0 ? (
              <div className="admin-empty-state">
                <div className="admin-empty-icon"><CheckCheck size={32} style={{ color: '#10B981' }} /></div>
                <h3>Kitchen Clear!</h3>
                <p>No active orders in the queue.</p>
              </div>
            ) : (
              <div className="kds-cards-grid">
                {kdsOrders.map(order => (
                  <div key={order.id} className={`kds-order-card status-${order.status}`}>
                    <div className="kds-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="kds-table-badge">{order.table_number}</span>
                        <span className="order-id-badge">#{order.id}</span>
                      </div>
                      <span className="status-pill" style={{ background: (STATUS_COLOR[order.status] || '#9CA3AF') + '22', color: STATUS_COLOR[order.status] || '#9CA3AF', fontSize: '0.75rem' }}>
                        {order.status}
                      </span>
                    </div>
                    <div className="kds-customer">{order.customer_name || 'Guest'}</div>
                    <ul className="kds-items-list">
                      {(order.items || []).map((item, i) => (
                        <li key={i}>
                          <span className="kds-item-qty">×{item.quantity}</span>
                          <span>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                    {order.notes && (
                      <div className="kds-notes">
                        <AlertCircle size={12} /> {order.notes}
                      </div>
                    )}
                    <div className="kds-card-actions">
                      {order.status === 'New' && (
                        <button className="kds-action-btn accept" onClick={() => updateOrderStatus(order.id, 'Accepted', 15)}>
                          <Play size={13} /> Accept
                        </button>
                      )}
                      {(order.status === 'Accepted') && (
                        <button className="kds-action-btn prep" onClick={() => updateOrderStatus(order.id, 'Preparing', 15)}>
                          <Timer size={13} /> Start Prep
                        </button>
                      )}
                      {order.status === 'Preparing' && (
                        <button className="kds-action-btn ready" onClick={() => updateOrderStatus(order.id, 'Ready', 0)}>
                          <CheckCircle2 size={13} /> Mark Ready
                        </button>
                      )}
                      {order.status === 'Ready' && (
                        <button className="kds-action-btn done" onClick={() => updateOrderStatus(order.id, 'Completed', 0)}>
                          <CheckCheck size={13} /> Complete
                        </button>
                      )}
                      <button className="admin-action-btn" onClick={() => setSelectedPrintOrder(order)}><Printer size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════ WAITER DESK ══════════ */}
        {activePage === 'waiter' && (
          <div className="admin-page" style={{ maxWidth: '100%', padding: 0 }}>
            <WaiterDashboard />
          </div>
        )}

        {/* ══════════ ANALYTICS ══════════ */}
        {activePage === 'analytics' && (() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

          const dailyData = metrics.dailyBreakdown || [];
          const maxRevDay = dailyData.length ? Math.max(...dailyData.map(d => d.daily_revenue || 0)) : 1;

          const filteredDaily = dailyData.filter(row => {
            const d = row.order_date || '';
            if (analyticsFilter === 'today') return d === todayStr;
            if (analyticsFilter === '7days') {
              const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
              return d >= cutoff;
            }
            if (analyticsFilter === 'month') {
              return d.startsWith(todayStr.slice(0, 7));
            }
            return true;
          }).filter(row => {
            if (!dateSearch) return true;
            const q = dateSearch.toLowerCase();
            return (row.order_date || '').includes(q);
          });

          const getDayLabel = (dateStr) => {
            if (!dateStr) return '—';
            if (dateStr === todayStr) return 'Today';
            if (dateStr === yesterdayStr) return 'Yesterday';
            try {
              const d = new Date(dateStr + 'T12:00:00');
              return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            } catch { return dateStr; }
          };

          return (
            <div className="admin-page">
              {/* ─── PAGE HEADER ─── */}
              <div className="admin-page-header">
                <div className="admin-page-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                  <BarChart2 size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <h1 className="admin-page-title">{t('analyticsTitle')}</h1>
                  <p className="admin-page-sub">{t('analyticsSubtitle')}</p>
                  {metrics.firstOrderDate && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                      📅 {t('operatingSince')} <strong>{metrics.firstOrderDate}</strong> &nbsp;→&nbsp; {t('upToToday')} <strong>{todayStr}</strong>
                    </p>
                  )}
                </div>
                <button
                  className="admin-secondary-btn"
                  onClick={fetchMetrics}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {/* ─── TOP SUMMARY CARDS ─── */}
              <div className="analytics-grid" style={{ marginBottom: 24 }}>
                {/* Card 1: All-Time Gross Revenue */}
                <div className="analytics-card" style={{ border: '1.5px solid #10B981', background: 'linear-gradient(135deg, #ECFDF5, #FFFFFF)' }}>
                  <div className="analytics-card-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
                    <Wallet size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="analytics-value" style={{ color: '#059669', fontSize: '1.8rem' }}>
                      ${(metrics.grossRevenue || 0).toFixed(2)}
                    </div>
                    <div className="analytics-label">{t('allTimeGrossRevenue')}</div>
                    <div className="analytics-sub">
                      {t('allTimeRevenueSub')} · {metrics.totalOrdersCount || 0} orders total
                    </div>
                  </div>
                </div>

                {/* Card 2: Today's Revenue */}
                <div className="analytics-card" style={{ border: '1.5px solid #3B82F6', background: 'linear-gradient(135deg, #EFF6FF, #FFFFFF)' }}>
                  <div className="analytics-card-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                    <CalendarDays size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span className="live-pulse-dot"></span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>Live Today</span>
                    </div>
                    <div className="analytics-value" style={{ color: '#2563EB' }}>
                      ${(metrics.todayRevenue || 0).toFixed(2)}
                    </div>
                    <div className="analytics-label">{t('todayRevenueLabel')}</div>
                    <div className="analytics-sub">{metrics.todayOrdersCount || 0} {t('todayOrdersCount')}</div>
                  </div>
                </div>

                {/* Card 3: Active Tables */}
                <div className="analytics-card">
                  <div className="analytics-card-icon" style={{ background: '#FFF7ED', color: '#F59E0B' }}>
                    <QrCode size={22} />
                  </div>
                  <div>
                    <div className="analytics-value" style={{ color: '#F59E0B' }}>
                      {metrics.activeTablesCount || 0} / {tablesList.length}
                    </div>
                    <div className="analytics-label">Active Tables</div>
                    <div className="analytics-sub">Currently occupied</div>
                  </div>
                </div>

                {/* Card 4: Menu Items */}
                <div className="analytics-card">
                  <div className="analytics-card-icon" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
                    <Package size={22} />
                  </div>
                  <div>
                    <div className="analytics-value" style={{ color: '#8B5CF6' }}>{products.length}</div>
                    <div className="analytics-label">Menu Items</div>
                    <div className="analytics-sub">Available dishes</div>
                  </div>
                </div>
              </div>

              {/* ─── TOP SELLING DISHES ─── */}
              {(metrics.topProducts || []).length > 0 && (
                <div className="admin-section" style={{ marginBottom: 24 }}>
                  <h2 className="admin-section-title" style={{ marginBottom: 14 }}>
                    🏆 {t('topDishesTitle')}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {(metrics.topProducts || []).map((dish, idx) => (
                      <div key={dish.product_name} style={{
                        background: idx === 0 ? 'linear-gradient(135deg, #FFF7ED, #FFFFFF)' : '#FAFAFA',
                        border: idx === 0 ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                        borderRadius: 10,
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}>
                        <div style={{
                          width: 32, height: 32,
                          borderRadius: 8,
                          background: idx === 0 ? '#FEF3C7' : '#F1F5F9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.9rem',
                          color: idx === 0 ? '#D97706' : '#64748B',
                          flexShrink: 0
                        }}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {dish.product_name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
                            {dish.total_sold} {t('soldCount')} · ${(dish.total_revenue || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── DAILY SALES BREAKDOWN ─── */}
              <div className="admin-section">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div>
                    <h2 className="admin-section-title" style={{ marginBottom: 2 }}>
                      📅 {t('dailyRevenueBreakdown')}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8' }}>{t('dailyRevenueDesc')}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F1F5F9', padding: '6px 10px', borderRadius: 8 }}>
                    <Search size={14} style={{ color: '#94A3B8' }} />
                    <input
                      type="text"
                      placeholder={t('searchDatePlaceholder')}
                      value={dateSearch}
                      onChange={e => setDateSearch(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', width: 220, color: '#1E293B' }}
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="daily-filter-bar">
                  {[
                    { id: 'all', label: t('filterAllDays') },
                    { id: 'today', label: t('filterToday') },
                    { id: '7days', label: t('filterLast7Days') },
                    { id: 'month', label: t('filterThisMonth') },
                  ].map(f => (
                    <button
                      key={f.id}
                      className={`daily-filter-btn ${analyticsFilter === f.id ? 'active' : ''}`}
                      onClick={() => setAnalyticsFilter(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                  <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
                    {filteredDaily.length} {filteredDaily.length === 1 ? 'day' : 'days'} · Total: <strong style={{ color: '#10B981' }}>${filteredDaily.reduce((s, r) => s + (r.daily_revenue || 0), 0).toFixed(2)}</strong>
                  </div>
                </div>

                {/* Daily Rows */}
                {filteredDaily.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8', fontSize: '0.88rem' }}>
                    📭 {t('noDailyRecords')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {filteredDaily.map((row, idx) => {
                      const isToday = row.order_date === todayStr;
                      const isYesterday = row.order_date === yesterdayStr;
                      const pct = maxRevDay > 0 ? Math.round((row.daily_revenue / maxRevDay) * 100) : 0;
                      const avgOrder = row.orders_count > 0 ? (row.daily_revenue / row.orders_count) : 0;
                      const payMethods = [
                        { label: 'EVC', val: row.evc_amount, color: '#059669' },
                        { label: 'ZAAD', val: row.zaad_amount, color: '#2563EB' },
                        { label: 'Sahal', val: row.sahal_amount, color: '#7C3AED' },
                        { label: 'Card', val: row.card_amount, color: '#DB2777' },
                        { label: 'Cash', val: row.cash_amount, color: '#D97706' },
                      ].filter(p => p.val > 0);

                      return (
                        <div
                          key={row.order_date}
                          className={`daily-breakdown-card ${isToday ? 'today-card' : ''}`}
                        >
                          <div className="daily-card-header">
                            {/* Left: Date & Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 180 }}>
                              <div style={{
                                width: 40, height: 40,
                                borderRadius: 10,
                                background: isToday ? '#D1FAE5' : isYesterday ? '#DBEAFE' : '#F1F5F9',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isToday ? '#059669' : '#64748B', textTransform: 'uppercase' }}>
                                  {row.order_date ? new Date(row.order_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }) : ''}
                                </span>
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: isToday ? '#059669' : '#1E293B', lineHeight: 1.1 }}>
                                  {row.order_date ? new Date(row.order_date + 'T12:00:00').getDate() : ''}
                                </span>
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1E293B' }}>
                                    {getDayLabel(row.order_date)}
                                  </span>
                                  {isToday && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#D1FAE5', color: '#059669', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase' }}>
                                      <span className="live-pulse-dot" style={{ width: 6, height: 6 }}></span>
                                      {t('todayBadge')}
                                    </span>
                                  )}
                                  {isYesterday && (
                                    <span style={{ background: '#DBEAFE', color: '#2563EB', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase' }}>
                                      {t('yesterdayBadge')}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                  {row.order_date}
                                </div>
                              </div>
                            </div>

                            {/* Center: Revenue Bar */}
                            <div style={{ flex: 1, padding: '0 16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>Revenue</span>
                                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>{pct}%</span>
                              </div>
                              <div className="daily-vol-bar-track">
                                <div className="daily-vol-bar-fill" style={{ width: `${pct}%` }}></div>
                              </div>
                              {/* Payment method chips */}
                              {payMethods.length > 0 && (
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                                  {payMethods.map(p => (
                                    <span
                                      key={p.label}
                                      className="pay-badge-chip"
                                      style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}
                                    >
                                      {p.label} ${p.val.toFixed(2)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right: Numbers */}
                            <div style={{ display: 'flex', gap: 20, textAlign: 'right', flexShrink: 0 }}>
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, marginBottom: 2 }}>{t('ordersNum')}</div>
                                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#3B82F6' }}>{row.orders_count}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, marginBottom: 2 }}>{t('avgOrderValue')}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748B' }}>${avgOrder.toFixed(2)}</div>
                              </div>
                              <div style={{ minWidth: 90 }}>
                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, marginBottom: 2 }}>{t('dailyTotalRevenue')}</div>
                                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#10B981' }}>
                                  ${(row.daily_revenue || 0).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ─── ALL-TIME REVENUE BY PAYMENT METHOD ─── */}
              <div className="admin-section" style={{ marginTop: 24 }}>
                <h2 className="admin-section-title" style={{ marginBottom: 16 }}>
                  💳 {t('revenueByPayment')}
                </h2>
                <div className="billing-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Payment Method</th>
                        <th style={{ textAlign: 'center' }}>Orders</th>
                        <th style={{ textAlign: 'right' }}>Total Revenue</th>
                        <th style={{ textAlign: 'right' }}>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'EVC Plus (Hormuud)', match: m => /evc/i.test(m), color: '#059669', badge: 'EVC' },
                        { name: 'ZAAD Service (Telesom)', match: m => /zaad/i.test(m), color: '#2563EB', badge: 'ZAAD' },
                        { name: 'Sahal Service (Golis)', match: m => /sahal/i.test(m), color: '#EA580C', badge: 'SAHAL' },
                        { name: 'Credit / Debit Card', match: m => /card/i.test(m), color: '#7C3AED', badge: 'CARD' },
                        { name: 'Pay Cash at Table / Cash', match: m => /cash/i.test(m), color: '#D97706', badge: 'CASH' },
                      ].map(methodItem => {
                        const methodOrders = ordersList.filter(o => methodItem.match(o.payment_method || 'Cash'));
                        const rev = methodOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
                        const pctOfTotal = metrics.grossRevenue > 0 ? ((rev / metrics.grossRevenue) * 100).toFixed(1) : 0;
                        if (methodOrders.length === 0) return null;
                        const clr = methodItem.color;
                        return (
                          <tr key={methodItem.name}>
                            <td>
                              <span className="pay-pill" style={{ background: `${clr}15`, color: clr, border: `1px solid ${clr}30`, fontWeight: 700 }}>
                                {methodItem.name}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700 }}>{methodOrders.length}</td>
                            <td style={{ textAlign: 'right' }}><strong style={{ color: '#10B981' }}>${rev.toFixed(2)}</strong></td>
                            <td style={{ textAlign: 'right' }}>
                              <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700 }}>
                                {pctOfTotal}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Grand Total Row */}
                      <tr style={{ background: '#F0FDF4', borderTop: '2px solid #10B981' }}>
                        <td><strong style={{ color: '#059669' }}>🏦 Grand Total</strong></td>
                        <td style={{ textAlign: 'center' }}><strong style={{ color: '#059669' }}>{metrics.totalOrdersCount || ordersList.length}</strong></td>
                        <td style={{ textAlign: 'right' }}><strong style={{ fontSize: '1.05rem', color: '#059669' }}>${(metrics.grossRevenue || 0).toFixed(2)}</strong></td>
                        <td style={{ textAlign: 'right' }}><strong style={{ color: '#059669' }}>100%</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══════════ REVIEWS & RATINGS ══════════ */}
        {activePage === 'reviews' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div className="admin-page-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <Star size={22} fill="#D97706" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 className="admin-page-title">Customer Reviews &amp; Ratings</h1>
                <p className="admin-page-sub">Live customer feedback, food quality ratings, and guest experiences</p>
              </div>
              <button className="admin-refresh-btn" onClick={fetchReviews}>
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="analytics-grid" style={{ marginBottom: 24 }}>
              <div className="analytics-card" style={{ border: '1.5px solid #F59E0B', background: 'linear-gradient(135deg, #FFFBEB, #FFFFFF)' }}>
                <div className="analytics-card-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                  <Star size={24} fill="#D97706" />
                </div>
                <div>
                  <div className="analytics-value" style={{ color: '#D97706', fontSize: '1.8rem' }}>
                    {reviewsStats.avgRating} <span style={{ fontSize: '1.1rem', color: '#9CA3AF' }}>/ 5.0</span>
                  </div>
                  <div className="analytics-label">Overall Food Rating</div>
                  <div className="analytics-sub">Based on {reviewsStats.totalReviews || reviewsList.length} reviews</div>
                </div>
              </div>

              <div className="analytics-card" style={{ border: '1.5px solid #10B981', background: 'linear-gradient(135deg, #ECFDF5, #FFFFFF)' }}>
                <div className="analytics-card-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
                  <CheckCheck size={24} />
                </div>
                <div>
                  <div className="analytics-value" style={{ color: '#059669', fontSize: '1.8rem' }}>
                    {reviewsList.filter(r => r.rating >= 4).length}
                  </div>
                  <div className="analytics-label">Positive Reviews (4-5 ⭐)</div>
                  <div className="analytics-sub">
                    {reviewsList.length > 0 ? Math.round((reviewsList.filter(r => r.rating >= 4).length / reviewsList.length) * 100) : 100}% customer satisfaction
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="admin-section">
              <h2 className="admin-section-title" style={{ marginBottom: 16 }}>Recent Guest Ratings</h2>
              {reviewsList.length === 0 ? (
                <div className="admin-empty-state">
                  <Star size={36} style={{ color: '#D97706', margin: '0 auto 12px auto', display: 'block' }} />
                  <h3>No Reviews Yet</h3>
                  <p>When customers submit food ratings from the tracking screen, they will appear here live.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                  {reviewsList.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E293B' }}>
                            {rev.customer_name || 'Guest'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {rev.table_number ? `Miiska ${rev.table_number}` : 'Dine-In'} · {rev.product_name}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star
                              key={st}
                              size={14}
                              fill={st <= rev.rating ? '#F59E0B' : '#E2E8F0'}
                              color={st <= rev.rating ? '#F59E0B' : '#CBD5E1'}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.comment && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.4, background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px' }}>
                          "{rev.comment}"
                        </p>
                      )}

                      <div style={{ marginTop: 10, fontSize: '0.7rem', color: '#94A3B8', textAlign: 'right' }}>
                        {new Date(rev.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════ BRANCHES MANAGEMENT ══════════ */}
        {activePage === 'branches' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div className="admin-page-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <MapPin size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h1 className="admin-page-title">Restaurant Branches (Laamaha)</h1>
                <p className="admin-page-sub">Maamul laamaha iyo xarumaha ay maqaayaddu ku leedahay magaalada</p>
              </div>
              <button className="admin-primary-btn" onClick={() => setShowAddBranchModal(true)}>
                <Plus size={16} /> Ku dar Laan Cusub
              </button>
            </div>

            {/* Branches Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18, marginTop: 16 }}>
              {branches && branches.map((branch) => (
                <div
                  key={branch.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', height: 140, width: '100%' }}>
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
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '12px'
                    }}>
                      Furan
                    </div>
                  </div>

                  <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0', color: '#1E293B' }}>
                      {branch.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.82rem', color: '#64748B', marginBottom: 10 }}>
                      <MapPin size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{branch.address}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} color="#D97706" />
                        <span>{branch.opening_hours}</span>
                      </div>
                      {branch.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Phone size={14} color="#15803D" />
                          <span>{branch.phone}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
                      <a
                        href={branch.maps_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          fontSize: '0.78rem',
                          color: '#2563EB',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <ExternalLink size={13} /> Khariidada (Maps)
                      </a>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        style={{
                          background: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          borderRadius: '8px',
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Trash2 size={12} /> Tirtir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Branch Modal */}
            {showAddBranchModal && (
              <div className="modal-overlay" onClick={() => setShowAddBranchModal(false)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: 24, borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Ku dar Laan Cusub</h2>
                    <button onClick={() => setShowAddBranchModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Magaca Laanta *</label>
                      <input
                        type="text"
                        required
                        placeholder="Tusaale: Laanta Degmada Hodan"
                        value={newBranchForm.name}
                        onChange={(e) => setNewBranchForm({ ...newBranchForm, name: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Cinwaanka & Wadada *</label>
                      <input
                        type="text"
                        required
                        placeholder="Tusaale: Waddada Maka Al-Mukarama, Muqdisho"
                        value={newBranchForm.address}
                        onChange={(e) => setNewBranchForm({ ...newBranchForm, address: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Taleefanka</label>
                        <input
                          type="text"
                          placeholder="+252 61..."
                          value={newBranchForm.phone}
                          onChange={(e) => setNewBranchForm({ ...newBranchForm, phone: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Saacadaha Shaqada</label>
                        <input
                          type="text"
                          placeholder="08:00 AM - 11:30 PM"
                          value={newBranchForm.opening_hours}
                          onChange={(e) => setNewBranchForm({ ...newBranchForm, opening_hours: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Sawirka Laanta (URL)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newBranchForm.image_url}
                        onChange={(e) => setNewBranchForm({ ...newBranchForm, image_url: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Google Maps Link (ikhtiyaari)</label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={newBranchForm.maps_url}
                        onChange={(e) => setNewBranchForm({ ...newBranchForm, maps_url: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => setShowAddBranchModal(false)}
                        style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Ka Noqo
                      </button>
                      <button
                        type="submit"
                        disabled={branchSaving}
                        className="admin-primary-btn"
                        style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                      >
                        {branchSaving ? 'Fadlan sug...' : 'Kaydi Laanta'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ MENU ══════════ */}
        {activePage === 'menu' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div className="admin-page-icon" style={{ background: '#FFF7ED', color: '#EA580C' }}>
                <Utensils size={22} />
              </div>
              <div>
                <h1 className="admin-page-title">Menu Management</h1>
                <p className="admin-page-sub">Add, edit, and toggle dish availability</p>
              </div>
              <button className="admin-primary-btn" onClick={openAddModal}>
                <Plus size={16} /> Add Dish
              </button>
            </div>

            {/* Search */}
            <div className="admin-search-row">
              <Search size={16} style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search dishes..."
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
                className="admin-search-input"
              />
            </div>

            <div className="admin-section">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredProducts.map(prod => (
                  <div key={prod.id} className={`menu-row ${!prod.is_available ? 'unavailable' : ''}`}>
                    <img src={prod.image_url} alt={prod.name} className="menu-row-img" />
                    <div className="menu-row-info">
                      <div className="menu-row-name">{prod.name}</div>
                      <div className="menu-row-meta">
                        <span>{prod.category_name}</span>
                        <span style={{ color: '#D9531E', fontWeight: 700 }}>${prod.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="menu-row-actions">
                      <span className={`avail-badge ${prod.is_available ? 'avail' : 'soldout'}`}>
                        {prod.is_available ? 'Available' : 'Sold Out'}
                      </span>
                      <label className="switch">
                        <input type="checkbox" checked={prod.is_available} onChange={() => toggleDishAvailability(prod.id, prod.is_available)} />
                        <span className="slider"></span>
                      </label>
                      <button onClick={() => openEditModal(prod)} className="icon-action-btn edit"><Edit2 size={15} /></button>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="icon-action-btn delete"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ QR CODES ══════════ */}
        {activePage === 'qrcodes' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div className="admin-page-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                <QrCode size={22} />
              </div>
              <div>
                <h1 className="admin-page-title">QR Code Generator</h1>
                <p className="admin-page-sub">Generate and download table-specific QR codes</p>
              </div>
            </div>

            <div className="qr-layout">
              {/* Table List */}
              <div className="admin-section">
                <h2 className="admin-section-title" style={{ marginBottom: 14 }}>Restaurant Tables</h2>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <input
                    type="text"
                    placeholder="e.g. 05 or TB-05"
                    value={newTableNum}
                    onChange={e => setNewTableNum(e.target.value)}
                    className="admin-search-input"
                    style={{ flex: 1 }}
                  />
                  <button className="admin-primary-btn" onClick={handleAddTable}>Add Table</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tablesList.map(tbl => (
                    <div key={tbl.id} className={`table-row ${qrSelectedTable === tbl.table_number ? 'selected' : ''}`} onClick={() => setQrSelectedTable(tbl.table_number)}>
                      <span className="kds-table-badge">{tbl.table_number}</span>
                      <span style={{ fontSize: '0.85rem', color: '#6B7280', flex: 1 }}>Active</span>
                      <button className="admin-action-btn" style={{ marginRight: 4 }} onClick={e => { e.stopPropagation(); setQrSelectedTable(tbl.table_number); }}>Select QR</button>
                      <button className="icon-action-btn delete" onClick={e => { e.stopPropagation(); handleDeleteTable(tbl.id); }}><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Preview */}
              <div className="admin-section qr-preview-card">
                <span className="hero-tag" style={{ display: 'inline-block', marginBottom: 8 }}>QR Code Generator Tool</span>
                <h2 className="admin-section-title">Table {qrSelectedTable.replace('TB-', '')} QR Code</h2>
                {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="qr-preview-img" />}
                <div className="qr-url-label">
                  Scans directly to:<br />
                  <code>{window.location.origin}/?table={qrSelectedTable}</code>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                  <a href={qrDataUrl} download={`QR_Table_${qrSelectedTable}.png`} className="admin-primary-btn" style={{ textDecoration: 'none' }}>
                    <Download size={15} /> Download PNG
                  </a>
                  <a href={`/?table=${qrSelectedTable}`} target="_blank" rel="noreferrer" className="admin-secondary-btn" style={{ textDecoration: 'none' }}>
                    <ExternalLink size={15} /> Test Link
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SETTINGS ══════════ */}
        {activePage === 'settings' && (
          <div className="admin-page">
            <div className="admin-page-header">
              <div className="admin-page-icon" style={{ background: '#F8FAFC', color: 'var(--primary)' }}>
                <Settings size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h1 className="admin-page-title">Restaurant Profile & Settings</h1>
                <p className="admin-page-sub">Configure your business branding, logo, contact, and receipt details</p>
              </div>
              <button
                className="admin-primary-btn"
                onClick={() => setShowSettingsModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles size={16} />
                <span>Open Full Logo Customizer</span>
              </button>
            </div>

            {/* Live Branding Preview Card */}
            <div className="admin-section" style={{
              background: 'linear-gradient(135deg, rgba(230,81,0,0.06) 0%, #FFFFFF 100%)',
              border: '1.5px solid rgba(230,81,0,0.2)',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="hero-tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={12} /> Live Brand Preview
                </span>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Change Logo / Icon ➜
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <RestaurantLogo
                  branding={branding}
                  size={32}
                  containerSize={56}
                  showBorder={true}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1E293B', fontWeight: 800 }}>
                    {adminBrandingForm.restaurantName || 'Le Bistro'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                    {adminBrandingForm.tagline || 'Fine Dining & Fresh Taste'}
                  </p>
                  <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: '0.78rem', color: '#94A3B8' }}>
                    <span>📞 {adminBrandingForm.phone}</span>
                    <span>📍 {adminBrandingForm.address}</span>
                    <span>🌐 {adminBrandingForm.website}</span>
                  </div>
                </div>
              </div>
            </div>

            {adminSaveSuccess && (
              <div style={{
                background: '#DCFCE7',
                border: '1px solid #22C55E',
                color: '#15803D',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: 16,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Check size={18} />
                <span>Restaurant branding and settings updated successfully across the entire system!</span>
              </div>
            )}

            <form onSubmit={handleAdminSaveBranding} className="admin-section">
              <h2 className="admin-section-title" style={{ marginBottom: 16 }}>Business Details</h2>

              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: 700 }}>Restaurant / Business Name *</div>
                  <div style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Displayed in headers, menus, and thermal receipts</div>
                </div>
                <input
                  type="text"
                  required
                  value={adminBrandingForm.restaurantName}
                  onChange={(e) => setAdminBrandingForm({ ...adminBrandingForm, restaurantName: e.target.value })}
                  className="admin-search-input"
                  style={{ maxWidth: 300 }}
                  placeholder="e.g. Al-Baraka Restaurant"
                />
              </div>

              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: 700 }}>Restaurant Tagline / Slogan</div>
                  <div style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Subtitle shown on welcome page and menu</div>
                </div>
                <input
                  type="text"
                  value={adminBrandingForm.tagline}
                  onChange={(e) => setAdminBrandingForm({ ...adminBrandingForm, tagline: e.target.value })}
                  className="admin-search-input"
                  style={{ maxWidth: 300 }}
                  placeholder="e.g. Fine Dining & Fresh Taste"
                />
              </div>

              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: 700 }}>Official Phone Number</div>
                  <div style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Printed on customer order receipts</div>
                </div>
                <input
                  type="text"
                  value={adminBrandingForm.phone}
                  onChange={(e) => setAdminBrandingForm({ ...adminBrandingForm, phone: e.target.value })}
                  className="admin-search-input"
                  style={{ maxWidth: 300 }}
                  placeholder="+252 61 500 0000"
                />
              </div>

              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: 700 }}>Street Address & City</div>
                  <div style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Location address printed on receipts</div>
                </div>
                <input
                  type="text"
                  value={adminBrandingForm.address}
                  onChange={(e) => setAdminBrandingForm({ ...adminBrandingForm, address: e.target.value })}
                  className="admin-search-input"
                  style={{ maxWidth: 300 }}
                  placeholder="Maka Al-Mukarama Street, Mogadishu"
                />
              </div>

              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: 700 }}>Website / Receipt Footer Note</div>
                  <div style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Printed at bottom of thermal receipt</div>
                </div>
                <input
                  type="text"
                  value={adminBrandingForm.website}
                  onChange={(e) => setAdminBrandingForm({ ...adminBrandingForm, website: e.target.value })}
                  className="admin-search-input"
                  style={{ maxWidth: 300 }}
                  placeholder="www.lebistro-restaurant.com"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="submit"
                  disabled={adminSavingSettings}
                  className="admin-primary-btn"
                  style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {adminSavingSettings ? <RefreshCw size={16} className="spin-animate" /> : <Check size={16} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ─── ADD/EDIT PRODUCT MODAL ─── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingProduct ? 'Edit Dish' : 'Add New Dish'}</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close-btn"><X size={18} /></button>
            </div>
            <div className="admin-modal-body">
              {[
                { label: 'Dish Name', el: <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} placeholder="e.g. Crispy Calamari" className="admin-form-input" /> },
                { label: 'Category', el: <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className="admin-form-input">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select> },
                { label: 'Price ($)', el: <input type="number" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} placeholder="14.50" className="admin-form-input" /> },
                { label: 'Description', el: <textarea rows={2} value={prodDesc} onChange={e => setProdDesc(e.target.value)} placeholder="Food description..." className="admin-form-input" /> },
                { label: 'Image URL', el: <input type="text" value={prodImg} onChange={e => setProdImg(e.target.value)} placeholder="/images/smash_burger.jpg" className="admin-form-input" /> },
              ].map(({ label, el }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <label className="admin-form-label">{label}</label>
                  {el}
                </div>
              ))}
            </div>
            <div className="admin-modal-footer">
              <button onClick={() => setShowAddModal(false)} className="admin-secondary-btn">Cancel</button>
              <button className="admin-primary-btn" onClick={handleSaveProduct}>Save Dish</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SETTLE BILL MODAL ─── */}
      {settleOrder && (
        <div className="modal-overlay" onClick={() => setSettleOrder(null)}>
          <div className="admin-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Settle Bill — Table {settleOrder.table_number}</h3>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Order #{settleOrder.id} · Total: <strong style={{ color: '#059669', fontSize: '1rem' }}>${(settleOrder.total_amount || 0).toFixed(2)}</strong>
                </span>
              </div>
              <button onClick={() => setSettleOrder(null)} className="modal-close-btn"><X size={18} /></button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>
                Dooro qaabka lacagta lagu bixiyay (Select Payment Received):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { id: 'EVC Plus', label: 'EVC Plus', sub: 'Hormuud Mobile Money', color: '#059669', bg: '#D1FAE5' },
                  { id: 'ZAAD Service', label: 'ZAAD Service', sub: 'Telesom Mobile Money', color: '#2563EB', bg: '#DBEAFE' },
                  { id: 'Sahal Service', label: 'Sahal Service', sub: 'Golis Mobile Money', color: '#EA580C', bg: '#FFEDD5' },
                  { id: 'Credit / Debit Card', label: 'Credit / Debit Card', sub: 'Visa / Mastercard POS', color: '#7C3AED', bg: '#EDE9FE' },
                  { id: 'Cash', label: 'Cash at Counter / Table', sub: 'Paper currency', color: '#D97706', bg: '#FEF3C7' },
                ].map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setSettlingMethod(opt.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: settlingMethod === opt.id ? `2px solid ${opt.color}` : '1.5px solid #E5E7EB',
                      background: settlingMethod === opt.id ? opt.bg : '#FAFAFA',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{opt.sub}</div>
                    </div>
                    {settlingMethod === opt.id && <Check size={18} style={{ color: opt.color }} />}
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button onClick={() => setSettleOrder(null)} className="admin-secondary-btn">Cancel</button>
              <button
                className="admin-primary-btn"
                style={{ background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={async () => {
                  await updateOrderPaymentStatus(settleOrder.id, 'Paid', settlingMethod);
                  fetchOrders();
                  fetchMetrics();
                  setSettleOrder(null);
                }}
              >
                <Check size={16} /> Mark as Paid (${(settleOrder.total_amount || 0).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── THERMAL RECEIPT ─── */}
      {selectedPrintOrder && (
        <ThermalReceipt order={selectedPrintOrder} onClose={() => setSelectedPrintOrder(null)} />
      )}
    </div>
  );
};
