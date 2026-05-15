import { X } from 'lucide-react'

const CATEGORIES = [
  'Art & Animation', 'Audio & Sound', 'Business & Management', 'Data & Analytics',
  'Game Design', 'Localisation', 'Monetisation', 'Player Support & Community',
  'Product & LiveOps', 'Production', 'Programming & Engineering', 'QA & Testing',
  'UA & Marketing', 'UI & UX Design', 'Writing',
]

// All normalised seniority values (after backend normalisation)
const SENIORITIES = [
  { value: 'trainee', label: 'Trainee' },
  { value: 'junior',  label: 'Junior'  },
  { value: 'mid',     label: 'Mid'     },
  { value: 'senior',  label: 'Senior'  },
  { value: 'lead',    label: 'Lead'    },
  { value: 'manager', label: 'Manager' },
  { value: 'director',label: 'Director'},
]

const STATUSES = [
  'Applied-to-event',
  'Submitted-to-Talent-Board',
  'Available',
  'Not Available',
  'Placed',
]

function CzpBadge() {
  return (
    <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 uppercase tracking-wide">
      CZP
    </span>
  )
}

export default function FilterPanel({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val || undefined })
  const clear = () => onChange({})

  const activeCount = Object.values(filters).filter(Boolean).length
  const czpMode = filters.source === 'czp'

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

      {/* Source toggle */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Candidate source</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
          {[
            { value: '',    label: 'All' },
            { value: 'czp', label: 'Careers Zone' },
            { value: 'job', label: 'Job Board' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => set('source', opt.value)}
              className={`flex-1 py-1.5 transition-colors ${
                (filters.source || '') === opt.value
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {!czpMode && (filters.category || filters.seniority) && (
          <p className="text-[11px] text-amber-600 mt-1.5 leading-snug">
            Category &amp; Seniority filters only match Careers Zone candidates — job board applicants don't have these fields.
          </p>
        )}
      </div>

      {/* Category — CZP field */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Category <CzpBadge />
        </label>
        <select
          value={filters.category || ''}
          onChange={e => set('category', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Seniority — CZP field */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Seniority <CzpBadge />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SENIORITIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => set('seniority', filters.seniority === value ? '' : value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.seniority === value
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
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
