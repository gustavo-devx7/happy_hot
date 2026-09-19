import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'

import './globals.css'
import './pages/pages.css'

import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Happy Hot',
  description: 'Clique e venha ver a surpresa que preparei para você!',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
        >
          {children}
          <Analytics />
        </ThemeProvider>

        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Pixel UTMify */}
            <Script
              src="https://cdn.utmify.com.br/scripts/utms/latest.js"
              data-utmify-prevent-xcod-sck
              data-utmify-prevent-subids
              strategy="afterInteractive"
            />

            {/* Pixel Facebook UTMify */}
            <Script
              id="utmify-pixel"
              strategy="afterInteractive"
            >
              {`
                window.pixelId = "6a188c0cb627b7f5c25cfc59";

                var a = document.createElement("script");
                a.setAttribute("async", "");
                a.setAttribute("defer", "");
                a.setAttribute(
                  "src",
                  "https://cdn.utmify.com.br/scripts/pixel/pixel.js"
                );

                document.head.appendChild(a);
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
