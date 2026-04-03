# Deployment Checklist for Username Authentication

## Database Migration Required

Before deploying, you must add the `username` column to the existing `users` table.

### For PostgreSQL (Production):
```sql
-- Add username column with UNIQUE constraint
ALTER TABLE users ADD COLUMN username TEXT NOT NULL UNIQUE DEFAULT '';

-- If you want to populate existing users with a default username pattern:
-- UPDATE users SET username = 'user_' || id WHERE username = '';

-- Then remove the NOT NULL constraint and re-add it:
-- ALTER TABLE users ADD CONSTRAINT users_username_not_null CHECK (username IS NOT NULL);
```

### For SQLite (Development):
```sql
-- SQLite doesn't support adding NOT NULL columns with no default
-- The initDb-sqlite.js has been updated with the new schema
-- For existing SQLite databases:
ALTER TABLE users ADD COLUMN username TEXT UNIQUE;

-- Populate with default values for existing users:
UPDATE users SET username = 'user_' || id;

-- Update the schema to enforce NOT NULL
-- (May require table recreation depending on SQLite version)
```

## Code Changes Made

### Backend (Node.js/Express)

#### 1. **Schema Updates** (`src/schema.sql` and `src/initDb-sqlite.js`)
   - Added `username TEXT NOT NULL UNIQUE` column to users table

#### 2. **Signup Endpoint** (`POST /signup`)
   - **New Request Body:**
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "username": "john_doe",
       "password": "securepassword123"
     }
     ```
   - **Validation:**
     - Username must be at least 3 characters
     - Username can only contain: a-z, 0-9, underscore (_), hyphen (-)
     - Username must be unique (checked before creation)
     - Email must be unique (checked before creation)
   - **Response includes username in user object**

#### 3. **Signin Endpoint** (`POST /signin`)
   - **New Request Body:** (Changed from email to emailOrUsername)
     ```json
     {
       "emailOrUsername": "john_doe",
       "password": "securepassword123"
     }
     ```
     OR
     ```json
     {
       "emailOrUsername": "john@example.com",
       "password": "securepassword123"
     }
     ```
   - **Query:** Searches for user by email OR username
   - **Response includes username in user object**

### Frontend (React/TypeScript)

#### 1. **User Type** (`src/types.ts`)
   - Added `username: string` field to User interface

#### 2. **LoginPage Component** (`src/pages/LoginPage.tsx`)
   - Signup mode: Shows fields for Name, Username, Email, Password
   - Signin mode: Shows field for Username or Email, Password
   - Username validation: minimum 3 characters
   - Password validation: minimum 8 characters
   - Updated helper text for both modes

#### 3. **AuthContext** (`src/context/AuthContext.tsx`)
   - SignUp signature: `signUp(name, email, password, username)`
   - SignIn signature: `signIn(emailOrUsername, password)`

#### 4. **API Calls** (`src/lib/api.ts`)
   - Updated `/signin` to send `{ emailOrUsername, password }`
   - Updated `/signup` to send `{ name, email, password, username }`

## Deployment Steps (GitHub + Vercel)

### 1. Create Feature Branch
```bash
git checkout -b titanwork_prod
```

### 2. Stage All Changes
```bash
git add .
```

### 3. Commit Changes
```bash
git commit -m "feat: add username authentication support

- Add username field to users table with UNIQUE constraint
- Update signup endpoint to validate and store username
- Update signin endpoint to accept email OR username
- Add username to JWT payload and response
- Frontend: Add username input in signup form
- Frontend: Add username/email toggle in signin form
- Frontend: Add username validation (min 3 chars, alphanumeric + dash/underscore)
- Frontend: Update User type with username field
- Frontend: Update AuthContext with new signatures
- Frontend: Update API calls with new payload structure"
```

### 4. Push to GitHub
```bash
git push origin titanwork_prod
```

### 5. Deploy to Vercel
- Frontend: Will auto-deploy from the new branch
- Backend: Deploy separately or via your CI/CD pipeline

## Post-Deployment Verification

1. **Test Signup with Username:**
   - Create account with username: test_user_123
   - Verify username validation (min 3 chars, valid characters)
   - Verify unique username constraint

2. **Test Signin with Username:**
   - Sign in with username only
   - Sign in with email (should also work)

3. **Test Signin with Email:**
   - Sign in with email address
   - Verify error message if incorrect

4. **Check Database:**
   - Verify username column exists
   - Verify UNIQUE constraint works
   - Check JWT token includes username

## Rollback Plan (if needed)

If issues occur:
1. Revert database migration (remove username column)
2. Revert code to previous commit
3. Note: Existing data with usernames will be lost in rollback

## Notes

- Usernames are case-insensitive (stored in lowercase)
- Usernames are permanent (no change feature built yet)
- JWT tokens now include username claim
- Google OAuth integration also available on login page
- All passwords remain hashed with bcryptjs
