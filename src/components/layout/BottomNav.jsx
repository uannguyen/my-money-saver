import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const tabs = [
  { path: '/', icon: '🏠', label: 'Trang chủ' },
  { path: '/stats', icon: '📊', label: 'Thống kê' },
  { path: '/budget', icon: '💰', label: 'Ngân sách' },
  { path: '/settings', icon: '⚙️', label: 'Cài đặt' },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.path === '/'}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
