import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Ticket, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.jpg';
const navItems = [{
  icon: LayoutDashboard,
  label: 'Dashboard',
  path: '/dashboard'
}, {
  icon: Users,
  label: 'Technicians',
  path: '/technicians'
}, {
  icon: Ticket,
  label: 'Tickets',
  path: '/tickets'
}, {
  icon: Settings,
  label: 'Settings',
  path: '/settings'
}];
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  return <aside className={cn('fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col', collapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Techno Bright" className="h-8 w-auto" />
          {!collapsed && <span className="font-semibold text-foreground text-lg">
        </span>}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return <li key={item.path}>
                <NavLink to={item.path} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200', 'hover:bg-accent', isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground')}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>;
        })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">© 2025 ApexFlow Technologies

      </div>
        </div>}
    </aside>;
}