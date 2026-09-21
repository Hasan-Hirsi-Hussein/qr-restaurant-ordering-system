import React, { useState } from 'react';
import {
  Utensils,
  ChefHat,
  Coffee,
  Pizza,
  Flame,
  CupSoda,
  Crown,
  Soup,
  Sandwich,
  Store
} from 'lucide-react';

export const ICON_OPTIONS = [
  { id: 'Utensils', label: 'Bistro & Dining', icon: Utensils },
  { id: 'ChefHat', label: 'Chef & Gourmet', icon: ChefHat },
  { id: 'Flame', label: 'Grill & BBQ', icon: Flame },
  { id: 'Coffee', label: 'Cafe & Coffee', icon: Coffee },
  { id: 'Pizza', label: 'Pizzeria', icon: Pizza },
  { id: 'Sandwich', label: 'Burgers & Fast Food', icon: Sandwich },
  { id: 'CupSoda', label: 'Juice & Drinks', icon: CupSoda },
  { id: 'Soup', label: 'Traditional & Soups', icon: Soup },
  { id: 'Crown', label: 'Luxury & VIP', icon: Crown },
  { id: 'Store', label: 'Restaurant Store', icon: Store },
];

export const getIconComponent = (iconId) => {
  const match = ICON_OPTIONS.find((item) => item.id === iconId);
  return match ? match.icon : Utensils;
};

export const RestaurantLogo = ({
  branding = {},
  size = 24,
  containerSize = null,
  showBorder = false,
  className = '',
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);
  
  const logoType = branding.logoType || branding.logo_type || 'icon';
  const logoUrl = branding.logoUrl || branding.logo_url || '';
  const logoIcon = branding.logoIcon || branding.logo_icon || 'Utensils';

  const IconComp = getIconComponent(logoIcon);

  // If custom image logo is selected and URL is available and didn't error
  if (logoType === 'image' && logoUrl && !imageError) {
    const boxDim = containerSize || (size + 14);
    return (
      <div
        className={`restaurant-logo-image-wrap ${className}`}
        style={{
          width: boxDim,
          height: boxDim,
          minWidth: boxDim,
          minHeight: boxDim,
          borderRadius: 'var(--radius-md, 10px)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.08)',
          border: showBorder ? '1.5px solid var(--primary, #E65100)' : '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          ...style
        }}
      >
        <img
          src={logoUrl}
          alt={branding.restaurantName || 'Restaurant Logo'}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    );
  }

  // Fallback / Default: Dynamic SVG Icon with rich badge styling
  const boxDim = containerSize || (size + 12);
  return (
    <div
      className={`restaurant-logo-icon-wrap ${className}`}
      style={{
        width: boxDim,
        height: boxDim,
        minWidth: boxDim,
        minHeight: boxDim,
        borderRadius: 'var(--radius-md, 10px)',
        background: 'linear-gradient(135deg, rgba(230,81,0,0.2) 0%, rgba(255,140,0,0.1) 100%)',
        border: showBorder ? '1.5px solid var(--primary, #E65100)' : '1px solid rgba(230,81,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary, #E65100)',
        boxShadow: '0 2px 6px rgba(230,81,0,0.15)',
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      <IconComp size={size} style={{ color: 'var(--primary, #E65100)' }} />
    </div>
  );
};
