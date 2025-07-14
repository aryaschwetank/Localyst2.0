import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  const errorMessages: { [key: string]: string } = {
    Configuration: 'There was a problem with the server configuration. Please check environment variables.',
    AccessDenied: 'Access was denied. Please try again.',
    Verification: 'The verification token has expired or has already been used.',
    OAuthSignin: 'Error in constructing an authorization URL.',
    OAuthCallback: 'Error in handling the response from an OAuth provider.',
    OAuthCreateAccount: 'Could not create OAuth account in the database.',
    EmailCreateAccount: 'Could not create email account in the database.',
    Callback: 'Error in the OAuth callback handler route.',
    OAuthAccountNotLinked: 'The email on the account is already linked, but not with this OAuth account.',
    EmailSignin: 'Sending the e-mail with the verification token failed.',
    CredentialsSignin: 'The authorize callback returned null in the Credentials provider.',
    SessionRequired: 'The content of this page requires you to be signed in at all times.',
    Default: 'An authentication error occurred. Please try again.'
  }

  useEffect(() => {
    console.log('🚨 Auth error details:', { error, query: router.query })
  }, [error, router.query])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              {errorMessages[error as string] || errorMessages.Default}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-700 font-mono">
                Error Code: {error}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}