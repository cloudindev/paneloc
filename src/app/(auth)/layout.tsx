export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      {children}
    </div>
  )
}
/**
 * OLA CLOUD - Auth Layout
 * Public layout containing the login wizard. Uses a soft #00ffc8 radial glow via gradient.
 */
