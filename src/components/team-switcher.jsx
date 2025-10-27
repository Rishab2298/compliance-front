import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
export function TeamSwitcher({
  teams,
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  // Update activeTeam when teams prop changes
  React.useEffect(() => {
    if (teams && teams[0]) {
      setActiveTeam(teams[0])
    }
  }, [teams])

  if (!activeTeam) {
    return null
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="flex items-center justify-center rounded-lg aspect-square size-10">
            {typeof activeTeam.logo === 'string' ? (
              <img
                src={activeTeam.logo}
                alt={activeTeam.name}
                className="object-contain rounded-lg size-10"
              />
            ) : (
              <div className="flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground size-10">
                <activeTeam.logo className="size-5" />
              </div>
            )}
          </div>
          <div className="grid flex-1 leading-tight text-left">
            <span className="text-base font-black leading-tight uppercase truncate font-montserrat">{activeTeam.name}</span>
            <span className="text-xs truncate text-muted-foreground">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}