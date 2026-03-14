import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  {
    label: 'Dashboard',
    icon: '🏠',
    to: '/dashboard',
  },
  {
    label: 'Products',
    icon: '📦',
    children: [
      { label: 'Products',           icon: '📋', to: '/products' },
      { label: 'Stock by Location',  icon: '📍', to: '/products/stock' },
      { label: 'Categories',         icon: '🏷️', to: '/products/categories' },
      { label: 'Reordering Rules',   icon: '🔁', to: '/products/reorder' },
    ],
  },
  {
    label: 'Operations',
    icon: '⚙️',
    children: [
      { label: 'Receipts',             icon: '📥', to: '/operations/receipts' },
      { label: 'Delivery Orders',      icon: '🚚', to: '/operations/deliveries' },
      { label: 'Inventory Adjustment', icon: '🔧', to: '/operations/adjustments' },
      { label: 'Move History',         icon: '📜', to: '/operations/history' },
    ],
  },
  {
    label: 'Settings',
    icon: '⚙️',
    children: [
      { label: 'Warehouse', icon: '🏭', to: '/settings/warehouse' },
    ],
  },
];

const activeClass =
  'bg-[#6c63ff]/20 text-[#a89eff] border-r-2 border-[#6c63ff]';
const idleClass =
  'text-[#a0a0b8] hover:bg-[#252540] hover:text-[#e2e2f0]';

const NavItem = ({ item }) => {
  const [open, setOpen] = useState(true);

  if (item.children) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#a0a0b8] hover:bg-[#252540] hover:text-[#e2e2f0] transition-all text-sm font-medium"
        >
          <span className="text-base">{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          <span className="text-xs opacity-60">{open ? '▾' : '▸'}</span>
        </button>
        {open && (
          <div className="ml-4 mt-1 border-l border-[#2a2a3e] pl-3 flex flex-col gap-0.5">
            {item.children.map(child => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive ? activeClass : idleClass
                  }`
                }
              >
                <span>{child.icon}</span>
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
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 ${
          isActive ? activeClass : idleClass
        }`
      }
    >
      <span className="text-base">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const roleLabel =
    user.role === 'warehouse_staff' ? '🏭 Warehouse Staff' : '📋 Inventory Manager';
  const roleColor =
    user.role === 'warehouse_staff'
      ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30'
      : 'text-[#6c63ff] bg-[#6c63ff]/10 border-[#6c63ff]/30';

  return (
    <aside className="w-60 min-h-screen bg-[#16162a] border-r border-[#2a2a3e] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#2a2a3e]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#6c63ff] rounded-lg flex items-center justify-center text-white font-bold text-sm">
            CI
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">CoreInventory</p>
            <p className="text-[#6b6b8a] text-[10px]">Inventory Manager</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV.map(item => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>

      {/* Profile Section */}
      <div className="border-t border-[#2a2a3e] p-3">
        {/* Role badge */}
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-2 ${roleColor}`}>
          {roleLabel}
        </span>

        {/* User info */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#6c63ff]/30 flex items-center justify-center text-[#a89eff] font-bold text-sm flex-shrink-0">
            {(user.name || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[#e2e2f0] text-xs font-semibold truncate">{user.name || 'User'}</p>
            <p className="text-[#6b6b8a] text-[10px] truncate">{user.email || ''}</p>
          </div>
        </div>

        {/* My Profile link */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all mb-1 ${
              isActive ? activeClass : idleClass
            }`
          }
        >
          <span>👤</span>
          <span>My Profile</span>
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
