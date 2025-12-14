'use client'

import { useLocale, useTranslations } from 'next-intl'

interface Item {
  id: number
  nameEn: string
  nameZh: string
  descEn: string
  descZh: string
  imageUrl: string
  rarity: string | null
}

interface ItemGalleryProps {
  items: Item[]
}

const rarityColors: Record<string, string> = {
  common: 'badge-neutral',
  rare: 'badge-info',
  epic: 'badge-secondary',
  legendary: 'badge-accent',
}

export function ItemGallery({ items }: ItemGalleryProps) {
  const locale = useLocale()
  const t = useTranslations('homepage')

  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">{t('items.title')}</h2>
          <p className="text-base-content/70">{t('items.empty')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-base-100 py-8 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          {t('items.title')}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map(item => (
            <a
              key={item.id}
              href={`/wiki/item/${item.id}`}
              className="card bg-base-200 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              <figure className="h-32 bg-base-300 p-4">
                <img
                  src={item.imageUrl}
                  alt={locale === 'en' ? item.nameEn : item.nameZh}
                  className="h-full w-full object-contain"
                />
              </figure>
              <div className="card-body p-3">
                <h3 className="font-semibold text-sm truncate">
                  {locale === 'en' ? item.nameEn : item.nameZh}
                </h3>
                {item.rarity && (
                  <span className={`badge badge-sm ${rarityColors[item.rarity] || 'badge-neutral'}`}>
                    {item.rarity}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/wiki/items" className="btn btn-primary btn-outline">
            {t('actions.viewMore')}
          </a>
        </div>
      </div>
    </div>
  )
}
