'use client'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useAuth } from '@/hooks/useAuth'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { user } = useAuth()

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  const ScrollWrapper = verticalNavOptions.isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(verticalNavOptions.isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Menu pour la gestion des télécommunications */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* Dashboard */}
        <MenuItem 
          href={`/${locale}/dashboard/telecom-dashboard`}
          icon={<i className='tabler-dashboard' />}
        >
          Tableau de bord
        </MenuItem>
        
        {/* Gestion des sites */}
        <MenuItem 
          href={`/${locale}/dashboard/sites`}
          icon={<i className='tabler-building-antenna' />}
        >
          Sites
        </MenuItem>

        {/* Gestion des équipements */}
        <MenuItem 
          href={`/${locale}/dashboard/equipment`}
          icon={<i className='tabler-device-mobile' />}
        >
          Équipements
        </MenuItem>

        {/* Gestion des équipes */}
        <MenuItem 
          href={`/${locale}/dashboard/teams`}
          icon={<i className='tabler-users-group' />}
        >
          Équipes
        </MenuItem>

        {/* Gestion des départements */}
        <MenuItem 
          href={`/${locale}/dashboard/departments`}
          icon={<i className='tabler-building' />}
        >
          Départements
        </MenuItem>

        {/* Spécifications */}
        <SubMenu 
          label="Spécifications" 
          icon={<i className='tabler-list-details' />}
        >
          <MenuItem href={`/${locale}/dashboard/specifications`}>Équipements</MenuItem>
          <MenuItem href={`/${locale}/dashboard/site-specifications`}>Sites</MenuItem>
          <MenuItem href={`/${locale}/dashboard/departments-specifications`}>Par Département</MenuItem>
        </SubMenu>

        {/* Menu de gestion des utilisateurs - uniquement visible pour les admins */}
        {user?.isAdmin && (
          <MenuItem 
            href={`/${locale}/dashboard/users`}
            icon={<i className='tabler-user-settings' />}
          >
            Gestion des utilisateurs
          </MenuItem>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
