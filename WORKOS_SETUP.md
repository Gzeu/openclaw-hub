# WorkOS AuthKit Setup Instructions

## 🚨 **IMPORTANT: Redirect URI Configuration**

The error "Acesta nu este un URI de redirecționare valid" means you need to configure the redirect URIs in your WorkOS dashboard.

## 🔧 **Required Redirect URIs**

Add these URLs to your WorkOS dashboard under **Redirect URIs**:

1. **Primary Callback:**
   ```
   http://localhost:3000/auth/callback
   ```

2. **Base URL:**
   ```
   http://localhost:3000
   ```

## 📋 **Setup Steps**

### 1. WorkOS Dashboard Configuration
1. Go to [WorkOS Dashboard](https://dashboard.workos.com)
2. Select your application: `openclaw-hub chatty-eagle-75 (dev)`
3. Navigate to **Redirect URIs** section
4. Add the two URLs above
5. Save configuration

### 2. Environment Variables (Already Set)
```env
NEXT_PUBLIC_WORKOS_CLIENT_ID="client_01KJP26KEG1ZEG6QJNFD7C2JES"
WORKOS_CLIENT_ID="client_01KJP26KEG1ZEG6QJNFD7C2JES"
WORKOS_API_KEY="[YOUR_WORKOS_API_KEY]"
WORKOS_SECRET_KEY="[YOUR_WORKOS_SECRET_KEY]"
NEXT_PUBLIC_WORKOS_REDIRECT_URI="http://localhost:3000/auth/callback"
WORKOS_COOKIE_SECRET="your-workos-cookie-secret-here"
```

### 3. Fix the Callback Route
Make sure your `/app/auth/callback/route.ts` uses the correct redirect URI:

```typescript
export const GET = handleAuth({
  returnPathname: '/agents',
  onSuccess: async ({ user }) => {
    console.log('User successfully authenticated:', user.email)
    return NextResponse.redirect(new URL('/agents', 'http://localhost:3000'))
  },
  onError: async (error) => {
    console.error('Authentication error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    // Check if it's a redirect URI error
    if (error.message && error.message.includes('redirect URI')) {
      return NextResponse.json({
        error: 'Redirect URI configuration error',
        message: 'Please add http://localhost:3000/auth/callback to WorkOS dashboard Redirect URIs',
        details: 'Check WorkOS dashboard → Configuration → Redirect URIs',
        fix: 'Add both http://localhost:3000 and http://localhost:3000/auth/callback to your WorkOS Redirect URIs'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : 'No error details available'
    }, { status: 500 })
  }
})
```

## 🎯 **Test After Configuration**

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/agents`

3. Click "Sign In with Google"

4. The OAuth flow should work without redirect URI errors

## 🔍 **Troubleshooting**

If you still see the redirect URI error:
1. Double-check the URLs in WorkOS dashboard - they must match EXACTLY
2. Ensure no trailing slashes unless specified
3. Make sure both `http://localhost:3000` and `http://localhost:3000/auth/callback` are added
4. Wait 1-2 minutes for WorkOS to propagate changes
5. Restart your development server
6. Clear browser cookies and cache

## 📱 **Production URLs**

For production deployment, you'll need to add:
- `https://your-domain.com/auth/callback`
- `https://your-domain.com`

## ✅ **Verification**

After setup, you should see:
- Welcome message: "Welcome to OpenClaw Hub"
- Sign In button: "Sign In with Google"
- Successful Google OAuth flow
- User profile display after login

## 🔗 **Quick Fix Steps**

1. Go to WorkOS Dashboard → Your App → Redirect URIs
2. Add: `http://localhost:3000`
3. Add: `http://localhost:3000/auth/callback`
4. Save
5. Restart dev server
6. Try login again
