import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { GalleryVerticalEnd } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'

const Header = () => {
  return (
   <>
   <header className='w-full h-[80px] flex items-center justify-between py-4 px-16 bg-slate-100 '>
    <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Compliance
          </a>
        </div>
      <SignedOut>
        <SignInButton>
            <Button className="bg-black text-white cursor-pointer">Sign In</Button>
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
