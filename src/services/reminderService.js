import { supabase } from './supabaseClient';

export const REMINDER_CATEGORY_ICONS = { Medication: '💊', Meals: '🍛', Activity: '🔔', Family: '📞' };

export function formatTime12h(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes || '',
    time: row.time,
    category: row.category,
    icon: row.icon || '🔔',
    repeatFrequency: row.repeat_frequency,
    daysOfWeek: row.days_of_week || [],
    isActive: row.is_active,
    isCompleted: row.is_completed,
    createdAt: row.created_at
  };
}

export const ReminderService = {
  async listReminders(userId) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('time', { ascending: true });

    if (error) return { ok: false, error: error.message };
    return { ok: true, reminders: (data || []).map(fromRow) };
  },

  async addReminder(userId, payload) {
    const row = {
      user_id: userId,
      title: payload.title.trim(),
      notes: payload.notes?.trim() || null,
      time: payload.time,
      category: payload.category,
      icon: payload.icon || '🔔',
      repeat_frequency: payload.repeatFrequency,
      days_of_week: payload.repeatFrequency === 'Weekly' ? payload.daysOfWeek || [] : [],
      is_active: payload.isActive !== false
    };

    const { data, error } = await supabase.from('reminders').insert(row).select().single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, reminder: fromRow(data) };
  },

  async updateReminder(reminderId, updates) {
    const row = {};
    if (updates.title !== undefined) row.title = updates.title.trim();
    if (updates.notes !== undefined) row.notes = updates.notes?.trim() || null;
    if (updates.time !== undefined) row.time = updates.time;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.icon !== undefined) row.icon = updates.icon;
    if (updates.repeatFrequency !== undefined) {
      row.repeat_frequency = updates.repeatFrequency;
      row.days_of_week = updates.repeatFrequency === 'Weekly' ? updates.daysOfWeek || [] : [];
    } else if (updates.daysOfWeek !== undefined) {
      row.days_of_week = updates.daysOfWeek;
    }
    if (updates.isActive !== undefined) row.is_active = updates.isActive;
    if (updates.isCompleted !== undefined) row.is_completed = updates.isCompleted;

    const { data, error } = await supabase.from('reminders').update(row).eq('id', reminderId).select().single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, reminder: fromRow(data) };
  },

  async deleteReminder(reminderId) {
    const { error } = await supabase.from('reminders').delete().eq('id', reminderId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
};
