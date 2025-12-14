import { getTranslations } from 'next-intl/server'

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getTranslations('wiki')

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-8">
      <div className="card bg-base-100 shadow-xl max-w-2xl w-full">
        <div className="card-body text-center">
          <h1 className="card-title text-3xl md:text-4xl justify-center mb-4">
            {t('character.title')}
          </h1>
          <p className="text-xl mb-2">{t('character.id')}: {id}</p>
          <p className="text-base-content/60 mb-8">
            {t('character.comingSoon')}
          </p>
          <div className="card-actions justify-center">
            <a href="/" className="btn btn-primary">
              {t('backToHome')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
