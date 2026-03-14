import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Package, LayoutDashboard, Archive, Layers, RefreshCw,
  TruckIcon, ArrowDownToLine, Sliders, History,
  Settings, User, LogOut, ChevronDown, ChevronRight,
  Warehouse,
} from 'lucide-react';

const NAV = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/dashboard',
  },
  {
    label: 'Products',
    icon: Package,
    children: [
      { label: 'Products',         icon: Archive,     to: '/products' },
      { label: 'Stock',            icon: Layers,      to: '/products/stock' },
      { label: 'Categories',       icon: Sliders,     to: '/products/categories' },
      { label: 'Reordering Rules', icon: RefreshCw,   to: '/products/reorder' },
    ],
  },
  {
    label: 'Operations',
    icon: TruckIcon,
    children: [
      { label: 'Receipts',             icon: ArrowDownToLine, to: '/operations/receipts' },
      { label: 'Delivery Orders',      icon: TruckIcon,       to: '/operations/deliveries' },
      { label: 'Inventory Adjustment', icon: Sliders,         to: '/operations/adjustments' },
      { label: 'Move History',         icon: History,         to: '/operations/history' },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Warehouse', icon: Warehouse, to: '/settings/warehouse' },
    ],
  },
];

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  sidebar: {
    width: '240px',
    minHeight: '100dvh',
    background: '#09090B',
    borderRight: '1px solid #1C1C1E',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100dvh',
    overflowY: 'auto',
  },
  logo: {
    padding: '20px 16px 16px',
    borderBottom: '1px solid #1C1C1E',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  nav: {
    flex: 1,
    padding: '8px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflowY: 'auto',
  },
  sectionLabel: {
    padding: '12px 8px 4px',
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#52525B',
  },
  item: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '7px 10px',
    borderRadius: '6px',
    fontSize: '0.825rem',
    fontWeight: active ? 500 : 400,
    color: active ? '#FFFFFF' : '#71717A',
    background: active ? '#27272A' : 'transparent',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'all 120ms ease',
    textDecoration: 'none',
    borderLeft: active ? '2px solid #FFFFFF' : '2px solid transparent',
  }),
  bottomSection: {
    borderTop: '1px solid #1C1C1E',
    padding: '12px 8px',
  },
};

/* ─── NavItem ─────────────────────────────────────────────────────── */
const NavItem = ({ item }) => {
  const [open, setOpen] = useState(true);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '7px 10px',
            borderRadius: '6px',
            fontSize: '0.825rem',
            fontWeight: 400,
            color: '#71717A',
            background: 'transparent',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            transition: 'all 120ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#18181B'; e.currentTarget.style.color = '#A1A1AA'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717A'; }}
        >
          <item.icon size={15} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
          {open
            ? <ChevronDown size={13} strokeWidth={2} style={{ opacity: 0.5 }} />
            : <ChevronRight size={13} strokeWidth={2} style={{ opacity: 0.5 }} />
          }
        </button>
        {open && (
          <div style={{ marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid #27272A', marginTop: '1px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {item.children.map(child => (
              <NavLink
                key={child.to}
                to={child.to}
                style={({ isActive }) => S.item(isActive)}
                onMouseEnter={e => { if (!e.currentTarget.style.background.includes('27272A')) { e.currentTarget.style.background = '#18181B'; } }}
                onMouseLeave={e => { if (!e.currentTarget.style.background.includes('27272A')) { e.currentTarget.style.background = 'transparent'; } }}
              >
                <child.icon size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      style={({ isActive }) => S.item(isActive)}
      onMouseEnter={e => { if (!e.currentTarget.style.background.includes('27272A')) { e.currentTarget.style.background = '#18181B'; } }}
      onMouseLeave={e => { if (!e.currentTarget.style.background.includes('27272A')) { e.currentTarget.style.background = 'transparent'; } }}
    >
      <item.icon size={15} strokeWidth={1.5} style={{ flexShrink: 0 }} />
      <span>{item.label}</span>
    </NavLink>
  );
};

/* ─── Sidebar ─────────────────────────────────────────────────────── */
const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isManager = user.role !== 'warehouse_staff';
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside style={S.sidebar}>

      {/* Logo */}
      <div style={S.logo}>
        <div style={S.logoIcon}>
          <Package size={16} color="#FFFFFF" strokeWidth={1.5} />
        </div>
        <div>
          <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>CoreInventory</p>
          <p style={{ color: '#52525B', fontSize: '0.65rem', marginTop: '1px' }}>Inventory Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={S.nav}>
        {NAV.map(item => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>

      {/* Bottom user section */}
      <div style={S.bottomSection}>
        {/* Role chip */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          background: '#18181B',
          border: '1px solid #27272A',
          borderRadius: '4px',
          marginBottom: '10px',
        }}>
          {isManager
            ? <Sliders size={11} color="#A1A1AA" strokeWidth={2} />
            : <Warehouse size={11} color="#A1A1AA" strokeWidth={2} />
          }
          <span style={{ fontSize: '0.65rem', color: '#71717A', fontWeight: 500 }}>
            {isManager ? 'Inventory Manager' : 'Warehouse Staff'}
          </span>
        </div>

        {/* User info row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: '#27272A', border: '1px solid #3F3F46',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#A1A1AA' }}>{initials}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#E4E4E7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name || 'User'}
            </p>
            <p style={{ fontSize: '0.65rem', color: '#52525B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email || ''}
            </p>
          </div>
        </div>

        {/* My Profile link */}
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 10px', borderRadius: '6px',
            fontSize: '0.8rem', color: isActive ? '#FFFFFF' : '#71717A',
            background: isActive ? '#27272A' : 'transparent',
            textDecoration: 'none', marginBottom: '1px',
            borderLeft: isActive ? '2px solid #FFFFFF' : '2px solid transparent',
            transition: 'all 120ms ease',
          })}
        >
          <User size={13} strokeWidth={1.5} />
          My Profile
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 10px', borderRadius: '6px',
            fontSize: '0.8rem', color: '#EF4444',
            background: 'transparent',
            border: 'none', width: '100%', cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={13} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
