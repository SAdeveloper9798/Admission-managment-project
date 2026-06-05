import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import useAuthStore from '../store/authStore'

const EMPTY = {
  name: '', email: '', phone: '', gender: 'MALE', dob: '', address: '', category: '',
  entryType: 'REGULAR', quotaType: 'KCET', programId: '', qualifyingExam: '',
  marks: '', yearOfPassing: new Date().getFullYear(), parentName: '', parentPhone: '',
}

// Defined OUTSIDE component to prevent remount on every render
function Field({ label, name, type = 'text', options, required, value, onChange, maxLength }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {options ? (
        <select name={name} value={value} onChange={onChange} required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} required={required}
          maxLength={maxLength}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text" />
      )}
    </div>
  )
}

export default function Applicants() {
  const { user } = useAuthStore()
  const canEdit = ['ADMIN', 'ADMISSION_OFFICER'].includes(user?.role)
  const [applicants, setApplicants] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [programs, setPrograms] = useState([])
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const limit = 10
  const totalPages = Math.ceil(total / limit)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/applicants', { params: { page, limit, search: search || undefined } })
      setApplicants(data.data)
      setTotal(data.total)
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api.get('/programs', { params: { limit: 100 } }).then(r => setPrograms(r.data.data || []))
  }, [])

  const set = (name) => (e) => setForm(f => ({ ...f, [name]: e.target.value }))

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (row) => {
    setForm({ ...row, dob: row.dob?.split('T')[0], marks: String(row.marks), yearOfPassing: String(row.yearOfPassing) })
    setSelected(row); setModal('edit')
  }
  const openView = (row) => { setSelected(row); setModal('view') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, marks: parseFloat(form.marks), yearOfPassing: parseInt(form.yearOfPassing), dob: form.dob + 'T00:00:00.000Z' }
      if (modal === 'create') await api.post('/applicants', payload)
      else await api.put(`/applicants/${selected.id}`, payload)
      toast.success(modal === 'create' ? 'Applicant added' : 'Applicant updated')
      setModal(null); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this applicant?')) return
    try { await api.delete(`/applicants/${id}`); toast.success('Deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDocStatus = async (e) => {
    e.preventDefault()
    try {
      await api.patch(`/applicants/${selected.id}/document-status`, { documentStatus: form.documentStatus })
      toast.success('Document status updated'); setModal(null); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'program', label: 'Program', render: r => r.program?.name || '—' },
    { key: 'quotaType', label: 'Quota', render: r => <Badge value={r.quotaType} /> },
    { key: 'documentStatus', label: 'Docs', render: r => <Badge value={r.documentStatus} /> },
    { key: 'admission', label: 'Admitted', render: r => r.admission ? <Badge value="CONFIRMED" /> : <span className="text-gray-400 text-xs">No</span> },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex gap-1">
          <button onClick={() => openView(r)} className="p-1.5 rounded hover:bg-gray-100"><Eye className="w-4 h-4 text-gray-500" /></button>
          {canEdit && <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-gray-100"><Pencil className="w-4 h-4 text-indigo-500" /></button>}
          {canEdit && <button onClick={() => { setSelected(r); setForm({ documentStatus: r.documentStatus }); setModal('docStatus') }} className="p-1.5 rounded hover:bg-gray-100 text-xs text-blue-600 font-medium">Docs</button>}
          {user?.role === 'ADMIN' && <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-500" /></button>}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Applicants</h1>
        {canEdit && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />Add Applicant
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <Table columns={columns} data={applicants} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Add Applicant' : 'Edit Applicant'} onClose={() => setModal(null)} size="xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" name="name" required value={form.name} onChange={set('name')} maxLength={50} />
            <Field label="Email" name="email" type="email" required value={form.email} onChange={set('email')} maxLength={100} />
            <Field label="Phone" name="phone" required value={form.phone} onChange={set('phone')} maxLength={10} />
            <Field label="Date of Birth" name="dob" type="date" required value={form.dob} onChange={set('dob')} />
            <Field label="Gender" name="gender" required value={form.gender} onChange={set('gender')}
              options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]} />
            <Field label="Category" name="category" required value={form.category} onChange={set('category')} maxLength={20} />
            <Field label="Address" name="address" required value={form.address} onChange={set('address')} maxLength={200} />
            <Field label="Parent Name" name="parentName" required value={form.parentName} onChange={set('parentName')} maxLength={50} />
            <Field label="Parent Phone" name="parentPhone" required value={form.parentPhone} onChange={set('parentPhone')} maxLength={10} />
            <Field label="Entry Type" name="entryType" required value={form.entryType} onChange={set('entryType')}
              options={[{ value: 'REGULAR', label: 'Regular' }, { value: 'LATERAL', label: 'Lateral' }]} />
            <Field label="Quota Type" name="quotaType" required value={form.quotaType} onChange={set('quotaType')}
              options={[{ value: 'KCET', label: 'KCET' }, { value: 'COMEDK', label: 'COMEDK' }, { value: 'MANAGEMENT', label: 'Management' }, { value: 'SNQ', label: 'SNQ' }]} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <select value={form.programId} onChange={set('programId')} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <Field label="Qualifying Exam" name="qualifyingExam" required value={form.qualifyingExam} onChange={set('qualifyingExam')} />
            <Field label="Marks (%)" name="marks" type="number" required value={form.marks} onChange={set('marks')} />
            <Field label="Year of Passing" name="yearOfPassing" type="number" required value={form.yearOfPassing} onChange={set('yearOfPassing')} />
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'docStatus' && (
        <Modal title="Update Document Status" onClose={() => setModal(null)} size="sm">
          <form onSubmit={handleDocStatus} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Status</label>
              <select value={form.documentStatus} onChange={set('documentStatus')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="VERIFIED">Verified</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Update</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'view' && selected && (
        <Modal title="Applicant Details" onClose={() => setModal(null)} size="lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Name', selected.name], ['Email', selected.email], ['Phone', selected.phone],
              ['Gender', selected.gender], ['DOB', selected.dob?.split('T')[0]], ['Category', selected.category],
              ['Entry Type', selected.entryType], ['Quota', selected.quotaType],
              ['Program', selected.program?.name], ['Qualifying Exam', selected.qualifyingExam],
              ['Marks', selected.marks + '%'], ['Year of Passing', selected.yearOfPassing],
              ['Parent Name', selected.parentName], ['Parent Phone', selected.parentPhone],
              ['Doc Status', selected.documentStatus],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-gray-400 text-xs">{k}</p>
                <p className="font-medium text-gray-800">{v || '—'}</p>
              </div>
            ))}
            <div className="col-span-2">
              <p className="text-gray-400 text-xs">Address</p>
              <p className="font-medium text-gray-800">{selected.address}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
