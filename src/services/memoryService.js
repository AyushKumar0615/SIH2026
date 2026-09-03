import { supabase } from './supabaseClient';

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    relation: row.relation || '',
    category: row.category,
    description: row.description || '',
    voiceNote: row.voice_note || '',
    favoriteMemory: row.favorite_memory || '',
    photoUrl: row.photo_url || null
  };
}

export const MemoryService = {
  async listMemories(userId) {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { ok: false, error: error.message };
    return { ok: true, memories: (data || []).map(fromRow) };
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
