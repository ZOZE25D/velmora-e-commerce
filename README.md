# Velmora - Premium E-Commerce Platform

Velmora is a sophisticated, full-stack e-commerce application designed for the modern fashion industry. It focuses on elegance, sustainability, and a seamless user experience across all devices.

## 🚀 Project Overview

Velmora provides a complete ecosystem for online retail, supporting multiple user roles including Customers, Suppliers, and Administrators. The platform features a high-end aesthetic with smooth animations and multi-language support.

---

## 🛠 Technology Stack

### Frontend

- **React 19**: The latest version of React for building a dynamic and responsive UI.
- **Vite**: A lightning-fast build tool and development server.
- **Tailwind CSS 4**: Utility-first CSS framework for modern, responsive styling.
- **Framer Motion**: Used for high-quality, smooth animations and transitions.
- **Lucide React**: A beautiful and consistent icon library.
- **i18next**: Comprehensive internationalization support (English & Arabic).
- **React Router 7**: Advanced routing for a single-page application experience.

### Backend

- **Node.js & Express**: Robust server-side environment and framework.
- **Vite Middleware**: Integrated development environment for full-stack capabilities.
- **Nodemailer**: For sending transactional emails and OTP verifications.

### Database & Storage

- **Firebase Firestore**: Scalable NoSQL cloud database for products, orders, and user data.
- **SQLite (better-sqlite3)**: Local database used for secure, temporary OTP (One-Time Password) storage.
- **Firebase Auth**: Secure user authentication and management.

---

## ✨ Key Features

- **Responsive Design**: Mobile-first approach ensuring a perfect look on all screens.
- **Multi-language Support**: Full RTL (Right-to-Left) support for Arabic and standard LTR for English.
- **Dark & Light Mode**: Seamless theme switching with persistent user preference.
- **User Roles**:
  - **Customer**: Browse products, manage favorites, place and track orders.
  - **Supplier**: Dedicated dashboard to manage products and view sales.
  - **Admin**: Comprehensive control over the entire platform (Users, Products, Orders, Notifications).
- **Secure Authentication**: OTP-based login system for enhanced security.
- **Advanced Checkout**: Multi-step checkout process with support for Visa, InstaPay, and Cash on Delivery (COD).
- **Order Tracking**: Real-time tracking of order status from pending to delivered.
- **Product Management**: Dynamic filtering, sorting, and detailed product views.

---

## 🎨 Design System

### Color Palette

The brand uses a sophisticated "Earth & Ink" palette:

| Name            | Hex Code  | Usage                          |
| :-------------- | :-------- | :----------------------------- |
| **Velmora 900** | `#1a1a1a` | Primary Text / Dark Accents    |
| **Velmora 500** | `#a39478` | Secondary Accents / Muted Text |
| **Velmora 50**  | `#f9f8f6` | Light Backgrounds              |
| **Zinc 950**    | `#09090b` | Dark Mode Background           |
| **Success**     | `#22c55e` | Confirmation / Success states  |

### Typography

- **Display Font**: `Playfair Display` (Serif) - Used for headings and elegant accents.
- **Body Font**: `Inter` (Sans-serif) - Used for maximum legibility and modern feel.

---

## 📁 Project Structure

```text
├── src/
│   ├── components/     # Reusable UI components (Layout, UI, Admin)
│   ├── context/        # Global state management (AppContext)
│   ├── data/           # Static data and constants
│   ├── pages/          # Main application views and dashboards
│   ├── services/       # API and Firebase service logic
│   ├── lib/            # Utility functions and shared logic
│   ├── i18n.ts         # Internationalization configuration
│   └── App.tsx         # Main routing and application entry
├── server.ts           # Express server with Vite middleware
├── firestore.rules     # Firebase security rules
└── firebase-blueprint.json # Data structure definitions
```

---

## 🛠 Installation & Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example` and add your Firebase and SMTP credentials.
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 DEVELOPED BY

ZIAD AYMAN

MAIL: ziadr276@gmail.com
whatsapp: +201010285835

---

## 📄 License

© 2026 VELMORA. ALL RIGHTS RESERVED.
