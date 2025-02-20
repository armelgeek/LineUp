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
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <PageList email={session?.user.email} />
            </div>
        </div>
    )
}

export default Page
