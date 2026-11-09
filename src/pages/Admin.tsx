import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie, Legend } from 'recharts';
import { useShop } from '../ShopContext';
import { Package, ShoppingBag, Ticket, Trash2, Plus, Minus, Edit, LogOut, Layout, Image, Camera, X, Users, Mail, MonitorPlay, Printer, HelpCircle, ShieldCheck, ShieldAlert, Ruler, ShoppingBasket, Home, TrendingUp, DollarSign, PackageCheck, UserCircle, Settings, Megaphone, MessageSquare, Search, Calendar, MapPin, Truck, CheckCircle, XCircle, Download, Clock, Bell, Key, History, Loader2, Star, Tag, Layers, Check, Phone, Facebook, Instagram, Youtube, Twitter, Music2, Share2, UploadCloud, Eye, EyeOff, Grid, ArrowLeft, ArrowRight, Save, RotateCcw } from 'lucide-react';
import { Product, ProductImageVariant, Category, PopupAd, FAQItem, PolicyItem, HomeAd, AdminUser, LookbookImage, CategoryBanner, Coupon, Order, AdminPermissions, Review, Announcement, SocialLink, CartItem } from '../types';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { compressImage, fileToBase64 } from '../lib/imageUtils';
import { formatOrderId } from '../lib/invoiceUtils';
import { apiUrl } from '../lib/api';

const SummaryCard = ({ title, count, icon: Icon, alert }: { title: string, count: number, icon: any, alert?: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
    <div className="p-3 bg-gray-50 rounded-2xl">
      <Icon className="h-6 w-6 text-gray-900" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{title}</p>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-black">{count}</p>
        {alert}
      </div>
    </div>
  </div>
);

// Helper for DD/MM/YYYY
const formatDate = (date: string | number | Date) => new Date(date).toLocaleDateString('en-GB');
const formatTime = (date: string | number | Date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const LOOKBOOK_GRID_PRESETS = [
  {
    id: 'col-span-1 row-span-1',
    label: 'Standard Square (1 Col × 1 Row)',
    badge: '1x1 Standard',
    desc: 'Compact square card (default grid size)'
  },
  {
    id: 'col-span-1 md:row-span-2 min-h-[360px]',
    label: 'Tall Portrait (1 Col × 2 Rows)',
    badge: '1x2 Portrait',
    desc: 'Vertical fashion model portrait spanning 2 rows'
  },
  {
    id: 'col-span-2 row-span-1',
    label: 'Wide Banner (2 Cols × 1 Row)',
    badge: '2x1 Wide',
    desc: 'Horizontal wide card spanning 2 columns'
  },
  {
    id: 'col-span-2 md:col-span-2 md:row-span-2 min-h-[360px]',
    label: 'Large Feature Hero (2 Cols × 2 Rows)',
    badge: '2x2 Large Hero',
    desc: 'Large highlight card spanning 2 columns & 2 rows'
  },
  {
    id: 'col-span-2 md:col-span-3 row-span-1',
    label: 'Triple Width Banner (3 Cols × 1 Row)',
    badge: '3x1 Triple',
    desc: 'Extra wide horizontal card across 3 columns'
  },
  {
    id: 'col-span-2 md:col-span-4 row-span-1 min-h-[260px]',
    label: 'Full Width Showcase (4 Cols / 100% Width)',
    badge: '4x1 Full Width',
    desc: 'Full-width banner card spanning the entire row'
  },
  {
    id: 'col-span-1 md:row-span-3 min-h-[440px]',
    label: 'Ultra Tall Editorial (1 Col × 3 Rows)',
    badge: '1x3 Editorial',
    desc: 'Editorial vertical fashion drop spanning 3 rows'
  },
  {
    id: 'col-span-1 row-span-1 min-h-[290px]',
    label: 'Medium Elongated (1 Col × Height 290px)',
    badge: '1x1 Medium',
    desc: 'Single column with extra vertical height'
  }
];

const getLookbookPresetBadge = (className?: string) => {
  const match = LOOKBOOK_GRID_PRESETS.find(p => p.id === className);
  if (match) return match.badge;
  if (!className || className === 'col-span-1 row-span-1') return '1x1 Standard';
  if (className.includes('row-span-2') && className.includes('col-span-1')) return '1x2 Portrait';
  if (className.includes('col-span-2') && className.includes('row-span-2')) return '2x2 Large Hero';
  if (className.includes('col-span-2') && className.includes('row-span-1')) return '2x1 Wide';
  if (className.includes('col-span-3')) return '3x1 Triple';
  if (className.includes('col-span-4')) return '4x1 Full Width';
  if (className.includes('row-span-3')) return '1x3 Editorial';
  return 'Custom';
};

const WhatsAppIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .014 5.398 0 12.037c0 2.125.556 4.2 1.611 6.037l-1.711 6.251 6.391-1.677a11.845 11.845 0 005.759 1.484h.005c6.637 0 12.036-5.398 12.037-12.039a11.75 11.75 0 00-3.526-8.383z"/>
  </svg>
);

const XIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z"/>
  </svg>
);

function AdminSocialLinksView() {
  const { socialLinks, updateSocialLinks } = useShop();
  const [links, setLinks] = useState(socialLinks);

  useEffect(() => {
    setLinks(socialLinks);
  }, [socialLinks]);

  const handleToggle = (id: string) => {
    const newLinks = links.map(link => link.id === id ? { ...link, isActive: !link.isActive } : link);
    setLinks(newLinks);
    updateSocialLinks(newLinks);
  };

  const handleUrlChange = (id: string, url: string) => {
    const newLinks = links.map(link => link.id === id ? { ...link, url } : link);
    setLinks(newLinks);
    updateSocialLinks(newLinks);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Social Media Links</h1>
          <p className="text-xs text-gray-500 font-medium"></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link) => (
          <div key={link.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${link.isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                   {link.platform === 'facebook' && <Facebook size={20} />}
                   {link.platform === 'instagram' && <Instagram size={20} />}
                   {link.platform === 'whatsapp' && <WhatsAppIcon size={20} />}
                   {link.platform === 'tiktok' && <Music2 size={20} />}
                   {link.platform === 'youtube' && <Youtube size={20} />}
                   {link.platform === 'x' && <XIcon size={20} />}
                </div>
                <span className="font-bold uppercase text-xs tracking-widest">{link.platform}</span>
              </div>
              <button
                onClick={() => handleToggle(link.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${link.isActive ? 'bg-black' : 'bg-gray-200'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${link.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL / Link</label>
              <input 
                type="text" 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder={`Enter ${link.platform} profile link...`}
                value={link.url}
                onChange={(e) => handleUrlChange(link.id, e.target.value)}
                disabled={!link.isActive}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSettingsView() {
  const { isMaintenanceMode, setMaintenanceMode } = useShop();

  const handleToggle = () => {
    setMaintenanceMode(!isMaintenanceMode);
    Swal.fire({
      icon: 'success',
      title: !isMaintenanceMode ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
      text: !isMaintenanceMode 
        ? 'Your website is now in maintenance mode. Only admins can access it.' 
        : 'Your website is now live.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tight">Global Settings</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <h3 className="font-bold text-lg text-black">Maintenance Mode</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Take the website offline for visitors while you make updates. Only you and other admins can access the site.</p>
          </div>
          <button 
            onClick={handleToggle}
            className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-opacity-75 ${isMaintenanceMode ? 'bg-amber-500' : 'bg-gray-200'}`}
          >
            <span className="sr-only">Toggle Maintenance Mode</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isMaintenanceMode ? 'translate-x-8' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminContactInfoView() {
  const { contactInfo, updateContactInfo } = useShop();
  const [formData, setFormData] = useState({
    storeAddress: contactInfo?.storeAddress || '',
    storeAddressSubtitle: contactInfo?.storeAddressSubtitle || '',
    phone: contactInfo?.phone || '',
    phoneSubtitle: contactInfo?.phoneSubtitle || '',
    email: contactInfo?.email || '',
    emailSubtitle: contactInfo?.emailSubtitle || ''
  });

  useEffect(() => {
    if (contactInfo) {
      setFormData({
        storeAddress: contactInfo.storeAddress || '',
        storeAddressSubtitle: contactInfo.storeAddressSubtitle || '',
        phone: contactInfo.phone || '',
        phoneSubtitle: contactInfo.phoneSubtitle || '',
        email: contactInfo.email || '',
        emailSubtitle: contactInfo.emailSubtitle || ''
      });
    }
  }, [contactInfo]);

  const handleSave = () => {
    updateContactInfo(formData);
    Swal.fire('Updated!', 'Contact info updated successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tight">Contact Page Info</h1>
        <button onClick={handleSave} className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
          Save Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold border-b border-gray-100 pb-2">Store Address</h3>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
              <input type="text" value={formData.storeAddress} onChange={e => setFormData({...formData, storeAddress: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none" placeholder="e.g. Our Store(Dhaka)" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Subtitle / Address Details</label>
              <textarea rows={3} value={formData.storeAddressSubtitle} onChange={e => setFormData({...formData, storeAddressSubtitle: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none" placeholder="e.g. Dhaka Uddan&#10;Dhaka, Bangladesh" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold border-b border-gray-100 pb-2">Phone / WhatsApp</h3>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none" placeholder="e.g. +8801515668345" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Subtitle / Availability</label>
              <input type="text" value={formData.phoneSubtitle} onChange={e => setFormData({...formData, phoneSubtitle: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none" placeholder="e.g. Saturday-Sunday, 9am - 8pm" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold border-b border-gray-100 pb-2">Email</h3>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none" placeholder="e.g. support@trendycartbd.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Subtitle</label>
              <input type="text" value={formData.emailSubtitle} onChange={e => setFormData({...formData, emailSubtitle: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none" placeholder="e.g. We typically reply within 24 hours" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function AdminAnnouncementsView() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    text: '',
    link: '',
    isActive: true,
    isMarquee: false,
    startDate: '',
    endDate: '',
    backgroundColor: '#000000',
    textColor: '#ffffff'
  });

  const resetForm = () => {
    setFormData({
      text: '',
      link: '',
      isActive: true,
      isMarquee: false,
      startDate: '',
      endDate: '',
      backgroundColor: '#000000',
      textColor: '#ffffff'
    });
    setEditingAnnouncement(null);
    setIsModalOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setFormData({
      text: ann.text || '',
      link: ann.link || '',
      isActive: ann.isActive !== false,
      isMarquee: Boolean(ann.isMarquee),
      startDate: ann.startDate || '',
      endDate: ann.endDate || '',
      backgroundColor: ann.backgroundColor || '#000000',
      textColor: ann.textColor || '#ffffff'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      Swal.fire('Error', 'অনুগ্রহ করে অ্যানাউন্সমেন্ট টেক্সট লিখুন।', 'error');
      return;
    }

    if (editingAnnouncement) {
      updateAnnouncement({ ...editingAnnouncement, ...formData, text: formData.text.trim(), link: formData.link.trim() });
      Swal.fire('Updated!', 'Announcement updated successfully.', 'success');
    } else {
      addAnnouncement({ ...formData, text: formData.text.trim(), link: formData.link.trim() });
      Swal.fire('Added!', 'New announcement created successfully.', 'success');
    }
    resetForm();
  };

  const handleToggleStatus = (ann: Announcement) => {
    updateAnnouncement({ ...ann, isActive: !ann.isActive });
  };

  const COLOR_PRESETS = [
    { label: 'Black', bg: '#000000', text: '#ffffff' },
    { label: 'Crimson', bg: '#dc2626', text: '#ffffff' },
    { label: 'Amber', bg: '#d97706', text: '#000000' },
    { label: 'Emerald', bg: '#059669', text: '#ffffff' },
    { label: 'Indigo', bg: '#4f46e5', text: '#ffffff' },
    { label: 'Dark Slate', bg: '#1e293b', text: '#facc15' },
  ];

  const filteredAnnouncements = announcements.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (a.text && a.text.toLowerCase().includes(q)) || (a.link && a.link.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-black" /> Manage Announcements
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
            ওয়েবসাইটের টপ বারে নোটিশ, প্রচার বা স্পেশাল অফার প্রদর্শন ও মডালের মাধ্যমে নিয়ন্ত্রণ করুন
          </p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-black/10 hover:bg-gray-800 transition-all active:scale-95"
        >
          <Plus size={14} className="stroke-[3]" /> Create New Announcement
        </button>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="অ্যানাউন্সমেন্ট খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 self-end sm:self-center">
          <span className="px-3 py-1 bg-gray-100 rounded-lg">Total: {announcements.length}</span>
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg">Active: {announcements.filter(a => a.isActive).length}</span>
        </div>
      </div>

      {/* Announcements Modal (Create / Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={resetForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-2xl w-full max-w-2xl space-y-6 relative overflow-hidden my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-black"></div>
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base md:text-lg font-black uppercase tracking-widest text-gray-900 flex items-center gap-2.5">
                    <div className="w-2 h-5 bg-black rounded-full"></div>
                    {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                  </h3>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 ml-4">
                    {editingAnnouncement
                      ? 'অ্যানাউন্সমেন্ট টেক্সট, সময়সূচী বা ডিজাইন মডাল থেকে পরিবর্তন করুন'
                      : 'নতুন নোটিশ বা অফার তৈরি করে ওয়েবসাইটের শীর্ষে প্রদর্শন করুন'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Live Preview Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Live Preview (লাইভ প্রিভিউ)
                  </label>
                  {formData.isMarquee && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      Marquee Enabled
                    </span>
                  )}
                </div>
                <div 
                  className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold transition-all shadow-inner overflow-hidden border border-black/10"
                  style={{
                    backgroundColor: formData.backgroundColor || '#000000',
                    color: formData.textColor || '#ffffff'
                  }}
                >
                  {formData.isMarquee ? (
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="inline-block animate-pulse">📢 {formData.text || 'আপনার অ্যানাউন্সমেন্ট টেক্সট এখানে দেখাবে...'}</span>
                    </div>
                  ) : (
                    <span>📢 {formData.text || 'আপনার অ্যানাউন্সমেন্ট টেক্সট এখানে দেখাবে...'}</span>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    Announcement Text (ঘোষণা টেক্সট) <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    required
                    rows={2}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm font-medium bg-gray-50/50 focus:bg-white resize-none"
                    placeholder="যেমন- Special Offer: Free delivery on orders over ৳1500!"
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    Destination Link (ক্লিক করলে কোথায় যাবে - ঐচ্ছিক)
                  </label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm font-medium bg-gray-50/50 focus:bg-white"
                    placeholder="যেমন- /shop বা /product/p1 বা https://..."
                    value={formData.link}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    Start Date & Time (শুরুর সময় - ঐচ্ছিক)
                  </label>
                  <input 
                    type="datetime-local" 
                    className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-xs font-medium bg-gray-50/50 focus:bg-white"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    End Date & Time (শেষের সময় - ঐচ্ছিক)
                  </label>
                  <input 
                    type="datetime-local" 
                    className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-xs font-medium bg-gray-50/50 focus:bg-white"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>

                {/* Color Presets */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    Quick Color Presets (কালার প্যালেট)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, backgroundColor: preset.bg, textColor: preset.text })}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-2 hover:border-black transition-colors"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: preset.bg }}></span>
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      className="h-10 w-12 border-none rounded-xl cursor-pointer p-0 bg-transparent"
                      value={formData.backgroundColor}
                      onChange={e => setFormData({ ...formData, backgroundColor: e.target.value })}
                    />
                    <input 
                      type="text"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
                      value={formData.backgroundColor}
                      onChange={e => setFormData({ ...formData, backgroundColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      className="h-10 w-12 border-none rounded-xl cursor-pointer p-0 bg-transparent"
                      value={formData.textColor}
                      onChange={e => setFormData({ ...formData, textColor: e.target.value })}
                    />
                    <input 
                      type="text"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:outline-none"
                      value={formData.textColor}
                      onChange={e => setFormData({ ...formData, textColor: e.target.value })}
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive} 
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                      className="w-4 h-4 text-black focus:ring-black rounded" 
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Active (সক্রিয়)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={formData.isMarquee} 
                      onChange={e => setFormData({ ...formData, isMarquee: e.target.checked })} 
                      className="w-4 h-4 text-black focus:ring-black rounded" 
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Marquee Effect (স্ক্রোলিং টেক্সট)</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-gray-800 transition-all active:scale-95"
                  >
                    {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Content</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Styles</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAnnouncements.map(ann => (
                <tr key={ann.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="space-y-1 max-w-md">
                      <p className="font-bold text-sm text-gray-900">{ann.text}</p>
                      {ann.link && (
                        <p className="text-[10px] font-mono text-gray-400 inline-block bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          🔗 {ann.link}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {ann.startDate || ann.endDate ? (
                      <div className="space-y-1 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                        {ann.startDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={11} className="text-gray-400" /> 
                            Start: {new Date(ann.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        )}
                        {ann.endDate && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-gray-400" /> 
                            End: {new Date(ann.endDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Always Visible</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                        style={{ backgroundColor: ann.backgroundColor || '#000000', color: ann.textColor || '#ffffff' }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ann.textColor || '#ffffff' }}></span>
                        Sample
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(ann)}
                        title="Click to toggle status"
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit transition-all ${
                          ann.isActive 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {ann.isActive ? 'Active' : 'Inactive'}
                      </button>
                      {ann.isMarquee && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit bg-purple-100 text-purple-700">
                          Marquee
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(ann)}
                        title="Edit Announcement via Modal"
                        className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={async () => {
                          const res = await Swal.fire({
                            title: 'Delete Announcement?',
                            text: "This action cannot be undone.",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#000',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Delete'
                          });
                          if (res.isConfirmed) {
                            deleteAnnouncement(ann.id);
                            Swal.fire('Deleted!', '', 'success');
                          }
                        }}
                        title="Delete Announcement"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAnnouncements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                    {searchQuery ? 'কোনো অ্যানাউন্সমেন্ট খুঁজে পাওয়া যায়নি।' : 'No announcements found. Add one to show at the top of the site.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminCategoriesView() {
    const { categories, addCategory, updateCategory, deleteCategory } = useShop();
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCat, setNewCat] = useState({ name: '', slug: '', subCategories: [] as string[] });
    const [subInput, setSubInput] = useState('');

    const resetForm = () => {
      setNewCat({ name: '', slug: '', subCategories: [] });
      setSubInput('');
      setEditingCategory(null);
      setIsAdding(false);
    };

    const handleAddSubCat = () => {
      const trimmed = subInput.trim();
      if (!trimmed) return;
      const items = trimmed.split(',').map(s => s.trim()).filter(Boolean);
      const unique = Array.from(new Set([...(newCat.subCategories || []), ...items]));
      setNewCat({ ...newCat, subCategories: unique });
      setSubInput('');
    };

    const handleRemoveSubCat = (subToRemove: string) => {
      setNewCat({
        ...newCat,
        subCategories: (newCat.subCategories || []).filter(s => s !== subToRemove)
      });
    };

    const handleSave = () => {
      if (!newCat.name.trim()) return;
      const slug = newCat.slug.trim() || newCat.name.trim().toLowerCase().replace(/\s+/g, '-');
      let finalSubCats = [...(newCat.subCategories || [])];
      if (subInput.trim()) {
        const extra = subInput.split(',').map(s => s.trim()).filter(Boolean);
        finalSubCats = Array.from(new Set([...finalSubCats, ...extra]));
      }
      
      if (editingCategory) {
        updateCategory({ ...editingCategory, name: newCat.name.trim(), slug, subCategories: finalSubCats });
        Swal.fire('Updated!', 'Category updated successfully.', 'success');
      } else {
        addCategory({ name: newCat.name.trim(), slug, subCategories: finalSubCats });
        Swal.fire('Added!', 'New category added successfully.', 'success');
      }
      resetForm();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">Manage Categories & Sub-Categories</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">ক্যাটাগরি এবং তার অধীনে থাকা সাব-ক্যাটাগরি ম্যানেজ করুন</p>
          </div>
          <button 
            onClick={() => {
              setEditingCategory(null);
              setNewCat({ name: '', slug: '', subCategories: [] });
              setSubInput('');
              setIsAdding(true);
            }}
            className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-black/10 hover:bg-gray-800 transition-all active:scale-95"
          >
            <Plus size={14} className="stroke-[3]" /> Create New Category
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
              onClick={resetForm}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={e => e.stopPropagation()}
                className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-2xl w-full max-w-2xl space-y-6 relative overflow-hidden my-8 max-h-[88vh] overflow-y-auto"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-black"></div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-black uppercase tracking-widest text-gray-900 flex items-center gap-2.5">
                      <div className="w-2 h-5 bg-black rounded-full"></div>
                      {editingCategory ? 'Edit Category & Sub-Categories' : 'Create New Category'}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400 mt-1 ml-4">
                      {editingCategory
                        ? 'ক্যাটাগরির নাম, স্ল্যাগ এবং সাব-ক্যাটাগরি পরিবর্তন করুন'
                        : 'নতুন ক্যাটাগরি এবং তার অধীনে সাব-ক্যাটাগরি তৈরি করুন'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                    title="Close Modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSave();
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category Name (নাম)</label>
                      <input 
                        type="text" 
                        required
                        autoFocus
                        value={newCat.name}
                        onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                        placeholder="e.g. Premium T-Shirts"
                        className="w-full text-xs font-bold border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-gray-50/50 focus:bg-white transition-all placeholder:text-gray-300" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Slug (ঐচ্ছিক স্ল্যাগ)</label>
                      <input 
                        type="text" 
                        value={newCat.slug}
                        onChange={e => setNewCat({ ...newCat, slug: e.target.value })}
                        placeholder="e.g. premium-tshirts"
                        className="w-full text-xs font-bold border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-gray-50/50 focus:bg-white transition-all placeholder:text-gray-300" 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sub-Categories (সাব-ক্যাটাগরি যোগ করুন)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={subInput}
                          onChange={e => setSubInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubCat();
                            }
                          }}
                          placeholder="সাব-ক্যাটাগরির নাম লিখুন (যেমন: Drop Shoulder, Polo, Half Sleeve) এবং Add বাটনে ক্লিক করুন..."
                          className="flex-1 text-xs font-bold border border-gray-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-gray-50/50 focus:bg-white transition-all placeholder:text-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleAddSubCat}
                          className="bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-1.5"
                        >
                          <Plus size={14} /> Add Sub-Category
                        </button>
                      </div>
                      {(newCat.subCategories || []).length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          {(newCat.subCategories || []).map(sub => (
                            <span
                              key={sub}
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-gray-900 rounded-xl text-xs font-bold border border-gray-200 shadow-sm"
                            >
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSubCat(sub)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Remove Sub-Category"
                              >
                                <X size={13} />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] font-medium text-gray-400 ml-1">
                          এখনও কোনো সাব-ক্যাটাগরি যোগ করা হয়নি। কমা (,) দিয়ে একসাথে একাধিক সাব-ক্যাটাগরি যোগ করতে পারবেন।
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-black text-white px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-black/20 transition-all active:scale-95 hover:bg-gray-800"
                    >
                      {editingCategory ? 'Update Category' : 'Save Category'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 pl-10 font-black uppercase text-[10px] text-gray-400 tracking-widest">Category Name</th>
                <th className="p-5 font-black uppercase text-[10px] text-gray-400 tracking-widest">Sub-Categories</th>
                <th className="p-5 font-black uppercase text-[10px] text-gray-400 tracking-widest">URL Slug</th>
                <th className="p-5 font-black uppercase text-[10px] text-gray-400 tracking-widest text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-gray-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black uppercase tracking-widest text-xs text-gray-900">No categories found</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">শুরু করতে নতুন ক্যাটাগরি যোগ করুন।</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="group hover:bg-gray-50/30 transition-colors">
                    <td className="p-5 pl-10">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="font-black text-xs text-gray-900 uppercase tracking-tight">{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      {(cat.subCategories && cat.subCategories.length > 0) ? (
                        <div className="flex flex-wrap gap-1.5">
                          {cat.subCategories.map(sub => (
                            <span key={sub} className="px-2.5 py-1 text-[10px] font-bold uppercase bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                              {sub}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase">No Sub-Categories</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 font-mono text-[9px] font-black uppercase text-gray-400 bg-gray-50 border border-gray-100 rounded-lg group-hover:bg-white transition-colors">
                        /shop?category={cat.slug}
                      </span>
                    </td>
                    <td className="p-5 text-right pr-10">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setEditingCategory(cat);
                            setNewCat({ name: cat.name, slug: cat.slug, subCategories: cat.subCategories || [] });
                            setSubInput('');
                            setIsAdding(true);
                          }}
                          className="p-2.5 text-gray-400 hover:text-black hover:bg-white hover:shadow-lg hover:shadow-black/5 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit size={16} className="stroke-[2.5]" />
                        </button>
                        <button 
                          onClick={() => {
                            Swal.fire({
                              title: 'Are you sure?',
                              text: "এটি ডিলিট করলে এর অধীনে থাকা প্রোডাক্টগুলো ক্যাটাগরিহীন হয়ে যাবে।",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#000',
                              cancelButtonColor: '#ff4b4b',
                              confirmButtonText: 'Delete Permanently',
                              cancelButtonText: 'Cancel',
                              background: '#fff',
                              customClass: {
                                title: 'font-black uppercase tracking-tight text-xl',
                                confirmButton: 'font-black uppercase tracking-widest text-[10px] px-8 py-3 rounded-xl shadow-xl shadow-red-500/10',
                                cancelButton: 'font-black uppercase tracking-widest text-[10px] px-8 py-3 rounded-xl'
                              }
                            }).then((result) => {
                              if (result.isConfirmed) {
                                deleteCategory(cat.id);
                                Swal.fire({
                                  title: 'Deleted!',
                                  text: 'ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে।',
                                  icon: 'success',
                                  confirmButtonColor: '#000'
                                });
                              }
                            });
                          }}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

function AdminOTPView() {
  const { otps, deleteOTP, currentAdmin } = useShop();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOtps = (otps || []).filter(o => {
    const phoneStr = String(o.phone || '');
    const emailStr = String(o.email || '').toLowerCase();
    const otpStr = String(o.otp || '');
    return phoneStr.includes(searchQuery) || 
           emailStr.includes(searchQuery.toLowerCase()) || 
           otpStr.includes(searchQuery);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Track Order OTPs</h1>
         
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="ইমেইল, নম্বর বা OTP দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-black"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Email / Phone</th>
                <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">OTP Code</th>
                <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Sent Date / Time</th>
                <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Status / Verification</th>
                <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOtps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                    No OTP records found
                  </td>
                </tr>
              ) : (
                filteredOtps.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      {record.email ? (
                        <span className="font-semibold text-gray-950 font-sans border-b border-dashed border-gray-200 pb-0.5" title="Email OTP">{record.email}</span>
                      ) : (
                        <span className="font-mono font-bold text-gray-700 bg-gray-50 py-1 px-2 rounded-lg" title="Phone OTP">+88{record.phone}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-blue-50 text-blue-700 font-mono font-black text-base px-3 py-1 rounded-xl border border-blue-100 tracking-widest">
                        {record.otp}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-500 font-bold leading-relaxed">
                        <div>{new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[10px] text-gray-400 font-medium uppercase">{new Date(record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {record.verified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle className="h-3 w-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <Clock className="h-3 w-3" /> PENDING CODE USE
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: 'Are you sure?',
                            text: 'This will delete this OTP record permanently!',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Yes, delete it!'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              deleteOTP(record.id);
                              Swal.fire('Deleted!', 'OTP request has been deleted.', 'success');
                            }
                          });
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                        title="Delete OTP"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminReviewsView() {
  const { reviews, products, updateReviewStatus, deleteReview } = useShop();
  console.log('Reviews:', reviews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Review['status']>('all');

  const filteredReviews = reviews.filter(r => {
    const product = products.find(p => p.id === r.productId);
    const productName = product ? product.name.toLowerCase() : '';
    
    const matchesSearch = 
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase()) ||
      formatOrderId(r.orderId).toLowerCase().includes(search.toLowerCase()) ||
      productName.includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteReview(id);
        Swal.fire('Deleted!', 'Review has been deleted.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-gray-900 tracking-tight flex items-center gap-2">
            Product Reviews Management
          </h1>
          <p className="text-xs text-gray-500 font-medium"></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, comment or order ID..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-black outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-black outline-none"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All Status (সব স্ট্যাটাস)</option>
          <option value="pending">Pending Approval (অপেক্ষমান)</option>
          <option value="approved">Approved (অনুমোদিত)</option>
          <option value="hidden">Hidden (লুকানো)</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest pl-6">Customer / Order</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">Product</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">Feedback</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">Status</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold uppercase tracking-widest text-xs">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 italic">No reviews found matching the criteria.</td>
                </tr>
              ) : (
                filteredReviews.map(review => {
                  const product = products.find(p => p.id === review.productId);
                  return (
                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex flex-col">
                          <span className="text-gray-900">{review.userName}</span>
                          <span className="text-[10px] text-indigo-500 font-black">{formatOrderId(review.orderId)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {product ? (
                          <div className="flex items-center gap-2">
                             {product.image && <img src={product.image} className="w-8 h-8 rounded-lg object-cover" alt="" />}
                             <span className="max-w-[150px] truncate">{product.name}</span>
                          </div>
                        ) : 'Unknown Product'}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={10} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-500 normal-case italic line-clamp-2">"{review.comment}"</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] ${
                          review.status === 'approved' ? 'bg-green-50 text-green-600' : 
                          review.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {review.status !== 'approved' && (
                            <button 
                              onClick={() => updateReviewStatus(review.id, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve Review"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {review.status === 'approved' && (
                            <button 
                              onClick={() => updateReviewStatus(review.id, 'hidden')}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Hide Review"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(review.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const getOrderTotals = (order: any) => {
  // Extract and normalize shipping charge
  let actualShipping = 120; // Default fallback
  
  // Try to determine the shipping charge based on order.shippingCharge
  if (order.shippingCharge !== undefined && order.shippingCharge !== null) {
    const parsed = Number(order.shippingCharge);
    if (!isNaN(parsed)) {
      actualShipping = parsed;
    }
  } else {
    // Determine default shipping based on district
    const districtStr = (order.customer?.district || '').trim().toLowerCase();
    const addressStr = (order.customer?.address || '').trim().toLowerCase();
    const isDhaka = districtStr.includes('dhaka') || addressStr.includes('dhaka');
    actualShipping = isDhaka ? 70 : 120;
  }
  
  // Calculate actual total payable securely
  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const actualTotalPayable = subtotal - discount + actualShipping;
  
  return { actualShipping, actualTotalPayable };
};

function AdminPriceAnalysisView() {
  const { products, categories } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  const analysisSubCategories = React.useMemo(() => {
    if (selectedCategory === 'all') return [];
    const catObj = categories.find(c => c.name === selectedCategory);
    const fromCat = catObj?.subCategories || [];
    const fromProds = products.filter(p => p.category === selectedCategory && p.subCategory).map(p => p.subCategory as string);
    return Array.from(new Set([...fromCat, ...fromProds])).filter(Boolean);
  }, [selectedCategory, categories, products]);

  const filteredProducts = products.filter(p => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) || 
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.variantCodes && p.variantCodes.some(vc => vc.toLowerCase().includes(q))) ||
      (p.imageVariants && p.imageVariants.some(v => (v.code && v.code.toLowerCase().includes(q)) || (v.title && v.title.toLowerCase().includes(q))));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSubCategory = selectedSubCategory === 'all' || p.subCategory === selectedSubCategory;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  const totalCostValue = filteredProducts.reduce((acc, p) => acc + ((p.costPrice || 0) * (p.stock || 0)), 0);
  const totalRetailValue = filteredProducts.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
  const potentialProfit = totalRetailValue - totalCostValue;
  const averageMargin = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Product Price Analysis</h1>
          <p className="text-xs text-gray-500 font-medium">Analyze cost prices, profit margins, and inventory value.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-xl">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Inventory Cost</span>
          </div>
          <p className="text-2xl font-black">৳{totalCostValue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Potential Revenue</span>
          </div>
          <p className="text-2xl font-black">৳{totalRetailValue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Potential Profit</span>
          </div>
          <p className="text-2xl font-black text-green-600">৳{potentialProfit.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Profit Margin</span>
          </div>
          <p className="text-2xl font-black">{averageMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Search product by name or code..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-1 focus:ring-black focus:outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none appearance-none cursor-pointer pr-10"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubCategory('all');
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        {selectedCategory !== 'all' && analysisSubCategories.length > 0 && (
          <select
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none appearance-none cursor-pointer pr-10"
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
          >
            <option value="all">All Sub-Categories</option>
            {analysisSubCategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        )}
      </div>

      {/* Product Analysis Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">Product Info</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-center">Cost Price</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-center">Selling Price</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-center">Margin (৳)</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-center">Margin (%)</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-center">Stock</th>
                <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-right">Potential Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => {
                const cost = product.costPrice || 0;
                const selling = product.price;
                const profitPerUnit = selling - cost;
                const marginPercent = selling > 0 ? (profitPerUnit / selling) * 100 : 0;
                const totalPotentialProfit = profitPerUnit * (product.stock || 0);

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">No img</div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{product.name}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{product.code || 'NO-CODE'}</p>
                          {(product.variantCodes && product.variantCodes.length > 0) && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.variantCodes.map((vc, vIdx) => (
                                <span key={vIdx} className="text-[8px] font-mono font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                  {vc}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-gray-600">৳{cost}</td>
                    <td className="p-4 text-center font-bold text-gray-900">৳{selling}</td>
                    <td className="p-4 text-center font-bold text-green-600">৳{profitPerUnit}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        marginPercent > 40 ? 'bg-green-100 text-green-700' : 
                        marginPercent > 20 ? 'bg-blue-100 text-blue-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {marginPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-gray-500">{product.stock}</td>
                    <td className="p-4 text-right">
                      <p className="text-sm font-black text-gray-900">৳{totalPotentialProfit.toLocaleString()}</p>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Package className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">No products found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    uri_configured: boolean;
    database: string;
    collection: string;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    fetch(apiUrl('/api/db/status'))
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(err => console.warn('Could not fetch db status:', err));
  }, []);
  const { products, reviews, updateReviewStatus, deleteReview, orders, coupons, slides, updateSlide, categoryBanners, updateCategoryBanner, lookbook, subscribers, contactMessages, popupAds, homeAds, faqs, policies, categories, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, updateProductSerials, deleteProduct, updateOrderStatus, updateOrderNotes, updateOrder, deleteOrder, addCoupon, updateCoupon, deleteCoupon, addSlide, deleteSlide, addCategoryBanner, deleteCategoryBanner, addLookbookImage, updateLookbookImage, updateLookbookList, deleteLookbookImage, deleteSubscriber, deleteContactMessage, addPopupAd, deletePopupAd, updatePopupAd, addHomeAd, deleteHomeAd, updateHomeAd, addFAQ, updateFAQ, deleteFAQ, addPolicy, updatePolicy, deletePolicy, isAdminAuth, loginAdmin, logoutAdmin, updateProfile, currentAdmin, admins, addAdmin, updateAdmin, deleteAdmin } = useShop();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'shop' | 'collection' | 'orders' | 'coupons' | 'slides' | 'categories' | 'lookbook' | 'subscribers' | 'messages' | 'ads' | 'faqs' | 'policies' | 'admins' | 'profile' | 'reviews' | 'activities' | 'otps' | 'contactinfo' | 'settings' | 'socials' | 'analysis' | 'categoriesBanner' | 'announcements'>('dashboard');
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [newFAQ, setNewFAQ] = useState<Omit<FAQItem, 'id'>>({ question: '', answer: '' });

  // Date range picker states
  const [chartTimeframe, setChartTimeframe] = useState<'this-month' | 'last-30-days' | 'custom'>('last-30-days');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Order internal notes state
  const [orderNotes, setOrderNotes] = useState('');

  // Notification states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'orders' | 'stock' | 'reviews'>('orders');
  const [readOrderIds, setReadOrderIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_read_order_ids') || '[]');
    } catch (_) {
      return [];
    }
  });

  const [readReviewIds, setReadReviewIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_read_review_ids') || '[]');
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_read_order_ids', JSON.stringify(readOrderIds));
    } catch (e) {
      console.warn('Failed to save read order IDs', e);
    }
  }, [readOrderIds]);

  useEffect(() => {
    try {
      localStorage.setItem('admin_read_review_ids', JSON.stringify(readReviewIds));
    } catch (e) {
      console.warn('Failed to save read review IDs', e);
    }
  }, [readReviewIds]);

  const changeTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close sidebar on mobile/tablet when tab changes
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    
    // Reset order search and filters when switching tabs to ensure freshness
    setOrderSearchQuery('');
    setAppliedOrderQuery('');
    setOrderDateRange('');
    setAppliedOrderDateRange('');
    setOrderDateFilter('all');
    setAppliedOrderDateFilter('all');
    setOrderStatusFilter('all');
    setAppliedOrderStatusFilter('all');
    setOrdersPage(1);
    setIsSearchingOrders(false);
  };
  const today = new Date().toDateString();
  const todaysNewOrders = orders.filter(o => new Date(o.date).toDateString() === today).length;
  const totalPendingOrders = orders.filter(o => o.status === 'pending').length;

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const unreadPendingReviews = pendingReviews.filter(r => !readReviewIds.includes(r.id));

  // Analytics
  const activeOrders = orders.filter(o => o.status === 'delivered');
  const orderItems = activeOrders.flatMap(o => o.items);
  const salesMap = orderItems.reduce((acc, item) => {
    acc[item.id] = (acc[item.id] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const bestSellingProducts = products
    .filter(p => (salesMap[p.id] || 0) > 0)
    .map(p => ({ ...p, totalSold: salesMap[p.id] }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  const lowStockProducts = products.filter(p => (p.stock || 0) < 5);
  const lowStockCount = lowStockProducts.length;
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const unreadPendingOrders = orders.filter(o => o.status === 'pending' && !readOrderIds.includes(o.id));

  const getFilteredOrdersForTrend = () => {
    const now = new Date();
    let startLimit = new Date(0);
    let endLimit = new Date();

    if (chartTimeframe === 'this-month') {
      startLimit = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (chartTimeframe === 'last-30-days') {
      startLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (chartTimeframe === 'custom') {
      if (customStartDate) {
        startLimit = new Date(customStartDate);
        startLimit.setHours(0, 0, 0, 0);
      }
      if (customEndDate) {
        endLimit = new Date(customEndDate);
        endLimit.setHours(23, 59, 59, 999);
      }
    }

    const filtered = orders.filter(o => {
      const orderDate = new Date(o.date);
      return o.status !== 'cancelled' && orderDate >= startLimit && orderDate <= endLimit;
    });

    const dailyData: { [key: string]: number } = {};
    filtered.forEach(o => {
      const formatted = formatDate(o.date);
      dailyData[formatted] = (dailyData[formatted] || 0) + o.total;
    });

    const dates = Object.keys(dailyData);
    const sortedDaily = dates
      .map(dStr => {
        const orderForDate = filtered.find(o => formatDate(o.date) === dStr);
        return {
          date: dStr,
          total: dailyData[dStr],
          timestamp: orderForDate ? new Date(orderForDate.date).getTime() : 0
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    if (sortedDaily.length === 0) {
      return [{ date: 'No Data', total: 0, timestamp: 0 }];
    }

    return sortedDaily;
  };

  const handleImageUpload = async (file: File | null, callback: (url: string) => void) => {
    if (!file) return;
    try {
      Swal.fire({
        title: 'প্রসেসিং হচ্ছে...',
        text: 'ইমেজ কম্প্রেস করা হচ্ছে, দয়া করে অপেক্ষা করুন।',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const base64 = await fileToBase64(file);
      const compressed = await compressImage(base64);
      callback(compressed);
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ইমেজ আপলোড সম্পন্ন হয়েছে।',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.warn('Upload failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text: 'ইমেজ আপলোড করা সম্ভব হয়নি।',
      });
    }
  };

  const handleMultipleImageUpload = async (files: FileList | null, callback: (urls: string[]) => void) => {
    if (!files || files.length === 0) return;
    try {
      Swal.fire({
        title: 'প্রসেসিং হচ্ছে...',
        text: `${files.length}টি ইমেজ কম্প্রেস করা হচ্ছে, দয়া করে অপেক্ষা করুন...`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await fileToBase64(file);
        const compressed = await compressImage(base64);
        urls.push(compressed);
      }
      callback(urls);
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: `${urls.length}টি ইমেজ সফলভাবে আপলোড করা হয়েছে।`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.warn('Multiple upload failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text: 'ইমেজ আপলোড করা সম্ভব হয়নি।',
      });
    }
  };

  const handlePrintInvoice = (order: any) => {
    const { actualShipping, actualTotalPayable } = getOrderTotals(order);
    const formattedOrderId = formatOrderId(order.id);
    const formattedAddress = (order.customer.address || '').replace(/\r?\n+/g, ', ').trim();

    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 4px 6px; border-bottom: 1px solid #eaeaea;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${item.image}" alt="${item.name}" style="width: 24px; height: 24px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;" referrerPolicy="no-referrer" />
            <div>
              <span style="font-weight: bold; font-size: 9px; color: #111; display: block;">${item.name} ${item.selectedSize ? `(Size: ${item.selectedSize})` : ''}</span>
              <span style="font-size: 8px; color: #888;">ID: ${item.id}${item.code ? ` | Code: ${item.code}` : ''}</span>
            </div>
          </div>
        </td>
        <td style="padding: 4px 6px; border-bottom: 1px solid #eaeaea; text-align: center; font-weight: bold; font-family: monospace; color: #555; font-size: 9px;">x${item.quantity}</td>
        <td style="padding: 4px 6px; border-bottom: 1px solid #eaeaea; text-align: right; font-weight: bold; color: #111; font-size: 9px;">৳${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const singleInvoiceHtml = `
      <div class="invoice-box">
        <table class="header-table">
          <tr>
            <td>
              <h1 class="company">TRENDY CART BD</h1>
            </td>
            <td class="label">INVOICE (মেমো)</td>
          </tr>
        </table>

        <div class="info-bar">
          <div>
            <p style="margin: 2px 0; font-size: 9px;"><strong>Order ID:</strong> #${formattedOrderId}</p>
            <p style="margin: 2px 0; font-size: 8px; color: #555;"><strong>Invoice Date:</strong> ${new Date(order.date).toLocaleString()}</p>
          </div>
          <div style="font-size: 9px; text-transform: uppercase; font-weight: bold; color: #888;">Customer Copy / গ্রাহক কপি</div>
        </div>

        <table class="items">
          <thead>
            <tr>
              <th style="padding: 4px 6px;">Item Description</th>
              <th style="padding: 4px 6px; text-align: center; width: 40px;">Qty</th>
              <th style="padding: 4px 6px; text-align: right; width: 80px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="flex-row">
          <div class="card">
            <h3>Shipping Address (ডেলিভারি ঠিকানা)</h3>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Email:</strong> ${order.customer.email || 'N/A'}</p>
            <p><strong>District:</strong> ${order.customer.district || 'N/A'}</p>
            <p style="word-break: break-word; overflow-wrap: anywhere; line-height: 1.45;"><strong>Address:</strong> ${formattedAddress}</p>
          </div>
          
          <div class="totals">
            <div class="total-row">
              <span style="color: #666;">Subtotal:</span>
              <strong>৳${order.subtotal.toFixed(2)}</strong>
            </div>
            ${order.discount > 0 ? `
              <div class="total-row" style="color: #16a34a;">
                <span>Discount:</span>
                <strong>- ৳${order.discount.toFixed(2)}</strong>
              </div>
            ` : ''}
            <div class="total-row">
              <span style="color: #666;">Shipping:</span>
              <strong>৳${actualShipping.toFixed(2)}</strong>
            </div>
            <div class="total-row grand-total">
              <span>Total Amount:</span>
              <strong style="color: #000; font-size: 11px;">৳${actualTotalPayable.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div class="footer-info">
          <p style="font-size: 9px; font-weight: bold; color: #111; margin: 0;">সিস্টেম জেনারেটেড ভাউচার • System Generated Voucher</p>
          <p style="font-size: 8px; color: #777; margin: 1px 0 0 0;">Thank you for shopping with Trendy Cart BD! No signature is required.</p>
        </div>
      </div>
    `;

    const officeInvoiceHtml = `
      <div class="invoice-box">
        <table class="header-table">
          <tr>
            <td>
              <h1 class="company">TRENDY CART BD</h1>
            </td>
            <td class="label">INVOICE (মেমো)</td>
          </tr>
        </table>

        <div class="info-bar">
          <div>
            <p style="margin: 2px 0; font-size: 9px;"><strong>Order ID:</strong> #${formattedOrderId}</p>
            <p style="margin: 2px 0; font-size: 8px; color: #555;"><strong>Invoice Date:</strong> ${new Date(order.date).toLocaleString()}</p>
          </div>
          <div style="font-size: 9px; text-transform: uppercase; font-weight: bold; color: #888;">Office Copy / অফিস কপি</div>
        </div>

        <table class="items">
          <thead>
            <tr>
              <th style="padding: 4px 6px;">Item Description</th>
              <th style="padding: 4px 6px; text-align: center; width: 40px;">Qty</th>
              <th style="padding: 4px 6px; text-align: right; width: 80px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="flex-row">
          <div class="card">
            <h3>Shipping Address (ডেলিভারি ঠিকানা)</h3>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Email:</strong> ${order.customer.email || 'N/A'}</p>
            <p><strong>District:</strong> ${order.customer.district || 'N/A'}</p>
            <p style="word-break: break-word; overflow-wrap: anywhere; line-height: 1.45;"><strong>Address:</strong> ${formattedAddress}</p>
          </div>
          
          <div class="totals">
            <div class="total-row">
              <span style="color: #666;">Subtotal:</span>
              <strong>৳${order.subtotal.toFixed(2)}</strong>
            </div>
            ${order.discount > 0 ? `
              <div class="total-row" style="color: #16a34a;">
                <span>Discount:</span>
                <strong>- ৳${order.discount.toFixed(2)}</strong>
              </div>
            ` : ''}
            <div class="total-row">
              <span style="color: #666;">Shipping:</span>
              <strong>৳${actualShipping.toFixed(2)}</strong>
            </div>
            <div class="total-row grand-total">
              <span>Total Amount:</span>
              <strong style="color: #000; font-size: 11px;">৳${actualTotalPayable.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div class="footer-info">
          <p style="font-size: 9px; font-weight: bold; color: #111; margin: 0;">সিস্টেম জেনারেটেড ভাউচার • System Generated Voucher</p>
          <p style="font-size: 8px; color: #777; margin: 1px 0 0 0;">Thank you for shopping with Trendy Cart BD! No signature is required.</p>
        </div>
      </div>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(`
      <html>
        <head>
          <title>Invoice - Order #${formattedOrderId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #222; background-color: #fff; }
            .print-container { width: 210mm; height: 297mm; margin: auto; padding: 4mm 8mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
            .invoice-box { width: 194mm; min-height: 133mm; padding: 10px; border: 1px solid #eaeaea; font-size: 10px; line-height: 1.4; border-radius: 6px; box-sizing: border-box; background: #fff; display: flex; flex-direction: column; justify-content: space-between; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; border-bottom: 2px solid #111; padding-bottom: 2px; }
            .company { font-size: 18px; font-weight: 950; letter-spacing: -1px; text-transform: uppercase; margin: 0; color: #000; }
            .label { font-size: 12px; color: #666; font-weight: bold; text-align: right; text-transform: uppercase; letter-spacing: 1px; }
            
            .info-bar { margin-bottom: 4px; display: flex; justify-content: space-between; align-items: flex-end; }
            
            table.items { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
            table.items th { padding: 4px 6px; font-size: 9px; text-transform: uppercase; text-align: left; background-color: #f7f7f7; color: #444; font-weight: bold; border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; }
            table.items td { padding: 3px 6px; border-bottom: 1px solid #eaeaea; font-size: 9px; }
            
            .flex-row { display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; margin: 4px 0; }
            .card { background: #fafafa; padding: 7px 8px; border-radius: 4px; border: 1px solid #eee; flex: 1.25; min-width: 0; word-break: break-word; overflow-wrap: anywhere; }
            .card h3 { margin: 0 0 3px 0; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 1px solid #eaeaea; padding-bottom: 2px; }
            .card p { margin: 2px 0; font-size: 9px; color: #333; line-height: 1.45; word-break: break-word; overflow-wrap: anywhere; }
            
            .totals { width: 180px; font-size: 9px; flex: 0.8; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .grand-total { border-top: 1.5px solid #111; padding-top: 3px; margin-top: 3px; font-size: 10px; font-weight: bold; color: #000; }
            
            .footer-info { text-align: center; border-top: 1px solid #eaeaea; padding-top: 4px; }
            
            .tear-line {
              width: 194mm;
              text-align: center;
              margin: 4px 0;
              border-top: 1px dashed #777;
              position: relative;
              height: 10px;
            }
            .tear-line .text {
              position: absolute;
              top: -8px;
              left: 50%;
              transform: translateX(-50%);
              background: #fff;
              padding: 0 10px;
              font-size: 8px;
              font-weight: bold;
              color: #555;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            
            .no-print { display: none !important; }

            @media print {
              @page { size: A4 portrait; margin: 0; }
              body { margin: 0; padding: 0; background: #fff; }
              .print-container {
                width: 210mm;
                height: 297mm;
                padding: 4mm 8mm;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .invoice-box {
                width: 194mm;
                height: 133mm;
                border: 1px solid #eee !important;
                box-shadow: none !important;
                padding: 8px !important;
                margin: 0 !important;
                box-sizing: border-box;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${singleInvoiceHtml}
            
            <div class="tear-line">
              <span class="text">✂ CUT OR TEAR HERE (এখান থেকে ছিড়ে নিন) ✂</span>
            </div>
            
            ${officeInvoiceHtml}
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.parent.document.body.removeChild(window.frameElement);
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);

        doc.close();
    }
  };

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin Management state
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPermissions, setNewAdminPermissions] = useState({
    dashboard: true,
    products: true,
    orders: true,
    coupons: true,
    slides: true,
    categoryBanners: true,
    categories: true,
    lookbook: true,
    subscribers: true,
    messages: true,
    ads: true,
    faqs: true,
    policies: true,
    otps: true,
    otpsDelete: true,
    reviews: true,
    notifications: true
  });

  // Auto-routing for general admin depending on permissions
  useEffect(() => {
    if (currentAdmin && currentAdmin.role !== 'super') {
      const activeTabMap: Record<string, keyof AdminPermissions> = {
        dashboard: 'dashboard',
        shop: 'products',
        categories: 'categories',
        collection: 'categories', // Or products? Usually banners are in Categories Banner now
        categoriesBanner: 'categoryBanners',
        lookbook: 'lookbook',
        orders: 'orders',
        coupons: 'coupons',
        slides: 'slides',
        ads: 'ads',
        faqs: 'faqs',
        subscribers: 'subscribers',
        messages: 'messages',
        contactinfo: 'messages',
        settings: 'dashboard',
        policies: 'policies',
        otps: 'otps'
      };

      const requiredPermission = activeTabMap[activeTab];
      if (requiredPermission && currentAdmin.permissions && currentAdmin.permissions[requiredPermission] === false) {
        // Redirection logic
        const permissibleTabs: typeof activeTab[] = [];
        if (currentAdmin.permissions?.dashboard) permissibleTabs.push('dashboard');
        if (currentAdmin.permissions?.products) permissibleTabs.push('shop');
        if (currentAdmin.permissions?.categories) permissibleTabs.push('categories');
        if (currentAdmin.permissions?.categoryBanners) permissibleTabs.push('categoriesBanner');
        if (currentAdmin.permissions?.lookbook) permissibleTabs.push('lookbook');
        if (currentAdmin.permissions?.orders) permissibleTabs.push('orders');
        if (currentAdmin.permissions?.coupons) permissibleTabs.push('coupons');
        if (currentAdmin.permissions?.slides) permissibleTabs.push('slides');
        if (currentAdmin.permissions?.ads) permissibleTabs.push('ads');
        if (currentAdmin.permissions?.faqs) permissibleTabs.push('faqs');
        if (currentAdmin.permissions?.subscribers) permissibleTabs.push('subscribers');
        if (currentAdmin.permissions?.messages) permissibleTabs.push('messages');
        if (currentAdmin.permissions?.policies) permissibleTabs.push('policies');
        if (currentAdmin.permissions?.otps) permissibleTabs.push('otps');

        if (permissibleTabs.length > 0) {
          setActiveTab(permissibleTabs[0]);
        } else {
          setActiveTab('profile');
        }
      }
    }
  }, [currentAdmin, activeTab]);

  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isForgotPasswordFlow, setIsForgotPasswordFlow] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOTP, setForgotOTP] = useState('');
  const [newForgotPassword, setNewForgotPassword] = useState('');

  // Form states (Default stock is now 0)
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: 0, 
    oldPrice: 0, 
    costPrice: 0,
    image: '', 
    description: '', 
    isHotSale: false, 
    isCollection: false, 
    sizeChartImage: '', 
    category: 'Basic', 
    subCategory: '',
    code: '', 
    images: [] as string[], 
    imageVariants: [] as ProductImageVariant[],
    serial: 0, 
    stock: 0, 
    sizePrices: {} as Record<string, number>, 
    sizeStocks: {} as Record<string, number> 
  });
  const [newProductUrlInput, setNewProductUrlInput] = useState('');
  const [editProductUrlInput, setEditProductUrlInput] = useState('');
  const [frontImageUrlInput, setFrontImageUrlInput] = useState('');
  const [editFrontImageUrlInput, setEditFrontImageUrlInput] = useState('');
  const [newBulkPreset, setNewBulkPreset] = useState<Record<string, number>>({ S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 });
  const [editBulkPreset, setEditBulkPreset] = useState<Record<string, number>>({ S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 });
  const [newCoupon, setNewCoupon] = useState({ code: '', discountValue: 0, discountType: 'percentage' as 'percentage' | 'amount', isActive: true, startDate: '', expiryDate: '' });
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', image: '', tagText: '', link: '' });
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [newCategoryBanner, setNewCategoryBanner] = useState({ title: '', subtitle: '', image: '', link: '' });
  const [newLookbook, setNewLookbook] = useState({ image: '', link: '', className: 'col-span-1 row-span-1', widthPercent: '100%', heightPercent: 'auto', serial: 1, title: '' });
  const [editingLookbook, setEditingLookbook] = useState<LookbookImage | null>(null);
  const [showLookbookGridPreview, setShowLookbookGridPreview] = useState(true);
  const [lookbookModalPreviewTab, setLookbookModalPreviewTab] = useState<'grid' | 'tile'>('grid');
  const [arrangedLookbook, setArrangedLookbook] = useState<LookbookImage[]>([]);
  const [isLookbookOrderChanged, setIsLookbookOrderChanged] = useState<boolean>(false);

  useEffect(() => {
    if (!isLookbookOrderChanged) {
      setArrangedLookbook([...lookbook].sort((a, b) => (a.serial || 0) - (b.serial || 0)));
    }
  }, [lookbook, isLookbookOrderChanged]);

  const handleMoveLookbookPosition = (currentIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= arrangedLookbook.length) return;

    const newList = [...arrangedLookbook];
    const itemA = newList[currentIndex];
    const itemB = newList[targetIndex];

    newList[currentIndex] = itemB;
    newList[targetIndex] = itemA;

    const updated = newList.map((item, idx) => ({
      ...item,
      serial: idx + 1
    }));

    setArrangedLookbook(updated);
    setIsLookbookOrderChanged(true);
  };

  const handleNormalizeLookbookSerials = () => {
    const updated = arrangedLookbook.map((item, idx) => ({
      ...item,
      serial: idx + 1
    }));
    setArrangedLookbook(updated);
    setIsLookbookOrderChanged(true);
    Swal.fire({
      title: 'Normalized',
      text: 'Serials set to 1, 2, 3... Click Save to apply.',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSaveLookbookArrangement = async () => {
    try {
      const normalized = arrangedLookbook.map((item, idx) => ({
        ...item,
        serial: idx + 1
      }));
      updateLookbookList(normalized);
      setIsLookbookOrderChanged(false);
      Swal.fire({
        title: 'Saved!',
        text: 'Lookbook grid arrangement has been saved successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      Swal.fire('Error', 'Failed to save lookbook arrangement', 'error');
    }
  };

  const handleResetLookbookArrangement = () => {
    setArrangedLookbook([...lookbook].sort((a, b) => (a.serial || 0) - (b.serial || 0)));
    setIsLookbookOrderChanged(false);
  };

  const simulatedLookbook = React.useMemo(() => {
    const list = [...lookbook].filter(l => editingLookbook ? l.id !== editingLookbook.id : true);
    const candidateItem: LookbookImage = {
      id: editingLookbook?.id || 'simulated-new-item',
      image: newLookbook.image || '',
      link: newLookbook.link || '/shop',
      className: newLookbook.className || 'col-span-1 row-span-1',
      serial: Number(newLookbook.serial) || (list.length + 1),
      title: newLookbook.title || 'Preview Item'
    };
    list.push(candidateItem);
    return list.sort((a, b) => (a.serial || 0) - (b.serial || 0));
  }, [lookbook, editingLookbook, newLookbook]);
  const [newPopupAd, setNewPopupAd] = useState({ imageUrl: '', linkUrl: '', isActive: true, pagesString: 'all' });
  const [newHomeAd, setNewHomeAd] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '', isActive: true });
  
  // Order search & date filter states
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderDateRange, setOrderDateRange] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this-week'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | Order['status']>('all');
  const [isSearchingOrders, setIsSearchingOrders] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderState, setEditingOrderState] = useState<Order | null>(null);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [productToAddSize, setProductToAddSize] = useState('M');
  const [productToAddQty, setProductToAddQty] = useState(1);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const startEditingOrder = (order: Order) => {
    if (order.status !== 'pending') {
      Swal.fire({ title: 'Error', text: 'শুধুমাত্র Pending অর্ডার কাস্টমাইজ করা যাবে।', icon: 'error' });
      return;
    }
    setEditingOrderState({
      ...order,
      customer: { ...order.customer },
      items: order.items.map(item => ({ ...item }))
    });
    setIsEditingOrder(true);
    setSelectedProductToAdd('');
    setProductToAddSize('M');
    setProductToAddQty(1);
    setProductSearchQuery('');
  };

  const recalculateOrderTotals = (order: Order): Order => {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const hasDhaka = (order.customer.address || '').toLowerCase().includes('dhaka') || (order.customer.district || '').toLowerCase().includes('dhaka');
    const shippingCharge = hasDhaka ? 70 : 120;
    const total = Math.max(0, subtotal - (order.discount || 0) + shippingCharge);
    return {
      ...order,
      subtotal,
      total
    };
  };

  const handleQtyChange = (idx: number, change: number) => {
    if (!editingOrderState) return;
    const updatedItems = [...editingOrderState.items];
    const newQty = updatedItems[idx].quantity + change;
    if (newQty <= 0) return;
    updatedItems[idx].quantity = newQty;
    const updatedOrder = { ...editingOrderState, items: updatedItems };
    setEditingOrderState(recalculateOrderTotals(updatedOrder));
  };

  const handleSizeChange = (idx: number, newSize: string) => {
    if (!editingOrderState) return;
    const updatedItems = [...editingOrderState.items];
    const item = updatedItems[idx];
    item.selectedSize = newSize;
    
    // Update item price based on the selected size prices if product exists
    const dbProduct = products.find(p => p.id === item.id);
    if (dbProduct) {
      const matchingPrice = (dbProduct.sizePrices && dbProduct.sizePrices[newSize] !== undefined && Number(dbProduct.sizePrices[newSize]) > 0)
        ? Number(dbProduct.sizePrices[newSize])
        : dbProduct.price;
      item.price = matchingPrice;
    }
    
    const updatedOrder = { ...editingOrderState, items: updatedItems };
    setEditingOrderState(recalculateOrderTotals(updatedOrder));
  };

  const handleRemoveItem = (idx: number) => {
    if (!editingOrderState) return;
    const updatedItems = editingOrderState.items.filter((_, i) => i !== idx);
    const updatedOrder = { ...editingOrderState, items: updatedItems };
    setEditingOrderState(recalculateOrderTotals(updatedOrder));
  };

  const handleAddNewItemToOrder = () => {
    if (!editingOrderState || !selectedProductToAdd) return;
    const dbProduct = products.find(p => p.id === selectedProductToAdd);
    if (!dbProduct) return;
    
    // Determine the price based on size prices
    const itemPrice = (dbProduct.sizePrices && dbProduct.sizePrices[productToAddSize] !== undefined && Number(dbProduct.sizePrices[productToAddSize]) > 0)
      ? Number(dbProduct.sizePrices[productToAddSize])
      : dbProduct.price;
      
    const matchedVariantCode = productSearchQuery.trim()
      ? (dbProduct.imageVariants?.find(v => v.code && v.code.toLowerCase().includes(productSearchQuery.toLowerCase().trim()))?.code ||
         dbProduct.variantCodes?.find(vc => vc.toLowerCase().includes(productSearchQuery.toLowerCase().trim())) ||
         dbProduct.code || '')
      : (dbProduct.code || '');

    // Determine if the product is already in the order items with the exact same size and code
    const existingIndex = editingOrderState.items.findIndex(
      item => item.id === dbProduct.id && item.selectedSize === productToAddSize && (item.code || '') === matchedVariantCode
    );
    
    let updatedItems = [...editingOrderState.items];
    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity += productToAddQty;
    } else {
      const matchedVariantImg = dbProduct.imageVariants?.find(v => v.code === matchedVariantCode)?.image;
      const newItem: CartItem = {
        ...dbProduct,
        id: dbProduct.id,
        name: dbProduct.name,
        price: itemPrice,
        quantity: productToAddQty,
        image: matchedVariantImg || dbProduct.images?.[0] || dbProduct.image || '',
        selectedSize: productToAddSize,
        code: matchedVariantCode
      };
      updatedItems.push(newItem);
    }
    
    const updatedOrder = { ...editingOrderState, items: updatedItems };
    setEditingOrderState(recalculateOrderTotals(updatedOrder));
    
    // Reset selection states
    setSelectedProductToAdd('');
    setProductToAddQty(1);
    setProductToAddSize('M');
    setProductSearchQuery('');
  };
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Order notes loader effect
  useEffect(() => {
    if (selectedOrderForView) {
      setOrderNotes(selectedOrderForView.notes || '');
    }
  }, [selectedOrderForView?.id]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [tempOrdersPerPage, setTempOrdersPerPage] = useState(10);

// Audit Logs State
  const [auditLogs] = useState<{ action: string; date: string }[]>([
    { action: 'Admin logged in', date: new Date().toISOString() },
    { action: 'Updated product #123', date: new Date(Date.now() - 3600000).toISOString() },
    { action: 'Deleted order #456', date: new Date(Date.now() - 7200000).toISOString() },
    { action: 'Updated category banner', date: new Date(Date.now() - 10800000).toISOString() },
    { action: 'Added new coupon SALE10', date: new Date(Date.now() - 14400000).toISOString() }
  ].slice(0, 10));

  const [appliedOrderQuery, setAppliedOrderQuery] = useState('');
  const [appliedOrderDateFilter, setAppliedOrderDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this-week'>('all');
  const [appliedOrderDateRange, setAppliedOrderDateRange] = useState('');
  const [appliedOrderStatusFilter, setAppliedOrderStatusFilter] = useState<'all' | Order['status']>('all');

  // Policy Forms State
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ key: 'custom', title: '', content: '' });
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [isAddingCategoryBanner, setIsAddingCategoryBanner] = useState(false);
  const [isAddingLookbook, setIsAddingLookbook] = useState(false);
  const [isAddingPopupAd, setIsAddingPopupAd] = useState(false);
  const [isAddingHomeAd, setIsAddingHomeAd] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategoryBanner, setEditingCategoryBanner] = useState<CategoryBanner | null>(null);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailModalType, setEmailModalType] = useState<'newsletter' | 'contact'>('newsletter');
  const [emailTarget, setEmailTarget] = useState<string>('all');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [newsletterImage, setNewsletterImage] = useState('');

  const [editingPopupAd, setEditingPopupAd] = useState<PopupAd | null>(null);
  const [editingHomeAd, setEditingHomeAd] = useState<HomeAd | null>(null);
  const [adsSubTab, setAdsSubTab] = useState<'popup' | 'home'>('home');

  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');
  const [adminSubCategoryFilter, setAdminSubCategoryFilter] = useState('all');
  const [adminHotSaleFilter, setAdminHotSaleFilter] = useState('all');
  const [adminSortBy, setAdminSortBy] = useState('serial');

  const adminCategories = React.useMemo(() => {
    const fromProducts = new Set(products.map(p => p.category));
    const fromList = new Set(categories.map(c => c.name));
    const combined = new Set([...Array.from(fromProducts), ...Array.from(fromList)]);
    return ['all', ...Array.from(combined)].filter(Boolean);
  }, [products, categories]);

  const adminSubCategories = React.useMemo(() => {
    if (adminCategoryFilter === 'all') return [];
    const catObj = categories.find(c => c.name === adminCategoryFilter);
    const fromCat = catObj?.subCategories || [];
    const fromProds = products
      .filter(p => p.category === adminCategoryFilter && p.subCategory)
      .map(p => p.subCategory as string);
    return Array.from(new Set([...fromCat, ...fromProds])).filter(Boolean);
  }, [adminCategoryFilter, categories, products]);

  const getSubCategoriesFor = React.useCallback((catName: string) => {
    if (!catName || catName === 'all') return [];
    const catObj = categories.find(c => c.name === catName);
    const fromCat = catObj?.subCategories || [];
    const fromProds = products
      .filter(p => p.category === catName && p.subCategory)
      .map(p => p.subCategory as string);
    return Array.from(new Set([...fromCat, ...fromProds])).filter(Boolean);
  }, [categories, products]);

  const getSerialRank = React.useCallback((p: Product) => {
    return typeof p.serial === 'number' && p.serial > 0 ? p.serial : 999999;
  }, []);

  const filteredAdminProducts = React.useMemo(() => {
    const q = adminSearchQuery.toLowerCase().trim();
    return products
      .filter(p => {
        const matchesSearch = !q ||
          p.name.toLowerCase().includes(q) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.variantCodes && p.variantCodes.some(vc => vc.toLowerCase().includes(q))) ||
          (p.imageVariants && p.imageVariants.some(v => (v.code && v.code.toLowerCase().includes(q)) || (v.title && v.title.toLowerCase().includes(q)))) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
          p.id.toLowerCase().includes(q);
        
        const matchesCategory = adminCategoryFilter === 'all' || p.category === adminCategoryFilter;
        const matchesSubCategory = adminSubCategoryFilter === 'all' || p.subCategory === adminSubCategoryFilter;
        
        const matchesHotSale = 
          adminHotSaleFilter === 'all' ||
          (adminHotSaleFilter === 'yes' && p.isHotSale) ||
          (adminHotSaleFilter === 'no' && !p.isHotSale);

        return matchesSearch && matchesCategory && matchesSubCategory && matchesHotSale;
      })
      .sort((a, b) => {
        if (adminSortBy === 'price-asc') return a.price - b.price;
        if (adminSortBy === 'price-desc') return b.price - a.price;
        return getSerialRank(a) - getSerialRank(b);
      });
  }, [products, adminSearchQuery, adminCategoryFilter, adminSubCategoryFilter, adminHotSaleFilter, adminSortBy, getSerialRank]);

  const filteredCollectionProducts = React.useMemo(() => {
    return products
      .filter(p => p.isCollection)
      .sort((a, b) => getSerialRank(a) - getSerialRank(b));
  }, [products, getSerialRank]);

  const handleMoveProductSerial = (productId: string, direction: 'up' | 'down', currentList: Product[]) => {
    const idx = currentList.findIndex(p => p.id === productId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    const reordered = [...currentList];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    const updates = reordered.map((item, i) => ({
      id: item.id,
      serial: i + 1
    }));
    updateProductSerials(updates);
  };

  const handleSetProductSerialPosition = (productId: string, newSerialVal: number, currentList: Product[]) => {
    const targetSerial = Math.max(1, Math.floor(Number(newSerialVal) || 1));
    const currentIdx = currentList.findIndex(p => p.id === productId);
    if (currentIdx === -1) {
      updateProductSerials([{ id: productId, serial: targetSerial }]);
      return;
    }
    const reordered = [...currentList];
    const [moved] = reordered.splice(currentIdx, 1);
    const insertIdx = Math.min(reordered.length, Math.max(0, targetSerial - 1));
    reordered.splice(insertIdx, 0, moved);
    const updates = reordered.map((item, i) => ({
      id: item.id,
      serial: i + 1
    }));
    updateProductSerials(updates);
  };

  const handleNormalizeProductSerials = (currentList: Product[]) => {
    if (currentList.length === 0) return;
    const updates = currentList.map((item, i) => ({
      id: item.id,
      serial: i + 1
    }));
    updateProductSerials(updates);
    Swal.fire({
      icon: 'success',
      title: 'সিরিয়াল আপডেট হয়েছে!',
      text: `১ থেকে ${currentList.length} পর্যন্ত প্রোডাক্টগুলো সিরিয়ালি সাজানো হয়েছে।`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const result = await loginAdmin(email, password);
    setIsLoggingIn(false);
    if (!result.success) {
      setLoginError(result.error || 'Invalid email or password');
    } else {
      setLoginError('');
      setEmail('');
      setPassword('');
    }
  };

  if (!isAdminAuth) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex items-center justify-center p-4 min-h-screen font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 max-w-sm w-full shadow-2xl shadow-black/5 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>
          
          <div className="w-20 h-20 bg-gray-50 rounded-3xl mx-auto mb-8 flex items-center justify-center border border-gray-100 shadow-inner">
            <UserCircle size={40} className="text-black stroke-[1.5]" />
          </div>

          {!isForgotPasswordFlow ? (
            <>
              <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">Admin Login</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8"></p>
            
              <form onSubmit={handleLogin} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="admin@trendycartbd.com"
                    className="w-full text-xs font-bold border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-gray-50/50 focus:bg-white transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
                    <button 
                      type="button"
                      onClick={() => setIsForgotPasswordFlow(true)}
                      className="text-[9px] font-black uppercase tracking-widest text-black hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full text-xs font-bold border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-gray-50/50 focus:bg-white transition-all pr-12" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl"
                  >
                    <ShieldAlert size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-wider">{loginError}</p>
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full py-4.5 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-black/20 mt-4 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50"
                >
                  {isLoggingIn ? <Loader2 className="animate-spin h-4 w-4" /> : 'Enter Dashboard'}
                </button>
                
                <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest mt-6">
                  Design & Developed by <span className="text-black">TRENDY CART BD</span>
                </p>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2 justify-center">
                <button 
                  onClick={() => {
                    setIsForgotPasswordFlow(false);
                    setForgotPasswordStep('email');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
                >
                  <X size={16} />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight text-gray-900">Forgot Password</h1>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8"></p>

              {forgotPasswordStep === 'email' && (
                <div className="space-y-5 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Admin Email</label>
                    <input 
                      type="email" 
                      value={forgotEmail} 
                      onChange={e => setForgotEmail(e.target.value)} 
                      placeholder="Enter registered email"
                      className="w-full text-xs font-bold border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-gray-50/50 focus:bg-white transition-all" 
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      if (!forgotEmail) { Swal.fire('Error', 'Please enter email', 'error'); return; }
                      setIsForgotLoading(true);
                      try {
                        const res = await fetch(apiUrl('/api/auth/forgot-password'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: forgotEmail })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setForgotPasswordStep('otp');
                          Swal.fire('Code Sent!', 'ভেরিফিকেশন কোড আপনার মেইলে পাঠানো হয়েছে।', 'success');
                        } else {
                          Swal.fire('Error', data.error || 'Failed to send code', 'error');
                        }
                      } catch (err) {
                        Swal.fire('Error', 'Something went wrong', 'error');
                      } finally {
                        setIsForgotLoading(false);
                      }
                    }}
                    disabled={isForgotLoading}
                    className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-black/10 mt-2 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    {isForgotLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Send Verification Code'}
                  </button>
                </div>
              )}

              {forgotPasswordStep === 'otp' && (
                <div className="space-y-5 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">OTP Code</label>
                    <input 
                      type="text" 
                      value={forgotOTP} 
                      onChange={e => setForgotOTP(e.target.value)} 
                      placeholder="Enter 6-digit code"
                      className="w-full text-center tracking-[0.5em] text-lg font-black border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-gray-50/50 focus:bg-white transition-all" 
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      if (forgotOTP.length < 4) { Swal.fire('Error', 'Enter valid OTP', 'error'); return; }
                      setForgotPasswordStep('reset');
                    }}
                    className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-black/10 mt-2 active:scale-95 transition-all"
                  >
                    Verify Code
                  </button>
                  <button 
                    onClick={() => setForgotPasswordStep('email')}
                    className="w-full text-[9px] font-black uppercase text-gray-400 hover:text-black tracking-widest"
                  >
                    Wrong Email? Back
                  </button>
                </div>
              )}

              {forgotPasswordStep === 'reset' && (
                <div className="space-y-5 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Password</label>
                    <input 
                      type="password" 
                      value={newForgotPassword} 
                      onChange={e => setNewForgotPassword(e.target.value)} 
                      placeholder="Enter new password"
                      className="w-full text-xs font-bold border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black/5 focus:border-black outline-none bg-gray-50/50 focus:bg-white transition-all" 
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      if (newForgotPassword.length < 6) { Swal.fire('Error', 'Password must be at least 6 characters', 'error'); return; }
                      setIsForgotLoading(true);
                      try {
                        const res = await fetch(apiUrl('/api/auth/reset-password'), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: forgotEmail, otp: forgotOTP, newPassword: newForgotPassword })
                        });
                        const data = await res.json();
                        if (data.success) {
                          Swal.fire({
                            title: 'Success!',
                            text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।',
                            icon: 'success',
                            confirmButtonColor: '#000'
                          });
                          setIsForgotPasswordFlow(false);
                          setForgotPasswordStep('email');
                          setForgotEmail('');
                          setForgotOTP('');
                          setNewForgotPassword('');
                        } else {
                          Swal.fire('Error', data.error || 'Failed to reset password', 'error');
                        }
                      } catch (err) {
                        Swal.fire('Error', 'Something went wrong', 'error');
                      } finally {
                        setIsForgotLoading(false);
                      }
                    }}
                    disabled={isForgotLoading}
                    className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-black/10 mt-2 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    {isForgotLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Update & Login'}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // Helper to get next default base product code
  const getNextBaseProductCode = (excludeId?: string) => {
    const tyCodes = products
      .filter(p => !excludeId || p.id !== excludeId)
      .map(p => p.code || '')
      .filter(c => c.startsWith('TY-'))
      .map(c => parseInt(c.split('-')[1]))
      .filter(n => !isNaN(n));
    const maxNum = tyCodes.length > 0 ? Math.max(...tyCodes) : 1000;
    return `TY-${maxNum + 1}`;
  };

  // Sync variant codes with the first/main product code
  const syncVariantsWithBaseCode = (
    variants: ProductImageVariant[],
    baseCodeInput?: string,
    prevBaseCode?: string,
    forceAll = false,
    excludeId?: string
  ): ProductImageVariant[] => {
    const rawBase = (baseCodeInput || '').trim().toUpperCase() ||
      (variants[0]?.code ? variants[0].code.trim().toUpperCase().replace(/-\d+$/, '') : '') ||
      getNextBaseProductCode(excludeId);
    const cleanPrevBase = (prevBaseCode || '').trim().toUpperCase();

    return variants.map((v, idx) => {
      const existingCode = (v.code || '').trim().toUpperCase();
      const autoForPrev = cleanPrevBase ? `${cleanPrevBase}-${idx + 1}` : '';
      const isAutoOrEmpty = !existingCode || existingCode === autoForPrev || /^TY-\d+-\d+$/.test(existingCode);
      if (forceAll || isAutoOrEmpty) {
        return { ...v, code: `${rawBase}-${idx + 1}` };
      }
      return { ...v, code: existingCode };
    });
  };

  const autoGenerateNewProductVariantCodes = () => {
    const base = (newProduct.code || '').trim().toUpperCase() ||
      (newProduct.imageVariants?.[0]?.code?.trim().toUpperCase().replace(/-\d+$/, '')) ||
      getNextBaseProductCode();
    const updated = syncVariantsWithBaseCode(newProduct.imageVariants || [], base, newProduct.code, true);
    setNewProduct(prev => ({
      ...prev,
      code: prev.code?.trim() ? prev.code.trim().toUpperCase() : base,
      imageVariants: updated
    }));
    Swal.fire({
      icon: 'success',
      title: 'অটো কোড সেট হয়েছে!',
      text: `প্রথম কোড (${base}) অনুযায়ী সকল ছবির ভেরিয়েন্ট কোড সেট করা হয়েছে।`,
      timer: 1400,
      showConfirmButton: false
    });
  };

  const autoGenerateEditProductVariantCodes = () => {
    if (!editingProduct) return;
    const base = (editingProduct.code || '').trim().toUpperCase() ||
      (editingProduct.imageVariants?.[0]?.code?.trim().toUpperCase().replace(/-\d+$/, '')) ||
      getNextBaseProductCode(editingProduct.id);
    const updated = syncVariantsWithBaseCode(editingProduct.imageVariants || [], base, editingProduct.code, true, editingProduct.id);
    setEditingProduct({
      ...editingProduct,
      code: editingProduct.code?.trim() ? editingProduct.code.trim().toUpperCase() : base,
      imageVariants: updated
    });
    Swal.fire({
      icon: 'success',
      title: 'অটো কোড সেট হয়েছে!',
      text: `প্রথম কোড (${base}) অনুযায়ী সকল ছবির ভেরিয়েন্ট কোড সেট করা হয়েছে।`,
      timer: 1400,
      showConfirmButton: false
    });
  };

  // Helper handlers for newProduct front image & variant inventory
  const handleSetFrontImageForNewProduct = (url: string) => {
    if (!url) return;
    const trimmed = url.trim();
    if (!trimmed) return;

    const currentVariants = [...(newProduct.imageVariants || [])];
    const existingIndex = currentVariants.findIndex(v => v.image === trimmed);

    let reorderedVariants: ProductImageVariant[] = [];
    if (existingIndex > -1) {
      const [target] = currentVariants.splice(existingIndex, 1);
      target.title = target.title || 'Front Cover Image';
      reorderedVariants = [target, ...currentVariants];
    } else if (currentVariants.length > 0 && (!currentVariants[0].image || currentVariants[0].image === newProduct.image)) {
      currentVariants[0] = { ...currentVariants[0], image: trimmed, title: currentVariants[0].title || 'Front Cover Image' };
      reorderedVariants = currentVariants;
    } else {
      const newPrimaryVariant: ProductImageVariant = {
        id: `var-front-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        image: trimmed,
        title: 'Front Cover Image (মূল ছবি)',
        sizeStocks: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 },
        stock: 0
      };
      reorderedVariants = [newPrimaryVariant, ...currentVariants];
    }

    reorderedVariants = syncVariantsWithBaseCode(reorderedVariants, newProduct.code, newProduct.code, false);

    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    reorderedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setNewProduct(prev => ({
      ...prev,
      image: trimmed,
      images: reorderedVariants.slice(1).map(v => v.image),
      imageVariants: reorderedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    }));
  };

  const handleRemoveFrontImageForNewProduct = () => {
    const updatedVariants = syncVariantsWithBaseCode((newProduct.imageVariants || []).slice(1), newProduct.code, newProduct.code, false);
    const nextPrimary = updatedVariants[0]?.image || '';
    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setNewProduct(prev => ({
      ...prev,
      image: nextPrimary,
      images: updatedVariants.slice(1).map(v => v.image),
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    }));
  };

  const addImagesToNewProduct = (urls: string[]) => {
    if (!urls || urls.length === 0) return;
    const currentVariants = newProduct.imageVariants || [];
    const newVariants: ProductImageVariant[] = urls.map((url, idx) => ({
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${idx}`,
      image: url,
      title: `Variant ${currentVariants.length + idx + 1}`,
      sizeStocks: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 },
      stock: 0
    }));
    const updatedVariants = syncVariantsWithBaseCode([...currentVariants, ...newVariants], newProduct.code, newProduct.code, false);
    const totalStock = updatedVariants.reduce<number>((sum: number, v) => sum + (v.stock || 0), 0);
    const primaryImg = newProduct.image || updatedVariants[0]?.image || '';
    const secondaryImgs = updatedVariants.filter(v => v.image !== primaryImg).map(v => v.image);
    
    const aggregated: Record<string, number> = {};
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
      });
    });

    setNewProduct(prev => ({
      ...prev,
      image: primaryImg,
      images: secondaryImgs,
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    }));
  };

  const updateNewProductVariantSize = (variantId: string, size: string, qty: number) => {
    const updatedVariants = (newProduct.imageVariants || []).map(v => {
      if (v.id === variantId) {
        const updatedSizes = { ...(v.sizeStocks || {}), [size]: Math.max(0, qty) };
        const vStock = Object.values(updatedSizes).reduce<number>((sum: number, n: any) => sum + (Number(n) || 0), 0);
        return { ...v, sizeStocks: updatedSizes, stock: vStock };
      }
      return v;
    });

    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setNewProduct(prev => ({
      ...prev,
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    }));
  };

  const removeNewProductVariant = (variantId: string) => {
    const updatedVariants = syncVariantsWithBaseCode(
      (newProduct.imageVariants || []).filter(v => v.id !== variantId),
      newProduct.code,
      newProduct.code,
      false
    );
    const primaryImg = updatedVariants[0]?.image || '';
    const secondaryImgs = updatedVariants.slice(1).map(v => v.image);
    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setNewProduct(prev => ({
      ...prev,
      image: primaryImg,
      images: secondaryImgs,
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    }));
  };

  const setPrimaryNewProductVariant = (variantId: string) => {
    const target = (newProduct.imageVariants || []).find(v => v.id === variantId);
    if (!target) return;
    const remaining = (newProduct.imageVariants || []).filter(v => v.id !== variantId);
    const reordered = syncVariantsWithBaseCode([target, ...remaining], newProduct.code, newProduct.code, false);
    setNewProduct(prev => ({
      ...prev,
      image: target.image,
      images: reordered.slice(1).map(v => v.image),
      imageVariants: reordered
    }));
  };

  const applyBulkPresetToNewProduct = () => {
    const updatedVariants = (newProduct.imageVariants || []).map(v => {
      const newSizes = { ...newBulkPreset };
      const vStock = Object.values(newSizes).reduce<number>((sum: number, n: any) => sum + (Number(n) || 0), 0);
      return { ...v, sizeStocks: newSizes, stock: vStock };
    });

    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setNewProduct(prev => ({
      ...prev,
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    }));
    Swal.fire({
      icon: 'success',
      title: 'প্রয়োগ সম্পন্ন!',
      text: 'সকল ইমেজ ভেরিয়েন্টে সাইজ ও কোয়ান্টিটি যুক্ত করা হয়েছে।',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Helper handlers for editingProduct front image & variant inventory
  const handleSetFrontImageForEditProduct = (url: string) => {
    if (!editingProduct || !url) return;
    const trimmed = url.trim();
    if (!trimmed) return;

    const currentVariants = [...(editingProduct.imageVariants || [])];
    const existingIndex = currentVariants.findIndex(v => v.image === trimmed);

    let reorderedVariants: ProductImageVariant[] = [];
    if (existingIndex > -1) {
      const [target] = currentVariants.splice(existingIndex, 1);
      target.title = target.title || 'Front Cover Image';
      reorderedVariants = [target, ...currentVariants];
    } else if (currentVariants.length > 0 && (!currentVariants[0].image || currentVariants[0].image === editingProduct.image)) {
      currentVariants[0] = { ...currentVariants[0], image: trimmed, title: currentVariants[0].title || 'Front Cover Image' };
      reorderedVariants = currentVariants;
    } else {
      const newPrimaryVariant: ProductImageVariant = {
        id: `var-edit-front-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        image: trimmed,
        title: 'Front Cover Image (মূল ছবি)',
        sizeStocks: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 },
        stock: 0
      };
      reorderedVariants = [newPrimaryVariant, ...currentVariants];
    }

    reorderedVariants = syncVariantsWithBaseCode(reorderedVariants, editingProduct.code, editingProduct.code, false, editingProduct.id);

    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    reorderedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setEditingProduct({
      ...editingProduct,
      image: trimmed,
      images: reorderedVariants.slice(1).map(v => v.image),
      imageVariants: reorderedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    });
  };

  const handleRemoveFrontImageForEditProduct = () => {
    if (!editingProduct) return;
    const updatedVariants = syncVariantsWithBaseCode(
      (editingProduct.imageVariants || []).slice(1),
      editingProduct.code,
      editingProduct.code,
      false,
      editingProduct.id
    );
    const nextPrimary = updatedVariants[0]?.image || '';
    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setEditingProduct({
      ...editingProduct,
      image: nextPrimary,
      images: updatedVariants.slice(1).map(v => v.image),
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    });
  };

  const addImagesToEditProduct = (urls: string[]) => {
    if (!editingProduct || !urls || urls.length === 0) return;
    const currentVariants = editingProduct.imageVariants || [];
    const newVariants: ProductImageVariant[] = urls.map((url, idx) => ({
      id: `var-edit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${idx}`,
      image: url,
      title: `Variant ${currentVariants.length + idx + 1}`,
      sizeStocks: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 },
      stock: 0
    }));
    const updatedVariants = syncVariantsWithBaseCode(
      [...currentVariants, ...newVariants],
      editingProduct.code,
      editingProduct.code,
      false,
      editingProduct.id
    );
    const totalStock = updatedVariants.reduce<number>((sum: number, v) => sum + (v.stock || 0), 0);
    const primaryImg = editingProduct.image || updatedVariants[0]?.image || '';
    const secondaryImgs = updatedVariants.filter(v => v.image !== primaryImg).map(v => v.image);
    
    const aggregated: Record<string, number> = {};
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
      });
    });

    setEditingProduct({
      ...editingProduct,
      image: primaryImg,
      images: secondaryImgs,
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    });
  };

  const updateEditProductVariantSize = (variantId: string, size: string, qty: number) => {
    if (!editingProduct) return;
    const updatedVariants = (editingProduct.imageVariants || []).map(v => {
      if (v.id === variantId) {
        const updatedSizes = { ...(v.sizeStocks || {}), [size]: Math.max(0, qty) };
        const vStock = Object.values(updatedSizes).reduce<number>((sum: number, n: any) => sum + (Number(n) || 0), 0);
        return { ...v, sizeStocks: updatedSizes, stock: vStock };
      }
      return v;
    });

    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setEditingProduct({
      ...editingProduct,
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    });
  };

  const removeEditProductVariant = (variantId: string) => {
    if (!editingProduct) return;
    const updatedVariants = syncVariantsWithBaseCode(
      (editingProduct.imageVariants || []).filter(v => v.id !== variantId),
      editingProduct.code,
      editingProduct.code,
      false,
      editingProduct.id
    );
    const primaryImg = updatedVariants[0]?.image || '';
    const secondaryImgs = updatedVariants.slice(1).map(v => v.image);
    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setEditingProduct({
      ...editingProduct,
      image: primaryImg,
      images: secondaryImgs,
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    });
  };

  const setPrimaryEditProductVariant = (variantId: string) => {
    if (!editingProduct) return;
    const target = (editingProduct.imageVariants || []).find(v => v.id === variantId);
    if (!target) return;
    const remaining = (editingProduct.imageVariants || []).filter(v => v.id !== variantId);
    const reordered = syncVariantsWithBaseCode([target, ...remaining], editingProduct.code, editingProduct.code, false, editingProduct.id);
    setEditingProduct({
      ...editingProduct,
      image: target.image,
      images: reordered.slice(1).map(v => v.image),
      imageVariants: reordered
    });
  };

  const applyBulkPresetToEditProduct = () => {
    if (!editingProduct) return;
    const updatedVariants = (editingProduct.imageVariants || []).map(v => {
      const newSizes = { ...editBulkPreset };
      const vStock = Object.values(newSizes).reduce<number>((sum: number, n: any) => sum + (Number(n) || 0), 0);
      return { ...v, sizeStocks: newSizes, stock: vStock };
    });

    const aggregated: Record<string, number> = {};
    let totalStock = 0;
    updatedVariants.forEach(v => {
      Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
        aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
        totalStock += (Number(val) || 0);
      });
    });

    setEditingProduct({
      ...editingProduct,
      imageVariants: updatedVariants,
      sizeStocks: aggregated,
      stock: totalStock
    });
    Swal.fire({
      icon: 'success',
      title: 'প্রয়োগ সম্পন্ন!',
      text: 'সকল ইমেজ ভেরিয়েন্টে সাইজ ও কোয়ান্টিটি যুক্ত করা হয়েছে।',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const openEditProductModal = (p: Product) => {
    const buildVariants = (prod: Product) => {
      const baseCode = (prod.code || '').trim().toUpperCase() || getNextBaseProductCode(prod.id);
      let variants = prod.imageVariants ? [...prod.imageVariants] : [];
      if (variants.length === 0) {
        const allImgs = Array.from(new Set([prod.image, ...(prod.images || [])].filter(Boolean)));
        if (allImgs.length > 0) {
          variants = allImgs.map((img, idx) => ({
            id: `var-edit-${Date.now()}-${idx}`,
            image: img,
            title: `Variant ${idx + 1}`,
            code: prod.variantCodes?.[idx] || `${baseCode}-${idx + 1}`,
            sizeStocks: { ...(prod.sizeStocks || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 }) },
            stock: Object.values(prod.sizeStocks || {}).reduce((s, c) => s + (Number(c) || 0), 0) || prod.stock || 0
          }));
        }
      } else {
        variants = variants.map((v, idx) => ({
          ...v,
          code: v.code?.trim() || prod.variantCodes?.[idx] || `${baseCode}-${idx + 1}`
        }));
      }
      return variants;
    };

    setEditingProduct({
      ...p,
      imageVariants: buildVariants(p)
    });
    setEditProductUrlInput('');
    setEditFrontImageUrlInput('');
    setIsAddingProduct(false);

    // Hydrate full gallery & variants on-demand from server
    if (!p.imageVariants || p.imageVariants.length === 0) {
      fetch(apiUrl(`/api/admin/products/${p.id}`))
        .then(res => res.ok ? res.json() : null)
        .then((fullProd: Product | null) => {
          if (fullProd && fullProd.id === p.id) {
            setEditingProduct(prev => {
              if (!prev || prev.id !== p.id) return prev;
              return {
                ...prev,
                images: fullProd.images || prev.images,
                sizeChartImage: fullProd.sizeChartImage || prev.sizeChartImage,
                imageVariants: buildVariants(fullProd)
              };
            });
          }
        })
        .catch(() => {});
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // collection limit check - Max 5
    if (newProduct.isCollection) {
      const collectionCount = products.filter(p => p.isCollection).length;
      if (collectionCount >= 5) {
        Swal.fire({
          title: 'Limit Reached!',
          text: 'কালেকশনে সর্বোচ্চ ৫টি প্রোডাক্ট রাখা যাবে। (Maximum 5 products allowed in collection)',
          icon: 'warning',
          confirmButtonColor: '#000000',
        });
        return;
      }
    }

    let primaryImg = newProduct.image;
    let additionalImages = (newProduct.images || []).map(img => img.trim()).filter(Boolean);
    const finalImageVariants = (newProduct.imageVariants || []).filter(v => v.image && v.image.trim());
    let finalSizeStocks = { ...(newProduct.sizeStocks || {}) };
    let finalStock = newProduct.stock;

    if (finalImageVariants.length > 0) {
      primaryImg = finalImageVariants[0].image;
      additionalImages = finalImageVariants.slice(1).map(v => v.image);
      const aggregated: Record<string, number> = {};
      let totalStock = 0;
      finalImageVariants.forEach(v => {
        Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
          aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
          totalStock += (Number(val) || 0);
        });
      });
      finalSizeStocks = aggregated;
      finalStock = totalStock;
    } else if (Object.keys(finalSizeStocks).length > 0) {
      finalStock = Object.values(finalSizeStocks).reduce((sum: number, s) => sum + (Number(s) || 0), 0);
    }

    if (!primaryImg && finalImageVariants.length === 0) {
      Swal.fire({
        title: 'Image Required',
        text: 'অনুগ্রহ করে অন্তত একটি প্রোডাক্ট ইমেজ আপলোড করুন। (Please add at least one product image)',
        icon: 'warning',
        confirmButtonColor: '#000000'
      });
      return;
    }

    addProduct({
      name: newProduct.name,
      price: newProduct.price,
      oldPrice: newProduct.oldPrice,
      costPrice: newProduct.costPrice,
      image: primaryImg,
      description: newProduct.description,
      isHotSale: newProduct.isHotSale,
      isCollection: newProduct.isCollection,
      sizeChartImage: newProduct.sizeChartImage,
      category: newProduct.category || 'Basic',
      subCategory: newProduct.subCategory || '',
      code: newProduct.code,
      images: additionalImages,
      imageVariants: finalImageVariants,
      serial: newProduct.serial,
      stock: finalStock,
      sizePrices: newProduct.sizePrices,
      sizeStocks: finalSizeStocks
    });
    setIsAddingProduct(false);
    setNewProduct({ 
      name: '', 
      price: 0, 
      oldPrice: 0, 
      costPrice: 0,
      image: '', 
      description: '', 
      isHotSale: false, 
      isCollection: false, 
      sizeChartImage: '', 
      category: 'Basic', 
      subCategory: '',
      code: '', 
      images: [], 
      imageVariants: [],
      serial: 0, 
      stock: 0, 
      sizePrices: {}, 
      sizeStocks: {} 
    });
    setNewProductUrlInput('');
    setFrontImageUrlInput('');
    Swal.fire({
      title: 'Success!',
      text: 'Product with variant inventory has been added successfully.',
      icon: 'success',
      confirmButtonColor: '#000000',
    });
  };

  const handleAddHomeAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHomeAd) {
      updateHomeAd({
        id: editingHomeAd.id,
        title: newHomeAd.title,
        subtitle: newHomeAd.subtitle,
        imageUrl: newHomeAd.imageUrl,
        linkUrl: newHomeAd.linkUrl,
        isActive: newHomeAd.isActive
      });
      setEditingHomeAd(null);
      Swal.fire('Success', 'Ad updated successfully', 'success');
    } else {
      addHomeAd({
        title: newHomeAd.title,
        subtitle: newHomeAd.subtitle,
        imageUrl: newHomeAd.imageUrl,
        linkUrl: newHomeAd.linkUrl,
        isActive: newHomeAd.isActive
      });
      Swal.fire('Success', 'Ad created successfully', 'success');
    }
    setIsAddingHomeAd(false);
    setNewHomeAd({ title: '', subtitle: '', imageUrl: '', linkUrl: '', isActive: true });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      // collection limit check - Max 5
      const wasCollection = products.find(p => p.id === editingProduct.id)?.isCollection;
      if (editingProduct.isCollection && !wasCollection) {
        const collectionCount = products.filter(p => p.isCollection).length;
        if (collectionCount >= 5) {
          Swal.fire({
            title: 'Limit Reached!',
            text: 'কালেকশনে সর্বোচ্চ ৫টি প্রোডাক্ট রাখা যাবে। (Maximum 5 products allowed in collection)',
            icon: 'warning',
            confirmButtonColor: '#000000',
          });
          return;
        }
      }

      let primaryImg = editingProduct.image;
      let additionalImages = (editingProduct.images || []).map(img => img.trim()).filter(Boolean);
      const finalImageVariants = (editingProduct.imageVariants || []).filter(v => v.image && v.image.trim());
      let finalSizeStocks = { ...(editingProduct.sizeStocks || {}) };
      let finalStock = editingProduct.stock;

      if (finalImageVariants.length > 0) {
        primaryImg = finalImageVariants[0].image;
        additionalImages = finalImageVariants.slice(1).map(v => v.image);
        const aggregated: Record<string, number> = {};
        let totalStock = 0;
        finalImageVariants.forEach(v => {
          Object.entries(v.sizeStocks || {}).forEach(([sz, val]) => {
            aggregated[sz] = (aggregated[sz] || 0) + (Number(val) || 0);
            totalStock += (Number(val) || 0);
          });
        });
        finalSizeStocks = aggregated;
        finalStock = totalStock;
      } else if (Object.keys(finalSizeStocks).length > 0) {
        finalStock = Object.values(finalSizeStocks).reduce((sum: number, s) => sum + (Number(s) || 0), 0);
      }

      const updatedProduct = {
        ...editingProduct,
        image: primaryImg,
        images: additionalImages,
        imageVariants: finalImageVariants,
        sizeStocks: finalSizeStocks,
        stock: finalStock
      };

      updateProduct(updatedProduct);
      setEditingProduct(null);
      setEditProductUrlInput('');
      Swal.fire({
        title: 'Updated!',
        text: 'Product information and inventory updated successfully.',
        icon: 'success',
        confirmButtonColor: '#000000',
      });
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      updateCoupon({ ...editingCoupon, code: newCoupon.code, discountValue: newCoupon.discountValue, discountType: newCoupon.discountType, isActive: newCoupon.isActive, startDate: newCoupon.startDate, expiryDate: newCoupon.expiryDate });
      setEditingCoupon(null);
      Swal.fire('Updated!', 'Coupon information has been updated successfully.', 'success');
    } else {
      addCoupon(newCoupon);
      Swal.fire('Success!', 'New coupon has been created successfully.', 'success');
    }
    setIsAddingCoupon(false);
    setNewCoupon({ code: '', discountValue: 0, discountType: 'percentage', isActive: true, startDate: '', expiryDate: '' });
  };

  const exportOrdersToExcel = (filteredOrders: any[]) => {
    const data = filteredOrders.flatMap(order => {
      const { actualShipping, actualTotalPayable } = getOrderTotals(order);

      return order.items.map((item: any) => ({
        'Order ID': formatOrderId(order.id),
        'Date': formatDate(order.date),
        'Customer Name': order.customer?.name || 'N/A',
        'Phone': order.customer?.phone || 'N/A',
        'Email': order.customer?.email || 'N/A',
        'District': order.customer?.district || 'N/A',
        'Address': order.customer?.address || 'N/A',
        'Product Name': item.name,
        'Size': item.selectedSize || 'N/A',
        'Quantity': item.quantity,
        'Unit Price': item.price,
        'Item Total': item.price * item.quantity,
        'Coupon': order.couponCode || 'None',
        'Subtotal': order.subtotal,
        'Discount': order.discount,
        'Shipping': actualShipping,
        'Total Payable': actualTotalPayable,
        'Order Status': order.status.toUpperCase(),
        'Payment Status': 'COD'
      }));
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Detailed Orders');
    
    // Auto-size columns
    const max_width = data.reduce((w, r) => Math.max(w, Object.values(r).join('').length), 10);
    ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: 25 }));
    
    XLSX.writeFile(wb, `TrendyCartBD_Detailed_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      updateSlide({ ...editingSlide, ...newSlide });
      setEditingSlide(null);
    } else {
      addSlide(newSlide);
    }
    setIsAddingSlide(false);
    setNewSlide({ title: '', subtitle: '', image: '', tagText: '', link: '' });
  };

  const handleAddCategoryBanner = (e: React.FormEvent) => {
    e.preventDefault();
    addCategoryBanner(newCategoryBanner);
    setIsAddingCategoryBanner(false);
    setNewCategoryBanner({ title: '', subtitle: '', image: '', link: '' });
  };

  const handleUpdateCategoryBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategoryBanner) {
      updateCategoryBanner(editingCategoryBanner);
      setEditingCategoryBanner(null);
      Swal.fire({
        title: 'Updated!',
        text: 'Category banner has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#000000',
      });
    }
  };

  const handleAddLookbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLookbook) {
      updateLookbookImage({
        id: editingLookbook.id,
        image: newLookbook.image,
        link: newLookbook.link,
        className: newLookbook.className,
        widthPercent: newLookbook.widthPercent,
        heightPercent: newLookbook.heightPercent,
        serial: Number(newLookbook.serial) || 1,
        title: newLookbook.title
      });
      setEditingLookbook(null);
      Swal.fire({
        title: 'Updated!',
        text: 'Lookbook item updated successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      addLookbookImage({
        image: newLookbook.image,
        link: newLookbook.link,
        className: newLookbook.className,
        widthPercent: newLookbook.widthPercent,
        heightPercent: newLookbook.heightPercent,
        serial: Number(newLookbook.serial) || 1,
        title: newLookbook.title
      });
      Swal.fire({
        title: 'Saved!',
        text: 'Lookbook item added successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
    setIsAddingLookbook(false);
    setNewLookbook({ image: '', link: '', className: 'col-span-1 row-span-1', widthPercent: '100%', heightPercent: 'auto', serial: 1, title: '' });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSubject && emailBody) {
      
      Swal.fire({
        title: emailTarget === 'all' ? 'Sending Newsletter...' : 'Sending Email...',
        text: `Delivering to ${emailTarget === 'all' ? 'all subscribers' : emailTarget}...`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch(apiUrl('/api/send-newsletter'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            target: emailTarget,
            subject: emailSubject,
            body: emailBody,
            image: newsletterImage,
            subscribers: subscribers.map(s => s.email)
          })
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire('Sent!', emailTarget === 'all' ? 'Newsletter successfully sent!' : 'Email successfully sent!', 'success');
          setIsSendingEmail(false);
          setEmailSubject('');
          setEmailBody('');
          setNewsletterImage('');
          setEmailTarget('all');
        } else {
          Swal.fire('Error', data.error || (emailTarget === 'all' ? 'Failed to send newsletter.' : 'Failed to send email.'), 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'An unexpected error occurred.', 'error');
      }
    }
  };

  const handleAddPopupAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPopupAd) {
      updatePopupAd(editingPopupAd.id, {
        imageUrl: newPopupAd.imageUrl,
        linkUrl: newPopupAd.linkUrl,
        isActive: newPopupAd.isActive,
        pages: newPopupAd.pagesString.split(',').map(s => s.trim()).filter(Boolean)
      });
      setEditingPopupAd(null);
    } else {
      addPopupAd({
        imageUrl: newPopupAd.imageUrl,
        linkUrl: newPopupAd.linkUrl,
        isActive: newPopupAd.isActive,
        pages: newPopupAd.pagesString.split(',').map(s => s.trim()).filter(Boolean)
      });
    }
    setIsAddingPopupAd(false);
    setNewPopupAd({ imageUrl: '', linkUrl: '', isActive: true, pagesString: 'all' });
  };

  const handleAddFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFAQ) {
      updateFAQ({ ...editingFAQ, question: newFAQ.question, answer: newFAQ.answer });
      setEditingFAQ(null);
      Swal.fire('Success', 'FAQ updated successfully', 'success');
    } else {
      addFAQ(newFAQ);
      Swal.fire('Success', 'FAQ created successfully', 'success');
    }
    setNewFAQ({ question: '', answer: '' });
    setIsAddingFAQ(false);
  };

  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPolicy) {
      updatePolicy({ ...editingPolicy, title: newPolicy.title, content: newPolicy.content });
      setEditingPolicy(null);
      Swal.fire('Success', 'Policy updated successfully', 'success');
    } else {
      addPolicy({ key: newPolicy.key, title: newPolicy.title, content: newPolicy.content });
      Swal.fire('Success', 'Policy created successfully', 'success');
    }
    setNewPolicy({ key: 'custom', title: '', content: '' });
    setIsAddingPolicy(false);
  };

  const orderToDisplay = isEditingOrder && editingOrderState ? editingOrderState : selectedOrderForView;

  return (
    <div className="flex-1 w-full bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row min-h-screen transition-colors duration-300">
      {/* Sidebar/Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 lg:p-6 flex flex-col h-full"
          >
            <div className="border-b dark:border-gray-800 pb-4 mb-4">
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 group-hover:text-blue-600 transition-colors">Admin Panel</h2>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 w-32 h-32 rounded-full border-2 border-gray-100 p-0.5 overflow-hidden shadow-sm"
                >
                  {currentAdmin?.image ? (
                    <img src={currentAdmin.image} alt="Admin"  className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                      <UserCircle className="w-8 h-8" />
                    </div>
                  )}
                </motion.div>
                <div className="text-center mt-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{currentAdmin?.name || 'Main Admin'}</p>
                </div>
              </div>

              {currentAdmin && (
                <div className="mt-2 text-xs">
                  <span className="font-bold text-gray-400 block uppercase tracking-wide">Logged in as:</span>
                  <span className="font-extrabold text-black block truncate text-[11px]" title={currentAdmin.email}>{currentAdmin.email}</span>
                  {currentAdmin.role === 'super' ? (
                    <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 border border-amber-200">
                      👑 Super Admin
                    </span>
                  ) : (
                    <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 border border-blue-200">
                      💼 Staff Admin
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search menu..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-black transition-all"
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
              />
            </div>
            
            <nav className="space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden pr-1">
              {/* Dashboard Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.dashboard) && (!adminSearchQuery || "Dashboard".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Home className="h-4.5 w-4.5" /> Dashboard
                </motion.button>
              )}
    
              {/* Product Management Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.products) && (!adminSearchQuery || "Product Management".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('shop')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'shop' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Package className="h-4.5 w-4.5" /> Product Management
                </motion.button>
              )}

              {/* Price Analysis Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.products) && (!adminSearchQuery || "Price Analysis".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('analysis')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'analysis' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <TrendingUp className="h-4.5 w-4.5 " /> Price Analysis
                </motion.button>
              )}
    
              {/* Categories Banner Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.categoryBanners) && (!adminSearchQuery || "Categories Banner".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('categoriesBanner')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'categoriesBanner' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Layout className="h-4.5 w-4.5" /> Categories Banner
                </motion.button>
              )}
    
              {/* New Categories Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.categories) && (!adminSearchQuery || "Categories".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('categories')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'categories' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Layers className="h-4.5 w-4.5" /> Categories
                </motion.button>
              )}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.lookbook) && (!adminSearchQuery || "Lookbook".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('lookbook')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'lookbook' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Camera className="h-4.5 w-4.5" /> Lookbook
                </motion.button>
              )}
    
              {/* Orders Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.orders) && (!adminSearchQuery || "Orders".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ShoppingBag className="h-4.5 w-4.5" /> Orders
                </motion.button>
              )}
    
              {/* Coupons Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.coupons) && (!adminSearchQuery || "Coupons".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('coupons')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'coupons' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Ticket className="h-4.5 w-4.5" /> Coupons
                </motion.button>
              )}

              {/* Reviews Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.reviews) && (!adminSearchQuery || "Reviews".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('reviews')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <div className="relative">
                    <MessageSquare className="h-4.5 w-4.5" />
                    {reviews.filter(r => r.status === 'pending').length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border border-white"></span>
                    )}
                  </div>
                  Reviews
                </motion.button>
              )}
    
              {/* Slides Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.slides) && (!adminSearchQuery || "Slides".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('slides')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'slides' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Layout className="h-4.5 w-4.5" /> Slides
                </motion.button>
              )}
    
              {/* Ads Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.ads) && (
                <>
                  {(!adminSearchQuery || "Announcements".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => changeTab('announcements')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'announcements' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Bell className="h-4.5 w-4.5" /> Announcements
                    </motion.button>
                  )}
                  {(!adminSearchQuery || "Ads".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => changeTab('ads')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'ads' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Megaphone className="h-4.5 w-4.5" /> Ads
                    </motion.button>
                  )}
                  {(!adminSearchQuery || "Social Media".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => changeTab('socials')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'socials' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Share2 className="h-4.5 w-4.5" /> Social Media
                    </motion.button>
                  )}
                </>
              )}
    
              {/* FAQs Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.faqs) && (!adminSearchQuery || "FAQs".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('faqs')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'faqs' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <MessageSquare className="h-4.5 w-4.5" /> FAQs
                </motion.button>
              )}
    
              {/* Subscribers Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.subscribers) && (!adminSearchQuery || "Subscribers".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('subscribers')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'subscribers' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Users className="h-4.5 w-4.5" /> Subscribers
                </motion.button>
              )}
    
              {/* Messages Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.messages) && (
                <>
                  {(!adminSearchQuery || "Messages".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => changeTab('messages')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'messages' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Mail className="h-4.5 w-4.5" /> Messages
                    </motion.button>
                  )}
                  {(!adminSearchQuery || "Contact Info".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => changeTab('contactinfo')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'contactinfo' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Phone className="h-4.5 w-4.5" /> Contact Info
                    </motion.button>
                  )}
                </>
              )}
    
              {/* Policies Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.policies) && (!adminSearchQuery || "Policies".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('policies')}
                  className={`w-full flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'policies' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <ShieldCheck className="h-4.5 w-4.5" /> Policies
                </motion.button>
              )}
 
              {/* OTP List Button */}
              {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.otps) && (!adminSearchQuery || "OTP List".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('otps')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'otps' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Key className="h-4.5 w-4.5" /> OTPs
                </motion.button>
              )}
 
              {/* Manage Admins Button (SUPER ADMIN ONLY) */}
              {currentAdmin?.role === 'super' && (!adminSearchQuery || "Manage Admins".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab('admins')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'admins' ? 'bg-amber-600 text-white' : 'text-amber-700 bg-amber-50 hover:bg-amber-100'}`}
                >
                  Manage Admins
                </motion.button>
              )}
    
              {/* Personal Section */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Settings & Profile</span>
                {currentAdmin?.role === 'super' && (!adminSearchQuery || "Global Settings".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => changeTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap mb-1 ${activeTab === 'settings' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Settings className="h-4.5 w-4.5" /> Global Settings
                  </motion.button>
                )}
                {(!adminSearchQuery || "My Profile".toLowerCase().includes(adminSearchQuery.toLowerCase())) && (
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => changeTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <UserCircle className="h-4.5 w-4.5" /> My Profile
                  </motion.button>
                )}
              </div>
            </nav>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={logoutAdmin} 
              className="mt-6 flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 font-bold hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" /> Logout
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div ref={mainScrollRef} className="flex-1 p-6 md:p-10 hide-scrollbar overflow-auto relative bg-gray-50 dark:bg-gray-950 transition-colors">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          {/* Toggle Sidebar Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95"
            title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            <Layout className="h-4 w-4" /> {isSidebarOpen ? "Minimize Sidebar" : "Expand Menu"}
          </button>

          {/* Premium Notification Center */}
          {(currentAdmin?.role === 'super' || currentAdmin?.permissions?.notifications) && (
            <div className="relative">
              {/* Notification Bell Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-3 rounded-xl border transition-all flex items-center justify-center ${
                  isNotifOpen 
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md' 
                    : 'bg-white dark:bg-gray-950 text-gray-750 dark:text-gray-300 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white shadow-sm'
                }`}
              >
                <Bell className="h-[18px] w-[18px]" />
                {/* Glowing Indicator Badge - Green for New/Pending Orders, Red for Low Stock Alerts, Blue for Reviews */}
                {(unreadPendingOrders.length + lowStockProducts.length + unreadPendingReviews.length) > 0 && (
                  <span className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-black text-white border border-white dark:border-gray-900 animate-pulse ${
                    unreadPendingOrders.length > 0 ? 'bg-green-600' : (unreadPendingReviews.length > 0 ? 'bg-blue-600' : 'bg-red-600')
                  }`}>
                    {unreadPendingOrders.length + lowStockProducts.length + unreadPendingReviews.length}
                  </span>
                )}
              </motion.button>
  
              {/* Notification Dropdown Panel */}
              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    {/* Overlay Click-Away Trap */}
                    <div className="fixed inset-0 z-30 pointer-events-auto" onClick={() => setIsNotifOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl z-40 overflow-hidden text-left"
                    >
                      {/* Header */}
                      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white">Notification Center</h3>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">অ্যালার্ট ও নোটিফিকেশন</p>
                        </div>
                        
                        {/* Subtitle / Mark All */}
                        {notifTab === 'orders' && unreadPendingOrders.length > 0 && (
                          <button 
                            onClick={() => {
                              const unreadIds = pendingOrders.filter(o => !readOrderIds.includes(o.id)).map(o => o.id);
                              setReadOrderIds(prev => [...prev, ...unreadIds]);
                            }}
                            className="text-[10px] font-black uppercase text-gray-500 hover:text-black dark:hover:text-white tracking-wider bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                          >
                            Mark All Read
                          </button>
                        )}
  
                        {notifTab === 'reviews' && unreadPendingReviews.length > 0 && (
                          <button 
                            onClick={() => {
                              const unreadIds = pendingReviews.filter(r => !readReviewIds.includes(r.id)).map(r => r.id);
                              setReadReviewIds(prev => [...prev, ...unreadIds]);
                            }}
                            className="text-[10px] font-black uppercase text-gray-500 hover:text-black dark:hover:text-white tracking-wider bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                          >
                            Mark All Read
                          </button>
                        )}
                      </div>
  
                      {/* Navigation Tabs */}
                      <div className="flex border-b border-gray-100 dark:border-gray-800 text-xs font-black uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50">
                        <button
                          onClick={() => setNotifTab('orders')}
                          className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                            notifTab === 'orders'
                              ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white bg-white dark:bg-gray-950/40 font-black'
                              : 'border-transparent text-gray-400 hover:text-gray-900'
                          }`}
                        >
                          New Orders 
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                            unreadPendingOrders.length > 0 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' 
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                          }`}>
                            {unreadPendingOrders.length}
                          </span>
                        </button>
  
                        <button
                          onClick={() => setNotifTab('reviews')}
                          className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                            notifTab === 'reviews'
                              ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white bg-white dark:bg-gray-950/40 font-black'
                              : 'border-transparent text-gray-400 hover:text-gray-900'
                          }`}
                        >
                          Reviews 
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                            unreadPendingReviews.length > 0 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                          }`}>
                            {unreadPendingReviews.length}
                          </span>
                        </button>
                        
                        <button
                          onClick={() => setNotifTab('stock')}
                          className={`flex-1 py-3 text-center transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                            notifTab === 'stock'
                              ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white bg-white dark:bg-gray-950/40 font-black'
                              : 'border-transparent text-gray-400 hover:text-gray-900'
                          }`}
                        >
                          Stock Alerts
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                            lowStockProducts.length > 0 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' 
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                          }`}>
                            {lowStockProducts.length}
                          </span>
                        </button>
                      </div>
  
                      {/* Scrollable Content Container */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 p-2">
                        {/* TAB 1: NEW/PENDING ORDERS */}
                        {notifTab === 'orders' && (
                          <>
                            {pendingOrders.length === 0 ? (
                              <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                                <ShoppingBag className="h-8 w-8 opacity-20" />
                                <p className="font-bold uppercase tracking-wider text-[10px]">সব অর্ডার প্রসেস করা হয়েছে! 🎉</p>
                                <p className="text-[9px] opacity-70">No pending orders waiting for you.</p>
                              </div>
                            ) : (
                              pendingOrders.map(order => {
                                const isUnread = !readOrderIds.includes(order.id);
                                return (
                                  <div 
                                    key={order.id}
                                    onClick={() => {
                                      if (isUnread) {
                                        setReadOrderIds(prev => [...prev, order.id]);
                                      }
                                      setOrderSearchQuery(order.id);
                                      setAppliedOrderQuery(order.id);
                                      setOrderStatusFilter('all');
                                      setAppliedOrderStatusFilter('all');
                                      setSelectedOrderForView(order);
                                      setActiveTab('orders');
                                      setIsNotifOpen(false);
                                    }}
                                    className={`p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all flex justify-between items-center gap-3 border ${
                                      isUnread 
                                        ? 'bg-green-50/40 border-green-150 dark:bg-green-950/10 dark:border-green-900/30' 
                                        : 'border-transparent bg-white dark:bg-gray-900'
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-xs text-gray-900 dark:text-white">#{formatOrderId(order.id)}</span>
                                        {isUnread && (
                                          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                                        )}
                                      </div>
                                      <p className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase truncate">{order.customer.name}</p>
                                      <p className="text-[9px] text-gray-500 flex items-center gap-1.5 mt-0.5 font-bold">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        {formatDate(order.date)} • {formatTime(order.date)}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-black text-gray-900 dark:text-white">৳{getOrderTotals(order).actualTotalPayable}</p>
                                      <span className="text-[8px] font-black uppercase text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded mt-1 inline-block">Pending</span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </>
                        )}
  
                        {/* TAB 2: PENDING REVIEWS */}
                        {notifTab === 'reviews' && (
                          <>
                            {pendingReviews.length === 0 ? (
                              <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                                <MessageSquare className="h-8 w-8 opacity-20" />
                                <p className="font-bold uppercase tracking-wider text-[10px]">সব রিভিউ চেক করা হয়েছে! 🌟</p>
                                <p className="text-[9px] opacity-70">No pending reviews waiting for approval.</p>
                              </div>
                            ) : (
                              pendingReviews.map(review => {
                                const isUnread = !readReviewIds.includes(review.id);
                                const reviewProduct = products.find(p => p.id === review.productId);
                                return (
                                  <div 
                                    key={review.id}
                                    onClick={() => {
                                      if (isUnread) {
                                        setReadReviewIds(prev => [...prev, review.id]);
                                      }
                                      setActiveTab('reviews');
                                      setIsNotifOpen(false);
                                    }}
                                    className={`p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all flex justify-between items-center gap-3 border ${
                                      isUnread 
                                        ? 'bg-blue-50/40 border-blue-150 dark:bg-blue-950/10 dark:border-green-900/30' 
                                        : 'border-transparent bg-white dark:bg-gray-900'
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-black text-xs text-gray-900 dark:text-white uppercase tracking-tight">{review.userName}</span>
                                        {isUnread && (
                                          <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                                        )}
                                      </div>
                                      <div className="flex gap-0.5 mt-1">
                                        {[1,2,3,4,5].map(s => (
                                          <Star key={s} size={8} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                                        ))}
                                      </div>
                                      <p className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase truncate">{reviewProduct?.name || 'Unknown Product'}</p>
                                      <p className="text-[9px] text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium italic line-clamp-1">
                                        "{review.comment}"
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded mt-1 inline-block">Pending</span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </>
                        )}
  
                        {/* TAB 2: INVENTORY STOCK ALERTS */}
                        {notifTab === 'stock' && (
                          <>
                            {lowStockProducts.length === 0 ? (
                              <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                                <PackageCheck className="h-8 w-8 opacity-20" />
                                <p className="font-bold uppercase tracking-wider text-[10px]">স্টক লেভেল একদম ঠিক আছে! 👍</p>
                                <p className="text-[9px] opacity-70">No products have critically low inventory.</p>
                              </div>
                            ) : (
                              lowStockProducts.map(p => {
                                return (
                                  <div 
                                    key={p.id}
                                    onClick={() => {
                                      openEditProductModal(p);
                                      setActiveTab(p.isCollection ? 'collection' : 'shop');
                                      setIsNotifOpen(false);
                                      
                                      // Smooth scroll to the product form block
                                      setTimeout(() => {
                                        const element = document.getElementById('edit-product-form') || document.querySelector('form');
                                        if (element) {
                                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }
                                      }, 200);
                                    }}
                                    className="p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all flex items-center gap-3 bg-white dark:bg-gray-900 border border-transparent"
                                  >
                                    <img 
                                      src={p.image} 
                                      alt={p.name} 
                                      className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 dark:border-gray-800 shrink-0" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">{p.name}</h4>
                                      <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">Code: {p.code || 'None'} • {p.category}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
                                        {p.stock <= 0 ? 'Stock Out' : `${p.stock} Left`}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {/* Dashboard Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Welcome Dashboard Animation */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="w-48 h-48 shrink-0">
              <img src="https://www.nottingham.ac.uk/Brand/LegacyAssets/images-multimedia/2022/Illustration/Scale500x500.jpg" alt="Welcome" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-black uppercase text-gray-900 tracking-tight">Welcome, {currentAdmin?.name?.split('@')[0]}!</h1>
                <p className="mt-2 text-gray-500 font-medium max-w-xl">
                  Welcome to your TRENDY CART BD administration dashboard. Here you can manage your shop products, track customer orders, update your lookbook styles, and manage your hero banners seamlessly. 
                </p>
                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">System Online</span>
                    </div>
                    <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Role: {currentAdmin?.role}</span>
                    </div>

                    {dbStatus?.connected ? (
                      <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2" title="Data is synchronized with cloud database">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Database Connected</span>
                      </div>
                    ) : dbStatus ? (
                      <div className="px-4 py-2 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-2" title="Data stored in local file fallback DB">
                        <span className="w-2 h-2 bg-rose-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">⚠️ Database Not Connected</span>
                      </div>
                    ) : null}
                  </div>

                  {dbStatus && !dbStatus.connected && (
                    <div className="mt-2 text-left bg-rose-50/50 border border-rose-100 p-5 rounded-2xl max-w-2xl">
                      <h4 className="text-xs font-black uppercase tracking-widest text-rose-800 flex items-center gap-2">
                        <span>⚠️ MongoDB কানেকশন সমস্যা ও সমাধান গাইড</span>
                      </h4>
                      <p className="mt-1 text-xs text-rose-600 font-medium">
                        ক্লাউড ডাটাবেজ কানেক্ট করা যায়নি। নিচের বিষয়গুলো চেক করুন:
                      </p>
                      
                      {dbStatus.error && (
                        <div className="mt-3 bg-white/80 border border-rose-100 p-3 rounded-xl font-mono text-[10px] text-rose-700 overflow-x-auto whitespace-pre-wrap">
                          <strong>Error details:</strong> {dbStatus.error}
                        </div>
                      )}

                      <ul className="mt-3 space-y-2 text-xs text-gray-600 list-disc list-inside">
                        <li>
                          <strong className="text-gray-900">Network IP Access (Vercel-এর জন্য আবশ্যিক):</strong> MongoDB Atlas ড্যাশবোর্ডে যান, বাম পাশের মেনু থেকে <span className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold">Network Access</span> এ ক্লিক করুন। এরপর <span className="font-bold">Add IP Address</span> এ চাপ দিয়ে <span className="text-rose-700 font-black">Allow Access From Anywhere (0.0.0.0/0)</span> সিলেক্ট করে Confirm করুন। (Vercel ডায়নামিক IP ব্যবহার করে, তাই 0.0.0.0/0 ছাড়া Vercel থেকে MongoDB কানেক্ট হবে না)।
                        </li>
                        <li>
                          <strong className="text-gray-900">Environment Variable চেক করুন:</strong> Vercel Project Settings &rarr; Environment Variables এ গিয়ে <span className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold">MONGODB_URI</span> যুক্ত করে একবার Redeploy দিন।
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <SummaryCard title="Orders" count={orders.filter(o => o.status !== 'cancelled').length} icon={ShoppingBag} />
              <SummaryCard title="Pending" count={orders.filter(o => o.status === 'pending').length} icon={Package} />
              <SummaryCard title="Processing" count={orders.filter(o => o.status === 'processing').length} icon={Clock} />
              <SummaryCard title="Shipped" count={orders.filter(o => o.status === 'shipped').length} icon={Truck} />
              <SummaryCard title="Delivered" count={orders.filter(o => o.status === 'delivered').length} icon={CheckCircle} />
              <SummaryCard title="Cancelled" count={orders.filter(o => o.status === 'cancelled').length} icon={XCircle} />
              <SummaryCard title="Total Items" count={products.length} icon={ShoppingBasket} />
              <SummaryCard 
                title="Total Stock" 
                count={products.reduce((sum, p) => sum + (p.stock || 0), 0)} 
                icon={PackageCheck} 
                alert={lowStockCount > 0 ? (
                  <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 animate-pulse" title={`${lowStockCount} product(s) below 5 items left`}>
                    ⚠️ {lowStockCount} Low
                  </span>
                ) : undefined}
              />
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                    <DollarSign className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Sales</p>
                   <p className="text-xl font-black">৳{activeOrders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Status Breakdown Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Order Status Distribution</h3>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="h-[250px] w-full min-h-[250px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: '#94a3b8' },
                        { name: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: '#3b82f6' },
                        { name: 'Shipped', count: orders.filter(o => o.status === 'shipped').length, color: '#a855f7' },
                        { name: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: '#10b981' },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={8} fontWeight={700} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} textAnchor="middle" height={40} />
                      <YAxis fontSize={8} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {[
                          { name: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: '#94a3b8' },
                          { name: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: '#3b82f6' },
                          { name: 'Shipped', count: orders.filter(o => o.status === 'shipped').length, color: '#a855f7' },
                          { name: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: '#10b981' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Order Trend Area Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Recent Sales Trend</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">টাকার বিক্রয় বিশ্লেষণ ও প্রবৃদ্ধি</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select 
                      value={chartTimeframe}
                      onChange={(e) => setChartTimeframe(e.target.value as any)}
                      className="text-xs bg-gray-50 border border-gray-150 hover:border-gray-400 dark:bg-gray-905 dark:border-gray-800 rounded-xl px-3 py-2 font-black cursor-pointer transition-all outline-none"
                    >
                      <option value="last-30-days">Last 30 Days</option>
                      <option value="this-month">This Month</option>
                      <option value="custom">Custom Range</option>
                    </select>

                    {chartTimeframe === 'custom' && (
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-1.5 rounded-xl">
                        <input 
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="bg-transparent text-[11px] font-bold border-none outline-none text-gray-700 dark:text-gray-300 focus:ring-0 p-1"
                        />
                        <span className="text-[10px] uppercase font-black text-gray-400">to</span>
                        <input 
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="bg-transparent text-[11px] font-bold border-none outline-none text-gray-700 dark:text-gray-300 focus:ring-0 p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-[250px] w-full min-h-[250px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getFilteredOrdersForTrend()}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" fontSize={8} fontWeight={700} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <YAxis fontSize={8} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                        formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Total Sales']}
                      />
                      <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Best Selling Products */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Best Selling Products</h3>
                <ShoppingBasket className="h-4 w-4 text-gray-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {bestSellingProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 border border-gray-100 cursor-pointer hover:border-black transition-all" onClick={() => window.open(`/product/${product.id}`, '_blank')}>
                    <span className="text-xl font-black text-gray-300">#{index + 1}</span>
                    {product.image && <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold">{product.totalSold} Sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="mt-6">
              {/* Category distribution chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Product Categories Distribution</h3>
                  <Package className="h-4 w-4 text-gray-400" />
                </div>
                <div className="h-[300px] w-full min-h-[300px] overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Array.from(new Set(products.map(p => p.category))).map(cat => ({
                          name: cat,
                          value: products.filter(p => p.category === cat).length
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {Array.from(new Set(products.map(p => p.category))).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && <AdminReviewsView />}

        {/* Profile Tab Content */}
        {activeTab === 'profile' && currentAdmin && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8 border-b border-gray-50 pb-8 mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 bg-gray-100 flex items-center justify-center">
                    {currentAdmin.image ? (
                      <img src={currentAdmin.image} alt={currentAdmin.name || currentAdmin.email} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            Swal.fire('Error', 'Image size should be less than 2MB', 'error');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const base64 = reader.result as string;
                            const res = await updateProfile({ image: base64 });
                            if (res.success) {
                              Swal.fire('Success', 'Profile image updated!', 'success');
                            } else {
                              Swal.fire('Error', res.error || 'Failed to update image', 'error');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h2 className="text-2xl font-black text-gray-900">{currentAdmin.name || 'Admin User'}</h2>
                    {currentAdmin.role === 'super' && <ShieldAlert className="w-5 h-5 text-amber-500" />}
                  </div>
                  <p className="text-gray-500 font-medium">{currentAdmin.email}</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-full border border-amber-100">
                      {currentAdmin.role} Role
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-full border border-blue-100">
                      Active Account
                    </span>
                  </div>
                </div>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('name') as string;
                  const email = formData.get('email') as string;
                  const password = formData.get('password') as string;
                  const confirmPassword = formData.get('confirm_password') as string;

                  if (password && password !== confirmPassword) {
                    Swal.fire('Error', 'Passwords do not match', 'error');
                    return;
                  }

                  const updates: any = { name, email };
                  if (password) updates.password = password;

                  setIsSavingProfile(true);
                  const res = await updateProfile(updates);
                  setIsSavingProfile(false);
                  
                  if (res.success) {
                    Swal.fire('Updated!', 'Profile updated successfully.', 'success');
                  } else {
                    Swal.fire('Error', res.error || 'Update failed', 'error');
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                  <input name="name" defaultValue={currentAdmin.name} placeholder="Your Name" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-black focus:outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                  <input name="email" defaultValue={currentAdmin.email} type="email" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-black focus:outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Password (Leave blank to keep current)</label>
                  <input name="password" type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-black focus:outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirm New Password</label>
                  <input name="confirm_password" type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-black focus:outline-none transition-all" />
                </div>
                <div className="md:col-span-2 pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={isSavingProfile}
                    className="relative px-8 py-3 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-black/10 transition-all hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center w-full md:w-auto"
                  >
                    <span className={isSavingProfile ? 'opacity-0' : 'opacity-100'}>Save Profile Changes</span>
                    {isSavingProfile && <Loader2 className="animate-spin h-4 w-4 absolute" />}
                  </motion.button>
                </div>
              </form>
            </div>

            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Security Note</h4>
                <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">
                  You are logged in with {currentAdmin.role} permissions. Any changes you make to your profile will be reflected across the administrative dashboard. Please ensure your new password meets security guidelines.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Product Management Modals (Shared for Shop and Collection) */}
        {isAddingProduct && (activeTab === 'shop' || activeTab === 'collection') && (
          <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-md p-4 pt-16 md:pt-20 pb-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl relative flex flex-col max-h-[100vh] sm:max-h-[82vh] overflow-hidden border border-gray-100"
            >
              {/* Sticky Header */}
              <div className="flex items-center justify-between px-6 py-6 pt-8 md:px-10 md:py-8 md:pt-10 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center gap-4">
                  <div className="bg-black text-white p-3 rounded-2xl shadow-lg shadow-black/10">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xl md:text-2xl text-gray-900 tracking-tight">{newProduct.isCollection ? 'Add to Collection' : 'Add New Product'}</h3>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configure your product listings in detail</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsAddingProduct(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-3 rounded-xl transition-all bg-gray-50 hover:scale-105 active:scale-95">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto w-full">
                <form id="add-product-form" onSubmit={handleAddProduct} className="flex flex-col gap-8 p-6 md:p-10">
                  
                  {/* Section 1: General Product Information & Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs">
                    <div className="md:col-span-2 border-b border-gray-100 pb-3">
                      <h4 className="font-black uppercase tracking-widest text-xs md:text-sm text-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-black" /> Product Information & Pricing
                      </h4>
                    </div>

                    {/* Name */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Product Title *</label>
                      <input required className="w-full border-2 border-gray-100 rounded-2xl p-4 text-base font-bold focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder:font-normal placeholder:text-gray-300 bg-gray-50 focus:bg-white" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Premium Cotton Casual Shirt" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Description *</label>
                      <textarea required className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors h-24 resize-none placeholder:text-gray-300 custom-scrollbar" value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} placeholder="Detailed description of the product, fabric, care instructions..." />
                    </div>

                    {/* Category & Sub-Category */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Category *</label>
                      <select 
                        required 
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors appearance-none" 
                        value={newProduct.category} 
                        onChange={e => setNewProduct({...newProduct, category: e.target.value, subCategory: ''})}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Sub-Category (সাব-ক্যাটাগরি)</label>
                      {(() => {
                        const selectedCatObj = categories.find(c => c.name === newProduct.category);
                        const subOpts = selectedCatObj?.subCategories || [];
                        return subOpts.length > 0 ? (
                          <select
                            className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors appearance-none"
                            value={newProduct.subCategory || ''}
                            onChange={e => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                          >
                            <option value="">-- Select Sub-Category (Optional) --</option>
                            {subOpts.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors placeholder:font-normal placeholder:text-gray-300"
                            value={newProduct.subCategory || ''}
                            onChange={e => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                            placeholder="Optional sub-category..."
                          />
                        );
                      })()}
                    </div>

                    {/* Product Code & Serial Number */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">SKU / Main Product Code (প্রথম/মূল কোড)</label>
                      <input
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300 font-mono font-bold uppercase"
                        value={newProduct.code || ''}
                        onChange={e => {
                          const nextCode = e.target.value;
                          setNewProduct(prev => ({
                            ...prev,
                            code: nextCode,
                            imageVariants: (prev.imageVariants && prev.imageVariants.length > 0)
                              ? syncVariantsWithBaseCode(prev.imageVariants, nextCode, prev.code, false)
                              : prev.imageVariants
                          }));
                        }}
                        placeholder="e.g. TC-204 (খালি রাখলে অটো কোড হবে)"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Serial Number (প্রোডাক্ট সিরিয়াল পজিশন)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300 font-black"
                        value={newProduct.serial || ''}
                        onChange={e => setNewProduct({ ...newProduct, serial: Number(e.target.value) || 0 })}
                        placeholder="e.g. 1, 2, 3..."
                      />
                    </div>

                    {/* Type Selection */}
                    <div className="md:col-span-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 flex shadow-inner">
                      <label className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${!newProduct.isHotSale && !newProduct.isCollection ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-700'}`}>
                        <input type="radio" name="product-type" className="hidden" checked={!newProduct.isHotSale && !newProduct.isCollection} onChange={() => setNewProduct({...newProduct, isHotSale: false, isCollection: false})} />
                        Regular
                      </label>
                      <label className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${newProduct.isHotSale ? 'bg-black shadow-sm text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                        <input type="radio" name="product-type" className="hidden" checked={newProduct.isHotSale} onChange={() => setNewProduct({...newProduct, isHotSale: true, isCollection: false})} />
                        Hot Sale
                      </label>
                      <label className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${newProduct.isCollection ? 'bg-[#98875b] shadow-sm text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                        <input type="radio" name="product-type" className="hidden" checked={newProduct.isCollection} onChange={() => setNewProduct({...newProduct, isCollection: true, isHotSale: false})} />
                        Collection
                      </label>
                    </div>

                    {/* Pricing Block */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Cost Price (৳) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                          <input type="number" required className="w-full border border-gray-200 rounded-xl p-3 pl-8 text-black font-black focus:ring-1 focus:ring-black focus:outline-none bg-white transition-colors" value={newProduct.costPrice || ''} onChange={e=>setNewProduct({...newProduct, costPrice: Number(e.target.value)})} placeholder="Original Cost" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Selling Price (৳) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                          <input type="number" required className="w-full border border-gray-200 rounded-xl p-3 pl-8 text-black font-black focus:ring-1 focus:ring-black focus:outline-none bg-white transition-colors" value={newProduct.price || ''} onChange={e=>setNewProduct({...newProduct, price: Number(e.target.value)})} placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Original Price (Strike-through)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                          <input type="number" className="w-full border border-gray-200 rounded-xl p-3 pl-8 text-gray-500 font-bold focus:ring-1 focus:ring-black focus:outline-none bg-white transition-colors" value={newProduct.oldPrice || ''} onChange={e=>setNewProduct({...newProduct, oldPrice: Number(e.target.value)})} placeholder="Optional" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Dedicated Primary Front / Cover Image Upload & Live Preview */}
                  <div className="bg-gradient-to-br from-amber-50/40 via-white to-gray-50/60 p-6 md:p-8 rounded-3xl border-2 border-amber-200/70 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-amber-500 text-white rounded-xl shadow-xs">
                            <Star className="w-4 h-4 fill-white" />
                          </span>
                          <h4 className="font-black uppercase tracking-wider text-sm md:text-base text-gray-900">
                            প্রোডাক্টের সামনের মূল ছবি (Front / Cover Image) *
                          </h4>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                            Primary Display
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-1">
                          ওয়েবসাইট, শপ পেইজ ও হোমপেইজে সবার সামনে যে ছবিটি প্রদর্শিত হবে তা আলাদাভাবে এখান থেকে আপলোড করুন এবং প্রিভিউ দেখুন।
                        </p>
                      </div>
                    </div>

                    {newProduct.image ? (
                      /* High-Fidelity Front Image Preview Card */
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                        <div className="relative w-40 h-52 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-300 bg-gray-100 shadow-md group shrink-0">
                          <img src={newProduct.image} alt="Front Cover" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md text-yellow-300 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> সামনের ছবি
                          </div>
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-white">
                            <Camera className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Change Front Photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, handleSetFrontImageForNewProduct)} />
                          </label>
                        </div>

                        <div className="flex-1 w-full space-y-3 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">সামনের মূল ছবি সিলেক্ট করা আছে (Active Front Cover)</span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium leading-relaxed">
                            এই ছবিটি ক্যাটালগ ও হোমপেজের মেইন ব্যানার এবং কার্ডে সামনে শো করবে। ছবি পরিবর্তন করতে চাইলে নিচে বাটনে ক্লিক করুন বা নতুন ছবি আপলোড করুন।
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <label className="cursor-pointer bg-black text-white hover:bg-gray-800 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm">
                              <Camera className="w-3.5 h-3.5" />
                              অন্য ছবি আপলোড করুন (Change Photo)
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, handleSetFrontImageForNewProduct)} />
                            </label>
                            <button 
                              type="button" 
                              onClick={handleRemoveFrontImageForNewProduct} 
                              className="text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl border border-red-200 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove Front
                            </button>
                          </div>

                          <div className="pt-2">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">অথবা সামনের ছবির লিঙ্ক (Direct Image URL):</label>
                            <input 
                              type="text" 
                              placeholder="https://... (Front Image Direct URL)" 
                              value={newProduct.image} 
                              onChange={e => handleSetFrontImageForNewProduct(e.target.value)} 
                              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Upload Box when front image not yet uploaded */
                      <div className="border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors hover:bg-amber-50/70">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600 border border-amber-200">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-900">সামনে যে ছবিটি থাকবে তা আপলোড করুন (Upload Front Display Image)</p>
                          <p className="text-xs text-gray-500 mt-1 max-w-md">প্রোডাক্টের সামনের প্রধান কভার ছবিটি এখান থেকে সিলেক্ট করুন। সিলেক্ট করার সাথে সাথে এখানে প্রিভিউ দেখা যাবে।</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full max-w-md justify-center">
                          <label className="cursor-pointer w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md">
                            <Camera className="w-4 h-4" />
                            সামনের ছবি আপলোড করুন
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, handleSetFrontImageForNewProduct)} />
                          </label>
                        </div>

                        <div className="w-full max-w-md pt-2">
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="অথবা সামনের ছবির লিঙ্ক (Image URL) পেস্ট করুন..." 
                              value={frontImageUrlInput} 
                              onChange={e => setFrontImageUrlInput(e.target.value)} 
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (frontImageUrlInput.trim()) {
                                    handleSetFrontImageForNewProduct(frontImageUrlInput.trim());
                                    setFrontImageUrlInput('');
                                  }
                                }
                              }}
                              className="w-full border border-gray-200 rounded-2xl pl-4 pr-24 py-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                if (frontImageUrlInput.trim()) {
                                  handleSetFrontImageForNewProduct(frontImageUrlInput.trim());
                                  setFrontImageUrlInput('');
                                }
                              }}
                              className="absolute right-1.5 top-1.5 bottom-1.5 bg-gray-900 hover:bg-black text-white px-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
                            >
                              Set Front
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Multi-Image Batch Upload & Per-Image Variant Inventory Management */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <h4 className="font-black uppercase tracking-wider text-sm md:text-base text-gray-900 flex items-center gap-2">
                          <Layers className="w-5 h-5 text-black" /> গ্যালারি/অন্যান্য কালারের ছবি ও সাইজ স্টক (Variant Images & Inventory)
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium mt-1">একসাথে বাকি ছবিগুলো আপলোড করুন। প্রতিটি ছবির নিচে সাইজ ও কোয়ান্টিটি আলাদা ভাবে ইনপুট দিন যার মাধ্যমে নির্ভুল ইনভেন্টরি ম্যানেজ হবে।</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(newProduct.imageVariants || []).length > 0 && (
                          <button
                            type="button"
                            onClick={autoGenerateNewProductVariantCodes}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                          >
                            ⚡ অটো কোড সেট (প্রথম কোডের সাথে)
                          </button>
                        )}
                        <span className="bg-black text-white text-[10px] font-black uppercase px-3.5 py-1.5 rounded-xl shadow-xs">
                          Total Stock: {newProduct.stock || 0} pcs
                        </span>
                      </div>
                    </div>

                    {/* Multiple Image Upload Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="cursor-pointer bg-black text-white hover:bg-gray-800 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-black uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap">
                        <Camera className="w-4 h-4" />
                        Upload Multiple Images (একসাথে বাকি ছবি আপলোড)
                        <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleMultipleImageUpload(e.target.files, addImagesToNewProduct)} />
                      </label>
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="বা ইমেজ লিঙ্ক / URL পেস্ট করে অ্যাড করুন..." 
                          value={newProductUrlInput} 
                          onChange={e => setNewProductUrlInput(e.target.value)} 
                          className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-colors" 
                        />
                        <button 
                          type="button" 
                          onClick={() => { 
                            if (newProductUrlInput.trim()) { 
                              addImagesToNewProduct([newProductUrlInput.trim()]); 
                              setNewProductUrlInput(''); 
                            } 
                          }} 
                          className="bg-gray-900 text-white px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5 inline mr-1" /> Add URL
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Bar (when variants exist) */}
                    {(newProduct.imageVariants || []).length > 1 && (
                      <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Quick Preset: সব ছবিতে একসাথে একই সাইজ-স্টক বসান</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => (
                            <div key={sz} className="flex items-center gap-1 bg-white border border-blue-100 rounded-xl px-2 py-1 shadow-xs">
                              <span className="text-[9px] font-bold text-gray-500">{sz}:</span>
                              <input 
                                type="number" 
                                min="0" 
                                placeholder="0" 
                                className="w-10 text-xs text-center font-bold outline-none" 
                                value={newBulkPreset[sz] || ''} 
                                onChange={e => setNewBulkPreset({...newBulkPreset, [sz]: Number(e.target.value) || 0})} 
                              />
                            </div>
                          ))}
                          <button 
                            type="button" 
                            onClick={applyBulkPresetToNewProduct} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                          >
                            Apply to All
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Variant Cards List */}
                    {(newProduct.imageVariants || []).length > 0 ? (
                      <div className="space-y-4">
                        {(newProduct.imageVariants || []).map((variant, idx) => (
                          <div key={variant.id} className={`border rounded-3xl p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start transition-all ${idx === 0 ? 'bg-amber-50/30 border-amber-300 shadow-xs' : 'bg-gray-50/70 border-gray-200 hover:border-gray-300'}`}>
                            {/* Thumbnail & Action Badges */}
                            <div className="flex sm:flex-col items-center gap-3 w-full sm:w-auto">
                              <div className={`w-24 h-32 rounded-2xl overflow-hidden border bg-white shadow-sm flex-shrink-0 relative group ${idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-gray-200'}`}>
                                {variant.image && <img src={variant.image} alt="" className="w-full h-full object-cover" />}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                  <Camera className="w-4 h-4 text-white" />
                                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, (url) => {
                                    const updated = (newProduct.imageVariants || []).map(v => v.id === variant.id ? { ...v, image: url } : v);
                                    setNewProduct(prev => ({ ...prev, imageVariants: updated, image: updated[0]?.image || prev.image }));
                                  })} />
                                </label>
                              </div>
                              <div className="flex flex-col gap-1.5 flex-1 sm:w-24">
                                {idx === 0 ? (
                                  <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider text-center py-1 px-2 rounded-xl flex items-center justify-center gap-1 shadow-xs">
                                    <Star className="w-2.5 h-2.5 fill-white" /> সামনের ছবি
                                  </span>
                                ) : (
                                  <button type="button" onClick={() => setPrimaryNewProductVariant(variant.id)} className="bg-white hover:bg-black hover:text-white border border-gray-200 text-gray-700 text-[8px] font-bold uppercase tracking-wider py-1 px-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                                    <Star className="w-2.5 h-2.5" /> সামনে আনুন
                                  </button>
                                )}
                                <button type="button" onClick={() => removeNewProductVariant(variant.id)} className="text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 text-[8px] font-bold uppercase tracking-wider py-1 px-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                            </div>

                            {/* Variant Info & Per-Image Sizes Matrix */}
                            <div className="flex-1 w-full flex flex-col gap-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2 flex-1">
                                  <span className="font-bold text-xs uppercase tracking-wider text-gray-400">
                                    {idx === 0 ? '⭐ Front Variant:' : `Image #${idx + 1}:`}
                                  </span>
                                  <input 
                                    type="text" 
                                    placeholder="Variant / Color Title (e.g. Black, Navy...)" 
                                    value={variant.title || ''} 
                                    onChange={e => {
                                      const updated = (newProduct.imageVariants || []).map(v => v.id === variant.id ? { ...v, title: e.target.value } : v);
                                      setNewProduct(prev => ({ ...prev, imageVariants: updated }));
                                    }} 
                                    className="flex-1 min-w-[150px] text-xs font-bold bg-white border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                                  />
                                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 whitespace-nowrap">Code:</span>
                                    <input
                                      type="text"
                                      placeholder={`${(newProduct.code || getNextBaseProductCode()).toUpperCase()}-${idx + 1}`}
                                      value={variant.code || ''}
                                      onChange={e => {
                                        const entered = e.target.value.toUpperCase();
                                        let updated = (newProduct.imageVariants || []).map(v => v.id === variant.id ? { ...v, code: entered } : v);
                                        if (idx === 0 && entered.trim()) {
                                          const rootFromFirst = entered.trim().replace(/-\d+$/, '');
                                          updated = updated.map((v, vIdx) => {
                                            if (vIdx === 0) return v;
                                            const prevRoot = (variant.code || newProduct.code || '').trim().toUpperCase().replace(/-\d+$/, '');
                                            if (!v.code || (prevRoot && v.code.startsWith(prevRoot + '-'))) {
                                              return { ...v, code: `${rootFromFirst}-${vIdx + 1}` };
                                            }
                                            return v;
                                          });
                                        }
                                        setNewProduct(prev => ({ ...prev, imageVariants: updated }));
                                      }}
                                      className="w-28 text-xs font-mono font-black uppercase bg-transparent outline-none text-gray-900"
                                    />
                                  </div>
                                </div>
                                <div className="bg-white border border-gray-200 px-3.5 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
                                  <span className="text-[10px] font-black uppercase text-gray-700">Variant Stock: <span className="text-black text-xs font-black">{variant.stock || 0} pcs</span></span>
                                </div>
                              </div>

                              {/* Size Inputs for this specific image */}
                              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2.5">
                                  Size & Quantity for this Image Variant (এই ছবির সাইজ ও স্টক পরিমাণ)
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                  {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => (
                                    <div key={sz} className="flex flex-col items-center bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 focus-within:border-black focus-within:bg-white transition-all">
                                      <span className="text-[10px] font-black uppercase text-gray-800">{sz}</span>
                                      <input 
                                        type="number" 
                                        min="0" 
                                        placeholder="0" 
                                        value={variant.sizeStocks?.[sz] !== undefined && variant.sizeStocks?.[sz] !== 0 ? variant.sizeStocks[sz] : (variant.sizeStocks?.[sz] === 0 ? 0 : '')} 
                                        onChange={e => updateNewProductVariantSize(variant.id, sz, e.target.value === '' ? 0 : Number(e.target.value))} 
                                        className="w-full text-center text-xs font-black bg-transparent border-none p-1 focus:outline-none focus:ring-0 mt-1" 
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3 bg-gray-50/50">
                        <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                          <Camera className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800">কোনো অতিরিক্ত ছবি যোগ করা হয়নি (No extra images added yet)</p>
                          <p className="text-xs text-gray-400 mt-1">প্রোডাক্টের একাধিক কালার বা মডেল থাকলে উপরে &quot;Upload Multiple Images&quot; বাটনে ক্লিক করে সব ছবি একসাথে সিলেক্ট করুন। প্রতিটি ছবির জন্য আলাদা সাইজ ও স্টক ইনপুট দেওয়ার ব্যবস্থা থাকবে।</p>
                        </div>
                        <label className="cursor-pointer bg-black text-white hover:bg-gray-800 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all mt-2">
                          Select Extra Photos
                          <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleMultipleImageUpload(e.target.files, addImagesToNewProduct)} />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Size Chart Matrix Image */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Size Chart Matrix Image (সাইজ গাইড ছবি - ঐচ্ছিক)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <input className="w-full border-2 border-gray-100 rounded-2xl p-4 pr-12 text-sm focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300" value={newProduct.sizeChartImage || ''} onChange={e=>setNewProduct({...newProduct, sizeChartImage: e.target.value})} placeholder="https://..." />
                        <Ruler className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
                      </div>
                      <label className="cursor-pointer bg-gray-100 hover:bg-black text-black hover:text-white transition-colors px-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
                        <Camera className="w-4 h-4" /> Upload Image
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, (url) => setNewProduct({...newProduct, sizeChartImage: url}))} />
                      </label>
                    </div>
                    {newProduct.sizeChartImage && (
                      <div className="mt-4 rounded-2xl border-2 border-gray-100 overflow-hidden bg-white relative group inline-block">
                         <img src={newProduct.sizeChartImage} alt="Size Chart" className="h-32 object-contain p-2" />
                         <button type="button" onClick={() => setNewProduct({...newProduct, sizeChartImage: ''})} className="absolute top-2 right-2 p-1.5 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all border border-red-100">
                           <X className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Sticky Footer Actions */}
              <div className="px-6 py-5 md:px-10 border-t border-gray-100 bg-gray-50/80 backdrop-blur-md flex justify-end gap-4 z-10">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-colors text-gray-600 active:scale-95">Discard</button>
                <button form="add-product-form" type="submit" className="bg-black text-white px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center gap-2">
                  <Check className="w-4 h-4" /> Save Product
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {editingProduct && (activeTab === 'shop' || activeTab === 'collection') && (
          <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-md p-4 pt-16 md:pt-20 pb-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl relative flex flex-col max-h-[100vh] sm:max-h-[82vh] overflow-hidden border border-gray-100"
            >
              {/* Sticky Header */}
              <div className="flex items-center justify-between px-6 py-6 pt-8 md:px-10 md:py-8 md:pt-10 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center gap-4">
                  <div className="bg-black text-white p-3 rounded-2xl shadow-lg shadow-black/10">
                    <Edit className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xl md:text-2xl text-gray-900 tracking-tight">{editingProduct.isCollection ? 'Edit Collection Item' : 'Edit Product'}</h3>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Update details, image variants & inventory for {editingProduct.name}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-3 rounded-xl transition-all bg-gray-50 hover:scale-105 active:scale-95">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto w-full">
                <form id="edit-product-form" onSubmit={handleUpdateProduct} className="flex flex-col gap-8 p-6 md:p-10">
                  
                  {/* Section 1: Product Information & Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs">
                    <div className="md:col-span-2 border-b border-gray-100 pb-3">
                      <h4 className="font-black uppercase tracking-widest text-xs md:text-sm text-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-black" /> Product Details & Pricing
                      </h4>
                    </div>

                    {/* Name */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Product Title *</label>
                      <input required className="w-full border-2 border-gray-100 rounded-2xl p-4 text-base font-bold focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder:font-normal placeholder:text-gray-300 bg-gray-50 focus:bg-white" value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name: e.target.value})} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Description *</label>
                      <textarea required className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors h-24 resize-none placeholder:text-gray-300 custom-scrollbar" value={editingProduct.description} onChange={e=>setEditingProduct({...editingProduct, description: e.target.value})} />
                    </div>

                    {/* Category & Sub-Category */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Category *</label>
                      <select 
                        required 
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors appearance-none" 
                        value={editingProduct.category || ''} 
                        onChange={e => setEditingProduct({...editingProduct, category: e.target.value, subCategory: ''})}
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Sub-Category (সাব-ক্যাটাগরি)</label>
                      {(() => {
                        const selectedCatObj = categories.find(c => c.name === editingProduct.category);
                        const subOpts = selectedCatObj?.subCategories || [];
                        return subOpts.length > 0 ? (
                          <select
                            className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors appearance-none"
                            value={editingProduct.subCategory || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                          >
                            <option value="">-- Select Sub-Category (Optional) --</option>
                            {subOpts.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors placeholder:font-normal placeholder:text-gray-300"
                            value={editingProduct.subCategory || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                            placeholder="Optional sub-category..."
                          />
                        );
                      })()}
                    </div>

                    {/* Product Code & Serial Number */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">SKU / Main Product Code (প্রথম/মূল কোড)</label>
                      <input
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300 font-mono font-bold uppercase"
                        value={editingProduct.code || ''}
                        onChange={e => {
                          const nextCode = e.target.value;
                          setEditingProduct({
                            ...editingProduct,
                            code: nextCode,
                            imageVariants: (editingProduct.imageVariants && editingProduct.imageVariants.length > 0)
                              ? syncVariantsWithBaseCode(editingProduct.imageVariants, nextCode, editingProduct.code, false, editingProduct.id)
                              : editingProduct.imageVariants
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Serial Number (প্রোডাক্ট সিরিয়াল পজিশন)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300 font-black"
                        value={editingProduct.serial || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, serial: Number(e.target.value) || 0 })}
                        placeholder="e.g. 1, 2, 3..."
                      />
                    </div>

                    {/* Type Selection */}
                    <div className="md:col-span-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 flex shadow-inner">
                      <label className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${!editingProduct.isHotSale && !editingProduct.isCollection ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-700'}`}>
                        <input type="radio" name="edit-product-type" className="hidden" checked={!editingProduct.isHotSale && !editingProduct.isCollection} onChange={() => setEditingProduct({...editingProduct, isHotSale: false, isCollection: false})} />
                        Regular
                      </label>
                      <label className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${editingProduct.isHotSale ? 'bg-black shadow-sm text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                        <input type="radio" name="edit-product-type" className="hidden" checked={editingProduct.isHotSale} onChange={() => setEditingProduct({...editingProduct, isHotSale: true, isCollection: false})} />
                        Hot Sale
                      </label>
                      <label className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${editingProduct.isCollection ? 'bg-[#98875b] shadow-sm text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                        <input type="radio" name="edit-product-type" className="hidden" checked={editingProduct.isCollection} onChange={() => setEditingProduct({...editingProduct, isCollection: true, isHotSale: false})} />
                        Collection
                      </label>
                    </div>

                    {/* Pricing Block */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Cost Price (৳) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                          <input type="number" required className="w-full border border-gray-200 rounded-xl p-3 pl-8 text-black font-black focus:ring-1 focus:ring-black focus:outline-none bg-white transition-colors" value={editingProduct.costPrice || 0} onChange={e=>setEditingProduct({...editingProduct, costPrice: Number(e.target.value)})} placeholder="Original Cost" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Selling Price (৳) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                          <input type="number" required className="w-full border border-gray-200 rounded-xl p-3 pl-8 text-black font-black focus:ring-1 focus:ring-black focus:outline-none bg-white transition-colors" value={editingProduct.price} onChange={e=>setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Original Price (Strike-through)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                          <input type="number" className="w-full border border-gray-200 rounded-xl p-3 pl-8 text-gray-500 font-bold focus:ring-1 focus:ring-black focus:outline-none bg-white transition-colors" value={editingProduct.oldPrice || 0} onChange={e=>setEditingProduct({...editingProduct, oldPrice: Number(e.target.value)})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Dedicated Primary Front / Cover Image Upload & Live Preview */}
                  <div className="bg-gradient-to-br from-amber-50/40 via-white to-gray-50/60 p-6 md:p-8 rounded-3xl border-2 border-amber-200/70 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-amber-500 text-white rounded-xl shadow-xs">
                            <Star className="w-4 h-4 fill-white" />
                          </span>
                          <h4 className="font-black uppercase tracking-wider text-sm md:text-base text-gray-900">
                            প্রোডাক্টের সামনের মূল ছবি (Front / Cover Image) *
                          </h4>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                            Primary Display
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-1">
                          ওয়েবসাইট, শপ পেইজ ও হোমপেইজে সবার সামনে যে ছবিটি প্রদর্শিত হবে তা আলাদাভাবে এখান থেকে আপলোড করুন এবং প্রিভিউ দেখুন।
                        </p>
                      </div>
                    </div>

                    {editingProduct.image ? (
                      /* High-Fidelity Front Image Preview Card */
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                        <div className="relative w-40 h-52 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-300 bg-gray-100 shadow-md group shrink-0">
                          <img src={editingProduct.image} alt="Front Cover" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md text-yellow-300 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> সামনের ছবি
                          </div>
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-white">
                            <Camera className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Change Front Photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, handleSetFrontImageForEditProduct)} />
                          </label>
                        </div>

                        <div className="flex-1 w-full space-y-3 text-left">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">সামনের মূল ছবি সিলেক্ট করা আছে (Active Front Cover)</span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium leading-relaxed">
                            এই ছবিটি ক্যাটালগ ও হোমপেজের মেইন ব্যানার এবং কার্ডে সামনে শো করবে। ছবি পরিবর্তন করতে চাইলে নিচে বাটনে ক্লিক করুন বা নতুন ছবি আপলোড করুন।
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <label className="cursor-pointer bg-black text-white hover:bg-gray-800 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm">
                              <Camera className="w-3.5 h-3.5" />
                              অন্য ছবি আপলোড করুন (Change Photo)
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, handleSetFrontImageForEditProduct)} />
                            </label>
                            <button 
                              type="button" 
                              onClick={handleRemoveFrontImageForEditProduct} 
                              className="text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl border border-red-200 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove Front
                            </button>
                          </div>

                          <div className="pt-2">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">অথবা সামনের ছবির লিঙ্ক (Direct Image URL):</label>
                            <input 
                              type="text" 
                              placeholder="https://... (Front Image Direct URL)" 
                              value={editingProduct.image} 
                              onChange={e => handleSetFrontImageForEditProduct(e.target.value)} 
                              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Upload Box when front image not yet uploaded */
                      <div className="border-2 border-dashed border-amber-300 bg-amber-50/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors hover:bg-amber-50/70">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-600 border border-amber-200">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-900">সামনে যে ছবিটি থাকবে তা আপলোড করুন (Upload Front Display Image)</p>
                          <p className="text-xs text-gray-500 mt-1 max-w-md">প্রোডাক্টের সামনের প্রধান কভার ছবিটি এখান থেকে সিলেক্ট করুন। সিলেক্ট করার সাথে সাথে এখানে প্রিভিউ দেখা যাবে।</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full max-w-md justify-center">
                          <label className="cursor-pointer w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md">
                            <Camera className="w-4 h-4" />
                            সামনের ছবি আপলোড করুন
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, handleSetFrontImageForEditProduct)} />
                          </label>
                        </div>

                        <div className="w-full max-w-md pt-2">
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="অথবা সামনের ছবির লিঙ্ক (Image URL) পেস্ট করুন..." 
                              value={editFrontImageUrlInput} 
                              onChange={e => setEditFrontImageUrlInput(e.target.value)} 
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (editFrontImageUrlInput.trim()) {
                                    handleSetFrontImageForEditProduct(editFrontImageUrlInput.trim());
                                    setEditFrontImageUrlInput('');
                                  }
                                }
                              }}
                              className="w-full border border-gray-200 rounded-2xl pl-4 pr-24 py-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                if (editFrontImageUrlInput.trim()) {
                                  handleSetFrontImageForEditProduct(editFrontImageUrlInput.trim());
                                  setEditFrontImageUrlInput('');
                                }
                              }}
                              className="absolute right-1.5 top-1.5 bottom-1.5 bg-gray-900 hover:bg-black text-white px-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
                            >
                              Set Front
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Multi-Image Batch Upload & Per-Image Variant Inventory Management */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <h4 className="font-black uppercase tracking-wider text-sm md:text-base text-gray-900 flex items-center gap-2">
                          <Layers className="w-5 h-5 text-black" /> গ্যালারি/অন্যান্য কালারের ছবি ও সাইজ স্টক (Variant Images & Inventory)
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium mt-1">একসাথে বাকি ছবিগুলো আপলোড করুন। প্রতিটি ছবির নিচে সাইজ ও কোয়ান্টিটি আলাদা ভাবে ইনপুট দিন যার মাধ্যমে নির্ভুল ইনভেন্টরি ম্যানেজ হবে।</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(editingProduct.imageVariants || []).length > 0 && (
                          <button
                            type="button"
                            onClick={autoGenerateEditProductVariantCodes}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                          >
                            ⚡ অটো কোড সেট (প্রথম কোডের সাথে)
                          </button>
                        )}
                        <span className="bg-black text-white text-[10px] font-black uppercase px-3.5 py-1.5 rounded-xl shadow-xs">
                          Total Stock: {editingProduct.stock || 0} pcs
                        </span>
                      </div>
                    </div>

                    {/* Multiple Image Upload Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="cursor-pointer bg-black text-white hover:bg-gray-800 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-black uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap">
                        <Camera className="w-4 h-4" />
                        Upload Multiple Images (একসাথে বাকি ছবি আপলোড)
                        <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleMultipleImageUpload(e.target.files, addImagesToEditProduct)} />
                      </label>
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="বা ইমেজ লিঙ্ক / URL পেস্ট করে অ্যাড করুন..." 
                          value={editProductUrlInput} 
                          onChange={e => setEditProductUrlInput(e.target.value)} 
                          className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-colors" 
                        />
                        <button 
                          type="button" 
                          onClick={() => { 
                            if (editProductUrlInput.trim()) { 
                              addImagesToEditProduct([editProductUrlInput.trim()]); 
                              setEditProductUrlInput(''); 
                            } 
                          }} 
                          className="bg-gray-900 text-white px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5 inline mr-1" /> Add URL
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Bar (when variants exist) */}
                    {(editingProduct.imageVariants || []).length > 1 && (
                      <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Quick Preset: সব ছবিতে একসাথে একই সাইজ-স্টক বসান</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => (
                            <div key={sz} className="flex items-center gap-1 bg-white border border-blue-100 rounded-xl px-2 py-1 shadow-xs">
                              <span className="text-[9px] font-bold text-gray-500">{sz}:</span>
                              <input 
                                type="number" 
                                min="0" 
                                placeholder="0" 
                                className="w-10 text-xs text-center font-bold outline-none" 
                                value={editBulkPreset[sz] || ''} 
                                onChange={e => setEditBulkPreset({...editBulkPreset, [sz]: Number(e.target.value) || 0})} 
                              />
                            </div>
                          ))}
                          <button 
                            type="button" 
                            onClick={applyBulkPresetToEditProduct} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                          >
                            Apply to All
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Variant Cards List */}
                    {(editingProduct.imageVariants || []).length > 0 ? (
                      <div className="space-y-4">
                        {(editingProduct.imageVariants || []).map((variant, idx) => (
                          <div key={variant.id} className={`border rounded-3xl p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start transition-all ${idx === 0 ? 'bg-amber-50/30 border-amber-300 shadow-xs' : 'bg-gray-50/70 border-gray-200 hover:border-gray-300'}`}>
                            {/* Thumbnail & Action Badges */}
                            <div className="flex sm:flex-col items-center gap-3 w-full sm:w-auto">
                              <div className={`w-24 h-32 rounded-2xl overflow-hidden border bg-white shadow-sm flex-shrink-0 relative group ${idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-gray-200'}`}>
                                {variant.image && <img src={variant.image} alt="" className="w-full h-full object-cover" />}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                  <Camera className="w-4 h-4 text-white" />
                                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, (url) => {
                                    const updated = (editingProduct.imageVariants || []).map(v => v.id === variant.id ? { ...v, image: url } : v);
                                    setEditingProduct({ ...editingProduct, imageVariants: updated, image: updated[0]?.image || editingProduct.image });
                                  })} />
                                </label>
                              </div>
                              <div className="flex flex-col gap-1.5 flex-1 sm:w-24">
                                {idx === 0 ? (
                                  <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider text-center py-1 px-2 rounded-xl flex items-center justify-center gap-1 shadow-xs">
                                    <Star className="w-2.5 h-2.5 fill-white" /> সামনের ছবি
                                  </span>
                                ) : (
                                  <button type="button" onClick={() => setPrimaryEditProductVariant(variant.id)} className="bg-white hover:bg-black hover:text-white border border-gray-200 text-gray-700 text-[8px] font-bold uppercase tracking-wider py-1 px-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                                    <Star className="w-2.5 h-2.5" /> সামনে আনুন
                                  </button>
                                )}
                                <button type="button" onClick={() => removeEditProductVariant(variant.id)} className="text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 text-[8px] font-bold uppercase tracking-wider py-1 px-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                            </div>

                            {/* Variant Info & Per-Image Sizes Matrix */}
                            <div className="flex-1 w-full flex flex-col gap-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2 flex-1">
                                  <span className="font-bold text-xs uppercase tracking-wider text-gray-400">
                                    {idx === 0 ? '⭐ Front Variant:' : `Image #${idx + 1}:`}
                                  </span>
                                  <input 
                                    type="text" 
                                    placeholder="Variant / Color Title (e.g. Black, Navy...)" 
                                    value={variant.title || ''} 
                                    onChange={e => {
                                      const updated = (editingProduct.imageVariants || []).map(v => v.id === variant.id ? { ...v, title: e.target.value } : v);
                                      setEditingProduct({ ...editingProduct, imageVariants: updated });
                                    }} 
                                    className="flex-1 min-w-[150px] text-xs font-bold bg-white border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                                  />
                                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 whitespace-nowrap">Code:</span>
                                    <input
                                      type="text"
                                      placeholder={`${(editingProduct.code || getNextBaseProductCode(editingProduct.id)).toUpperCase()}-${idx + 1}`}
                                      value={variant.code || ''}
                                      onChange={e => {
                                        const entered = e.target.value.toUpperCase();
                                        let updated = (editingProduct.imageVariants || []).map(v => v.id === variant.id ? { ...v, code: entered } : v);
                                        if (idx === 0 && entered.trim()) {
                                          const rootFromFirst = entered.trim().replace(/-\d+$/, '');
                                          updated = updated.map((v, vIdx) => {
                                            if (vIdx === 0) return v;
                                            const prevRoot = (variant.code || editingProduct.code || '').trim().toUpperCase().replace(/-\d+$/, '');
                                            if (!v.code || (prevRoot && v.code.startsWith(prevRoot + '-'))) {
                                              return { ...v, code: `${rootFromFirst}-${vIdx + 1}` };
                                            }
                                            return v;
                                          });
                                        }
                                        setEditingProduct({ ...editingProduct, imageVariants: updated });
                                      }}
                                      className="w-28 text-xs font-mono font-black uppercase bg-transparent outline-none text-gray-900"
                                    />
                                  </div>
                                </div>
                                <div className="bg-white border border-gray-200 px-3.5 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
                                  <span className="text-[10px] font-black uppercase text-gray-700">Variant Stock: <span className="text-black text-xs font-black">{variant.stock || 0} pcs</span></span>
                                </div>
                              </div>

                              {/* Size Inputs for this specific image */}
                              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2.5">
                                  Size & Quantity for this Image Variant (এই ছবির সাইজ ও স্টক পরিমাণ)
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                  {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => (
                                    <div key={sz} className="flex flex-col items-center bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 focus-within:border-black focus-within:bg-white transition-all">
                                      <span className="text-[10px] font-black uppercase text-gray-800">{sz}</span>
                                      <input 
                                        type="number" 
                                        min="0" 
                                        placeholder="0" 
                                        value={variant.sizeStocks?.[sz] !== undefined && variant.sizeStocks?.[sz] !== 0 ? variant.sizeStocks[sz] : (variant.sizeStocks?.[sz] === 0 ? 0 : '')} 
                                        onChange={e => updateEditProductVariantSize(variant.id, sz, e.target.value === '' ? 0 : Number(e.target.value))} 
                                        className="w-full text-center text-xs font-black bg-transparent border-none p-1 focus:outline-none focus:ring-0 mt-1" 
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3 bg-gray-50/50">
                        <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                          <Camera className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800">কোনো অতিরিক্ত ছবি যোগ করা হয়নি (No extra images added yet)</p>
                          <p className="text-xs text-gray-400 mt-1">প্রোডাক্টের একাধিক কালার বা মডেল থাকলে উপরে &quot;Upload Multiple Images&quot; বাটনে ক্লিক করে সব ছবি একসাথে সিলেক্ট করুন। প্রতিটি ছবির জন্য আলাদা সাইজ ও স্টক ইনপুট দেওয়ার ব্যবস্থা থাকবে।</p>
                        </div>
                        <label className="cursor-pointer bg-black text-white hover:bg-gray-800 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all mt-2">
                          Select Extra Photos
                          <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleMultipleImageUpload(e.target.files, addImagesToEditProduct)} />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Size Chart Matrix Image */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Size Chart Matrix Image (সাইজ গাইড ছবি - ঐচ্ছিক)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <input className="w-full border-2 border-gray-100 rounded-2xl p-4 pr-12 text-sm focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300" value={editingProduct.sizeChartImage || ''} onChange={e=>setEditingProduct({...editingProduct, sizeChartImage: e.target.value})} placeholder="https://..." />
                        <Ruler className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
                      </div>
                      <label className="cursor-pointer bg-gray-100 hover:bg-black text-black hover:text-white transition-colors px-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
                        <Camera className="w-4 h-4" /> Upload Image
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, (url) => setEditingProduct({...editingProduct, sizeChartImage: url}))} />
                      </label>
                    </div>
                    {editingProduct.sizeChartImage && (
                      <div className="mt-4 rounded-2xl border-2 border-gray-100 overflow-hidden bg-white relative group inline-block">
                         <img src={editingProduct.sizeChartImage} alt="Size Chart" className="h-32 object-contain p-2" />
                         <button type="button" onClick={() => setEditingProduct({...editingProduct, sizeChartImage: ''})} className="absolute top-2 right-2 p-1.5 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all border border-red-100">
                           <X className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Sticky Footer Actions */}
              <div className="px-6 py-5 md:px-10 border-t border-gray-100 bg-gray-50/80 backdrop-blur-md flex justify-end gap-4 z-10">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-colors text-gray-600 active:scale-95">Discard</button>
                <button form="edit-product-form" type="submit" className="bg-black text-white px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center gap-2">
                  <Check className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Product Management Tab */}
        {activeTab === 'shop' && (
          <div>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-2xl font-black uppercase">Product Management</h1>
                <p className="text-[11px] text-gray-400 font-bold mt-0.5">সিরিয়াল বাটন (▲/▼) অথবা নাম্বার বসিয়ে প্রোডাক্ট আগে-পরে সাজান</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNormalizeProductSerials(filteredAdminProducts)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-lg flex items-center gap-1.5 tracking-wider text-[10px] font-black uppercase transition-colors border border-gray-200"
                >
                  সিরিয়াল সাজান (1, 2, 3...)
                </button>
                <button 
                  onClick={() => { 
                    if (!isAddingProduct) {
                      const productsInShop = products.filter(p => !p.isCollection);
                      const maxSerial = Math.max(...productsInShop.map(p => p.serial || 0), 0);
                      setNewProduct({...newProduct, serial: maxSerial + 1, isCollection: false});
                    }
                    setIsAddingProduct(!isAddingProduct); 
                    setEditingProduct(null); 
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 tracking-widest text-[10px] font-bold uppercase transition-colors"
                >
                  {isAddingProduct ? 'Cancel' : <><Plus className="h-4 w-4"/> Add Product</>}
                </button>
              </div>
            </div>

            {/* Filters Dashboard Panel */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              {/* Search input field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search Product (সার্চ করুন)</label>
                <input 
                  type="text" 
                  value={adminSearchQuery} 
                  onChange={e => setAdminSearchQuery(e.target.value)} 
                  placeholder="নাম, আইডি বা যেকোনো ছবির কোড..." 
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                />
              </div>

              {/* Category dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category (ক্যাটাগরি)</label>
                <div className="flex gap-2">
                  <select 
                    value={adminCategoryFilter} 
                    onChange={e => {
                      setAdminCategoryFilter(e.target.value);
                      setAdminSubCategoryFilter('all');
                    }} 
                    className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                  >
                    {adminCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All (সকল ক্যাটাগরি)' : cat}
                      </option>
                    ))}
                  </select>
                  {adminCategoryFilter !== 'all' && adminSubCategories.length > 0 && (
                    <select
                      value={adminSubCategoryFilter}
                      onChange={e => setAdminSubCategoryFilter(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                    >
                      <option value="all">All Sub-Categories</option>
                      {adminSubCategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Hot Sale filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hot Sale (হট সেল)</label>
                <select 
                  value={adminHotSaleFilter} 
                  onChange={e => setAdminHotSaleFilter(e.target.value)} 
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                >
                  <option value="all">All (সকল)</option>
                  <option value="yes">Hot Sale Only (শুধুমাত্র হট সেল)</option>
                  <option value="no">Regular Items (সাধারণ প্রোডাক্ট)</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sort By (সর্ট করুন)</label>
                <select 
                  value={adminSortBy} 
                  onChange={e => setAdminSortBy(e.target.value)} 
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                >
                  <option value="serial">Serial Order (সিরিয়াল অনুযায়ী ১, ২, ৩...)</option>
                  <option value="newest">Default / Serial</option>
                  <option value="price-asc">Price: Low to High (মূল্য: কম থেকে বেশি)</option>
                  <option value="price-desc">Price: High to Low (মূল্য: বেশি থেকে কম)</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto w-full">
              <table className="w-full text-left text-sm min-w-[800px] md:min-w-0">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Serial (ক্রম)</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Product & Codes</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Inventory</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Price</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Hot Sale</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAdminProducts.map((p, rowIdx) => {
                    const variantCodeList = Array.from(new Set([
                      ...(p.variantCodes || []),
                      ...((p.imageVariants || []).map(v => v.code).filter(Boolean) as string[])
                    ]));
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={rowIdx === 0}
                                onClick={() => handleMoveProductSerial(p.id, 'up', filteredAdminProducts)}
                                className="w-6 h-5 rounded bg-gray-100 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500 text-gray-700 flex items-center justify-center text-[9px] font-black transition-colors"
                                title="উপরে নিন (Move Up)"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={rowIdx === filteredAdminProducts.length - 1}
                                onClick={() => handleMoveProductSerial(p.id, 'down', filteredAdminProducts)}
                                className="w-6 h-5 rounded bg-gray-100 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500 text-gray-700 flex items-center justify-center text-[9px] font-black transition-colors"
                                title="নিচে নিন (Move Down)"
                              >
                                ▼
                              </button>
                            </div>
                            <input
                              type="number"
                              min="1"
                              key={`${p.id}-${p.serial || rowIdx + 1}`}
                              defaultValue={p.serial && p.serial > 0 ? p.serial : rowIdx + 1}
                              onBlur={e => {
                                const val = Number(e.target.value);
                                const currentDisplay = p.serial && p.serial > 0 ? p.serial : rowIdx + 1;
                                if (val > 0 && val !== currentDisplay) {
                                  handleSetProductSerialPosition(p.id, val, filteredAdminProducts);
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-14 border border-gray-200 rounded-xl py-1.5 px-2 text-xs font-black text-center bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                              title="সিরিয়াল নাম্বার পরিবর্তন করে Enter চাপুন"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            {p.image && <img src={p.image} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-sm transition-transform hover:scale-110" alt="" />}
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-gray-900">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {p.category}{p.subCategory ? ` › ${p.subCategory}` : ''} • <span className="text-black font-mono font-black">{p.code}</span>
                              </span>
                              {variantCodeList.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                  <span className="text-[8px] font-black uppercase text-gray-400">Image Codes:</span>
                                  {variantCodeList.map((vc, vIdx) => (
                                    <span key={vIdx} className="text-[9px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-200 px-1.5 py-0.5 rounded">
                                      {vc}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              readOnly
                              disabled
                              className={`w-16 border border-gray-100 rounded-lg p-1.5 text-xs font-black text-center cursor-not-allowed ${
                                p.stock <= 0 
                                  ? 'bg-red-50 text-red-600 border-red-200' 
                                  : p.stock < 5 
                                  ? 'bg-amber-50 text-amber-650 border-amber-200' 
                                  : 'bg-gray-50 text-gray-900'
                              }`}
                              value={p.stock || 0}
                            />
                            {p.stock <= 0 ? (
                              <span className="text-[8px] font-black uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 whitespace-nowrap">Stock Out</span>
                            ) : p.stock < 5 ? (
                              <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 whitespace-nowrap animate-pulse">Low Stock</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="p-4 font-black">৳{p.price}</td>
                        <td className="p-4">{p.isHotSale ? <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">YES</span> : '-'}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => openEditProductModal(p)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg mr-2"><Edit className="h-5 w-5"/></button>
                          <button onClick={async () => {
                            const result = await Swal.fire({
                              title: 'Are you sure?',
                              text: "Delete this product from general list?",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#000',
                              cancelButtonColor: '#d33',
                              confirmButtonText: 'Yes, delete it!'
                            });
                            if (result.isConfirmed) {
                              deleteProduct(p.id);
                              Swal.fire('Deleted!', 'Product has been deleted.', 'success');
                            }
                          }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="h-5 w-5"/></button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAdminProducts.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No products found holding those search/filter values.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <div>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-2xl font-black uppercase">Collection</h1>
                <p className="text-[11px] text-gray-400 font-bold mt-0.5">সিরিয়াল বাটন (▲/▼) অথবা নাম্বার বসিয়ে কালেকশন প্রোডাক্ট সাজান</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNormalizeProductSerials(filteredCollectionProducts)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-lg flex items-center gap-1.5 tracking-wider text-[10px] font-black uppercase transition-colors border border-gray-200"
                >
                  সিরিয়াল সাজান (1, 2, 3...)
                </button>
                <button 
                  onClick={() => { 
                    if (!isAddingProduct) {
                      const collectionProducts = products.filter(p => p.isCollection);
                      const maxSerial = Math.max(...collectionProducts.map(p => p.serial || 0), 0);
                      setNewProduct({...newProduct, serial: maxSerial + 1, isCollection: true});
                    }
                    setIsAddingProduct(!isAddingProduct); 
                    setEditingProduct(null); 
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 tracking-widest text-[10px] font-bold uppercase transition-colors"
                >
                  {isAddingProduct ? 'Cancel' : <><Plus className="h-4 w-4"/> Add to Collection</>}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto w-full">
              <table className="w-full text-left text-sm min-w-[800px] md:min-w-0">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Serial (ক্রম)</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Product & Codes</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Inventory</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Price</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCollectionProducts.map((p, rowIdx) => {
                    const variantCodeList = Array.from(new Set([
                      ...(p.variantCodes || []),
                      ...((p.imageVariants || []).map(v => v.code).filter(Boolean) as string[])
                    ]));
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={rowIdx === 0}
                                onClick={() => handleMoveProductSerial(p.id, 'up', filteredCollectionProducts)}
                                className="w-6 h-5 rounded bg-gray-100 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500 text-gray-700 flex items-center justify-center text-[9px] font-black transition-colors"
                                title="উপরে নিন (Move Up)"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={rowIdx === filteredCollectionProducts.length - 1}
                                onClick={() => handleMoveProductSerial(p.id, 'down', filteredCollectionProducts)}
                                className="w-6 h-5 rounded bg-gray-100 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500 text-gray-700 flex items-center justify-center text-[9px] font-black transition-colors"
                                title="নিচে নিন (Move Down)"
                              >
                                ▼
                              </button>
                            </div>
                            <input
                              type="number"
                              min="1"
                              key={`${p.id}-${p.serial || rowIdx + 1}`}
                              defaultValue={p.serial && p.serial > 0 ? p.serial : rowIdx + 1}
                              onBlur={e => {
                                const val = Number(e.target.value);
                                const currentDisplay = p.serial && p.serial > 0 ? p.serial : rowIdx + 1;
                                if (val > 0 && val !== currentDisplay) {
                                  handleSetProductSerialPosition(p.id, val, filteredCollectionProducts);
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-14 border border-gray-200 rounded-xl py-1.5 px-2 text-xs font-black text-center bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                              title="সিরিয়াল নাম্বার পরিবর্তন করে Enter চাপুন"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            {p.image && <img src={p.image} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-sm transition-transform hover:scale-110" alt="" />}
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-gray-900 font-sans tracking-tight">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {p.category}{p.subCategory ? ` › ${p.subCategory}` : ''} • <span className="text-black font-mono font-black">{p.code}</span>
                              </span>
                              {variantCodeList.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                  <span className="text-[8px] font-black uppercase text-gray-400">Image Codes:</span>
                                  {variantCodeList.map((vc, vIdx) => (
                                    <span key={vIdx} className="text-[9px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-200 px-1.5 py-0.5 rounded">
                                      {vc}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              readOnly
                              disabled
                              className={`w-16 border border-gray-100 rounded-lg p-1.5 text-xs font-black text-center cursor-not-allowed ${
                                p.stock <= 0 
                                  ? 'bg-red-50 text-red-600 border-red-200' 
                                  : p.stock < 5 
                                  ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                  : 'bg-gray-50 text-gray-900'
                              }`}
                              value={p.stock || 0}
                            />
                            {p.stock <= 0 ? (
                              <span className="text-[8px] font-black uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 whitespace-nowrap">Stock Out</span>
                            ) : p.stock < 5 ? (
                              <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 whitespace-nowrap animate-pulse">Low Stock</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="p-4 font-black">৳{p.price}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => openEditProductModal(p)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg mr-2"><Edit className="h-5 w-5"/></button>
                          <button onClick={async () => {
                            const result = await Swal.fire({
                              title: 'Are you sure?',
                              text: "Delete this product from collection?",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#000',
                              cancelButtonColor: '#d33',
                              confirmButtonText: 'Yes, delete it!'
                            });
                            if (result.isConfirmed) {
                              deleteProduct(p.id);
                              Swal.fire('Deleted!', 'Product has been deleted.', 'success');
                            }
                          }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="h-5 w-5"/></button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCollectionProducts.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No products found in the collection.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (() => {
          const filteredOrders = (orders || [])
            .filter(order => {
              // 1. Search Query: ID / Phone / Name
              const query = appliedOrderQuery.trim().toLowerCase();
              const matchesSearch = !query || 
                order.id.toLowerCase().includes(query) ||
                formatOrderId(order.id).toLowerCase().includes(query) ||
                (order.customer.phone && order.customer.phone.toLowerCase().includes(query)) ||
                (order.customer.name && order.customer.name.toLowerCase().includes(query));

              // 2. Date Filtering
              let matchesDate = true;
              if (appliedOrderDateRange) {
                const orderDateStr = order.date.substring(0, 10); // "YYYY-MM-DD"
                matchesDate = orderDateStr === appliedOrderDateRange;
              } else if (appliedOrderDateFilter !== 'all') {
                const orderDate = new Date(order.date);
                const today = new Date();
                const orderTime = orderDate.getTime();
                const oneDayMs = 24 * 60 * 60 * 1000;

                if (appliedOrderDateFilter === 'today') {
                  matchesDate = orderDate.toDateString() === today.toDateString();
                } else if (appliedOrderDateFilter === 'yesterday') {
                  const yesterday = new Date(today.getTime() - oneDayMs);
                  matchesDate = orderDate.toDateString() === yesterday.toDateString();
                } else if (appliedOrderDateFilter === 'this-week') {
                  const sevenDaysAgo = today.getTime() - (7 * oneDayMs);
                  matchesDate = orderTime >= sevenDaysAgo;
                }
              }

              // 3. Status Filtering
              const matchesStatus = appliedOrderStatusFilter === 'all' || order.status === appliedOrderStatusFilter;

              return matchesSearch && matchesDate && matchesStatus;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          const handleOrderSearch = () => {
            setIsSearchingOrders(true);
            setTimeout(() => {
              setAppliedOrderQuery(orderSearchQuery);
              setAppliedOrderDateFilter(orderDateFilter);
              setAppliedOrderDateRange(orderDateRange);
              setAppliedOrderStatusFilter(orderStatusFilter);
              setOrdersPerPage(tempOrdersPerPage); // Apply pagination count on search
              setOrdersPage(1);
              setIsSearchingOrders(false);
            }, 800);
          };

          const currentPageOrders = filteredOrders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);
          const areAllSelected = currentPageOrders.length > 0 && currentPageOrders.every(o => selectedOrderIds.includes(o.id));

          const handleToggleSelectAll = () => {
            if (areAllSelected) {
              const currentPageIds = currentPageOrders.map(o => o.id);
              setSelectedOrderIds(prev => prev.filter(id => !currentPageIds.includes(id)));
            } else {
              const currentPageIds = currentPageOrders.map(o => o.id);
              setSelectedOrderIds(prev => {
                const newSelection = [...prev];
                currentPageIds.forEach(id => {
                  if (!newSelection.includes(id)) {
                    newSelection.push(id);
                  }
                });
                return newSelection;
              });
            }
          };

          const handleToggleOrderSelection = (orderId: string) => {
            setSelectedOrderIds(prev =>
              prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
            );
          };

          const handleBulkStatusUpdate = (status: Order['status']) => {
            selectedOrderIds.forEach(id => {
              updateOrderStatus(id, status);
            });
            setSelectedOrderIds([]); // Clear selection after action
            Swal.fire({
              title: 'Success',
              text: `Successfully updated ${selectedOrderIds.length} orders to ${status}!`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });
          };

          return (
            <div className="relative">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h1 className="text-2xl font-black uppercase">Orders</h1>
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportOrdersToExcel(filteredOrders)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 tracking-widest text-[10px] font-bold uppercase transition-colors shadow-lg"
                  >
                    <Download className="h-4 w-4"/> Export
                  </button>
                </div>
              </div>

              {/* Advanced search and filter controls */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 shadow-sm items-end transition-colors">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">অর্ডার সার্চ (ID/ফোন/নাম)</label>
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">টাইম ফিল্টার</label>
                  <select
                    value={orderDateFilter}
                    onChange={(e) => {
                      setOrderDateFilter(e.target.value as any);
                      setOrderDateRange('');
                    }}
                    className="w-full text-xs font-bold border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="this-week">Last 7 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Order Date</label>
                  <input
                    type="date"
                    value={orderDateRange}
                    onChange={(e) => {
                      setOrderDateRange(e.target.value);
                      setOrderDateFilter('all');
                    }}
                    className="w-full text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Status</label>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                    className="w-full text-xs font-bold border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Per Page</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={tempOrdersPerPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setTempOrdersPerPage(val);
                    }}
                    className="w-full text-xs font-bold border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white focus:outline-none text-center"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleOrderSearch}
                    disabled={isSearchingOrders}
                    className="flex-1 bg-black dark:bg-white dark:text-black text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all font-black uppercase text-[10px] tracking-widest disabled:opacity-50 shadow-lg shadow-black/10"
                  >
                    {isSearchingOrders ? (
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white dark:border-black/20 dark:border-t-black rounded-full animate-spin" />
                    ) : (
                      <Search className="h-4 w-4"/>
                    )}
                    Search
                  </button>
                </div>
              </div>

              <div className="relative min-h-[400px]">
                {isSearchingOrders && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 animate-pulse">Searching Orders...</p>
                      </div>
                   </div>
                )}

                {selectedOrderIds.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-black text-white px-6 py-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shadow-xl border border-gray-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white/15 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-green-400">
                        {selectedOrderIds.length} Selected
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-300">Bulk Update Status:</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleBulkStatusUpdate('pending')}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate('processing')}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                      >
                        Processing
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate('shipped')}
                        className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                      >
                        Shipped
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate('delivered')}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                      >
                        Delivered
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate('cancelled')}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                      >
                        Cancelled
                      </button>
                      <button
                        onClick={() => setSelectedOrderIds([])}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all"
                      >
                        Deselect All
                      </button>
                    </div>
                  </motion.div>
                )}

                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 flex flex-col items-center gap-4">
                    <Package className="h-12 w-12 opacity-10" />
                    <p className="font-bold uppercase tracking-widest text-xs">No matching orders found.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 dark:bg-gray-850 dark:border-gray-800 text-gray-500 font-bold">
                            <th className="py-4 px-6 w-12 text-center">
                              <input
                                type="checkbox"
                                checked={areAllSelected}
                                onChange={handleToggleSelectAll}
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer accent-black"
                              />
                            </th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Order ID</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Customer</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Date & Time</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Items</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Total</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {currentPageOrders.map(order => {
                            const isSelected = selectedOrderIds.includes(order.id);
                            return (
                              <tr 
                                key={order.id} 
                                className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/55 transition-colors ${isSelected ? 'bg-gray-50/30 dark:bg-gray-800/10' : ''}`}
                              >
                                <td className="py-4 px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleOrderSelection(order.id)}
                                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer accent-black"
                                  />
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex flex-col">
                                    <span className="font-mono font-black text-gray-900 dark:text-white">#{formatOrderId(order.id)}</span>
                                    {order.notes && (
                                      <span className="text-[9px] bg-amber-50 text-amber-700 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 w-fit">
                                        Has Notes
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex flex-col max-w-[200px]">
                                    <span className="font-bold text-gray-900 dark:text-white truncate">{order.customer.name}</span>
                                    <span className="text-[11px] text-gray-500 font-mono mt-0.5">{order.customer.phone}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex flex-col">
                                    <span className="text-gray-900 dark:text-white font-medium text-xs">{formatDate(order.date)}</span>
                                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">{formatTime(order.date)}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex -space-x-3 overflow-hidden">
                                    {order.items.slice(0, 3).map((item) => (
                                      <img 
                                        key={(item as any).cartItemId || (item.id + (item.selectedSize || ''))} 
                                        src={item.image} 
                                        className="w-8 h-8 rounded-lg border-2 border-white dark:border-gray-950 object-cover shadow bg-white shrink-0" 
                                        alt=""
                                      />
                                    ))}
                                    {order.items.length > 3 && (
                                      <div className="w-8 h-8 rounded-lg border-2 border-white dark:border-gray-950 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] font-black text-gray-500 dark:text-gray-300 shadow shrink-0">
                                        +{order.items.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="font-black text-gray-900 dark:text-white text-sm">৳{getOrderTotals(order).actualTotalPayable.toLocaleString()}</span>
                                </td>
                                <td className="py-4 px-4 font-bold">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${
                                    order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    order.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    order.status === 'shipped' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                    order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                    'bg-red-50 text-red-600 border-red-100'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedOrderForView(order);
                                      if (!readOrderIds.includes(order.id)) {
                                        setReadOrderIds(prev => [...prev, order.id]);
                                      }
                                    }}
                                    className="px-3.5 py-1.5 bg-gray-950 dark:bg-gray-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-750 transition-colors shadow-sm cursor-pointer animate-none"
                                  >
                                    View Order
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredOrders.length > ordersPerPage && (
                  <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                    <button 
                      onClick={() => setOrdersPage(Math.max(1, ordersPage - 1))}
                      disabled={ordersPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors animate-none"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                      Page {ordersPage} of {Math.ceil(filteredOrders.length / ordersPerPage)}
                    </span>
                    <button 
                      onClick={() => setOrdersPage(Math.min(Math.ceil(filteredOrders.length / ordersPerPage), ordersPage + 1))}
                      disabled={ordersPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors animate-none"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {/* Order Detail View Modal */}
              <AnimatePresence>
                {selectedOrderForView && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-start justify-center p-4 md:p-8 pt-16 md:pt-20 pb-6"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white w-full h-full md:h-auto md:max-h-[82vh] md:max-w-6xl md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col"
                    >
                      {/* Header */}
                      <div className="bg-gray-900 p-6 md:p-8 text-white flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <PackageCheck className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Order Details</h2>
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                orderToDisplay?.status === 'pending' ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                                orderToDisplay?.status === 'processing' ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                                orderToDisplay?.status === 'shipped' ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
                                orderToDisplay?.status === 'delivered' ? 'bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                                'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                              }`}>
                                {orderToDisplay?.status}
                              </span>
                            </div>
                            <p className="text-sm uppercase font-black text-white/60 tracking-widest mt-1">ID: {formatOrderId(orderToDisplay?.id)}</p>
                            
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {!isEditingOrder ? (
                                <button 
                                  onClick={() => startEditingOrder(selectedOrderForView!)}
                                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold uppercase text-[10px] tracking-wider px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
                                >
                                  <Edit className="w-3 h-3" /> Customize Order (অর্ডার পরিবর্তন)
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                      if (editingOrderState) {
                                        if (editingOrderState.items.length === 0) {
                                          Swal.fire({
                                            title: 'Error',
                                            text: 'অর্ডারে অন্তত একটি প্রোডাক্ট যোগ করুন।',
                                            icon: 'error',
                                            confirmButtonColor: '#000000'
                                          });
                                          return;
                                        }
                                        updateOrder(editingOrderState);
                                        setSelectedOrderForView(editingOrderState);
                                        setIsEditingOrder(false);
                                        
                                        // Also send updated invoice to customer
                                        fetch(apiUrl('/api/send-invoice'), {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ email: editingOrderState.customer.email || '', order: editingOrderState })
                                        }).then(res => {
                                          if (res.ok) {
                                            Swal.fire({
                                              title: 'Saved & Emailed!',
                                              text: 'The customized order has been saved and the new invoice has been sent to the customer\'s email.',
                                              icon: 'success',
                                              confirmButtonColor: '#000000'
                                            });
                                          } else {
                                            Swal.fire({
                                              title: 'Saved!',
                                              text: 'The customized order has been saved successfully in database (Invoice email sending failed).',
                                              icon: 'success',
                                              confirmButtonColor: '#000000'
                                            });
                                          }
                                        }).catch(err => {
                                          Swal.fire({
                                            title: 'Saved!',
                                            text: 'The customized order has been saved successfully in database (Invoice email sending offline).',
                                            icon: 'success',
                                            confirmButtonColor: '#000000'
                                          });
                                        });
                                      }
                                    }}
                                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-extrabold uppercase text-[10px] tracking-wider px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
                                  >
                                    Save Changes
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setIsEditingOrder(false);
                                      setEditingOrderState(null);
                                    }}
                                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-extrabold uppercase text-[10px] tracking-wider px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedOrderForView(null); setIsEditingOrder(false); setEditingOrderState(null); }}
                          className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                          {/* Left Column: Items */}
                          <div className="lg:col-span-2 space-y-8">
                            {/* Visual Progress Stepper for Orders */}
                            {(() => {
                              const steps = [
                                { key: 'pending', label: 'Pending', labelBn: 'পেন্ডিং', icon: Clock, desc: 'Awaiting review' },
                                { key: 'processing', label: 'Processing', labelBn: 'প্রসেসিং', icon: Loader2, desc: 'Preparing package' },
                                { key: 'shipped', label: 'Shipped', labelBn: 'শিপড', icon: Truck, desc: 'With courier' },
                                { key: 'delivered', label: 'Delivered', labelBn: 'ডেলিভার্ড', icon: CheckCircle, desc: 'Completed' }
                              ];
                              const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                              const currentStepIndex = statusOrder.indexOf(selectedOrderForView.status);
                              const isCancelled = selectedOrderForView.status === 'cancelled';
                              const completionPercentage = isCancelled ? 0 : Math.max(0, (currentStepIndex / 3) * 100);

                              return (
                                <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-6" id="admin-order-stepper">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-3 border-b border-gray-200/50">
                                    <div>
                                      <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest col-span-2">Order Milestone Progress</h4>
                                      <p className="text-sm font-black text-gray-800 mt-0.5">অর্ডার অগ্রগতি ট্র্যাকিং</p>
                                    </div>
                                    {isCancelled ? (
                                      <span className="bg-red-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                                        <X className="w-3 h-3" /> Cancelled / বাতিল
                                      </span>
                                    ) : (
                                      <span className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                                        Active Level: {selectedOrderForView.status}
                                      </span>
                                    )}
                                  </div>

                                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
                                    {/* Desktop line */}
                                    <div className="absolute hidden md:block left-[12%] right-[12%] top-[20px] h-[2px] bg-gray-200 -z-0 rounded-full" />
                                    {!isCancelled && (
                                      <div 
                                        className="absolute hidden md:block left-[12%] top-[20px] h-[2px] bg-blue-600 transition-all duration-700 -z-0 rounded-full" 
                                        style={{ width: `calc(${completionPercentage}% * 0.76)` }}
                                      />
                                    )}

                                    {/* Mobile line */}
                                    <div className="absolute md:hidden left-[20px] top-6 bottom-6 w-[2px] bg-gray-200 -z-0 rounded-full" />
                                    {!isCancelled && (
                                      <div 
                                        className="absolute md:hidden left-[20px] top-6 w-[2px] bg-blue-600 transition-all duration-700 -z-0 rounded-full" 
                                        style={{ height: `${completionPercentage}%` }}
                                      />
                                    )}

                                    {steps.map((step, idx) => {
                                      const isCompleted = !isCancelled && currentStepIndex > idx;
                                      const isActive = !isCancelled && currentStepIndex === idx;

                                      return (
                                        <div key={step.key} className="flex md:flex-col items-center md:text-center gap-4 md:gap-2 flex-1 w-full relative z-10">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                            isCompleted ? 'bg-blue-600 border-blue-600 text-white shadow-sm' :
                                            isActive ? 'bg-white border-blue-600 text-blue-600 shadow-md ring-4 ring-blue-50 scale-105' :
                                            'bg-white border-gray-200 text-gray-400'
                                          }`}>
                                            {isCompleted ? (
                                              <CheckCircle className="w-4.5 h-4.5" />
                                            ) : (
                                              <step.icon className={`w-4.5 h-4.5 ${isActive ? 'animate-pulse' : ''}`} />
                                            )}
                                          </div>
                                          <div className="flex flex-col md:items-center">
                                            <span className={`text-[9px] font-black uppercase tracking-wider ${
                                              isActive ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                                            }`}>
                                              {step.label}
                                            </span>
                                            <span className={`text-[11px] font-bold mt-0.5 leading-none ${
                                              isActive ? 'text-gray-900 font-extrabold' : isCompleted ? 'text-gray-600 font-semibold' : 'text-gray-400'
                                            }`}>
                                              {step.labelBn}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}

                            <section>
                              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" /> Ordered Items ({orderToDisplay?.items.length || 0})
                              </h3>
                              <div className="space-y-4">
                                {orderToDisplay?.items.map((item, idx) => (
                                  <div key={(item as any).cartItemId || (item.id + (item.selectedSize || '') + idx)} className="flex flex-col md:flex-row gap-6 p-5 rounded-[2rem] border border-gray-100 hover:border-gray-250 transition-colors bg-gray-50/30">
                                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-[1.5rem] shadow-md bg-white shrink-0 mx-auto md:mx-0" />
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate text-lg uppercase">{item.name}</h4>
                                        {isEditingOrder && (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveItem(idx)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                            title="Remove Item from Order"
                                          >
                                            <Trash2 className="w-4.5 h-4.5" />
                                          </button>
                                        )}
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-4 mt-3">
                                        {/* Size Segment */}
                                        {!isEditingOrder ? (
                                          <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg">
                                            Size: {item.selectedSize || 'N/A'}
                                          </span>
                                        ) : (
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Size:</span>
                                            <select
                                              value={item.selectedSize || 'M'}
                                              onChange={(e) => handleSizeChange(idx, e.target.value)}
                                              className="bg-white border border-gray-200 text-xs text-gray-900 rounded-lg px-2 py-0.5 font-bold focus:outline-none focus:border-blue-500"
                                            >
                                              {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => (
                                                <option key={sz} value={sz}>{sz}</option>
                                              ))}
                                            </select>
                                          </div>
                                        )}

                                        {/* Quantity Segment */}
                                        {!isEditingOrder ? (
                                          <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg">
                                            Qty: {item.quantity}
                                          </span>
                                        ) : (
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Qty:</span>
                                            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                                              <button
                                                type="button"
                                                onClick={() => handleQtyChange(idx, -1)}
                                                className="px-2 py-1 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
                                              >
                                                <Minus className="w-3 h-3" />
                                              </button>
                                              <span className="px-3 text-xs font-black text-gray-900">{item.quantity}</span>
                                              <button
                                                type="button"
                                                onClick={() => handleQtyChange(idx, 1)}
                                                className="px-2 py-1 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
                                              >
                                                <Plus className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {item.code && (
                                          <span className="bg-purple-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg">
                                            Code: {item.code}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex justify-between items-center mt-4 border-t border-gray-100 pt-3">
                                        <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Unit Price: ৳{item.price}</p>
                                        <p className="font-black text-gray-900 text-lg">৳{(item.price * item.quantity).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>

                            {/* Add New Product Block in Customize Mode */}
                            {isEditingOrder && (() => {
                              const filteredProductsToAdd = products.filter(p => {
                                const q = productSearchQuery.toLowerCase().trim();
                                if (!q) return true;
                                return (
                                  p.name.toLowerCase().includes(q) ||
                                  (p.code || '').toLowerCase().includes(q) ||
                                  (p.variantCodes && p.variantCodes.some(vc => vc.toLowerCase().includes(q))) ||
                                  (p.imageVariants && p.imageVariants.some(v => v.code && v.code.toLowerCase().includes(q)))
                                );
                              });

                              return (
                                <section className="bg-blue-50/25 border border-blue-200 p-6 rounded-[2.5rem] space-y-4" id="admin-add-product-section">
                                  <h4 className="text-xs font-black uppercase text-blue-700 tracking-wider flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-blue-600" /> Add Product to Order (অর্ডারে নতুন পণ্য যোগ করুন)
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Search Input */}
                                    <div className="md:col-span-4 relative">
                                      <label className="block text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">Search & Select Product (প্রোডাক্ট বা যেকোনো ছবির কোড খুঁজুন)</label>
                                      <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                          type="text"
                                          placeholder="Type product name, main code, or variant image code..."
                                          value={productSearchQuery}
                                          onChange={(e) => {
                                             setProductSearchQuery(e.target.value);
                                             if (e.target.value === '') setSelectedProductToAdd('');
                                           }}
                                          className="w-full text-xs pl-10 pr-4 py-3 border border-gray-200 hover:border-gray-300 focus:border-blue-600 focus:ring-0 rounded-2xl outline-none transition-colors bg-white text-gray-900 font-bold"
                                        />
                                      </div>
                                      {/* Suggestions */}
                                      {productSearchQuery && !selectedProductToAdd && (
                                        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                          {filteredProductsToAdd
                                            .filter(p => !editingOrderState?.items?.find(i => i.id === p.id))
                                            .map(p => {
                                              const qLower = productSearchQuery.toLowerCase().trim();
                                              const matchedVarCode = p.imageVariants?.find(v => v.code && v.code.toLowerCase().includes(qLower))?.code ||
                                                p.variantCodes?.find(vc => vc.toLowerCase().includes(qLower)) ||
                                                p.code;
                                              return (
                                                <li key={p.id} className="p-2 text-xs hover:bg-gray-100 cursor-pointer text-gray-900 border-b border-gray-50 flex items-center gap-2" onClick={() => {
                                                  setProductSearchQuery(matchedVarCode || p.name);
                                                  setSelectedProductToAdd(p.id);
                                                }}>
                                                  {p.image && <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded" />}
                                                  <span className="font-bold">{p.name}</span>
                                                  {matchedVarCode ? <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">[{matchedVarCode}]</span> : ''}
                                                </li>
                                              );
                                            })}
                                        </ul>
                                      )}
                                    </div>

                                    {/* Size */}
                                    <div>
                                      <label className="block text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">Select Size</label>
                                      <select
                                        value={productToAddSize}
                                        onChange={(e) => setProductToAddSize(e.target.value)}
                                        className="w-full text-xs p-3 border border-gray-200 hover:border-gray-300 focus:border-blue-600 focus:ring-0 rounded-2xl outline-none transition-colors bg-white text-gray-900 font-bold"
                                      >
                                        {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => (
                                          <option key={sz} value={sz}>{sz}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Quantity */}
                                    <div className="md:col-span-2">
                                      <label className="block text-[9px] font-black text-gray-400 tracking-widest uppercase mb-1">Quantity (পরিমাণ)</label>
                                      <div className="flex items-center border border-gray-200 rounded-2xl bg-white p-1 h-[42px]">
                                        <button
                                          type="button"
                                          onClick={() => setProductToAddQty(Math.max(1, productToAddQty - 1))}
                                          className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="flex-1 text-center font-black text-xs text-gray-900">{productToAddQty}</span>
                                        <button
                                          type="button"
                                          onClick={() => setProductToAddQty(productToAddQty + 1)}
                                          className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="flex items-end">
                                      <button
                                        type="button"
                                        disabled={!selectedProductToAdd}
                                        onClick={handleAddNewItemToOrder}
                                        className="w-full h-[42px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5" /> Add to List
                                      </button>
                                    </div>
                                  </div>
                                </section>
                              );
                            })()}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <section className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                  <Ticket className="w-3.5 h-3.5" /> Order Summary
                                </h3>
                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="font-bold">৳{orderToDisplay?.subtotal.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Coupon Discount</span>
                                    <span className="font-bold text-red-500">-৳{orderToDisplay?.discount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Shipping Charge</span>
                                    <span className="font-bold">৳{(orderToDisplay ? getOrderTotals(orderToDisplay).actualShipping : 0).toFixed(2)}</span>
                                  </div>
                                  <div className="h-px bg-gray-200 my-2" />
                                  <div className="flex justify-between items-center text-lg">
                                    <span className="font-black uppercase tracking-tighter">Total</span>
                                    <span className="font-black text-blue-600">৳{(orderToDisplay ? getOrderTotals(orderToDisplay).actualTotalPayable : 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              </section>

                              <section className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-center">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Quick Status Update</h3>
                                <div className="flex flex-wrap gap-2">
                                  {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map(st => (
                                    <button 
                                      key={st}
                                      onClick={() => {
                                        if (orderToDisplay) {
                                          updateOrderStatus(orderToDisplay.id, st);
                                          setSelectedOrderForView({...orderToDisplay, status: st});
                                          if (isEditingOrder && editingOrderState) {
                                            setEditingOrderState({...editingOrderState, status: st});
                                          }
                                        }
                                      }}
                                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                        orderToDisplay?.status === st 
                                        ? st === 'pending' ? 'bg-amber-500 text-white border-amber-400 shadow-lg scale-105' :
                                          st === 'processing' ? 'bg-blue-500 text-white border-blue-400 shadow-lg scale-105' :
                                          st === 'shipped' ? 'bg-purple-500 text-white border-purple-400 shadow-lg scale-105' :
                                          st === 'delivered' ? 'bg-green-500 text-white border-green-400 shadow-lg scale-105' :
                                          'bg-red-500 text-white border-red-400 shadow-lg scale-105'
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </section>
                            </div>
                          </div>

                          {/* Right Column: Customer & Actions */}
                          <div className="space-y-6">
                            {/* Customer Card */}
                            <section className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <UserCircle className="w-4 h-4 text-blue-400" /> Customer Information {isEditingOrder && <span className="text-amber-400 text-[10px] font-black uppercase">(Editing Mode)</span>}
                              </h3>
                              
                              {!isEditingOrder ? (
                                <div className="space-y-5">
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                                    <p className="font-bold text-lg">{orderToDisplay?.customer.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Number</p>
                                    <p className="font-bold font-mono text-lg">{orderToDisplay?.customer.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                                    <p className="text-gray-300 font-medium text-sm">{orderToDisplay?.customer.email || 'No email provided'}</p>
                                  </div>
                                  <div className="pt-4 border-t border-white/10">
                                    <div className="flex items-start gap-3">
                                      <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                                      <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                                        <p className="text-sm font-medium leading-relaxed break-words whitespace-pre-line">
                                          <span className="block font-black text-white mb-0.5">{orderToDisplay?.customer.district || 'General'}</span>
                                          {orderToDisplay?.customer.address}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Full Name</label>
                                    <input 
                                      type="text" 
                                      value={editingOrderState?.customer.name || ''} 
                                      onChange={(e) => {
                                        if (editingOrderState) {
                                          setEditingOrderState({
                                            ...editingOrderState,
                                            customer: { ...editingOrderState.customer, name: e.target.value }
                                          });
                                        }
                                      }}
                                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 placeholder-white/30"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Contact Number</label>
                                    <input 
                                      type="text" 
                                      value={editingOrderState?.customer.phone || ''} 
                                      onChange={(e) => {
                                        if (editingOrderState) {
                                          setEditingOrderState({
                                            ...editingOrderState,
                                            customer: { ...editingOrderState.customer, phone: e.target.value }
                                          });
                                        }
                                      }}
                                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400 placeholder-white/30"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Email Address</label>
                                    <input 
                                      type="email" 
                                      value={editingOrderState?.customer.email || ''} 
                                      onChange={(e) => {
                                        if (editingOrderState) {
                                          setEditingOrderState({
                                            ...editingOrderState,
                                            customer: { ...editingOrderState.customer, email: e.target.value }
                                          });
                                        }
                                      }}
                                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 placeholder-white/30"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">District</label>
                                    <input 
                                      type="text" 
                                      value={editingOrderState?.customer.district || ''} 
                                      onChange={(e) => {
                                        if (editingOrderState) {
                                          const updatedCustomer = { ...editingOrderState.customer, district: e.target.value };
                                          const updatedOrder = { ...editingOrderState, customer: updatedCustomer };
                                          setEditingOrderState(recalculateOrderTotals(updatedOrder));
                                        }
                                      }}
                                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 placeholder-white/30"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Delivery Address</label>
                                    <textarea 
                                      value={editingOrderState?.customer.address || ''} 
                                      rows={2}
                                      onChange={(e) => {
                                        if (editingOrderState) {
                                          const updatedCustomer = { ...editingOrderState.customer, address: e.target.value };
                                          const updatedOrder = { ...editingOrderState, customer: updatedCustomer };
                                          setEditingOrderState(recalculateOrderTotals(updatedOrder));
                                        }
                                      }}
                                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none placeholder-white/30"
                                    />
                                  </div>
                                </div>
                              )}
                            </section>

                            {/* Internal Notes Panel */}
                            <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600" /> Internal Notes (অভ্যন্তরীণ মন্তব্য)
                              </h3>
                              <div>
                                <textarea
                                  value={orderNotes}
                                  onChange={(e) => setOrderNotes(e.target.value)}
                                  placeholder="Add private updates or internal notes for this order here..."
                                  rows={3}
                                  className="w-full text-xs p-3.5 border border-gray-200 hover:border-gray-300 focus:border-blue-600 focus:ring-0 rounded-2xl outline-none resize-none transition-colors bg-gray-50/50 text-gray-900"
                                />
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => {
                                      if (selectedOrderForView) {
                                        updateOrderNotes(selectedOrderForView.id, orderNotes);
                                        setSelectedOrderForView({ ...selectedOrderForView, notes: orderNotes });
                                        Swal.fire({
                                          title: 'Saved',
                                          text: 'Order notes successfully updated!',
                                          icon: 'success',
                                          timer: 1500,
                                          showConfirmButton: false,
                                          toast: true,
                                          position: 'top-end'
                                        });
                                      }
                                    }}
                                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm active:scale-95 cursor-pointer font-bold"
                                  >
                                    Save Notes
                                  </button>
                                </div>
                              </div>
                            </section>

                            {/* Control Actions */}
                            <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => handlePrintInvoice(selectedOrderForView!)}
                                className="w-full bg-blue-600 text-white p-5 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10 group cursor-pointer"
                              >
                                <Printer className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Print Invoice</span>
                              </button>
                              <button 
                                onClick={() => {
                                  if (selectedOrderForView) {
                                    if (currentAdmin?.role !== 'super') {
                                        Swal.fire({
                                            title: 'Error',
                                            text: 'Only Super Admin can delete orders.',
                                            icon: 'error',
                                            confirmButtonColor: '#000000'
                                        });
                                        return;
                                    }
                                    if (selectedOrderForView.status === 'delivered') {
                                        Swal.fire({
                                            title: 'Error',
                                            text: 'Delivered অর্ডার ডিলিট করা যাবে না।',
                                            icon: 'error',
                                            confirmButtonColor: '#000000'
                                        });
                                        return;
                                    }
                                    Swal.fire({
                                      title: 'Are you sure?',
                                      text: "You won't be able to revert this!",
                                      icon: 'warning',
                                      showCancelButton: true,
                                      confirmButtonColor: '#ef4444',
                                      cancelButtonColor: '#111',
                                      confirmButtonText: 'Yes, delete it!'
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        deleteOrder(selectedOrderForView.id);
                                        setSelectedOrderForView(null);
                                        Swal.fire('Deleted!', 'Order has been deleted.', 'success');
                                      }
                                    });
                                  }
                                }}
                                className={`w-full bg-red-50 text-red-600 p-5 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all border border-red-100 shadow-xl shadow-red-600/5 group ${currentAdmin?.role !== 'super' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100 cursor-pointer'}`}
                              >
                                <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Delete Order</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h1 className="text-2xl font-black uppercase">Coupons</h1>
              <button 
                onClick={() => {
                  setEditingCoupon(null);
                  setNewCoupon({ code: '', discountValue: 0, discountType: 'percentage', isActive: true, startDate: '', expiryDate: '' });
                  setIsAddingCoupon(!isAddingCoupon);
                }}
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 tracking-widest text-[10px] font-bold uppercase transition-colors"
              >
                {isAddingCoupon ? 'Cancel' : <><Plus className="h-4 w-4"/> Add Coupon</>}
              </button>
            </div>

            {isAddingCoupon && (
              <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[82vh] overflow-y-auto">
                  <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="font-black uppercase text-xl text-gray-900">{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h3>
                      </div>
                      <button type="button" onClick={() => setIsAddingCoupon(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors self-start -mt-2 -mr-2">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Coupon Code</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm uppercase focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newCoupon.code} onChange={e=>setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} /></div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Discount Type</label>
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => setNewCoupon({...newCoupon, discountType: 'percentage'})}
                          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${newCoupon.discountType === 'percentage' ? 'bg-yellow-400 border-yellow-500 text-black' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                        >
                          Percentage (%)
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setNewCoupon({...newCoupon, discountType: 'amount'})}
                          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${newCoupon.discountType === 'amount' ? 'bg-yellow-400 border-yellow-500 text-black' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                        >
                          Fixed Amount (৳)
                        </button>
                      </div>
                    </div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Discount Value</label><input type="number" required min="1" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newCoupon.discountValue} onChange={e=>setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})} /></div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Start Date & Time</label>
                      <input 
                        type="datetime-local" 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" 
                        value={newCoupon.startDate || ''} 
                        onChange={e=>setNewCoupon({...newCoupon, startDate: e.target.value})} 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Expiry Date & Time</label>
                      <input 
                        type="datetime-local" 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" 
                        value={newCoupon.expiryDate || ''} 
                        onChange={e=>setNewCoupon({...newCoupon, expiryDate: e.target.value})} 
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                      <input type="checkbox" id="isactive" checked={newCoupon.isActive} onChange={e=>setNewCoupon({...newCoupon, isActive: e.target.checked})} className="w-4 h-4 text-black focus:ring-black" />
                      <label htmlFor="isactive" className="text-xs font-bold uppercase tracking-widest text-gray-900 cursor-pointer select-none">Active</label>
                    </div>
                    <div className="md:col-span-2 flex gap-3 justify-end pt-2 mt-4">
                      <button type="button" onClick={() => { setIsAddingCoupon(false); setEditingCoupon(null); }} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                      <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform">Save Coupon</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Code</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Discount</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-center">Expiry</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Status</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map(c => {
                    const now = new Date();
                    const isExpired = c.expiryDate && new Date(c.expiryDate) < now;
                    const isStarted = !c.startDate || new Date(c.startDate) <= now;
                    return (
                      <tr key={c.id}>
                        <td className="p-4"><span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1.5 rounded-lg font-mono font-black tracking-wider text-sm shadow-sm">{c.code}</span></td>
                        <td className="p-4 text-gray-900 font-extrabold">{c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `৳${c.discountValue} FLAT`}</td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col gap-1">
                            {c.startDate && (
                              <div className="flex flex-col">
                                <span className="text-[8px] font-bold uppercase text-gray-400">Starts</span>
                                <span className={`text-[10px] font-bold ${!isStarted ? 'text-blue-500' : 'text-gray-600'}`}>
                                  {new Date(c.startDate).toLocaleDateString()} {new Date(c.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                            {c.expiryDate && (
                              <div className="flex flex-col border-t border-gray-100 pt-1">
                                <span className="text-[8px] font-bold uppercase text-gray-400">Expires</span>
                                <span className={`text-[10px] font-bold ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
                                  {new Date(c.expiryDate).toLocaleDateString()} {new Date(c.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                            {!c.startDate && !c.expiryDate && <span className="text-gray-400 text-xs">No Limits</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          {isExpired ? (
                            <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase px-2 py-0.5 rounded">Expired</span>
                          ) : !isStarted ? (
                            <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase px-2 py-0.5 rounded">Upcoming</span>
                          ) : c.isActive ? (
                            <span className="bg-green-50 text-green-600 border border-green-100 text-[10px] font-black uppercase px-2 py-0.5 rounded">Active</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-black uppercase px-2 py-0.5 rounded">Inactive</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => {
                              setEditingCoupon(c);
                              setNewCoupon({ code: c.code, discountValue: c.discountValue, discountType: c.discountType, isActive: c.isActive, startDate: c.startDate || '', expiryDate: c.expiryDate || '' });
                              setIsAddingCoupon(true);
                            }} 
                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg mr-2"
                          >
                            <Edit className="h-5 w-5"/>
                          </button>
                          <button onClick={async () => {
                            const result = await Swal.fire({
                              title: 'Are you sure?',
                              text: "You won't be able to revert this!",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#000',
                              cancelButtonColor: '#d33',
                              confirmButtonText: 'Yes, delete it!'
                            });
                            if (result.isConfirmed) {
                              deleteCoupon(c.id);
                              Swal.fire('Deleted!', 'Coupon has been deleted.', 'success');
                            }
                          }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="h-5 w-5"/></button>
                        </td>
                      </tr>
                    );
                  })}
                  {coupons.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No coupons found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* New Categories Management Tab */}
        {activeTab === 'categories' && (
          <AdminCategoriesView />
        )}

        {/* Slides Tab */}
        {activeTab === 'slides' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h1 className="text-2xl font-black uppercase">Hero Banners</h1>
              <button 
                onClick={() => setIsAddingSlide(!isAddingSlide)}
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 tracking-widest text-[10px] font-bold uppercase transition-colors"
              >
                {isAddingSlide ? 'Cancel' : <><Plus className="h-4 w-4"/> Add Slide</>}
              </button>
            </div>

            {isAddingSlide && (
              <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row gap-8 max-h-[82vh] overflow-y-auto">
                  <div className="w-full md:w-2/5 flex flex-col gap-4">
                    <div className="aspect-[4/5] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                      {newSlide.image ? (
                        <img src={newSlide.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="h-12 w-12 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Image Preview</span>
                    </div>
                  </div>

                  <form onSubmit={handleAddSlide} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                    <div className="md:col-span-2 flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="font-black uppercase text-xl text-gray-900">Add Hero Banner</h3>
                      </div>
                      <button type="button" onClick={() => setIsAddingSlide(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors self-start -mt-2 -mr-2">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Title</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newSlide.title} onChange={e=>setNewSlide({...newSlide, title: e.target.value})} placeholder="e.g. Summer Collection" /></div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Subtitle</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newSlide.subtitle} onChange={e=>setNewSlide({...newSlide, subtitle: e.target.value})} placeholder="e.g. 50% Off Everything" /></div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tag Text</label><input className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newSlide.tagText} onChange={e=>setNewSlide({...newSlide, tagText: e.target.value})} placeholder="e.g. New Arrivals" /></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Auto Category / Sub-Category Link</label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                          onChange={e => {
                            if (e.target.value) {
                              setNewSlide({...newSlide, link: e.target.value});
                            }
                          }}
                        >
                          <option key="slide-cat" value="">-- Choose Category / Sub-Category --</option>
                          {adminCategories.filter(c => c !== 'all').flatMap(cat => {
                            const subs = getSubCategoriesFor(cat);
                            return [
                              <option key={cat} value={`/shop?category=${encodeURIComponent(cat)}`}>{cat}</option>,
                              ...subs.map(sub => (
                                <option key={`${cat}-${sub}`} value={`/shop?category=${encodeURIComponent(cat)}&subCategory=${encodeURIComponent(sub)}`}>
                                  &nbsp;&nbsp;↳ {cat} › {sub}
                                </option>
                              ))
                            ];
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Destination URL Link</label>
                        <input className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newSlide.link} onChange={e=>setNewSlide({...newSlide, link: e.target.value})} placeholder="e.g. /shop" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Slide Image</label>
                      <div className="flex gap-2">
                        <input required className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newSlide.image} onChange={e=>setNewSlide({...newSlide, image: e.target.value})} placeholder="URL or Base64" />
                        <label className="cursor-pointer bg-black text-white px-4 rounded-xl flex items-center hover:bg-gray-800 transition-colors">
                          <Camera className="h-4 w-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, (url) => setNewSlide({...newSlide, image: url}))} />
                        </label>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex gap-3 justify-end pt-2 mt-auto">
                      <button type="button" onClick={() => setIsAddingSlide(false)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                      <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform">Save Slide</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto w-full">
              <table className="w-full text-left text-sm min-w-[700px] md:min-w-0">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Image & Title</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Subtitle</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {slides.filter(s => !s.deleted).map(s => (
                    <tr key={s.id}>
                      <td className="p-4 flex items-center gap-3">
                        {s.image && <img src={s.image} className="w-16 h-10 rounded object-cover" alt="" />}
                        <span className="font-medium">{s.title}</span>
                      </td>
                      <td className="p-4">{s.subtitle}</td>
                      <td className="p-4 text-right flex gap-3 justify-end">
                        <button 
                          onClick={() => {
                            setEditingSlide(s);
                            setNewSlide({ title: s.title, subtitle: s.subtitle, image: s.image, tagText: s.tagText || '', link: s.link || '' });
                            setIsAddingSlide(true);
                          }}
                          className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
                        >
                          <Edit className="h-5 w-5"/>
                        </button>
                        <button onClick={async () => {
                          const result = await Swal.fire({
                            title: 'Are you sure?',
                            text: "Delete this slide?",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#000',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, delete it!'
                          });
                          if (result.isConfirmed) {
                            deleteSlide(s.id);
                            Swal.fire('Deleted!', 'Slide has been deleted.', 'success');
                          }
                        }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="h-5 w-5"/></button>
                      </td>
                    </tr>
                  ))}
                  {slides.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-gray-500">No slides found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Banner Tab (Old Categories) */}
        {activeTab === 'categoriesBanner' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h1 className="text-2xl font-black uppercase">Category Banners</h1>
              <button 
                onClick={() => setIsAddingCategoryBanner(!isAddingCategoryBanner)}
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 tracking-widest text-[10px] font-bold uppercase transition-colors"
               >
                {isAddingCategoryBanner ? 'Cancel' : <><Plus className="h-4 w-4"/> Add Category Banner</>}
              </button>
            </div>

            {isAddingCategoryBanner && (
              <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row gap-8 max-h-[82vh] overflow-y-auto">
                  <div className="w-full md:w-2/5 flex flex-col gap-4">
                    <div className="aspect-[4/5] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                      {newCategoryBanner.image ? (
                        <img src={newCategoryBanner.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="h-12 w-12 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Image Preview</span>
                    </div>
                  </div>

                  <form onSubmit={handleAddCategoryBanner} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                    <div className="md:col-span-2 flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="font-black uppercase text-xl text-gray-950">Add Category</h3>
                      </div>
                      <button type="button" onClick={() => setIsAddingCategoryBanner(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors self-start -mt-2 -mr-2">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Title (Use \n for break)</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newCategoryBanner.title} onChange={e=>setNewCategoryBanner({...newCategoryBanner, title: e.target.value})} placeholder="e.g. Basic\nTees" /></div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Subtitle</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newCategoryBanner.subtitle} onChange={e=>setNewCategoryBanner({...newCategoryBanner, subtitle: e.target.value})} placeholder="e.g. Everyday Essentials" /></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Auto Category / Sub-Category Link</label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                          onChange={e => {
                            if (e.target.value) {
                              setNewCategoryBanner({...newCategoryBanner, link: e.target.value});
                            }
                          }}
                        >
                          <option key="banner-cat" value="">-- Choose Category / Sub-Category --</option>
                          {adminCategories.filter(c => c !== 'all').flatMap(cat => {
                            const subs = getSubCategoriesFor(cat);
                            return [
                              <option key={cat} value={`/shop?category=${encodeURIComponent(cat)}`}>{cat}</option>,
                              ...subs.map(sub => (
                                <option key={`${cat}-${sub}`} value={`/shop?category=${encodeURIComponent(cat)}&subCategory=${encodeURIComponent(sub)}`}>
                                  &nbsp;&nbsp;↳ {cat} › {sub}
                                </option>
                              ))
                            ];
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Destination URL Link</label>
                        <input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newCategoryBanner.link} onChange={e=>setNewCategoryBanner({...newCategoryBanner, link: e.target.value})} placeholder="e.g. /shop?category=Winter" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Banner Image</label>
                      <div className="flex gap-2">
                        <input required className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newCategoryBanner.image} onChange={e=>setNewCategoryBanner({...newCategoryBanner, image: e.target.value})} placeholder="URL or Base64" />
                        <label className="cursor-pointer bg-black text-white px-4 rounded-xl flex items-center hover:bg-gray-800 transition-colors">
                          <Camera className="h-4 w-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, (url) => setNewCategoryBanner({...newCategoryBanner, image: url}))} />
                        </label>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex gap-3 justify-end pt-2 mt-auto">
                       <button type="button" onClick={() => setIsAddingCategoryBanner(false)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                       <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform">Save Category</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {editingCategoryBanner && (
              <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row gap-8 max-h-[82vh] overflow-y-auto">
                  <div className="w-full md:w-2/5 flex flex-col gap-4">
                    <div className="aspect-[4/5] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                      {editingCategoryBanner.image ? (
                        <img src={editingCategoryBanner.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="h-12 w-12 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Image Preview</span>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateCategoryBanner} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                    <div className="md:col-span-2 flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="font-black uppercase text-xl text-gray-900">Edit Category Banner</h3>
                      </div>
                      <button type="button" onClick={() => setEditingCategoryBanner(null)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors self-start -mt-2 -mr-2">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Title (Use \n for break)</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={editingCategoryBanner.title} onChange={e=>setEditingCategoryBanner({...editingCategoryBanner, title: e.target.value})} placeholder="e.g. Basic\nTees" /></div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Subtitle</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={editingCategoryBanner.subtitle} onChange={e=>setEditingCategoryBanner({...editingCategoryBanner, subtitle: e.target.value})} placeholder="e.g. Everyday Essentials" /></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Auto Category / Sub-Category Link</label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                          onChange={e => {
                            if (e.target.value) {
                              setEditingCategoryBanner({...editingCategoryBanner, link: e.target.value});
                            }
                          }}
                        >
                          <option key="edit-banner-cat" value="">-- Choose Category / Sub-Category --</option>
                          {adminCategories.filter(c => c !== 'all').flatMap(cat => {
                            const subs = getSubCategoriesFor(cat);
                            return [
                              <option key={cat} value={`/shop?category=${encodeURIComponent(cat)}`}>{cat}</option>,
                              ...subs.map(sub => (
                                <option key={`${cat}-${sub}`} value={`/shop?category=${encodeURIComponent(cat)}&subCategory=${encodeURIComponent(sub)}`}>
                                  &nbsp;&nbsp;↳ {cat} › {sub}
                                </option>
                              ))
                            ];
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Destination URL Link</label>
                        <input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={editingCategoryBanner.link} onChange={e=>setEditingCategoryBanner({...editingCategoryBanner, link: e.target.value})} placeholder="e.g. /shop?category=Winter" />
                      </div>
                    </div>

                    <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Image URL</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={editingCategoryBanner.image} onChange={e=>setEditingCategoryBanner({...editingCategoryBanner, image: e.target.value})} placeholder="https://..." /></div>
                    
                    <div className="md:col-span-2 flex gap-3 justify-end pt-2 mt-6 mb-6">
                       <button type="button" onClick={() => setEditingCategoryBanner(null)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                       <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto w-full">
              <table className="w-full text-left text-sm min-w-[750px] md:min-w-0">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Image & Title</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Subtitle</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Link</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categoryBanners.map(c => (
                    <tr key={c.id}>
                      <td className="p-4 flex items-center gap-3">
                        {c.image && <img src={c.image} className="w-12 h-12 rounded object-cover" alt="" />}
                        <span className="font-medium whitespace-pre-line">{c.title}</span>
                      </td>
                      <td className="p-4">{c.subtitle}</td>
                      <td className="p-4">{c.link}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingCategoryBanner(c)} className="text-black hover:bg-gray-50 p-2 rounded-lg" title="Edit Category"><Edit className="h-5 w-5"/></button>
                          <button onClick={async () => {
                            const result = await Swal.fire({
                              title: 'Are you sure?',
                              text: "Delete this category banner?",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#000',
                              cancelButtonColor: '#d33',
                              confirmButtonText: 'Yes, delete it!'
                            });
                            if (result.isConfirmed) {
                              deleteCategoryBanner(c.id);
                              Swal.fire('Deleted!', 'Category banner has been deleted.', 'success');
                            }
                          }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg" title="Delete Category"><Trash2 className="h-5 w-5"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categoryBanners.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No categories found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lookbook Tab */}
        {activeTab === 'lookbook' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-2xl font-black uppercase flex items-center gap-2 text-gray-900">
                  <Grid className="w-6 h-6 text-black" />
                  <span>Lookbook Gallery</span>
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Manage homepage visual gallery, grid tile spans, and direct product/category links
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowLookbookGridPreview(!showLookbookGridPreview)}
                  className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                    showLookbookGridPreview 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Toggle Homepage Live Grid Preview"
                >
                  {showLookbookGridPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 text-blue-600" />
                      <span>Hide Grid Preview</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span>Live Grid Preview</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    setEditingLookbook(null);
                    setNewLookbook({ image: '', link: '', className: 'col-span-1 row-span-1', widthPercent: '100%', heightPercent: '100%', serial: lookbook.length + 1, title: '' });
                    setIsAddingLookbook(!isAddingLookbook);
                  }}
                  className="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 tracking-wider text-xs font-bold uppercase transition-all shadow-sm active:scale-95"
                >
                  {isAddingLookbook ? 'Cancel' : <><Plus className="h-4 w-4"/> Add Lookbook Item</>}
                </button>
              </div>
            </div>

            {/* Interactive Live Grid Preview */}
            {showLookbookGridPreview && (
              <div className="mb-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-black text-white rounded-xl shadow-sm">
                      <Grid className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                        Live Grid Preview & Visual Arranger
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Cards render below in the exact 4-column storefront grid. Reorder tiles using ◄ / ► arrows and click "Save Grid Arrangement".
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleNormalizeLookbookSerials}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-gray-200 transition-colors"
                      title="Normalize sequence into 1, 2, 3..."
                    >
                      Normalize (1, 2, 3...)
                    </button>
                    {isLookbookOrderChanged && (
                      <button
                        type="button"
                        onClick={handleResetLookbookArrangement}
                        className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-gray-200 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3 inline mr-1" /> Reset
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveLookbookArrangement}
                      className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm ${
                        isLookbookOrderChanged 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse' 
                          : 'bg-black hover:bg-gray-800 text-white'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isLookbookOrderChanged ? 'Save Grid Arrangement *' : 'Save Arrangement'}</span>
                    </button>
                  </div>
                </div>

                {/* Status notice when arrangement has unsaved changes */}
                {isLookbookOrderChanged && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <p className="text-xs font-bold text-amber-900">
                        Lookbook grid positions have been modified! Click <span className="font-black text-black">"Save Grid Arrangement"</span> to apply changes to database.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetLookbookArrangement}
                        className="px-3 py-1 bg-white text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-200"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveLookbookArrangement}
                        className="px-4 py-1 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1"
                      >
                        <Save className="w-3 h-3 text-emerald-400" /> Save Now
                      </button>
                    </div>
                  </div>
                )}

                {arrangedLookbook.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-300">
                    <Image className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm font-bold text-gray-800">No Lookbook Images Added Yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm">
                      Click the "Add Lookbook Item" button above to upload photo tiles and set up your grid layout.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
                    {arrangedLookbook.map((l, idx, arr) => (
                      <div
                        key={l.id}
                        className={`relative rounded-2xl overflow-hidden group min-h-[190px] border border-gray-200 shadow-sm bg-gray-900 flex flex-col justify-end transition-all ${l.className || 'col-span-1 row-span-1'}`}
                      >
                        {l.image ? (
                          <img
                            src={l.image}
                            alt={l.title || "Lookbook Tile"}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                            <Image className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 pointer-events-none" />

                        {/* Top Badges & Position Controls */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
                          <div className="flex items-center gap-1">
                            <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm border border-white/10">
                              #{l.serial || 0}
                            </span>
                            {/* Position Arrange Buttons on Card */}
                            <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-md p-0.5 rounded-md">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveLookbookPosition(idx, 'left')}
                                  className="text-white hover:text-yellow-300 p-0.5 rounded transition-colors"
                                  title="Move Left / Earlier"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}
                              {idx < arr.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveLookbookPosition(idx, 'right')}
                                  className="text-white hover:text-yellow-300 p-0.5 rounded transition-colors"
                                  title="Move Right / Later"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <span className="bg-white/95 backdrop-blur-md text-gray-900 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-sm truncate max-w-[130px]">
                            {getLookbookPresetBadge(l.className)}
                          </span>
                        </div>

                        {/* Quick Admin Actions on Hover */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLookbook(l);
                              setNewLookbook({
                                image: l.image,
                                link: l.link,
                                className: l.className || 'col-span-1 row-span-1',
                                widthPercent: l.widthPercent || '100%',
                                heightPercent: l.heightPercent || '100%',
                                serial: l.serial || 1,
                                title: l.title || ''
                              });
                              setIsAddingLookbook(true);
                            }}
                            className="p-1.5 bg-white text-black hover:bg-gray-100 rounded-lg shadow-lg transition-transform hover:scale-105"
                            title="Edit Item"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: 'Are you sure?',
                                text: "Delete this lookbook item?",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#000',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, delete it!'
                              });
                              if (result.isConfirmed) {
                                deleteLookbookImage(l.id);
                                Swal.fire('Deleted!', 'Lookbook item has been deleted.', 'success');
                              }
                            }}
                            className="p-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-lg transition-transform hover:scale-105"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Bottom Info Overlay */}
                        <div className="relative z-10 p-3 text-white pointer-events-none">
                          {l.title ? (
                            <p className="text-xs font-black uppercase tracking-wide truncate drop-shadow-sm">
                              {l.title}
                            </p>
                          ) : (
                            <p className="text-[10px] text-gray-300 italic">No Title</p>
                          )}
                          <p className="text-[9px] text-gray-300 font-mono truncate mt-0.5 opacity-90">
                            {l.link || '/shop'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAddingLookbook && (
              <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-14 md:pt-16 pb-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-5xl shadow-2xl relative flex flex-col md:flex-row gap-8 max-h-[88vh] overflow-y-auto">
                  {/* Left Column: Visual Preview Selector (Tile vs Full Grid Simulation) */}
                  <div className="w-full md:w-5/12 flex flex-col gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setLookbookModalPreviewTab('grid')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          lookbookModalPreviewTab === 'grid' 
                            ? 'bg-black text-white shadow-sm' 
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        Full Grid Simulation
                      </button>
                      <button
                        type="button"
                        onClick={() => setLookbookModalPreviewTab('tile')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          lookbookModalPreviewTab === 'tile' 
                            ? 'bg-black text-white shadow-sm' 
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        Single Tile Preview
                      </button>
                    </div>

                    {lookbookModalPreviewTab === 'grid' ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">
                            Live Grid Placement (Before Save)
                          </span>
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Pos #{newLookbook.serial || 1}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">
                          See how this card fits and spans in the 4-column storefront layout before saving:
                        </p>
                        
                        <div className="max-h-[360px] overflow-y-auto p-3 bg-gray-50 rounded-2xl border border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 auto-rows-fr">
                            {simulatedLookbook.map(l => {
                              const isCandidate = (editingLookbook && l.id === editingLookbook.id) || (!editingLookbook && l.id === 'simulated-new-item');
                              return (
                                <div
                                  key={l.id}
                                  className={`relative rounded-xl overflow-hidden min-h-[110px] border flex flex-col justify-end transition-all ${l.className || 'col-span-1 row-span-1'} ${
                                    isCandidate 
                                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg scale-[1.02] bg-blue-950' 
                                      : 'border-gray-300 bg-gray-900 opacity-80'
                                  }`}
                                >
                                  {l.image ? (
                                    <img src={l.image} alt={l.title} className="absolute inset-0 w-full h-full object-cover" />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                                      <Image className="w-6 h-6" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 pointer-events-none" />
                                  
                                  <div className="absolute top-1 left-1 z-10">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isCandidate ? 'bg-blue-600 text-white' : 'bg-black/75 text-white'}`}>
                                      #{l.serial || 0}
                                    </span>
                                  </div>
                                  {isCandidate && (
                                    <div className="absolute top-1 right-1 z-10">
                                      <span className="text-[7px] font-black uppercase px-1 py-0.5 rounded bg-amber-400 text-black animate-pulse">
                                        ★ Preview (New)
                                      </span>
                                    </div>
                                  )}

                                  <div className="relative z-10 p-1.5 text-white pointer-events-none">
                                    <p className="text-[10px] font-bold uppercase truncate leading-tight">
                                      {l.title || (isCandidate ? 'Current Item' : 'Lookbook')}
                                    </p>
                                    <span className="text-[8px] font-mono text-gray-300 block truncate">
                                      {getLookbookPresetBadge(l.className)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="aspect-[4/5] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shadow-inner relative flex items-center justify-center">
                          {newLookbook.image ? (
                            <img src={newLookbook.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                              <Image className="h-12 w-12 opacity-40" />
                              <span className="text-xs font-medium">No Image Selected</span>
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm">
                              {getLookbookPresetBadge(newLookbook.className)}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Card Tile Preview</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAddLookbook} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                    <div className="md:col-span-2 flex justify-between items-center mb-2 border-b border-gray-100 pb-3">
                      <div>
                        <h3 className="font-black uppercase text-xl text-gray-900">
                          {editingLookbook ? 'Edit Lookbook Item' : 'Add New Lookbook Item'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Set image, position, grid dimensions, and link. Changes reflect live in the preview on the left.
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsAddingLookbook(false);
                          setEditingLookbook(null);
                        }} 
                        className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors self-start -mt-2 -mr-2"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Image File Upload & URL input */}
                    <div className="md:col-span-2 bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                      <label className="cursor-pointer bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2">
                        <UploadCloud className="h-4 w-4" />
                        <span>Upload Image from Device</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 3 * 1024 * 1024) {
                                Swal.fire('Error', 'Image size must be less than 3MB', 'error');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewLookbook({ ...newLookbook, image: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[11px] text-gray-400 font-medium">Or paste direct image URL:</span>
                      <input 
                        required 
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-black focus:outline-none bg-white transition-colors" 
                        value={newLookbook.image} 
                        onChange={e => setNewLookbook({ ...newLookbook, image: e.target.value })} 
                        placeholder="https://images.unsplash.com/..." 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Display Order / Serial</label>
                      <input 
                        type="number" 
                        required 
                        min="1" 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" 
                        value={newLookbook.serial} 
                        onChange={e => setNewLookbook({...newLookbook, serial: Number(e.target.value) || 1})} 
                        placeholder="e.g. 1, 2, 3" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Title / Caption (Optional)</label>
                      <input 
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" 
                        value={newLookbook.title} 
                        onChange={e => setNewLookbook({...newLookbook, title: e.target.value})} 
                        placeholder="e.g. Summer Minimalist Series" 
                      />
                    </div>

                    {/* Enhanced Grid Layout Selector with Dropdown & Presets */}
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600">
                            Grid Layout & Card Size (Select from Dropdown)
                          </label>
                          <span className="text-[10px] font-black uppercase text-black bg-white px-2 py-0.5 rounded border border-gray-200">
                            {getLookbookPresetBadge(newLookbook.className)}
                          </span>
                        </div>
                        <select
                          className="w-full border border-gray-200 rounded-xl p-3 text-xs font-bold bg-white focus:ring-1 focus:ring-black focus:outline-none transition-colors"
                          value={LOOKBOOK_GRID_PRESETS.some(p => p.id === newLookbook.className) ? newLookbook.className : (newLookbook.className ? 'custom' : 'col-span-1 row-span-1')}
                          onChange={e => {
                            if (e.target.value !== 'custom') {
                              setNewLookbook({ ...newLookbook, className: e.target.value });
                            }
                          }}
                        >
                          {LOOKBOOK_GRID_PRESETS.map(preset => (
                            <option key={preset.id} value={preset.id}>
                              {preset.label} — [{preset.badge}]
                            </option>
                          ))}
                          <option value="custom">Custom CSS Class (Manual Input)</option>
                        </select>
                      </div>

                      {/* Quick 1-Click Preset Buttons */}
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Quick 1-Click Presets:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {LOOKBOOK_GRID_PRESETS.slice(0, 4).map(preset => {
                            const isSelected = newLookbook.className === preset.id || (!newLookbook.className && preset.id === 'col-span-1 row-span-1');
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setNewLookbook({ ...newLookbook, className: preset.id })}
                                className={`p-2.5 rounded-xl border text-[11px] font-bold uppercase transition-all ${
                                  isSelected 
                                    ? 'bg-black text-white border-black shadow-md' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {preset.badge}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Informational description box */}
                      <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-start gap-2.5 text-xs text-gray-600">
                        <div className="p-1 bg-black text-white rounded text-[10px] font-black uppercase shrink-0 mt-0.5">
                          {getLookbookPresetBadge(newLookbook.className)}
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-gray-600 font-medium">
                            {LOOKBOOK_GRID_PRESETS.find(p => p.id === newLookbook.className)?.desc || 'Custom Tailwind CSS layout class applied.'}
                          </p>
                        </div>
                      </div>

                      {/* Custom class input */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono text-gray-400 shrink-0">Custom Tailwind Class:</span>
                        <input 
                          className="flex-1 border border-gray-200 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-black focus:outline-none bg-white" 
                          value={newLookbook.className} 
                          onChange={e => setNewLookbook({ ...newLookbook, className: e.target.value })} 
                          placeholder="e.g. col-span-2 row-span-2" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Quick Category / Sub-Category Link</label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                          onChange={e => {
                            if (e.target.value) {
                              setNewLookbook({...newLookbook, link: e.target.value});
                            }
                          }}
                        >
                          <option key="lookbook-cat" value="">-- Choose Category / Sub-Category --</option>
                          {adminCategories.filter(c => c !== 'all').flatMap(cat => {
                            const subs = getSubCategoriesFor(cat);
                            return [
                              <option key={cat} value={`/shop?category=${encodeURIComponent(cat)}`}>{cat}</option>,
                              ...subs.map(sub => (
                                <option key={`${cat}-${sub}`} value={`/shop?category=${encodeURIComponent(cat)}&subCategory=${encodeURIComponent(sub)}`}>
                                  &nbsp;&nbsp;↳ {cat} › {sub}
                                </option>
                              ))
                            ];
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Custom Destination URL (Optional)</label>
                        <input 
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" 
                          value={newLookbook.link} 
                          onChange={e => setNewLookbook({...newLookbook, link: e.target.value})} 
                          placeholder="e.g. /shop?category=Basic" 
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex gap-3 justify-end pt-2 mt-auto">
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsAddingLookbook(false);
                          setEditingLookbook(null);
                        }} 
                        className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform">
                        {editingLookbook ? 'Update Lookbook Item' : 'Save Lookbook Item'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Serial</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Title</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Image</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Link Destination</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Grid Layout Dimension</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...lookbook]
                    .sort((a, b) => (a.serial || 0) - (b.serial || 0))
                    .map((l, idx, arr) => (
                      <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-black text-gray-900 text-sm">
                          <div className="flex items-center gap-2">
                            <span>#{l.serial || 0}</span>
                            <div className="flex flex-col gap-0.5">
                              {idx > 0 && (
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const prev = arr[idx - 1];
                                    updateLookbookImage({ ...l, serial: prev.serial });
                                    updateLookbookImage({ ...prev, serial: l.serial });
                                  }}
                                  className="text-[10px] bg-gray-100 hover:bg-black hover:text-white px-1.5 py-0.5 rounded font-bold transition-colors"
                                  title="Move Up"
                                >
                                  ▲
                                </button>
                              )}
                              {idx < arr.length - 1 && (
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const next = arr[idx + 1];
                                    updateLookbookImage({ ...l, serial: next.serial });
                                    updateLookbookImage({ ...next, serial: l.serial });
                                  }}
                                  className="text-[10px] bg-gray-100 hover:bg-black hover:text-white px-1.5 py-0.5 rounded font-bold transition-colors"
                                  title="Move Down"
                                >
                                  ▼
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-800">{l.title || <span className="text-gray-300 font-normal">None</span>}</td>
                        <td className="p-4">
                          {l.image && <img src={l.image} className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-200" alt="" />}
                        </td>
                        <td className="p-4 font-mono text-xs text-gray-600">{l.link || '/shop'}</td>
                        <td className="p-4 text-xs">
                          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-[11px] font-bold border border-gray-200">
                            {getLookbookPresetBadge(l.className)}
                          </span>
                          <span className="block text-[10px] font-mono text-gray-400 mt-0.5">{l.className || 'col-span-1 row-span-1'}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => {
                              setEditingLookbook(l);
                              setNewLookbook({
                                image: l.image,
                                link: l.link,
                                className: l.className || 'col-span-1 row-span-1',
                                widthPercent: l.widthPercent || '100%',
                                heightPercent: l.heightPercent || '100%',
                                serial: l.serial || 1,
                                title: l.title || ''
                              });
                              setIsAddingLookbook(true);
                            }} 
                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg inline-block mr-2 transition-colors"
                            title="Edit Item"
                          >
                            <Edit className="h-5 w-5"/>
                          </button>
                          <button onClick={async () => {
                            const result = await Swal.fire({
                              title: 'Are you sure?',
                              text: "Delete this lookbook item?",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#000',
                              cancelButtonColor: '#d33',
                              confirmButtonText: 'Yes, delete it!'
                            });
                            if (result.isConfirmed) {
                              deleteLookbookImage(l.id);
                              Swal.fire('Deleted!', 'Lookbook item has been deleted.', 'success');
                            }
                          }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Item"><Trash2 className="h-5 w-5"/></button>
                        </td>
                      </tr>
                    ))}
                  {lookbook.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No lookbook items found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h1 className="text-2xl font-black uppercase">Subscribers</h1>
              <button 
                onClick={() => { setEmailTarget('all'); setEmailModalType('newsletter'); setIsSendingEmail(true); }}
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 tracking-widest text-[10px] font-bold uppercase transition-colors"
               >
                <Mail className="h-4 w-4"/> Send to All
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Email</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Date</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map(sub => (
                    <tr key={sub.id}>
                      <td className="p-4 font-medium">{sub.email}</td>
                      <td className="p-4 text-gray-500">{new Date(sub.date).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => { setEmailTarget(sub.email); setEmailModalType('newsletter'); setIsSendingEmail(true); }} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg inline-block mr-2" title="Send Email">
                          <Mail className="h-5 w-5"/>
                        </button>
                        <button onClick={async () => {
                          const result = await Swal.fire({
                            title: 'Are you sure?',
                            text: "Delete this subscriber?",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#000',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, delete it!'
                          });
                          if (result.isConfirmed) {
                            deleteSubscriber(sub.id);
                            Swal.fire('Deleted!', 'Subscriber has been removed.', 'success');
                          }
                        }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg" title="Delete Subscriber"><Trash2 className="h-5 w-5"/></button>
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-gray-500">No subscribers found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h1 className="text-2xl font-black uppercase">Contact Messages</h1>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Name & Email</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest max-w-xs">Message</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Date</th>
                     <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contactMessages.map(msg => (
                    <tr key={msg.id}>
                      <td className="p-4">
                        <div className="font-bold">{msg.name}</div>
                        <div className="text-xs text-gray-500">{msg.email}</div>
                      </td>
                      <td className="p-4 max-w-xs whitespace-pre-wrap">{msg.message}</td>
                      <td className="p-4 text-gray-500 text-xs">{formatDate(msg.date)} {formatTime(msg.date)}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => { setEmailTarget(msg.email); setEmailModalType('contact'); setIsSendingEmail(true); setEmailSubject(`Reply to your message: ${msg.name}`); }} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg inline-block mr-2" title="Reply via Email">
                          <Mail className="h-5 w-5"/>
                        </button>
                        <button onClick={async () => {
                          const result = await Swal.fire({
                            title: 'Are you sure?',
                            text: "Delete this message?",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#000',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, delete it!'
                          });
                          if (result.isConfirmed) {
                            deleteContactMessage(msg.id);
                            Swal.fire('Deleted!', 'Message has been deleted.', 'success');
                          }
                        }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg" title="Delete Message"><Trash2 className="h-5 w-5"/></button>
                      </td>
                    </tr>
                  ))}
                  {contactMessages.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No messages found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contactinfo' && <AdminContactInfoView />}

        {/* Settings Tab */}
        {activeTab === 'settings' && <AdminSettingsView />}
        {activeTab === 'socials' && <AdminSocialLinksView />}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && <AdminAnnouncementsView />}

        {/* Price Analysis Tab */}
        {activeTab === 'analysis' && <AdminPriceAnalysisView />}

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div>
            <div className="flex border-b border-gray-100 mb-6 gap-6">
              <button
                onClick={() => {
                  setAdsSubTab('home');
                  setIsAddingPopupAd(false);
                  setEditingPopupAd(null);
                }}
                className={`pb-3.5 font-black uppercase tracking-wider text-[11px] transition-all border-b-2 -mb-[2px] ${adsSubTab === 'home' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
              >
                Home Banner Ads
              </button>
              <button
                onClick={() => {
                  setAdsSubTab('popup');
                  setIsAddingHomeAd(false);
                  setEditingHomeAd(null);
                }}
                className={`pb-3.5 font-black uppercase tracking-wider text-[11px] transition-all border-b-2 -mb-[2px] ${adsSubTab === 'popup' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
              >
                Website Popup Ads
              </button>
            </div>

            {adsSubTab === 'home' ? (
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h1 className="text-2xl font-black uppercase">Home Section Ads</h1>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsAddingHomeAd(!isAddingHomeAd);
                        if (isAddingHomeAd) {
                          setEditingHomeAd(null);
                          setNewHomeAd({ title: '', subtitle: '', imageUrl: '', linkUrl: '', isActive: true });
                        }
                      }}
                      className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 tracking-widest text-[10px] font-bold uppercase transition-colors"
                    >
                      {isAddingHomeAd ? 'Cancel' : <><Plus className="h-4 w-4"/> Add Home Ad</>}
                    </button>
                  </div>
                </div>

                {isAddingHomeAd && (
                  <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6">
                    <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row gap-8 max-h-[82vh] overflow-y-auto">
                      <div className="w-full md:w-2/5 flex flex-col gap-4">
                        <div className="aspect-[16/9] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                          {newHomeAd.imageUrl ? (
                            <img src={newHomeAd.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Image className="h-12 w-12 opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ad Image Preview</span>
                        </div>
                      </div>

                      <form onSubmit={handleAddHomeAd} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                        <div className="md:col-span-2 flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                          <div>
                            <h3 className="font-black uppercase text-xl text-gray-900">{editingHomeAd ? 'Edit' : 'Add'} Home Section Ad</h3>
                          </div>
                          <button type="button" onClick={() => setIsAddingHomeAd(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors self-start -mt-2 -mr-2">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Ad Image</label>
                          <div className="flex gap-2">
                            <input required className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newHomeAd.imageUrl} onChange={e=>setNewHomeAd({...newHomeAd, imageUrl: e.target.value})} placeholder="URL or Base64" />
                            <label className="cursor-pointer bg-black text-white px-4 rounded-xl flex items-center hover:bg-gray-800 transition-colors">
                              <Camera className="h-4 w-4" />
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, (url) => setNewHomeAd({...newHomeAd, imageUrl: url}))} />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Title (Optional)</label>
                          <input className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newHomeAd.title} onChange={e=>setNewHomeAd({...newHomeAd, title: e.target.value})} placeholder="যেমন- Flat 15% Discount on basic tees" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Sub-Title (Optional)</label>
                          <input className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newHomeAd.subtitle} onChange={e=>setNewHomeAd({...newHomeAd, subtitle: e.target.value})} placeholder="যেমন- Use coupon SUM15 at checkout" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Auto Category / Sub-Category Link</label>
                            <select 
                              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                              onChange={e => {
                                if (e.target.value) {
                                  setNewHomeAd({...newHomeAd, linkUrl: e.target.value});
                                }
                              }}
                            >
                              <option key="homead-cat" value="">-- Choose Category / Sub-Category --</option>
                              {adminCategories.filter(c => c !== 'all').flatMap(cat => {
                                const subs = getSubCategoriesFor(cat);
                                return [
                                  <option key={cat} value={`/shop?category=${encodeURIComponent(cat)}`}>{cat}</option>,
                                  ...subs.map(sub => (
                                    <option key={`${cat}-${sub}`} value={`/shop?category=${encodeURIComponent(cat)}&subCategory=${encodeURIComponent(sub)}`}>
                                      &nbsp;&nbsp;↳ {cat} › {sub}
                                    </option>
                                  ))
                                ];
                              })}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Destination URL / Link (Optional)</label>
                            <input className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newHomeAd.linkUrl} onChange={e=>setNewHomeAd({...newHomeAd, linkUrl: e.target.value})} placeholder="যেমন- /shop বা /shop?category=tees" />
                          </div>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                          <input type="checkbox" id="home-ad-active" checked={newHomeAd.isActive} onChange={e=>setNewHomeAd({...newHomeAd, isActive: e.target.checked})} className="w-4 h-4 text-black focus:ring-black" />
                          <label htmlFor="ad-active" className="text-xs font-bold uppercase tracking-widest text-gray-900 cursor-pointer select-none">Active</label>
                        </div>
                        <div className="md:col-span-2 flex gap-3 justify-end pt-2 mt-auto">
                          <button type="button" onClick={() => setIsAddingHomeAd(false)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                          <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform">Save Home Ad</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                         <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Ad Image</th>
                         <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Title & Description</th>
                         <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Link</th>
                         <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Status</th>
                         <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {homeAds.map(ad => (
                        <tr key={ad.id}>
                          <td className="p-4">
                            {ad.imageUrl && <img src={ad.imageUrl} className="w-24 h-14 rounded object-cover border border-gray-200" alt="" />}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{ad.title || <span className="text-gray-400 font-normal italic">No Title</span>}</div>
                            <div className="text-xs text-gray-500 font-medium">{ad.subtitle}</div>
                          </td>
                          <td className="p-4 font-mono text-xs">{ad.linkUrl}</td>
                          <td className="p-4">{ad.isActive ? <span className="text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-full text-xs">Active</span> : <span className="text-gray-400 font-bold bg-gray-50 px-2.5 py-1 rounded-full text-xs">Inactive</span>}</td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => {
                                setEditingHomeAd(ad);
                                setNewHomeAd({
                                  title: ad.title || '',
                                  subtitle: ad.subtitle || '',
                                  imageUrl: ad.imageUrl,
                                  linkUrl: ad.linkUrl,
                                  isActive: ad.isActive
                                });
                                setIsAddingHomeAd(true);
                              }} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit className="h-5 w-5"/></button>
                              <button onClick={async () => {
                                const result = await Swal.fire({
                                  title: 'Are you sure?',
                                  text: "Delete this ad?",
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#000',
                                  cancelButtonColor: '#d33',
                                  confirmButtonText: 'Yes, delete it!'
                                });
                                if (result.isConfirmed) {
                                  deleteHomeAd(ad.id);
                                  Swal.fire('Deleted!', 'Ad has been deleted.', 'success');
                                }
                              }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="h-5 w-5"/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {homeAds.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No home ads found. Add some to display on home page section!</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h1 className="text-2xl font-black uppercase">Popup Ads</h1>
                  <button 
                    onClick={() => {
                      setIsAddingPopupAd(!isAddingPopupAd);
                      if (isAddingPopupAd) {
                        setEditingPopupAd(null);
                        setNewPopupAd({ imageUrl: '', linkUrl: '', isActive: true, pagesString: 'all' });
                      }
                    }}
                    className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 tracking-widest text-[10px] font-bold uppercase transition-colors"
                   >
                    {isAddingPopupAd ? 'Cancel' : <><Plus className="h-4 w-4"/> Add Popup Ad</>}
                  </button>
                </div>

                {isAddingPopupAd && (
                  <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6">
                    <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row gap-8 max-h-[82vh] overflow-y-auto">
                      <div className="w-full md:w-2/5 flex flex-col gap-4">
                        <div className="aspect-[4/5] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                          {newPopupAd.imageUrl ? (
                            <img src={newPopupAd.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Image className="h-12 w-12 opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Image Preview</span>
                        </div>
                      </div>

                      <form onSubmit={handleAddPopupAd} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                         <div className="md:col-span-2 flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                          <div>
                            <h3 className="font-black uppercase text-xl text-gray-900">{editingPopupAd ? 'Edit' : 'Add'} Popup Ad</h3>
                          </div>
                          <button type="button" onClick={() => setIsAddingPopupAd(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors self-start -mt-2 -mr-2">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Popup Ad Image</label>
                      <div className="flex gap-2">
                        <input required className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newPopupAd.imageUrl} onChange={e=>setNewPopupAd({...newPopupAd, imageUrl: e.target.value})} placeholder="URL or Base64" />
                        <label className="cursor-pointer bg-black text-white px-4 rounded-xl flex items-center hover:bg-gray-800 transition-colors">
                          <Camera className="h-4 w-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files?.[0] || null, (url) => setNewPopupAd({...newPopupAd, imageUrl: url}))} />
                        </label>
                      </div>
                    </div>
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Link URL (Optional)</label><input className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newPopupAd.linkUrl} onChange={e=>setNewPopupAd({...newPopupAd, linkUrl: e.target.value})} placeholder="e.g. /shop" /></div>
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Target Pages (Comma separated, or 'all')</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newPopupAd.pagesString} onChange={e=>setNewPopupAd({...newPopupAd, pagesString: e.target.value})} placeholder="e.g. /, /shop, /contact" /></div>
                        <div className="md:col-span-2 flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                          <input type="checkbox" id="ad-active" checked={newPopupAd.isActive} onChange={e=>setNewPopupAd({...newPopupAd, isActive: e.target.checked})} className="w-4 h-4 text-black focus:ring-black" />
                          <label htmlFor="ad-active" className="text-xs font-bold uppercase tracking-widest text-gray-900 cursor-pointer select-none">Active</label>
                        </div>
                        <div className="md:col-span-2 flex gap-3 justify-end pt-2 mt-auto">
                          <button type="button" onClick={() => setIsAddingPopupAd(false)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                          <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform">Save Popup Ad</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                         <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Image</th>
                         <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Pages</th>
                         <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Status</th>
                         <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {popupAds.map(ad => (
                        <tr key={ad.id}>
                          <td className="p-4">
                            {ad.imageUrl && <img src={ad.imageUrl} className="w-16 h-16 rounded object-cover border border-gray-200" alt="" />}
                          </td>
                          <td className="p-4 font-mono text-xs">{ad.pages.join(', ')}</td>
                          <td className="p-4">{ad.isActive ? <span className="text-green-600 font-bold">Active</span> : <span className="text-red-500 font-bold">Inactive</span>}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => {
                              setEditingPopupAd(ad);
                              setNewPopupAd({
                                imageUrl: ad.imageUrl,
                                linkUrl: ad.linkUrl || '',
                                isActive: ad.isActive,
                                pagesString: ad.pages.join(', ')
                              });
                              setIsAddingPopupAd(true);
                            }} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg mr-2"><Edit className="h-5 w-5"/></button>
                            <button onClick={async () => {
                              const result = await Swal.fire({
                                title: 'Are you sure?',
                                text: "Delete this ad?",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#000',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, delete it!'
                              });
                              if (result.isConfirmed) {
                                deletePopupAd(ad.id);
                                Swal.fire('Deleted!', 'Ad has been deleted.', 'success');
                              }
                            }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="h-5 w-5"/></button>
                          </td>
                        </tr>
                      ))}
                      {popupAds.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No popup ads found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'faqs' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h1 className="text-2xl font-black uppercase">Manage FAQs</h1>
              <button 
                onClick={() => { setIsAddingFAQ(!isAddingFAQ); setEditingFAQ(null); setNewFAQ({ question: '', answer: '' }); }}
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 tracking-widest text-[10px] font-bold uppercase transition-colors"
              >
                {isAddingFAQ ? 'Cancel' : <><Plus className="h-4 w-4"/> Add FAQ</>}
              </button>
            </div>

            {isAddingFAQ && (
              <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[82vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-black uppercase text-xl text-gray-900">{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Provide the QA details below</p>
                    </div>
                    <button type="button" onClick={() => setIsAddingFAQ(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAddFAQ} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Question</label>
                      <input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newFAQ.question} onChange={e=>setNewFAQ({...newFAQ, question: e.target.value})} placeholder="e.g., How long is delivery?" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Answer</label>
                      <textarea required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors h-32 resize-none" value={newFAQ.answer} onChange={e=>setNewFAQ({...newFAQ, answer: e.target.value})} placeholder="e.g., Delivery inside Dhaka takes 2-3 days..." />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button type="button" onClick={() => setIsAddingFAQ(false)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                      <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform">Save FAQ</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Question</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest">Answer</th>
                    <th className="p-4 font-bold uppercase text-[10px] text-gray-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {faqs?.map(faq => (
                    <tr key={faq.id}>
                      <td className="p-4 font-bold text-gray-900 max-w-xs">{faq.question}</td>
                      <td className="p-4 text-gray-500 max-w-sm">{faq.answer}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => {
                          setEditingFAQ(faq);
                          setNewFAQ({ question: faq.question, answer: faq.answer });
                          setIsAddingFAQ(true);
                        }} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg mr-2"><Edit className="h-5 w-5"/></button>
                        <button onClick={() => {
                          Swal.fire({
                            title: 'Are you sure?',
                            text: 'This will delete this FAQ questions item permanently!',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Yes, delete it!'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              deleteFAQ(faq.id);
                              Swal.fire('Deleted!', 'FAQ item has been deleted.', 'success');
                            }
                          });
                        }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="h-5 w-5"/></button>
                      </td>
                    </tr>
                  ))}
                  {(!faqs || faqs.length === 0) && <tr><td colSpan={3} className="p-6 text-center text-gray-500">No FAQ entries found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-2xl font-black uppercase">Policies</h1>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Update Support Content & Legal Disclosures</span>
              </div>
              {(!policies?.some(p => p.key === 'shipping_returns') || !policies?.some(p => p.key === 'privacy_policy')) && (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditingPolicy(null);
                    const hasShipping = policies?.some(p => p.key === 'shipping_returns');
                    setNewPolicy({ key: hasShipping ? 'privacy_policy' : 'shipping_returns', title: '', content: '' });
                    setIsAddingPolicy(true);
                  }} 
                  className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-black/10 transition-all hover:shadow-black/20"
                >
                  <Plus className="h-4 w-4" /> Add Policy
                </motion.button>
              )}
            </div>

            {isAddingPolicy && (
              <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[82vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-black uppercase text-xl text-gray-900">{editingPolicy ? 'Edit Policy' : 'Create New Policy'}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configure parameters below</p>
                    </div>
                    <button type="button" onClick={() => setIsAddingPolicy(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAddPolicy} className="space-y-4">
                    {!editingPolicy && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Policy ID Key</label>
                        <select required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newPolicy.key} onChange={e=>setNewPolicy({...newPolicy, key: e.target.value})}>
                          {!policies?.some(p => p.key === 'shipping_returns') && <option key="shipping_returns" value="shipping_returns">Shipping & Returns</option>}
                          {!policies?.some(p => p.key === 'privacy_policy') && <option key="privacy_policy" value="privacy_policy">Privacy Policy</option>}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Policy Title</label>
                      <input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newPolicy.title} onChange={e=>setNewPolicy({...newPolicy, title: e.target.value})} placeholder="e.g., Shipping Charges and Rules" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Content (Support Markdown)</label>
                      <textarea required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors h-64 resize-none font-mono text-xs" value={newPolicy.content} onChange={e=>setNewPolicy({...newPolicy, content: e.target.value})} placeholder="Write detailed instructions..." />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button type="button" onClick={() => setIsAddingPolicy(false)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                      <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform">Save Policy</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies?.map(policy => (
                <div key={policy.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="p-1 px-2 text-[8px] font-bold uppercase tracking-widest bg-black text-white rounded">{policy.key}</span>
                    </div>
                    <h3 className="font-extrabold uppercase text-lg text-gray-900 mb-4">{policy.title}</h3>
                    <p className="text-xs text-gray-500 whitespace-pre-line line-clamp-6 mb-4">{policy.content}</p>
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-4 border-gray-100 mt-2">
                    <button 
                      onClick={() => {
                        setEditingPolicy(policy);
                        setNewPolicy({ key: policy.key, title: policy.title, content: policy.content });
                        setIsAddingPolicy(true);
                      }}
                      className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold bg-gray-50 hover:bg-gray-100 border text-gray-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4"/> Edit Content
                    </button>
                    <button 
                      onClick={() => {
                        let willDeleteFixed = false;
                        if (policy.key === 'shipping_returns' || policy.key === 'privacy_policy') {
                          willDeleteFixed = true;
                        }
                        Swal.fire({
                          title: 'Are you sure?',
                          text: willDeleteFixed ? 'This will delete a system policy content permanently!' : 'This will delete this policy content permanently!',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#d33',
                          cancelButtonColor: '#3085d6',
                          confirmButtonText: 'Yes, delete it!'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            deletePolicy(policy.id);
                            Swal.fire('Deleted!', 'Policy has been deleted.', 'success');
                          }
                        });
                      }}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OTP List Tab */}
        {activeTab === 'otps' && (currentAdmin?.role === 'super' || currentAdmin?.permissions?.otps) && (
          <AdminOTPView />
        )}

        {/* Admins Tab (SUPER ADMIN ONLY) */}
        {activeTab === 'admins' && currentAdmin?.role === 'super' && (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-2xl font-black uppercase text-gray-900">Manage Staff Admins</h1>
                <p className="text-xs text-amber-600 font-extrabold uppercase tracking-wide mt-1">👑 Super Admin Control Panel</p>
              </div>
              <button
                onClick={() => {
                  setEditingAdmin(null);
                  setNewAdminEmail('');
                  setNewAdminPassword('');
                  setNewAdminPermissions({
                    dashboard: true,
                    products: true,
                    orders: true,
                    coupons: true,
                    slides: true,
                    categoryBanners: true,
                    categories: true,
                    lookbook: true,
                    subscribers: true,
                    messages: true,
                    ads: true,
                    faqs: true,
                    policies: true,
                    reviews: true,
                    otps: true,
                    otpsDelete: true,
                    notifications: true
                  });
                  setIsAddingAdmin(true);
                }}
                className="bg-black hover:bg-black/90 text-white flex items-center gap-2 px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform"
              >
                <Plus className="h-4 w-4" /> Add New Admin (নতুন এডমিন যুক্ত করুন)
              </button>
            </div>

            {/* Admin Add / Edit Modal Overlay */}
            {isAddingAdmin && (
              <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6 animate-fadeIn">
                <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[82vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-black uppercase text-xl text-gray-900">
                    {editingAdmin ? 'Edit Admin & Permissions' : 'Create New Office Admin'}
                  </h3>
                </div>
                    <button type="button" onClick={() => setIsAddingAdmin(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      
                      // validate email
                      if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
                        Swal.fire('Error', 'অনুগ্রহ করে সঠিক মেইল এড্রেস দিন', 'error');
                        return;
                      }
                      
                      if (!editingAdmin && !newAdminPassword) {
                        Swal.fire('Error', 'অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন', 'error');
                        return;
                      }

                      if (editingAdmin) {
                        // edit
                        const adminUpdates: any = {
                          ...editingAdmin,
                          email: newAdminEmail.trim().toLowerCase(),
                          permissions: newAdminPermissions
                        };
                        if (newAdminPassword) {
                          adminUpdates.password = newAdminPassword;
                        } else {
                          // Ensure we don't accidentally send an empty string password
                          delete adminUpdates.password;
                        }
                        updateAdmin(adminUpdates);
                        Swal.fire('সফল হয়েছে!', 'এডমিন একাউন্ট আপডেট করা হয়েছে', 'success');
                      } else {
                        // duplicate check
                        const duplicate = admins.find(a => a.email.toLowerCase() === newAdminEmail.trim().toLowerCase());
                        if (duplicate) {
                          Swal.fire('ভুল হয়েছে', 'এই ইমেইল দিয়ে অলরেডি আর একটি এডমিন একাউন্ট আছে', 'error');
                          return;
                        }
                        // create
                        addAdmin({
                          id: 'admin_' + Date.now(),
                          email: newAdminEmail.trim().toLowerCase(),
                          password: newAdminPassword,
                          role: 'admin',
                          permissions: newAdminPermissions
                        });
                        Swal.fire('যুক্ত হয়েছে!', 'নতুন এডমিন একাউন্ট সফলভাবে তৈরি হয়েছে', 'success');
                      }
                      setIsAddingAdmin(false);
                    }} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                        <input 
                          type="email"
                          required 
                          placeholder="manager@tbari.com"
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" 
                          value={newAdminEmail} 
                          onChange={e=>setNewAdminEmail(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Password {editingAdmin && '(Leave blank to keep current)'}
                        </label>
                        <input 
                          type="password" 
                          required={!editingAdmin}
                          placeholder={editingAdmin ? "••••••••" : "Min 6 characters"}
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" 
                          value={newAdminPassword} 
                          onChange={e=>setNewAdminPassword(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="border-t border-gray-100 pt-4 mb-3">
                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-800 mb-1">
                          Role Permissions (সেকশন ভিত্তিক এক্সেসসমূহ)
                        </label>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          অনুমতি দেওয়া ট্যাবগুলোই শুধুমাত্র এই এডমিন তার একাউন্টে দেখতে পারবে
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {/* dashboard permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.dashboard} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, dashboard: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Dashboard</span>
                          </div>
                        </label>

                        {/* products permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.products} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, products: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Products</span>
                          </div>
                        </label>

                        {/* slides permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.slides} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, slides: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Slides</span>
                          </div>
                        </label>

                        {/* categories permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.categories} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, categories: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Categories</span>
                          </div>
                        </label>

                        {/* categoryBanners permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.categoryBanners} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, categoryBanners: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Category Banners</span>
                          </div>
                        </label>

                        {/* lookbook permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.lookbook} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, lookbook: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Lookbook</span>
                          </div>
                        </label>

                        {/* orders permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.orders} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, orders: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Orders</span>
                          </div>
                        </label>

                        {/* coupons permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.coupons} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, coupons: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Coupons</span>
                          </div>
                        </label>

                        {/* subscribers permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.subscribers} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, subscribers: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Subscribers</span>
                          </div>
                        </label>

                        {/* messages permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.messages} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, messages: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Messages</span>
                          </div>
                        </label>

                        {/* ads permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.ads} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, ads: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Ads</span>
                          </div>
                        </label>

                        {/* faqs permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.faqs} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, faqs: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">FAQs</span>
                          </div>
                        </label>

                        {/* policies permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.policies} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, policies: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Policies</span>
                          </div>
                        </label>

                        {/* otps permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.otps || false} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, otps: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">OTPS</span>
                          </div>
                        </label>

                        {/* reviews permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.reviews || false} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, reviews: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Reviews</span>
                          </div>
                        </label>

                        {/* notifications permissions */}
                        <label className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 hover:border-black cursor-pointer transition-all select-none">
                          <input 
                            type="checkbox" 
                            checked={newAdminPermissions.notifications || false} 
                            onChange={e => setNewAdminPermissions({...newAdminPermissions, notifications: e.target.checked})}
                            className="rounded border-gray-300 text-black focus:ring-black h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-gray-800 block">Notifications Center</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-3 border-t">
                      <button type="button" onClick={() => setIsAddingAdmin(false)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                      <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform">
                        {editingAdmin ? 'Update Credentials' : 'Create Admin Account'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Admin list table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Email</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Password</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Role Rank</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Active Permissions</th>
                      <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {admins?.filter(a => a.isActive !== false).map(admin => {
                      const enabledCount = Object.values(admin.permissions || {}).filter(Boolean).length;
                      
                      return (
                        <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-extrabold text-sm text-gray-900 block">{admin.email}</span>
                            {admin.id === currentAdmin?.id && (
                              <span className="text-[10px] text-amber-600 font-bold block">(You are logged in as this user)</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-mono text-xs text-gray-400 select-none bg-gray-50 px-2 py-1 rounded border border-gray-100">
                              ••••••••
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {admin.role === 'super' ? (
                              <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-200">
                                👑 Super Master Admin
                              </span>
                            ) : (
                              <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-blue-200">
                                💼 Standard Office Admin
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 max-w-xs">
                            {admin.role === 'super' ? (
                              <span className="text-xs text-amber-600 font-extrabold flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Full System Control
                              </span>
                            ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {Object.keys(admin.permissions || {}).map(key => {
                                  const isActive = admin.permissions[key as keyof typeof admin.permissions];
                                  if (!isActive) return null;
                                  
                                  const labelMap: Record<string, string> = {
                                    dashboard: 'Dashboard',
                                    products: 'Products',
                                    orders: 'Orders',
                                    coupons: 'Coupons',
                                    slides: 'Slides',
                                    categories: 'Categories',
                                    lookbook: 'Lookbook',
                                    subscribers: 'Subscribers',
                                    messages: 'Messages',
                                    ads: 'Ads',
                                    faqs: 'FAQs',
                                    policies: 'Policies',
                                    otps: 'OTP Secrets Tracker',
                                    reviews: 'Manage Reviews'
                                  };
                                  
                                  return (
                                    <span key={key} className="text-[7.5px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
                                      {labelMap[key] || key}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {admin.role === 'super' ? (
                              <span className="text-gray-400 text-xs italic">Super Admin</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingAdmin(admin);
                                    setNewAdminEmail(admin.email);
                                    setNewAdminPassword(''); // Don't show password
                                    setNewAdminPermissions({
                                      dashboard: false,
                                      products: false,
                                      orders: false,
                                      coupons: false,
                                      slides: false,
                                      categoryBanners: false,
                                      categories: false,
                                      lookbook: false,
                                      subscribers: false,
                                      messages: false,
                                      ads: false,
                                      faqs: false,
                                      policies: false,
                                      otps: false,
                                      otpsDelete: false,
                                      reviews: false,
                                      notifications: false,
                                      ...admin.permissions
                                    });
                                    setIsAddingAdmin(true);
                                  }}
                                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-black bg-gray-50 border text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <Edit className="h-3.5 w-3.5" /> Modify Account
                                </button>
                                <button
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Are you sure?',
                                      text: `ইমেইলটি ডিলিট করতে চান? ${admin.email}. This will revoke all their access instantly!`,
                                      icon: 'warning',
                                      showCancelButton: true,
                                      confirmButtonColor: '#d33',
                                      cancelButtonColor: '#3085d6',
                                      confirmButtonText: 'Yes, delete staff admin account!'
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        deleteAdmin(admin.id);
                                        Swal.fire('ডিলিট হয়েছে!', 'এডমিন একাউন্ট ডিলিট করা হয়েছে।', 'success');
                                      }
                                    });
                                  }}
                                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                  title="Delete Admin Profile"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>

        {isSendingEmail && (
          <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-16 md:pt-20 pb-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row gap-8 max-h-[82vh] overflow-y-auto">
              
              <div className="w-full md:w-2/5 flex flex-col gap-4">
                <div className="aspect-[4/5] rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex flex-col p-4">
                  {emailModalType === 'newsletter' && (
                    newsletterImage ? (
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-4 shrink-0">
                         <img src={newsletterImage} alt="Newsletter Banner" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-40 rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 mb-4 shrink-0">
                        <Image className="h-8 w-8 opacity-50 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Banner</span>
                      </div>
                    )
                  )}
                  
                  <div className="flex-1 overflow-hidden pointer-events-none mt-2">
                     <h4 className="font-bold text-lg mb-2 line-clamp-2 text-black leading-tight">{emailSubject || 'Your Subject'}</h4>
                     <p className="text-xs text-gray-500 whitespace-pre-wrap line-clamp-6">{emailBody || 'Your email content will appear here...'}</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{emailModalType === 'newsletter' ? 'Newsletter Preview' : 'Email Preview'}</span>
                </div>
              </div>

              <form onSubmit={handleSendEmail} className="flex-1 grid grid-cols-1 gap-4 content-start">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-black uppercase text-xl text-gray-900">{emailModalType === 'newsletter' ? 'Send Newsletter' : 'Reply to Message'}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">To: {emailTarget === 'all' ? 'All Subscribers' : emailTarget}</p>
                  </div>
                  <button type="button" onClick={() => setIsSendingEmail(false)} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors self-start -mt-2 -mr-2">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Subject Title</label><input required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} placeholder="Subject..." /></div>
                {emailModalType === 'newsletter' && (
                  <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Banner Image URL (Optional)</label><input className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={newsletterImage} onChange={e=>setNewsletterImage(e.target.value)} placeholder="https://..." /></div>
                )}
                <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Message Body</label><textarea required className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-black focus:outline-none bg-gray-50 focus:bg-white transition-colors h-48 resize-none" value={emailBody} onChange={e=>setEmailBody(e.target.value)} placeholder="Write your message here..." /></div>
                <div className="flex gap-3 justify-end pt-2 mt-auto">
                  <button type="button" onClick={() => setIsSendingEmail(false)} className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors text-gray-600">Cancel</button>
                  <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95 transition-transform flex items-center gap-2"><Mail className="h-4 w-4"/> Dispatch</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
