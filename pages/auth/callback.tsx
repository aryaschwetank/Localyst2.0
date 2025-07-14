import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../src/contexts/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const { login } = useAuth()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { code, state, error } = router.query

        if (error) {
          setStatus(`Authentication error: ${error}`)
          setTimeout(() => router.push('/'), 3000)
          return
        }

        if (!code) {
          setStatus('No authorization code received')
          setTimeout(() => router.push('/'), 3000)
          return
        }

        setStatus('Exchanging code for tokens...')

        // Exchange authorization code for access token
        const tokenResponse = await fetch('/api/auth/google-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (!tokenResponse.ok) {
          throw new Error('Token exchange failed')
        }

        const tokenData = await tokenResponse.json()

        // Get user profile
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        })

        if (!profileResponse.ok) {
          throw new Error('Failed to get user profile')
        }

        const userProfile = await profileResponse.json()

        // Login user
        login({
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          picture: userProfile.picture,
          accessToken: tokenData.access_token,
        })

        setStatus('Authentication successful! Redirecting...')

        // Redirect based on state parameter
        const redirectTo = state === 'dashboard' ? '/dashboard' : '/'
        setTimeout(() => router.push(redirectTo), 1000)

      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('Authentication failed. Redirecting to home...')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    if (router.isReady) {
      handleCallback()
    }
  }, [router, login])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Authenticating...
        </h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}