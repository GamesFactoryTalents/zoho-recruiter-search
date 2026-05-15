import { useState, useCallback, useEffect } from 'react'
import { Users, AlertCircle, ChevronDown, Sparkles, FileSearch } from 'lucide-react'
import SearchBar      from './components/SearchBar'
import FilterPanel    from './components/FilterPanel'
import CandidateCard  from './components/CandidateCard'
import CandidateDrawer from './components/CandidateDrawer'
import { searchCandidates } from './lib/api'

export default function App() {
  const [query,       setQuery]       = useState('')
  const [mode,        setMode]        = useState('simple')
  const [filters,     setFilters]     = useState({})
  const [interviewed, setInterviewed] = useState(false)
  const [results,     setResults]     = useState(null)   // null = not searched yet
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)
  const [aiNote,      setAiNote]      = useState(null)
  const [selected,    setSelected]    = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)

  // Generate a realistic-looking mock CV excerpt for UI preview
  const mockCvExcerpt = (candidate) => {
    const skills   = candidate.skills?.length  ? candidate.skills  : candidate.skillSet || []
    const yrs      = candidate.experienceYears
    const cat      = candidate.category || 'game development'
    const picked   = skills.slice(0, 3).join(', ') || cat

    const snippets = [
      `…proficient in ${picked}, delivered multiple shipped titles across ${yrs || 3}+ years. Led cross-functional teams and drove technical decisions from pre-production through release…`,
      `…${yrs || 2} years of hands-on experience with ${picked}. Collaborated with designers and artists to implement gameplay systems, achieving a 40% reduction in iteration time…`,
      `…core responsibilities included ${picked} development, code review, and mentoring junior developers. Shipped 3 titles on PC and console platforms…`,
      `…strong background in ${picked}. Worked in agile teams of 8–15 people, contributing to all stages of the development pipeline from prototype to certification…`,
    ]
    return snippets[Math.floor(candidate.id?.charCodeAt(candidate.id.length - 1) || 0) % snippets.length]
  }

  const doSearch = useCallback(async (reset = true) => {
    const p = reset ? 1 : page + 1
    if (reset) { setLoading(true); setResults(null); setAiNote(null) }
    else setLoadingMore(true)
    setError(null)

    try {
      // CV mode: run as AI search under the hood, then inject mock CV excerpts
      const searchMode = mode === 'cv' ? 'ai' : mode
      const data = await searchCandidates({ query, mode: searchMode, filters: { ...filters, ...(interviewed ? { interviewed: true } : {}) }, page: p })

      const candidates = mode === 'cv' && query.trim()
        ? data.candidates.map(c => ({ ...c, cvExcerpt: mockCvExcerpt(c) }))
        : data.candidates

      if (reset) {
        setResults(candidates)
      } else {
        setResults(prev => [...(prev || []), ...candidates])
      }
      setHasMore(data.more)
      setPage(p)
      if (data.explanation) setAiNote(data.explanation)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [query, mode, filters, interviewed, page])

  const handleSearch = () => doSearch(true)
  const handleLoadMore = () => doSearch(false)

  // Auto-load all candidates on mount
  useEffect(() => { doSearch(true) }, [])

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (interviewed ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">CZP Recruiter</h1>
              <p className="text-xs text-gray-400">Candidate Search</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Left sidebar — filters */}
          <aside className="w-56 shrink-0 hidden lg:block">
            <FilterPanel filters={filters} onChange={f => { setFilters(f) }} />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Search bar */}
            <SearchBar
              query={query}
              mode={mode}
              onQueryChange={setQuery}
              onModeChange={setMode}
              onSearch={handleSearch}
              loading={loading}
              interviewed={interviewed}
              onInterviewedChange={setInterviewed}
            />

            {/* Mobile filters */}
            <div className="lg:hidden">
              <FilterPanel filters={filters} onChange={setFilters} />
            </div>

            {/* CV mode banner */}
            {mode === 'cv' && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                <FileSearch size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <span className="font-semibold">CV Search — preview mode</span>
                  <span className="text-amber-700"> · Candidates are matched by profile. CV excerpts below are illustrative — full CV indexing not yet enabled.</span>
                </div>
              </div>
            )}

            {/* AI explanation */}
            {aiNote && mode !== 'cv' && (
              <div className="flex items-start gap-2 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-sm text-brand-700">
                <Sparkles size={15} className="mt-0.5 shrink-0" />
                <span>{aiNote}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-gray-100 rounded-full w-16" />
                      <div className="h-5 bg-gray-100 rounded-full w-12" />
                    </div>
                    <div className="flex gap-1.5">
                      {[...Array(3)].map((_, j) => <div key={j} className="h-5 bg-gray-100 rounded w-14" />)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {!loading && results !== null && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {results.length === 0
                      ? 'No candidates found'
                      : `${results.length}${hasMore ? '+' : ''} candidate${results.length !== 1 ? 's' : ''}`}
                    {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
                  </p>
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Users size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No candidates match your search.</p>
                    <p className="text-xs mt-1">Try different keywords or clear some filters.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {results.map(c => (
                        <CandidateCard key={c.id} candidate={c} onClick={() => setSelected(c)} />
                      ))}
                    </div>

                    {hasMore && (
                      <div className="flex justify-center pt-2">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-white hover:border-brand-300 hover:text-brand-600 transition-all disabled:opacity-50"
                        >
                          {loadingMore ? 'Loading…' : <><ChevronDown size={15} /> Load more</>}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Empty state — not searched yet */}
            {!loading && results === null && !error && (
              <div className="text-center py-20 text-gray-300">
                <Users size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-sm text-gray-400">Search for candidates above</p>
                <p className="text-xs text-gray-300 mt-1">
                  Use Simple, Boolean, or AI mode
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate drawer */}
      {selected && (
        <CandidateDrawer candidate={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
