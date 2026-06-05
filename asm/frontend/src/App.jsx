import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Applicants from './pages/Applicants'
import Admissions from './pages/Admissions'
import SeatMatrix from './pages/SeatMatrix'
import Master from './pages/Master'
import Users from './pages/Users'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user } = useAuthStore()
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" replace />
}

function OfficerRoute({ children }) {
  const { user } = useAuthStore()
  return ['ADMIN', 'ADMISSION_OFFICER'].includes(user?.role) ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="applicants" element={<OfficerRoute><Applicants /></OfficerRoute>} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="seat-matrix" element={<OfficerRoute><SeatMatrix /></OfficerRoute>} />
          <Route path="master" element={<OfficerRoute><Master /></OfficerRoute>} />
          <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
