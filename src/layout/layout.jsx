import Footer from '@/components/footer'
import Header from '@/components/header'
import React from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'

const Layout = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen w-screen flex flex-col ${
      isDarkMode
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        : 'bg-white'
    }`}>
      <Header/>
      <Outlet />
      <Footer/>
    </div>
  )
}

export default Layout