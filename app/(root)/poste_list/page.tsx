import React from 'react'
import PageList from '@/shared/components/page-list'
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { headers } from 'next/headers';

const Page = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if(!session) {
        return redirect("/login");
    }
    return (
        <>
           <PageList email={session?.user.email} />
        </>
    )
}

export default Page
