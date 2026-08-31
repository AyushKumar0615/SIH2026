import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MOCK_ROUTINE_SCHEDULE } from '../../data/mockData';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Plus, Clock, Trash2, X } from 'lucide-react';

export default function RoutineManager({ userName = 'Guest' }) {
  const [routines, setRoutines] = useState(MOCK_ROUTINE_SCHEDULE);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('05:00 PM');
  const [newCategory, setNewCategory] = useState('Medication');
  const containerRef = useScrollReveal();

  const handleAddRoutine = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setRoutines([...routines, {
      id: `r_${Date.now()}`, time: newTime, title: newTitle, category: newCategory,
      icon: newCategory === 'Medication' ? '💊' : newCategory === 'Meals' ? '🍛' : '🔔',
      completed: false, voicePrompt: `Reminder for ${newTitle} at ${newTime}.`
    }]);
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleDelete = (id) => setRoutines(routines.filter((r) => r.id !== id));

  return (
    <div ref={containerRef} className="space-y-8">
      <div className="flex items-center justify-between gap-4 scroll-reveal">
        <div>
          <h3 className="font-display text-xl md:text-2xl font-medium">Routines & Reminders</h3>
          <p className="pin mt-1">Configure scheduled alerts for {userName}</p>
        </div>
        <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="btn btn-ember shrink-0">
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showAddForm ? 'Close' : 'Add Reminder'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            onSubmit={handleAddRoutine}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6" style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}>
              <div>
                <label className="field-label">Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Blood Pressure Tablet" className="input" required />
              </div>
              <div>
                <label className="field-label">Time</label>
                <input type="text" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="06:30 PM" className="input" />
              </div>
              <div>
                <label className="field-label">Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="select">
                  <option value="Medication">Medication</option>
                  <option value="Meals">Meals</option>
                  <option value="Activity">Activity</option>
                  <option value="Family">Family Call</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-5">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-quiet">Cancel</button>
              <button type="submit" className="btn btn-ember">Save Reminder</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="index-list scroll-reveal" data-reveal-delay="1">
        {routines.map((r) => (
          <div key={r.id} className="index-row !cursor-default">
            <span className="index-icon">{r.icon}</span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--ember)' }}><Clock className="w-3.5 h-3.5" /> {r.time} · {r.category}</span>
              <span className="font-display text-lg font-medium block mt-0.5 truncate">{r.title}</span>
            </span>
            <button type="button" onClick={() => handleDelete(r.id)} className="p-2 rounded-full shrink-0" style={{ color: 'var(--alert)' }} title="Delete">
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
