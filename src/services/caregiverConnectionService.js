import { supabase } from './supabaseClient';
import { OfflineStore, isNetworkError, withTimeout } from './offlineStore';
import { WriteQueueService, registerSyncHandler } from './writeQueueService';

const KNOWN_ERROR_CODES = [
  'invalid_code',
  'self_connection',
  'already_connected',
  'already_pending',
  'not_caregiver',
  'not_elder'
];

function mapRpcError(error) {
  const code = (error?.message || '').trim();
  return KNOWN_ERROR_CODES.includes(code) ? code : 'unknown';
}

function toProfileSummary(row) {
  if (!row) return null;
  return { id: row.id, fullName: row.full_name || '', avatar: row.avatar || null };
}

function toConnection(row, viewerRole) {
  return {
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    caregiver: viewerRole === 'elder' ? toProfileSummary(row.caregiver) : undefined,
    elder: viewerRole === 'caregiver' ? toProfileSummary(row.elder) : undefined
  };
}

// Read-cache helper (Tier 2) — mirrors reminderService's, kept local since
// the two list caches here use different key formats depending on viewer
// role (elder vs caregiver); callers pass whichever key they used to load
// the list they're mutating, so this stays agnostic to which side it is.
async function updateCachedConnections(cacheKey, mutate) {
  if (!cacheKey) return;
  const cached = await OfflineStore.get(cacheKey);
  if (!cached) return;
  await OfflineStore.set(cacheKey, mutate(cached.data));
}

// Same shape as mergeCachedReminder in reminderService.js — merges `patch`
// onto whatever's cached for this connection (falling back to just the id
// if nothing's cached yet) so the caller has something reasonable to
// render immediately, and persists that merge into the cache in the same
// pass so a reload while still offline shows the same thing.
async function mergeCachedConnection(cacheKey, connectionId, patch) {
  const cached = cacheKey ? await OfflineStore.get(cacheKey) : null;
  const existing = cached?.data.find((c) => c.id === connectionId);
  const merged = { ...(existing || { id: connectionId }), ...patch };
  if (cached) {
    await OfflineStore.set(cacheKey, cached.data.map((c) => (c.id === connectionId ? merged : c)));
  }
  return merged;
}

export const CaregiverConnectionService = {
  // Error codes this service can return, for translation by the caller:
  // 'invalid_code' | 'self_connection' | 'already_connected' | 'already_pending'
  // | 'not_caregiver' | 'not_elder' | 'unknown'

  async getMyConnectionCode(userId) {
    const { data, error } = await supabase.from('profiles').select('connection_code').eq('id', userId).single();
    if (error) return { ok: false, error: 'unknown' };
    if (data?.connection_code) return { ok: true, code: data.connection_code };
    return this.regenerateCode();
  },

  async regenerateCode() {
    const { data, error } = await supabase.rpc('regenerate_connection_code');
    if (error) return { ok: false, error: mapRpcError(error) };
    return { ok: true, code: data };
  },

  async listCaregiversForElder(elderId) {
    const cacheKey = `caregivers-for-elder:${elderId}`;
    const { data, error } = await supabase
      .from('caregiver_connections')
      .select('id, status, created_at, updated_at, caregiver:profiles!caregiver_connections_caregiver_id_fkey(id, full_name, avatar)')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false });

    if (error) {
      const cached = await OfflineStore.get(cacheKey);
      if (cached) return { ok: true, connections: cached.data, fromCache: true, cachedAt: cached.cachedAt };
      return { ok: false, error: 'unknown' };
    }

    const connections = (data || []).map((row) => toConnection(row, 'elder'));
    OfflineStore.set(cacheKey, connections);
    return { ok: true, connections, fromCache: false };
  },

  async listEldersForCaregiver(caregiverId) {
    const cacheKey = `elders-for-caregiver:${caregiverId}`;
    const { data, error } = await supabase
      .from('caregiver_connections')
      .select('id, status, created_at, updated_at, elder:profiles!caregiver_connections_elder_id_fkey(id, full_name, avatar)')
      .eq('caregiver_id', caregiverId)
      .order('created_at', { ascending: false });

    if (error) {
      const cached = await OfflineStore.get(cacheKey);
      if (cached) return { ok: true, connections: cached.data, fromCache: true, cachedAt: cached.cachedAt };
      return { ok: false, error: 'unknown' };
    }

    const connections = (data || []).map((row) => toConnection(row, 'caregiver'));
    OfflineStore.set(cacheKey, connections);
    return { ok: true, connections, fromCache: false };
  },

  async requestConnection(code) {
    const trimmed = (code || '').trim();
    if (!/^\d{6}$/.test(trimmed)) return { ok: false, error: 'invalid_code' };
    const { data, error } = await supabase.rpc('request_caregiver_connection', { p_code: trimmed });
    if (error) return { ok: false, error: mapRpcError(error) };
    const row = Array.isArray(data) ? data[0] : data;
    return { ok: true, elderId: row?.elder_id, elderName: row?.elder_name, connectionId: row?.connection_id };
  },

  // `cacheKey` should be `caregivers-for-elder:<elderId>` — the same cache
  // this connection was loaded from — used only to keep that cache in sync;
  // omitting it just skips the cache update.
  //
  // Safe to queue offline for the same reason disconnect/updateReminder
  // are: this is a single-column overwrite (`status`), so a retried replay
  // either applies the same value again (no-op) or, if the row's since been
  // removed (e.g. the caregiver withdrew, or it was already resolved from
  // another device), affects 0 rows — see _syncRespondToRequest, which
  // treats that as a resolved state rather than a failure. RLS ("elder
  // responds to own requests": auth.uid() = elder_id) is unchanged and
  // still the real authorization boundary — queuing never bypasses it, it
  // just defers the same authenticated call.
  async respondToRequest(connectionId, status, cacheKey) {
    const { data, error } = await withTimeout(
      supabase
        .from('caregiver_connections')
        .update({ status })
        .eq('id', connectionId)
        .select('id, status, created_at, updated_at, caregiver:profiles!caregiver_connections_caregiver_id_fkey(id, full_name, avatar)')
        .single()
    );
    if (error) {
      if (isNetworkError(error)) {
        // A double-tap on Accept/Reject before the first call resolves
        // would otherwise queue the same response twice.
        const alreadyQueued = await WriteQueueService.hasQueued('respondToRequest', (e) => e.connectionId === connectionId);
        // NOTE: the queued entry's field is deliberately named
        // `responseStatus`, not `status` — `status` is a reserved field the
        // queue engine itself writes (WriteQueueService.enqueue sets
        // `status: 'pending'`/'failed' for its own retry bookkeeping,
        // *after* spreading this object in), so naming this field `status`
        // would silently get clobbered by the engine's own value.
        if (!alreadyQueued) await WriteQueueService.enqueue({ type: 'respondToRequest', connectionId, responseStatus: status });
        const optimistic = await mergeCachedConnection(cacheKey, connectionId, { status });
        return { ok: true, connection: optimistic, queued: true };
      }
      return { ok: false, error: 'unknown' };
    }
    const connection = toConnection(data, 'elder');
    await updateCachedConnections(cacheKey, (list) => list.map((c) => (c.id === connectionId ? connection : c)));
    return { ok: true, connection };
  },

  // Plain update (no .select().single()) — same reasoning as
  // _syncDisconnect: if the request's since been withdrawn/removed, 0 rows
  // affected is a resolved state, not a failure to retry forever.
  async _syncRespondToRequest(connectionId, status) {
    const { error } = await supabase.from('caregiver_connections').update({ status }).eq('id', connectionId);
    if (!error) return { ok: true };
    return { ok: false, retry: isNetworkError(error), message: error.message };
  },

  // `cacheKey` should be whichever of `caregivers-for-elder:<id>` /
  // `elders-for-caregiver:<id>` the caller used to load the list this
  // connection came from — used only to keep that read-cache in sync, so
  // omitting it just skips the cache update rather than failing.
  async disconnect(connectionId, cacheKey) {
    const { error } = await withTimeout(supabase.from('caregiver_connections').delete().eq('id', connectionId));
    if (error) {
      if (isNetworkError(error)) {
        const alreadyQueued = await WriteQueueService.hasQueued('disconnectConnection', (e) => e.connectionId === connectionId);
        if (!alreadyQueued) await WriteQueueService.enqueue({ type: 'disconnectConnection', connectionId });
        await updateCachedConnections(cacheKey, (list) => list.filter((c) => c.id !== connectionId));
        return { ok: true, queued: true };
      }
      return { ok: false, error: 'unknown' };
    }
    await updateCachedConnections(cacheKey, (list) => list.filter((c) => c.id !== connectionId));
    return { ok: true };
  },

  // Deleting an already-gone connection affects 0 rows and isn't an error —
  // "already disconnected" is success, no special-casing needed. RLS still
  // gates this exactly as it does the online path (only the elder or
  // caregiver on the row may delete it) — queuing never bypasses that.
  async _syncDisconnect(connectionId) {
    const { error } = await supabase.from('caregiver_connections').delete().eq('id', connectionId);
    if (!error) return { ok: true };
    return { ok: false, retry: isNetworkError(error), message: error.message };
  }
};

registerSyncHandler('disconnectConnection', (entry) => CaregiverConnectionService._syncDisconnect(entry.connectionId));
registerSyncHandler('respondToRequest', (entry) => CaregiverConnectionService._syncRespondToRequest(entry.connectionId, entry.responseStatus));
