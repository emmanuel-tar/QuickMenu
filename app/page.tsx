import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold text-primary">QuickMenu</div>
          <div className="flex gap-4">
            {session?.user ? (
              <>
                <span className="flex items-center text-sm text-muted-foreground">
                  {session.user.email}
                </span>
                <Link
                  href="/admin"
                  className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                  Dashboard
                </Link>
                <form
                  action={async () => {
                    'use server'
                    await auth.api.signOut({ headers: await headers() })
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-4 py-2 text-foreground hover:bg-muted"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <Link
                    href="/admin-login"
                    className="rounded-lg border border-border px-4 py-2 text-foreground hover:bg-muted text-sm"
                  >
                    Admin Login
                  </Link>
                  <Link
                    href="/user-login"
                    className="rounded-lg border border-border px-4 py-2 text-foreground hover:bg-muted text-sm"
                  >
                    Staff Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 text-sm"
                  >
                    Create Restaurant
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold text-foreground md:text-6xl">
            Digital Menus Made Simple
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Create, manage, and share QR code menus for your restaurant. No printing, no outdated menus, always up-to-date.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            {session?.user ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-lg bg-primary px-8 py-3 text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-primary px-8 py-3 text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Create Restaurant Account
                </Link>
                <Link
                  href="/admin-login"
                  className="rounded-lg border-2 border-primary px-8 py-3 text-primary hover:bg-primary/10 font-semibold"
                >
                  Admin Login
                </Link>
                <Link
                  href="/user-login"
                  className="rounded-lg border-2 border-border px-8 py-3 text-foreground hover:bg-muted font-semibold"
                >
                  Staff Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Why Choose QuickMenu?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border p-6">
              <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">QR Code Menus</h3>
              <p className="text-muted-foreground">
                Generate unique QR codes for each restaurant. Customers scan and view your menu instantly.
              </p>
            </div>

            <div className="rounded-lg border border-border p-6">
              <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Real-Time Updates</h3>
              <p className="text-muted-foreground">
                Update your menu anytime. Changes appear instantly - no reprinting, no waste.
              </p>
            </div>

            <div className="rounded-lg border border-border p-6">
              <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Easy Management</h3>
              <p className="text-muted-foreground">
                Organize items into categories, set prices, mark items as unavailable, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          How It Works
        </h2>

        <div className="mx-auto max-w-2xl space-y-8">
          <div className="flex gap-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Create Your Restaurant</h3>
              <p className="mt-2 text-muted-foreground">
                Sign up and create a new restaurant account with basic information.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Build Your Menu</h3>
              <p className="mt-2 text-muted-foreground">
                Add menu categories (Appetizers, Main Courses, Desserts, etc.) and list your items with prices.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Get Your QR Code</h3>
              <p className="mt-2 text-muted-foreground">
                Get a unique QR code for your restaurant. Print it, display it, or share the link.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              4
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Customers Scan & Order</h3>
              <p className="mt-2 text-muted-foreground">
                Customers scan the QR code with their phones and view your beautiful digital menu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to go digital?</h2>
          <p className="mt-4 text-muted-foreground">
            Join restaurants worldwide using QuickMenu for contactless digital ordering.
          </p>
          {!session?.user && (
            <Link
              href="/sign-up"
              className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>QuickMenu &copy; 2024. Empowering restaurants with digital menus.</p>
        </div>
      </footer>
    </div>
  )
}
