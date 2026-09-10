import { supabase } from './supabaseClient';
import { OfflineStore, isNetworkError, withTimeout } from './offlineStore';
import { WriteQueueService, registerSyncHandler } from './writeQueueService';

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    relation: row.relation || '',
    category: row.category,
    description: row.description || '',
    voiceNote: row.voice_note || '',
    favoriteMemory: row.favorite_memory || '',
    photoUrl: row.photo_url || null,
    createdAt: row.created_at
  };
}

export const MemoryService = {
  async listMemories(userId) {
    const cacheKey = `memories:${userId}`;
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      const cached = await OfflineStore.get(cacheKey);
      if (cached) return { ok: true, memories: cached.data, fromCache: true, cachedAt: cached.cachedAt };
      return { ok: false, error: error.message };
    }

    const memories = (data || []).map(fromRow);
    OfflineStore.set(cacheKey, memories);
    return { ok: true, memories, fromCache: false };
  },

  // Client-generated id for the same reason as ReminderService.addReminder:
  // it's what makes a queued retry safe (a duplicate-key response means
  // "already inserted," not a failure) without any schema change — `id`
  // was already a plain `uuid primary key default gen_random_uuid()`.
  async addMemory(userId, payload) {
    const row = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: payload.name.trim(),
      relation: payload.relation?.trim() || null,
      category: payload.category,
      description: payload.description?.trim() || null,
      voice_note: payload.voiceNote?.trim() || null,
      favorite_memory: payload.favoriteMemory?.trim() || null,
      photo_url: payload.photoUrl || null
    };

    const { data, error } = await withTimeout(supabase.from('memories').insert(row).select().single());
    if (error) {
      if (isNetworkError(error)) {
        await WriteQueueService.enqueue({ type: 'addMemory', row });
        return { ok: true, memory: fromRow(row), queued: true };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, memory: fromRow(data) };
  },

  // ─── Offline-queue retry handler — called only by writeQueueService.js ───
  async _syncCreateMemory(row) {
    const { error } = await supabase.from('memories').insert(row);
    if (!error || error.code === '23505') return { ok: true };
    return { ok: false, retry: isNetworkError(error), message: error.message };
  }
};

registerSyncHandler('addMemory', (entry) => MemoryService._syncCreateMemory(entry.row));
