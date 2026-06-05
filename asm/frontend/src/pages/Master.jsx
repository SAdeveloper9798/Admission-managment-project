import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Modal from '../components/Modal'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Badge from '../components/Badge'
import useAuthStore from '../store/authStore'

const TABS = ['Institutions', 'Campuses', 'Departments', 'Programs', 'Academic Years']

// Defined OUTSIDE to prevent remount on every render
function Field({ label, name, type = 'text', options, required, value, onChange, maxLength }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {options ? (
        <select name={name} value={value ?? ''} onChange={onChange} required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value ?? ''} onChange={onChange} required={required} maxLength={maxLength}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text" />
      )}
    </div>
  )
}

function useCrud(endpoint) {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const limit = 10

  const load = async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get(endpoint, { params: { page, limit } })
      setData(res.data || []); setTotal(res.total || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  return { data, total, page, setPage, loading, load, limit }
}

export default function Master() {
  const { user } = useAuthStore()
  const canEdit = ['ADMIN', 'ADMISSION_OFFICER'].includes(user?.role)
  const isAdmin = user?.role === 'ADMIN'
  const [tab, setTab] = useState(0)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [selected, setSelected] = useState(null)
  const [institutions, setInstitutions] = useState([])
  const [campuses, setCampuses] = useState([])
  const [departments, setDepartments] = useState([])

  const inst = useCrud('/institutions')
  const camp = useCrud('/campuses')
  const dept = useCrud('/departments')
  const prog = useCrud('/programs')
  const acad = useCrud('/academic-years')
  const crud = [inst, camp, dept, prog, acad]
  const endpoints = ['/institutions', '/campuses', '/departments', '/programs', '/academic-years']

  useEffect(() => {
    api.get('/institutions', { params: { limit: 100 } }).then(r => setInstitutions(r.data.data || []))
    api.get('/campuses', { params: { limit: 100 } }).then(r => setCampuses(r.data.data || []))
    api.get('/departments', { params: { limit: 100 } }).then(r => setDepartments(r.data.data || []))
  }, [])

  const set = (name) => (e) => setForm(f => ({ ...f, [name]: e.target.value }))

  const openCreate = () => { setForm({}); setSelected(null); setModal('form') }
  const openEdit = (row) => { setForm({ ...row }); setSelected(row); setModal('form') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ep = endpoints[tab]
    try {
      if (selected) await api.put(`${ep}/${selected.id}`, form)
      else await api.post(ep, form)
      toast.success(selected ? 'Updated' : 'Created')
      setModal(null); crud[tab].load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return
    try { await api.delete(`${endpoints[tab]}/${id}`); toast.success('Deleted'); crud[tab].load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleSetCurrent = async (id) => {
    try { await api.patch(`/academic-years/${id}/set-current`); toast.success('Set as current year'); acad.load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const actionCol = (row) => (
    <div className="flex gap-1">
      {canEdit && <button onClick={() => openEdit(row)} className="p-1.5 rounded hover:bg-gray-100"><Pencil className="w-4 h-4 text-indigo-500" /></button>}
      {isAdmin && <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-500" /></button>}
    </div>
  )

  const tabColumns = [
    [
      { key: 'name', label: 'Name' }, { key: 'code', label: 'Code' },
      { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' },
      { key: 'isActive', label: 'Active', render: r => <Badge value={r.isActive ? 'CONFIRMED' : 'CANCELLED'} /> },
      { key: 'actions', label: '', render: actionCol },
    ],
    [
      { key: 'name', label: 'Name' }, { key: 'code', label: 'Code' },
      { key: 'institution', label: 'Institution', render: r => r.institution?.name },
      { key: 'isActive', label: 'Active', render: r => <Badge value={r.isActive ? 'CONFIRMED' : 'CANCELLED'} /> },
      { key: 'actions', label: '', render: actionCol },
    ],
    [
      { key: 'name', label: 'Name' }, { key: 'code', label: 'Code' },
      { key: 'campus', label: 'Campus', render: r => r.campus?.name },
      { key: 'isActive', label: 'Active', render: r => <Badge value={r.isActive ? 'CONFIRMED' : 'CANCELLED'} /> },
      { key: 'actions', label: '', render: actionCol },
    ],
    [
      { key: 'name', label: 'Name' }, { key: 'code', label: 'Code' },
      { key: 'courseType', label: 'Type', render: r => <Badge value={r.courseType} /> },
      { key: 'entryType', label: 'Entry', render: r => <Badge value={r.entryType} /> },
      { key: 'totalIntake', label: 'Intake' },
      { key: 'department', label: 'Department', render: r => r.department?.name },
      { key: 'actions', label: '', render: actionCol },
    ],
    [
      { key: 'year', label: 'Year' },
      { key: 'isCurrent', label: 'Current', render: r => r.isCurrent ? <Badge value="CONFIRMED" /> : '—' },
      { key: 'isActive', label: 'Active', render: r => <Badge value={r.isActive ? 'CONFIRMED' : 'CANCELLED'} /> },
      {
        key: 'actions', label: '', render: (r) => (
          <div className="flex gap-1">
            {canEdit && <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-gray-100"><Pencil className="w-4 h-4 text-indigo-500" /></button>}
            {canEdit && !r.isCurrent && <button onClick={() => handleSetCurrent(r.id)} className="p-1.5 rounded hover:bg-gray-100" title="Set as current"><Star className="w-4 h-4 text-yellow-500" /></button>}
            {isAdmin && <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-500" /></button>}
          </div>
        )
      },
    ],
  ]

  const renderForm = () => {
    if (tab === 0) return (
      <>
        <Field label="Name" name="name" required value={form.name} onChange={set('name')} maxLength={100} />
        <Field label="Code" name="code" required value={form.code} onChange={set('code')} maxLength={20} />
        <Field label="Address" name="address" value={form.address} onChange={set('address')} maxLength={200} />
        <Field label="Phone" name="phone" value={form.phone} onChange={set('phone')} maxLength={15} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={set('email')} maxLength={100} />
      </>
    )
    if (tab === 1) return (
      <>
        <Field label="Name" name="name" required value={form.name} onChange={set('name')} maxLength={100} />
        <Field label="Code" name="code" required value={form.code} onChange={set('code')} maxLength={20} />
        <Field label="Institution" name="institutionId" required value={form.institutionId} onChange={set('institutionId')}
          options={[{ value: '', label: 'Select Institution' }, ...institutions.map(i => ({ value: i.id, label: i.name }))]} />
      </>
    )
    if (tab === 2) return (
      <>
        <Field label="Name" name="name" required value={form.name} onChange={set('name')} maxLength={100} />
        <Field label="Code" name="code" required value={form.code} onChange={set('code')} maxLength={20} />
        <Field label="Campus" name="campusId" required value={form.campusId} onChange={set('campusId')}
          options={[{ value: '', label: 'Select Campus' }, ...campuses.map(c => ({ value: c.id, label: c.name }))]} />
      </>
    )
    if (tab === 3) return (
      <>
        <Field label="Name" name="name" required value={form.name} onChange={set('name')} maxLength={100} />
        <Field label="Code" name="code" required value={form.code} onChange={set('code')} maxLength={20} />
        <Field label="Course Type" name="courseType" required value={form.courseType} onChange={set('courseType')}
          options={[{ value: 'UG', label: 'UG' }, { value: 'PG', label: 'PG' }]} />
        <Field label="Entry Type" name="entryType" value={form.entryType} onChange={set('entryType')}
          options={[{ value: 'REGULAR', label: 'Regular' }, { value: 'LATERAL', label: 'Lateral' }]} />
        <Field label="Total Intake" name="totalIntake" type="number" value={form.totalIntake} onChange={set('totalIntake')} />
        <Field label="Department" name="departmentId" required value={form.departmentId} onChange={set('departmentId')}
          options={[{ value: '', label: 'Select Department' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} />
      </>
    )
    if (tab === 4) return (
      <Field label="Year (e.g. 2024-25)" name="year" required value={form.year} onChange={set('year')} maxLength={10} />
    )
  }

  const current = crud[tab]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Master Data</h1>
        {canEdit && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />Add {TABS[tab].slice(0, -1)}
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === i ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table columns={tabColumns[tab]} data={current.data} loading={current.loading} />
        <Pagination page={current.page} totalPages={Math.ceil(current.total / current.limit)} onPage={current.setPage} />
      </div>

      {modal === 'form' && (
        <Modal title={`${selected ? 'Edit' : 'Add'} ${TABS[tab].slice(0, -1)}`} onClose={() => setModal(null)} size="md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderForm()}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
