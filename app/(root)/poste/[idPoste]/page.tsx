import React from 'react'

import PostComponent from '@/shared/components/post';
import { auth } from '@/auth';
import { headers } from 'next/headers';
const Page = async ({ params }: { params: Promise<{ idPoste: string }> }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email as string | undefined;
const { idPoste } = await params;
  return (
     <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PostComponent idPoste={idPoste} email={email ?? ""}  />
      </div>
    </div>
  );
}

export default Page
