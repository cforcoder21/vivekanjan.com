import { useState, useEffect } from 'react'
import type { BookData } from '../data/books-data'

type CheckoutModalProps = {
  book: BookData
  onClose: () => void
  user: { name: string; email: string } | null
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  prefill: {
    name: string
    email: string
    contact: string
  }
  handler: (response: Record<string, unknown>) => void
  theme: { color: string }
}

export function CheckoutModal({ book, onClose, user }: CheckoutModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const SHIPPING_COST = 50
  const TAX_RATE = 0.05

  const bookPrice = book.price
  const tax = Math.round(bookPrice * TAX_RATE)
  const total = bookPrice + tax + SHIPPING_COST

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handlePlaceOrder() {
    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      setError('Please fill all fields')
      return
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Please enter a valid 6-digit pincode')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)

        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Initialize Razorpay payment
      const options: RazorpayOptions = {
        key: 'rzp_test_1DP5MMOZF3MrJt', // Replace with your actual Razorpay key
        amount: total * 100, // Amount in paise
        currency: 'INR',
        name: 'Vivek Anjan',
        description: `Purchase: ${book.title}`,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        handler: function (response: Record<string, unknown>) {
          // Payment successful - create order object
          const newOrder = {
            bookTitle: book.title,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            amount: total,
            timestamp: new Date().toISOString(),
          }

          // Save to lastOrder for immediate reference
          localStorage.setItem('lastOrder', JSON.stringify(newOrder))

          // Add to user's order history
          const existingOrders = localStorage.getItem('userOrders')
          const orders = existingOrders ? JSON.parse(existingOrders) : []
          orders.push(newOrder)
          localStorage.setItem('userOrders', JSON.stringify(orders))

          // Close modal and show success
          onClose()
          alert(`Order placed successfully! Payment ID: ${response.razorpay_payment_id}`)
        },
        theme: {
          color: '#8a5a2b',
        },
      }

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initialization failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 className="checkout-title">Checkout</h2>

        <div className="checkout-container">
          {/* Left: Address Form */}
          <div className="checkout-form-section">
            <h3>Shipping Address</h3>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Street Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full address"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                maxLength={6}
              />
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary-section">
            <h3>Order Summary</h3>

            <div className="book-summary">
              <img src={book.coverImage} alt={book.title} className="summary-cover" />
              <div>
                <h4>{book.title}</h4>
                {book.subtitle && <p className="summary-subtitle">{book.subtitle}</p>}
              </div>
            </div>

            <div className="price-breakdown">
              <div className="breakdown-row">
                <span>Book Price</span>
                <span>₹{bookPrice}</span>
              </div>
              <div className="breakdown-row">
                <span>Tax (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div className="breakdown-row">
                <span>Shipping</span>
                <span>₹{SHIPPING_COST}</span>
              </div>
              <div className="breakdown-row total">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              className="btn-place-order"
              onClick={handlePlaceOrder}
              disabled={loading}
              style={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
