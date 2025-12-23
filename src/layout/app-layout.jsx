import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Building2,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  PieChart,
  Settings,
  Settings2,
  SquareTerminal,
  User,
  Moon,
  Sun,
  Users,
  FileText,
  Ticket,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ContentLoadingScreen } from "@/components/LoadingScreen";
import { useCompany } from "@/hooks/useCompany";
import { prefetchEssentialData, prefetchDriversData } from "@/lib/queryClient";
import { useTheme } from "@/contexts/ThemeContext";
import { usePermissions } from "@/hooks/usePermissions";

const AppLayout = ({ ...props }) => {
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();
  const { hasCapability, canAccess } = usePermissions();
  const companyId = user?.publicMetadata?.companyId;
  const hasPrefetched = useRef(false);

  // Use React Query for company data
  const { data: companyDetails } = useCompany(companyId);

  // Prefetch only essential data on login (just company info)
  useEffect(() => {
    if (userLoaded && user && companyId && !hasPrefetched.current) {
      hasPrefetched.current = true;
      console.log('🚀 Prefetching essential data...');
      prefetchEssentialData(getToken, companyId);
    }
  }, [userLoaded, user, companyId, getToken]);

  // Prefetch drivers data on hover (smart prefetching)
  const handleDriversHover = () => {
    if (companyId) {
      prefetchDriversData(getToken, companyId);
    }
  };

  const data = {
    user: {
      name:
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.username ||
        "User",
      email: user?.primaryEmailAddress?.emailAddress || "No email",
      avatar: user?.imageUrl || "/avatars/default.jpg",
    },
    teams: [
      {
        name: "Complyo",
        logo: "/logo.png", // Use image path instead of icon
        plan: companyDetails?.name || "Your Company",
      },
    ],
    navMain:[],
    //  [
    //   {
    //     title: "Smart Upload",
    //     url: "#",
    //     icon: SquareTerminal,
    //     isActive: true,
    //     items: [
    //       {
    //         title: "Driver's License",
    //         url: "/client/smart-upload-driver-license",
    //       },
    //       {
    //         title: "Passports",
    //         url: "/client/smart-upload-passport",
    //       },
    //     ],
    //   },
    //   {
    //     title: "Configure",
    //     url: "/",
    //     icon: SquareTerminal,
    //     isActive: true,
    //     items: [
    //       {
    //         title: "Document Types",
    //         url: "/client/document-types",
    //       },
    //       {
    //         title: "Departments",
    //         url: "#",
    //       },
    //     ],
    //   },
    //   {
    //     title: "Templates",
    //     url: "#",
    //     icon: Bot,
    //     items: [
    //       {
    //         title: "Email",
    //         url: "#",
    //       },
    //       {
    //         title: "SMS",
    //         url: "#",
    //       },
    //       {
    //         title: "Whatsapp",
    //         url: "#",
    //       },
    //     ],
    //   },
    //   {
    //     title: "Documentation",
    //     url: "#",
    //     icon: BookOpen,
    //     items: [
    //       {
    //         title: "Introduction",
    //         url: "#",
    //       },
    //       {
    //         title: "Get Started",
    //         url: "#",
    //       },
    //       {
    //         title: "Tutorials",
    //         url: "#",
    //       },
    //       {
    //         title: "Changelog",
    //         url: "#",
    //       },
    //     ],
    //   },
    //   {
    //     title: "Settings",
    //     url: "/client/settings",
    //     icon: Settings2,
    //     items: [
    //       {
    //         title: "Company Settings",
    //         url: "/client/settings",
    //       },
    //     ],
    //   },
    // ],
    projects: [
      canAccess('dashboard') && {
        name: "Dashboard",
        url: "/client/dashboard",
        icon: LayoutDashboard,
      },
      canAccess('drivers') && {
        name: "Employees",
        url: "/client/drivers",
        icon: User,
        onMouseEnter: handleDriversHover, // Prefetch on hover
      },
      {
        name: "Support Tickets",
        url: "/client/tickets",
        icon: Ticket,
      },
      canAccess('reminders') && {
        name: "Reminders",
        url: "/client/reminders",
        icon: PieChart,
      },
      canAccess('documents') && {
        name: "Document Status",
        url: "/client/document-status",
        icon: Frame,
      },
      canAccess('billing') && {
        name: "Billing",
        url: "/client/billing",
        icon: Map,
      },
      canAccess('team') && {
        name: "Team Management",
        url: "/client/team",
        icon: Users,
      },
      canAccess('audit_logs') && {
        name: "Audit Logs",
        url: "/client/audit-logs",
        icon: FileText,
      },
      canAccess('settings') && {
        name: "Settings",
        url: "/client/settings",
        icon: Settings,
      },
    ].filter(Boolean), // Remove false values from conditional items
  };

  if (!authLoaded || !userLoaded) {
    return <ContentLoadingScreen />;
  }


  return (
    <SidebarProvider>
      <div className={`flex w-full h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : ''}`}>
        <Sidebar collapsible="icon" {...props}>
          <SidebarHeader>
            <TeamSwitcher teams={data.teams} />
          </SidebarHeader>
          <SidebarContent>
            <NavProjects projects={data.projects} />
            {data.navMain && data.navMain.length > 0 && (
              <NavMain items={data.navMain} />
            )}
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={data.user} />
            <div className="px-2 py-2">
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all text-sm ${
                  isDarkMode
                    ? 'bg-slate-800 text-violet-400 hover:bg-slate-700 border border-slate-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="font-medium">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="font-medium">Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
