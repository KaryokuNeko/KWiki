import { auth } from "@/auth"
import { getTranslations } from "next-intl/server"
import { ProfileEditor } from "./components/ProfileEditor"
import { ThemeLanguageSettings } from "./components/ThemeLanguageSettings"

export default async function ProfilePage() {
  const session = await auth()
  const t = await getTranslations('profile')
  const tCommon = await getTranslations('common')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">{t('title')}</h2>

          {/* Account Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('sections.account')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('fields.username')}</span>
                </label>
                <input
                  type="text"
                  value={(session?.user as any)?.preferred_username || tCommon('common.na')}
                  disabled
                  className="input input-bordered bg-base-200"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('fields.email')}</span>
                </label>
                <input
                  type="text"
                  value={session?.user?.email || tCommon('common.na')}
                  disabled
                  className="input input-bordered bg-base-200"
                />
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('sections.preferences')}</h3>
            <ThemeLanguageSettings />
          </div>

          <div className="divider"></div>

          {/* Profile Editor */}
          <ProfileEditor />
        </div>
      </div>
    </div>
  )
}
