import './globals.css'

import type {Metadata, Viewport} from 'next'
import localFont from 'next/font/local'

// Clarity City by VMware, SIL Open Font License 1.1 (see ./fonts/OFL-LICENSE.md).
const clarity = localFont({
  src: [
    {path: './fonts/ClarityCity-Light.woff', weight: '300'},
    {path: './fonts/ClarityCity-Regular.woff', weight: '400'},
    {path: './fonts/ClarityCity-Medium.woff', weight: '500'},
    {path: './fonts/ClarityCity-SemiBold.woff', weight: '600'},
    {path: './fonts/ClarityCity-Bold.woff', weight: '700'},
  ],
  display: 'swap',
  variable: '--font-clarity',
})

export const metadata: Metadata = {
  title: 'Olive & Ember · Allergy concierge',
  description:
    'An allergy-safety agent for a restaurant menu, grounded in a structured Sanity content graph and a kitchen Knowledge Base.',
}

export const viewport: Viewport = {themeColor: '#141414'}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" className={clarity.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
