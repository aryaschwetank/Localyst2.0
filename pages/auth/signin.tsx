import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function SignIn() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to home page since we don't use this page anymore
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Redirecting to home...</p>
      </div>
    </div>
  )
}