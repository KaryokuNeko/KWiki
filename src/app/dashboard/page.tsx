import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const tDashboard = await getTranslations('dashboard')

  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold mb-4">{tDashboard('welcome')}</h1>
      <p className="text-base-content/70">{tDashboard('description')}</p>
    </div>
  )
}
