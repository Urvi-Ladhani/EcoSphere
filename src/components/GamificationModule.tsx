/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Flame, 
  ShoppingBag, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles,
  ShoppingBag as StoreIcon,
  Tag,
  Calendar,
  CheckSquare,
  TrendingUp,
  FileText,
  Upload,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Badge, RewardItem, Profile, Challenge, ChallengeParticipation, Category } from '../types';
import { api } from '../lib/supabase';

interface GamificationModuleProps {
  dbState: {
    badges: Badge[];
    rewardItems: RewardItem[];
    profiles: Profile[];
    challenges: Challenge[];
    challengeParticipations: ChallengeParticipation[];
    categories: Category[];
  };
  activeProfile: Profile | null;
  triggerRefresh: () => void;
}

type SubTab = 'leaderboard' | 'badges' | 'rewards' | 'challenges';

export default function GamificationModule({
  dbState,
  activeProfile,
  triggerRefresh
}: GamificationModuleProps) {
  const { badges, rewardItems, profiles, challenges, challengeParticipations, categories } = dbState;
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

  // --- Challenge Form State ---
  const [chalTitle, setChalTitle] = useState('');
  const [chalDesc, setChalDesc] = useState('');
  const [chalXp, setChalXp] = useState(150);
  const [chalDiff, setChalDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [chalDeadline, setChalDeadline] = useState('2026-12-31');
  const [chalCategoryId, setChalCategoryId] = useState('');

  // --- Employee Submit Progress Modal/State ---
  const [selectedChallengeForProgress, setSelectedChallengeForProgress] = useState<Challenge | null>(null);
  const [progressInput, setProgressInput] = useState(100);
  const [proofInput, setProofInput] = useState('');

  // Default category assignment on startup
  React.useEffect(() => {
    const challengeCats = categories.filter(c => c.type === 'Challenge');
    if (challengeCats.length > 0 && !chalCategoryId) {
      setChalCategoryId(challengeCats[0].id);
    }
  }, [categories]);

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
    // Challenge
    setChalTitle('');
    setChalDesc('');
    setChalXp(150);
    setChalDiff('Medium');
    setChalDeadline('2026-12-31');
    const challengeCats = categories.filter(c => c.type === 'Challenge');
    if (challengeCats.length > 0) {
      setChalCategoryId(challengeCats[0].id);
    }
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

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chalTitle.trim() || chalXp <= 0 || !chalCategoryId) {
      setErrorMessage('Title, XP, and Category are required.');
      return;
    }
    try {
      await api.createChallenge({
        title: chalTitle,
        description: chalDesc,
        category_id: chalCategoryId,
        xp: Number(chalXp),
        difficulty: chalDiff,
        deadline: chalDeadline,
        evidence_required: true,
        status: 'Active'
      });
      triggerRefresh();
      resetForms();
    } catch (err) {
      setErrorMessage('Failed to publish challenge.');
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
      alert('Reward claimed successfully! Points deducted and a confirmation receipt has been dispatched to your notifications.');
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

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm('Delete this challenge entirely? This clears all employee submissions for it.')) return;
    await api.deleteChallenge(id);
    triggerRefresh();
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!activeProfile) return;
    try {
      await api.submitChallengeParticipation({
        id: 'cp-' + Math.random().toString(36).substr(2, 9),
        challenge_id: challengeId,
        employee_id: activeProfile.id,
        employee_name: activeProfile.name,
        progress: 0,
        proof: '',
        approval_status: 'Pending',
        xp_awarded: 0,
        completion_date: ''
      });
      triggerRefresh();
    } catch (err: any) {
      alert('Failed to join challenge.');
    }
  };

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile || !selectedChallengeForProgress) return;
    if (progressInput > 0 && !proofInput.trim()) {
      alert('Please provide photographic proof/description for validation verification.');
      return;
    }
    try {
      await api.submitChallengeParticipation({
        challenge_id: selectedChallengeForProgress.id,
        employee_id: activeProfile.id,
        employee_name: activeProfile.name,
        progress: Number(progressInput),
        proof: proofInput,
        approval_status: 'Pending'
      });
      triggerRefresh();
      setSelectedChallengeForProgress(null);
      setProofInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit challenge progress.');
    }
  };

  const handleApproveChallenge = async (partId: string) => {
    try {
      await api.updateChallengeParticipation(partId, { approval_status: 'Approved' });
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to approve challenge submission.');
    }
  };

  const handleRejectChallenge = async (partId: string) => {
    const reason = prompt('Specify rejection reason feedback:');
    if (reason === null) return;
    try {
      await api.updateChallengeParticipation(partId, { 
        approval_status: 'Rejected',
        rejection_reason: reason || 'Insufficient proof.'
      });
      triggerRefresh();
    } catch (err: any) {
      alert('Failed to decline submission.');
    }
  };

  const handleChallengeStatusChange = async (id: string, newStatus: any) => {
    try {
      await api.updateChallenge(id, { status: newStatus });
      triggerRefresh();
    } catch (err: any) {
      alert('Failed to update challenge status.');
    }
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
          <p className="text-slate-300 text-xs mt-1 font-medium">Acquire XP by completing active sustainability challenges, planting trees, and signing policies. Spend points on custom eco-incentives!</p>
        </div>

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
          { id: 'challenges', label: 'Sustainability Challenges', icon: CheckSquare },
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
              {activeSubTab === 'rewards' ? 'Add New Incentive to Eco-Catalog' : 
               activeSubTab === 'badges' ? 'Register New Achievement Badge Criteria' :
               'Publish New Sustainability Challenge'}
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

          {activeSubTab === 'rewards' && (
            <form onSubmit={handleCreateReward} className="space-y-4 mt-4" id="add_reward_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Incentive Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Organic Fair-Trade Hoodies"
                    value={rewTitle}
                    onChange={(e) => setRewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={rewStock}
                      onChange={(e) => setRewStock(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Item Description</label>
                <textarea
                  placeholder="Provide circular economy specifications, material sources, and size options."
                  value={rewDesc}
                  onChange={(e) => setRewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium h-20 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition">
                Create Catalog Reward
              </button>
            </form>
          )}

          {activeSubTab === 'badges' && (
            <form onSubmit={handleCreateBadge} className="space-y-4 mt-4" id="add_badge_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Circularity Specialist"
                    value={badgeName}
                    onChange={(e) => setBadgeName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">XP Threshold</label>
                    <input
                      type="number"
                      min={50}
                      value={badgeXp}
                      onChange={(e) => setBadgeXp(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Icon</label>
                    <select
                      value={badgeIcon}
                      onChange={(e) => setBadgeIcon(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Award">Standard Badge</option>
                      <option value="Trophy">Corporate Trophy</option>
                      <option value="Flame">Sustained Streak</option>
                      <option value="Sparkles">Legendary Star</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Unlock Milestone Description</label>
                <textarea
                  placeholder="Describe the benchmark target criteria required to unlock this corporate achievement."
                  value={badgeDesc}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium h-20 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition">
                Create Badge Criteria
              </button>
            </form>
          )}

          {activeSubTab === 'challenges' && (
            <form onSubmit={handleCreateChallenge} className="space-y-4 mt-4" id="add_challenge_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Challenge Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Bike-to-Work Month"
                    value={chalTitle}
                    onChange={(e) => setChalTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">XP Value</label>
                    <input
                      type="number"
                      min={50}
                      value={chalXp}
                      onChange={(e) => setChalXp(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Difficulty</label>
                    <select
                      value={chalDiff}
                      onChange={(e) => setChalDiff(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ESG Category</label>
                    <select
                      value={chalCategoryId}
                      onChange={(e) => setChalCategoryId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                    >
                      {categories.filter(c => c.type === 'Challenge').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={chalDeadline}
                    onChange={(e) => setChalDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center pt-5 pl-2">
                  <span className="text-xs text-slate-500 font-semibold italic">Requires photographic evidence submission.</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Challenge Instructions &amp; Description</label>
                <textarea
                  placeholder="Outline the steps and targets employees must execute to prove verification circularity."
                  value={chalDesc}
                  onChange={(e) => setChalDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium h-20 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition">
                Publish Active Challenge
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 1: Leaderboard */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-6" id="leaderboard_workspace">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="leaderboard_card">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" /> Sustainability Leaderboard Rankings
            </h3>
            
            <table className="w-full text-left text-xs border-collapse" id="leaderboard_table">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3 w-16 text-center">Rank</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3 text-center">Role</th>
                  <th className="p-3 text-center">XP Points</th>
                  <th className="p-3 text-center">Redeem Balance</th>
                  <th className="p-3">Unlocked Badges</th>
                </tr>
              </thead>
              <tbody>
                {sortedProfiles.map((p, idx) => {
                  const isTop3 = idx < 3;
                  const unlocked = p.unlocked_badges || [];
                  return (
                    <tr 
                      key={p.id} 
                      className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition ${
                        activeProfile?.id === p.id ? 'bg-emerald-50/20 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-bold text-slate-700">
                        {isTop3 ? (
                          <span className={`inline-block w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                            idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            idx === 1 ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                            'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}>
                            {idx + 1}
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-800">{p.name}</td>
                      <td className="p-3 text-center text-slate-500">{p.role}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800">{p.xp} XP</td>
                      <td className="p-3 text-center font-mono text-emerald-700 font-semibold">{p.points_balance} pts</td>
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

      {/* Tab 2: Sustainability Challenges */}
      {activeSubTab === 'challenges' && (
        <div className="space-y-6" id="challenges_workspace">
          {/* Admin Create Trigger */}
          {isManagement && !showAddForm && (
            <div className="flex justify-between items-center flex-wrap gap-4">
              <button
                onClick={() => {
                  resetForms();
                  setShowAddForm(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                id="add_challenge_open_btn"
              >
                <Plus className="w-4 h-4" /> Create Circular Challenge
              </button>
            </div>
          )}

          {/* Employee submission progress form inline overlay */}
          {selectedChallengeForProgress && (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6" id="submit_progress_card">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                Update Progress: {selectedChallengeForProgress.title}
              </h4>
              <form onSubmit={handleSubmitProgress} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1">Completion Progress (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progressInput}
                      onChange={(e) => setProgressInput(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-1">Attached Verification Evidence</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Photo log URL, or circular metrics breakdown"
                      value={proofInput}
                      onChange={(e) => setProofInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer">
                    Submit Evidence Logs
                  </button>
                  <button type="button" onClick={() => setSelectedChallengeForProgress(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid of Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="challenges_grid">
            {challenges.map((c) => {
              // Find if activeProfile has a participation record
              const myPart = challengeParticipations.find(cp => cp.challenge_id === c.id && cp.employee_id === activeProfile?.id);
              const difficultyColor = c.difficulty === 'Easy' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                                      c.difficulty === 'Medium' ? 'text-amber-700 bg-amber-50 border-amber-100' :
                                      'text-rose-700 bg-rose-50 border-rose-100';

              return (
                <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition" id={`challenge_card_${c.id}`}>
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${difficultyColor}`}>
                        {c.difficulty}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase">{c.status}</span>
                        {isManagement && (
                          <div className="flex gap-1">
                            <select
                              value={c.status}
                              onChange={(e) => handleChallengeStatusChange(c.id, e.target.value as any)}
                              className="bg-slate-50 border-slate-200 border text-[9px] font-bold rounded p-0.5 focus:outline-none"
                            >
                              <option value="Draft">Draft</option>
                              <option value="Active">Active</option>
                              <option value="Under Review">Review</option>
                              <option value="Completed">Completed</option>
                              <option value="Archived">Archived</option>
                            </select>
                            <button onClick={() => handleDeleteChallenge(c.id)} className="text-slate-400 hover:text-rose-600 p-0.5" title="Delete Challenge">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mt-3">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">{c.description}</p>

                    <div className="mt-4 flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline: {c.deadline}</span>
                      <span className="flex items-center gap-1 text-emerald-600"><Sparkles className="w-3.5 h-3.5" /> {c.xp} XP</span>
                    </div>

                    {/* Progress tracking display */}
                    {myPart && (
                      <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Your Progress: {myPart.progress}%</span>
                          <span className={`uppercase text-[9px] ${
                            myPart.approval_status === 'Approved' ? 'text-emerald-600' :
                            myPart.approval_status === 'Rejected' ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                            {myPart.approval_status === 'Approved' ? 'Approved & Credited' : 
                             myPart.approval_status === 'Rejected' ? 'Declined' : 'Pending Review'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full transition-all" style={{ width: `${myPart.progress}%` }}></div>
                        </div>
                        {myPart.rejection_reason && (
                          <p className="text-[10px] text-rose-500 font-semibold mt-1">Feedback: "{myPart.rejection_reason}"</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                    {!myPart ? (
                      <button
                        onClick={() => handleJoinChallenge(c.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        Compete in Challenge
                      </button>
                    ) : (
                      myPart.approval_status !== 'Approved' && (
                        <button
                          onClick={() => {
                            setSelectedChallengeForProgress(c);
                            setProgressInput(myPart.progress);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Update Progress
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending Approvals Workspace for Managers */}
          {isManagement && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-8" id="challenge_approvals_panel">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-indigo-600" /> Pending Challenge Evidence Approvals
              </h3>
              
              {challengeParticipations.filter(cp => cp.approval_status === 'Pending' && cp.progress > 0).length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl" id="no_approvals_alert">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">No pending challenge submissions require audit review.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse" id="challenge_approvals_table">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Employee</th>
                      <th className="p-3">Challenge Title</th>
                      <th className="p-3 text-center">Progress Submitted</th>
                      <th className="p-3">Evidence Log</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challengeParticipations.filter(cp => cp.approval_status === 'Pending' && cp.progress > 0).map((part) => {
                      const chal = challenges.find(c => c.id === part.challenge_id);
                      return (
                        <tr key={part.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition">
                          <td className="p-3 font-bold text-slate-800">{part.employee_name}</td>
                          <td className="p-3 font-semibold text-slate-600">{chal?.title || 'ESG Challenge'}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-800">{part.progress}%</td>
                          <td className="p-3 text-slate-500 font-mono text-[10px] select-all max-w-xs truncate" title={part.proof}>
                            {part.proof}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApproveChallenge(part.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectChallenge(part.id)}
                                className="bg-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-[10px] px-2.5 py-1 rounded transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Badges */}
      {activeSubTab === 'badges' && (
        <div className="space-y-6" id="badges_workspace">
          {isManagement && !showAddForm && (
            <button
              onClick={() => {
                resetForms();
                setShowAddForm(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer"
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
                      <button onClick={() => handleDeleteBadge(b.id)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
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

      {/* Tab 4: Eco-Rewards Catalog */}
      {activeSubTab === 'rewards' && (
        <div className="space-y-6" id="rewards_workspace">
          {isManagement && !showAddForm && (
            <button
              onClick={() => {
                resetForms();
                setShowAddForm(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer"
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
                        <button onClick={() => handleDeleteReward(rew.id)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
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
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
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
