import { MapPin, Briefcase, Clock, ExternalLink } from 'lucide-react'

const STATUS_COLORS = {
  'Applied-to-event':        'bg-blue-50 text-blue-700 border-blue-200',
  'Submitted-to-Talent-Board': 'bg-purple-50 text-purple-700 border-purple-200',
  'Available':               'bg-green-50 text-green-700 border-green-200',
  'Not Available':           'bg-gray-100 text-gray-500 border-gray-200',
  'Placed':                  'bg-emerald-50 text-emerald-700 border-emerald-200',
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
  const statusClass   = STATUS_COLORS[candidate.status]    || 'bg-gray-100 text-gray-500 border-gray-200'
  const seniorityClass = SENIORITY_COLORS[candidate.seniority?.toLowerCase()] || 'bg-gray-100 text-gray-600'

  const location = [candidate.city, candidate.country].filter(Boolean).join(', ')

  // Job title: use currentTitle if set, else first speciality as role descriptor
  const jobTitle = candidate.currentTitle || candidate.specialities?.[0] || ''

  // Prefer SKILLS (recruiter-tagged); fall back to Skill_Set if empty
  const primarySkills = candidate.skills?.length > 0 ? candidate.skills : (candidate.skillSet || [])
  const topSkills  = primarySkills.slice(0, 5)
  const moreSkills = primarySkills.length - 5

  const topSpecialities = (candidate.specialities || []).slice(0, 3)

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-brand-300 cursor-pointer transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
            {candidate.name}
          </h3>
          {jobTitle && (
            <p className="text-sm text-gray-500 truncate">{jobTitle}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${statusClass}`}>
          {candidate.status || 'Unknown'}
        </span>
      </div>

      {/* Category + Seniority */}
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

      {/* Meta */}
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

      {/* Skills */}
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {topSkills.map(s => (
            <span key={s} className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md">
              {s}
            </span>
          ))}
          {moreSkills > 0 && (
            <span className="text-xs px-2 py-0.5 text-gray-400">+{moreSkills} more</span>
          )}
        </div>
      )}

      {/* Specialities */}
      {topSpecialities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topSpecialities.map(s => (
            <span key={s} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
