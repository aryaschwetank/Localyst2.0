import type { AppProps } from 'next/app'
import { AuthProvider } from '../src/contexts/AuthContext'
import '../src/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}