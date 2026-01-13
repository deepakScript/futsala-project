import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication | Futsala Admin',
  description: 'Login to manage your futsala platform.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      {children}
    </div>
  )
}
