# Vivek Anjan Bookstore - Razorpay Setup

## Pricing rules

- GST: 18% on subtotal
- Delivery charge: Rs 60
- Platform fee: Rs 8
- Total in paise is used for payment processing

## Required environment variables

Set these in `backend/.env` (or cloud runtime env vars):

- `DATABASE_URL`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Backend startup

From `backend/`:

```powershell
npm install
npm run db:init
npm run db:seed
npm run dev
```

## Payment API flow

1. Customer creates an order from cart:

```http
POST /cart/checkout
Authorization: Bearer <token>
Content-Type: application/json
```

2. Frontend initializes Razorpay order:

```http
POST /initiate-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "ORD-..."
}
```

3. Frontend opens Razorpay checkout modal with returned `razorpay_order_id`.

4. Frontend verifies payment after success callback:

```http
POST /verify-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "ORD-...",
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "..."
}
```

5. Backend marks order paid and deducts stock.

## Notes

- `amount` sent to Razorpay is in paise.
- Stock is deducted only after successful signature verification.
- Use Razorpay test keys and test mode before switching to live keys.
