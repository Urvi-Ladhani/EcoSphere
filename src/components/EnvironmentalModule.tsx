/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Globe2, 
  Leaf, 
  Activity, 
  Settings2, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  FileText,
  Bookmark,
  Sparkles,
  Barcode,
  Target,
  Search,
  Eye,
  Pencil
} from 'lucide-react';
import { CarbonTransaction, EmissionFactor, ProductESGProfile, EnvironmentalGoal } from '../types';
import { api } from '../lib/supabase';

interface EnvironmentalModuleProps {
  dbState: {
    carbonTransactions: CarbonTransaction[];
    emissionFactors: EmissionFactor[];
    productsESG: ProductESGProfile[];
    environmentalGoals: EnvironmentalGoal[];
  };
  userRole: string;
  triggerRefresh: () => void;
}

type SubTab = 'transactions' | 'factors' | 'products' | 'goals';

export default function EnvironmentalModule({
  dbState,
  userRole,
  triggerRefresh
}: EnvironmentalModuleProps) {
  const { carbonTransactions, emissionFactors, productsESG, environmentalGoals } = dbState;
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('transactions');
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canEdit = userRole === 'Admin' || userRole === 'Manager';

  // --- Transactions Form State ---
  const [txSource, setTxSource] = useState<'Purchase' | 'Manufacturing' | 'Expenses' | 'Fleet'>('Purchase');
  const [txLinkedEntity, setTxLinkedEntity] = useState('');
  const [txValue, setTxValue] = useState(0);
  const [txFactorId, setTxFactorId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txStatus, setTxStatus] = useState<'Pending' | 'Approved'>('Pending');

  // --- Factor Form State ---
  const [efName, setEfName] = useState('');
  const [efSource, setEfSource] = useState<'Purchase' | 'Manufacturing' | 'Expenses' | 'Fleet'>('Purchase');
  const [efFactor, setEfFactor] = useState(0);
  const [efUnit, setEfUnit] = useState('');

  // --- Product Form State ---
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodFootprint, setProdFootprint] = useState(0);
  const [prodRecyclability, setProdRecyclability] = useState(0);
  const [prodMaterial, setProdMaterial] = useState('');

  // --- Goal Form State ---
  const [goalName, setGoalName] = useState('');
  const [goalMetric, setGoalMetric] = useState('');
  const [goalTargetValue, setGoalTargetValue] = useState(0);
  const [goalCurrentValue, setGoalCurrentValue] = useState(0);
  const [goalUnit, setGoalUnit] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalStatusSelect, setGoalStatusSelect] = useState<'On Track' | 'At Risk' | 'Achieved'>('On Track');

  // Advanced Goal UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const resetForms = () => {
    setShowAddForm(false);
    setErrorMessage('');
    setSelectedGoalId(null);
    setIsEditingGoal(false);
    // Tx
    setTxLinkedEntity('');
    setTxValue(0);
    setTxFactorId(emissionFactors[0]?.id || '');
    setTxSource('Purchase');
    setTxStatus('Pending');
    // Factor
    setEfName('');
    setEfSource('Purchase');
    setEfFactor(0);
    setEfUnit('');
    // Product
    setProdName('');
    setProdSku('');
    setProdFootprint(0);
    setProdRecyclability(0);
    setProdMaterial('');
    // Goal
    setGoalName('');
    setGoalMetric('');
    setGoalTargetValue(0);
    setGoalCurrentValue(0);
    setGoalUnit('');
    setGoalDate('');
    setGoalStatusSelect('On Track');
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txLinkedEntity.trim() || txValue <= 0 || !txFactorId) {
      setErrorMessage('Please provide a description, select an emission factor, and input a value greater than 0.');
      return;
    }
    try {
      const selectedFactor = emissionFactors.find(f => f.id === txFactorId);
      const payload: Partial<CarbonTransaction> = {
        source: txSource,
        linked_entity: txLinkedEntity,
        activity_value: Number(txValue),
        unit: selectedFactor?.unit || 'Units',
        emission_factor_id: txFactorId,
        transaction_date: txDate,
        status: txStatus
      };
      await api.createCarbonTransaction(payload);
      triggerRefresh();
      resetForms();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error logging transaction.');
    }
  };

  const handleCreateFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!efName.trim() || efFactor <= 0 || !efUnit.trim()) {
      setErrorMessage('All factor fields are required.');
      return;
    }
    try {
      await api.createEmissionFactor({
        name: efName,
        source: efSource,
        co2_factor: Number(efFactor),
        unit: efUnit,
        status: 'Active'
      });
      triggerRefresh();
      resetForms();
    } catch (err: any) {
      setErrorMessage('Failed to save factor.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodSku.trim()) {
      setErrorMessage('Product Name and SKU are required.');
      return;
    }
    try {
      await api.createProductESG({
        name: prodName,
        sku: prodSku.toUpperCase(),
        carbon_footprint: Number(prodFootprint),
        recyclability: Number(prodRecyclability),
        material_source: prodMaterial,
        status: 'Active'
      });
      triggerRefresh();
      resetForms();
    } catch (err: any) {
      setErrorMessage('Failed to add product profile.');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || !goalMetric.trim() || goalTargetValue <= 0 || !goalDate) {
      setErrorMessage('Goal name, metrics, and non-zero target date are required.');
      return;
    }
    try {
      if (isEditingGoal && selectedGoalId) {
        await api.updateEnvironmentalGoal(selectedGoalId, {
          name: goalName,
          target_metric: goalMetric,
          target_value: Number(goalTargetValue),
          current_value: Number(goalCurrentValue),
          unit: goalUnit,
          target_date: goalDate,
          status: goalStatusSelect
        });
      } else {
        await api.createEnvironmentalGoal({
          name: goalName,
          target_metric: goalMetric,
          target_value: Number(goalTargetValue),
          current_value: Number(goalCurrentValue),
          unit: goalUnit,
          target_date: goalDate,
          status: 'On Track'
        });
      }
      triggerRefresh();
      resetForms();
    } catch (err: any) {
      setErrorMessage(isEditingGoal ? 'Failed to update goal.' : 'Failed to log goal.');
    }
  };

  const handleEditGoalClick = (goal: EnvironmentalGoal) => {
    resetForms();
    setSelectedGoalId(goal.id);
    setIsEditingGoal(true);
    setGoalName(goal.name);
    setGoalMetric(goal.target_metric);
    setGoalTargetValue(goal.target_value);
    setGoalCurrentValue(goal.current_value);
    setGoalUnit(goal.unit);
    setGoalDate(goal.target_date);
    setGoalStatusSelect(goal.status);
    setShowAddForm(true);
  };

  const handleExportGoalsCSV = () => {
    let csv = "Goal Name,Department/Metric,Target CO2,Current CO2,Progress,Deadline,Status\n";
    environmentalGoals.forEach(g => {
      const progressPct = g.target_value > 0 ? Math.min(100, Math.round((g.current_value / g.target_value) * 100)) : 0;
      let deptName = 'Corporate';
      if (g.name.toLowerCase().includes('fleet') || g.target_metric.toLowerCase().includes('fleet') || g.target_metric.toLowerCase().includes('operations')) {
        deptName = 'Logistics';
      } else if (g.name.toLowerCase().includes('packaging') || g.target_metric.toLowerCase().includes('manufacturing')) {
        deptName = 'Manufacturing';
      }
      csv += `"${g.name}","${deptName}","${g.target_value} ${g.unit}","${g.current_value} ${g.unit}",${progressPct}%,${g.target_date},${g.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "environmental_goals_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApproveTransaction = async (id: string) => {
    try {
      await api.updateCarbonTransaction(id, { status: 'Approved' });
      triggerRefresh();
    } catch (err) {
      alert('Approval action failed.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Delete this carbon record?')) return;
    await api.deleteCarbonTransaction(id);
    triggerRefresh();
  };

  const handleDeleteFactor = async (id: string) => {
    if (!confirm('Delete this factor?')) return;
    await api.deleteEmissionFactor(id);
    triggerRefresh();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete product profile?')) return;
    await api.deleteProductESG(id);
    triggerRefresh();
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Delete goal?')) return;
    await api.deleteEnvironmentalGoal(id);
    triggerRefresh();
  };

  return (
    <div className="space-y-6" id="environmental_module">
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="env_header">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-600" /> Carbon Tracking &amp; Emissions
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure carbon factors, register business fuel usage, track recycled product specifications, and progress toward goals.</p>
        </div>

        {canEdit && !showAddForm && (
          <button
            onClick={() => {
              resetForms();
              setShowAddForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 self-start md:self-auto transition"
            id="open_env_form_btn"
          >
            <Plus className="w-4 h-4" /> 
            {activeSubTab === 'transactions' && 'Log Emission Transaction'}
            {activeSubTab === 'factors' && 'Add Emission Factor'}
            {activeSubTab === 'products' && 'Create Product Profile'}
            {activeSubTab === 'goals' && 'Add Sustainability Target'}
          </button>
        )}
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex border-b border-slate-200" id="env_subtabs_container">
        {[
          { id: 'transactions', label: 'Carbon Ledger', icon: Activity },
          { id: 'factors', label: 'Emission Factors', icon: Settings2 },
          { id: 'products', label: 'Circular Products', icon: Barcode },
          { id: 'goals', label: 'Sustainability Goals', icon: Target }
        ].map((tab) => {
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
                isActive
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id={`env_subtab_${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* dynamic Sub-forms depending on tab */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-2xl" id="env_form_wrapper">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800">
              {activeSubTab === 'transactions' && 'Log New Business Carbon Transaction'}
              {activeSubTab === 'factors' && 'Register New CO2 Conversion Factor'}
              {activeSubTab === 'products' && 'Configure Eco-Product Profile'}
              {activeSubTab === 'goals' && 'Set Sustainability Goal'}
            </h3>
            <button onClick={resetForms} className="text-slate-400 hover:text-slate-600">
              <Check className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-700 text-xs font-medium mt-4">
              {errorMessage}
            </div>
          )}

          {/* Tab 1: Carbon Ledger Form */}
          {activeSubTab === 'transactions' && (
            <form onSubmit={handleCreateTransaction} className="space-y-4 mt-4" id="form_carbon_tx">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Source Category</label>
                  <select
                    value={txSource}
                    onChange={(e) => setTxSource(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    <option value="Purchase">Purchased Grid Utilities</option>
                    <option value="Manufacturing">Manufacturing Operations</option>
                    <option value="Expenses">Travel &amp; Office Expenses</option>
                    <option value="Fleet">Logistics Fleet Fuel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Conversion Factor</label>
                  <select
                    value={txFactorId}
                    onChange={(e) => setTxFactorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    <option value="">-- Choose Factor --</option>
                    {emissionFactors.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.co2_factor} kg CO2e / {f.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Activity Amount / Value</label>
                  <input
                    type="number"
                    min={0.1}
                    step="any"
                    value={txValue}
                    onChange={(e) => setTxValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Invoice Reference</label>
                  <input
                    type="text"
                    placeholder="e.g., Boiler Gas Meter Run Jul2026"
                    value={txLinkedEntity}
                    onChange={(e) => setTxLinkedEntity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Status</label>
                  <select
                    value={txStatus}
                    onChange={(e) => setTxStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    <option value="Pending">Pending Audit</option>
                    <option value="Approved">Approved / Settled</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Submit Transaction</button>
              </div>
            </form>
          )}

          {/* Tab 2: Emission Factor Form */}
          {activeSubTab === 'factors' && (
            <form onSubmit={handleCreateFactor} className="space-y-4 mt-4" id="form_emission_ef">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Factor Name / Resource</label>
                  <input
                    type="text"
                    placeholder="e.g., Heavy Marine Bunker Oil"
                    value={efName}
                    onChange={(e) => setEfName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Emissions Category</label>
                  <select
                    value={efSource}
                    onChange={(e) => setEfSource(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    <option value="Purchase">Purchase utilities</option>
                    <option value="Manufacturing">Manufacturing processes</option>
                    <option value="Expenses">Office &amp; Flights</option>
                    <option value="Fleet">Freight Truck Diesel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">CO2 Factor (kg CO2e per unit)</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={efFactor}
                    onChange={(e) => setEfFactor(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Unit</label>
                  <input
                    type="text"
                    placeholder="e.g., Liter, kWh, Mile, Metric Ton"
                    value={efUnit}
                    onChange={(e) => setEfUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Save Factor</button>
              </div>
            </form>
          )}

          {/* Tab 3: Products ESG Profile Form */}
          {activeSubTab === 'products' && (
            <form onSubmit={handleCreateProduct} className="space-y-4 mt-4" id="form_product_esg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Biodegradable Packing Peanuts"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g., PKG-BIO-09"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Carbon Footprint (kg CO2e per unit)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={prodFootprint}
                    onChange={(e) => setProdFootprint(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Recyclability Rating (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={prodRecyclability}
                    onChange={(e) => setProdRecyclability(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Material Origin &amp; Sources</label>
                <textarea
                  placeholder="e.g., 100% post-consumer corn starch, zero chemical residues."
                  rows={2}
                  value={prodMaterial}
                  onChange={(e) => setProdMaterial(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Save Product</button>
              </div>
            </form>
          )}

          {/* Tab 4: Goals Form */}
          {activeSubTab === 'goals' && (
            <form onSubmit={handleCreateGoal} className="space-y-4 mt-4" id="form_environmental_goals">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sustainability Target Name</label>
                <input
                  type="text"
                  placeholder="e.g., Cut total manufacturing landfill exports by 50%"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Metric Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Tons of waste sent to landfill"
                    value={goalMetric}
                    onChange={(e) => setGoalMetric(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Value</label>
                  <input
                    type="number"
                    min="0"
                    value={goalTargetValue}
                    onChange={(e) => setGoalTargetValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Current/Starting Value</label>
                  <input
                    type="number"
                    min="0"
                    value={goalCurrentValue}
                    onChange={(e) => setGoalCurrentValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g., kg, Tons, %, counts"
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Deadline Date</label>
                  <input
                    type="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              {isEditingGoal && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Current Goal Status</label>
                  <select
                    value={goalStatusSelect}
                    onChange={(e) => setGoalStatusSelect(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    <option value="On Track">On Track</option>
                    <option value="At Risk">Active (At Risk)</option>
                    <option value="Achieved">Completed (Achieved)</option>
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Save Goal</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* RENDER LISTS ACCORDING TO SUB-TAB */}

      {/* Tab 1 Content: Transactions List */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="tx_ledger_card">
          <div className="p-5 border-b border-slate-100 bg-slate-50/55 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-sm">Automated Emissions &amp; Invoices Ledger</span>
            <span className="text-xs text-slate-400">Total emissions tracked: <strong className="text-slate-700">{Math.round(carbonTransactions.reduce((sum, t) => sum + t.calculated_co2, 0)).toLocaleString()} kg CO2e</strong></span>
          </div>

          <div className="overflow-x-auto" id="tx_ledger_table_container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-3">Date</th>
                  <th className="p-3">Source Category</th>
                  <th className="p-3">Linked Description</th>
                  <th className="p-3 text-right">Activity Amount</th>
                  <th className="p-3 text-right">CO2 Generated</th>
                  <th className="p-3 text-center">Audit Status</th>
                  {canEdit && <th className="p-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {carbonTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">No recorded carbon transactions. Use "Log Emission" above to add.</td>
                  </tr>
                ) : (
                  carbonTransactions.map((tx) => {
                    const factor = emissionFactors.find(f => f.id === tx.emission_factor_id);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50" id={`tx_row_${tx.id}`}>
                        <td className="p-3 whitespace-nowrap font-medium text-slate-600">{tx.transaction_date}</td>
                        <td className="p-3 font-semibold text-slate-800">{tx.source}</td>
                        <td className="p-3">
                          <p className="font-medium text-slate-700">{tx.linked_entity}</p>
                          <p className="text-[10px] text-slate-400">{factor ? `Multiplier: ${factor.name} (${factor.co2_factor} kg / ${factor.unit})` : 'Custom Factor'}</p>
                        </td>
                        <td className="p-3 text-right font-medium text-slate-600">{tx.activity_value.toLocaleString()} {tx.unit}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">{Math.round(tx.calculated_co2).toLocaleString()} kg CO2e</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        {canEdit && (
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              {tx.status === 'Pending' && (
                                <button
                                  onClick={() => handleApproveTransaction(tx.id)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold border border-emerald-200"
                                  id={`approve_tx_${tx.id}`}
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                id={`delete_tx_${tx.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2 Content: Emission Factors */}
      {activeSubTab === 'factors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="factors_grid">
          {emissionFactors.map((ef) => (
            <div key={ef.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-start justify-between" id={`ef_card_${ef.id}`}>
              <div className="flex items-start gap-3">
                <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{ef.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Category: <strong>{ef.source}</strong></p>
                  <p className="text-xs text-slate-700 font-medium mt-2">
                    Greenhouse multiplier: <strong className="text-emerald-700 font-bold">{ef.co2_factor} kg CO2e</strong> per {ef.unit}
                  </p>
                </div>
              </div>

              {canEdit && (
                <button
                  onClick={() => handleDeleteFactor(ef.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5"
                  id={`delete_ef_${ef.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3 Content: Circular Products */}
      {activeSubTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="products_grid">
          {productsESG.map((prod) => (
            <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between" id={`prod_card_${prod.id}`}>
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded tracking-wide">{prod.sku}</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">{prod.name}</h4>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      id={`delete_prod_${prod.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 mt-4">
                  {/* Footprint */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Carbon Footprint</span>
                    <span className="font-bold text-rose-700">{prod.carbon_footprint} kg CO2e / unit</span>
                  </div>

                  {/* Recyclability */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500 font-medium">Circular Recyclability</span>
                      <span className="text-emerald-600">{prod.recyclability}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${prod.recyclability}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {prod.material_source && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 italic">
                  Origin: {prod.material_source}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 4 Content: Sustainability Goals */}
      {activeSubTab === 'goals' && (
        <div className="space-y-4" id="goals_workspace">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-wrap" id="goals_action_bar">
            <div className="flex items-center gap-2 flex-wrap">
              {canEdit && (
                <>
                  <button
                    onClick={() => {
                      resetForms();
                      setShowAddForm(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition shadow-sm"
                    id="new_goal_btn"
                  >
                    <Plus className="w-3.5 h-3.5" /> + New Goal
                  </button>
                  <button
                    onClick={() => {
                      const selectedGoal = environmentalGoals.find(g => g.id === selectedGoalId);
                      if (selectedGoal) handleEditGoalClick(selectedGoal);
                    }}
                    disabled={!selectedGoalId}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer border ${
                      selectedGoalId 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 shadow-sm' 
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                    id="edit_goal_btn"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (selectedGoalId) handleDeleteGoal(selectedGoalId);
                    }}
                    disabled={!selectedGoalId}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer border ${
                      selectedGoalId 
                        ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-sm' 
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                    id="delete_goal_btn"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </>
              )}
              <button
                onClick={handleExportGoalsCSV}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl border border-slate-300 transition cursor-pointer flex items-center gap-1"
                id="export_goals_btn"
              >
                Export ▾
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64" id="goals_search_container">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 pl-9 font-medium focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>
          </div>

          {/* Goals Spreadsheet Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="goals_ledger_table_container">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="p-3">Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-right">Target CO₂</th>
                    <th className="p-3 text-right">Current CO₂</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {environmentalGoals.filter(g => 
                    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    g.target_metric.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">No sustainability goals match search criteria.</td>
                    </tr>
                  ) : (
                    environmentalGoals.filter(g => 
                      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      g.target_metric.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((goal) => {
                      const isSelected = selectedGoalId === goal.id;
                      const progressRatio = goal.target_value > 0 ? (goal.current_value / goal.target_value) : 0;
                      const progressPct = Math.min(100, Math.round(progressRatio * 100));
                      
                      // Map department dynamically based on metric keywords
                      let deptName = 'Corporate';
                      if (goal.name.toLowerCase().includes('fleet') || goal.target_metric.toLowerCase().includes('fleet') || goal.target_metric.toLowerCase().includes('operations')) {
                        deptName = 'Logistics';
                      } else if (goal.name.toLowerCase().includes('packaging') || goal.target_metric.toLowerCase().includes('manufacturing')) {
                        deptName = 'Manufacturing';
                      }

                      // Status Mapping
                      const displayStatus = goal.status === 'Achieved' ? 'Completed' :
                                            goal.status === 'At Risk' ? 'Active' : 'On Track';
                      const statusColor = displayStatus === 'Completed' ? 'bg-blue-100 text-blue-800 border-blue-200 font-bold' :
                                          displayStatus === 'On Track' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold' :
                                          'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold'; // Green Active pill

                      return (
                        <tr 
                          key={goal.id} 
                          onClick={() => setSelectedGoalId(goal.id === selectedGoalId ? null : goal.id)}
                          className={`cursor-pointer transition hover:bg-slate-50/50 ${
                            isSelected ? 'bg-emerald-50/20 border-emerald-200 font-semibold' : ''
                          }`}
                          id={`goal_row_${goal.id}`}
                        >
                          <td className="p-3 font-semibold text-slate-850">{goal.name}</td>
                          <td className="p-3 font-semibold text-slate-600">{deptName}</td>
                          <td className="p-3 text-right font-mono text-slate-650 font-semibold">{goal.target_value.toLocaleString()} {goal.unit}</td>
                          <td className="p-3 text-right font-mono text-slate-650 font-semibold">{goal.current_value.toLocaleString()} {goal.unit}</td>
                          <td className="p-3 w-48">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden flex-shrink-0">
                                <div 
                                  className={`h-full transition-all ${displayStatus === 'Completed' ? 'bg-emerald-600' : 'bg-emerald-500'}`} 
                                  style={{ width: `${progressPct}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-[10px] font-bold text-slate-500">{progressPct}%</span>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-500">{goal.target_date}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] border ${statusColor}`}>
                              {displayStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footnote */}
          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1 pl-1" id="goals_ledger_footer">
            <span>Row actions:</span>
            <span className="flex items-center gap-0.5 text-slate-500 font-bold"><Eye className="w-3 h-3" /> View</span>
            <span className="text-slate-350">|</span>
            <span className="flex items-center gap-0.5 text-slate-500 font-bold"><Pencil className="w-3 h-3" /> Edit</span>
            <span className="text-slate-350">|</span>
            <span className="flex items-center gap-0.5 text-slate-500 font-bold"><Trash2 className="w-3 h-3" /> Delete</span>
            <span className="text-slate-350 font-bold ml-1.5">&bull;</span>
            <span className="ml-1 text-slate-400">Carbon Transactions auto-generated from Purchase/Manufacturing/Fleet/Expenses</span>
          </div>
        </div>
      )}
    </div>
  );
}
