import React from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useTheme } from '@/contexts/ThemeContext'
import { Separator } from '@/components/ui/separator'
import { ChevronRight } from 'lucide-react'

/**
 * Shared dashboard header component with mobile hamburger menu
 * @param {string} title - Page title
 * @param {React.ReactNode} children - Optional action buttons or content
 * @param {Array} breadcrumbs - Optional breadcrumbs array [{label, href}]
 * @param {string} className - Optional additional classes
 */
export const DashboardHeader = ({ title, children, breadcrumbs, className = '' }) => {
  const { isDarkMode } = useTheme()

  return (
    <header className={`sticky top-0 z-10 flex h-14 md:h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6 ${
      isDarkMode
        ? 'bg-slate-900/95 backdrop-blur-xl border-slate-800'
        : 'bg-white/95 backdrop-blur-xl border-gray-200'
    } ${className}`}>
      {/* Mobile hamburger menu */}
      <SidebarTrigger className="md:hidden -ml-1" />
      <Separator orientation="vertical" className="mr-2 h-6 md:hidden" />

      {/* Title and breadcrumbs */}
      <div className="flex flex-1 items-center gap-2 overflow-hidden">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className={`hover:underline ${
                      isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={isDarkMode ? 'text-slate-200 font-semibold' : 'text-gray-900 font-semibold'}>
                    {crumb.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} />
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : (
          <h1 className={`text-base md:text-lg font-semibold truncate ${
            isDarkMode ? 'text-slate-100' : 'text-gray-900'
          }`}>
            {title}
          </h1>
        )}
      </div>

      {/* Action buttons or custom content */}
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </header>
  )
}

export default DashboardHeader
