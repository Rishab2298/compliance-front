import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Settings,
  Moon,
  Sun,
  Shield,
  BarChart3,
  FileText,
  Sparkles,
  ScrollText,
  FileCheck,
  Ticket,
} from "lucide-react";
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
import { useTheme } from "@/contexts/ThemeContext";

const SuperAdminLayout = ({ ...props }) => {
  const { isLoaded: authLoaded } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();

  const data = {
    user: {
      name:
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.username ||
        "Super Admin",
      email: user?.primaryEmailAddress?.emailAddress || "No email",
      avatar: user?.imageUrl || "/avatars/default.jpg",
    },
    teams: [
      {
        name: "Complyo",
        logo: "/logo.png",
        plan: "Super Admin",
      },
    ],
    navMain: [],
    projects: [
      {
        name: "Dashboard",
        url: "/super-admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Tickets",
        url: "/super-admin/tickets",
        icon: Ticket,
      },
      {
        name: "Policies",
        url: "/super-admin/policies",
        icon: FileText,
      },
      {
        name: "Companies",
        url: "/super-admin/companies",
        icon: Building2,
      },
      {
        name: "Users",
        url: "/super-admin/users",
        icon: Users,
      },
      // {
      //   name: "Analytics",
      //   url: "/super-admin/analytics",
      //   icon: BarChart3,
      // },
      {
        name: "AI Usage",
        url: "/super-admin/ai-usage",
        icon: Sparkles,
      },
      // {
      //   name: "System Logs",
      //   url: "/super-admin/logs",
      //   icon: ScrollText,
      // },
      {
        name: "Consent Logs",
        url: "/super-admin/consent-logs",
        icon: FileCheck,
      },
      // {
      //   name: "Security Logs",
      //   url: "/super-admin/security-logs",
      //   icon: Shield,
      // },
      {
        name: "Billing",
        url: "/super-admin/billing",
        icon: CreditCard,
      },
      // {
      //   name: "Settings",
      //   url: "/super-admin/settings",
      //   icon: Settings,
      // },
    ],
  };

  if (!authLoaded || !userLoaded) {
    return <ContentLoadingScreen />;
  }

  return (
    <SidebarProvider>
      <div className={`flex w-full h-screen overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-white'}`}>
        <Sidebar
          collapsible="icon"
          className={isDarkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200'}
          {...props}
        >
          <SidebarHeader>
            <TeamSwitcher teams={data.teams} />
          </SidebarHeader>
          <SidebarContent>
            <NavProjects projects={data.projects} />
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
        <SidebarInset className="overflow-y-auto">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdminLayout;
