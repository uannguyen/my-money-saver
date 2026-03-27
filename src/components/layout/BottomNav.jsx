import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const tabs = [
  { path: '/', icon: '🏠', label: 'Trang chủ' },
  { path: '/stats', icon: '📊', label: 'Thống kê' },
  { path: '/budget', icon: '💰', label: 'Ngân sách' },
  { path: '/goals', icon: '🎯', label: 'Mục tiêu' },
  { path: '/settings', icon: '⚙️', label: 'Cài đặt' },
]

export function BottomNav({ budgetAlertCount = 0 }) {
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
          <span className="bottom-nav-icon">
            {tab.icon}
            {tab.path === '/budget' && budgetAlertCount > 0 && (
              <span className="bottom-nav-badge">{budgetAlertCount}</span>
            )}
          </span>
          <span className="bottom-nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
