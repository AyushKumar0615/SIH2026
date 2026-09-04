import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReminderService, formatTime12h, REMINDER_CATEGORY_ICONS } from '../../services/reminderService';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useTranslation } from '../../hooks/useTranslation';
import { Plus, Clock, Trash2, Pencil, CheckCircle2, X, Bell } from 'lucide-react';

const categories = Object.keys(REMINDER_CATEGORY_ICONS);
const categoryLabelKeys = { Medication: 'categoryMedication', Meals: 'categoryMeals', Activity: 'categoryActivity', Family: 'categoryFamilyCall' };
const initialForm = { title: '', time: '17:00', category: 'Medication' };

export default function RoutineManager({ session, userName = 'Guest', routines, setRoutines, isLoading, loadError, onRetry }) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useScrollReveal();

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setFormError('');
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (r) => {
    setEditingId(r.id);
    setForm({ title: r.title, time: r.time, category: r.category });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (!form.title.trim()) {
      setFormError(t('reminderTitleRequired'));
      return;
    }
    setFormError('');
    setIsSaving(true);
    const payload = { title: form.title, time: form.time, category: form.category, icon: REMINDER_CATEGORY_ICONS[form.category] };

    if (editingId) {
      const result = await ReminderService.updateReminder(editingId, payload);
      setIsSaving(false);
      if (!result.ok) {
        setFormError(result.error || t('reminderSaveError'));
        return;
      }
      setRoutines((prev) => prev.map((r) => (r.id === editingId ? result.reminder : r)));
    } else {
      const result = await ReminderService.addReminder(session.id, payload);
      setIsSaving(false);
      if (!result.ok) {
        setFormError(result.error || t('reminderSaveError'));
        return;
      }
      setRoutines((prev) => [...prev, result.reminder].sort((a, b) => a.time.localeCompare(b.time)));
    }
    closeForm();
  };

  const handleDelete = async (id) => {
    const prevRoutines = routines;
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    const result = await ReminderService.deleteReminder(id);
    if (!result.ok) setRoutines(prevRoutines);
  };

  const toggleComplete = async (r) => {
    const nextCompleted = !r.isCompleted;
    setRoutines((prev) => prev.map((x) => (x.id === r.id ? { ...x, isCompleted: nextCompleted } : x)));
    const result = await ReminderService.updateReminder(r.id, { isCompleted: nextCompleted });
    if (!result.ok) {
      setRoutines((prev) => prev.map((x) => (x.id === r.id ? { ...x, isCompleted: r.isCompleted } : x)));
    }
  };

  const renderForm = () => (
    <AnimatePresence>
      {showForm && (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6" style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}>
            <div>
              <label className="field-label">{t('titleFieldLabel')}</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Blood Pressure Tablet" className="input" required />
            </div>
            <div>
              <label className="field-label">{t('timeLabel')}</label>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="field-label">{t('categoryFieldLabel')}</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select">
                {categories.map((cat) => (<option key={cat} value={cat}>{t(categoryLabelKeys[cat])}</option>))}
              </select>
            </div>
          </div>

          {formError && <div className="notice-strip is-alert mt-4 text-sm" style={{ color: 'var(--alert)' }} role="alert">{formError}</div>}

          <div className="flex justify-end gap-3 pt-5">
            <button type="button" onClick={closeForm} className="btn btn-quiet">{t('cancel')}</button>
            <button type="submit" disabled={isSaving} className="btn btn-ember">{isSaving ? t('savingReminder') : t('saveReminder')}</button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );

  let body;
  if (isLoading) {
    body = <div className="py-16 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>{t('remindersLoading')}</div>;
  } else if (loadError && routines.length === 0) {
    body = (
      <div className="notice-strip is-alert flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <p className="text-sm" style={{ color: 'var(--alert)' }}>{loadError}</p>
        <button type="button" onClick={onRetry} className="btn btn-line shrink-0">{t('retry')}</button>
      </div>
    );
  } else if (routines.length === 0 && !showForm) {
    body = (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="panel-light p-8 sm:p-10 text-center space-y-5 max-w-lg mx-auto"
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(226,112,58,0.15)', color: 'var(--ember-deep)' }}>
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-medium">{t('noRemindersYetTitle')}</h3>
          <p className="text-sm mt-2" style={{ color: 'rgba(23,20,15,0.6)' }}>{t('noRemindersYetDesc')}</p>
        </div>
        <button type="button" onClick={openAddForm} className="btn btn-on-light">
          <Plus className="w-4 h-4" /> {t('addReminder')}
        </button>
      </motion.div>
    );
  } else {
    body = (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="index-list">
        {routines.map((r) => {
          const categoryLabel = categoryLabelKeys[r.category] ? t(categoryLabelKeys[r.category]) : r.category;
          return (
            <div key={r.id} className="index-row !cursor-default" style={r.isCompleted ? { opacity: 0.5 } : undefined}>
              <span className="index-icon">{r.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--ember)' }}><Clock className="w-3.5 h-3.5" /> {formatTime12h(r.time)} · {categoryLabel}</span>
                <span className={`font-display text-lg font-medium block mt-0.5 truncate ${r.isCompleted ? 'line-through' : ''}`}>{r.title}</span>
              </span>
              <button type="button" onClick={() => openEditForm(r)} className="p-2 rounded-full shrink-0" style={{ color: 'var(--ink-faint)' }} title={t('editTooltip')}>
                <Pencil className="w-4.5 h-4.5" />
              </button>
              <button type="button" onClick={() => handleDelete(r.id)} className="p-2 rounded-full shrink-0" style={{ color: 'var(--alert)' }} title={t('deleteTooltip')}>
                <Trash2 className="w-4.5 h-4.5" />
              </button>
              <button type="button" onClick={() => toggleComplete(r)} className="shrink-0">
                <CheckCircle2 className="w-6 h-6" style={{ color: r.isCompleted ? 'var(--jade)' : 'var(--hairline-strong)' }} />
              </button>
            </div>
          );
        })}
      </motion.div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      <div className="flex items-center justify-between gap-4 scroll-reveal">
        <div>
          <h3 className="font-display text-xl md:text-2xl font-medium">{t('routinesAndReminders')}</h3>
          <p className="pin mt-1">{t('configureAlertsFor')} {userName}</p>
        </div>
        {!isLoading && !(loadError && routines.length === 0) && (
          <button type="button" onClick={() => (showForm ? closeForm() : openAddForm())} className="btn btn-ember shrink-0">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? t('close') : t('addReminder')}
          </button>
        )}
      </div>

      {renderForm()}

      {loadError && routines.length > 0 && (
        <div className="notice-strip is-alert text-sm" style={{ color: 'var(--alert)' }} role="alert">{loadError}</div>
      )}

      {body}
    </div>
  );
}
