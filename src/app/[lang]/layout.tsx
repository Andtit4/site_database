// Next Imports
import { headers } from 'next/headers'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Component Imports
import { AuthChecker } from '@/components/AuthChecker'

export const metadata = {
  title: 'Site Database - Gestion des sites de télécommunications',
  description:
    'Site Database - Application de gestion des sites, équipements et équipes de télécommunications. Interface moderne et intuitive pour la gestion complète de votre infrastructure.',
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  }
}

const RootLayout = async (props: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
  const params = await props.params

  const { children } = props

  // Vars
  const headersList = await headers()
  const systemMode = await getSystemMode()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction} suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png" />
          <link rel="shortcut icon" href="/images/logo.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/images/logo.png" />
        </head>
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
          <AuthChecker />
          {children}
        </body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout
