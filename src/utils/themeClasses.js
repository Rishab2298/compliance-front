/**
 * Utility functions for theme-aware class names
 * Follows the homepage color theme: blue → violet → purple gradient for dark mode
 */

export const getThemeClasses = {
  // Background classes
  bg: {
    primary: (isDark) => isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gray-50',
    card: (isDark) => isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200',
    header: (isDark) => isDark ? 'bg-slate-900/95 backdrop-blur-xl border-slate-800' : 'bg-white border-gray-200',
    hover: (isDark) => isDark ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50',
    input: (isDark) => isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300',
    secondary: (isDark) => isDark ? 'bg-slate-800' : 'bg-gray-50',
  },

  // Text classes
  text: {
    primary: (isDark) => isDark ? 'text-white' : 'text-gray-900',
    secondary: (isDark) => isDark ? 'text-slate-400' : 'text-gray-500',
    muted: (isDark) => isDark ? 'text-slate-500' : 'text-gray-400',
    gradient: (isDark) => isDark ? 'text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text' : 'text-gray-900',
    accent: (isDark) => isDark ? 'text-violet-400' : 'text-gray-700',
  },

  // Border classes
  border: {
    primary: (isDark) => isDark ? 'border-slate-800' : 'border-gray-200',
    secondary: (isDark) => isDark ? 'border-slate-700' : 'border-gray-300',
    accent: (isDark) => isDark ? 'border-violet-500/20' : 'border-gray-200',
  },

  // Button classes
  button: {
    primary: (isDark) => isDark
      ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 text-white'
      : 'bg-gray-800 text-white hover:bg-gray-900',
    secondary: (isDark) => isDark
      ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
      : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300',
    outline: (isDark) => isDark
      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
      : 'border-gray-300 text-gray-700 hover:bg-gray-50',
  },

  // Badge classes
  badge: {
    default: (isDark) => isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-gray-100 text-gray-800 border-gray-200',
    success: (isDark) => isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-800 border-green-200',
    warning: (isDark) => isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: (isDark) => isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-800 border-red-200',
    info: (isDark) => isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-200',
  },

  // Alert classes
  alert: {
    critical: (isDark) => isDark
      ? 'bg-red-500/10 border-red-500/30 text-red-400'
      : 'bg-red-50 border-red-200 text-red-900',
    warning: (isDark) => isDark
      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      : 'bg-yellow-50 border-yellow-200 text-yellow-900',
    success: (isDark) => isDark
      ? 'bg-green-500/10 border-green-500/30 text-green-400'
      : 'bg-green-50 border-green-200 text-green-900',
    info: (isDark) => isDark
      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      : 'bg-blue-50 border-blue-200 text-blue-900',
  },

  // Card variants
  card: {
    stat: (isDark) => isDark
      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
      : 'bg-white border-gray-200 hover:border-gray-300',
    elevated: (isDark) => isDark
      ? 'bg-slate-900 border-slate-800 shadow-xl shadow-slate-950/50'
      : 'bg-white border-gray-200 shadow-sm',
  },

  // Icon backgrounds
  iconBg: {
    primary: (isDark) => isDark
      ? 'bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-purple-500/20 text-violet-400'
      : 'bg-gray-100 text-gray-600',
    success: (isDark) => isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600',
    warning: (isDark) => isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600',
    danger: (isDark) => isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600',
  },

  // Input/Form elements
  input: {
    default: (isDark) => isDark
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-violet-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500',
  },
};

// Helper function to combine multiple theme classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
