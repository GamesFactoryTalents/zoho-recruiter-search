import { useState } from 'react'
import { MapPin, Briefcase, Clock, ClipboardList, ChevronDown, ChevronUp, FileSearch } from 'lucide-react'

const STATUS_COLORS = {
  'Applied-to-event':          'bg-blue-50 text-blue-700 border-blue-200',
  'Submitted-to-Talent-Board': 'bg-purple-50 text-purple-700 border-purple-200',
  'Available':                 'bg-green-50 text-green-700 border-green-200',
  'Not Available':             'bg-gray-100 text-gray-500 border-gray-200',
  'Placed':                    'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const SENIORITY_COLORS = {
  trainee:  'bg-teal-50 text-teal-700',
  junior:   'bg-sky-50 text-sky-700',
  mid:      'bg-indigo-50 text-indigo-700',
  senior:   'bg-violet-50 text-violet-700',
  lead:     'bg-orange-50 text-orange-700',
  manager:  'bg-amber-50 text-amber-700',
  director: 'bg-rose-50 text-rose-700',
}

export default function CandidateCard({ candidate, onClick }) {
  const [notesOpen, setNotesOpen] = useState(false)

  const statusClass    = STATUS_COLORS[candidate.status] || 'bg-gray-100 text-gray-500 border-gray-200'
  const seniorityClass = SENIORITY_COLORS[candidate.seniority?.toLowerCase()] || 'bg-gray-100 text-gray-600'

  const location = [candidate.city, candidate.country].filter(Boolean).join(', ')

  // Title: CZP candidates fill currentTitle or specialities; direct applicants usually have neither
  const jobTitle = candidate.currentTitle || candidate.specialities?.[0] || ''

  // CZP-tagged skills (blue) vs CV-imported Skill_Set (gray)
  const czpSkills  = candidate.skills || []
  const cvSkills   = candidate.skillSet || []
  const hasCzpSkills = czpSkills.length > 0

  const displaySkills = hasCzpSkills ? czpSkills : cvSkills
  const topSkills     = displaySkills.slice(0, 5)
  const moreSkills    = displaySkills.length - 5

  // CZP-only fields — only shown when populated
  const topSpecialities = (candidate.specialities || []).slice(0, 3)
  const hasBadges = candidate.category || candidate.seniority
  const hasMeta   = location || candidate.experienceYears != null ||
                    (candidate.gamingYears != null && candidate.gamingYears > 0)

  // Gaming stack — CZP only
  const topEngines   = (candidate.engines   || []).slice(0, 3)
  const topPlatforms = (candidate.platforms || []).slice(0, 4)
  const hasGamingStack = topEngines.length > 0 || topPlatforms.length > 0

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-brand-300 cursor-pointer transition-all group"
    >
      {/* Header — always shown */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
              {candidate.name}
            </h3>
            {candidate.screeningNotes && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                <ClipboardList size={9} /> Interviewed
              </span>
            )}
          </div>
          {jobTitle && (
            <p className="text-sm text-gray-500 truncate">{jobTitle}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${statusClass}`}>
          {candidate.status || 'Unknown'}
        </span>
      </div>

      {/* Category + Seniority — CZP only, skip div entirely when both empty */}
      {hasBadges && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {candidate.category && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {candidate.category}
            </span>
          )}
          {candidate.seniority && (
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${seniorityClass}`}>
              {candidate.seniority}
            </span>
          )}
        </div>
      )}

      {/* Meta — location always available; exp/gaming years are CZP-only */}
      {hasMeta && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {location}
            </span>
          )}
          {candidate.experienceYears != null && (
            <span className="flex items-center gap-1">
              <Briefcase size={11} /> {candidate.experienceYears}yr exp
            </span>
          )}
          {candidate.gamingYears != null && candidate.gamingYears > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {candidate.gamingYears}yr gaming
            </span>
          )}
        </div>
      )}

      {/* Skills — blue for CZP-tagged, gray for CV-imported */}
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {topSkills.map(s => (
            <span
              key={s}
              className={`text-xs px-2 py-0.5 rounded-md ${
                hasCzpSkills
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s}
            </span>
          ))}
          {moreSkills > 0 && (
            <span className="text-xs px-2 py-0.5 text-gray-400">+{moreSkills} more</span>
          )}
        </div>
      )}

      {/* Specialities — CZP only, already conditional */}
      {topSpecialities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topSpecialities.map(s => (
            <span key={s} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Gaming stack — engines + platforms, CZP only */}
      {hasGamingStack && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {topEngines.map(e => (
            <span key={e} className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md">
              {e}
            </span>
          ))}
          {topPlatforms.map(p => (
            <span key={p} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* CV excerpt — shown in CV search mode */}
      {candidate.cvExcerpt && (
        <div className="mt-3 border-t border-amber-100 pt-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 mb-1.5">
            <FileSearch size={11} />
            CV match
          </div>
          <p className="text-xs text-gray-600 leading-relaxed italic bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
            {candidate.cvExcerpt}
          </p>
        </div>
      )}

      {/* Screening notes toggle */}
      {candidate.screeningNotes && (
        <div className="mt-3 border-t border-gray-100 pt-2.5">
          <button
            onClick={e => { e.stopPropagation(); setNotesOpen(v => !v) }}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <ClipboardList size={12} />
            {notesOpen ? 'Hide' : 'Read'} screening notes
            {notesOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {notesOpen && (
            <div
              onClick={e => e.stopPropagation()}
              className="mt-2 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-emerald-50 rounded-lg px-3 py-2.5 max-h-48 overflow-y-auto border border-emerald-100"
            >
              {candidate.screeningNotes}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
