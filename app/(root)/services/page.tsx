import React from 'react'
import { auth } from '@/auth'
import { headers } from 'next/headers';
import ServiceComponent from '@/shared/components/service';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if(!session) {
    return redirect("/login");
  }
  return (
    <div className="px-5 md:px-[10%] mt-8 mb-10">
      {session && <ServiceComponent email={session?.user.email} />}
    </div>
  );
}
