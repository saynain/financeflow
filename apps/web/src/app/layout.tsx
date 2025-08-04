import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { QueryProvider } from '@/components/providers/query-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinanceFlow - Budget & Expense Planner',
  description: 'A modern budget and expense planning web application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
