import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

// Local Fonts Configuration
const helvetica = localFont({
  src: [
    {
      path: "../../public/fonts/Helvetica Now Display/WOFF2/HelveticaNowDisplay-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Helvetica Now Display/WOFF2/HelveticaNowDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Helvetica Now Display/WOFF2/HelveticaNowDisplay-RegIta.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Helvetica Now Display/WOFF2/HelveticaNowDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Helvetica Now Display/WOFF2/HelveticaNowDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica",
  display: "swap",
});

const distrample = localFont({
  src: "../../public/fonts/Distrampler.ttf",
  variable: "--font-distrample",
  display: "swap",
});

// SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://diamondpokerclub.com.br"), // Ajuste conforme domínio real se houver
  title: {
    default: "Diamond Poker Club & Sports Bar | A Experiência de Las Vegas no Nordeste",
    template: "%s | Diamond Poker Club",
  },
  description:
    "O novo conceito de entretenimento em João Pessoa. Poker Club, Sports Bar e Gastronomia de alto padrão. Venha viver essa experiência.",
  keywords: [
    "Poker Club",
    "Sports Bar",
    "João Pessoa",
    "Entretenimento",
    "Cassino",
    "Gastronomia",
    "Lazer",
    "Diamond",
    "Texas Hold'em",
    "Omaha",
  ],
  authors: [{ name: "Diamond Poker Club", url: "https://diamondpokerclub.com.br" }],
  creator: "Diamond Poker Club",
  publisher: "Diamond Poker Club",
  icons: {
    icon: "/símbolo.svg",
    shortcut: "/símbolo.svg",
    apple: "/símbolo.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://diamondpokerclub.com.br",
    siteName: "Diamond Poker Club & Sports Bar",
    title: "Diamond Poker Club | A Experiência de Las Vegas no Nordeste",
    description:
      "O novo conceito de entretenimento em João Pessoa. Poker Club, Sports Bar e Gastronomia de alto padrão.",
    images: [
      {
        url: "/bg-hero-desktop.png", // Usando PNG para garantir compatibilidade
        width: 1200,
        height: 630,
        alt: "Diamond Poker Club - Sports Bar & Entertainment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diamond Poker Club | A Experiência de Las Vegas no Nordeste",
    description:
      "O novo conceito de entretenimento em João Pessoa. Poker Club, Sports Bar e Gastronomia.",
    images: ["/bg-hero-desktop.png"],
    creator: "@diamondpokerclub",
  },
  alternates: {
    canonical: "https://diamondpokerclub.com.br",
  },
  category: "entertainment",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" }, // Ajustado para preto (tema principal)
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EntertainmentBusiness", // Mais específico que Organization
  name: "Diamond Poker Club & Sports Bar",
  description:
    "O novo conceito de entretenimento em João Pessoa. Poker Club, Sports Bar e Gastronomia de alto padrão.",
  url: "https://diamondpokerclub.com.br",
  logo: "https://diamondpokerclub.com.br/logo.svg",
  image: "https://diamondpokerclub.com.br/bg-hero-desktop.png",
  sameAs: [
    "https://www.instagram.com/diamondpokerclub", // Exemplo
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "BR",
    addressLocality: "João Pessoa",
    addressRegion: "PB",
    streetAddress: "Av. Cabo Branco, Manaíra", // Placeholder - Ajustar se tiver info real
  },
  priceRange: "$$$",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body
        className={`${helvetica.variable} ${distrample.variable} font-helvetica antialiased`}
        suppressHydrationWarning
      >
        <SmoothScroll />
        <Navbar />
        <main id="main-content" role="main">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
