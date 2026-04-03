import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBookById } from '../data/books-data'
import { CheckoutModal } from '../components/CheckoutModal'

export function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useAuth()
  const [showCheckout, setShowCheckout] = useState(false)

  const book = bookId ? getBookById(bookId) : null

  if (!book) {
    return (
      <div className="book-detail-page">
        <div className="panel narrow">
          <p>Book not found.</p>
          <button onClick={() => navigate('/books')} className="btn-primary">Back to Books</button>
        </div>
      </div>
    )
  }

  function handleBuyHere() {
    if (!token) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setShowCheckout(true)
  }

  return (
    <div className="book-detail-page">
      <div className="book-detail-container">
        <button onClick={() => navigate('/books')} className="btn-back">
          <i className="fa-solid fa-arrow-left" /> Back to Books
        </button>

        <section className="book-detail-hero">
          <div className="book-detail-cover-wrapper">
            <img src={book.coverImage} alt={book.title} className="book-detail-cover" />
          </div>

          <article className="book-detail-content">
            <h1 className="book-detail-title">{book.title}</h1>
            {book.subtitle ? <p className="book-detail-subtitle">{book.subtitle}</p> : null}

            <div className="book-price-section">
              <span className="book-price">₹{book.price}</span>
            </div>

            <section className="book-detail-description">
              <h3>About this book</h3>
              <p>{book.fullDescription}</p>
            </section>

            <section className="book-detail-actions">
              <h3>Get this book</h3>
              <div className="buy-actions-grid">
                <button onClick={handleBuyHere} className="btn-buy-here">
                  <i className="fa-solid fa-shopping-bag" /> Buy Here
                </button>
                <div className="external-links">
                  <h4>Or buy from</h4>
                  <div className="buy-links-grid">
                    {book.buyLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-buy-primary"
                      >
                        <i className="fa-solid fa-book" /> {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </article>
        </section>
      </div>

      {showCheckout && user && (
        <CheckoutModal book={book} onClose={() => setShowCheckout(false)} user={user} />
      )}
    </div>
  )
}
