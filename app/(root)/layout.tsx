import React from 'react';

import "@uploadthing/react/styles.css";
import '@/shared/styles/globals.css';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { UserAvatar } from '@/shared/components/molecules/user-avatar';
import Link from 'next/link';
import Navbar from '@/shared/components/navbar';
interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default async function BaseLayout({ children }: RootLayoutProps) {
  const session = await auth.api.getSession({ headers: await headers() });


  return (
    <>
          <header className="z-10 flex sticky top-0 bg-background h-14 shrink-0 items-center gap-2 border-b px-4 justify-between">
             <Navbar session={session}/>
          </header>
          <main>
              {children}
          </main>
    </>
  );
}
