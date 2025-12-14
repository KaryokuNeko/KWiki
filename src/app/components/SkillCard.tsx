'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'

interface Skill {
  id: number
  nameEn: string
  nameZh: string
  descEn: string
  descZh: string
  iconUrl: string
}

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  const locale = useLocale()
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all cursor-pointer p-3">
        <div className="flex items-center gap-3">
          <img
            src={skill.iconUrl}
            alt={locale === 'en' ? skill.nameEn : skill.nameZh}
            className="w-12 h-12 object-contain"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {locale === 'en' ? skill.nameEn : skill.nameZh}
            </h3>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 left-full ml-2 top-0 w-64 p-4 bg-base-100 rounded-lg shadow-xl border border-base-300">
          <h4 className="font-bold mb-2">
            {locale === 'en' ? skill.nameEn : skill.nameZh}
          </h4>
          <p className="text-sm text-base-content/80">
            {locale === 'en' ? skill.descEn : skill.descZh}
          </p>
        </div>
      )}
    </div>
  )
}
