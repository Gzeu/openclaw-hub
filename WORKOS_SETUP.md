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
WORKOS_REDIRECT_URI="http://localhost:3000/auth/callback"
WORKOS_COOKIE_SECRET="your-workos-cookie-secret-here"
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
1. Double-check the URLs in WorkOS dashboard
2. Ensure no trailing slashes
3. Make sure both `http://localhost:3000` and `http://localhost:3000/auth/callback` are added
4. Wait 1-2 minutes for WorkOS to propagate changes
5. Restart your development server

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
