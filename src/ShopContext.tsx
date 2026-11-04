import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Product, Order, Category, Coupon, CartItem, CustomerInfo, Slide, CategoryBanner, LookbookImage, Subscriber, ContactMessage, PopupAd, HomeAd, AdminUser, OTPRecord, Review, ContactInfo, Announcement, FAQItem, PolicyItem, SocialLink } from './types';
import { generateId } from './lib/utils';

interface ShopContextType {
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
  deleteLookbookImage: (id: string) => void;
  moveLookbookImage: (id: string, direction: 'up' | 'down') => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
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

const DatabaseLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';
    
    const start = Date.now();
    const duration = 800; // Minimum duration for visual smoothness

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(p);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          document.body.style.overflow = '';
          onComplete();
        }, 200); // Small delay for 100% visibility
      }
    }, 30);
    
    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 z-[9999]">
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-gray-500"></p>
          <p className="text-2xl font-black text-black dark:text-white">{progress}%</p>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
            className="h-full bg-black dark:bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
          />
        </div>
      </div>
    </div>
  );
};

const safeParse = (saved: string | null, fallback: any) => {
  if (!saved || saved === 'undefined' || saved === 'null') return fallback;
  try {
    const parsed = JSON.parse(saved);
    if (parsed === null) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch (e) {
    console.error('Failed to parse from local storage:', e);
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
    return safeParse(localStorage.getItem('ts_products'), defaultProducts);
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    return safeParse(localStorage.getItem('ts_categories'), defaultCategories);
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
    return safeParse(localStorage.getItem('ts_faqs'), defaultFAQs);
  });

  const [policies, setPolicies] = useState<PolicyItem[]>(() => {
    return safeParse(localStorage.getItem('ts_policies'), defaultPolicies);
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
    return safeParse(localStorage.getItem('ts_home_ads'), defaultHomeAds);
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
  const [showApp, setShowApp] = useState(false);

  const serverSave = async (key: string, data: any) => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/db/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data, token: authToken })
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          // Clear invalid/expired admin token and log out
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
      
    } catch (err: any) {
      if (err.message.includes('Failed to fetch') || err.message.includes('network')) {
        // Quietly fail on network errors as the server might be restarting or slow
        console.warn(`Server sync skipped for ${key} (network issue).`);
      } else {
        console.error(`Failed to save ${key} to server database:`, err);
      }
    }
  };

  const publicAdd = async (key: string, item: any) => {
    try {
      await fetch('/api/db/public-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data: item })
      });
    } catch (err) {
      console.error(`Failed to publicly add ${key}:`, err);
    }
  };

  useEffect(() => {
    const fetchDb = async () => {
      try {
        let currentToken = authToken;
        let endpoint = currentToken ? '/api/admin/db' : '/api/db';
        let options: RequestInit = currentToken ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: currentToken })
        } : {
          method: 'GET'
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
          endpoint = '/api/db';
          options = { method: 'GET' };
          res = await fetch(endpoint, options);
        }

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
        const dbData = await res.json();
        
        // Handle both full DB object (admin/public) and products array (legacy public fallback)
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
            if (normalizedDbData.contactInfo) setContactInfo(normalizedDbData.contactInfo);
            if (normalizedDbData.maintenance_mode !== undefined) setIsMaintenanceMode(normalizedDbData.maintenance_mode);
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
               comparison: comparisonItems,
               maintenance_mode: isMaintenanceMode
             };
             await fetch('/api/db/init', {
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
        console.error("Failed to load DB from server:", err);
      } finally {
        setIsDbLoaded(true);
      }
    };
    fetchDb();
  }, [authToken]);

  // Custom hook to prevent syncing on the first load of isDbLoaded
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

      // Only save if the data actually changed from the previous state and user is admin
      if (isAdminAuth && JSON.stringify(previousDataRef.current) !== JSON.stringify(data)) {
        previousDataRef.current = data;
        serverSave(key, data);
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
    // Validate orderId (case-insensitive and trimmed)
    const submittedId = reviewData.orderId.trim().toUpperCase();
    const order = orders.find(o => o.id.trim().toUpperCase() === submittedId);
    if (!order) {
      return { success: false, message: `Invalid Order ID (${submittedId}). Please provide a valid Order ID.` };
    }

    // Validate if product is in that order
    const hasProduct = order.items.some(item => item.id === reviewData.productId);
    if (!hasProduct) {
      return { success: false, message: 'This product was not part of this order.' };
    }

    // Check if user already reviewed this product with this order
    const alreadyReviewed = reviews.some(r => r.orderId === reviewData.orderId && r.productId === reviewData.productId && !r.deleted);
    if (alreadyReviewed) {
      return { success: false, message: 'You have already submitted a review for this product using this Order ID.' };
    }

    const newReview: Review = {
      ...reviewData,
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
      const res = await fetch('/api/auth/login', {
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
      const res = await fetch('/api/admin/update-profile', {
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
        return [...prev, { ...product, price: priceForSize, quantity: allowedAdd, selectedSize: size, image: itemImage, cartItemId }];
      }

      return [...prev, { ...product, price: priceForSize, quantity, selectedSize: size, image: itemImage, cartItemId }];
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

    const newOrderId = `NTD-${Date.now()}${(Math.random() * 1000).toFixed(0)}`;

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
    
    setProducts(prev => [{ ...product, code, id: generateId() }, ...prev]);
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
    
    setProducts(prev => prev.map(p => p.id === product.id ? { ...product, code } : p));
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
  const deleteLookbookImage = (id: string) => {
    setLookbook(prev => prev.map(l => l.id === id ? { ...l, deleted: true } : l));
  };
  
  const moveLookbookImage = (id: string, direction: 'up' | 'down') => {
    setLookbook(prev => {
      const activeItems = prev.filter(l => !l.deleted).sort((a, b) => (a.serial || 0) - (b.serial || 0));
      const currentIndex = activeItems.findIndex(l => l.id === id);
      if (currentIndex === -1) return prev;
      
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= activeItems.length) return prev;
      
      const currentItem = activeItems[currentIndex];
      const targetItem = activeItems[targetIndex];
      
      // Swap serials
      const currentSerial = currentItem.serial;
      const targetSerial = targetItem.serial;
      
      return prev.map(l => {
        if (l.id === currentItem.id) return { ...l, serial: targetSerial };
        if (l.id === targetItem.id) return { ...l, serial: currentSerial };
        return l;
      });
    });
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

  return (
    <ShopContext.Provider value={{
      products: products.filter(p => !p.deleted), 
      orders: orders.filter(o => !o.deleted), 
      coupons: coupons.filter(c => !c.deleted), 
      cart, 
      slides: slides.filter(s => !s.deleted), 
      categoryBanners: categoryBanners.filter(b => !b.deleted), 
      lookbook: lookbook.filter(l => !l.deleted), 
      subscribers: subscribers.filter(s => !s.deleted), 
      contactMessages: contactMessages.filter(m => !m.deleted), 
      popupAds: popupAds.filter(a => !a.deleted), 
      homeAds: homeAds.filter(a => !a.deleted), 
      faqs: faqs.filter(f => !f.deleted), 
      policies: policies.filter(p => !p.deleted), 
      categories: categories.filter(c => !c.deleted),
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
      loginAdmin, logoutAdmin, updateProfile, addAdmin, updateAdmin, deleteAdmin, updateContactInfo, addProduct, updateProduct, deleteProduct,
      addSlide, updateSlide, deleteSlide, addCategoryBanner, updateCategoryBanner, deleteCategoryBanner, 
      addCategory, updateCategory, deleteCategory,
      addLookbookImage, updateLookbookImage, deleteLookbookImage, moveLookbookImage,
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
      {!showApp && <DatabaseLoader onComplete={() => setShowApp(true)} />}
      {showApp && children}
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
