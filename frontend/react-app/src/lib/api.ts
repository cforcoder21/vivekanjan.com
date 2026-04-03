import type { AuthResponse, Book, Order } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3212'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || data.details || 'Request failed')
  }

  return data as T
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export const api = {
  signIn(emailOrUsername: string, password: string) {
    return apiFetch<AuthResponse>('/signin', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    })
  },

  signUp(name: string, email: string, password: string, username: string) {
    return apiFetch<AuthResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, username }),
    })
  },

  getBooks() {
    return apiFetch<{ books: Book[] }>('/public/books')
  },

  getAnthologies() {
    return apiFetch<{ anthologies: Array<Record<string, unknown>> }>('/public/anthologies')
  },

  getCart(token: string) {
    return apiFetch<{ items: Array<Record<string, unknown>>; total: number; currency: string }>('/cart', {
      headers: authHeaders(token),
    })
  },

  addToCart(token: string, bookId: number, quantity = 1) {
    return apiFetch('/cart/add', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ bookId, quantity }),
    })
  },

  checkout(token: string, shipping: Record<string, string>) {
    return apiFetch<{ message: string; order: Order; priceBreakdown?: Record<string, string> }>('/cart/checkout', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(shipping),
    })
  },

  orders(token: string) {
    return apiFetch<{ orders: Order[] }>('/customer/orders', {
      headers: authHeaders(token),
    })
  },

  initiatePayment(token: string, orderId: string | number) {
    return apiFetch<{
      razorpay_order_id: string
      amount: number
      order_number: string
      customer_email: string
      customer_name: string
      currency: 'INR'
    }>('/initiate-payment', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ orderId }),
    })
  },

  verifyPayment(
    token: string,
    payload: {
      orderId: string | number
      razorpayOrderId: string
      razorpayPaymentId: string
      razorpaySignature: string
    },
  ) {
    return apiFetch<{ message: string; status: string; order: Order }>('/verify-payment', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    })
  },

  updateBookStock(token: string, bookId: number, operation: 'add' | 'subtract' | 'set', quantity: number) {
    return apiFetch('/admin/books/' + bookId + '/stock', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ operation, quantity }),
    })
  },
}

export { API_BASE_URL }
