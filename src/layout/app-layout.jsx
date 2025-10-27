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
} from "@/components/ui/sidebar";
import { ContentLoadingScreen } from "@/components/LoadingScreen";
import { useCompany } from "@/hooks/useCompany";
import { prefetchEssentialData, prefetchDriversData } from "@/lib/queryClient";

const AppLayout = ({ ...props }) => {
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
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
        name: "Logilink",
        logo: "/logo.png", // Use image path instead of icon
        plan:  "Compliance",
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
      {
        name: "Dashboard",
        url: "/client/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Drivers",
        url: "/client/drivers",
        icon: User,
        onMouseEnter: handleDriversHover, // Prefetch on hover
      },
      
      {
        name: "Reminders",
        url: "/client/reminders",
        icon: PieChart,
      },
      {
        name: "Document Status",
        url: "/client/document-status",
        icon: Frame,
      },
      {
        name: "Billing",
        url: "/client/billing",
        icon: Map,
      },
       {
        name: "Settings",
        url: "/client/settings",
        icon: Settings,
      },
    ],
  };

  if (!authLoaded || !userLoaded) {
    return <ContentLoadingScreen />;
  }


  return (
    <>
      <div className="flex w-full h-full">
        <div className="min-h-full w-fit">
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
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default AppLayout;
