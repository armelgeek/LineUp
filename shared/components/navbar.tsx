"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Monitor, Settings, LogOut, GlobeLock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from './molecules/user-avatar'
import { useEffect, useState } from 'react'
import { checkAndAddUser, getCompanyPageName } from '@/app/(root)/account/_actions'
import SettingsModal from '@/app/(root)/account/settings/setting-modal'

const Navbar = ({session}: {session: any}) => {
  const pathname = usePathname()

   const [pageName, setPageName] = useState<string | null>(null);

  const isActive = (path: string) => {
    return pathname === path
  }


  useEffect(() => {
    const init = async () => {
      if (session) {
        await checkAndAddUser(session.user.email, session.user.name);
        const page = await getCompanyPageName(session.user.email);
        if (page) {
          setPageName(page);
        }
      }
    };
    init();
  }, [session]);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Postes',
      href: '/poste_list',
      icon: Monitor
    },
    {
      label: 'Services',
      href: '/services',
      icon: Settings
    }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="px-[10%]  relative">
        <div className="relative flex items-center justify-between py-2">
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-2"
          >
            <span className="text-xl font-bold text-blue-600">LineUp</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              )
            })}
           
              {session && <SettingsModal email={session?.user.email} pageName={pageName} onPageNameChange={setPageName} />}
               {pageName && (
                <Button variant="secondary" asChild>
                  <Link target='_blank' href={`/page/${pageName}`}>
                    <GlobeLock className="w-4 h-4" />
                    <p className='ml-2'>{pageName}</p>
                  </Link>
                </Button>
              )}
          </div>

            {session ? (
                <>
                  
                  <UserAvatar
                    isAnonymous={session.user.isAnonymous ?? false}
                    user={{
                      name: session.user.name,
                      email: session.user.email,
                      avatar: session.user.image,
                    }}
                  />
                </>
              ) : (
                <Link href="/login" passHref>
                  Sign in
                </Link>
              )}
        
        </div>
      </div>
    </nav>
  )
}

export default Navbar