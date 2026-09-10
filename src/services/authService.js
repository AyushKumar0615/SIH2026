import { supabase } from './supabaseClient';
import { normalizeRole, isPublicRegistrationRole } from '../access/permissions';
import { OfflineStore, isNetworkError, withTimeout } from './offlineStore';
import { WriteQueueService, registerSyncHandler } from './writeQueueService';

function toSession(user, profile) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || '',
    // normalizeRole falls back to the least-privileged role for anything
    // missing/unrecognized (e.g. a failed profile fetch) instead of
    // silently granting a more privileged default.
    role: normalizeRole(profile?.role),
    state: profile?.state || '',
    language: profile?.language || 'as',
    avatar: profile?.avatar || null
  };
}

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) {
    // Deliberately narrow: only `avatar` gets a cached fallback here, not
    // role/full_name/state — those stay exactly as unavailable-when-offline
    // as they already were (out of scope: role is a permission concern,
    // not something this offline pass touches). This exists purely so a
    // page reload while offline doesn't revert a just-changed avatar back
    // to blank, matching Tier 3's "avatar survives a refresh" requirement.
    if (isNetworkError(error)) {
      const cachedAvatar = await OfflineStore.get(`avatar:${userId}`);
      if (cachedAvatar) return { avatar: cachedAvatar.data };
    }
    return null;
  }
  // Opportunistically keep that same fallback warm on every successful
  // fetch, the same read-through pattern the other services already use.
  OfflineStore.set(`avatar:${userId}`, data.avatar ?? null);
  return data;
}

export const AuthService = {
  async getSession() {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) return null;
    const profile = await fetchProfile(user.id);
    return toSession(user, profile);
  },

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    const profile = await fetchProfile(data.user.id);
    return { ok: true, session: toSession(data.user, profile) };
  },

  async register(payload) {
    // Client-side fail-fast for a tampered/modified registration request —
    // a friendly error instead of a raw database error. This is NOT the
    // real security boundary: the "insert own profile" RLS policy rejects
    // role='admin' at the database layer regardless of what's sent here.
    if (!isPublicRegistrationRole(payload.role)) {
      return { ok: false, error: 'Please choose a valid account type.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim(),
      password: payload.password
    });

    if (error) {
      return { ok: false, error: error.message.includes('already registered') ? 'An account with this email already exists.' : error.message };
    }

    const user = data.user;
    if (!user) {
      return { ok: false, error: 'Registration failed. Please try again.' };
    }

    const profileRow = {
      id: user.id,
      full_name: payload.fullName.trim(),
      role: payload.role,
      state: payload.state,
      language: payload.language,
      avatar: payload.avatar || null
    };
    const { error: profileError } = await supabase.from('profiles').insert(profileRow);
    if (profileError) {
      return { ok: false, error: profileError.message };
    }

    if (!data.session) {
      return { ok: false, error: 'Account created. Please check your email to confirm, then sign in.' };
    }

    return { ok: true, session: toSession(user, profileRow) };
  },

  // `currentSession` (optional) is the caller's already-in-hand session —
  // passed through only so the offline branch can return an optimistic
  // session (current fields + the new avatar) without needing a network
  // call of its own. `avatar` is always a plain string by the time it gets
  // here (either `preset:<id>` or a client-resized `data:image/...` URL —
  // see AvatarPicker.jsx's resizeToDataUrl), never a raw File/Blob, so it
  // stores in the queue exactly like any other queued field.
  async updateAvatar(userId, avatar, currentSession) {
    const { error } = await withTimeout(supabase.from('profiles').update({ avatar }).eq('id', userId));
    if (error) {
      if (isNetworkError(error)) {
        // A queued avatar change is tied to a userId, not to "whatever the
        // last queued avatar was" — replacing rather than duplicating
        // covers a user switching avatars twice while still offline.
        const existing = await WriteQueueService.hasQueued('updateAvatar', (e) => e.userId === userId);
        if (!existing) await WriteQueueService.enqueue({ type: 'updateAvatar', userId, avatar });
        await OfflineStore.set(`avatar:${userId}`, avatar);
        if (currentSession) return { ...currentSession, avatar };
        return this.getSession();
      }
      return this.getSession();
    }

    await OfflineStore.set(`avatar:${userId}`, avatar);
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user || user.id !== userId) return this.getSession();
    const profile = await fetchProfile(userId);
    return toSession(user, profile);
  },

  // Plain update, no read-back — if the row's gone (shouldn't happen for a
  // logged-in user, but consistent with every other sync handler in this
  // queue) 0 rows affected isn't an error, so there's nothing to retry.
  async _syncUpdateAvatar(userId, avatar) {
    const { error } = await supabase.from('profiles').update({ avatar }).eq('id', userId);
    if (!error) {
      await OfflineStore.set(`avatar:${userId}`, avatar);
      return { ok: true };
    }
    return { ok: false, retry: isNetworkError(error), message: error.message };
  },

  async logout() {
    await supabase.auth.signOut();
  }
};

registerSyncHandler('updateAvatar', (entry) => AuthService._syncUpdateAvatar(entry.userId, entry.avatar));
