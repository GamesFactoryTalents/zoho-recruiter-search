import { useEffect, useState } from 'react'
import { X, ExternalLink, MapPin, Briefcase, Clock, DollarSign, Plane, Loader2, Sparkles, ChevronDown, ChevronUp, Github, Globe } from 'lucide-react'
import { fetchCandidate, summarizeCandidate } from '../lib/api'

const SENIORITY_LABELS = {
  trainee:  'Trainee / Student',
  junior:   'Junior',
  mid:      'Mid-level',
  senior:   'Senior',
  lead:     'Lead',
  manager:  'Manager',
  director: 'Director',
}

function Tag({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-100 text-gray-700',
    brand:  'bg-brand-50 text-brand-700',
    green:  'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  }
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-md ${colors[color]}`}>
      {children}
    </span>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{title}</h4>
      {children}
    </div>
  )
}

export default function CandidateDrawer({ candidate: ref, onClose }) {
  const [candidate, setCandidate]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [summary, setSummary]       = useState(null)
  const [sumLoading, setSumLoading] = useState(false)
  const [sumError, setSumError]     = useState(null)
  const [notesOpen, setNotesOpen]   = useState(false)

  useEffect(() => {
    if (!ref) return
    setLoading(true)
    setError(null)
    setSummary(null)
    setSumError(null)
    setNotesOpen(false)
    fetchCandidate(ref.id)
      .then(setCandidate)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [ref?.id])

  const handleSummarize = async () => {
    if (!candidate) return
    setSumLoading(true)
    setSumError(null)
    try {
      const result = await summarizeCandidate(candidate)
      setSummary(result)
    } catch (e) {
      setSumError(e.message)
    } finally {
      setSumLoading(false)
    }
  }

  const c = candidate || ref

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{c.name}</h2>
            {(c.currentTitle || c.specialities?.[0]) && (
              <p className="text-sm text-gray-500 mt-0.5">{c.currentTitle || c.specialities?.[0]}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading full profile…
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {c && (
            <>
              {/* Key info */}
              <Section title="Overview">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {c.category && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Briefcase size={13} className="text-gray-400" />
                      {c.category}
                    </div>
                  )}
                  {c.seniority && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                      {SENIORITY_LABELS[c.seniority] || c.seniority}
                    </div>
                  )}
                  {(c.city || c.country) && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin size={13} className="text-gray-400" />
                      {[c.city, c.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {c.relocation != null && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Plane size={13} className="text-gray-400" />
                      {c.relocation ? 'Open to relocation' : 'No relocation'}
                    </div>
                  )}
                  {c.experienceYears != null && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock size={13} className="text-gray-400" />
                      {c.experienceYears} yrs total
                    </div>
                  )}
                  {c.gamingYears != null && c.gamingYears > 0 && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock size={13} className="text-gray-400" />
                      {c.gamingYears} yrs gaming
                    </div>
                  )}
                  {c.expectedSalary && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <DollarSign size={13} className="text-gray-400" />
                      {c.expectedSalary}
                    </div>
                  )}
                  {c.status && (
                    <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      {c.status}
                    </div>
                  )}
                </div>

                {(c.linkedin || c.github || c.portfolio) && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {c.linkedin && (
                      <a href={c.linkedin} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
                        <ExternalLink size={13} /> LinkedIn
                      </a>
                    )}
                    {c.github && (
                      <a href={c.github} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:underline">
                        <Github size={13} /> GitHub
                      </a>
                    )}
                    {c.portfolio && (
                      <a href={c.portfolio} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
                        <Globe size={13} /> Portfolio
                      </a>
                    )}
                  </div>
                )}
              </Section>

              {/* Screening Notes — collapsible */}
              {c.screeningNotes && (
                <div className="mb-5">
                  <button
                    onClick={() => setNotesOpen(v => !v)}
                    className="flex items-center justify-between w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Screening Notes · Interviewed
                    </span>
                    {notesOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {notesOpen && (
                    <div className="mt-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {c.screeningNotes}
                    </div>
                  )}
                </div>
              )}

              {/* AI Summary */}
              <div className="mb-5">
                {!summary && !sumLoading && (
                  <button
                    onClick={handleSummarize}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-sm hover:bg-brand-100 transition-colors disabled:opacity-40"
                  >
                    <Sparkles size={14} /> Generate AI summary
                  </button>
                )}
                {sumLoading && (
                  <div className="flex items-center gap-2 text-sm text-brand-600 py-2">
                    <Loader2 size={14} className="animate-spin" /> Generating summary…
                  </div>
                )}
                {sumError && <p className="text-xs text-red-500 mt-1">{sumError}</p>}
                {summary && (
                  <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 space-y-3">
                    {summary.headline && (
                      <p className="text-sm font-semibold text-brand-800">{summary.headline}</p>
                    )}
                    {summary.summary && (
                      <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
                    )}
                    {summary.strengths?.length > 0 && (
                      <ul className="space-y-1">
                        {summary.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                            <span className="text-brand-400 mt-0.5">✦</span> {s}
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      onClick={() => setSummary(null)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Specialities */}
              {c.specialities?.length > 0 && (
                <Section title="Specialities">
                  <div className="flex flex-wrap gap-1.5">
                    {c.specialities.map(s => <Tag key={s} color="purple">{s}</Tag>)}
                  </div>
                </Section>
              )}

              {/* Skills (recruiter-tagged) */}
              {c.skills?.length > 0 && (
                <Section title="Skills">
                  <div className="flex flex-wrap gap-1.5">
                    {c.skills.map(s => <Tag key={s} color="brand">{s}</Tag>)}
                  </div>
                </Section>
              )}

              {/* Skill Set — from CV/LinkedIn import, shown for all candidates */}
              {c.skillSet?.length > 0 && !c.skills?.length && (
                <Section title="Skills (from CV)">
                  <div className="flex flex-wrap gap-1.5">
                    {c.skillSet.map(s => <Tag key={s} color="gray">{s}</Tag>)}
                  </div>
                </Section>
              )}
              {c.skillSet?.length > 0 && c.skills?.length > 0 && (
                <Section title="Additional Skills (CV)">
                  <div className="flex flex-wrap gap-1.5">
                    {c.skillSet.map(s => <Tag key={s} color="gray">{s}</Tag>)}
                  </div>
                </Section>
              )}

              {/* Engines / Platforms / Genres */}
              {(c.engines?.length > 0 || c.platforms?.length > 0 || c.genres?.length > 0) && (
                <Section title="Gaming Stack">
                  {c.engines?.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-400 mr-2">Engines</span>
                      {c.engines.map(e => <Tag key={e} color="orange">{e}</Tag>)}
                    </div>
                  )}
                  {c.platforms?.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-400 mr-2">Platforms</span>
                      {c.platforms.map(p => <Tag key={p}>{p}</Tag>)}
                    </div>
                  )}
                  {c.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs text-gray-400 mr-2">Genres</span>
                      {c.genres.map(g => <Tag key={g}>{g}</Tag>)}
                    </div>
                  )}
                </Section>
              )}

              {/* Work preferences */}
              {c.workPreferences?.length > 0 && (
                <Section title="Work Preferences">
                  <div className="flex flex-wrap gap-1.5">
                    {c.workPreferences.map(w => <Tag key={w} color="green">{w}</Tag>)}
                  </div>
                </Section>
              )}

              {/* Game titles */}
              {c.gameTitles && (
                <Section title="Shipped Titles / Apps">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.gameTitles}</p>
                </Section>
              )}

              {/* Tasks */}
              {c.tasks && (
                <Section title="Tasks & Responsibilities">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.tasks}</p>
                </Section>
              )}

              {/* Motivation */}
              {c.motivation && (
                <Section title="Motivation">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.motivation}</p>
                </Section>
              )}

              {/* Expectations */}
              {c.expectations && (
                <Section title="Expectations">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.expectations}</p>
                </Section>
              )}

              {/* Achievements */}
              {c.achievements && (
                <Section title="Achievements">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.achievements}</p>
                </Section>
              )}

              {/* Zoho link */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href={`https://recruit.zoho.eu/recruit/EntityInfo.do?module=Candidates&id=${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 hover:underline"
                >
                  <ExternalLink size={13} /> Open in Zoho Recruit
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
