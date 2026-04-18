import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  UserPlus,
  ImageUp,
  Menu,
  X,
  LogOut,
  BookOpenCheck,
  MessageSquareWarning,
  BellRing,
  Users,
  Building,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { name: 'Create Building', path: '/building', icon: Building2 },
  { name: 'Create Profile', path: '/profile', icon: UserPlus },
  { name: 'Upload Image', path: '/upload', icon: ImageUp },
  { name: 'Bookings', path: '/service-orders', icon: BookOpenCheck },
  { name: 'Issues', path: '/complaints', icon: MessageSquareWarning },
  { name: 'Notifications', path: '/notifications', icon: BellRing },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Buildings', path: '/buildings', icon: Building },
];

const AUTH_KEY = "super_admin_authenticated";

const Navbar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    localStorage.removeItem(AUTH_KEY);
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border pt-3 sm:pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">N</span>
          </div>
          <span className="font-semibold text-foreground tracking-tight">Nestiti Super Admin</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-1 flex-wrap justify-end">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-base flex items-center gap-2 ${
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 rounded-lg text-sm font-medium transition-base flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-base"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition-base flex items-center gap-2 w-full ${
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
          <button
            onClick={() => { setMobileOpen(false); handleSignOut(); }}
            className="px-3.5 py-2.5 rounded-lg text-sm font-medium transition-base flex items-center gap-2 w-full text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
