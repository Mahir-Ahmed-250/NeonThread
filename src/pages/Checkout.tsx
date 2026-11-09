import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Plus, Minus, Trash2, Loader2, Download, Printer } from 'lucide-react';
import { useShop } from '../ShopContext';
import { useToast } from '../components/Toast';
import { motion } from 'motion/react';
import SuccessAnimation from '../components/SuccessAnimation';
import { Order } from '../types';
import { generateInvoicePDF, printOrderVoucher, formatOrderId } from '../lib/invoiceUtils';
import { apiUrl } from '../lib/api';

const BANGLADESH_DISTRICTS = [
  { en: 'Bagerhat', bn: 'বাগেরহাট' },
  { en: 'Bandarban', bn: 'বান্দরবান' },
  { en: 'Barguna', bn: 'বরগুনা' },
  { en: 'Barisal', bn: 'বরিশাল' },
  { en: 'Bhola', bn: 'ভোলা' },
  { en: 'Bogra', bn: 'বগুড়া' },
  { en: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া' },
  { en: 'Chandpur', bn: 'চাঁদপুর' },
  { en: 'Chittagong', bn: 'চট্টগ্রাম' },
  { en: 'Chuadanga', bn: 'চুয়াডাঙ্গা' },
  { en: 'Comilla', bn: 'কুমিল্লা' },
  { en: 'Cox\'s Bazar', bn: 'কক্সবাজার' },
  { en: 'Dhaka', bn: 'ঢাকা' },
  { en: 'Dinajpur', bn: 'ডিরাজপুর' },
  { en: 'Faridpur', bn: 'ফরিদপুর' },
  { en: 'Feni', bn: 'ফেনী' },
  { en: 'Gaibandha', bn: 'গাইবান্ধা' },
  { en: 'Gazipur', bn: 'গাজীপুর' },
  { en: 'Gopalganj', bn: 'গোপালগঞ্জ' },
  { en: 'Habiganj', bn: 'হবিগঞ্জ' },
  { en: 'Jamalpur', bn: 'জামালপুর' },
  { en: 'Jessore', bn: 'যশোর' },
  { en: 'Jhalokati', bn: 'ঝালকাঠি' },
  { en: 'Jhenaidah', bn: 'ঝিনাইদহ' },
  { en: 'Joypurhat', bn: 'জয়পুরহাট' },
  { en: 'Khagrachhari', bn: 'খাগড়াছড়ি' },
  { en: 'Khulna', bn: 'খুলনা' },
  { en: 'Kishoreganj', bn: 'কিশোরগঞ্জ' },
  { en: 'Kurigram', bn: 'কুড়িগ্রাম' },
  { en: 'Kushtia', bn: 'কুষ্টিয়া' },
  { en: 'Lakshmipur', bn: 'লক্ষ্মীপুর' },
  { en: 'Lalmonirhat', bn: 'লালমনিরহাট' },
  { en: 'Madaripur', bn: 'মাদারীপুর' },
  { en: 'Magura', bn: 'মাগুরা' },
  { en: 'Manikganj', bn: 'মানিকগঞ্জ' },
  { en: 'Meherpur', bn: 'মেহেরপুর' },
  { en: 'Moulvibazar', bn: 'মৌলভীবাজার' },
  { en: 'Munshiganj', bn: 'মুন্সীগঞ্জ' },
  { en: 'Mymensingh', bn: 'ময়মনসিংহ' },
  { en: 'Naogaon', bn: 'নওগাঁ' },
  { en: 'Narail', bn: 'নড়াইল' },
  { en: 'Narayanganj', bn: 'নারায়ণগঞ্জ' },
  { en: 'Narsingdi', bn: 'নরসিংদী' },
  { en: 'Natore', bn: 'নাটোর' },
  { en: 'Nawabganj', bn: 'নবাবগঞ্জ' },
  { en: 'Netrokona', bn: 'নেত্রকোণা' },
  { en: 'Nilphamari', bn: 'নীলফামারী' },
  { en: 'Noakhali', bn: 'নোয়াখালী' },
  { en: 'Pabna', bn: 'পাবনা' },
  { en: 'Panchagarh', bn: 'পঞ্চগড়' },
  { en: 'Patuakhali', bn: 'পটুয়াখালী' },
  { en: 'Pirojpur', bn: 'পিরোজপুর' },
  { en: 'Rajbari', bn: 'রাজবাড়ী' },
  { en: 'Rajshahi', bn: 'রাজশাহী' },
  { en: 'Rangamati', bn: 'রাঙ্গামাটি' },
  { en: 'Rangpur', bn: 'রংপুর' },
  { en: 'Satkhira', bn: 'সাতক্ষীরা' },
  { en: 'Shariatpur', bn: 'শরীয়তপুর' },
  { en: 'Sherpur', bn: 'শেরপুর' },
  { en: 'Sirajganj', bn: 'সিরাজগঞ্জ' },
  { en: 'Sunamganj', bn: 'সুনামগঞ্জ' },
  { en: 'Sylhet', bn: 'সিলেট' },
  { en: 'Tangail', bn: 'টাঙ্গাইল' },
  { en: 'Thakurgaon', bn: 'ঠাকুরগাঁও' }
];

export default function Checkout() {
  const { cart, products, coupons, placeOrder, clearCart, updateCartQuantity, updateCartQuantityById, removeFromCart, removeFromCartById, updateCartItemSize, updateCartItemSizeById } = useShop();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: 'Dhaka'
  });
  const [activeCoupon, setActiveCoupon] = useState<{code: string, discountValue: number, discountType: 'percentage' | 'amount'} | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [orderComplete, setOrderComplete] = useState<{status: boolean, order?: Order}>({status: false});
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    if (cart.length === 0 && !orderComplete.status) {
      navigate('/shop');
    }
  }, [cart.length, navigate, orderComplete.status]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = activeCoupon 
    ? (activeCoupon.discountType === 'percentage' ? (subtotal * activeCoupon.discountValue) / 100 : activeCoupon.discountValue) 
    : 0;
  const shippingCharge = formData.district === 'Dhaka' ? 70 : 120;
  const total = subtotal - discountAmount + shippingCharge;

  if (orderComplete.status && orderComplete.order) {
    const order = orderComplete.order;
    const formattedId = formatOrderId(order.id);
    return (
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 flex flex-col items-center">
        <SuccessAnimation />
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight text-center">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm md:text-base text-center">
          Thank you for your purchase. Below is your order voucher preview.
        </p>

        {/* Order Voucher Preview Card */}
        <div className="w-full bg-white text-gray-900 border-2 border-gray-900 rounded-3xl shadow-xl p-6 md:p-8 mb-8 text-left">
          {/* Voucher Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-gray-900 pb-5 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                TRENDY CART BD
              </h2>
              <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-700 px-3 py-1 rounded-md border border-gray-200">
                Order Voucher / ক্যাশ মেমো
              </span>
            </div>
            <div className="sm:text-right space-y-1">
              <div className="inline-block sm:block bg-black text-white px-3 py-1 rounded-lg font-mono text-xs md:text-sm font-black">
                Order ID: #{formattedId}
              </div>
              <p className="text-xs font-bold text-gray-500">
                Date: {new Date(order.date).toLocaleString()}
              </p>
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                Payment: Cash on Delivery
              </p>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5 mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2 mb-3">
              Customer & Delivery Information (ডেলিভারি ঠিকানা)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs md:text-sm">
              <p><span className="font-bold text-gray-500">Name:</span> <span className="font-black text-gray-900">{order.customer.name}</span></p>
              <p><span className="font-bold text-gray-500">Phone:</span> <span className="font-mono font-bold text-gray-900">{order.customer.phone}</span></p>
              <p><span className="font-bold text-gray-500">Email:</span> <span className="font-medium text-gray-800 break-all">{order.customer.email || 'N/A'}</span></p>
              <p><span className="font-bold text-gray-500">District:</span> <span className="font-bold text-gray-900">{order.customer.district || 'N/A'}</span></p>
              <p className="sm:col-span-2 leading-relaxed break-words">
                <span className="font-bold text-gray-500">Address:</span>{' '}
                <span className="font-medium text-gray-900">{order.customer.address}</span>
              </p>
            </div>
          </div>

          {/* Ordered Products Table with Images */}
          <div className="overflow-x-auto mb-6 border border-gray-200 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs md:text-sm">
                {order.items.map((item, idx) => (
                  <tr key={(item as any).cartItemId || `${item.id}-${idx}`} className="bg-white">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 uppercase text-xs md:text-sm leading-snug">
                            {item.name}
                          </p>
                          <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                            Size: <span className="text-gray-800">{item.selectedSize || 'N/A'}</span>
                            {item.code ? ` • Code: ${item.code}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-gray-700">
                      x{item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-600 whitespace-nowrap">
                      ৳{item.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-gray-900 whitespace-nowrap">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-72 bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 text-xs md:text-sm">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Subtotal:</span>
                <span className="font-bold text-gray-900">৳{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="font-bold">Discount:</span>
                  <span className="font-bold">- ৳{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Delivery Charge:</span>
                <span className="font-bold text-gray-900">৳{order.shippingCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-900 pt-2.5 mt-2 text-sm md:text-base font-black text-black">
                <span>Total Payable:</span>
                <span>৳{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* System Generated Voucher Footer */}
          <div className="border-t border-dashed border-gray-300 pt-4 text-center space-y-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-black uppercase tracking-wider text-gray-800">
              সিস্টেম জেনারেটেড ভাউচার • System Generated Voucher
            </div>
            <p className="text-[11px] text-gray-400 font-medium pt-1">
              Thank you for shopping with Trendy Cart BD! No signature is required.
            </p>
          </div>
        </div>
        
        {/* Action Buttons Below Voucher Preview */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 w-full">
          <button
            onClick={() => generateInvoicePDF(order)}
            className="bg-black text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-black/10 cursor-pointer"
          >
            <Download size={18} />
            Download Voucher (ডাউনলোড)
          </button>

          <button
            onClick={() => printOrderVoucher(order)}
            className="bg-blue-600 text-white px-7 py-3.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Printer size={18} />
            Print Voucher (প্রিন্ট)
          </button>
          
          <button
            onClick={() => navigate('/track-order')}
            className="bg-white text-black border-2 border-black px-7 py-3.5 rounded-full font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
          >
            Track Order
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-gray-500 text-sm font-bold hover:text-black dark:hover:text-white transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (cart.length === 0 && !orderComplete.status) {
    return null;
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    
    if (!couponCodeInput.trim()) return;

    const found = coupons.find(c => {
      const now = new Date();
      const isActive = c.isActive;
      const isNotExpired = !c.expiryDate || new Date(c.expiryDate) >= now;
      const isStarted = !c.startDate || new Date(c.startDate) <= now;
      return c.code.toLowerCase() === couponCodeInput.trim().toLowerCase() && isActive && isNotExpired && isStarted;
    });
    
    if (found) {
      setActiveCoupon({ code: found.code, discountValue: found.discountValue, discountType: found.discountType });
    } else {
      setCouponError('Invalid, inactive or expired coupon code.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSendingEmail(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // small delay for UI to register loader

    const customerDetails = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      district: formData.district
    };

    const result = placeOrder(customerDetails, activeCoupon?.code);

    if (result.success) {
      const newOrderObj: Order = {
        id: result.orderId!,
        customer: customerDetails,
        items: [...cart],
        subtotal,
        discount: discountAmount,
        shippingCharge,
        total,
        couponCode: activeCoupon?.code,
        date: new Date().toISOString(),
        status: 'pending'
      };

      addToast('Order placed successfully!', 'success');
      setOrderComplete({status: true, order: newOrderObj});

      // Send invoice in the background
      fetch(apiUrl('/api/send-invoice'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, order: newOrderObj })
      }).catch(err => {
        console.warn('Failed to send invoice email in background:', err);
      });
      
      setIsSendingEmail(false);
    } else {

      addToast(result.error || 'অর্ডার করতে সমস্যা হয়েছে।', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 w-full bg-gray-50 py-12 relative"
    >
      {isSendingEmail && (
        <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center mx-4 border border-gray-100">
            <Loader2 className="h-12 w-12 text-black animate-spin mb-4" />
            <h3 className="text-lg font-black uppercase text-gray-900 mb-1">প্রসেসিং হচ্ছে...</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">আপনার অর্ডারটি প্রসেস করা হচ্ছে এবং ইমেইলে ইনভয়েস পাঠানো হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।</p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Delivery Details Form */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-xl font-bold uppercase dark:text-white">Delivery Details</h2>
              <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500">GUEST</span>
            </div>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Full Name (পূর্ণ নাম)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Phone Number (মোবাইল নম্বর)</label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={formData.phone}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 11) {
                      setFormData({...formData, phone: value});
                    }
                  }}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:outline-none"
                  placeholder="e.g. 01XXXXXXXXX"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Email Address (ইমেইল এড্রেস)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:outline-none"
                  placeholder="e.g. customer@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Full Address</label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:outline-none resize-none"
                  placeholder="Street, Area, City"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Select District (জেলা নির্বাচন করুন)</label>
                <select
                  required
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:outline-none"
                >
                  {BANGLADESH_DISTRICTS.map(dist => (
                    <option key={dist.en} value={dist.en}>
                      {dist.en} / {dist.bn}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-800 flex justify-between items-center font-medium">
                  <span>Selected District: <strong className="text-gray-900 dark:text-white">{formData.district}</strong></span>
                  <span>Delivery Charge: <strong className="text-black dark:text-white text-sm">৳{shippingCharge}</strong></span>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Order Summary & Coupon */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 sticky top-24 shadow-sm h-fit">
            <h2 className="text-lg font-black uppercase mb-4 dark:text-white">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[220px] overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={(item as any).cartItemId || (item.id + (item.selectedSize || 'M') + (item.image || ''))} className="flex gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate mb-1 uppercase">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">৳{item.price}</span>
                        {item.selectedSize && (
                          <div className="relative inline-block">
                            <select
                              value={item.selectedSize || 'M'}
                              onChange={(e) => {
                                const newSize = e.target.value;
                                if ((item as any).cartItemId) {
                                  updateCartItemSizeById((item as any).cartItemId, newSize);
                                  updateCartQuantityById((item as any).cartItemId, 1);
                                } else {
                                  updateCartItemSize(item.id, item.selectedSize || 'M', newSize, item.image);
                                  updateCartQuantity(item.id, 1, newSize, item.image);
                                }
                              }}
                              className="text-[9px] font-black uppercase text-gray-550 dark:text-gray-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded px-1 py-0.5 leading-none focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                            >
                              {['S', 'M', 'L', 'XL', 'XXL', '3XL']
                                .filter(sz => {
                                  const product = products.find(p => p.id === item.id);
                                  const stock = product ? (product.sizeStocks ? product.sizeStocks[sz] : product.stock) : 0;
                                  return (stock || 0) > 0;
                                })
                                .map(sz => (
                                <option key={sz} value={sz} className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-100">
                                  Size: {sz}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900">
                          <button
                            type="button"
                            onClick={() => {
                              if ((item as any).cartItemId) {
                                updateCartQuantityById((item as any).cartItemId, item.quantity - 1);
                              } else {
                                updateCartQuantity(item.id, item.quantity - 1, item.selectedSize, item.image);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-black dark:hover:text-white focus:outline-none"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="px-1.5 text-center font-bold text-[10px] min-w-[16px] text-gray-800 dark:text-gray-200">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const stock = (products.find(p => p.id === item.id)?.sizeStocks?.[item.selectedSize || 'M'] ?? item.stock ?? 0);
                              if (item.quantity >= stock) {
                                addToast(`Sorry, this product has a maximum of ${stock} items in stock.`, 'error');
                              } else {
                                if ((item as any).cartItemId) {
                                  updateCartQuantityById((item as any).cartItemId, item.quantity + 1);
                                } else {
                                  updateCartQuantity(item.id, item.quantity + 1, item.selectedSize, item.image);
                                }
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-black dark:hover:text-white focus:outline-none"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between h-10 flex-shrink-0 pl-1">
                    <button
                      type="button"
                      onClick={() => {
                        if ((item as any).cartItemId) {
                          removeFromCartById((item as any).cartItemId);
                        } else {
                          removeFromCart(item.id, item.selectedSize, item.image);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-black text-gray-900 dark:text-white">৳{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="border-t border-b border-gray-100 dark:border-gray-800 py-6 mb-6">
              <div className="space-y-1 mb-2">
                <label className="text-[10px] font-bold uppercase text-gray-400">Coupon Code</label>
              </div>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder=""
                  value={couponCodeInput}
                  onChange={e => setCouponCodeInput(e.target.value)}
                  className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black uppercase outline-none"
                />
                <button type="submit" className="px-4 bg-gray-900 dark:bg-black dark:border dark:border-gray-700 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors">
                  Apply
                </button>
              </form>
              {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
              {activeCoupon && (
                <div className="mt-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-[10px] font-black uppercase tracking-widest p-2.5 rounded-lg border border-yellow-200 dark:border-yellow-800 flex justify-between items-center shadow-sm">
                  <span>{activeCoupon.code}</span>
                  <span>{activeCoupon.discountType === 'percentage' ? `-${activeCoupon.discountValue}%` : `-৳${activeCoupon.discountValue} FLAT`}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              {activeCoupon && (
                <div className="flex justify-between text-xs text-yellow-700 dark:text-yellow-400 font-black uppercase tracking-widest">
                  <span>Coupon Discount ({activeCoupon.discountType === 'percentage' ? `${activeCoupon.discountValue}%` : 'FLAT'})</span>
                  <span>- ৳{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Shipping ({formData.district === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span>৳{shippingCharge.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-6 text-base font-black dark:text-white">
              <span>Total Payable</span>
              <span>৳{total.toFixed(2)}</span>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSendingEmail}
              className="w-full py-4 bg-black dark:bg-white dark:text-black text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-black/10 dark:shadow-white/5 mt-6 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Place Order Now'
              )}
            </button>

          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
