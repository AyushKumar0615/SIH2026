// Single source of truth for role-based access control. The authenticated
// user's role always comes from `profiles.role` in Supabase (see
// authService.js) — never from email/name/UI state. Every place in the app
// that needs to know "can this role see X" should read it from here instead
// of re-deriving its own role checks.

export const ROLES = {
  ELDERLY: 'elderly',
  CAREGIVER: 'caregiver',
  ADMIN: 'admin'
};

// role -> { home: the workspace mode a session of this role lands on,
//           allowedModes: every workspace mode this role may enter }
// "demo" is intentionally in every role's list: App.jsx renders it as the
// same read-only ElderlyHome view demo mode has always used, so it never
// exposes Caregiver/Admin functionality regardless of who reaches it.
const ROLE_PERMISSIONS = {
  [ROLES.ELDERLY]: { home: 'elderly', allowedModes: ['elderly', 'demo'] },
  [ROLES.CAREGIVER]: { home: 'caregiver', allowedModes: ['caregiver', 'demo'] },
  [ROLES.ADMIN]: { home: 'admin', allowedModes: ['admin', 'demo'] }
};

const FALLBACK_ROLE = ROLES.ELDERLY;

// Roles the public registration form may ever create. Admin is deliberately
// excluded — it's never selectable at signup, and this is also what
// authService.register() checks client-side before ever calling Supabase.
// The actual, authoritative enforcement lives in the "insert own profile"
// RLS policy (supabase/schema.sql), which rejects role='admin' at the
// database layer regardless of what the client sends — this export just
// gives registration a clean, friendly failure instead of a raw RLS error.
export const PUBLIC_REGISTRATION_ROLES = [ROLES.ELDERLY, ROLES.CAREGIVER];

export function isPublicRegistrationRole(role) {
  return PUBLIC_REGISTRATION_ROLES.includes((role || '').trim().toLowerCase());
}

// Guards against a missing/corrupted/unrecognized role value (e.g. a failed
// profile fetch, or bad data) ever being treated as a real, possibly
// privileged role — it always resolves to the least-privileged role instead.
export function normalizeRole(role) {
  const value = (role || '').trim().toLowerCase();
  return ROLE_PERMISSIONS[value] ? value : FALLBACK_ROLE;
}

export function getRoleHome(role) {
  return ROLE_PERMISSIONS[normalizeRole(role)].home;
}

export function getAllowedModes(role) {
  return ROLE_PERMISSIONS[normalizeRole(role)].allowedModes;
}

export function canAccessMode(role, mode) {
  return getAllowedModes(role).includes(mode);
}
