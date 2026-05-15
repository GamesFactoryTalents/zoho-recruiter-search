import { X } from 'lucide-react'

const CATEGORIES = [
  'Art & Animation', 'Audio & Sound', 'Business & Management', 'Data & Analytics',
  'Game Design', 'Localisation', 'Monetisation', 'Player Support & Community',
  'Product & LiveOps', 'Production', 'Programming & Engineering', 'QA & Testing',
  'UA & Marketing', 'UI & UX Design', 'Writing',
]

const SENIORITIES = ['junior', 'mid', 'senior', 'lead', 'director']

const STATUSES = [
  'Applied-to-event',
  'Submitted-to-Talent-Board',
  'Available',
  'Not Available',
  'Placed',
]

export default function FilterPanel({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val || undefined })
  const clear = () => onChange({})

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Filters</span>
        {activeCount > 0 && (
          <button onClick={clear} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            <X size={12} /> Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
        <select
          value={filters.category || ''}
          onChange={e => set('category', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Seniority */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Seniority</label>
        <div className="flex flex-wrap gap-1.5">
          {SENIORITIES.map(s => (
            <button
              key={s}
              onClick={() => set('seniority', filters.seniority === s ? '' : s)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                filters.seniority === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
        <select
          value={filters.status || ''}
          onChange={e => set('status', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Country</label>
        <input
          type="text"
          value={filters.country || ''}
          onChange={e => set('country', e.target.value)}
          placeholder="e.g. Finland"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
    </div>
  )
}
