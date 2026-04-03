import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useClerk } from '@clerk/clerk-react'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const { redirectToSignUp } = useClerk()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Handle Google OAuth redirect
  const handleGoogleSignIn = () => {
    redirectToSignUp({
      redirectUrl: window.location.origin + '/books',
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
      navigate('/books')
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
