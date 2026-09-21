import React from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantLogo } from './RestaurantLogo';

export const ThermalReceipt = ({ order, isKitchenTicket = false, onClose }) => {
  const { branding } = useApp();
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="thermal-receipt-backdrop">
      <div className="receipt-modal-card">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print receipt-actions-bar">
          <span>{isKitchenTicket ? 'Kitchen Ticket Preview' : 'Thermal Receipt Preview'}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary" onClick={handlePrint} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              🖨️ Print Now
            </button>
            <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              Close
            </button>
          </div>
        </div>

        {/* 80mm Printable Receipt Paper Area */}
        <div className="printable-receipt-area">
          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <RestaurantLogo branding={branding} size={16} containerSize={24} />
              <strong>{branding?.restaurantName ? branding.restaurantName.toUpperCase() : 'LE BISTRO RESTAURANT'}</strong>
            </div>
            {branding?.address && <p className="receipt-sub">{branding.address}</p>}
            {branding?.phone && <p className="receipt-sub">Tel: {branding.phone}</p>}
            <div className="receipt-divider-dashed"></div>
            <h4 className="receipt-type-title">
              {isKitchenTicket ? '*** KITCHEN ORDER TICKET ***' : '*** OFFICIAL RECEIPT ***'}
            </h4>
          </div>

          {/* Meta Info */}
          <div className="receipt-meta">
            <div className="receipt-meta-row">
              <span>Order #:</span>
              <strong>{order.order_number}</strong>
            </div>
            <div className="receipt-meta-row">
              <span>Table #:</span>
              <strong>{order.table_number}</strong>
            </div>
            <div className="receipt-meta-row">
              <span>Customer:</span>
              <span>{order.customer_name || 'Guest'}</span>
            </div>
            <div className="receipt-meta-row">
              <span>Date/Time:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="receipt-meta-row">
              <span>Payment:</span>
              <strong>{order.payment_method || 'Cash'} ({order.payment_status || 'Pending'})</strong>
            </div>
          </div>

          <div className="receipt-divider-dashed"></div>

          {/* Order Items Table */}
          <table className="receipt-items-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>QTY & ITEM</th>
                {!isKitchenTicket && <th style={{ textAlign: 'right' }}>PRICE</th>}
              </tr>
            </thead>
            <tbody>
              {order.items &&
                order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left' }}>
                      <div className="item-name-qty">
                        <strong>{item.quantity}x</strong> {item.product_name}
                      </div>
                      {item.options && item.options.length > 0 && (
                        <div className="item-options-text">
                          {item.options.map((opt) => (typeof opt === 'object' ? opt.name : opt)).join(', ')}
                        </div>
                      )}
                      {item.notes && <div className="item-notes-text">Note: {item.notes}</div>}
                    </td>
                    {!isKitchenTicket && (
                      <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                        ${item.item_total ? item.item_total.toFixed(2) : (item.price * item.quantity).toFixed(2)}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="receipt-divider-dashed"></div>

          {/* Pricing Totals (Customer Receipt only) */}
          {!isKitchenTicket && (
            <div className="receipt-totals">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>${order.subtotal ? order.subtotal.toFixed(2) : '0.00'}</span>
              </div>
              <div className="totals-row">
                <span>Tax (8%):</span>
                <span>${order.tax ? order.tax.toFixed(2) : '0.00'}</span>
              </div>
              <div className="receipt-divider-solid"></div>
              <div className="totals-row grand-total">
                <strong>GRAND TOTAL:</strong>
                <strong>${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</strong>
              </div>
            </div>
          )}

          {/* Special Kitchen Notes */}
          {order.notes && (
            <div className="receipt-kitchen-notes">
              <strong>SPECIAL INSTRUCTIONS:</strong>
              <p>{order.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="receipt-footer">
            <div className="receipt-divider-dashed"></div>
            <p className="footer-thanks">
              {isKitchenTicket ? '=== FAST KITCHEN DISPATCH ===' : 'Mahadsanid! Thank you for dining with us!'}
            </p>
            <p className="footer-website">{branding?.website || 'www.lebistro-restaurant.com'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
