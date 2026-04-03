import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useClerk, useUser } from '@clerk/clerk-react'

export function LoginPage() {
  const { signIn, signUp, setAuthFromStorage } = useAuth()
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const { redirectToSignUp } = useClerk()
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Get the page to redirect to after login
  const from = (location.state as any)?.from || '/books'

  // Handle Clerk OAuth callback - sync with backend
  useEffect(() => {
    // Skip auto-auth if we just logged out (within 2 seconds)
    const logoutTimeStr = localStorage.getItem('vas_logout_time')
    if (logoutTimeStr) {
      const logoutTime = parseInt(logoutTimeStr, 10)
      const timeSinceLogout = Date.now() - logoutTime
      if (timeSinceLogout < 2000) {
        // Just logged out, skip auto-auth
        localStorage.removeItem('vas_logout_time')
        return
      }
      // Cleanup old logout marker
      localStorage.removeItem('vas_logout_time')
    }

    // Only auto-auth if Clerk says we're signed in and we don't have a backend token
    const hasBackendToken = localStorage.getItem('vas_token')
    
    if (isLoaded && isSignedIn && clerkUser && !hasBackendToken) {
      handleClerkAuth()
    }
  }, [isLoaded, isSignedIn, clerkUser])

  async function handleClerkAuth() {
    try {
      setLoading(true)
      const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress
      const clerkName = clerkUser?.firstName && clerkUser?.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser?.firstName || 'User'
      const clerkUsername = clerkUser?.username || `clerk_${clerkUser?.id?.slice(0, 8)}`

      if (!clerkEmail) {
        throw new Error('No email found from Clerk')
      }

      // Call backend OAuth sync endpoint
      const response = await fetch('http://127.0.0.1:3212/auth/oauth-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: clerkName,
          email: clerkEmail,
          username: clerkUsername,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'OAuth sync failed')
      }

      const data = await response.json()
      
      // Store token in localStorage using the same key as AuthContext
      localStorage.setItem('vas_token', data.token)
      localStorage.setItem('vas_user', JSON.stringify(data.user))
      
      // Immediately update AuthContext state
      setAuthFromStorage()
      
      // Navigate back to requested page or to books
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Clerk auth error:', err)
      setError(err instanceof Error ? err.message : 'Clerk authentication failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth redirect
  const handleGoogleSignIn = () => {
    redirectToSignUp({
      redirectUrl: window.location.origin + '/login',
    })
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signin') {
        await signIn(emailOrUsername, password)
      } else {
        await signUp(name, email, password, username)
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-hero panel">
        <p className="auth-kicker">Vivek Anjan Shrivastava</p>
        <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-copy">
          Sign in to buy books, manage your cart, and keep track of your orders. The account area is designed to
          stay simple, readable, and consistent with the rest of the site.
        </p>
        <div className="auth-points">
          <div>
            <strong>Books</strong>
            <span>Browse featured titles and library stock.</span>
          </div>
          <div>
            <strong>Cart</strong>
            <span>Add books and check out from one place.</span>
          </div>
          <div>
            <strong>Orders</strong>
            <span>Review purchase history and payment status.</span>
          </div>
        </div>
      </div>

      <section className="auth-card panel narrow">
        <h2>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
        <p className="auth-subtitle">
          {mode === 'signin'
            ? 'Use your username or email with your password to continue.'
            : 'Create an account with a username and email to get started.'}
        </p>
        <form onSubmit={onSubmit} className="form-grid auth-form">
          {mode === 'signin' ? (
            <label>
              Username or Email
              <input 
                value={emailOrUsername} 
                onChange={(e) => setEmailOrUsername(e.target.value)} 
                placeholder="your_username or name@example.com" 
                required 
              />
            </label>
          ) : (
            <>
              <label>
                Full Name
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your full name" 
                  required 
                />
              </label>
              <label>
                Username
                <input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Choose a unique username"
                  minLength={3}
                  required 
                />
              </label>
              <label>
                Email
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  required 
                />
              </label>
            </>
          )}
          <label>
            Password
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              minLength={8}
              required 
            />
          </label>
          {error ? <p className="error-text auth-error">{error}</p> : null}
          <button disabled={loading} type="submit" className="auth-submit">
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>Or continue with</span>
        </div>
        
        <button type="button" onClick={handleGoogleSignIn} className="auth-google-btn">
          <i className="fab fa-google"></i> Sign in with Google
        </button>
        
        <button className="ghost auth-switch" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </section>
    </section>
  )
}
