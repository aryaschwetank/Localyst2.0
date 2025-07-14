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
          setStatus(`Error: ${error}`)
          setTimeout(() => router.push('/'), 3000)
          return
        }

        if (!code) {
          setStatus('No authorization code received')
          setTimeout(() => router.push('/'), 3000)
          return
        }

        setStatus('Getting access token...')

        // Use our simple API endpoint
        const tokenResponse = await fetch('/api/auth-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })

        const tokenData = await tokenResponse.json()

        if (!tokenResponse.ok) {
          throw new Error(tokenData.error || 'Token exchange failed')
        }

        setStatus('Getting user profile...')

        // Get user profile
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        const userProfile = await profileResponse.json()

        // Save to auth context
        login({
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          picture: userProfile.picture,
          accessToken: tokenData.access_token,
        })

        setStatus('Success! Redirecting...')
        
        const redirectTo = state === 'dashboard' ? '/dashboard' : '/'
        setTimeout(() => router.push(redirectTo), 1000)

      } catch (error) {
        console.error('Auth error:', error)
        setStatus('Authentication failed. Redirecting...')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    if (router.isReady && router.query.code) {
      handleCallback()
    }
  }, [router.isReady, router.query, login])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}