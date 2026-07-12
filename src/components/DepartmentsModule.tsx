/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Building, 
  User, 
  Users, 
  MapPin, 
  ShieldAlert, 
  CheckCircle,
  X,
  PlusCircle
} from 'lucide-react';
import { Department, DepartmentScore } from '../types';
import { api } from '../lib/supabase';

interface DepartmentsModuleProps {
  departments: Department[];
  departmentScores: DepartmentScore[];
  userRole: string;
  triggerRefresh: () => void;
}

export default function DepartmentsModule({
  departments,
  departmentScores,
  userRole,
  triggerRefresh
}: DepartmentsModuleProps) {
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [head, setHead] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const canEdit = userRole === 'Admin' || userRole === 'Manager';

  const resetForm = () => {
    setName('');
    setCode('');
    setHead('');
    setParentId(null);
    setEmployeeCount(0);
    setStatus('Active');
    setErrorMessage('');
    setEditingDept(null);
    setShowAddForm(false);
  };

  const handleEditClick = (dept: Department) => {
    if (!canEdit) return;
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setHead(dept.head);
    setParentId(dept.parent_id);
    setEmployeeCount(dept.employee_count);
    setStatus(dept.status);
    setShowAddForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !code.trim() || !head.trim()) {
      setErrorMessage('Please fill in Name, Code, and Department Head.');
      return;
    }

    try {
      const payload: Partial<Department> = {
        name,
        code: code.toUpperCase(),
        head,
        parent_id: parentId || null,
        employee_count: Number(employeeCount),
        status
      };

      if (editingDept) {
        await api.updateDepartment(editingDept.id, payload);
      } else {
        await api.createDepartment(payload);
      }

      triggerRefresh();
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving department details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department? This will delete associated score histories.')) return;
    try {
      await api.deleteDepartment(id);
      triggerRefresh();
    } catch (err: any) {
      alert('Failed to delete department.');
    }
  };

  return (
    <div className="space-y-6" id="departments_module_container">
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="departments_header">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" /> Organizational Hierarchy
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage corporate departments, reporting lines, employee censuses, and operational metrics ownership.</p>
        </div>
        {canEdit && !showAddForm && !editingDept && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition"
            id="add_dept_btn"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        )}
      </div>

      {/* Editor / Addition Form */}
      {(showAddForm || editingDept) && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-2xl" id="dept_form_container">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">
              {editingDept ? `Edit Department: ${editingDept.name}` : 'Create New Corporate Department'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 mt-4" id="dept_form">
            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-150 text-xs rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g., Supply Chain Operations"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department Code</label>
                <input
                  type="text"
                  placeholder="e.g., SCO"
                  maxLength={10}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department Head / Manager</label>
                <input
                  type="text"
                  placeholder="e.g., Jane Cooper"
                  value={head}
                  onChange={(e) => setHead(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Employee Count</label>
                <input
                  type="number"
                  min={0}
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Parent Department (Hierarchy)</label>
                <select
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-emerald-500 font-medium"
                >
                  <option value="">No Parent (Root Node)</option>
                  {departments
                    .filter((d) => !editingDept || d.id !== editingDept.id)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Operational Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-emerald-500 font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                {editingDept ? 'Update Department' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Departments Grid with dynamic ESG scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="departments_list_grid">
        {departments.map((dept) => {
          const parentDept = departments.find((d) => d.id === dept.parent_id);
          const score = departmentScores.find((s) => s.department_id === dept.id);

          return (
            <div 
              key={dept.id} 
              className={`bg-white border ${dept.status === 'Inactive' ? 'border-dashed border-slate-300 opacity-70' : 'border-slate-200'} rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition`}
              id={`dept_card_${dept.id}`}
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {dept.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-1">{dept.name}</h3>
                    {parentDept && (
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        Reporting Line: <strong>{parentDept.name} ({parentDept.code})</strong>
                      </p>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditClick(dept)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded"
                        title="Edit Department"
                        id={`edit_dept_btn_${dept.id}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded"
                        title="Delete Department"
                        id={`delete_dept_btn_${dept.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50/55 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Dept Head</p>
                      <p className="text-xs font-bold text-slate-700">{dept.head}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Employee Count</p>
                      <p className="text-xs font-bold text-slate-700">{dept.employee_count} employees</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ESG Score overview block */}
              {score && (
                <div className="mt-5 pt-4 border-t border-slate-100" id={`dept_scores_${dept.id}`}>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold text-slate-700">Department Score Index:</span>
                    <span className="text-sm font-extrabold text-slate-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                      {score.total_score} pts
                    </span>
                  </div>

                  {/* Individual breakdown sliders */}
                  <div className="space-y-2">
                    {/* Env */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Environmental</span>
                        <span className="text-emerald-600 font-bold">{score.environmental_score}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${score.environmental_score}%` }}></div>
                      </div>
                    </div>

                    {/* Soc */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Social / CSR Participation</span>
                        <span className="text-blue-600 font-bold">{score.social_score}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${score.social_score}%` }}></div>
                      </div>
                    </div>

                    {/* Gov */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Corporate Governance</span>
                        <span className="text-amber-600 font-bold">{score.governance_score}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${score.governance_score}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
