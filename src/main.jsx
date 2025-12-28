import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "./components/ui/sonner";
import { queryClient } from "./lib/queryClient";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import * as Sentry from "@sentry/react";
import './i18n/config'; // Initialize i18n

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Initialize Sentry for frontend error tracking (production only)
if (import.meta.env.VITE_SENTRY_DSN && import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: "production",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block all media for privacy
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  });

  console.log("✅ Sentry initialized for frontend (production mode)");
} else {
  if (import.meta.env.PROD) {
    console.log("⚠️  Sentry DSN not configured - error tracking disabled in production");
  } else {
    console.log("ℹ️  Sentry disabled in development mode");
  }
}

const clerkAppearance = {
  layout: {
    logoImageUrl: "/logo.png",
    logoPlacement: "inside",
  },
  variables: {
    colorPrimary: "#2563eb", // blue-600
    colorBackground: "#ffffff",
    colorText: "#0f172a", // slate-900
    colorTextSecondary: "#475569", // slate-600
    colorDanger: "#dc2626",
    colorSuccess: "#16a34a",
    colorWarning: "#ea580c",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    borderRadius: "0.5rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  elements: {
    formButtonPrimary: {
      background: "linear-gradient(to right, #2563eb, #1d4ed8, #0891b2)", // blue-600 -> blue-700 -> cyan-600
      color: "#ffffff",
      "&:hover": {
        background: "linear-gradient(to right, #1d4ed8, #1e40af, #0e7490)",
      },
    },
    card: {
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    headerTitle: {
      color: "#0f172a",
    },
    headerSubtitle: {
      color: "#475569",
    },
    socialButtonsBlockButton: {
      border: "1px solid #e2e8f0",
      "&:hover": {
        background: "#f8fafc",
      },
    },
    formFieldInput: {
      border: "1px solid #e2e8f0",
      "&:focus": {
        borderColor: "#2563eb",
        boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
      },
    },
    footerActionLink: {
      color: "#2563eb",
      "&:hover": {
        color: "#1d4ed8",
      },
    },
    logoImage: {
      width: "3.5rem",
      height: "3.5rem",
    },
  },
};

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
        {/* DevTools for debugging - only shows in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ClerkProvider>
  </ErrorBoundary>
);
