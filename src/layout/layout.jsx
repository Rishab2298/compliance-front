import Footer from '@/components/footer'
import Header from '@/components/header'
import React from 'react'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
   <>
   <div className='min-h-screen w-screen flex  flex-col'>
   <Header/>
   <Outlet />
   <Footer/>
   </div>
   </>
  )
}

export default Layout