import { useTheme } from "@/contexts/ThemeContext"

// Full-screen loading (for initial app load, auth checks, etc.)
export default function LoadingScreen() {
  const { isDarkMode } = useTheme()

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gray-50'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className={`absolute inset-0 border-4 rounded-full ${isDarkMode ? 'border-violet-500/20' : 'border-gray-300'}`}></div>
          <div className={`absolute inset-0 border-4 border-t-transparent rounded-full animate-spin ${isDarkMode ? 'border-violet-500' : 'border-gray-800'}`}></div>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Loading...</p>
      </div>
    </div>
  );
}

// Content-area loading (for use inside AppLayout - doesn't cover sidebar/nav)
export function ContentLoadingScreen() {
  const { isDarkMode } = useTheme()

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className={`absolute inset-0 border-4 rounded-full ${isDarkMode ? 'border-violet-500/20' : 'border-gray-300'}`}></div>
          <div className={`absolute inset-0 border-4 border-t-transparent rounded-full animate-spin ${isDarkMode ? 'border-violet-500' : 'border-gray-800'}`}></div>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Loading...</p>
      </div>
    </div>
  );
}
