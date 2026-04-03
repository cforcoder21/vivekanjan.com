import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { booksData } from '../data/books-data'
import type { Book } from '../types'

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api
      .getBooks()
      .then((result) => setBooks(result.books))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load books'))
      .finally(() => setLoading(false))
  }, [])

  async function addToCart(bookId: number) {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      await api.addToCart(token, bookId, 1)
      alert('Added to cart')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not add to cart')
    }
  }

  return (
    <div className="books-page">
      <section className="panel books-hero">
        <h2 className="section-heading">My Books</h2>
        <p className="section-sub">Poetry collections and reflections from the heart.</p>
      </section>

      <section className="books-section">
        <h3 className="books-section-title">Featured Books</h3>
        <div className="book-grid featured-book-grid">
          {booksData.map((book) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="book-card featured-book-card book-card-link"
            >
              <img src={book.coverImage} alt={book.title} className="book-cover" />
              <h4>{book.title}</h4>
              {book.subtitle ? <p className="muted">{book.subtitle}</p> : null}
              <p className="book-description-preview">{book.description}</p>
              <div className="btn-view-details">View Details & Buy</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="books-section">
        <h3 className="books-section-title">All Books from the Library</h3>
        {loading ? <p>Loading books...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && books.length === 0 ? <p className="muted">No backend books were returned, so the featured collection is shown above.</p> : null}
        <div className="book-grid">
          {books.map((book) => (
            <article key={book.id} className="book-card">
              {book.coverImage ? <img src={book.coverImage} alt={book.title} className="book-cover" /> : null}
              <h4>{book.title}</h4>
              <p className="muted">{book.subtitle || 'Hindi literature'}</p>
              <p>{book.description?.slice(0, 140)}...</p>
              <div className="book-meta">
                <span>{book.currency} {book.price}</span>
                <span>Stock: {book.stockQuantity}</span>
              </div>
              <div className="buy-link-row">
                <button disabled={book.stockQuantity <= 0} onClick={() => addToCart(book.id)}>
                  {book.stockQuantity <= 0 ? 'Out of stock' : 'Add to cart'}
                </button>
                {book.buyLinks?.map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="btn-secondary">
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
