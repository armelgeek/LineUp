import React  from 'react'
import { auth } from '@/auth'
import Dashboard from '@/shared/components/dashboard'
import { headers } from 'next/headers'
const Page = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    return(
        <Dashboard email={session?.user.email}/>
    )
}

export default Page
