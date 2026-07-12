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
import ESGAssistant, { ESGAssistantContext } from './ESGAssistant';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTabs: Record<string, string>;
  setSubTab: (tabId: string, subTabId: string) => void;
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  profiles: Profile[];
  assistantContext: ESGAssistantContext;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  activeSubTabs,
  setSubTab,
  activeProfile,
  setActiveProfile,
  profiles,
  assistantContext,
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
    { 
      id: 'environmental', 
      name: 'Environmental', 
      icon: Globe2,
      subItems: [
        { id: 'factors', name: 'Emission Factors' },
        { id: 'products', name: 'Product ESG Profiles' },
        { id: 'transactions', name: 'Carbon Transactions' },
        { id: 'goals', name: 'Environmental Goals' }
      ]
    },
    {
      id: 'social',
      name: 'Social',
      icon: HeartHandshake,
      subItems: [
        { id: 'activities', name: 'CSR Activities' },
        { id: 'participation', name: 'Employee Participation' },
        { id: 'diversity', name: 'Diversity Dashboard' }
      ]
    },
    {
      id: 'governance',
      name: 'Governance',
      icon: ShieldCheck,
      subItems: [
        { id: 'policies', name: 'Policies' },
        { id: 'acknowledgements', name: 'Policy Acknowledgements' },
        { id: 'audits', name: 'Audits' },
        { id: 'violations', name: 'Compliance Issues' }
      ]
    },
    {
      id: 'gamification',
      name: 'Gamification',
      icon: Trophy,
      subItems: [
        { id: 'challenges', name: 'Challenges' },
        { id: 'participation', name: 'Challenge Participation' },
        { id: 'badges', name: 'Badges' },
        { id: 'rewards', name: 'Rewards' },
        { id: 'leaderboard', name: 'Leaderboard' }
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: FilePieChart,
      subItems: [
        { id: 'environmental', name: 'Environmental Report' },
        { id: 'social', name: 'Social Report' },
        { id: 'governance', name: 'Governance Report' },
        { id: 'summary', name: 'ESG Summary' },
        { id: 'custom', name: 'Custom Report Builder' }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Sliders,
      subItems: [
        { id: 'departments', name: 'Departments' },
        { id: 'categories', name: 'Categories' },
        { id: 'config', name: 'ESG Configuration' },
        { id: 'notifications', name: 'Notification Settings' }
      ]
    }
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
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden" id="notifications_dropdown">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Inbox Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[10px] text-indigo-650 hover:underline font-bold cursor-pointer">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-slate-400 text-xs italic">No alerts dispatched.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 text-xs transition hover:bg-slate-50/50 ${!n.is_read ? 'bg-indigo-50/15' : ''}`}>
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-semibold text-slate-700 leading-normal">{n.message}</p>
                          {!n.is_read && (
                            <button onClick={() => handleMarkAsRead(n.id)} className="text-slate-450 hover:text-emerald-600 p-0.5" title="Mark Read">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono block mt-1">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Profile Dropdown Switcher */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <select
              value={activeProfile?.id || ''}
              onChange={(e) => {
                const found = profiles.find(p => p.id === e.target.value);
                if (found) {
                  setActiveProfile(found);
                  triggerRefresh();
                }
              }}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl p-1.5 font-bold text-slate-800 cursor-pointer focus:outline-none"
              id="active_profile_select"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
              ))}
            </select>
          </div>

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

          <div className="py-4 space-y-1.5 px-3 max-h-[80vh] overflow-y-auto" id="sidebar_links_container">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 border border-slate-200/50'
                        : 'hover:bg-slate-50 hover:text-slate-800 text-slate-500'
                    }`}
                    id={`nav_tab_${item.id}`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-slate-800' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </button>

                  {isActive && item.subItems && (
                    <div className="pl-7 space-y-1 border-l border-slate-150 ml-5 my-1 animate-fade-in">
                      {item.subItems.map((sub) => {
                        const isSubActive = isActive && activeSubTabs[item.id] === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setSubTab(item.id, sub.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] transition-all cursor-pointer ${
                              isSubActive
                                ? 'text-slate-900 font-bold bg-slate-100/60'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                            id={`nav_sub_${item.id}_${sub.id}`}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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
      <ESGAssistant context={assistantContext} />
    </div>
  );
}
