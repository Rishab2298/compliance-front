import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import React from 'react'
import data from "../data/data.json"
const Compliance = () => {
  return (
    <div className='flex flex-col w-full '>
    <header className="flex h-[60px] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
  
        
        <h1 className="text-base font-medium">Company Compliance</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="/client/reminder"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              Reminders
            </a>
          </Button>
        </div>
      </div>
    </header>
      <div className='py-6 gap-2 '>
        <DataTable  data={data} />
        </div>
    </div>
  )
}

export default Compliance