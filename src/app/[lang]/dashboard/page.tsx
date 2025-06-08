import { redirect } from 'next/navigation'

export default function DashboardPage({ params }: { params: { lang: string } }) {
  const lang = params.lang || 'fr'
  redirect(`/${lang}/dashboard/telecom-dashboard`)
  return null
} 
