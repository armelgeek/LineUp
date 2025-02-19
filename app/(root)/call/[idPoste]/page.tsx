import React from 'react'
import CallComponent from '@/shared/components/call'
import { headers } from 'next/headers'
import { auth } from '@/auth';

const Page = async ({ params }: { params: Promise<{ idPoste: string }> }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    const email = session?.user?.email as string | undefined;
    return (
        <CallComponent params={params} email={email ?? ""} />
    )
}

export default Page
