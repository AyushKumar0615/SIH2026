const USERS_KEY = 'smritisetu_users';
const SESSION_KEY = 'smritisetu_session';
const removedDemoEmails = ['kamala@smritisetu.app', 'priya@smritisetu.app', 'admin@smritisetu.app'];

function sanitizeUsers(users) {
  if (!Array.isArray(users)) return [];
  return users.filter(
    (user) => user && !String(user.id || '').startsWith('seed_') && !removedDemoEmails.includes(String(user.email || '').toLowerCase())
  );
}

function readUsers() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify([]));
    return [];
  }
  try {
    const users = sanitizeUsers(JSON.parse(raw));
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users;
  } catch {
    window.localStorage.setItem(USERS_KEY, JSON.stringify([]));
    return [];
  }
}

function writeUsers(users) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

export const AuthService = {
  getSession() {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  login({ email, password }) {
    const users = readUsers();
    const user = users.find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase().trim() && entry.password === password
    );

    if (!user) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const session = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      state: user.state,
      language: user.language
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return { ok: true, session };
  },

  register(payload) {
    const users = readUsers();
    const exists = users.some((entry) => entry.email.toLowerCase() === payload.email.toLowerCase().trim());
    if (exists) {
      return { ok: false, error: 'An account with this email already exists.' };
    }

    const user = {
      id: `usr_${Date.now()}`,
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      password: payload.password,
      role: payload.role,
      state: payload.state,
      language: payload.language
    };

    const nextUsers = [...users, user];
    writeUsers(nextUsers);

    const session = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      state: user.state,
      language: user.language
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return { ok: true, session };
  },

  logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_KEY);
    }
  },
};
