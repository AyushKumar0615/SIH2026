import { useEffect } from 'react';
import { canAccessMode } from './permissions';

// Reusable role gate for the app's state-based "pages" (there's no URL
// router here — `mode` plays the role a route path normally would in a
// router-based app). Renders `children` only when the authenticated
// session's role may access `mode`; otherwise it renders nothing and
// immediately hands control back to the caller via `onDenied` (typically a
// redirect to the user's own home mode).
//
// This is the render-time backstop: it still applies no matter how `mode`
// was reached — the workspace switcher, a stale value surviving a role
// change, or React state tampered with via devtools — so hiding a nav
// button is never the only thing standing between a role and a page it
// shouldn't see.
export default function RequireRole({ session, mode, onDenied, children }) {
  const allowed = canAccessMode(session?.role, mode);

  useEffect(() => {
    if (!allowed) onDenied();
  }, [allowed, onDenied]);

  if (!allowed) return null;
  return children;
}
