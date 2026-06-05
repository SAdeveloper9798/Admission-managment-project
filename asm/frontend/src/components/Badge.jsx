const variants = {
  ALLOCATED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  VERIFIED: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-indigo-100 text-indigo-700',
  ADMISSION_OFFICER: 'bg-cyan-100 text-cyan-700',
  MANAGEMENT: 'bg-orange-100 text-orange-700',
  KCET: 'bg-blue-100 text-blue-700',
  COMEDK: 'bg-purple-100 text-purple-700',
  SNQ: 'bg-teal-100 text-teal-700',
  GOVERNMENT: 'bg-green-100 text-green-700',
  UG: 'bg-indigo-100 text-indigo-700',
  PG: 'bg-pink-100 text-pink-700',
}

export default function Badge({ value }) {
  const cls = variants[value] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value?.replace('_', ' ')}
    </span>
  )
}
