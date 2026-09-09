import { supabase } from './supabaseClient';
import { OfflineStore } from './offlineStore';

// Don't persist a new sample unless this much time has passed...
const THROTTLE_MS = 30000;
// ...or the elder has moved at least this far, whichever comes first.
const MIN_DISTANCE_METERS = 25;

// A location is "LIVE" if the newest sample is this fresh, "RECENT" up to
// the second window, and "OFFLINE" beyond that — never shown as live once
// stale, however old the underlying row.
const LIVE_WINDOW_MS = 2 * 60 * 1000;
const RECENT_WINDOW_MS = 30 * 60 * 1000;

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const LocationService = {
  THROTTLE_MS,
  MIN_DISTANCE_METERS,

  // Decides whether a freshly-read position is worth writing to Supabase,
  // so a watcher firing every few seconds doesn't turn into a write every
  // few seconds.
  shouldPersist(lastSample, next) {
    if (!lastSample) return true;
    const elapsed = next.timestamp - lastSample.timestamp;
    if (elapsed >= THROTTLE_MS) return true;
    return haversineMeters(lastSample.latitude, lastSample.longitude, next.latitude, next.longitude) >= MIN_DISTANCE_METERS;
  },

  async getSettings(elderId) {
    const { data, error } = await supabase.from('elder_location_settings').select('*').eq('elder_id', elderId).maybeSingle();
    if (error) return { ok: false, error: 'unknown' };
    return { ok: true, settings: data };
  },

  async upsertSettings(elderId, patch) {
    const { error } = await supabase.from('elder_location_settings').upsert({ elder_id: elderId, ...patch }, { onConflict: 'elder_id' });
    if (error) return { ok: false, error: 'unknown' };
    return { ok: true };
  },

  async recordLocation(elderId, { latitude, longitude, accuracy }) {
    const { error } = await supabase.from('elder_locations').insert({ elder_id: elderId, latitude, longitude, accuracy });
    if (error) return { ok: false, error: 'unknown' };
    await this.upsertSettings(elderId, { last_location_update: new Date().toISOString() });
    return { ok: true };
  },

  async getLatestLocation(elderId) {
    const cacheKey = `latest-location:${elderId}`;
    const { data, error } = await supabase
      .from('elder_locations')
      .select('*')
      .eq('elder_id', elderId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // NOTE: this does not touch LocationMap or attempt to cache map
      // tiles — only the last known coordinates, so the existing map
      // component can render its last-known-fix pin as usual while
      // offline. getLocationStatus() already labels anything this stale as
      // 'offline' on its own, independent of this cache.
      const cached = await OfflineStore.get(cacheKey);
      if (cached) return { ok: true, location: cached.data, fromCache: true, cachedAt: cached.cachedAt };
      return { ok: false, error: 'unknown' };
    }

    if (data) OfflineStore.set(cacheKey, data);
    return { ok: true, location: data, fromCache: false };
  },

  // Fires `onInsert(row)` for every new sample. Returns an unsubscribe
  // function — callers must call it on unmount to avoid leaking channels.
  subscribeToElderLocation(elderId, onInsert) {
    const channel = supabase
      .channel(`elder-location-${elderId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'elder_locations', filter: `elder_id=eq.${elderId}` }, (payload) => {
        onInsert(payload.new);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  // 'live' | 'recent' | 'offline' — purely a function of how old the
  // sample is, so a stale row is never presented as live.
  getLocationStatus(location) {
    if (!location) return 'offline';
    const age = Date.now() - new Date(location.recorded_at).getTime();
    if (age <= LIVE_WINDOW_MS) return 'live';
    if (age <= RECENT_WINDOW_MS) return 'recent';
    return 'offline';
  }
};
