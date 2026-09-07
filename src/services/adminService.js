import { supabase } from './supabaseClient';

function normalizeRole(role) {
  return (role || '').trim().toLowerCase();
}

// Small shared formatter so admin timestamps render consistently
// instead of each caller calling toLocaleString() ad hoc.
export function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

const USERS_PAGE_SIZE = 20;

export const AdminService = {
  async getPlatformStats() {
    const [profilesRes, remindersRes, memoriesRes, connectionsRes] = await Promise.all([
      supabase.from('profiles').select('role, state, is_active'),
      supabase.from('reminders').select('id', { count: 'exact', head: true }),
      supabase.from('memories').select('id', { count: 'exact', head: true }),
      supabase.from('caregiver_connections').select('status')
    ]);

    if (profilesRes.error || remindersRes.error || memoriesRes.error || connectionsRes.error) {
      return { ok: false, error: 'unknown' };
    }

    const profiles = profilesRes.data || [];
    const connections = connectionsRes.data || [];

    return {
      ok: true,
      stats: {
        totalUsers: profiles.length,
        activeUsers: profiles.filter((p) => p.is_active !== false).length,
        inactiveUsers: profiles.filter((p) => p.is_active === false).length,
        totalElders: profiles.filter((p) => normalizeRole(p.role) === 'elderly').length,
        totalCaregivers: profiles.filter((p) => normalizeRole(p.role) === 'caregiver').length,
        regionsActive: new Set(profiles.map((p) => p.state).filter(Boolean)).size,
        totalReminders: remindersRes.count || 0,
        totalMemories: memoriesRes.count || 0,
        activeConnections: connections.filter((c) => c.status === 'accepted').length
      }
    };
  },

  // Server-side search/filter/pagination — never fetches the whole
  // table client-side just to filter it in JS.
  async listUsers({ search = '', roleFilter = '', statusFilter = '', page = 0 } = {}) {
    let query = supabase
      .from('profiles')
      .select('id, full_name, role, state, language, is_active, connection_code, created_at', { count: 'exact' });

    if (search.trim()) query = query.ilike('full_name', `%${search.trim()}%`);
    if (roleFilter) query = query.eq('role', roleFilter);
    if (statusFilter === 'active') query = query.eq('is_active', true);
    if (statusFilter === 'inactive') query = query.eq('is_active', false);

    const from = page * USERS_PAGE_SIZE;
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + USERS_PAGE_SIZE - 1);

    if (error) return { ok: false, error: 'unknown' };
    return { ok: true, users: data || [], total: count || 0, pageSize: USERS_PAGE_SIZE };
  },

  async getUserConnections(userId) {
    const [asElderRes, asCaregiverRes] = await Promise.all([
      supabase.from('caregiver_connections').select('id, status, created_at, updated_at, caregiver_id').eq('elder_id', userId),
      supabase.from('caregiver_connections').select('id, status, created_at, updated_at, elder_id').eq('caregiver_id', userId)
    ]);

    if (asElderRes.error || asCaregiverRes.error) return { ok: false, error: 'unknown' };

    const asElder = asElderRes.data || [];
    const asCaregiver = asCaregiverRes.data || [];
    const otherIds = [...asElder.map((c) => c.caregiver_id), ...asCaregiver.map((c) => c.elder_id)];

    let profileById = new Map();
    if (otherIds.length > 0) {
      const { data, error } = await supabase.from('profiles').select('id, full_name, role').in('id', otherIds);
      if (error) return { ok: false, error: 'unknown' };
      profileById = new Map((data || []).map((p) => [p.id, p]));
    }

    return {
      ok: true,
      asElder: asElder.map((c) => ({ ...c, other: profileById.get(c.caregiver_id) || null })),
      asCaregiver: asCaregiver.map((c) => ({ ...c, other: profileById.get(c.elder_id) || null }))
    };
  },

  async getUserActivityCounts(userId) {
    const [remindersRes, memoriesRes] = await Promise.all([
      supabase.from('reminders').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('memories').select('id', { count: 'exact', head: true }).eq('user_id', userId)
    ]);
    if (remindersRes.error || memoriesRes.error) return { ok: false, error: 'unknown' };
    return { ok: true, reminderCount: remindersRes.count || 0, memoryCount: memoriesRes.count || 0 };
  },

  async setUserActive(userId, isActive) {
    const { error } = await supabase.rpc('admin_set_user_active', { p_user_id: userId, p_is_active: isActive });
    if (error) return { ok: false, error: 'unknown' };
    return { ok: true };
  },

  async disconnectConnection(connectionId) {
    const { error } = await supabase.rpc('admin_disconnect_connection', { p_connection_id: connectionId });
    if (error) return { ok: false, error: 'unknown' };
    return { ok: true };
  },

  async getRecentActivity(limit = 8) {
    const [remindersRes, memoriesRes, connectionsRes] = await Promise.all([
      supabase.from('reminders').select('id, title, created_at, user_id').order('created_at', { ascending: false }).limit(limit),
      supabase.from('memories').select('id, name, created_at, user_id').order('created_at', { ascending: false }).limit(limit),
      supabase.from('caregiver_connections').select('id, updated_at, elder_id, caregiver_id').eq('status', 'accepted').order('updated_at', { ascending: false }).limit(limit)
    ]);

    if (remindersRes.error || memoriesRes.error || connectionsRes.error) {
      return { ok: false, error: 'unknown' };
    }

    const reminders = remindersRes.data || [];
    const memories = memoriesRes.data || [];
    const connections = connectionsRes.data || [];

    const userIds = new Set();
    reminders.forEach((r) => userIds.add(r.user_id));
    memories.forEach((m) => userIds.add(m.user_id));
    connections.forEach((c) => { userIds.add(c.elder_id); userIds.add(c.caregiver_id); });

    let profileById = new Map();
    if (userIds.size > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', Array.from(userIds));
      if (profilesError) return { ok: false, error: 'unknown' };
      profileById = new Map((profilesData || []).map((p) => [p.id, p]));
    }

    const events = [
      ...reminders.map((r) => ({
        id: `reminder-${r.id}`,
        timestamp: r.created_at,
        actor: profileById.get(r.user_id) || null,
        kind: 'reminder',
        title: r.title
      })),
      ...memories.map((m) => ({
        id: `memory-${m.id}`,
        timestamp: m.created_at,
        actor: profileById.get(m.user_id) || null,
        kind: 'memory',
        title: m.name
      })),
      ...connections.map((c) => ({
        id: `connection-${c.id}`,
        timestamp: c.updated_at,
        actor: profileById.get(c.elder_id) || null,
        kind: 'connection',
        elderName: profileById.get(c.elder_id)?.full_name || '',
        caregiverName: profileById.get(c.caregiver_id)?.full_name || ''
      }))
    ];

    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return { ok: true, events: events.slice(0, limit) };
  }
};
