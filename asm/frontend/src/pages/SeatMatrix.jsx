import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import useAuthStore from '../store/authStore'

const QUOTAS = ['KCET', 'COMEDK', 'MANAGEMENT', 'SNQ']

export default function SeatMatrix() {
  const { user } = useAuthStore()
  const canEdit = ['ADMIN', 'ADMISSION_OFFICER'].includes(user?.role)
  const [matrix, setMatrix] = useState([])
  const [programs, setPrograms] = useState([])
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [quotas, setQuotas] = useState(QUOTAS.map(q => ({ quotaType: q, totalSeats: 0, supernumerarySeats: 0 })))

  const load = () => api.get('/seat-matrix').then(r => setMatrix(r.data))

  useEffect(() => {
    load()
    api.get('/programs', { params: { limit: 100 } }).then(r => setPrograms(r.data.data || []))
  }, [])

  const openEdit = async (programId) => {
    const { data } = await api.get(`/seat-matrix/${programId}`)
    setDetail(data)
    setSelected(programId)
    const existing = Object.fromEntries(data.matrix.map(m => [m.quotaType, m]))
    setQuotas(QUOTAS.map(q => ({
      quotaType: q,
      totalSeats: existing[q]?.totalSeats || 0,
      supernumerarySeats: existing[q]?.supernumerarySeats || 0,
    })))
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/seat-matrix/${selected}`, { quotas })
      toast.success('Seat matrix updated'); setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  // Group matrix by program
  const byProgram = matrix.reduce((acc, m) => {
    const pid = m.program?.id
    if (!acc[pid]) acc[pid] = { program: m.program, rows: [] }
    acc[pid].rows.push(m)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Seat Matrix</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Program</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quota</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Allocated</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supernumerary</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Available</th>
              {canEdit && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.values(byProgram).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No seat matrix configured</td></tr>
            )}
            {Object.values(byProgram).map(({ program, rows }, gi) =>
              rows.map((row, i) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {i === 0 && (
                    <td rowSpan={rows.length} className="px-4 py-3 font-medium text-gray-800 border-r border-gray-100 align-top">
                      <div>{program?.name}</div>
                      <div className="text-xs text-gray-400">{program?.code}</div>
                      {canEdit && (
                        <button onClick={() => openEdit(program?.id)} className="mt-1 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                          <Pencil className="w-3 h-3" />Edit
                        </button>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3"><Badge value={row.quotaType} /></td>
                  <td className="px-4 py-3 text-gray-700">{row.totalSeats}</td>
                  <td className="px-4 py-3 text-gray-700">{row.allocatedSeats}</td>
                  <td className="px-4 py-3 text-gray-700">{row.supernumerarySeats}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${row.totalSeats + row.supernumerarySeats - row.allocatedSeats > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.totalSeats + row.supernumerarySeats - row.allocatedSeats}
                    </span>
                  </td>
                  {canEdit && i === 0 && <td rowSpan={rows.length} className="px-4 py-3 align-top" />}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-sm font-medium text-indigo-700 mb-2">Configure seat matrix for a program</p>
          <select onChange={e => e.target.value && openEdit(e.target.value)} defaultValue=""
            className="px-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">Select a program to configure...</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {modal && (
        <Modal title={`Edit Seat Matrix — ${detail?.program?.name}`} onClose={() => setModal(false)} size="lg">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="text-sm text-gray-500">Total Intake: <span className="font-semibold text-gray-800">{detail?.program?.totalIntake}</span></div>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Quota</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Total Seats</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Supernumerary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotas.map((q, i) => (
                  <tr key={q.quotaType}>
                    <td className="px-3 py-2"><Badge value={q.quotaType} /></td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={q.totalSeats}
                        onChange={e => setQuotas(quotas.map((x, j) => j === i ? { ...x, totalSeats: parseInt(e.target.value) || 0 } : x))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={q.supernumerarySeats}
                        onChange={e => setQuotas(quotas.map((x, j) => j === i ? { ...x, supernumerarySeats: parseInt(e.target.value) || 0 } : x))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-sm text-gray-500">
              Total configured: <span className="font-semibold text-gray-800">{quotas.reduce((s, q) => s + q.totalSeats, 0)}</span>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
