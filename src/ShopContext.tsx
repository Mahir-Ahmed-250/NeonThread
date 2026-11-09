import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Product, Order, Category, Coupon, CartItem, CustomerInfo, Slide, CategoryBanner, LookbookImage, Subscriber, ContactMessage, PopupAd, HomeAd, AdminUser, OTPRecord, Review, ContactInfo, Announcement, FAQItem, PolicyItem, SocialLink } from './types';
import { generateId } from './lib/utils';
import { apiUrl } from './lib/api';

interface ShopContextType {
  isDbLoaded: boolean;
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  cart: CartItem[];
  slides: Slide[];
  categoryBanners: CategoryBanner[];
  lookbook: LookbookImage[];
  subscribers: Subscriber[];
  contactMessages: ContactMessage[];
  popupAds: PopupAd[];
  homeAds: HomeAd[];
  faqs: FAQItem[];
  policies: PolicyItem[];
  categories: Category[];
  contactInfo: ContactInfo;
  isAdminAuth: boolean;
  authToken: string | null;
  currentAdmin: AdminUser | null;
  admins: AdminUser[];
  getProductPriceForSize: (product: Product, size: string) => number;
  getProductStockForSize: (product: Product, size: string, image?: string) => number;
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string, image?: string) => void;
  removeFromCartById: (cartItemId: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string, image?: string) => void;
  updateCartQuantityById: (cartItemId: string, quantity: number) => void;
  updateCartItemSize: (productId: string, oldSize: string, newSize: string, image?: string) => void;
  updateCartItemSizeById: (cartItemId: string, newSize: string) => void;
  clearCart: () => void;
  placeOrder: (customer: CustomerInfo, couponCode?: string) => { success: boolean; orderId?: string; error?: string };
  // Admin actions
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  updateProfile: (updates: Partial<AdminUser>) => Promise<{ success: boolean; error?: string }>;
  addAdmin: (admin: AdminUser) => void;
  updateAdmin: (admin: AdminUser) => void;
  deleteAdmin: (id: string) => void;
  updateContactInfo: (info: ContactInfo) => void;
  isMaintenanceMode: boolean;
  setMaintenanceMode: (status: boolean) => void;
  addSlide: (slide: Omit<Slide, 'id'>) => void;
  deleteSlide: (id: string) => void;
  updateSlide: (slide: Slide) => void;
  addCategoryBanner: (banner: Omit<CategoryBanner, 'id'>) => void;
  updateCategoryBanner: (banner: CategoryBanner) => void;
  deleteCategoryBanner: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addLookbookImage: (img: Omit<LookbookImage, 'id'>) => void;
  updateLookbookImage: (img: LookbookImage) => void;
  updateLookbookList: (newList: LookbookImage[]) => void;
  deleteLookbookImage: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  updateProductSerials: (updates: { id: string; serial: number }[]) => void;
  deleteProduct: (id: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderNotes: (orderId: string, notes: string) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  addSubscriber: (email: string) => void;
  deleteSubscriber: (id: string) => void;
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'date'>) => void;
  deleteContactMessage: (id: string) => void;
  addPopupAd: (ad: Omit<PopupAd, 'id'>) => void;
  deletePopupAd: (id: string) => void;
  updatePopupAd: (id: string, ad: Partial<PopupAd>) => void;
  addHomeAd: (ad: Omit<HomeAd, 'id'>) => void;
  deleteHomeAd: (id: string) => void;
  updateHomeAd: (ad: HomeAd) => void;
  // Page CRUDs
  addFAQ: (faq: Omit<FAQItem, 'id'>) => void;
  updateFAQ: (faq: FAQItem) => void;
  deleteFAQ: (id: string) => void;
  addPolicy: (policy: Omit<PolicyItem, 'id'>) => void;
  updatePolicy: (policy: PolicyItem) => void;
  deletePolicy: (id: string) => void;
  otps: OTPRecord[];
  addOTP: (phone: string, otp: string, email?: string) => void;
  deleteOTP: (id: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  wishlist: string[]; // Store product IDs
  toggleWishlist: (productId: string) => void;
  comparisonItems: string[];
  toggleComparison: (productId: string) => void;
  clearComparison: () => void;
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'status' | 'date'>) => { success: boolean; message: string };
  updateReviewStatus: (reviewId: string, status: Review['status']) => void;
  deleteReview: (reviewId: string) => void;
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  socialLinks: SocialLink[];
  updateSocialLinks: (links: SocialLink[]) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const defaultProducts: Product[] = [
  {
    id: 'p1',
    name: 'Classic White T-Shirt',
    price: 450,
    image: '',
    isHotSale: true,
    description: 'Perfect classic white t-shirt for everyday wear, made with 100% cotton.',
    category: 'Basic',
    code: 'TY-1001',
    stock: 50
  }
];

const defaultCategories: Category[] = [
  { id: 'cat1', name: 'Basic', slug: 'basic' },
  { id: 'cat2', name: 'Graphic', slug: 'graphic' }
];

const defaultFAQs: FAQItem[] = [
  {
    id: 'faq_1',
    question: 'How do I track my order?',
    answer: 'You can easily track your order using the Tracker page. Just input your Order ID to see real-time updates.'
  },
  {
    id: 'faq_2',
    question: 'What are the delivery charges?',
    answer: 'Delivery inside Dhaka is ৳70. Delivery outside Dhaka (any district in Bangladesh) is ৳120.'
  },
  {
    id: 'faq_3',
    question: 'How long does delivery take?',
    answer: 'Inside Dhaka, it takes 24 to 48 hours. Outside Dhaka, it takes around 3 to 5 business days.'
  }
];

const defaultPolicies: PolicyItem[] = [
  {
    id: 'policy_shipping_returns',
    key: 'shipping_returns',
    title: 'Shipping & Returns Policy',
    content: `We provide fast and secure cash-on-delivery all over Bangladesh.

1. Delivery Charge: ৳70 inside Dhaka city, ৳120 outside Dhaka city.
2. Return Policy: If there is any issue with our apparel, you can check it in front of the delivery person and return or exchange it immediately. Any issues after the delivery person leaves must be reported within 24 hours via our Contact page.
3. For exchanges, the product tag and poly bag must be returned intact.`
  },
  {
    id: 'policy_privacy',
    key: 'privacy_policy',
    title: 'Privacy Policy',
    content: `We are committed to protecting the privacy of all your information when using the Trendy Cart BD store.

1. Customer name, phone number, email, and district-based address are collected and stored solely for order delivery purposes.
2. Your payment and personal data remain completely secure and are never transferred or sold to any third party.
3. You can request to delete or modify your data at any time using our contact form.`
  }
];

const defaultHomeAds: HomeAd[] = [
  {
    id: 'ha_1',
    imageUrl: '',
    title: 'Trendy Bengal Design Exclusives',
    subtitle: 'Get up to 30% discount on classic t-shirts with premium printing.',
    linkUrl: '/shop',
    isActive: true
  },
  {
    id: 'ha_2',
    imageUrl: '',
    title: 'Casual Summer Premium Collection',
    subtitle: 'Buy any 3 products and grab FREE delivery across all of Bangladesh.',
    linkUrl: '/shop',
    isActive: true
  }
];

const safeParse = (saved: string | null, fallback: any) => {
  if (!saved || saved === 'undefined' || saved === 'null') return fallback;
  try {
    const parsed = JSON.parse(saved);
    if (parsed === null) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch (e) {
    console.warn('Failed to parse from local storage:', e);
    return fallback;
  }
};

const COLLECTION_KEYS = [
  "products",
  "faqs",
  "policies",
  "orders",
  "coupons",
  "slides",
  "categoryBanners",
  "lookbook",
  "subscribers",
  "contactMessages",
  "popupAds",
  "homeAds",
  "admins",
  "otps",
  "categories",
  "maintenance_mode",
  "contactInfo",
  "wishlist",
  "comparison",
  "reviews",
  "announcements",
  "socialLinks"
];

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    return safeParse(localStorage.getItem('ts_products'), []);
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    return safeParse(localStorage.getItem('ts_categories'), []);
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
    return safeParse(localStorage.getItem('ts_contact_info'), {
      storeAddress: "Our Store(Dhaka)",
      storeAddressSubtitle: "Dhaka Uddan\nDhaka, Bangladesh",
      phone: "+8801515668345",
      phoneSubtitle: "Saturday-Sunday, 9am - 8pm",
      email: "support@trendycartbd.com",
      emailSubtitle: "We typically reply within 24 hours"
    });
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    return safeParse(localStorage.getItem('ts_faqs'), []);
  });

  const [policies, setPolicies] = useState<PolicyItem[]>(() => {
    return safeParse(localStorage.getItem('ts_policies'), []);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return safeParse(localStorage.getItem('ts_orders'), []);
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    return safeParse(localStorage.getItem('ts_coupons'), []);
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeParse(localStorage.getItem('ts_cart'), []);
  });

  const [slides, setSlides] = useState<Slide[]>(() => {
    return safeParse(localStorage.getItem('ts_slides'), []);
  });

  const [categoryBanners, setCategoryBanners] = useState<CategoryBanner[]>(() => {
    return safeParse(localStorage.getItem('ts_category_banners'), []);
  });

  const [lookbook, setLookbook] = useState<LookbookImage[]>(() => {
    return safeParse(localStorage.getItem('ts_lookbook'), []);
  });

  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    return safeParse(localStorage.getItem('ts_subscribers'), []);
  });

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    return safeParse(localStorage.getItem('ts_contact_msgs'), []);
  });

  const [popupAds, setPopupAds] = useState<PopupAd[]>(() => {
    return safeParse(localStorage.getItem('ts_popup_ads'), []);
  });

  const [homeAds, setHomeAds] = useState<HomeAd[]>(() => {
    return safeParse(localStorage.getItem('ts_home_ads'), []);
  });

  const [otps, setOtps] = useState<OTPRecord[]>(() => {
    return safeParse(localStorage.getItem('ts_otps'), []);
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    return safeParse(localStorage.getItem('ts_wishlist'), []);
  });
  
  const [comparisonItems, setComparisonItems] = useState<string[]>(() => {
    return safeParse(localStorage.getItem('ts_comparison'), []);
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    return safeParse(localStorage.getItem('ts_reviews'), []);
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    return safeParse(localStorage.getItem('ts_announcements'), []);
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    return safeParse(localStorage.getItem('ts_social_links'), []);
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(() => {
    return localStorage.getItem('ts_maintenance_mode') === 'true';
  });

  const defaultSuperAdmin: AdminUser = {
    id: 'super_admin_id',
    email: 'xahin.mahir@gmail.com',
    password: '123456',
    role: 'super',
    permissions: {
      dashboard: true,
      products: true,
      orders: true,
      coupons: true,
      slides: true,
      categories: true,
      categoryBanners: true,
      lookbook: true,
      subscribers: true,
      messages: true,
      ads: true,
      faqs: true,
      policies: true,
      otps: true,
      otpsDelete: true,
      reviews: true
    }
  };

  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    return safeParse(localStorage.getItem('ts_admins'), [defaultSuperAdmin]);
  });

  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('ts_admin_token'));

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('ts_current_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => !!localStorage.getItem('ts_admin_token') && !!localStorage.getItem('ts_current_admin'));

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ts_dark_mode') === 'true';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  const serverSave = async (key: string, data: any) => {
    if (!authToken) return;
    try {
      if (Array.isArray(data) && data.length > 0) {
        // Break arrays into chunks of 5 items to avoid HTTP 413 Payload Too Large
        const chunkSize = 5;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          const res = await fetch(apiUrl('/api/db/save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, data: chunk, token: authToken })
          });
          
          if (!res.ok) {
            if (res.status === 401) {
              setCurrentAdmin(null);
              setAuthToken(null);
              setIsAdminAuth(false);
            }
            let errorMsg = `Server error (${res.status})`;
            try {
              const errorData = await res.json();
              errorMsg += `: ${errorData.error || res.statusText}`;
            } catch (e) {
              errorMsg += `: ${res.statusText}`;
            }
            throw new Error(errorMsg);
          }
        }
      } else {
        const res = await fetch(apiUrl('/api/db/save'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, data, token: authToken })
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            setCurrentAdmin(null);
            setAuthToken(null);
            setIsAdminAuth(false);
          }
          let errorMsg = `Server error (${res.status})`;
          try {
            const errorData = await res.json();
            errorMsg += `: ${errorData.error || res.statusText}`;
          } catch (e) {
            errorMsg += `: ${res.statusText}`;
          }
          throw new Error(errorMsg);
        }
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('network'))) {
        console.warn(`Server sync skipped for ${key} (network issue).`);
      } else if (err.message && err.message.includes('413')) {
        console.warn(`Server sync warning: Payload for ${key} was too large for server batch (413).`);
      } else {
        console.warn(`Server sync notice for ${key}:`, err.message || err);
      }
    }
  };

  const publicAdd = async (key: string, item: any) => {
    try {
      await fetch(apiUrl('/api/db/public-add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data: item })
      });
    } catch (err) {
      console.warn(`Failed to publicly add ${key}:`, err);
    }
  };

  useEffect(() => {
    // Safety fallback: Ensure loader completes in maximum 1.2 seconds even if server response is delayed
    const safetyTimer = setTimeout(() => {
      setIsDbLoaded(true);
    }, 1200);

    const fetchDb = async () => {
      const controller = new AbortController();
      const abortTimer = setTimeout(() => controller.abort(), 15000);

      try {
        let currentToken = authToken;
        let endpoint = currentToken ? apiUrl('/api/admin/db') : apiUrl('/api/db');
        let options: RequestInit = currentToken ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: currentToken }),
          signal: controller.signal
        } : {
          method: 'GET',
          signal: controller.signal
        };

        let res = await fetch(endpoint, options);
        
        if (res.status === 401 && currentToken) {
          console.warn("Admin token invalid or expired, clearing session and retrying with public access.");
          setAuthToken(null);
          setCurrentAdmin(null);
          setIsAdminAuth(false);
          localStorage.removeItem('ts_admin_token');
          localStorage.removeItem('ts_current_admin');
          
          // Retry with public db endpoint
          endpoint = apiUrl('/api/db');
          options = { method: 'GET', signal: controller.signal };
          res = await fetch(endpoint, options);
        }

        clearTimeout(abortTimer);

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
        const dbData = await res.json();
        
        // Handle both full DB object and products array fallback
        let normalizedDbData: any = {};
        if (Array.isArray(dbData)) {
          normalizedDbData = { products: dbData };
        } else {
          normalizedDbData = dbData;
        }

        if (normalizedDbData && Object.keys(normalizedDbData).length > 0) {
          // Robustness: Only overwrite if the server returned actual items for major collections
          // or if we were explicitly performing an admin load.
          const hasSignificantData = COLLECTION_KEYS.some(key => 
            normalizedDbData[key] && Array.isArray(normalizedDbData[key]) && normalizedDbData[key].length > 0
          );

          if (hasSignificantData) {
            if (normalizedDbData.products) {
              setProducts(normalizedDbData.products.map((p: any) => ({
                ...p,
                stock: p.stock !== undefined ? p.stock : 0
              })));
            }
            if (normalizedDbData.faqs) setFaqs(normalizedDbData.faqs);
            if (normalizedDbData.policies) setPolicies(normalizedDbData.policies);
            if (normalizedDbData.categories) setCategories(normalizedDbData.categories);
            if (normalizedDbData.orders) setOrders(normalizedDbData.orders);
            if (normalizedDbData.coupons) setCoupons(normalizedDbData.coupons);
            if (normalizedDbData.slides) setSlides(normalizedDbData.slides);
            if (normalizedDbData.categoryBanners) setCategoryBanners(normalizedDbData.categoryBanners);
            if (normalizedDbData.lookbook) setLookbook(normalizedDbData.lookbook);
            if (normalizedDbData.subscribers) setSubscribers(normalizedDbData.subscribers);
            if (normalizedDbData.contactMessages) setContactMessages(normalizedDbData.contactMessages);
            if (normalizedDbData.popupAds) setPopupAds(normalizedDbData.popupAds);
            if (normalizedDbData.homeAds) setHomeAds(normalizedDbData.homeAds);
            if (normalizedDbData.admins) setAdmins(normalizedDbData.admins);
            if (normalizedDbData.otps) setOtps(normalizedDbData.otps);
            if (normalizedDbData.announcements) setAnnouncements(normalizedDbData.announcements);
            if (normalizedDbData.socialLinks) setSocialLinks(normalizedDbData.socialLinks);
            if (normalizedDbData.comparison) setComparisonItems(normalizedDbData.comparison);
            if (normalizedDbData.reviews) setReviews(normalizedDbData.reviews);
            if (normalizedDbData.contactInfo && typeof normalizedDbData.contactInfo === 'object') {
              setContactInfo(prev => ({ ...prev, ...normalizedDbData.contactInfo }));
            }
            if (normalizedDbData.maintenance_mode !== undefined) setIsMaintenanceMode(normalizedDbData.maintenance_mode);
            try {
              if (normalizedDbData.categories) localStorage.setItem('ts_categories', JSON.stringify(normalizedDbData.categories));
              if (normalizedDbData.slides) localStorage.setItem('ts_slides', JSON.stringify(normalizedDbData.slides));
              if (normalizedDbData.categoryBanners) localStorage.setItem('ts_category_banners', JSON.stringify(normalizedDbData.categoryBanners));
              if (normalizedDbData.lookbook) localStorage.setItem('ts_lookbook', JSON.stringify(normalizedDbData.lookbook));
              if (normalizedDbData.homeAds) localStorage.setItem('ts_home_ads', JSON.stringify(normalizedDbData.homeAds));
              if (normalizedDbData.contactInfo && typeof normalizedDbData.contactInfo === 'object') {
                localStorage.setItem('ts_contact_info', JSON.stringify(normalizedDbData.contactInfo));
              }
              if (normalizedDbData.products) {
                // Save lightweight product list in localStorage so it fits within 5MB browser quota
                const liteProducts = normalizedDbData.products.map((p: any) => {
                  const { images, imageVariants, sizeChartImage, ...lite } = p;
                  return lite;
                });
                localStorage.setItem('ts_products', JSON.stringify(liteProducts));
              }
            } catch (_) {}
          } else if (products.length > 0 || (currentToken && admins.length > 1)) {
             // Server is empty but client has data -> Initialize server
             console.log("Server is empty but client has local data. Syncing to server...");
             const initialDb = {
               products,
               faqs,
               policies,
               categories,
               orders,
               coupons,
               slides,
               categoryBanners,
               lookbook,
               subscribers,
               contactMessages,
               popupAds,
               homeAds,
               admins,
               otps,
               announcements,
               socialLinks,
               contactInfo,
               comparison: comparisonItems,
               maintenance_mode: isMaintenanceMode
             };
             await fetch(apiUrl('/api/db/init'), {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(initialDb)
             });
          }
        } else {
          // Do not initialize server if no data found, just wait for subsequent actions to trigger save
          console.log("Database is empty, waiting for initial data entry...");
        }
      } catch (err) {
        console.warn("Could not reach DB endpoint from client, using cached/local state:", err);
      } finally {
        clearTimeout(safetyTimer);
        setIsDbLoaded(true);
      }
    };
    fetchDb();

    return () => clearTimeout(safetyTimer);
  }, [authToken]);

  // Custom hook to prevent syncing on the first load of isDbLoaded and only sync changed items
  function useServerSync(key: string, data: any, storageKey: string) {
    const previousDataRef = React.useRef(data);
    const hasInitializedRef = React.useRef(false);

    useEffect(() => {
      if (!isDbLoaded) {
        previousDataRef.current = data;
        return;
      }

      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        previousDataRef.current = data;
        return;
      }

      // Only save if reference changed and user is admin
      if (isAdminAuth && previousDataRef.current !== data) {
        const prev = previousDataRef.current;
        previousDataRef.current = data;

        // If it's an array of items with IDs, only send the modified/added items instead of re-uploading all 70MB!
        if (Array.isArray(data) && Array.isArray(prev)) {
          const prevMap = new Map(prev.map((item: any) => [item?.id, item]));
          const changedItems = data.filter((item: any) => {
            if (!item || !item.id) return true;
            const prevItem = prevMap.get(item.id);
            return prevItem !== item;
          });
          if (changedItems.length > 0) {
            serverSave(key, changedItems);
          }
        } else {
          serverSave(key, data);
        }
      }
    }, [data, isDbLoaded, key, storageKey, isAdminAuth]);
  }

  useServerSync('products', products, 'ts_products');
  useServerSync('orders', orders, 'ts_orders');
  useServerSync('coupons', coupons, 'ts_coupons');
  useServerSync('slides', slides, 'ts_slides');
  useServerSync('categoryBanners', categoryBanners, 'ts_category_banners');
  useServerSync('lookbook', lookbook, 'ts_lookbook');
  useServerSync('subscribers', subscribers, 'ts_subscribers');
  useServerSync('contactMessages', contactMessages, 'ts_contact_msgs');
  useServerSync('popupAds', popupAds, 'ts_popup_ads');
  useServerSync('homeAds', homeAds, 'ts_home_ads');
  useServerSync('faqs', faqs, 'ts_faqs');
  useServerSync('policies', policies, 'ts_policies');
  useServerSync('categories', categories, 'ts_categories');
  useServerSync('contactInfo', contactInfo, 'ts_contact_info');
  useServerSync('admins', admins, 'ts_admins');
  useServerSync('otps', otps, 'ts_otps');
  useServerSync('wishlist', wishlist, 'ts_wishlist');
  useServerSync('announcements', announcements, 'ts_announcements');
  useServerSync('comparison', comparisonItems, 'ts_comparison');
  useServerSync('reviews', reviews, 'ts_reviews');
  useServerSync('maintenance_mode', isMaintenanceMode, 'ts_maintenance_mode');

  useEffect(() => { 
    try {
      localStorage.setItem('ts_cart', JSON.stringify(cart)); 
    } catch (e) {
      console.warn('Failed to save cart to local storage (quota exceeded):', e);
    }
  }, [cart]);

  // Keep currentAdmin in sync with the central admins list
  useEffect(() => {
    if (currentAdmin && admins.length > 0) {
      const latest = admins.find(a => a.id === currentAdmin.id);
      if (latest && (
        latest.image !== currentAdmin.image || 
        latest.name !== currentAdmin.name || 
        latest.email !== currentAdmin.email ||
        latest.role !== currentAdmin.role
      )) {
        setCurrentAdmin(latest);
      }
    }
  }, [admins, currentAdmin]);

  useEffect(() => {
    if (authToken) {
      try {
        localStorage.setItem('ts_admin_token', authToken);
      } catch (e) {
        console.warn('Failed to save admin token', e);
      }
    } else {
      try {
        localStorage.removeItem('ts_admin_token');
      } catch (e) {}
    }
  }, [authToken]);

  useEffect(() => {
    if (currentAdmin && authToken) {
      try {
        localStorage.setItem('ts_current_admin', JSON.stringify(currentAdmin));
      } catch (e) {
        console.warn('Failed to save current admin', e);
      }
      setIsAdminAuth(true);
    } else if (!currentAdmin || !authToken) {
      try {
        localStorage.removeItem('ts_current_admin');
      } catch (e) {}
      setIsAdminAuth(false);
    }
  }, [currentAdmin, authToken]);
  
  useEffect(() => { 
    try {
      localStorage.setItem('ts_dark_mode', isDarkMode.toString()); 
    } catch (e) {
      console.warn('Failed to save dark mode', e);
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const toggleComparison = (productId: string) => {
    setComparisonItems(prev => {
      const isAlreadyIn = prev.includes(productId);
      if (isAlreadyIn) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 4) {
        // Limit to 4 products for comparison
        return prev;
      }
      return [...prev, productId];
    });
  };

  const clearComparison = () => setComparisonItems([]);

  const addReview = (reviewData: Omit<Review, 'id' | 'status' | 'date'>) => {
    // Validate orderId (case-insensitive and trimmed, supporting TCB- and legacy NTD-)
    const submittedId = reviewData.orderId.trim().toUpperCase();
    const normalizedSubmitted = submittedId.replace(/^NTD-/i, 'TCB-');
    const order = orders.find(o => {
      const oid = o.id.trim().toUpperCase();
      const normalizedOid = oid.replace(/^NTD-/i, 'TCB-');
      return oid === submittedId || normalizedOid === normalizedSubmitted;
    });
    if (!order) {
      return { success: false, message: `Invalid Order ID (${submittedId}). Please provide a valid Order ID.` };
    }

    // Validate if product is in that order
    const hasProduct = order.items.some(item => item.id === reviewData.productId);
    if (!hasProduct) {
      return { success: false, message: 'This product was not part of this order.' };
    }

    // Check if user already reviewed this product with this order
    const alreadyReviewed = reviews.some(r => {
      const rOid = (r.orderId || '').trim().toUpperCase().replace(/^NTD-/i, 'TCB-');
      return rOid === normalizedSubmitted && r.productId === reviewData.productId && !r.deleted;
    });
    if (alreadyReviewed) {
      return { success: false, message: 'You have already submitted a review for this product using this Order ID.' };
    }

    const newReview: Review = {
      ...reviewData,
      orderId: normalizedSubmitted,
      id: generateId(),
      status: 'pending',
      date: new Date().toISOString(),
    };

    setReviews(prev => [newReview, ...prev]);
    publicAdd('reviews', newReview);
    return { success: true, message: 'Review submitted for moderation!' };
  };

  const updateReviewStatus = (reviewId: string, status: Review['status']) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, deleted: true } : r));
  };

  const addAnnouncement = (announcement: Omit<Announcement, 'id'>) => {
    setAnnouncements(prev => [{ ...announcement, id: generateId() }, ...prev]);
  };

  const updateAnnouncement = (announcement: Announcement) => {
    setAnnouncements(prev => prev.map(a => a.id === announcement.id ? announcement : a));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, deleted: true } : a));
  };

  const updateSocialLinks = (links: SocialLink[]) => {
    setSocialLinks(links);
    serverSave('socialLinks', links);
  };

  const loginAdmin = async (email: string, pass: string) => {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        setAuthToken(data.token);
        setCurrentAdmin(data.admin);
        setIsAdminAuth(true);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: "Network error occurred." };
    }
  };

  const logoutAdmin = () => {
    setCurrentAdmin(null);
    setAuthToken(null);
    setIsAdminAuth(false);
  };

  const updateProfile = async (updates: Partial<AdminUser>) => {
    if (!currentAdmin || !authToken) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch(apiUrl('/api/admin/update-profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentAdmin.id, updates, token: authToken })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentAdmin(data.admin);
        // Update admin in list too
        setAdmins(prev => prev.map(a => a.id === data.admin.id ? data.admin : a));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: "Failed to update profile" };
    }
  };

  const addAdmin = (admin: AdminUser) => {
    const updatedAdmins = [...admins, admin];
    setAdmins(updatedAdmins);
    serverSave('admins', updatedAdmins);
  };

  const updateAdmin = (admin: AdminUser) => {
    const updatedAdmins = admins.map(a => a.id === admin.id ? admin : a);
    setAdmins(updatedAdmins);
    serverSave('admins', updatedAdmins);
    if (currentAdmin && currentAdmin.id === admin.id) {
      setCurrentAdmin(admin);
    }
  };

  const updateContactInfo = (info: ContactInfo) => {
    setContactInfo(info);
    try {
      localStorage.setItem('ts_contact_info', JSON.stringify(info));
    } catch (e) {
      console.warn('Failed to save contact info to local storage', e);
    }
    serverSave('contactInfo', info);
  };

  const deleteAdmin = (id: string) => {
    // Soft delete by setting isActive to false to comply with additive-only rule
    const updatedAdmins = admins.map(a => a.id === id ? { ...a, isActive: false } : a);
    setAdmins(updatedAdmins);
    serverSave('admins', updatedAdmins);
    
    if (currentAdmin && currentAdmin.id === id) {
      setCurrentAdmin(null);
      setAuthToken(null);
      setIsAdminAuth(false);
    }
  };

  const getProductPriceForSize = (product: Product, size: string): number => {
    if (product?.sizePrices && product.sizePrices[size] !== undefined && product.sizePrices[size] > 0) {
      return product.sizePrices[size];
    }
    return product.price;
  };

  const getProductStockForSize = (product: Product, size: string, image?: string): number => {
    if (!product) return 0;
    if (image && product.imageVariants && product.imageVariants.length > 0) {
      const variant = product.imageVariants.find(v => v.image === image);
      if (variant) {
        if (variant.sizeStocks && variant.sizeStocks[size] !== undefined) {
          return variant.sizeStocks[size];
        }
        return variant.stock !== undefined ? variant.stock : 0;
      }
    }
    if (product?.sizeStocks && Object.keys(product.sizeStocks).length > 0) {
      return product.sizeStocks[size] !== undefined ? product.sizeStocks[size] : 0;
    }
    return product ? (product.stock !== undefined ? product.stock : 0) : 0;
  };

  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    const size = selectedSize || 'M';
    const priceForSize = getProductPriceForSize(product, size);
    const itemImage = product.image || '';
    const matchedVariant = product.imageVariants?.find(v => v.image === itemImage);
    const resolvedCode = matchedVariant?.code?.trim() || product.code || '';
    const { images, imageVariants, sizeChartImage, ...liteProduct } = product;
    
    // User requested that same product added multiple times should appear as separate lines in checkout
    // So we generate a unique ID for each "add" event.
    const cartItemId = `${product.id}-${size}-${itemImage.substring(itemImage.length - 10)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    setCart(prev => {
      // If we wanted to merge, we would find existing here. 
      // But the user explicitly said "একাধিকবার ই চেক আউটে এড হবে" (Added multiple times).
      // However, we still need to check stock.
      const existingItems = prev.filter(item => item.id === product.id && (item.selectedSize || 'M') === size && (item.image || '') === itemImage);
      const currentQtyInCart = existingItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRequested = currentQtyInCart + quantity;
      
      const stock = getProductStockForSize(product, size, itemImage);
      if (totalRequested > stock) {
        const allowedAdd = Math.max(0, stock - currentQtyInCart);
        if (allowedAdd <= 0) {
          // If already at max stock, don't add anything more
          return prev;
        }
        // Add up to stock
        return [...prev, { ...liteProduct, code: resolvedCode, price: priceForSize, quantity: allowedAdd, selectedSize: size, image: itemImage, cartItemId }];
      }

      return [...prev, { ...liteProduct, code: resolvedCode, price: priceForSize, quantity, selectedSize: size, image: itemImage, cartItemId }];
    });
  };

  const removeFromCart = (productId: string, selectedSize?: string, image?: string) => {
    // If we have cartItemId, we should use it. But for backward compatibility with existing calls:
    setCart(prev => prev.filter(item => !(item.id === productId && (item.selectedSize || 'M') === (selectedSize || 'M') && (image === undefined || (item.image || '') === image))));
  };

  const removeFromCartById = (cartItemId: string) => {
    setCart(prev => prev.filter(item => (item as any).cartItemId !== cartItemId));
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedSize?: string, image?: string) => {
    if (quantity < 1) return;
    const size = selectedSize || 'M';
    setCart(prev => prev.map(item => {
      if (item.id === productId && (item.selectedSize || 'M') === size && (image === undefined || (item.image || '') === image)) {
        const itemImg = item.image || image || '';
        const stock = getProductStockForSize(item, size, itemImg);
        const priceForSize = getProductPriceForSize(item, size);
        return { ...item, quantity: Math.min(quantity, stock), price: priceForSize };
      }
      return item;
    }));
  };

  const updateCartQuantityById = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => {
      if ((item as any).cartItemId === cartItemId) {
        const stock = getProductStockForSize(item, item.selectedSize || 'M', item.image || '');
        const priceForSize = getProductPriceForSize(item, item.selectedSize || 'M');
        return { ...item, quantity: Math.min(quantity, stock), price: priceForSize };
      }
      return item;
    }));
  };

  const updateCartItemSize = (productId: string, oldSize: string, newSize: string, image?: string) => {
    const sizeOld = oldSize || 'M';
    const sizeNew = newSize || 'M';
    if (sizeOld === sizeNew) return;

    setCart(prev => {
      const itemIndex = prev.findIndex(item => item.id === productId && (item.selectedSize || 'M') === sizeOld && (image === undefined || (item.image || '') === image));
      if (itemIndex === -1) return prev;

      const updatedItem = prev[itemIndex];
      const priceNew = getProductPriceForSize(updatedItem, sizeNew);
      const existingIndex = prev.findIndex((item, idx) => idx !== itemIndex && item.id === productId && (item.selectedSize || 'M') === sizeNew && (item.image || '') === (updatedItem.image || ''));

      if (existingIndex !== -1) {
        // Merge the quantities of both items up to stock limit
        const existingItem = prev[existingIndex];
        const itemImg = updatedItem.image || image || '';
        const stock = getProductStockForSize(updatedItem, sizeNew, itemImg);
        const mergedQty = Math.min(updatedItem.quantity + existingItem.quantity, stock);

        // Update the existing item and remove the old item
        return prev.map((item, idx) => {
          if (idx === existingIndex) {
            return { ...item, quantity: mergedQty, price: priceNew };
          }
          return item;
        }).filter((_, idx) => idx !== itemIndex);
      } else {
        // Just change the size
        return prev.map((item, idx) => {
          if (idx === itemIndex) {
            return { ...item, selectedSize: sizeNew, price: priceNew };
          }
          return item;
        });
      }
    });
  };

  const updateCartItemSizeById = (cartItemId: string, newSize: string) => {
    setCart(prev => prev.map(item => {
      if ((item as any).cartItemId === cartItemId) {
        const priceNew = getProductPriceForSize(item, newSize);
        return { ...item, selectedSize: newSize, price: priceNew };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (customer: CustomerInfo, couponCode?: string) => {
    if (cart.length === 0) return { success: false, error: 'Cart is empty' };

    let discount = 0;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (couponCode) {
      const coupon = coupons.find(c => {
        const isActive = c.isActive;
        const now = new Date();
        const isNotExpired = !c.expiryDate || new Date(c.expiryDate) >= now;
        const isStarted = !c.startDate || new Date(c.startDate) <= now;
        return c.code.toLowerCase() === couponCode.toLowerCase() && isActive && isNotExpired && isStarted;
      });
      if (!coupon) {
        return { success: false, error: 'Invalid, inactive, not yet started, or expired coupon' };
      }
      
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
       } else {
        discount = coupon.discountValue;
      }
    }

    const shippingCharge = customer.district === 'Dhaka' ? 70 : 120;
    const total = subtotal - discount + shippingCharge;

    // Check stock availability
    for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
            const stock = getProductStockForSize(product, item.selectedSize || 'M');
            if (item.quantity > stock) {
                return { success: false, error: `Product ${product.name} is out of stock or insufficient quantity for size ${item.selectedSize || 'M'}.` };
            }
        } else {
            return { success: false, error: `Product not found: ${item.name}` };
        }
    }

    const newOrderId = `TCB-${Date.now()}${(Math.random() * 1000).toFixed(0)}`;

    const newOrder: Order = {
      id: newOrderId,
      customer,
      items: [...cart],
      subtotal,
      discount,
      shippingCharge,
      total,
      couponCode,
      date: new Date().toISOString(),
      status: 'pending'
    };

    // Decrease stock
    setProducts(prev => {
      const updated = [...prev];
      cart.forEach(item => {
        const productIndex = updated.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
          const prod = updated[productIndex];
          const sz = item.selectedSize || 'M';
          const itemImg = item.image || '';

          // Deduct from imageVariants if present
          let updatedImageVariants = prod.imageVariants ? [...prod.imageVariants] : undefined;
          if (updatedImageVariants && updatedImageVariants.length > 0) {
            updatedImageVariants = updatedImageVariants.map(v => {
              if (v.image === itemImg) {
                const vSizes = { ...(v.sizeStocks || {}) };
                if (vSizes[sz] !== undefined) {
                  vSizes[sz] = Math.max(0, (vSizes[sz] || 0) - item.quantity);
                }
                const newTotal = Object.values(vSizes).reduce<number>((sum: number, n: any) => sum + (Number(n) || 0), 0);
                return { ...v, sizeStocks: vSizes, stock: newTotal };
              }
              return v;
            });
          }

          const newSizeStocks = { ...(prod.sizeStocks || {}) };
          if (newSizeStocks[sz] !== undefined) {
            newSizeStocks[sz] = Math.max(0, (newSizeStocks[sz] || 0) - item.quantity);
          }

          const newTotalStock = (updatedImageVariants && updatedImageVariants.length > 0)
            ? updatedImageVariants.reduce<number>((sum: number, v) => sum + (v.stock || 0), 0)
            : (Object.keys(newSizeStocks).length > 0
                ? Object.values(newSizeStocks).reduce<number>((sum: number, s: any) => sum + (Number(s) || 0), 0)
                : Math.max(0, (prod.stock || 0) - item.quantity));

          updated[productIndex] = {
            ...prod,
            stock: newTotalStock,
            sizeStocks: newSizeStocks,
            imageVariants: updatedImageVariants
          };
        }
      });
      return updated;
    });

    setOrders(prev => [newOrder, ...prev]);
    publicAdd('orders', newOrder);
    clearCart();
    return { success: true, orderId: newOrder.id };
  };

  // Admin
  const normalizeVariantsWithCodes = (baseCode: string, variants?: Product['imageVariants']) => {
    if (!variants || variants.length === 0) return { imageVariants: variants, variantCodes: [] as string[] };
    const firstCustomCode = variants[0]?.code?.trim().toUpperCase();
    const rootBase = (firstCustomCode ? firstCustomCode.replace(/-\d+$/, '') : baseCode) || baseCode;
    const updatedVariants = variants.map((v, idx) => {
      const customCode = v.code && v.code.trim() ? v.code.trim().toUpperCase() : '';
      const resolvedVariantCode = customCode || `${rootBase}-${idx + 1}`;
      return {
        ...v,
        code: resolvedVariantCode
      };
    });
    const variantCodes = Array.from(new Set(updatedVariants.map(v => v.code).filter(Boolean))) as string[];
    return { imageVariants: updatedVariants, variantCodes };
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    // Generate sequential code if none provided
    let code = product.code && product.code.trim() 
      ? product.code.trim().toUpperCase() 
      : '';
    
    if (!code) {
      const tyCodes = products
        .map(p => p.code || '')
        .filter(c => c.startsWith('TY-'))
        .map(c => parseInt(c.split('-')[1]))
        .filter(n => !isNaN(n));
      const maxNum = tyCodes.length > 0 ? Math.max(...tyCodes) : 1000;
      code = `TY-${maxNum + 1}`;
    }

    const { imageVariants, variantCodes } = normalizeVariantsWithCodes(code, product.imageVariants);
    const sameGroup = products.filter(p => !p.deleted && Boolean(p.isCollection) === Boolean(product.isCollection));
    const maxSerial = sameGroup.reduce((max, p) => Math.max(max, p.serial || 0), 0);
    const resolvedSerial = product.serial && product.serial > 0 ? product.serial : maxSerial + 1;
    
    setProducts(prev => [{
      ...product,
      code,
      serial: resolvedSerial,
      imageVariants,
      variantCodes: variantCodes.length > 0 ? variantCodes : product.variantCodes,
      id: generateId()
    }, ...prev]);
  };

  const updateProduct = (product: Product) => {
    let code = product.code && product.code.trim()
      ? product.code.trim().toUpperCase()
      : '';
    
    if (!code) {
      const tyCodes = products
        .filter(p => p.id !== product.id)
        .map(p => p.code || '')
        .filter(c => c.startsWith('TY-'))
        .map(c => parseInt(c.split('-')[1]))
        .filter(n => !isNaN(n));
      const maxNum = tyCodes.length > 0 ? Math.max(...tyCodes) : 1000;
      code = `TY-${maxNum + 1}`;
    }

    const { imageVariants, variantCodes } = normalizeVariantsWithCodes(code, product.imageVariants);
    
    setProducts(prev => prev.map(p => p.id === product.id ? {
      ...product,
      code,
      imageVariants,
      variantCodes: variantCodes.length > 0 ? variantCodes : (product.variantCodes || p.variantCodes)
    } : p));
  };

  const updateProductSerials = (updates: { id: string; serial: number }[]) => {
    if (!updates || updates.length === 0) return;
    const serialMap = new Map(updates.map(u => [u.id, u.serial]));
    setProducts(prev => prev.map(p => {
      if (serialMap.has(p.id)) {
        return { ...p, serial: serialMap.get(p.id)! };
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    const prodName = prod ? `"${prod.name}"` : `ID - ${id}`;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, deleted: true } : p));
  };

  const addCoupon = (coupon: Omit<Coupon, 'id'>) => {
    setCoupons(prev => [{ ...coupon, id: generateId() }, ...prev]);
  };

  const updateCoupon = (coupon: Coupon) => {
    setCoupons(prev => prev.map(c => c.id === coupon.id ? coupon : c));
  };

  const deleteCoupon = (id: string) => {
    const coup = coupons.find(c => c.id === id);
    const coupCode = coup ? `"${coup.code}"` : `ID - ${id}`;
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, deleted: true } : c));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId);
      if (order && status === 'cancelled' && order.status !== 'cancelled') {
        // Restore stock
        setProducts(pPrev => {
          const updated = [...pPrev];
          order.items.forEach(item => {
            const productIndex = updated.findIndex(p => p.id === item.id);
            if (productIndex !== -1) {
              const prod = updated[productIndex];
              const sz = item.selectedSize || 'M';
              const itemImg = item.image || '';

              let updatedImageVariants = prod.imageVariants ? [...prod.imageVariants] : undefined;
              if (updatedImageVariants && updatedImageVariants.length > 0) {
                updatedImageVariants = updatedImageVariants.map(v => {
                  if (v.image === itemImg) {
                    const vSizes = { ...(v.sizeStocks || {}) };
                    if (vSizes[sz] !== undefined) {
                      vSizes[sz] = (vSizes[sz] || 0) + item.quantity;
                    }
                    const newTotal = Object.values(vSizes).reduce<number>((sum: number, n: any) => sum + (Number(n) || 0), 0);
                    return { ...v, sizeStocks: vSizes, stock: newTotal };
                  }
                  return v;
                });
              }

              const newSizeStocks = { ...(prod.sizeStocks || {}) };
              if (newSizeStocks[sz] !== undefined) {
                newSizeStocks[sz] = (newSizeStocks[sz] || 0) + item.quantity;
              }

              const newTotalStock = (updatedImageVariants && updatedImageVariants.length > 0)
                ? updatedImageVariants.reduce<number>((sum: number, v) => sum + (v.stock || 0), 0)
                : (Object.keys(newSizeStocks).length > 0
                    ? Object.values(newSizeStocks).reduce<number>((sum: number, s: any) => sum + (Number(s) || 0), 0)
                    : (prod.stock || 0) + item.quantity);

              updated[productIndex] = {
                ...prod,
                stock: newTotalStock,
                sizeStocks: newSizeStocks,
                imageVariants: updatedImageVariants
              };
            }
          });
          return updated;
        });
      } else if (order && order.status === 'cancelled' && status !== 'cancelled') {
        // Re-decrease stock if accidentally restored from cancelled
        setProducts(pPrev => {
          const updated = [...pPrev];
          order.items.forEach(item => {
            const productIndex = updated.findIndex(p => p.id === item.id);
            if (productIndex !== -1) {
              const prod = updated[productIndex];
              const sz = item.selectedSize || 'M';
              const itemImg = item.image || '';

              let updatedImageVariants = prod.imageVariants ? [...prod.imageVariants] : undefined;
              if (updatedImageVariants && updatedImageVariants.length > 0) {
                updatedImageVariants = updatedImageVariants.map(v => {
                  if (v.image === itemImg) {
                    const vSizes = { ...(v.sizeStocks || {}) };
                    if (vSizes[sz] !== undefined) {
                      vSizes[sz] = Math.max(0, (vSizes[sz] || 0) - item.quantity);
                    }
                    const newTotal = Object.values(vSizes).reduce<number>((sum: number, n: any) => sum + (Number(n) || 0), 0);
                    return { ...v, sizeStocks: vSizes, stock: newTotal };
                  }
                  return v;
                });
              }

              const newSizeStocks = { ...(prod.sizeStocks || {}) };
              if (newSizeStocks[sz] !== undefined) {
                newSizeStocks[sz] = Math.max(0, (newSizeStocks[sz] || 0) - item.quantity);
              }

              const newTotalStock = (updatedImageVariants && updatedImageVariants.length > 0)
                ? updatedImageVariants.reduce<number>((sum: number, v) => sum + (v.stock || 0), 0)
                : (Object.keys(newSizeStocks).length > 0
                    ? Object.values(newSizeStocks).reduce<number>((sum: number, s: any) => sum + (Number(s) || 0), 0)
                    : Math.max(0, (prod.stock || 0) - item.quantity));

              updated[productIndex] = {
                ...prod,
                stock: newTotalStock,
                sizeStocks: newSizeStocks,
                imageVariants: updatedImageVariants
              };
            }
          });
          return updated;
        });
      }
      return prev.map(o => o.id === orderId ? { ...o, status } : o);
    });
  };

  const updateOrderNotes = (orderId: string, notes: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, notes } : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, deleted: true } : o));
  };

  const updateOrder = (order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
  };

  const addSlide = (slide: Omit<Slide, 'id'>) => {
    setSlides(prev => [{...slide, id: generateId()}, ...prev]);
  };
  const updateSlide = (slide: Slide) => {
    setSlides(prev => prev.map(s => s.id === slide.id ? slide : s));
  };
  const deleteSlide = (id: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, deleted: true } : s));
  };
  
  const addCategoryBanner = (banner: Omit<CategoryBanner, 'id'>) => {
    setCategoryBanners(prev => [{...banner, id: generateId()}, ...prev]);
  };
  const updateCategoryBanner = (banner: CategoryBanner) => {
    setCategoryBanners(prev => prev.map(b => b.id === banner.id ? banner : b));
  };
  const deleteCategoryBanner = (id: string) => {
    setCategoryBanners(prev => prev.map(b => b.id === id ? { ...b, deleted: true } : b));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [{...category, id: generateId()}, ...prev]);
  };
  const updateCategory = (category: Category) => {
    setCategories(prev => prev.map(c => c.id === category.id ? category : c));
  };
  const deleteCategory = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, deleted: true } : c));
  };

  const addLookbookImage = (img: Omit<LookbookImage, 'id'>) => {
    setLookbook(prev => [{...img, id: generateId()}, ...prev]);
  };
  const updateLookbookImage = (img: LookbookImage) => {
    setLookbook(prev => prev.map(l => l.id === img.id ? img : l));
  };
  const updateLookbookList = (newList: LookbookImage[]) => {
    setLookbook(newList);
  };
  const deleteLookbookImage = (id: string) => {
    setLookbook(prev => prev.map(l => l.id === id ? { ...l, deleted: true } : l));
  };

  const addSubscriber = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!subscribers.find(s => s.email && s.email.trim().toLowerCase() === normalizedEmail)) {
      const newSub = { id: generateId(), email: normalizedEmail, date: new Date().toISOString() };
      setSubscribers(prev => [newSub, ...prev]);
      publicAdd('subscribers', newSub);
    }
  };
  const deleteSubscriber = (id: string) => {
    const sub = subscribers.find(s => s.id === id);
    const subEmail = sub ? sub.email : `ID - ${id}`;
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, deleted: true } : s));
  };

  const addContactMessage = (msg: Omit<ContactMessage, 'id' | 'date'>) => {
    const newMsg = { ...msg, id: generateId(), date: new Date().toISOString() };
    setContactMessages(prev => [newMsg, ...prev]);
    publicAdd('contactMessages', newMsg);
  };
  const deleteContactMessage = (id: string) => {
    const msg = contactMessages.find(m => m.id === id);
    const msgSender = msg ? `${msg.name} (${msg.email})` : `ID - ${id}`;
    setContactMessages(prev => prev.map(m => m.id === id ? { ...m, deleted: true } : m));
  };

  const addPopupAd = (ad: Omit<PopupAd, 'id'>) => {
    setPopupAds(prev => [{...ad, id: generateId()}, ...prev]);
  };
  const deletePopupAd = (id: string) => {
    setPopupAds(prev => prev.map(a => a.id === id ? { ...a, deleted: true } : a));
  };
  const updatePopupAd = (id: string, updatedAd: Partial<PopupAd>) => {
    setPopupAds(prev => prev.map(ad => ad.id === id ? { ...ad, ...updatedAd } : ad));
  };

  const addHomeAd = (ad: Omit<HomeAd, 'id'>) => {
    setHomeAds(prev => [{...ad, id: generateId()}, ...prev]);
  };
  const deleteHomeAd = (id: string) => {
    setHomeAds(prev => prev.map(a => a.id === id ? { ...a, deleted: true } : a));
  };
  const updateHomeAd = (ad: HomeAd) => {
    setHomeAds(prev => prev.map(a => a.id === ad.id ? ad : a));
  };

  const addFAQ = (faq: Omit<FAQItem, 'id'>) => {
    setFaqs(prev => [{ ...faq, id: generateId() }, ...prev]);
  };
  const updateFAQ = (faq: FAQItem) => {
    setFaqs(prev => prev.map(f => f.id === faq.id ? faq : f));
  };
  const deleteFAQ = (id: string) => {
    const item = faqs.find(f => f.id === id);
    const itemQuestion = item ? `"${item.question}"` : `ID - ${id}`;
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, deleted: true } : f));
  };

  const addPolicy = (policy: Omit<PolicyItem, 'id'>) => {
    setPolicies(prev => [{ ...policy, id: generateId() }, ...prev]);
  };
  const updatePolicy = (policy: PolicyItem) => {
    setPolicies(prev => prev.map(p => p.id === policy.id ? policy : p));
  };
  const deletePolicy = (id: string) => {
    const pol = policies.find(p => p.id === id);
    const polTitle = pol ? `"${pol.title}"` : `ID - ${id}`;
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, deleted: true } : p));
  };

  const addOTP = (phone: string, otp: string, email?: string) => {
    const newOtp = {
      id: generateId(),
      phone,
      email,
      otp,
      createdAt: new Date().toISOString(),
      verified: false
    };
    setOtps(prev => [newOtp, ...prev]);
    publicAdd('otps', newOtp);
  };

  const deleteOTP = (id: string) => {
    const otpRec = otps.find(o => o.id === id);
    const details = otpRec ? `Deleted OTP code: [${otpRec.otp}] for phone: ${otpRec.phone || 'N/A'}` : `Deleted OTP ID: ${id}`;
    setOtps(prev => prev.map(o => o.id === id ? { ...o, deleted: true } : o));
  };

  useEffect(() => {
    // Keep-alive ping every 3 minutes to keep Render/Railway web service active and prevent cold start
    const keepAliveTimer = setInterval(() => {
      fetch(apiUrl('/api/ping')).catch(() => {});
    }, 3 * 60 * 1000);

    return () => clearInterval(keepAliveTimer);
  }, []);

  return (
    <ShopContext.Provider value={{
      isDbLoaded,
      products: (products || []).filter(p => !p.deleted),
      categories: (categories || []).filter(c => !c.deleted), 
      orders: (orders || []).filter(o => !o.deleted), 
      coupons: (coupons || []).filter(c => !c.deleted), 
      cart: cart || [], 
      slides: (slides || []).filter(s => !s.deleted), 
      categoryBanners: (categoryBanners || []).filter(b => !b.deleted), 
      lookbook: (lookbook || []).filter(l => !l.deleted), 
      subscribers: (subscribers || []).filter(s => !s.deleted), 
      contactMessages: (contactMessages || []).filter(m => !m.deleted), 
      popupAds: (popupAds || []).filter(a => !a.deleted), 
      homeAds: (homeAds || []).filter(a => !a.deleted), 
      faqs: (faqs || []).filter(f => !f.deleted), 
      policies: (policies || []).filter(p => !p.deleted),
      contactInfo,
      isAdminAuth,
      authToken,
      currentAdmin, 
      admins: admins.filter(a => a.isActive !== false), 
      otps: otps.filter(o => !o.deleted), 
      isMaintenanceMode,
      setMaintenanceMode: setIsMaintenanceMode,
      getProductPriceForSize,
      getProductStockForSize,
      addToCart, removeFromCart, removeFromCartById, updateCartQuantity, updateCartQuantityById, updateCartItemSize, updateCartItemSizeById, clearCart, placeOrder,
      loginAdmin, logoutAdmin, updateProfile, addAdmin, updateAdmin, deleteAdmin, updateContactInfo, addProduct, updateProduct, updateProductSerials, deleteProduct,
      addSlide, updateSlide, deleteSlide, addCategoryBanner, updateCategoryBanner, deleteCategoryBanner, 
      addCategory, updateCategory, deleteCategory,
      addLookbookImage, updateLookbookImage, updateLookbookList, deleteLookbookImage,
      addCoupon, updateCoupon, deleteCoupon,
      updateOrderStatus, updateOrderNotes, updateOrder, deleteOrder,
      addSubscriber, deleteSubscriber, addContactMessage, deleteContactMessage, addPopupAd, deletePopupAd, updatePopupAd,
      addHomeAd, deleteHomeAd, updateHomeAd,
      addFAQ, updateFAQ, deleteFAQ, addPolicy, updatePolicy, deletePolicy,
      addOTP, deleteOTP,
      isDarkMode, toggleDarkMode, isCartOpen, setIsCartOpen,
      wishlist, toggleWishlist,
      comparisonItems, toggleComparison, clearComparison,
      reviews: reviews.filter(r => !r.deleted), addReview, updateReviewStatus, deleteReview,
      announcements: announcements.filter(a => !a.deleted), addAnnouncement, updateAnnouncement, deleteAnnouncement,
      socialLinks, updateSocialLinks
    }}>
      <div className="contents">
        {children}
      </div>
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
