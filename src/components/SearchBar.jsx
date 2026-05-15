import { Search, Sparkles, Code2, Type } from 'lucide-react'

const MODES = [
  { id: 'simple',  label: 'Simple',  icon: Type,     tip: 'Search by keyword across name, skills and title' },
  { id: 'boolean', label: 'Boolean', icon: Code2,    tip: 'Use AND / OR / NOT  e.g.  unity AND mobile NOT junior' },
  { id: 'ai',      label: 'AI',      icon: Sparkles, tip: 'Natural language  e.g.  senior Unity dev in Finland open to relocation' },
]

export default function SearchBar({ query, mode, onQueryChange, onModeChange, onSearch, loading }) {
  const currentMode = MODES.find(m => m.id === mode)

  const handleKey = (e) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            title={m.tip}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === m.id
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <m.icon size={14} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={currentMode.tip}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm text-sm"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>
    </div>
  )
}
