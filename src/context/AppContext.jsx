import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { translations } from './translations';

const AppContext = createContext();

const SOCKET_URL = window.location.origin.includes('5173')
  ? 'http://localhost:3001'
  : window.location.origin;

export const AppProvider = ({ children }) => {
  // Support direct role URL params ?role=kitchen or ?role=admin
  const [currentRole, setCurrentRole] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (['kitchen', 'admin', 'waiter', 'customer'].includes(roleParam)) {
      return roleParam;
    }
    return 'customer';
  });

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'kitchen') return 'kitchen';
    if (roleParam === 'admin') return 'admin';
    if (roleParam === 'waiter') return 'waiter';
    return 'menu';
  });
  
  // User Auth State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('qr_menu_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Admin Master Session State (Allows owner to switch between Admin, Kitchen, Waiter, and Customer freely)
  const [isAdminSession, setIsAdminSession] = useState(() => {
    try {
      const saved = localStorage.getItem('qr_menu_admin_session');
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'admin') return true;
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const setAdminAuth = (val) => {
    setIsAdminSession(val);
    if (val) {
      localStorage.setItem('qr_menu_admin_session', 'true');
    } else {
      localStorage.removeItem('qr_menu_admin_session');
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('qr_menu_user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          setAdminAuth(true);
        }
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('qr_menu_user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          setAdminAuth(true);
        }
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setAdminAuth(false);
    localStorage.removeItem('qr_menu_user');
  };

  // Language State
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('qr_menu_lang') || 'so';
  });

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'so' ? 'en' : 'so';
      localStorage.setItem('qr_menu_lang', next);
      return next;
    });
  };

  const t = (key) => {
    const langData = translations[language] || translations['so'];
    return langData[key] || translations['so'][key] || key;
  };

  // System Settings State
  const [settings, setSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem('qr_menu_settings');
      return saved ? JSON.parse(saved) : { audioChime: true, currency: 'USD', theme: 'dark' };
    } catch (e) {
      return { audioChime: true, currency: 'USD', theme: 'dark' };
    }
  });

  const updateSettings = (newSettings) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('qr_menu_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Restaurant Branding & Logo State
  const DEFAULT_BRANDING = {
    restaurantName: 'Le Bistro',
    tagline: 'Fine Dining & Fresh Taste',
    logoType: 'icon', // 'icon' or 'image'
    logoIcon: 'Utensils',
    logoUrl: '',
    phone: '+252 61 500 0000',
    address: 'Maka Al-Mukarama Street, Mogadishu',
    website: 'www.lebistro-restaurant.com',
  };

  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem('qr_menu_branding');
      return saved ? { ...DEFAULT_BRANDING, ...JSON.parse(saved) } : DEFAULT_BRANDING;
    } catch (e) {
      return DEFAULT_BRANDING;
    }
  });

  const updateBranding = async (newBranding) => {
    setBranding((prev) => {
      const updated = { ...prev, ...newBranding };
      localStorage.setItem('qr_menu_branding', JSON.stringify(updated));
      return updated;
    });

    try {
      const payload = {
        restaurant_name: newBranding.restaurantName,
        restaurant_tagline: newBranding.tagline,
        logo_type: newBranding.logoType,
        logo_icon: newBranding.logoIcon,
        logo_url: newBranding.logoUrl,
        phone: newBranding.phone,
        address: newBranding.address,
        website: newBranding.website,
      };
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to persist settings:', err);
      return { success: false, error: err.message };
    }
  };

  // Modals Visibility
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Table detection from URL (e.g. ?table=TB-01)
  const [selectedTable, setSelectedTable] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      return tableParam.toUpperCase().startsWith('TB-')
        ? tableParam.toUpperCase()
        : `TB-${tableParam.padStart(2, '0')}`;
    }
    return null; // Do NOT default to TB-07; null if not scanned
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [tablesList, setTablesList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Sync URL parameter if table changes
  const changeTable = (newTable) => {
    const formatted = newTable
      ? (newTable.toUpperCase().startsWith('TB-')
        ? newTable.toUpperCase()
        : `TB-${newTable.padStart(2, '0')}`)
      : null;
    setSelectedTable(formatted);
    const url = new URL(window.location);
    if (formatted) {
      url.searchParams.set('table', formatted);
    } else {
      url.searchParams.delete('table');
    }
    window.history.pushState({}, '', url);
  };

  // Connect Socket.io
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('new_order', (order) => {
      setOrdersList((prev) => [order, ...prev]);

      // Play audio alert for kitchen
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    });

    newSocket.on('new_waiter_call', (call) => {
      setWaiterCalls((prev) => [call, ...prev.filter(c => c.id !== call.id)]);
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    });

    newSocket.on('waiter_call_resolved', ({ id }) => {
      setWaiterCalls((prev) => prev.filter((c) => c.id !== id));
    });

    newSocket.on('order_updated', (updatedOrder) => {
      setOrdersList((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      // Update current customer tracking order if matching
      setCurrentOrder((prev) => (prev && prev.id === updatedOrder.id ? updatedOrder : prev));
    });

    newSocket.on('menu_updated', () => {
      fetchMenu();
    });

    newSocket.on('branches_updated', () => {
      fetchBranches();
    });

    newSocket.on('settings_updated', (data) => {
      if (data && data.restaurant_name) {
        const mapped = {
          restaurantName: data.restaurant_name,
          tagline: data.restaurant_tagline || '',
          logoType: data.logo_type || 'icon',
          logoIcon: data.logo_icon || 'Utensils',
          logoUrl: data.logo_url || '',
          phone: data.phone || '',
          address: data.address || '',
          website: data.website || '',
        };
        setBranding(mapped);
        localStorage.setItem('qr_menu_branding', JSON.stringify(mapped));
      }
    });

    return () => newSocket.disconnect();
  }, []);

  // Fetch Branding Settings from DB
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data && data.restaurant_name) {
        const mapped = {
          restaurantName: data.restaurant_name,
          tagline: data.restaurant_tagline || '',
          logoType: data.logo_type || 'icon',
          logoIcon: data.logo_icon || 'Utensils',
          logoUrl: data.logo_url || '',
          phone: data.phone || '',
          address: data.address || '',
          website: data.website || '',
        };
        setBranding(mapped);
        localStorage.setItem('qr_menu_branding', JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn('Could not load remote restaurant settings:', err);
    }
  };

  // Fetch Menu
  const fetchMenu = async () => {
    try {
      setLoadingMenu(true);
      const res = await fetch('/api/menu?all=true');
      const data = await res.json();
      setCategories(data.categories || []);
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrdersList(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  // Fetch Tables
  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      setTablesList(data || []);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    }
  };

  // Fetch Restaurant Branches
  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      const data = await res.json();
      setBranches(data || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  // Fetch Pending Waiter Calls
  const fetchWaiterCalls = async () => {
    try {
      const res = await fetch('/api/waiter-calls');
      const data = await res.json();
      setWaiterCalls(data || []);
    } catch (err) {
      console.error('Failed to fetch waiter calls:', err);
    }
  };

  // Customer Calls Waiter
  const callWaiter = async ({ tableNumber, reason }) => {
    try {
      const res = await fetch('/api/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: tableNumber || selectedTable,
          call_type: reason || 'Caawimaad Guud'
        })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Failed to call waiter:', err);
      return null;
    }
  };

  // Staff / Admin Marks Call Attended
  const attendWaiterCall = async (id) => {
    try {
      await fetch(`/api/waiter-calls/${id}/attend`, { method: 'PUT' });
      setWaiterCalls((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to attend call:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchMenu();
    fetchOrders();
    fetchTables();
    fetchBranches();
    fetchWaiterCalls();
  }, []);

  // Cart Operations
  const addToCart = (product, quantity = 1, selectedOptions = [], notes = '') => {
    let optionsPrice = 0;
    selectedOptions.forEach((opt) => {
      if (typeof opt === 'object' && opt.price) {
        optionsPrice += opt.price;
      }
    });

    const itemPrice = product.price + optionsPrice;
    const itemTotal = itemPrice * quantity;

    const newItem = {
      cartId: Date.now() + Math.random(),
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      selectedOptions,
      notes,
      item_total: itemTotal,
      image_url: product.image_url,
    };

    setCart((prev) => [...prev, newItem]);
  };

  const updateCartQuantity = (cartId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          let optionsPrice = 0;
          item.selectedOptions.forEach((opt) => {
            if (typeof opt === 'object' && opt.price) optionsPrice += opt.price;
          });
          const unitPrice = item.price + optionsPrice;
          return {
            ...item,
            quantity: newQty,
            item_total: unitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  // Submit Order
  const placeOrder = async (customerName = 'Guest', notes = '', paymentMethod = 'Cash', paymentStatus = 'Pending') => {
    if (cart.length === 0) return null;

    try {
      const payload = {
        table_number: selectedTable,
        customer_name: customerName,
        items: cart,
        notes,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const newOrder = await res.json();
      setCurrentOrder(newOrder);
      clearCart();
      setActiveTab('track');
      return newOrder;
    } catch (err) {
      console.error('Order submission failed:', err);
      return null;
    }
  };

  // Update Payment Status
  const updateOrderPaymentStatus = async (orderId, paymentStatus, paymentMethod) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: paymentStatus, payment_method: paymentMethod }),
      });
      const updated = await res.json();
      setCurrentOrder((prev) => (prev && prev.id === updated.id ? updated : prev));
      fetchOrders();
      return updated;
    } catch (err) {
      console.error('Failed to update payment status:', err);
    }
  };

  // Kitchen / Staff Update Order Status
  const updateOrderStatus = async (orderId, status, estPrepTime) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, est_prep_time: estPrepTime }),
      });
      const updated = await res.json();
      return updated;
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Admin toggle dish availability
  const toggleDishAvailability = async (productId, currentAvailable) => {
    try {
      await fetch(`/api/admin/products/${productId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !currentAvailable }),
      });
      fetchMenu();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  // Submit Review and Rating
  const submitReview = async ({ orderId, productId, productName, customerName, rating, comment }) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          product_id: productId,
          product_name: productName,
          table_number: selectedTable,
          customer_name: customerName,
          rating,
          comment
        })
      });
      const data = await res.json();
      fetchMenu();
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.item_total, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        settings,
        updateSettings,
        branding,
        updateBranding,
        showAuthModal,
        setShowAuthModal,
        showSettingsModal,
        setShowSettingsModal,
        language,
        toggleLanguage,
        t,
        isAdminSession,
        setAdminAuth,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        selectedTable,
        changeTable,
        categories,
        products,
        cart,
        cartCount,
        cartSubtotal,
        currentOrder,
        setCurrentOrder,
        ordersList,
        tablesList,
        loadingMenu,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        updateOrderPaymentStatus,
        updateOrderStatus,
        toggleDishAvailability,
        submitReview,
        branches,
        fetchBranches,
        waiterCalls,
        callWaiter,
        attendWaiterCall,
        fetchWaiterCalls,
        fetchMenu,
        fetchOrders,
        fetchTables,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
