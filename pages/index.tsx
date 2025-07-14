import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const handleCreateStore = async () => {
    console.log('🔘 Button clicked, session:', session, 'status:', status)
    
    if (!session) {
      console.log('🔐 Redirecting to Google OAuth...')
      // Use direct redirect instead of signIn
      window.location.href = 'https://localyst2-0.vercel.app/api/auth/signin/google?callbackUrl=' + encodeURIComponent('https://localyst2-0.vercel.app/dashboard')
      return
    }
    
    console.log('✅ User authenticated, redirecting to dashboard...')
    setLoading(true)
    router.push('/dashboard')
  };

  const handleExploreServices = () => {
    router.push('/explore');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">L</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Localyst
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {status === 'loading' ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : session ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="hidden sm:block text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300 font-medium"
                  >
                    Dashboard
                  </button>
                  <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-50 rounded-full px-2 sm:px-4 py-2">
                    <img
                      className="h-6 w-6 sm:h-8 sm:w-8 rounded-full ring-2 ring-blue-200"
                      src={session.user?.image || ''}
                      alt={session.user?.name || ''}
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:block">
                      {session.user?.name?.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-500 hover:text-red-600 px-2 sm:px-3 py-2 rounded-lg transition duration-300 text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Enhanced Design */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-20 sm:pb-32">
          <div className="text-center">
            {/* Main Heading */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6">
                <span className="block text-gray-900 mb-2">Welcome to</span>
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
                  Localyst
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Create your professional online store in 
                <span className="font-bold text-blue-600"> 30 seconds </span>
                using AI-powered technology
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 px-4">
              {['🤖 AI-Powered', '⚡ Lightning Fast', '🌍 Multi-Language', '📱 Mobile Ready'].map((feature) => (
                <span 
                  key={feature}
                  className="px-3 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-gray-700 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-2xl mx-auto px-4">
              <button
                onClick={handleCreateStore}
                disabled={loading}
                className="group relative w-full sm:w-auto overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span className="text-sm sm:text-lg">Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl sm:text-2xl">🏪</span>
                      <span className="text-sm sm:text-lg">I'm a Business Owner</span>
                    </>
                  )}
                </div>
                {!session && (
                  <div className="mt-1 text-xs opacity-75">Sign in required</div>
                )}
              </button>

              <button
                onClick={handleExploreServices}
                className="group w-full sm:w-auto bg-white/90 backdrop-blur-sm hover:bg-white text-purple-700 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-purple-500/25 border border-purple-200"
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <span className="text-xl sm:text-2xl">🔍</span>
                  <span className="text-sm sm:text-lg">I'm Looking for Services</span>
                </div>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-4">Trusted by businesses worldwide</p>
              <div className="flex items-center space-x-8 opacity-60">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-4">
              Powerful Features
            </h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Why Choose Localyst?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, manage, and grow your local business online
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Creation',
                description: 'Generate professional content in multiple languages using advanced AI technology',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast Setup',
                description: 'Create and launch your professional store in under 30 seconds',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: '🌍',
                title: 'Global Reach',
                description: 'Support for Hindi, Bengali, Tamil, Telugu & English languages',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl text-white text-3xl mb-6 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of successful businesses using Localyst to reach more customers and grow their revenue
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleCreateStore}
              className="group bg-white hover:bg-gray-50 text-blue-600 font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-white/25"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🚀</span>
                <span className="text-lg">Start Building Now</span>
              </div>
            </button>
            
            <button
              onClick={handleExploreServices}
              className="group border-2 border-white/30 hover:border-white/60 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👁️</span>
                <span className="text-lg">View Examples</span>
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { number: '1000+', label: 'Stores Created' },
              { number: '50+', label: 'Cities' },
              { number: '5', label: 'Languages' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}