export type User = {
  id: number
  name: string
  email: string
  username: string
  role: 'customer' | 'admin'
}

export type Book = {
  id: number
  slug: string
  title: string
  subtitle?: string
  description?: string
  coverImage?: string
  price: number
  currency: string
  stockQuantity: number
  buyLinks: Array<{ label: string; url: string }>
}

export type CartItem = {
  itemId: number
  quantity: number
  lineTotal: number
  book: Book
}

export type Order = {
  id: number
  orderNumber: string
  status: string
  paymentStatus?: string
  source: string
  totalAmountInr?: number
  totalAmount?: number
  priceBreakdown?: {
    subtotal: string
    gst: string
    delivery: string
    platformFee: string
    total: string
  }
}

export type AuthResponse = {
  message: string
  token: string
  user: User
}
