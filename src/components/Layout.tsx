/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  LayoutDashboard, 
  Building2, 
  Globe2, 
  HeartHandshake, 
  ShieldCheck, 
  Trophy, 
  FilePieChart, 
  Sliders, 
  Bell, 
  User, 
  LogOut, 
  X, 
  Check, 
  Menu
} from 'lucide-react';
import { api } from '../lib/supabase';
import { Profile, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  profiles: Profile[];
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  activeProfile,
  setActiveProfile,
  profiles,
  refreshTrigger,
  triggerRefresh
}: LayoutProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (activeProfile) {
      api.getNotifications(activeProfile.id).then(setNotifications);
    }
  }, [activeProfile, refreshTrigger]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    triggerRefresh();
  };

  const handleMarkAllRead = async () => {
    if (activeProfile) {
      await api.markAllNotificationsRead(activeProfile.id);
      triggerRefresh();
    }
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'departments', name: 'Departments', icon: Building2 },
    { id: 'environmental', name: 'Environmental', icon: Globe2 },
    { id: 'social', name: 'Social & CSR', icon: HeartHandshake },
    { id: 'governance', name: 'Governance', icon: ShieldCheck },
    { id: 'gamification', name: 'Gamification', icon: Trophy },
    { id: 'reports', name: 'Reports', icon: FilePieChart },
    { id: 'settings', name: 'Settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app_root">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 shadow-sm flex items-center justify-between" id="app_header">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
            id="mobile_menu_btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xl tracking-tight" id="logo_container">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center flex-shrink-0 shadow-sm">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <span>EcoSphere <span className="text-slate-400 font-normal text-xs hidden sm:inline">| Compliance &amp; Analytics</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Active Profile switcher drop-down (crucial for local testing of multiple roles) */}
          <div className="flex items-center gap-2" id="profile_switcher_container">
            <span className="text-xs text-slate-500 font-medium hidden md:inline">Test Role Active:</span>
            <select
              value={activeProfile?.id || ''}
              onChange={(e) => {
                const found = profiles.find(p => p.id === e.target.value);
                if (found) setActiveProfile(found);
              }}
              className="bg-slate-100 border-0 text-slate-700 text-xs rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 font-medium"
              id="active_profile_select"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Points / XP Quick Badge for Gamification */}
          {activeProfile && (
            <div className="hidden sm:flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1" id="points_pill">
              <span className="text-xs text-emerald-800 font-semibold">{activeProfile.xp} XP</span>
              <span className="text-xs text-amber-700 font-semibold border-l border-emerald-200 pl-2">{activeProfile.points} Points</span>
            </div>
          )}

          {/* Notifications Trigger */}
          <div className="relative" id="notifications_bell_container">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-full transition relative"
              id="notifications_bell_btn"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse" id="unread_notif_count">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in" id="notifications_drawer">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <span className="font-semibold text-slate-800 text-sm">Notifications ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      id="mark_all_read_btn"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100" id="notifications_list">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">No notifications.</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 text-xs transition duration-150 ${n.is_read ? 'bg-white text-slate-600' : 'bg-emerald-50/40 text-slate-800 font-medium'}`}
                        id={`notif_item_${n.id}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide font-semibold ${
                            n.type === 'Alert' ? 'bg-rose-100 text-rose-700' : 
                            n.type === 'Warning' ? 'bg-amber-100 text-amber-700' : 
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {n.type}
                          </span>
                          {!n.is_read && (
                            <button 
                              onClick={() => handleMarkAsRead(n.id)} 
                              className="text-slate-400 hover:text-emerald-600 p-0.5"
                              id={`mark_read_btn_${n.id}`}
                              title="Mark as Read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 font-semibold text-slate-800">{n.title}</p>
                        <p className="mt-0.5 text-slate-500 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 block mt-1.5">
                          {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Details */}
          {activeProfile && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4" id="header_profile_pill">
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
                id="header_user_avatar"
              />
              <div className="hidden lg:block text-left" id="header_user_info">
                <p className="text-xs font-semibold text-slate-800 leading-none">{activeProfile.name}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">{activeProfile.role}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1" id="main_layout_body">
        {/* Sidebar Left Navigation */}
        <nav className={`bg-white text-slate-700 w-64 flex-shrink-0 border-r border-slate-200 md:block relative ${mobileMenuOpen ? 'block fixed inset-y-0 left-0 z-50' : 'hidden'}`} id="sidebar_nav">
          <div className="p-4 md:hidden flex justify-between items-center border-b border-slate-200 bg-slate-50">
            <span className="text-slate-800 font-bold text-sm">Menu Navigation</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 hover:text-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Badge in Sidebar for Mobile */}
          <div className="p-4 border-b border-slate-150 bg-slate-50/50 flex items-center gap-3">
            <img src={activeProfile?.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">{activeProfile?.name}</p>
              <span className="inline-block bg-slate-100 text-emerald-700 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded mt-1">{activeProfile?.role}</span>
            </div>
          </div>

          <div className="py-4 space-y-1 px-3">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 text-emerald-600 border border-slate-200/50 font-semibold'
                      : 'hover:bg-slate-50 hover:text-slate-800 text-slate-500'
                  }`}
                  id={`nav_tab_${item.id}`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            <p className="font-semibold text-slate-600">EcoSphere ESG Engine</p>
            <p className="mt-0.5">Version 1.0.0 (Stable)</p>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50" id="main_content_container">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto" id="view_stage">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
