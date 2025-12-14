'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { SkillCard } from './SkillCard'

interface Skill {
  id: number
  nameEn: string
  nameZh: string
  descEn: string
  descZh: string
  iconUrl: string
  order: number
}

interface Character {
  id: number
  nameEn: string
  nameZh: string
  descEn: string
  descZh: string
  imageUrl: string
  skills: Skill[]
}

interface CharacterShowcaseProps {
  characters: Character[]
}

export function CharacterShowcase({ characters }: CharacterShowcaseProps) {
  const locale = useLocale()
  const t = useTranslations('homepage')
  const [currentIndex, setCurrentIndex] = useState(0)

  if (characters.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">{t('characters.title')}</h2>
          <p className="text-base-content/70">{t('characters.empty')}</p>
        </div>
      </div>
    )
  }

  const character = characters[currentIndex]

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-base-200">
      {/* Left side - Character info */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 order-2 md:order-1">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          {locale === 'en' ? character.nameEn : character.nameZh}
        </h2>
        <p className="text-base md:text-lg text-base-content/80 mb-8 line-clamp-4">
          {locale === 'en' ? character.descEn : character.descZh}
        </p>

        {/* Skills grid */}
        {character.skills.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {character.skills.slice(0, 4).map(skill => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <a
            href={`/wiki/character/${character.id}`}
            className="btn btn-primary"
          >
            {t('actions.learnMore')}
          </a>

          {/* Character navigation */}
          {characters.length > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + characters.length) % characters.length)}
                className="btn btn-circle btn-outline btn-sm"
                aria-label="Previous character"
              >
                ❮
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % characters.length)}
                className="btn btn-circle btn-outline btn-sm"
                aria-label="Next character"
              >
                ❯
              </button>
            </div>
          )}
        </div>

        {/* Character indicator */}
        {characters.length > 1 && (
          <div className="flex gap-2 mt-4">
            {characters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-primary w-6' : 'bg-base-300'
                }`}
                aria-label={`Go to character ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right side - Character image */}
      <div className="w-full md:w-1/2 h-64 md:h-full relative order-1 md:order-2">
        <img
          src={character.imageUrl}
          alt={locale === 'en' ? character.nameEn : character.nameZh}
          className="w-full h-full object-contain md:object-cover object-center"
        />
      </div>
    </div>
  )
}
