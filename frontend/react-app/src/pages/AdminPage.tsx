import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Book } from '../types'

export function AdminPage() {
  const { token } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [stockInputs, setStockInputs] = useState<Record<number, number>>({})

  useEffect(() => {
    api.getBooks().then((result) => {
      setBooks(result.books)
      const defaults: Record<number, number> = {}
      result.books.forEach((b) => {
        defaults[b.id] = 1
      })
      setStockInputs(defaults)
    })
  }, [])

  async function update(bookId: number, operation: 'add' | 'subtract' | 'set') {
    if (!token) return
    const quantity = Number(stockInputs[bookId] || 0)
    if (quantity < 0 || Number.isNaN(quantity)) return

    try {
      await api.updateBookStock(token, bookId, operation, quantity)
      const refreshed = await api.getBooks()
      setBooks(refreshed.books)
      alert('Stock updated successfully')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Stock update failed')
    }
  }

  return (
    <section className="panel">
      <h2>Admin inventory dashboard</h2>
      <p className="muted">Increase, decrease, or set stock directly.</p>
      <div className="admin-grid">
        {books.map((book) => (
          <article key={book.id} className="admin-card">
            <h3>{book.title}</h3>
            <p>Current stock: <strong>{book.stockQuantity}</strong></p>
            <label>
              Quantity
              <input
                type="number"
                min={0}
                value={stockInputs[book.id] ?? 1}
                onChange={(e) =>
                  setStockInputs((prev) => ({
                    ...prev,
                    [book.id]: Number(e.target.value),
                  }))
                }
              />
            </label>
            <div className="button-row">
              <button onClick={() => update(book.id, 'add')}>Increase</button>
              <button onClick={() => update(book.id, 'subtract')}>Decrease</button>
              <button onClick={() => update(book.id, 'set')}>Set exact</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
