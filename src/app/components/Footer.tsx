import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('common')

  return (
    <footer className="w-full flex flex-col items-center justify-center bg-base-200 py-8 px-4">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-2">
          {t('app.name')}
        </h3>
        <p className="text-base-content/70 mb-4">
          {t('app.description')}
        </p>
      </div>

      <div className="text-center text-sm text-base-content/60">
        <p>© {new Date().getFullYear()} K-Wiki. All rights reserved.</p>
      </div>
    </footer>
  )
}
