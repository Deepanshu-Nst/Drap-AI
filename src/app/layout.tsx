import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DrapAI — AI-Powered Fashion Visualization',
  description: 'Transform flat saree fabrics into stunning 360° fashion model visuals instantly with DrapAI — the AI-powered visualization platform built for premium Indian fashion brands.',
  keywords: 'AI fashion, saree visualization, virtual try-on, fashion AI, Indian fashion tech',
  openGraph: {
    title: 'DrapAI — AI-Powered Fashion Visualization',
    description: 'From flat fabric to fashion model in seconds. 10 angles. Photorealistic. Scalable.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
