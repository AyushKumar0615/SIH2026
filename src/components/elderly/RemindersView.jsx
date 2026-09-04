import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, Plus, X, Pencil, Trash2, Bell } from 'lucide-react';
import { ReminderService, formatTime12h } from '../../services/reminderService';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Magnetic from '../common/Magnetic';
import { useTranslation } from '../../hooks/useTranslation';

const CATEGORY_ICONS = { Medication: '💊', Meals: '🍛', Activity: '🔔', Family: '📞' };
const categoryLabelKeys = { Medication: 'categoryMedication', Meals: 'categoryMeals', Activity: 'categoryActivity', Family: 'categoryFamilyCall' };
const categories = Object.keys(CATEGORY_ICONS);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayLabelKeys = { Sun: 'dayAbbrSun', Mon: 'dayAbbrMon', Tue: 'dayAbbrTue', Wed: 'dayAbbrWed', Thu: 'dayAbbrThu', Fri: 'dayAbbrFri', Sat: 'dayAbbrSat' };

const initialForm = { title: '', notes: '', time: '09:00', category: 'Activity', repeatFrequency: 'Daily', daysOfWeek: [], isActive: true };

export default function RemindersView({ session, onBack }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useScrollReveal();

  const loadReminders = useCallback(async () => {
    if (!session?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError('');
    const result = await ReminderService.listReminders(session.id);
    if (!result.ok) {
      setLoadError(result.error || t('remindersLoadError'));
      setIsLoading(false);
      return;
    }
    setItems(result.reminders);
    setIsLoading(false);
  }, [session?.id, t]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const completedCount = items.filter((i) => i.isCompleted).length;

  const toggleComplete = async (item) => {
    const nextCompleted = !item.isCompleted;
    setItems((prev) => prev.map((r) => (r.id === item.id ? { ...r, isCompleted: nextCompleted } : r)));
    const result = await ReminderService.updateReminder(item.id, { isCompleted: nextCompleted });
    if (!result.ok) {
      setItems((prev) => prev.map((r) => (r.id === item.id ? { ...r, isCompleted: item.isCompleted } : r)));
      setLoadError(result.error || t('reminderSaveError'));
    }
  };

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

  const openEditForm = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      notes: item.notes,
      time: item.time,
      category: item.category,
      repeatFrequency: item.repeatFrequency,
      daysOfWeek: item.daysOfWeek,
      isActive: item.isActive
    });
    setFormError('');
    setShowForm(true);
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day) ? f.daysOfWeek.filter((d) => d !== day) : [...f.daysOfWeek, day]
    }));
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

    const payload = { ...form, icon: CATEGORY_ICONS[form.category] };

    if (editingId) {
      const result = await ReminderService.updateReminder(editingId, payload);
      setIsSaving(false);
      if (!result.ok) {
        setFormError(result.error || t('reminderSaveError'));
        return;
      }
      setItems((prev) => prev.map((r) => (r.id === editingId ? result.reminder : r)));
    } else {
      const result = await ReminderService.addReminder(session.id, payload);
      setIsSaving(false);
      if (!result.ok) {
        setFormError(result.error || t('reminderSaveError'));
        return;
      }
      setItems((prev) => [...prev, result.reminder].sort((a, b) => a.time.localeCompare(b.time)));
    }
    closeForm();
  };

  const handleDelete = async (id) => {
    const prevItems = items;
    setItems((prev) => prev.filter((r) => r.id !== id));
    const result = await ReminderService.deleteReminder(id);
    if (!result.ok) {
      setItems(prevItems);
      setLoadError(result.error || t('reminderSaveError'));
    }
  };

  const renderForm = () => (
    <AnimatePresence>
      {showForm && (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6" style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}>
            <div>
              <label className="field-label">{t('titleFieldLabel')}</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('titleFieldLabel')} className="input" required />
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
            <div className="sm:col-span-2">
              <label className="field-label">{t('reminderNotesLabel')}</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" />
            </div>
            <div>
              <label className="field-label">{t('reminderRepeatLabel')}</label>
              <select value={form.repeatFrequency} onChange={(e) => setForm({ ...form, repeatFrequency: e.target.value })} className="select">
                <option value="Once">{t('repeatOnce')}</option>
                <option value="Daily">{t('repeatDaily')}</option>
                <option value="Weekly">{t('repeatWeekly')}</option>
              </select>
            </div>

            {form.repeatFrequency === 'Weekly' && (
              <div className="sm:col-span-3">
                <label className="field-label">{t('reminderDaysLabel')}</label>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {DAYS.map((day) => (
                    <button
                      key={day} type="button" onClick={() => toggleDay(day)}
                      className="btn !min-h-8 !px-3 !py-1 text-xs"
                      style={form.daysOfWeek.includes(day)
                        ? { background: 'var(--ember)', color: '#1a0f08', borderColor: 'var(--ember)' }
                        : { background: 'transparent', border: '1px solid var(--hairline-strong)', color: 'var(--ink-soft)' }}
                    >
                      {t(dayLabelKeys[day])}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="sm:col-span-3 flex items-center gap-2.5 pt-1">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm font-medium">{t('reminderActiveLabel')}</span>
            </label>
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
    body = <div className="py-20 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>{t('remindersLoading')}</div>;
  } else if (loadError && items.length === 0) {
    body = (
      <div className="notice-strip is-alert flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <p className="text-sm" style={{ color: 'var(--alert)' }}>{loadError}</p>
        <button type="button" onClick={loadReminders} className="btn btn-line shrink-0">{t('retry')}</button>
      </div>
    );
  } else if (items.length === 0 && !showForm) {
    body = (
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="panel-light p-9 sm:p-12 text-center space-y-6 max-w-xl mx-auto"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(226,112,58,0.15)', color: 'var(--ember-deep)' }}>
          <Bell className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-display text-2xl sm:text-3xl font-medium">{t('noRemindersYetTitle')}</h3>
          <p className="text-sm mt-2" style={{ color: 'rgba(23,20,15,0.6)' }}>{t('noRemindersYetDesc')}</p>
        </div>
        <Magnetic strength={0.15} className="inline-block">
          <button type="button" onClick={openAddForm} className="btn btn-on-light">
            <Plus className="w-4.5 h-4.5" /> {t('addReminder')}
          </button>
        </Magnetic>
      </motion.div>
    );
  } else {
    body = (
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="index-list"
      >
        {items.map((item) => (
          <div key={item.id} className="index-row !cursor-default" style={item.isCompleted ? { opacity: 0.5 } : undefined}>
            <span className="index-icon">{item.icon}</span>
            <button type="button" onClick={() => toggleComplete(item)} className="flex-1 min-w-0 text-left">
              <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--ember)' }}>
                <Clock className="w-3.5 h-3.5" /> {formatTime12h(item.time)}
              </span>
              <span className={`font-display text-xl font-medium block mt-0.5 ${item.isCompleted ? 'line-through' : ''}`}>{item.title}</span>
              {item.notes && <span className="text-sm block mt-0.5 truncate" style={{ color: 'var(--ink-faint)' }}>{item.notes}</span>}
            </button>
            <button type="button" onClick={() => openEditForm(item)} className="p-2 rounded-full shrink-0" style={{ color: 'var(--ink-faint)' }} title={t('editTooltip')}>
              <Pencil className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => handleDelete(item.id)} className="p-2 rounded-full shrink-0" style={{ color: 'var(--alert)' }} title={t('deleteTooltip')}>
              <Trash2 className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => toggleComplete(item)} className="shrink-0">
              <CheckCircle2 className="w-7 h-7" style={{ color: item.isCompleted ? 'var(--jade)' : 'var(--hairline-strong)' }} />
            </button>
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <div ref={containerRef} className="page max-w-2xl">
      <button type="button" onClick={onBack} className="btn btn-quiet !flex !px-0 mb-8"><ArrowLeft className="w-4 h-4" /> {t('back')}</button>

      <div className="flex items-end justify-between gap-4 mb-2">
        <div>
          <span className="eyebrow">{t('dailySchedule')}</span>
          <h2 className="font-display text-3xl md:text-4xl font-medium mt-3">{t('myReminders')}</h2>
        </div>
        {items.length > 0 && <span className="figure-value shrink-0" style={{ color: 'var(--jade)' }}>{completedCount}/{items.length}</span>}
      </div>

      {items.length > 0 && (
        <div className="progress-track my-6"><div className="progress-fill" style={{ width: `${(completedCount / items.length) * 100}%` }} /></div>
      )}

      {!isLoading && !(loadError && items.length === 0) && (
        <div className="flex justify-end mb-4">
          <button type="button" onClick={() => (showForm ? closeForm() : openAddForm())} className="btn btn-quiet shrink-0 !px-0" style={{ color: 'var(--ember)' }}>
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? t('close') : t('addReminder')}
          </button>
        </div>
      )}

      {renderForm()}

      {loadError && items.length > 0 && (
        <div className="notice-strip is-alert mb-4 text-sm" style={{ color: 'var(--alert)' }} role="alert">{loadError}</div>
      )}

      {body}
    </div>
  );
}
