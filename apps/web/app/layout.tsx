import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const SITE_URL = "https://loomix.harshsingh.me";
const SITE_NAME = "Loomix";
const PRODUCT_NAME = "Loomix Player";
const PRODUCT_TAGLINE = "A customizable React video player UI";
const DESCRIPTION =
  "A drop-in replacement for the native HTML5 video element, with a beautifully customizable UI.";
const REPO_URL = "https://github.com/haaarshsingh/loomix";
const AUTHOR_NAME = "Harsh Singh";
const AUTHOR_URL = "https://harshsingh.me";
const TWITTER_HANDLE = "@haaarshsingh";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PRODUCT_NAME}:  ${PRODUCT_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "loomix",
    "loomix player",
    "react video player",
    "video player ui",
    "shadcn registry",
    "shadcn video player",
    "tailwind video player",
    "react component",
    "video controls",
    "picture in picture",
    "headless video player",
    "next.js video player",
    "typescript video player",
  ],
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: `${PRODUCT_NAME}:  ${PRODUCT_TAGLINE}`,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${PRODUCT_NAME}:  React video player UI`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `${PRODUCT_NAME}:  ${PRODUCT_TAGLINE}`,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#040615",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}#software`,
      name: PRODUCT_NAME,
      url: SITE_URL,
      image: `${SITE_URL}/og.png`,
      description: DESCRIPTION,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      programmingLanguage: "TypeScript",
      codeRepository: REPO_URL,
      license: "https://opensource.org/licenses/MIT",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Person",
        "@id": `${AUTHOR_URL}#person`,
        name: AUTHOR_NAME,
        url: AUTHOR_URL,
      },
      keywords: [
        "react video player",
        "shadcn registry",
        "tailwind",
        "video player ui",
        "picture in picture",
      ].join(", "),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "en",
      description: DESCRIPTION,
      publisher: {
        "@id": `${AUTHOR_URL}#person`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
