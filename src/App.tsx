/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShopProvider } from './ShopContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import Footer from './components/Footer';
import LoadingBar from './components/LoadingBar';
import PopupAdOverlay from './components/PopupAdOverlay';
import ScrollToTop from './components/ScrollToTop';
import CartSidebar from './components/CartSidebar';
import CompareButton from './components/CompareButton';
import AnnouncementBar from './components/AnnouncementBar';
import PageLoader from './components/PageLoader';

import FloatingButtons from './components/FloatingButtons';
import { useShop } from './ShopContext';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Contact = lazy(() => import('./pages/Contact'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const AdminDashboard = lazy(() => import('./pages/Admin'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Policies = lazy(() => import('./pages/Policies'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white transition-colors duration-300">
      <header className="sticky top-0 z-[100]">
        <AnnouncementBar />
        <Navbar />
      </header>
      <Breadcrumbs />
      <CartSidebar />
      <CompareButton />
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.18, ease: "easeOut" }}
    className="flex-1 flex flex-col min-h-0"
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const { isMaintenanceMode } = useShop();

  if (isMaintenanceMode && !location.pathname.startsWith('/admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-4 text-black">Under Maintenance</h1>
        <p className="text-gray-500 font-medium max-w-md mx-auto">
          We are currently updating our website to serve you better. Please check back soon!
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex-1 bg-white" />}>
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<PageTransition><Home /></PageTransition>} />
            <Route path="shop" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="product/:id" element={<PageTransition><ProductDetails /></PageTransition>} />
            <Route path="checkout" element={<PageTransition><Checkout /></PageTransition>} />
            <Route path="contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="track-order" element={<PageTransition><TrackOrder /></PageTransition>} />
            <Route path="faq" element={<PageTransition><FAQ /></PageTransition>} />
            <Route path="policies" element={<PageTransition><Policies /></PageTransition>} />
            <Route path="shipping-policy" element={<PageTransition><ShippingPolicy /></PageTransition>} />
            <Route path="privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
            <Route path="wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Route>
          <Route path="/admin" element={<PageTransition><div className="flex flex-col min-h-screen bg-white transition-colors duration-300"><header className="sticky top-0 z-[100]"><AnnouncementBar /><Navbar /></header><Breadcrumbs /><div className="flex-1 flex min-h-0"><AdminDashboard /></div></div></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ShopProvider>
          <LoadingBar />
          <ScrollToTop />
          <PageLoader />
          <PopupAdOverlay />
          <AnimatedRoutes />
        </ShopProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

