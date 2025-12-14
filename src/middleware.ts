import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, locales } from './i18n/config'

export function middleware(request: NextRequest) {
  // Check if locale is already set in cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value

  if (cookieLocale && locales.includes(cookieLocale as any)) {
    // Locale already set, continue
    return NextResponse.next()
  }

  // Detect from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || ''
  let detectedLocale = defaultLocale

  // Simple language detection
  if (acceptLanguage.includes('en')) {
    detectedLocale = 'en'
  } else if (acceptLanguage.includes('zh')) {
    detectedLocale = 'zh-CN'
  }

  // Set cookie for future requests
  const response = NextResponse.next()
  response.cookies.set('NEXT_LOCALE', detectedLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  })

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}

