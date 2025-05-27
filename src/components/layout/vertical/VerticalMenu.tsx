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
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import CustomChip from '@core/components/mui/Chip'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

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

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
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
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* Dashboard */}
        <MenuItem 
          href={`/${locale}/telecom-dashboard`}
          icon={<i className='tabler-dashboard' />}
        >
          Tableau de bord
        </MenuItem>
        
        {/* Gestion des sites */}
        <SubMenu
          label="Sites" 
          icon={<i className='tabler-building-antenna' />}
        >
          <MenuItem href={`/${locale}/sites`}>Liste des sites</MenuItem>
          <MenuItem href={`/${locale}/sites`} onClick={() => window.dispatchEvent(new CustomEvent('openAddSiteDialog'))}>Ajouter un site</MenuItem>
        </SubMenu>

        {/* Gestion des départements */}
        <SubMenu 
          label="Départements" 
          icon={<i className='tabler-building' />}
        >
          <MenuItem href={`/${locale}/departments`}>Liste des départements</MenuItem>
          <MenuItem href={`/${locale}/departments`} onClick={() => window.dispatchEvent(new CustomEvent('openAddDepartmentDialog'))}>Ajouter un département</MenuItem>
        </SubMenu>

        {/* Gestion des équipes */}
        <SubMenu 
          label="Équipes" 
          icon={<i className='tabler-users-group' />}
        >
          <MenuItem href={`/${locale}/teams`}>Liste des équipes</MenuItem>
          <MenuItem href={`/${locale}/teams`} onClick={() => window.dispatchEvent(new CustomEvent('openAddTeamDialog'))}>Ajouter une équipe</MenuItem>
        </SubMenu>

        {/* Gestion des équipements */}
        <SubMenu 
          label="Équipements" 
          icon={<i className='tabler-device-mobile' />}
        >
          <MenuItem href={`/${locale}/equipment`}>Liste des équipements</MenuItem>
          <MenuItem href={`/${locale}/equipment`} onClick={() => window.dispatchEvent(new CustomEvent('openAddEquipmentDialog'))}>Ajouter un équipement</MenuItem>
        </SubMenu>

        {/* Spécifications */}
        <SubMenu 
          label="Spécifications" 
          icon={<i className='tabler-list-details' />}
        >
          <MenuItem href={`/${locale}/specifications`}>Liste des spécifications</MenuItem>
          <MenuItem href={`/${locale}/specifications`} onClick={() => window.dispatchEvent(new CustomEvent('openAddSpecificationDialog'))}>Ajouter une spécification</MenuItem>
        </SubMenu>
      </Menu>
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary)} />
      </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
