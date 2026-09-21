import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { RoleHeader } from './components/Navigation/RoleHeader';
import { BottomNavbar } from './components/Navigation/BottomNavbar';
import { WelcomeScreen } from './components/Customer/WelcomeScreen';
import { MenuScreen } from './components/Customer/MenuScreen';
import { CartScreen } from './components/Customer/CartScreen';
import { OrderConfirmationScreen } from './components/Customer/OrderConfirmationScreen';
import { OrderTrackingScreen } from './components/Customer/OrderTrackingScreen';
import { KitchenDashboard } from './components/Kitchen/KitchenDashboard';
import { WaiterDashboard } from './components/Waiter/WaiterDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';

export const MainApp = () => {
  const { currentRole, activeTab, setActiveTab } = useApp();
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStartOrdering = () => {
    setShowWelcome(false);
    setActiveTab('menu');
  };

  const handleOrderPlaced = (newOrder) => {
    setPlacedOrder(newOrder);
    setActiveTab('confirmation');
  };

  return (
    <div className="app-layout">
      {/* Top Bar Role & Table Switcher */}
      <RoleHeader />

      {/* Main View Area */}
      <main className={`view-container ${currentRole !== 'customer' ? 'wide' : ''}`}>
        {currentRole === 'customer' && (
          <>
            {showWelcome && activeTab === 'menu' ? (
              <WelcomeScreen onStartOrdering={handleStartOrdering} />
            ) : activeTab === 'menu' ? (
              <MenuScreen onGoToCart={() => setActiveTab('cart')} />
            ) : activeTab === 'cart' ? (
              <CartScreen onOrderPlaced={handleOrderPlaced} />
            ) : activeTab === 'confirmation' ? (
              <OrderConfirmationScreen
                order={placedOrder}
                onTrackLive={() => setActiveTab('track')}
                onOrderMore={() => setActiveTab('menu')}
              />
            ) : (
              <OrderTrackingScreen onOrderMore={() => setActiveTab('menu')} />
            )}
          </>
        )}

        {currentRole === 'kitchen' && <KitchenDashboard />}

        {currentRole === 'waiter' && <WaiterDashboard />}

        {currentRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Mobile Bottom Bar in Customer Mode */}
      {currentRole === 'customer' && <BottomNavbar />}
    </div>
  );
};
