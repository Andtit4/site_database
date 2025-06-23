import type { UserDataType } from '@/contexts/AuthContext'
import type { NavItemsType } from '@/layouts/navigationTypes'

// Crée la structure de menu basée sur les rôles utilisateur
const navigation = (userData?: UserDataType): NavItemsType => {
  const menuItems: NavItemsType = [
    {
      title: 'Tableau de bord',
      icon: 'ri-dashboard-line',
      path: '/dashboard/telecom-dashboard'
    },
    {
      title: 'Gestion des sites',
      icon: 'ri-map-pin-line',
      path: '/dashboard/sites'
    },
    {
      title: 'Équipements',
      icon: 'ri-device-line',
      path: '/dashboard/equipment'
    },
    {
      title: 'Équipes',
      icon: 'ri-team-line',
      path: '/dashboard/teams'
    },
    {
      title: 'Départements',
      icon: 'ri-building-line',
      path: '/dashboard/departments'
    },
    {
      title: 'Configuration',
      icon: 'ri-settings-line',
      children: [
        {
          title: 'Spécifications d\'équipements',
          path: '/dashboard/specifications'
        },

        /* {
          title: 'Spécifications de sites',
          path: '/dashboard/site-specifications'
        }, */
        {
          title: 'Champs personnalisés des sites',
          path: '/dashboard/custom-fields'
        }
      ]
    }
  ]

  // Ajouter le menu de gestion des utilisateurs uniquement pour les admins
  if (userData?.isAdmin) {
    menuItems.push({
      title: 'Gestion des utilisateurs',
      icon: 'ri-user-settings-line',
      path: '/dashboard/users'
    })
  }

  return menuItems
}

export default navigation 
