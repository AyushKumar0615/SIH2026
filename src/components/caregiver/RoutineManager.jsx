import React, { useState } from 'react';
import { MOCK_ROUTINE_SCHEDULE } from '../../data/mockData';
import { Plus, Clock, Trash2 } from 'lucide-react';

export default function RoutineManager() {
  const [routines, setRoutines] = useState(MOCK_ROUTINE_SCHEDULE);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('05:00 PM');
  const [newCategory, setNewCategory] = useState('Medication');

  const handleAddRoutine = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEntry = {
      id: `r_${Date.now()}`,
      time: newTime,
      title: newTitle,
      category: newCategory,
      icon: newCategory === 'Medication' ? '💊' : newCategory === 'Meals' ? '🍛' : '🔔',
      completed: false,
      voicePrompt: `Reminder for ${newTitle} at ${newTime}.`
    };

    setRoutines([...routines, newEntry]);
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">Daily Routine & Reminder Manager</h3>
          <p className="text-sm text-slate-400 font-medium">Configure scheduled alerts and medication voice prompts for Kamala Devi</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Reminder
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddRoutine} className="glass-card p-6 border-2 border-teal-500/40 space-y-4">
          <h4 className="text-lg font-bold text-white">Configure New Reminder</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Reminder Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Take Blood Pressure Tablet"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-sm outline-none focus:border-teal-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Time</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="06:30 PM"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-sm outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-sm outline-none focus:border-teal-400"
              >
                <option value="Medication">Medication 💊</option>
                <option value="Meals">Meals 🍛</option>
                <option value="Activity">Activity 🧠</option>
                <option value="Family">Family Call 📞</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary py-2 px-4 text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2 px-6 text-xs font-extrabold">
              Save Reminder
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {routines.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl p-2.5 rounded-xl bg-slate-950 border border-slate-800">{r.icon}</span>
              <div>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {r.time} • {r.category}
                </span>
                <h4 className="text-lg font-extrabold text-white">{r.title}</h4>
              </div>
            </div>

            <button
              onClick={() => handleDelete(r.id)}
              className="p-2.5 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50 transition-all"
              title="Delete Reminder"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
