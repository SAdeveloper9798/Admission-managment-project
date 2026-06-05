import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, GraduationCap, BookOpen, Settings, LogOut, Menu, X, Building2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'

const allNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT'] },
  { to: '/applicants', icon: Users, label: 'Applicants', roles: ['ADMIN', 'ADMISSION_OFFICER'] },
  { to: '/admissions', icon: GraduationCap, label: 'Admissions', roles: ['ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT'] },
  { to: '/seat-matrix', icon: BookOpen, label: 'Seat Matrix', roles: ['ADMIN', 'ADMISSION_OFFICER'] },
  { to: '/master', icon: Building2, label: 'Master Data', roles: ['ADMIN', 'ADMISSION_OFFICER'] },
  { to: '/users', icon: Settings, label: 'Users', roles: ['ADMIN'] },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const nav = allNav.filter(n => n.roles.includes(user?.role))

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white flex flex-col transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-800">
          <GraduationCap className="w-8 h-8 text-indigo-300" />
          <span className="text-lg font-bold">AdmissionCRM</span>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`
              }>
              <Icon className="w-5 h-5" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-indigo-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-indigo-300 truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setOpen(true)}><Menu className="w-6 h-6 text-gray-600" /></button>
          <span className="font-semibold text-gray-800">AdmissionCRM</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
