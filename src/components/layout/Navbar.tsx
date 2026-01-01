import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Dumbbell, 
  BarChart3, 
  BookOpen, 
  LineChart, 
  Settings,
  LogOut,
  Swords
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/habits', label: 'Habits', icon: Dumbbell },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/analytics', label: 'Analytics', icon: LineChart },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Swords className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 blur-lg bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider text-foreground">
              ARISE
            </span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-heading uppercase tracking-wider transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user && profile ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground">
                    {profile.full_name || 'Hunter'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level Up Daily
                  </p>
                </div>
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full border-2 border-primary/50 object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {(profile.full_name || 'H')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-border">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-heading uppercase">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
