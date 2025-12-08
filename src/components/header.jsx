import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Shield } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { useTheme } from '@/contexts/ThemeContext'

const Header = () => {
  const { isDarkMode } = useTheme();

  return (
   <>
   <header className={`w-full h-[80px] flex items-center justify-between py-4 px-4 md:px-8 lg:px-16 border-b ${
     isDarkMode
       ? 'bg-slate-900/95 backdrop-blur-xl border-slate-800'
       : 'bg-slate-100 border-slate-200'
   }`}>
    <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-3 font-medium group">
            <div className={`p-2 rounded-lg transition-all ${
              isDarkMode
                ? 'bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/50'
                : 'bg-primary text-primary-foreground'
            }`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className={isDarkMode
              ? 'text-xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent'
              : 'text-xl font-bold text-slate-900'
            }>
              Compliance
            </span>
          </a>
        </div>
      <SignedOut>
        <SignInButton>
            <Button className={isDarkMode
              ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 text-white cursor-pointer'
              : 'bg-black text-white cursor-pointer hover:bg-slate-800'
            }>
              Sign In
            </Button>
            </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
    </>
  )
}

export default Header
