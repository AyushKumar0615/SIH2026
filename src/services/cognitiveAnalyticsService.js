import { supabase } from './supabaseClient';

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toSession(row) {
  return {
    id: row.id, gameId: row.game_id, domain: row.domain, score: number(row.score),
    accuracy: number(row.accuracy), bestStreak: number(row.best_streak),
    difficultyLevel: number(row.difficulty_level), completionTimeSeconds: number(row.completion_time_seconds), completedAt: row.completed_at,
    analysisStatus: row.analysis_status || 'pending', analysis: row.analysis || null
  };
}

export const CognitiveAnalyticsService = {
  async recordSession(userId, payload) {
    if (!userId) return { ok: false, error: 'Missing signed-in user.' };
    const row = {
      user_id: userId,
      game_id: String(payload.gameId || ''),
      domain: String(payload.domain || ''),
      score: Math.max(0, Math.round(number(payload.score))),
      accuracy: Math.max(0, Math.min(100, Math.round(number(payload.accuracy) * 100) / 100)),
      best_streak: Math.max(0, Math.round(number(payload.bestStreak))),
      difficulty_level: Math.max(1, Math.min(5, Math.round(number(payload.difficultyLevel)))),
      completion_time_seconds: Math.max(0, Math.round(number(payload.completionTimeSeconds)))
    };
    if (!row.game_id || !row.domain) return { ok: false, error: 'Incomplete game result.' };
    const { data, error } = await supabase.from('game_sessions').insert(row).select('id, game_id, domain, score, accuracy, best_streak, difficulty_level, completion_time_seconds, completed_at, analysis_status, analysis').single();
    return error ? { ok: false, error: error.message } : { ok: true, session: toSession(data) };
  },

  async requestAnalysis(sessionId) {
    if (!sessionId) return { ok: false, error: 'No completed game session.' };
    const { data, error } = await supabase.functions.invoke('analyze-cognitive-sessions', { body: { sessionId } });
    if (error) {
      let code = 'analysis_request_failed';
      try { code = (await error.context.json())?.error || code; } catch {}
      return { ok: false, error: code };
    }
    if (data?.status === 'processing') return { ok: true, status: 'processing' };
    if (data?.status !== 'ready' || !data.analysis) return { ok: false, error: data?.error || 'analysis_request_failed' };
    return { ok: true, status: 'ready', analysis: data.analysis };
  },

  async listSessions(elderId) {
    if (!elderId) return { ok: false, error: 'No elder selected.' };
    const { data, error } = await supabase
      .from('game_sessions')
      .select('id, game_id, domain, score, accuracy, best_streak, difficulty_level, completion_time_seconds, completed_at, analysis_status, analysis')
      .eq('user_id', elderId)
      .order('completed_at', { ascending: false })
      .limit(50);
    if (error) return { ok: false, error: error.message };
    return { ok: true, sessions: (data || []).map(toSession) };
  }
};
