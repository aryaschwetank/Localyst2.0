import React, { useEffect } from 'react';
import { getProviders, signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

interface SignInProps {
  providers: Record<string, Provider>;
}

export default function SignIn({ providers }: SignInProps) {
  const router = useRouter();
  const { callbackUrl = '/' } = router.query;

  useEffect(() => {
    // Redirect to home page since we don't use this page anymore
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  // If user is already signed in, redirect to dashboard
  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  const providers = await getProviders();
  
  return {
    props: {
      providers: providers ?? {},
    },
  };
};