import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  LayoutDashboard,
  Compass,
  CheckSquare,
  Clock,
  FolderLock,
  Scale,
  User,
  Sun,
  Moon,
  Bell,
  Search,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AppLayout: React.FC = () => {
  const theme = useAppStore((s) => s.settings.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const notifications = useAppStore((s) => s.notifications);
  const markAllNotificationsAsRead = useAppStore((s) => s.markAllNotificationsAsRead);
  const profile = useAppStore((s) => s.profile);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const location = useLocation();

  // Sync theme class to <html> tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Close notification popover on route change
  useEffect(() => {
    setShowNotifMenu(false);
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Tracker', path: '/tracker', icon: CheckSquare },
    { name: 'Deadlines', path: '/deadlines', icon: Clock },
    { name: 'Vault', path: '/vault', icon: FolderLock },
    { name: 'Compare', path: '/compare', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-transparent text-text flex flex-col transition-colors duration-200 relative z-10">
      <SkipToContent />

      {/* Desktop Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#1F2A1F] border border-[#3E5A3F]/60 flex items-center justify-center text-[#D9C7A3] group-hover:border-[#D9C7A3]/60 transition-colors">
                <Sparkles className="w-4 h-4 font-bold" />
              </div>
              <span className="font-display font-semibold text-lg tracking-tight group-hover:text-[#D9C7A3] transition-colors">
                GRANTLY
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2',
                        isActive
                          ? 'bg-[#3E5A3F]/30 text-[#D9C7A3] border border-[#3E5A3F]/50'
                          : 'text-muted hover:text-text hover:bg-surface-elevated'
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right Header Utilities: Search, Notifs, Theme, Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Explore search link */}
            <Link
              to="/explore"
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-muted bg-surface-elevated border border-border hover:border-primary/40 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search scholarships...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface text-[10px] border border-border">Ctrl+K</kbd>
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-gold-400 ring-2 ring-surface animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-surface p-4 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="font-semibold text-sm">Notifications</span>
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'p-2.5 rounded-lg text-xs space-y-1 transition-colors border',
                          n.read
                            ? 'bg-surface-elevated/40 border-border/50 text-muted'
                            : 'bg-primary/5 border-primary/25 text-text'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{n.title}</span>
                          {!n.read && <Badge variant="gold" size="sm">New</Badge>}
                        </div>
                        <p className="text-muted leading-relaxed">{n.message}</p>
                        {n.actionUrl && (
                          <Link
                            to={n.actionUrl}
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium pt-1"
                          >
                            <span>Open details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted hover:text-text hover:bg-surface-elevated transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[#D9C7A3]" />
              ) : (
                <Moon className="w-5 h-5 text-[#8CA98C]" />
              )}
            </button>

            {/* Student Profile Avatar */}
            <Link
              to="/profile"
              className="flex items-center space-x-2.5 pl-2 border-l border-border hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#1F2A1F] border border-[#3E5A3F]/50 flex items-center justify-center text-[#D9C7A3] font-medium text-xs">
                {profile.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-none">{profile.fullName}</p>
                <p className="text-[10px] text-muted leading-tight mt-0.5">{profile.educationLevel}</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Internal Content Area */}
      <main id="main-content" className="flex-1 pb-12">
        <Outlet />
      </main>

      {/* App Workspace Footer */}
      <footer
        className="w-full border-t border-border/70 bg-surface/50 backdrop-blur-sm py-6 px-4 sm:px-6 lg:px-8 pb-24 md:pb-6 text-xs text-muted"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span className="font-semibold text-text tracking-tight">GRANTLY</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="text-[11px]">Client-side prototype. All 36 catalog entries are fictional demonstrations.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <Link to="/privacy" className="hover:text-text transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-text transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-text transition-colors">Storage & Cookies</Link>
            <Link to="/refund" className="hover:text-text transition-colors">Demo Disclosure</Link>
            <span className="text-muted/60">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border px-2 py-1.5 flex items-center justify-around"
        aria-label="Mobile Navigation"
      >
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-semibold' : 'text-muted'
            )
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-semibold' : 'text-muted'
            )
          }
        >
          <Compass className="w-5 h-5" />
          <span className="mt-1">Explore</span>
        </NavLink>

        <NavLink
          to="/tracker"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-semibold' : 'text-muted'
            )
          }
        >
          <CheckSquare className="w-5 h-5" />
          <span className="mt-1">Tracker</span>
        </NavLink>

        <NavLink
          to="/vault"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-semibold' : 'text-muted'
            )
          }
        >
          <FolderLock className="w-5 h-5" />
          <span className="mt-1">Vault</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-semibold' : 'text-muted'
            )
          }
        >
          <User className="w-5 h-5" />
          <span className="mt-1">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};
