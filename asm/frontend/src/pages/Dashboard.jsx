import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import { Users, GraduationCap, BookOpen, FileWarning, CreditCard } from 'lucide-react'
import api from '../lib/api'

const QUOTA_COLORS = { KCET: '#6366f1', COMEDK: '#f59e0b', MANAGEMENT: '#10b981', SNQ: '#ef4444' }
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const STAT_CARDS = [
  { key: 'totalIntake', label: 'Total Intake', icon: BookOpen, bg: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-200' },
  { key: 'totalAdmitted', label: 'Total Admitted', icon: GraduationCap, bg: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200' },
  { key: 'remainingSeats', label: 'Remaining Seats', icon: Users, bg: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-200' },
  { key: 'pendingDocs', label: 'Pending Docs', icon: FileWarning, bg: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-200' },
  { key: 'pendingFees', label: 'Pending Fees', icon: CreditCard, bg: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-200' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name || p.dataKey}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [years, setYears] = useState([])
  const [yearId, setYearId] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api.get('/academic-years', { params: { limit: 100 } }).then(r => {
      const list = r.data.data || []
      setYears(list)
      const current = list.find(y => y.isCurrent)
      setYearId(current ? current.id : '')
      setReady(true)
    }).catch(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready) return
    api.get('/dashboard/stats', { params: yearId ? { academicYearId: yearId } : {} })
      .then(r => setData(r.data)).catch(() => {})
  }, [yearId, ready])

  const quotaChartData = (data?.quotaStats || []).map(q => ({
    name: q.quota,
    value: q.count,
    fill: QUOTA_COLORS[q.quota] || '#6366f1'
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Admission overview & analytics</p>
        </div>
        <select value={yearId} onChange={e => setYearId(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
          <option value="">All Years</option>
          {years.map(y => <option key={y.id} value={y.id}>{y.year}{y.isCurrent ? ' (Current)' : ''}</option>)}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, bg, shadow }) => (
          <div key={key} className={`bg-gradient-to-br ${bg} rounded-2xl p-5 shadow-lg ${shadow} text-white`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-3xl font-bold">{data?.cards?.[key] ?? 0}</span>
            </div>
            <p className="text-sm text-white/80 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart - Monthly Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Monthly Admission Trend</h2>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">Last 12 months</span>
          </div>
          {data?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={[...data.monthlyTrend].reverse()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Admissions" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#trendGrad)" dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-20">No trend data yet</p>}
        </div>

        {/* Pie Chart - Quota Distribution */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Quota Distribution</h2>
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">By quota</span>
          </div>
          {quotaChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={quotaChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {quotaChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {quotaChartData.map((q, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: q.fill }} />
                    {q.name} ({q.value})
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-gray-400 text-center py-20">No quota data yet</p>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Colorful Bar Chart - Admissions by Program */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Admissions by Program</h2>
            <span className="text-xs bg-cyan-100 text-cyan-600 px-2 py-1 rounded-full font-medium">Per program</span>
          </div>
          {data?.programStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.programStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Admissions" radius={[6, 6, 0, 0]}>
                  {data.programStats.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-20">No program data yet</p>}
        </div>

        {/* Stacked Bar Chart - Seat Status by Program */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Seat Status by Program</h2>
            <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full font-medium">Allocated vs Remaining</span>
          </div>
          {data?.seatStats?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.seatStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="code" tick={{ fontSize: 11 }} width={45} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="allocatedSeats" name="Allocated" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="remaining" name="Remaining" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-600"><span className="w-3 h-3 rounded bg-indigo-500" />Allocated</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600"><span className="w-3 h-3 rounded bg-emerald-500" />Remaining</div>
              </div>
            </>
          ) : <p className="text-sm text-gray-400 text-center py-20">No seat data yet</p>}
        </div>
      </div>
    </div>
  )
}
