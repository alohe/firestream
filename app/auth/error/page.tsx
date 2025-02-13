'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/logo'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  let errorMessage = 'An error occurred during authentication'
  if (error === 'Verification') {
    errorMessage = 'The verification link has expired or is invalid. Please try signing in again.'
  } else if (error === 'AccessDenied') {
    errorMessage = 'You do not have permission to sign in.'
  } else if (error === 'Configuration') {
    errorMessage = 'There is a problem with the server configuration. Please try again later.'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow">
        <div className="flex items-center justify-center gap-2 group">
          <Logo />
        </div>
        
        <div className="text-center space-y-4 mt-6">
          <h2 className="text-2xl font-bold text-foreground">Authentication Error</h2>
          <p className="text-muted-foreground">{errorMessage}</p>
          
          <div className="mt-6">
            <Link 
              href="/auth/signin"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
