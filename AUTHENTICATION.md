# Authentication System Documentation

## Overview
The Ziddi Mumbaikar website now has a complete authentication system that tracks user login state globally, protects routes, and enables profile management.

## Features Implemented

### 1. **Global Authentication State (AuthContext)**
- **Location**: `src/contexts/AuthContext.tsx`
- **Features**:
  - Centralized authentication state management
  - Persistent login using localStorage
  - Login/Signup/Logout functionality
  - User profile updates
  - Mock authentication (ready for backend integration)

### 2. **Protected Routes**
- **Component**: `src/components/ProtectedRoute.tsx`
- **Usage**: Wrap any page that requires authentication
- **Behavior**:
  - Checks if user is logged in
  - Redirects to home with sign-in modal if not authenticated
  - Preserves intended destination URL
  - Shows loading state during authentication check

### 3. **Sign In Modal**
- **Location**: `src/components/SignInModal.tsx`
- **Features**:
  - Toggle between Sign In and Sign Up modes
  - Form validation
  - Error handling
  - Loading states
  - Social login UI (Google, Facebook)
  - Automatic redirect after login
  - Redirects to intended page or profile

### 4. **Profile Management**
- **Page**: `src/app/profile/page.tsx`
- **Features**:
  - View and edit user information
  - Navigation sidebar with quick links
  - Quick actions section
  - Protected route (requires login)
  - Real-time profile updates

### 5. **Dashboard**
- **Page**: `src/app/dashboard/page.tsx`
- **Features**:
  - Overview of user's fundraisers
  - Donation history
  - Statistics (active fundraisers, total raised, donations)
  - Quick action buttons
  - Protected route

### 6. **Updated Header**
- **Location**: `src/components/Header.tsx`
- **Features**:
  - User avatar and dropdown menu when logged in
  - Sign In button when logged out
  - Mobile menu with user info
  - Navigation to Dashboard, Profile, My Fundraisers, My Donations
  - Sign Out functionality

## User Flow

### 1. **Unauthenticated User Tries to Start Fundraiser**
```
1. User clicks "Start a Fundraiser"
2. ProtectedRoute detects user is not logged in
3. User is redirected to home with ?signin=true&redirect=/fundraiser/start
4. Sign In modal opens automatically
5. User signs in or signs up
6. Upon successful authentication, user is redirected to /fundraiser/start
```

### 2. **Sign Up Flow**
```
1. User clicks "Sign In" in header
2. Modal opens
3. User toggles to "Sign Up"
4. User fills: Name, Email, Phone, Password, Confirm Password
5. Form validates password match
6. On submit, account is created and user is logged in
7. User is redirected to profile or intended page
```

### 3. **Sign In Flow**
```
1. User clicks "Sign In"
2. Modal opens
3. User enters: Email, Password
4. On submit, authentication is checked
5. User is logged in
6. User is redirected to profile or intended page
```

### 4. **Profile Management**
```
1. Logged-in user navigates to Profile
2. User views their information
3. User clicks "Edit Profile"
4. User updates Name, Email, Phone
5. Changes are saved to AuthContext and localStorage
6. Success message is shown
```

## Integration with Backend (Future)

### Authentication API Endpoints Needed:

#### 1. **POST /api/auth/signup**
```typescript
Request:
{
  name: string
  email: string
  phone: string
  password: string
}

Response:
{
  user: {
    id: string
    name: string
    email: string
    phone: string
    joinedDate: string
  }
  token: string // JWT or session token
}
```

#### 2. **POST /api/auth/login**
```typescript
Request:
{
  email: string
  password: string
}

Response:
{
  user: {
    id: string
    name: string
    email: string
    phone: string
    joinedDate: string
  }
  token: string
}
```

#### 3. **POST /api/auth/logout**
```typescript
Request:
{
  token: string
}

Response:
{
  success: boolean
}
```

#### 4. **GET /api/auth/me**
```typescript
Headers:
{
  Authorization: Bearer <token>
}

Response:
{
  user: {
    id: string
    name: string
    email: string
    phone: string
    joinedDate: string
  }
}
```

#### 5. **PATCH /api/auth/profile**
```typescript
Request:
{
  name?: string
  email?: string
  phone?: string
}

Response:
{
  user: {
    id: string
    name: string
    email: string
    phone: string
    joinedDate: string
  }
}
```

### Steps to Integrate Backend:

1. **Update AuthContext.tsx**:
   - Replace mock functions with actual API calls
   - Store JWT token in localStorage
   - Add token to API request headers
   - Implement token refresh logic

2. **Add API Client**:
   - Create `src/lib/api.ts` for API calls
   - Configure base URL and headers
   - Add error handling

3. **Secure Routes**:
   - Verify token on server-side for protected routes
   - Implement Next.js middleware for route protection

4. **Social Login**:
   - Integrate OAuth providers (Google, Facebook)
   - Implement callback handlers
   - Link social accounts to user profiles

## Testing the System

### Test Scenarios:

1. **Sign Up New User**:
   - Open browser
   - Click "Sign In" in header
   - Toggle to "Sign Up"
   - Fill in form and submit
   - Verify redirect to profile
   - Check user avatar appears in header

2. **Sign Out and Sign In**:
   - Click user avatar dropdown
   - Click "Sign Out"
   - Verify redirect to home
   - Click "Sign In"
   - Enter credentials
   - Verify successful login

3. **Protected Route Access**:
   - Sign out
   - Click "Start a Fundraiser"
   - Verify sign in modal opens
   - Sign in
   - Verify redirect to fundraiser start page

4. **Profile Management**:
   - Navigate to Profile
   - Click "Edit Profile"
   - Update information
   - Save changes
   - Verify success message
   - Refresh page
   - Verify changes persist

5. **Mobile Menu**:
   - Resize browser to mobile
   - Open mobile menu
   - Verify user info shown when logged in
   - Verify all links work
   - Test sign out

## Security Considerations

### Current Implementation (Development):
- User data stored in localStorage (not secure for production)
- No password encryption
- No token expiration
- No CSRF protection

### For Production:
1. **Use HTTP-only Cookies** for token storage
2. **Implement JWT** with expiration and refresh tokens
3. **Hash Passwords** using bcrypt or argon2
4. **Add CSRF Protection** for form submissions
5. **Implement Rate Limiting** on login attempts
6. **Add Email Verification** for new accounts
7. **Use HTTPS** for all communications
8. **Add 2FA Support** for enhanced security

## Files Modified/Created

### New Files:
1. `src/contexts/AuthContext.tsx` - Authentication context provider
2. `src/components/ProtectedRoute.tsx` - Route protection wrapper
3. `src/app/profile/page.tsx` - User profile management page
4. `src/app/dashboard/page.tsx` - User dashboard page

### Modified Files:
1. `src/app/layout.tsx` - Added AuthProvider wrapper
2. `src/components/Header.tsx` - Integrated with AuthContext
3. `src/components/SignInModal.tsx` - Connected to AuthContext
4. `src/app/fundraiser/start/page.tsx` - Wrapped with ProtectedRoute

## Next Steps

1. **Backend Integration**:
   - Set up authentication API
   - Implement JWT token management
   - Add password reset functionality

2. **Enhanced Features**:
   - Email verification
   - Password strength indicator
   - Remember me functionality
   - Social login integration

3. **Additional Pages**:
   - My Fundraisers page with management
   - My Donations page with history
   - Settings page
   - Notification preferences

4. **Testing**:
   - Unit tests for AuthContext
   - Integration tests for authentication flow
   - E2E tests for user journeys
