import { supabase } from './supabaseClient';

function toSession(user, profile) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || '',
    role: profile?.role || 'caregiver',
    state: profile?.state || '',
    language: profile?.language || 'as',
    avatar: profile?.avatar || null
  };
}

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
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

  async updateAvatar(userId, avatar) {
    const { error } = await supabase.from('profiles').update({ avatar }).eq('id', userId);
    if (error) return this.getSession();

    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user || user.id !== userId) return this.getSession();
    const profile = await fetchProfile(userId);
    return toSession(user, profile);
  },

  async logout() {
    await supabase.auth.signOut();
  }
};
