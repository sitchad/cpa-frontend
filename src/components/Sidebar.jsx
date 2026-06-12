import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Zap,
  Wallet,
  ArrowDownToLine,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const userNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/offers', icon: Zap, label: 'Offres' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/withdraw', icon: ArrowDownToLine, label: 'Retrait' },
]

const adminNavItems = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { to: '/admin/withdrawals', icon: ArrowDownToLine, label: 'Retraits' },
]

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">C</div>
        <span className="sidebar-logo-text">CPA Platform</span>
      </div>

      {/* User navigation */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">Navigation</p>
        {userNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Admin navigation */}
      {isAdmin && (
        <div className="sidebar-section">
          <p className="sidebar-section-label">Administration</p>
          {adminNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Bottom user info */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name ?? 'Utilisateur'}</div>
            <div className="sidebar-user-role">{isAdmin ? 'Administrateur' : 'Membre'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
