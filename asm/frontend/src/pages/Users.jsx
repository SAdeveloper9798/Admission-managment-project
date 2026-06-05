import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

const EMPTY = { name: '', email: '', password: '', role: 'ADMISSION_OFFICER', isActive: true }

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
        <input type={type} name={name} value={value} onChange={onChange} required={required} maxLength={maxLength}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text" />
      )}
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [selected, setSelected] = useState(null)
  const limit = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users', { params: { page, limit } })
      setUsers(data.data); setTotal(data.total)
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const set = (name) => (e) => setForm(f => ({ ...f, [name]: e.target.value }))

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('form') }
  const openEdit = (row) => {
    setForm({ name: row.name, email: row.email, role: row.role, isActive: row.isActive, password: '' })
    setSelected(row); setModal('form')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selected) {
        await api.put(`/users/${selected.id}`, { name: form.name, role: form.role, isActive: form.isActive })
      } else {
        await api.post('/users', { name: form.name, email: form.email, password: form.password, role: form.role })
      }
      toast.success(selected ? 'User updated' : 'User created')
      setModal(null); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try { await api.delete(`/users/${id}`); toast.success('Deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: r => <Badge value={r.role} /> },
    { key: 'isActive', label: 'Status', render: r => <Badge value={r.isActive ? 'CONFIRMED' : 'CANCELLED'} /> },
    { key: 'createdAt', label: 'Created', render: r => new Date(r.createdAt).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-gray-100"><Pencil className="w-4 h-4 text-indigo-500" /></button>
          <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-500" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table columns={columns} data={users} loading={loading} />
        <Pagination page={page} totalPages={Math.ceil(total / limit)} onPage={setPage} />
      </div>

      {modal === 'form' && (
        <Modal title={selected ? 'Edit User' : 'Add User'} onClose={() => setModal(null)} size="sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" name="name" required value={form.name} onChange={set('name')} maxLength={50} />
            {!selected && <Field label="Email" name="email" type="email" required value={form.email} onChange={set('email')} maxLength={100} />}
            {!selected && <Field label="Password" name="password" type="password" required value={form.password} onChange={set('password')} maxLength={50} />}
            <Field label="Role" name="role" required value={form.role} onChange={set('role')} options={[
              { value: 'ADMIN', label: 'Admin' },
              { value: 'ADMISSION_OFFICER', label: 'Admission Officer' },
              { value: 'MANAGEMENT', label: 'Management' },
            ]} />
            {selected && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={!!form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded cursor-pointer" />
                <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">Active</label>
              </div>
            )}
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
