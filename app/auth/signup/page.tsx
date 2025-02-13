'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import Loader from '@/components/loader'
import { redirect } from 'next/navigation'
import Logo from '@/components/logo'

export default function SignupPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (typeof window !== 'undefined') {
    const checkSession = async () => {
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      if (session) {
        redirect('/')
      }
    }
    checkSession()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('resend', {
        email,
        callbackUrl: '/overview',
        redirect: false,
      })

      if (result?.error) {
        toast.error('Failed to sign up. Please try again.')
      } else {
        setEmailSent(true)
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow">
        {emailSent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3 ring-8 ring-primary/5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
                  <title>Success</title>
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
            <p className="text-muted-foreground">
              We&apos;ve sent a magic link to <span className="font-medium">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Can&apos;t find the email? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setEmailSent(false)}
                className="text-primary hover:text-primary/90"
              >
                try again
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 group">
              <Logo />
            </div>
            <h2 className="text-center text-2xl font-bold text-foreground my-3">
              Create your account
            </h2>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => signIn('google', { callbackUrl: '/overview' })}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <title>Google</title>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-input" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or</span>
              </div>
            </div>

            <form className="space-y-2" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-background"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group disabled:opacity-50 relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 text-primary-foreground" />
                      Sending magic link...
                    </span>
                  ) : (
                    'Sign up with Email'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
