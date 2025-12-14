import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateUserProfile } from '@/lib/user-profile'
import { locales } from '@/i18n/config'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ errorCode: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { locale } = await request.json()

    if (!locale || !locales.includes(locale)) {
      return NextResponse.json({ errorCode: 'INVALID_LOCALE' }, { status: 400 })
    }

    const keycloakId = (session.user as any).sub
    await updateUserProfile(keycloakId, { preferredLocale: locale })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update locale preference:', error)
    return NextResponse.json(
      { errorCode: 'FAILED', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
