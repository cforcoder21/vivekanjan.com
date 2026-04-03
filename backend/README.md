# Backend

Node.js + Express backend with PostgreSQL.

## What it provides

- Public routes for books and anthologies.
- Auth routes for signup/signin with JWT.
- Customer routes for cart, checkout, and order history.
- Admin stock management route.
- Razorpay payment initiation and verification.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Environment

Create `backend/.env` from `backend/.env.example` and set:

- `DATABASE_URL`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (for payments)

## Local setup

From `backend/`:

```powershell
npm install
npm run db:init
npm run db:seed
npm run dev
```

Server starts on `http://127.0.0.1:8000` by default.

## Cloud Run deployment

Use the backend Dockerfile in `backend/Dockerfile`.

1. Authenticate and choose your project:

```powershell
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>
```

2. Deploy:

```powershell
gcloud run deploy vivekanjan-backend ^
	--source backend ^
	--region asia-south1 ^
	--platform managed ^
	--allow-unauthenticated ^
	--set-env-vars DATABASE_URL=<YOUR_DATABASE_URL>,JWT_SECRET=<YOUR_JWT_SECRET>,RAZORPAY_KEY_ID=<YOUR_KEY_ID>,RAZORPAY_KEY_SECRET=<YOUR_KEY_SECRET>
```

3. Set frontend env var:

- `VITE_API_BASE_URL=<CLOUD_RUN_SERVICE_URL>`

## Seeded credentials

- Admin: `admin@vivekanjan.com` / `Admin@12345`
- Customer: `customer@vivekanjan.com` / `Customer@12345`

## Endpoint summary

- `GET /health`
- `GET /public/books`
- `GET /public/anthologies`
- `POST /signup`
- `POST /signin`
- `GET /cart`
- `POST /cart/add`
- `POST /cart/checkout`
- `GET /customer/orders`
- `POST /admin/books/:id/stock`
- `POST /initiate-payment`
- `POST /verify-payment`

Authentication uses `Authorization: Bearer <token>` returned by signin or signup.
