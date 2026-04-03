import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Order } from '../types'

export function OrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api
      .orders(token)
      .then((result) => setOrders(result.orders))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load orders'))
  }, [token])

  return (
    <section className="panel">
      <h2>My orders</h2>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="orders-list">
        {orders.map((order) => (
          <article key={order.id} className="order-row">
            <div>
              <strong>{order.orderNumber}</strong>
              <p className="muted">Status: {order.status}</p>
              {order.paymentStatus ? <p className="muted">Payment: {order.paymentStatus}</p> : null}
            </div>
            <div>
              <strong>Rs {(order.totalAmountInr ?? order.totalAmount ?? 0) / 100}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
