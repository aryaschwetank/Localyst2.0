import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../src/contexts/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { user, logout } = useAuth()

  const handleCreateStore = () => {
    console.log('🔘 Button clicked, user:', user)
    
    if (!user) {
      console.log('🔐 Starting Google OAuth...')
      
      const googleClientId = '327482679565-kha6bmflarl6ol3orsvlcr3jsdrrcutn.apps.googleusercontent.com'
      const redirectUri = encodeURIComponent('https://localyst2-0.vercel.app/auth/callback')
      const scope = encodeURIComponent('openid profile email')
      const state = encodeURIComponent('dashboard')
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=${scope}&` +
        `state=${state}`
      
      window.location.href = googleAuthUrl
      return
    }
    
    console.log('✅ User authenticated, redirecting to dashboard')
    setLoading(true)
    router.push('/dashboard')
  }

  const handleExploreServices = () => {
    router.push('/explore')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Localyst
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-700">Hi, {user.name}</span>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Rest of your homepage content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Your existing homepage content goes here */}
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-8">
            Welcome to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Localyst
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Create your professional online store in <span className="text-blue-600 font-semibold">30 seconds</span> using AI-powered technology
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <button
              onClick={handleCreateStore}
              disabled={loading}
              className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🏪</span>
                  <span>I'm a Business Owner</span>
                </div>
              )}
            </button>

            <button
              onClick={handleExploreServices}
              className="group w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-medium py-4 px-8 rounded-xl text-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🔍</span>
                <span>I'm Looking for Services</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}