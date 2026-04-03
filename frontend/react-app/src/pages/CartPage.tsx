import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { CartItem, Order } from '../types'

const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector('script[data-rzp="1"]')
    if (existing) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.rzp = '1'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function CartPage() {
  const { token, user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState({
    shippingName: user?.name || '',
    shippingEmail: user?.email || '',
    shippingAddress: '',
    shippingCity: '',
    shippingPincode: '',
    shippingPhone: '',
    notes: '',
  })

  const total = useMemo(() => items.reduce((sum, item) => sum + item.lineTotal, 0), [items])

  async function loadCart() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.getCart(token)
      setItems(result.items as CartItem[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCart()
  }, [token])

  async function handleCheckout(event: FormEvent) {
    event.preventDefault()
    if (!token) return

    try {
      const result = await api.checkout(token, shipping)
      setCheckoutOrder(result.order)
      await loadCart()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Checkout failed')
    }
  }

  async function payNow() {
    if (!token || !checkoutOrder) return

    try {
      const paymentInit = await api.initiatePayment(token, checkoutOrder.orderNumber)
      const loaded = await loadRazorpayScript()

      if (!loaded || !window.Razorpay || !razorpayKey) {
        alert(
          'Razorpay key/script missing. Set VITE_RAZORPAY_KEY_ID in frontend .env to open payment modal. Payment order was created successfully.',
        )
        return
      }

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: paymentInit.amount,
        currency: paymentInit.currency,
        name: 'Vivek Anjan Bookstore',
        description: 'Book purchase',
        order_id: paymentInit.razorpay_order_id,
        prefill: {
          name: paymentInit.customer_name,
          email: paymentInit.customer_email,
        },
        handler: async (response: Record<string, string>) => {
          await api.verifyPayment(token, {
            orderId: checkoutOrder.orderNumber,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          alert('Payment successful and verified.')
          setCheckoutOrder(null)
        },
      })

      rzp.open()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Payment initiation failed')
    }
  }

  return (
    <section className="panel two-col">
      <div>
        <h2>Cart</h2>
        {loading ? <p>Loading cart...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {items.length === 0 ? <p className="muted">Your cart is empty.</p> : null}
        <div className="cart-list">
          {items.map((item) => (
            <article key={item.itemId} className="cart-row">
              <div>
                <strong>{item.book.title}</strong>
                <p className="muted">Qty: {item.quantity}</p>
              </div>
              <div>Rs {item.lineTotal}</div>
            </article>
          ))}
        </div>
        <p className="cart-total">Subtotal: Rs {total}</p>
      </div>

      <div>
        <h2>Checkout</h2>
        <form onSubmit={handleCheckout} className="form-grid">
          <label>
            Full name
            <input
              value={shipping.shippingName}
              onChange={(e) => setShipping((p) => ({ ...p, shippingName: e.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={shipping.shippingEmail}
              onChange={(e) => setShipping((p) => ({ ...p, shippingEmail: e.target.value }))}
              required
            />
          </label>
          <label>
            Address
            <input
              value={shipping.shippingAddress}
              onChange={(e) => setShipping((p) => ({ ...p, shippingAddress: e.target.value }))}
              required
            />
          </label>
          <label>
            City
            <input
              value={shipping.shippingCity}
              onChange={(e) => setShipping((p) => ({ ...p, shippingCity: e.target.value }))}
              required
            />
          </label>
          <label>
            Pincode
            <input
              value={shipping.shippingPincode}
              onChange={(e) => setShipping((p) => ({ ...p, shippingPincode: e.target.value }))}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={shipping.shippingPhone}
              onChange={(e) => setShipping((p) => ({ ...p, shippingPhone: e.target.value }))}
              required
            />
          </label>
          <button type="submit" disabled={items.length === 0}>Create order</button>
        </form>

        {checkoutOrder ? (
          <div className="payment-box">
            <p>Order created: {checkoutOrder.orderNumber}</p>
            <p>Status: {checkoutOrder.status}</p>
            {checkoutOrder.priceBreakdown ? (
              <ul>
                <li>Subtotal: {checkoutOrder.priceBreakdown.subtotal}</li>
                <li>GST: {checkoutOrder.priceBreakdown.gst}</li>
                <li>Delivery: {checkoutOrder.priceBreakdown.delivery}</li>
                <li>Platform fee: {checkoutOrder.priceBreakdown.platformFee}</li>
                <li>Total: {checkoutOrder.priceBreakdown.total}</li>
              </ul>
            ) : null}
            <button onClick={payNow}>Pay now</button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
