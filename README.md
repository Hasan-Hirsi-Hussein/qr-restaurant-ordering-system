# 🍽️ QR Restaurant Ordering & Management System

A full-stack, real-time digital ordering, kitchen display (KDS), waiter service, and admin management system tailored for restaurants, cafes, and hospitality businesses.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Express](https://img.shields.io/badge/Node.js-Express-green)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-orange)
![SQLite](https://img.shields.io/badge/SQLite-Database-lightblue)

---

## ✨ Features

### 📱 Customer Mobile Experience (Scan & Order)
* **Table QR Scanning:** Scan table QR code to start ordering directly from the browser without installing any app.
* **Interactive Digital Menu:** Browse categories, search dishes, filter items, and customize meals with notes.
* **Smart Cart & Checkout:** Real-time subtotal, tax calculation, and special requests to the kitchen.
* **Multiple Payment Options:** Support for local mobile money (**EVC Plus, ZAAD, Sahal**), Credit Card, and Cash at table.
* **Live Order Tracking:** Real-time visual timeline showing order lifecycle (*Received ➜ Preparing ➜ Ready ➜ Delivered*).
* **Call Waiter Assistance:** One-tap waiter calling feature directly from the table.

### 🍳 Kitchen Display System (KDS)
* Real-time WebSocket ticket updates without refreshing the page.
* Color-coded status badges (*New, In Prep, Ready*).
* Kitchen order tickets with timer and kitchen receipt printing.

### 🛎️ Waiter Floor Service
* Live alerts for tables calling for assistance.
* Ready food delivery dispatch queue.

### 🛡️ Admin Management & POS
* **Billing Desk / POS:** Settle orders, collect payments, and print thermal 80mm/58mm POS receipts.
* **Menu Management:** Add, edit, remove dishes, update pricing, and toggle out-of-stock availability.
* **QR Codes Generator:** Generate, download, and print table QR codes.
* **Daily Analytics & Revenue:** Real-time gross revenue, order volume, and top-selling items.
* **Security & Access Control:** Strict role isolation:
  * Customer has zero access to internal dashboards.
  * Kitchen & Waiters protected by Staff PIN (`1234`).
  * Admin / Owner protected by Admin PIN (`9999`) or master login.

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Hasan-Hirsi-Hussein/qr-restaurant-ordering-system.git
cd qr-restaurant-ordering-system
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development servers (Client + Backend):**
```bash
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 🔑 Access Roles & PINs

| Role | Access URL / Entry | Default PIN |
|---|---|---|
| **Customer** | `http://localhost:5173/?table=TB-01` | No PIN (Direct Menu) |
| **Kitchen (KDS)** | Staff Portal ➜ Jikada | **`1234`** |
| **Waiter Desk** | Staff Portal ➜ Waiter | **`1234`** |
| **Admin / Owner** | Staff Portal ➜ Maamulka | **`9999`** |

---

## 🛠️ Tech Stack
* **Frontend:** React, Lucide Icons, Vanilla CSS, Vite
* **Backend:** Node.js, Express.js, Socket.io
* **Database:** SQLite3
* **Printing:** Thermal POS Receipt generator

---

## 👤 Author
Developed by **[Hasan-Hirsi-Hussein](https://github.com/Hasan-Hirsi-Hussein)**
