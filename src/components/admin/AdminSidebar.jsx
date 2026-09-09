import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Feather, LayoutDashboard, HeartPulse, Users, Link2, FileText, BarChart3,
  Settings as SettingsIcon, LogOut, X
} from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

// Sidebar nav. Only Dashboard, Elders, Caregivers, Connections and Analytics
// map to real, existing behavior (see AdminPortal's handleNavigate) — Content
// Management and Settings have no corresponding feature in this app today,
// so they're rendered for layout fidelity but marked `inert: true` and never
// wired to a fake action. See the redesign report for the full breakdown.
const NAV_ITEMS = [
  { id: 'dashboard', labelKey: 'adminNavDashboard', icon: LayoutDashboard },
  { id: 'elders', labelKey: 'adminNavElders', icon: HeartPulse },
  { id: 'caregivers', labelKey: 'adminNavCaregivers', icon: Users },
  { id: 'connections', labelKey: 'adminNavConnections', icon: Link2 },
  { id: 'content', labelKey: 'adminNavContent', icon: FileText, inert: true },
  { id: 'analytics', labelKey: 'adminNavAnalytics', icon: BarChart3 },
  { id: 'settings', labelKey: 'adminNavSettings', icon: SettingsIcon, inert: true }
];

function SidebarContent({ t, activeSection, onNavigate, session, onLogout }) {
  return (
    <>
      <div className="admin-sidebar-brand">
        <div className="flex items-center gap-2.5">
          <span className="mark-glyph shrink-0"><Feather className="w-4 h-4" /></span>
          <span className="font-display font-semibold text-lg leading-none">Smriti<em className="italic text-ember">Setu</em></span>
        </div>
        <p className="admin-sidebar-tagline">{t('adminBrandTagline')}</p>
      </div>

      <nav className="admin-nav" aria-label={t('adminSidebarNavAria')}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`admin-nav-link ${isActive ? 'is-active' : ''} ${item.inert ? 'is-inert' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {t(item.labelKey)}
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="flex items-center gap-3 min-w-0 mb-3">
          <UserAvatar
            avatar={session?.avatar}
            fullName={session?.fullName}
            className="w-10 h-10 rounded-full overflow-hidden shrink-0 object-cover"
            iconClassName="w-1/2 h-1/2"
          />
          <div className="min-w-0">
            <span className="text-sm font-semibold block truncate">{session?.fullName || t('guestLabel')}</span>
            <span className="text-xs block text-ink-faint">{t('adminRoleLabel')}</span>
          </div>
        </div>
        <button type="button" onClick={onLogout} className="btn btn-quiet w-full !justify-start">
          <LogOut className="w-4 h-4" /> {t('logout')}
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar({ t, activeSection, onNavigate, session, onLogout, mobileOpen, onCloseMobile }) {
  return (
    <>
      <aside className="admin-sidebar" aria-label={t('adminSidebarNavAria')}>
        <SidebarContent t={t} activeSection={activeSection} onNavigate={onNavigate} session={session} onLogout={onLogout} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="overlay-scrim"
              style={{ zIndex: 200 }}
              role="dialog"
              aria-modal="true"
              onClick={onCloseMobile}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.div
              className="admin-sidebar"
              style={{ position: 'fixed', inset: '0 auto 0 0', zIndex: 201, display: 'flex', height: '100vh' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-end mb-2">
                <button type="button" onClick={onCloseMobile} className="btn-icon" aria-label={t('closeMenuAria')}>
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <SidebarContent
                t={t}
                activeSection={activeSection}
                onNavigate={(id) => { onNavigate(id); onCloseMobile(); }}
                session={session}
                onLogout={onLogout}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
