import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Clock, Star, Plus, Minus, MessageSquare } from 'lucide-react';

export const DishDetailModal = ({ product, onClose, onAddToCart }) => {
  const { t, submitReview, selectedTable } = useApp();
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedDoneness, setSelectedDoneness] = useState(
    product.doneness_options && product.doneness_options.length > 0
      ? product.doneness_options[0]
      : ''
  );
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [notes, setNotes] = useState('');

  // In-modal Review & Rating State
  const [showRatingBox, setShowRatingBox] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);

  const loadReviews = async () => {
    if (!product?.id) return;
    try {
      const res = await fetch(`/api/reviews?product_id=${product.id}`);
      const data = await res.json();
      if (data && data.reviews) {
        setReviewsList(data.reviews);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [product?.id]);

  const handleSendRating = async () => {
    if (!userRating) return;
    setSubmittingRating(true);
    try {
      await submitReview({
        productId: product.id,
        productName: product.name,
        customerName: reviewerName.trim() || `Guest (${selectedTable || 'Table'})`,
        rating: userRating,
        comment: userComment
      });
      setHasRated(true);
      await loadReviews();
      setTimeout(() => setShowRatingBox(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
  const unitPrice = product.price + addonsTotal;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const handleAdd = () => {
    const options = [];
    if (selectedDoneness) {
      options.push({ type: 'Doneness', name: selectedDoneness, price: 0 });
    }
    selectedAddons.forEach((a) => {
      options.push({ type: 'Addon', name: a.name, price: a.price });
    });

    onAddToCart(product, quantity, options, notes);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-img">
          <img src={product.image_url} alt={product.name} />
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 4 }}>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <button
                  onClick={() => setShowRatingBox(!showRatingBox)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    color: '#B45309',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    padding: '3px 10px',
                    borderRadius: '14px',
                    fontSize: '0.8rem'
                  }}
                  title="Guji si aad u qiimeyso"
                >
                  <Star size={13} fill="#D97706" color="#D97706" /> {product.rating ? Number(product.rating).toFixed(1) : '4.8'} ({product.rating_count || 15}) • <span style={{ textDecoration: 'underline' }}>Qiimee ⭐</span>
                </button>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} /> 12-15 {t('minutes')}
                </span>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${product.price.toFixed(2)}
            </div>
          </div>

          {/* Expandable Dish Rating & Review Box */}
          {showRatingBox && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginTop: 12,
              marginBottom: 6,
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400E' }}>
                  ⭐ Qiimee Cuntadan ({product.name})
                </span>
                <button 
                  onClick={() => setShowRatingBox(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#B45309', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              {hasRated ? (
                <div style={{ color: '#15803D', fontWeight: 700, fontSize: '0.85rem', padding: '8px 0', textAlign: 'center' }}>
                  ✓ Waad ku mahadsantahay qiimeyntaada macaan! ⭐
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2,
                          transform: userRating >= star ? 'scale(1.15)' : 'scale(1)',
                          transition: 'transform 0.15s'
                        }}
                      >
                        <Star
                          size={22}
                          color={userRating >= star ? '#F59E0B' : '#D1D5DB'}
                          fill={userRating >= star ? '#F59E0B' : 'transparent'}
                        />
                      </button>
                    ))}
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400E', marginLeft: 4 }}>
                      {userRating === 5 ? 'Aad u Sareysa (5/5)' : `${userRating}/5`}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Magacaaga (ikhtiyaari)..."
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #FCD34D',
                      fontSize: '0.8rem',
                      marginBottom: 6,
                      boxSizing: 'border-box'
                    }}
                  />

                  <textarea
                    rows={2}
                    placeholder="Aragtidaada ama faalladaada ku saabsan cuntadan..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #FCD34D',
                      fontSize: '0.8rem',
                      marginBottom: 8,
                      boxSizing: 'border-box'
                    }}
                  />

                  <button
                    onClick={handleSendRating}
                    disabled={submittingRating}
                    style={{
                      width: '100%',
                      background: 'var(--primary)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    {submittingRating ? 'Fadlan sug...' : 'Dir Qiimeynta Cuntada ⭐'}
                  </button>
                </>
              )}
            </div>
          )}

          <p style={{ marginTop: 10, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {product.description}
          </p>

          {/* Patty Doneness Options */}
          {product.doneness_options && product.doneness_options.length > 0 && (
            <div className="option-group">
              <div className="option-title">{t('options')}</div>
              {product.doneness_options.map((opt) => (
                <div
                  key={opt}
                  className={`option-pill ${selectedDoneness === opt ? 'selected' : ''}`}
                  onClick={() => setSelectedDoneness(opt)}
                >
                  <span style={{ fontWeight: 600 }}>{opt}</span>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedDoneness === opt && (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add-ons Options */}
          {product.addon_options && product.addon_options.length > 0 && (
            <div className="option-group">
              <div className="option-title">{t('additions')}</div>
              {product.addon_options.map((addon) => {
                const isChecked = selectedAddons.some((a) => a.name === addon.name);
                return (
                  <div
                    key={addon.name}
                    className={`option-pill ${isChecked ? 'selected' : ''}`}
                    onClick={() => toggleAddon(addon)}
                  >
                    <span style={{ fontWeight: 600 }}>{addon.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      +${addon.price.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Kitchen Notes */}
          <div className="option-group">
            <div className="option-title">{t('specialNotes')}</div>
            <textarea
              rows={2}
              placeholder={t('specialNotesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Customer Reviews Section */}
          <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                <span>Faallooyinka Macaamiisha ({reviewsList.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRatingBox(!showRatingBox)}
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                {showRatingBox ? 'Xir' : '⭐ Qor Qiimeyn'}
              </button>
            </div>

            {reviewsList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {reviewsList.map((rev) => (
                  <div key={rev.id} style={{
                    background: 'var(--bg-cream)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{rev.customer_name || 'Guest'}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            fill={s <= rev.rating ? '#F59E0B' : '#E5E7EB'}
                            color={s <= rev.rating ? '#F59E0B' : '#E5E7EB'}
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.3 }}>"{rev.comment}"</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0', background: 'var(--bg-cream)', borderRadius: '8px' }}>
                Weli cuntadan faallo lagama bixin. Noqo qofka ugu horreeya ee qiimeeya! ⭐
              </div>
            )}
          </div>

          {/* Quantity Controls & Add to Cart Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }}>
            <div className="stepper">
              <button className="stepper-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus size={16} />
              </button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: 20, textAlign: 'center' }}>
                {quantity}
              </span>
              <button className="stepper-btn" onClick={() => setQuantity(quantity + 1)}>
                <Plus size={16} />
              </button>
            </div>

            <button className="btn-primary-lg" style={{ flex: 1, padding: '14px' }} onClick={handleAdd}>
              <span>{t('addToCart')}</span>
              <span>•</span>
              <span>${totalPrice}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
