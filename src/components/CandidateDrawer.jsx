import { useEffect, useState } from 'react'
import { X, ExternalLink, MapPin, Briefcase, Clock, DollarSign, Plane, Loader2 } from 'lucide-react'
import { fetchCandidate } from '../lib/api'

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
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!ref) return
    setLoading(true)
    setError(null)
    fetchCandidate(ref.id)
      .then(setCandidate)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [ref?.id])

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
            {c.currentTitle && <p className="text-sm text-gray-500 mt-0.5">{c.currentTitle}</p>}
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
                    <div className="flex items-center gap-1.5 text-gray-600 capitalize">
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                      {c.seniority}
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

                {c.linkedin && (
                  <a
                    href={c.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline mt-2"
                  >
                    <ExternalLink size={13} /> LinkedIn Profile
                  </a>
                )}
              </Section>

              {/* Skills */}
              {c.skills?.length > 0 && (
                <Section title="Skills">
                  <div className="flex flex-wrap gap-1.5">
                    {c.skills.map(s => <Tag key={s} color="brand">{s}</Tag>)}
                  </div>
                </Section>
              )}

              {/* Specialities */}
              {c.specialities?.length > 0 && (
                <Section title="Specialities">
                  <div className="flex flex-wrap gap-1.5">
                    {c.specialities.map(s => <Tag key={s} color="purple">{s}</Tag>)}
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
