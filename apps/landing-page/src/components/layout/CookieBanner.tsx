"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "diamond-cookie-consent";

type ConsentStatus = "pending" | "accepted" | "rejected";

/**
 * CookieBanner Component
 * LGPD compliant cookie consent banner
 * Blocks non-essential scripts until user accepts
 *
 * Client Component - required for interactivity and localStorage
 */
export function CookieBanner() {
  // Initialize states with lazy initializer to read from localStorage once
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored === "accepted" || stored === "rejected") {
        return stored;
      }
    }
    return "pending";
  });

  const [isVisible, setIsVisible] = useState(false);

  // Show banner after delay if consent is pending
  useEffect(() => {
    if (consentStatus === "pending") {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [consentStatus]);

  // Handle analytics scripts after consent
  useEffect(() => {
    if (consentStatus === "accepted") {
      // TODO: Initialize analytics and tracking scripts here
      // Example: Google Analytics, Meta Pixel, etc.
      console.log("✅ Cookie consent accepted - analytics can be loaded");
    }
  }, [consentStatus]);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsentStatus("accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setConsentStatus("rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur-sm md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Consentimento de cookies"
    >
      <div className="container-diamond">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Content */}
          <div className="flex flex-1 items-start gap-3">
            <Cookie
              className="mt-0.5 h-6 w-6 shrink-0 text-accent"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Utilizamos cookies para melhorar sua experiência
              </p>
              <p className="text-sm text-muted-foreground">
                Usamos cookies essenciais e de análise para personalizar conteúdo e
                entender como você utiliza nosso site. Ao continuar, você concorda com
                nossa{" "}
                <Link
                  href="/privacidade"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-accent"
                >
                  Política de Privacidade
                </Link>{" "}
                e{" "}
                <Link
                  href="/cookies"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-accent"
                >
                  Política de Cookies
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleReject}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label="Rejeitar cookies não essenciais"
            >
              Rejeitar
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label="Aceitar todos os cookies"
            >
              Aceitar
            </button>
          </div>

          {/* Close Button (mobile) */}
          <button
            type="button"
            onClick={handleReject}
            className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Fechar banner de cookies"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check cookie consent status
 * Use this in other components to conditionally load scripts
 */
export function useCookieConsent(): ConsentStatus {
  const [status] = useState<ConsentStatus>(() => {
    // Initialize from localStorage if available (SSR safe)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored === "accepted" || stored === "rejected") {
        return stored;
      }
    }
    return "pending";
  });

  return status;
}

