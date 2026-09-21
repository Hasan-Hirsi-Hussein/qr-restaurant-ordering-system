import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, QrCode, ArrowRight, Star, MapPin, Bell } from 'lucide-react';
import { DishDetailModal } from './DishDetailModal';
import { BranchesModal } from './BranchesModal';
import { CallWaiterModal } from './CallWaiterModal';
import { RestaurantLogo } from '../Common/RestaurantLogo';

export const MenuScreen = ({ onGoToCart }) => {
  const { categories, products, selectedTable, cartCount, cartSubtotal, addToCart, branding, branches, t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [showBranches, setShowBranches] = useState(false);
  const [showWaiterModal, setShowWaiterModal] = useState(false);

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      selectedCategory === 'Popular' ||
      p.category_name === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '16px 20px 0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RestaurantLogo branding={branding} size={20} containerSize={36} />
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>{branding?.restaurantName || 'Le Bistro'}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {branding?.tagline || 'Digital Menu'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowWaiterModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: '#FFF7ED',
                border: '1px solid #FDBA74',
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#EA580C',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(234, 88, 12, 0.1)'
              }}
              title="Wac Kabeeleyga"
            >
              <Bell size={13} color="#EA580C" />
              <span>Wac Kabeeleyga 🛎️</span>
            </button>

            <button
              onClick={() => setShowBranches(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Fiiri Laamaha Maqaayadda"
            >
              <MapPin size={12} color="var(--primary)" />
              <span>Laamaha ({branches.length})</span>
            </button>
            {selectedTable && (
              <div className="table-pill-badge" style={{ margin: 0, padding: '5px 10px', fontSize: '0.78rem' }}>
                <QrCode size={13} />
                <span>{t('table')} {selectedTable.replace('TB-', '')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: 14,
        }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {/* Category Pills Scroller */}
      <div className="category-scroller">
        <button
          className={`cat-chip ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          {t('allCategories')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-chip ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Cards List */}
      <div style={{ marginTop: 14 }}>
        <div style={{ padding: '0 20px 8px 20px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          {selectedCategory === 'All' ? "Chef's Selection" : selectedCategory} ({filteredProducts.length})
        </div>

        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="product-card"
            onClick={() => prod.is_available && setActiveModalProduct(prod)}
            style={{ opacity: prod.is_available ? 1 : 0.6 }}
          >
            <img src={prod.image_url} alt={prod.name} className="product-img" />
            <div className="product-info">
              <div>
                <h3 className="product-title">{prod.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    padding: '1px 6px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#92400E'
                  }}>
                    <Star size={11} fill="#D97706" color="#D97706" />
                    <span>{prod.rating ? Number(prod.rating).toFixed(1) : '4.8'}</span>
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                    ({prod.rating_count || 12} reviews)
                  </span>
                </div>
                <p className="product-desc">{prod.description}</p>
              </div>
              <div className="product-footer">
                <span className="product-price">${prod.price.toFixed(2)}</span>
                {prod.is_available ? (
                  <button
                    className="btn-add-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalProduct(prod);
                    }}
                  >
                    <Plus size={14} />
                    <span>{t('addToCart')}</span>
                  </button>
                ) : (
                  <span className="sold-out-badge">{t('soldOut')}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Branches Banner */}
      <div
        onClick={() => setShowBranches(true)}
        style={{
          margin: '24px 20px 85px 20px',
          padding: '16px 18px',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '18px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 10px 20px -5px rgba(15, 23, 42, 0.25)',
          transition: 'transform 0.15s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={24} color="#38BDF8" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', letterSpacing: '-0.01em' }}>
              Laamaha Maqaayadda ({branches.length})
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>
              Maka Al-Mukarama • KM4 • Liido Beach • Aden Adde
            </div>
          </div>
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '6px 12px',
          borderRadius: '20px',
          color: '#F8FAFC'
        }}>
          Fiiri ➔
        </span>
      </div>

      {/* Sticky Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="sticky-cart-bar" onClick={onGoToCart} style={{ cursor: 'pointer' }}>
          <div className="cart-bar-left">
            <div className="cart-count-badge">{cartCount}</div>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('viewCart')}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>${cartSubtotal.toFixed(2)}</div>
            </div>
          </div>
          <button className="btn-view-cart">
            <span>{t('viewCart')}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Dish Detail Customization Modal */}
      {activeModalProduct && (
        <DishDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Restaurant Branches Modal */}
      <BranchesModal
        isOpen={showBranches}
        onClose={() => setShowBranches(false)}
      />

      {/* Call Waiter Modal */}
      <CallWaiterModal
        isOpen={showWaiterModal}
        onClose={() => setShowWaiterModal(false)}
      />

      {/* Floating Call Waiter Button */}
      <button
        onClick={() => setShowWaiterModal(true)}
        style={{
          position: 'fixed',
          bottom: cartCount > 0 ? 80 : 20,
          right: 18,
          zIndex: 900,
          background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '30px',
          padding: '10px 16px',
          fontSize: '0.82rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 8px 20px rgba(234, 88, 12, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Bell size={16} />
        <span>Wac Kabeeleyga</span>
      </button>
    </div>
  );
};
