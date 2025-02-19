import React from 'react'

import PostComponent from '@/shared/components/post';
import { auth } from '@/auth';
import { headers } from 'next/headers';
const Page = async ({ params }: { params: Promise<{ idPoste: string }> }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email as string | undefined;
  return (
    <>
      <PostComponent params={params} email={email ?? ""}  />
    </>
  );
}

export default Page
