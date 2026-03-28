import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { BottomNav } from './components/layout/BottomNav'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { AddPage } from './pages/AddPage'
import { StatsPage } from './pages/StatsPage'
import { BudgetPage } from './pages/BudgetPage'
import { GoalsPage } from './pages/GoalsPage'
import { SettingsPage } from './pages/SettingsPage'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { useTransactions } from './hooks/useTransactions'
import { useBudget } from './hooks/useBudget'
import { useBudgetAlerts } from './hooks/useBudgetAlerts'
import { useRecurring } from './hooks/useRecurring'
import { getMonthKey } from './utils/dateHelpers'
import { ALL_DEFAULT_CATEGORIES } from './constants/categories'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100dvh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppLayout({ children }) {
  const currentMonthKey = getMonthKey(new Date())
  const { expenseByCategory } = useTransactions(currentMonthKey)
  const { budgets } = useBudget(currentMonthKey, expenseByCategory)
  const { alertCount } = useBudgetAlerts(budgets, ALL_DEFAULT_CATEGORIES)

  return (
    <>
      {children}
      <BottomNav budgetAlertCount={alertCount} />
    </>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  const { processDueRecurrings, loading: recurringLoading } = useRecurring()

  useEffect(() => {
    if (user && !recurringLoading) {
      processDueRecurrings().then((count) => {
        if (count > 0) toast(`🔄 Đã tạo ${count} giao dịch định kỳ`)
      })
    }
  }, [user, recurringLoading, processDueRecurrings])

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '12px 20px',
            boxShadow: '0 10px 25px rgb(0 0 0 / 0.2)',
          },
        }}
      />

      <Routes>
        <Route
          path="/login"
          element={
            loading ? (
              <div className="loading-center" style={{ minHeight: '100dvh' }}>
                <div className="spinner" />
              </div>
            ) : user ? (
              <Navigate to="/add" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout><HomePage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <AddPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <AppLayout><StatsPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <AppLayout><BudgetPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <AppLayout><GoalsPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout><SettingsPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/add" replace />} />
      </Routes>
    </>
  )
}
