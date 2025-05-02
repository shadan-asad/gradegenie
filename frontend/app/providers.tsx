"use client"

import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { GoogleOAuthProvider } from '@react-oauth/google'
import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import { authConfig } from '@/config/auth'

// Initialize MSAL
const msalInstance = new PublicClientApplication({
  auth: {
    clientId: authConfig.microsoft.clientId,
    authority: authConfig.microsoft.authority,
    redirectUri: authConfig.microsoft.redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={authConfig.google.clientId}>
      <MsalProvider instance={msalInstance}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </MsalProvider>
    </GoogleOAuthProvider>
  )
} 