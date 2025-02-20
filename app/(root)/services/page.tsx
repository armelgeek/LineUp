import React from 'react'
import { auth } from '@/auth'
import { headers } from 'next/headers'
import ServiceComponent from '@/shared/components/service'
import { redirect } from 'next/navigation';

const ServicesPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if(!session) {
    return redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
    
        {session && <ServiceComponent email={session?.user.email} />}
      </div>
    </div>
  )
}

export default ServicesPage
