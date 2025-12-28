import Footer from '@/components/footer'
import Header from '@/components/header'
import React from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'

const Layout = () => {
  const { isDarkMode } = useTheme();

  return (
    <>
      {/* Global decorative gradients - fixed to viewport */}
      {isDarkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none z-0" />
        </>
      )}

      <div className={`min-h-screen w-screen flex flex-col relative ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-white'
      }`}>
        <Header/>
        <Outlet />
        <Footer/>
      </div>
    </>
  )
}

export default Layout