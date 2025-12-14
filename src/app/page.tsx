import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SignInButton } from "./components/SignInButton"
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const session = await auth()
  const t = await getTranslations('auth')
  const tCommon = await getTranslations('common')

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-center mb-4">
              <h1 className="card-title text-4xl font-bold justify-center mb-2">
                {tCommon('app.name')}
              </h1>
              <p className="text-base-content/60">
                {t('welcome')}
              </p>
            </div>

            <div className="space-y-4">
              <SignInButton />
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-base-content/60">
                {t('instruction')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
