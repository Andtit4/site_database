import { UserDataType } from '@/contexts/AuthContext'
import { NavItemsType } from '@/layouts/navigationTypes'

// Crée la structure de menu basée sur les rôles utilisateur
const navigation = (): NavItemsType => {
  return [
    {
      title: 'Tableau de bord',
      icon: 'ri-dashboard-line',
      path: '/telecom-dashboard'
    },
    {
      title: 'Gestion des sites',
      icon: 'ri-map-pin-line',
      path: '/sites'
    },
    {
      title: 'Équipements',
      icon: 'ri-device-line',
      path: '/equipment'
    },
    {
      title: 'Équipes',
      icon: 'ri-team-line',
      path: '/teams'
    },
    {
      title: 'Départements',
      icon: 'ri-building-line',
      path: '/departments'
    }
  ]
}

export default navigation 
