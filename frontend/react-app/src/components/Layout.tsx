import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-top">
          <div className="header-spacer" />
          <div className="title-wrap">
            <Link to="/" className="site-title">Vivek Anjan Shrivastava</Link>
            <span className="brand-subtitle">Writer · Motivator · IT Professional</span>
          </div>
          <div className="header-icons">
            <Link to="/cart" className="icon-link icon-link-cart" aria-label="Cart" title="Cart">
              <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="icon-link icon-link-profile" aria-label="Profile" title="Profile">
                  <i className="fa-solid fa-circle-user" aria-hidden="true" />
                </Link>
                <button type="button" onClick={signOut} className="btn-logout">Logout</button>
              </>
            ) : (
              <Link to="/login" className="icon-link">Login</Link>
            )}
          </div>
        </div>
        <nav className="main-nav">
          <div className="nav-item"><NavLink to="/">Home</NavLink></div>
          <div className="nav-item"><NavLink to="/about">About me</NavLink></div>
          <div className="nav-item"><a href="https://vivekanjan.blogspot.in/" target="_blank" rel="noreferrer">Blog</a></div>
          <div className="nav-item"><NavLink to="/books">Books</NavLink></div>
          <div className="nav-item"><NavLink to="/published">Published</NavLink></div>
          <div className="nav-item"><a href="/#newsletter">Newsletter</a></div>
          <div className="nav-item"><NavLink to="/contact">Contact</NavLink></div>
          <div className="nav-item"><NavLink to="/orders">Orders</NavLink></div>
          {user?.role === 'admin' ? <div className="nav-item"><NavLink to="/admin">Admin</NavLink></div> : null}
        </nav>
      </header>
      <main className="page">{children}</main>
    </div>
  )
}
