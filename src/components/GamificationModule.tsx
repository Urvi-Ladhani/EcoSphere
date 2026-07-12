/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Flame, 
  Coins, 
  ShoppingBag, 
  Check, 
  Plus, 
  Trash2, 
  User, 
  Sparkles,
  ShoppingBag as StoreIcon,
  Tag
} from 'lucide-react';
import { Badge, RewardItem, Profile } from '../types';
import { api } from '../lib/supabase';

interface GamificationModuleProps {
  dbState: {
    badges: Badge[];
    rewardItems: RewardItem[];
    profiles: Profile[];
  };
  activeProfile: Profile | null;
  triggerRefresh: () => void;
}

type SubTab = 'leaderboard' | 'badges' | 'rewards';

export default function GamificationModule({
  dbState,
  activeProfile,
  triggerRefresh
}: GamificationModuleProps) {
  const { badges, rewardItems, profiles } = dbState;
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('leaderboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isManagement = activeProfile?.role === 'Admin' || activeProfile?.role === 'Manager';

  // --- Reward Item Form State ---
  const [rewTitle, setRewTitle] = useState('');
  const [rewDesc, setRewDesc] = useState('');
  const [rewPoints, setRewPoints] = useState(500);
  const [rewStock, setRewStock] = useState(10);

  // --- Badge Form State ---
  const [badgeName, setBadgeName] = useState('');
  const [badgeDesc, setBadgeDesc] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('Award');
  const [badgeXp, setBadgeXp] = useState(500);

  const resetForms = () => {
    setShowAddForm(false);
    setErrorMessage('');
    // Reward
    setRewTitle('');
    setRewDesc('');
    setRewPoints(500);
    setRewStock(10);
    // Badge
    setBadgeName('');
    setBadgeDesc('');
    setBadgeIcon('Award');
    setBadgeXp(500);
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewTitle.trim() || rewPoints <= 0) {
      setErrorMessage('Title and points cost are required.');
      return;
    }
    try {
      await api.createRewardItem({
        title: rewTitle,
        description: rewDesc,
        points_cost: Number(rewPoints),
        stock: Number(rewStock),
        status: 'Available'
      });
      triggerRefresh();
      resetForms();
    } catch (err) {
      setErrorMessage('Failed to add catalog item.');
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeName.trim() || badgeXp <= 0) {
      setErrorMessage('Badge Name and XP Milestone threshold are required.');
      return;
    }
    try {
      await api.createBadge({
        name: badgeName,
        description: badgeDesc,
        icon: badgeIcon,
        xp_threshold: Number(badgeXp)
      });
      triggerRefresh();
      resetForms();
    } catch (err) {
      setErrorMessage('Failed to add badge criteria.');
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    if (!activeProfile) {
      alert('Please select an active profile before redeeming items.');
      return;
    }
    try {
      await api.redeemReward(rewardId, {
        employee_id: activeProfile.id,
        employee_name: activeProfile.name
      });
      triggerRefresh();
      alert('Reward claimed successfully! Points deducted and a delivery confirmation receipt has been dispatched to your Inbox tab.');
    } catch (err: any) {
      alert(err.message || 'Redemption failed. Check your points balance.');
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Remove this reward from catalog?')) return;
    await api.deleteRewardItem(id);
    triggerRefresh();
  };

  const handleDeleteBadge = async (id: string) => {
    if (!confirm('Remove this badge criteria?')) return;
    await api.deleteBadge(id);
    triggerRefresh();
  };

  // Sort Leaderboard profiles descending by XP
  const sortedProfiles = [...profiles].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-6" id="gamification_module">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4" id="gamification_header">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-white">
            <Trophy className="w-5.5 h-5.5 text-amber-400" /> Employee Engagement Center
          </h2>
          <p className="text-slate-300 text-xs mt-1">Acquire XP by planting trees, reporting audits, and signing policies. Spend points on custom eco-incentives!</p>
        </div>

        {/* Dynamic status pill */}
        {activeProfile && (
          <div className="bg-slate-800/80 border border-slate-700/60 p-3 rounded-xl flex items-center gap-3.5 self-start md:self-auto">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-400 text-emerald-400 font-bold text-xs uppercase">
              {activeProfile.name.slice(0, 2)}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 leading-none">Active Profile</p>
              <p className="text-xs font-bold text-slate-100 mt-1">{activeProfile.name}</p>
              <div className="flex gap-2.5 mt-1 font-mono text-[9px] text-slate-300">
                <span>XP: <strong>{activeProfile.xp}</strong></span>
                <span>Points: <strong>{activeProfile.points_balance}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200" id="gamification_tabs">
        {[
          { id: 'leaderboard', label: 'Company Leaderboard', icon: Trophy },
          { id: 'badges', label: 'Incentive Badges', icon: Award },
          { id: 'rewards', label: 'Eco-Rewards Catalog', icon: StoreIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as SubTab);
                resetForms();
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                isActive ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id={`gamification_tab_${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Admin actions forms */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-2xl" id="gamification_form_wrapper">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">
              {activeSubTab === 'rewards' ? 'Add New Incentive to Eco-Catalog' : 'Register New Achievement Badge Criteria'}
            </h3>
            <button onClick={resetForms} className="text-slate-400 hover:text-slate-600">
              <Check className="w-4 h-4" />
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium mt-4">
              {errorMessage}
            </div>
          )}

          {activeSubTab === 'rewards' ? (
            <form onSubmit={handleCreateReward} className="space-y-4 mt-4" id="add_reward_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Incentive Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Organic Fair-Trade Hoodies"
                    value={rewTitle}
                    onChange={(e) => setRewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Points Cost</label>
                    <input
                      type="number"
                      min={10}
                      value={rewPoints}
                      onChange={(e) => setRewPoints(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      min={1}
                      value={rewStock}
                      onChange={(e) => setRewStock(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Incentive Description</label>
                <textarea
                  placeholder="Details regarding materials, sizing, delivery time, or shipping requirements..."
                  rows={3}
                  value={rewDesc}
                  onChange={(e) => setRewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Launch Incentive</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateBadge} className="space-y-4 mt-4" id="add_badge_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Circular Champion"
                    value={badgeName}
                    onChange={(e) => setBadgeName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Icon Style</label>
                    <select
                      value={badgeIcon}
                      onChange={(e) => setBadgeIcon(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                    >
                      <option value="Award">Award Star</option>
                      <option value="Trophy">Trophy Gold</option>
                      <option value="Flame">Flame Burst</option>
                      <option value="Sparkles">Sparkles Aura</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">XP Threshold</label>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={badgeXp}
                      onChange={(e) => setBadgeXp(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Incentive / Milestone Description</label>
                <textarea
                  placeholder="e.g., Automatically awarded when reaching 1,500 total XP metrics."
                  rows={2}
                  value={badgeDesc}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Save Badge</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* RENDER PAGES */}

      {/* Tab 1: Leaderboard */}
      {activeSubTab === 'leaderboard' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="leaderboard_ledger">
          <div className="p-5 border-b border-slate-100 bg-slate-50/55 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-sm">Corporate Sustainability Rankings Index</span>
            <span className="text-xs text-slate-400">Compete with coworkers in daily ESG participations!</span>
          </div>

          <div className="overflow-x-auto" id="leaderboard_table_container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-3 text-center">Rank</th>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">System Role</th>
                  <th className="p-3 text-center">Acquired XP</th>
                  <th className="p-3 text-center">Redeemable Points</th>
                  <th className="p-3">Achievements Unlocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {sortedProfiles.map((prof, idx) => {
                  const unlocked = Array.isArray(prof.unlocked_badges) ? prof.unlocked_badges : [];
                  const isMe = activeProfile?.id === prof.id;

                  return (
                    <tr 
                      key={prof.id} 
                      className={`hover:bg-slate-50/50 ${isMe ? 'bg-emerald-50/30 border-l-4 border-l-emerald-500' : ''}`}
                      id={`leaderboard_row_${prof.id}`}
                    >
                      <td className="p-3 text-center">
                        <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center font-bold text-xs ${
                          idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          idx === 1 ? 'bg-slate-200 text-slate-800' :
                          idx === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600 uppercase">
                            {prof.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{prof.name}</p>
                            <span className="text-[10px] text-slate-400 font-medium">{prof.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-600 whitespace-nowrap">{prof.role}</td>
                      <td className="p-3 text-center font-extrabold text-slate-800">{prof.xp.toLocaleString()} XP</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                          <Coins className="w-3.5 h-3.5" /> {prof.points_balance} pts
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {unlocked.length === 0 ? (
                            <span className="text-slate-400 text-[10px] italic">No achievements yet.</span>
                          ) : (
                            unlocked.map((badgeNameStr, bIdx) => (
                              <span 
                                key={bIdx} 
                                className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                title="Milestone badge earned!"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                {badgeNameStr}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Badges */}
      {activeSubTab === 'badges' && (
        <div className="space-y-6" id="badges_workspace">
          {isManagement && !showAddForm && (
            <button
              onClick={() => {
                resetForms();
                setShowAddForm(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition"
              id="add_badge_open_btn"
            >
              Configure Badge Criteria
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="badges_grid">
            {badges.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id={`badge_card_${b.id}`}>
                <div>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center text-amber-600">
                      {b.icon === 'Trophy' ? <Trophy className="w-6 h-6" /> :
                       b.icon === 'Flame' ? <Flame className="w-6 h-6" /> :
                       b.icon === 'Sparkles' ? <Sparkles className="w-6 h-6" /> :
                       <Award className="w-6 h-6" />}
                    </div>
                    {isManagement && (
                      <button onClick={() => handleDeleteBadge(b.id)} className="text-slate-400 hover:text-rose-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm mt-4">{b.name}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{b.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                  <span>Requirement</span>
                  <span className="text-indigo-600 font-extrabold">{b.xp_threshold} XP Milestone</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Rewards Catalog */}
      {activeSubTab === 'rewards' && (
        <div className="space-y-6" id="rewards_workspace">
          {isManagement && !showAddForm && (
            <button
              onClick={() => {
                resetForms();
                setShowAddForm(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition"
              id="add_reward_open_btn"
            >
              Add Catalog Incentive Item
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="rewards_grid">
            {rewardItems.map((rew) => {
              const isOutOfStock = rew.stock <= 0;
              const pointsRequired = rew.points_cost;
              const hasEnoughPoints = activeProfile ? activeProfile.points_balance >= pointsRequired : false;

              return (
                <div key={rew.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition" id={`reward_card_${rew.id}`}>
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <ShoppingBag className="w-5 h-5" />
                      </div>

                      {isManagement && (
                        <button onClick={() => handleDeleteReward(rew.id)} className="text-slate-400 hover:text-rose-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mt-4">{rew.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{rew.description}</p>
                    
                    <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold text-slate-500">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Stock: <strong className="text-slate-800">{rew.stock} left</strong></span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2" id={`reward_actions_${rew.id}`}>
                    <span className="font-extrabold text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded-xl border border-amber-100">
                      {pointsRequired.toLocaleString()} pts
                    </span>

                    <button
                      onClick={() => handleRedeemReward(rew.id)}
                      disabled={isOutOfStock || !hasEnoughPoints}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition ${
                        isOutOfStock ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                        !hasEnoughPoints ? 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed' :
                        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                      id={`redeem_btn_${rew.id}`}
                    >
                      {isOutOfStock ? 'Sold Out' : !hasEnoughPoints ? 'Need Points' : 'Redeem Item'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
