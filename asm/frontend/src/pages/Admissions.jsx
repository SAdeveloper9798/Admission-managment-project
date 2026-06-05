import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import useAuthStore from '../store/authStore'

export default function Admissions() {
  const { user } = useAuthStore()
  const canEdit = ['ADMIN', 'ADMISSION_OFFICER'].includes(user?.role)
  const isManagement = user?.role === 'MANAGEMENT'
  const [admissions, setAdmissions] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [programs, setPrograms] = useState([])
  const [years, setYears] = useState([])
  const [applicants, setApplicants] = useState([])
  const [allocForm, setAllocForm] = useState({ applicantId: '', programId: '', academicYearId: '', quotaType: 'KCET', admissionMode: 'GOVERNMENT', allotmentNumber: '' })
  const [applicantSearch, setApplicantSearch] = useState('')
  const limit = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admissions', { params: { page, limit, search: search || undefined } })
      setAdmissions(data.data); setTotal(data.total)
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.get('/programs', { params: { limit: 100 } }).then(r => setPrograms(r.data.data || []))
    api.get('/academic-years', { params: { limit: 100 } }).then(r => setYears(r.data.data || []))
  }, [])

  useEffect(() => {
    api.get('/applicants', { params: { limit: 100, search: applicantSearch || undefined } })
      .then(r => setApplicants(r.data.data || []))
  }, [applicantSearch])

  const handleAllocate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admissions/allocate', allocForm)
      toast.success('Seat allocated'); setModal(null); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleFeeStatus = async (id, feeStatus) => {
    try { await api.patch(`/admissions/${id}/fee-status`, { feeStatus }); toast.success('Fee status updated'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleConfirm = async (id) => {
    try { await api.patch(`/admissions/${id}/confirm`); toast.success('Admission confirmed'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this admission?')) return
    try { await api.patch(`/admissions/${id}/cancel`); toast.success('Admission cancelled'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const columns = [
    { key: 'admissionNumber', label: 'Adm No.', render: r => r.admissionNumber || <span className="text-gray-400">Pending</span> },
    { key: 'applicant', label: 'Applicant', render: r => r.applicant?.name },
    { key: 'program', label: 'Program', render: r => r.program?.name },
    { key: 'quotaType', label: 'Quota', render: r => <Badge value={r.quotaType} /> },
    { key: 'admissionMode', label: 'Mode', render: r => <Badge value={r.admissionMode} /> },
    { key: 'status', label: 'Status', render: r => <Badge value={r.status} /> },
    { key: 'feeStatus', label: 'Fee', render: r => <Badge value={r.feeStatus} /> },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => { setSelected(r); setModal('view') }} className="p-1.5 rounded hover:bg-gray-100"><Eye className="w-4 h-4 text-gray-500" /></button>
          {canEdit && r.status !== 'CANCELLED' && r.feeStatus === 'PENDING' && (
            <button onClick={() => handleFeeStatus(r.id, 'PAID')} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Mark Paid</button>
          )}
          {canEdit && r.status === 'ALLOCATED' && r.feeStatus === 'PAID' && (
            <button onClick={() => handleConfirm(r.id)} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">Confirm</button>
          )}
          {user?.role === 'ADMIN' && r.status === 'ALLOCATED' && (
            <button onClick={() => handleCancel(r.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Cancel</button>
          )}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admissions</h1>
        {canEdit && (
          <button onClick={() => setModal('allocate')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />Allocate Seat
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search admission no, applicant..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <Table columns={columns} data={admissions} loading={loading} />
        <Pagination page={page} totalPages={Math.ceil(total / limit)} onPage={setPage} />
      </div>

      {modal === 'allocate' && (
        <Modal title="Allocate Seat" onClose={() => setModal(null)} size="md">
          <form onSubmit={handleAllocate} className="space-y-4">
            {/* Applicant search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applicant</label>
              <input
                placeholder="Search by name or email..."
                value={applicantSearch}
                onChange={e => { setApplicantSearch(e.target.value); setAllocForm(f => ({ ...f, applicantId: '' })) }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-1"
              />
              <select
                value={allocForm.applicantId}
                onChange={e => setAllocForm({ ...allocForm, applicantId: e.target.value })}
                required
                size={Math.min(applicants.length + 1, 6)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select Applicant --</option>
                {applicants.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.email} {a.admission ? '(Admitted)' : ''}
                  </option>
                ))}
              </select>
              {applicants.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No applicants found. Try a different search or add applicants first.</p>
              )}
            </div>
            {[
              { label: 'Program', name: 'programId', options: [{ value: '', label: 'Select Program' }, ...programs.map(p => ({ value: p.id, label: p.name }))] },
              { label: 'Academic Year', name: 'academicYearId', options: [{ value: '', label: 'Select Year' }, ...years.map(y => ({ value: y.id, label: y.year }))] },
              { label: 'Quota Type', name: 'quotaType', options: ['KCET', 'COMEDK', 'MANAGEMENT', 'SNQ'].map(v => ({ value: v, label: v })) },
              { label: 'Admission Mode', name: 'admissionMode', options: ['GOVERNMENT', 'MANAGEMENT'].map(v => ({ value: v, label: v })) },
            ].map(({ label, name, options }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select value={allocForm[name]} onChange={e => setAllocForm({ ...allocForm, [name]: e.target.value })} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allotment Number (optional)</label>
              <input value={allocForm.allotmentNumber} onChange={e => setAllocForm({ ...allocForm, allotmentNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Allocate</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'view' && selected && (
        <Modal title="Admission Details" onClose={() => setModal(null)} size="md">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Admission No.', selected.admissionNumber || 'Pending'],
              ['Applicant', selected.applicant?.name],
              ['Email', selected.applicant?.email],
              ['Program', selected.program?.name],
              ['Academic Year', selected.academicYear?.year],
              ['Quota', selected.quotaType],
              ['Mode', selected.admissionMode],
              ['Status', selected.status],
              ['Fee Status', selected.feeStatus],
              ['Allotment No.', selected.allotmentNumber || '—'],
              ['Confirmed At', selected.confirmedAt ? new Date(selected.confirmedAt).toLocaleDateString() : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-gray-400 text-xs">{k}</p>
                <p className="font-medium text-gray-800">{v}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
