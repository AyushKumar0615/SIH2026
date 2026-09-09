import { supabase } from './supabaseClient';
import { OfflineStore } from './offlineStore';

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

  async addMemory(userId, payload) {
    const row = {
      user_id: userId,
      name: payload.name.trim(),
      relation: payload.relation?.trim() || null,
      category: payload.category,
      description: payload.description?.trim() || null,
      voice_note: payload.voiceNote?.trim() || null,
      favorite_memory: payload.favoriteMemory?.trim() || null,
      photo_url: payload.photoUrl || null
    };

    const { data, error } = await supabase.from('memories').insert(row).select().single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, memory: fromRow(data) };
  }
};
